"""
TBS II - Room Booking Management Router
Quản lý đặt phòng họp - Booking creation, approval, status tracking
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_

from database import get_db
from models import RoomBooking
from auth import get_current_user_optional, log_audit_event
from validators import sanitize_plain_text

router = APIRouter(prefix="/api/rooms", tags=["Room Bookings"])


class BookingStatusEnum:
    PENDING = "PENDING"  # Chờ Lễ Tân duyệt
    APPROVING = "APPROVING"  # Đang phê duyệt
    RECEPTIONIST_PROPOSED = "RECEPTIONIST_PROPOSED"  # Lễ Tân đề xuất thay đổi
    CONFIRMED = "CONFIRMED"  # Đã duyệt & xếp lịch
    CANCELLED = "CANCELLED"  # Đã hủy
    COMPLETED = "COMPLETED"  # Cuộc họp hoàn tất


# ============================================================
# ROOM BOOKING SYSTEM
# ⚠️ DEPRECATED: Use Cloudflare Workers D1 instead
# See: web/public/_worker.js - POST /api/rooms/booking
# ============================================================
    booking_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Create new room booking
    
    Required fields:
    - roomId: str
    - roomName: str
    - title: str (meeting title)
    - bookerName: str
    - department: str
    - bookingDate: str (DD/MM/YYYY)
    - timeSlot: str (HH:MM - HH:MM)
    - attendeesCount: int
    - notes: str (optional)
    """
    
    # Validate required fields
    required_fields = ["roomId", "roomName", "title", "bookingDate", "timeSlot"]
    for field in required_fields:
        if field not in booking_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Sanitize input
    title = sanitize_plain_text(booking_data.get("title", ""))
    notes = sanitize_plain_text(booking_data.get("notes", ""))
    
    # Validate attendees count
    attendees = booking_data.get("attendeesCount", 1)
    if attendees < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số người tham dự phải >= 1"
        )
    
    # Check for conflicts with existing bookings
    conflicting_booking = db.query(RoomBooking).filter(
        and_(
            RoomBooking.room_id == booking_data["roomId"],
            RoomBooking.booking_date == booking_data["bookingDate"],
            RoomBooking.time_slot == booking_data["timeSlot"],
            RoomBooking.status != BookingStatusEnum.CANCELLED
        )
    ).first()
    
    if conflicting_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Phòng {booking_data['roomName']} đã được đặt trong khung giờ này"
        )
    
    # Create booking object
    new_booking = RoomBooking(
        room_id=booking_data["roomId"],
        room_name=booking_data["roomName"],
        title=title,
        booker_name=booking_data.get("bookerName", current_user.name if current_user else "Unknown"),
        department=booking_data.get("department", ""),
        booking_date=booking_data["bookingDate"],
        time_slot=booking_data["timeSlot"],
        attendees_count=attendees,
        notes=notes,
        status=BookingStatusEnum.PENDING,
        created_at=datetime.utcnow()
    )
    
    # Save to database
    try:
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
    except Exception as db_err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(db_err)}"
        )
    
    # Log audit
    try:
        log_audit_event(
            db,
            current_user.id if current_user else None,
            "BOOKING_CREATED",
            "RoomBooking",
            f"Booking created for {new_booking.title} in {new_booking.room_name} at {new_booking.time_slot}"
        )
    except:
        pass  # Audit logging failure shouldn't block the booking
    
    return {
        "success": True,
        "data": {
            "id": new_booking.id,
            "roomId": new_booking.room_id,
            "roomName": new_booking.room_name,
            "title": new_booking.title,
            "bookerName": new_booking.booker_name,
            "department": new_booking.department,
            "bookingDate": new_booking.booking_date,
            "timeSlot": new_booking.time_slot,
            "attendeesCount": new_booking.attendees_count,
            "notes": new_booking.notes,
            "status": new_booking.status,
            "createdAt": new_booking.created_at.isoformat(),
        },
        "message": "Booking created successfully. Waiting for receptionist approval."
    }


@router.put("/booking")
async def update_booking(
    booking_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Update booking status
    
    Required fields:
    - id: str (booking ID)
    - status: str (PENDING, APPROVING, CONFIRMED, CANCELLED, COMPLETED)
    """
    
    booking_id = booking_data.get("id")
    if not booking_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing booking ID"
        )
    
    # Get existing booking from database
    booking = db.query(RoomBooking).filter(RoomBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    new_status = booking_data.get("status")
    if new_status not in [
        BookingStatusEnum.PENDING,
        BookingStatusEnum.APPROVING,
        BookingStatusEnum.RECEPTIONIST_PROPOSED,
        BookingStatusEnum.CONFIRMED,
        BookingStatusEnum.CANCELLED,
        BookingStatusEnum.COMPLETED
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {new_status}"
        )
    
    # Validate state transition
    current_status = booking.status
    
    # Valid transitions
    valid_transitions = {
        BookingStatusEnum.PENDING: [
            BookingStatusEnum.APPROVING,
            BookingStatusEnum.RECEPTIONIST_PROPOSED,
            BookingStatusEnum.CANCELLED
        ],
        BookingStatusEnum.APPROVING: [
            BookingStatusEnum.CONFIRMED,
            BookingStatusEnum.PENDING,  # Revert on error
            BookingStatusEnum.CANCELLED
        ],
        BookingStatusEnum.RECEPTIONIST_PROPOSED: [
            BookingStatusEnum.CONFIRMED,
            BookingStatusEnum.PENDING,
            BookingStatusEnum.CANCELLED
        ],
        BookingStatusEnum.CONFIRMED: [
            BookingStatusEnum.COMPLETED,
            BookingStatusEnum.CANCELLED
        ],
        BookingStatusEnum.CANCELLED: [],  # Terminal state
        BookingStatusEnum.COMPLETED: []  # Terminal state
    }
    
    if new_status not in valid_transitions.get(current_status, []):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot transition from {current_status} to {new_status}"
        )
    
    # Update booking
    booking.status = new_status
    booking.updated_at = datetime.utcnow()
    
    if new_status == BookingStatusEnum.CONFIRMED:
        booking.approved_at = datetime.utcnow()
        booking.approved_by = current_user.name if current_user else "system"
    
    if "notes" in booking_data:
        booking.notes = sanitize_plain_text(booking_data.get("notes", ""))
    
    # Commit to database
    db.commit()
    db.refresh(booking)
    
    # Log audit
    try:
        log_audit_event(
            db,
            current_user.id if current_user else None,
            "BOOKING_STATUS_CHANGED",
            "RoomBooking",
            f"Booking {booking_id} status changed from {current_status} to {new_status}"
        )
    except:
        pass
    
    return {
        "success": True,
        "data": {
            "id": booking.id,
            "roomId": booking.room_id,
            "roomName": booking.room_name,
            "title": booking.title,
            "bookerName": booking.booker_name,
            "department": booking.department,
            "bookingDate": booking.booking_date,
            "timeSlot": booking.time_slot,
            "attendeesCount": booking.attendees_count,
            "notes": booking.notes,
            "status": booking.status,
            "approvedAt": booking.approved_at.isoformat() if booking.approved_at else None,
            "approvedBy": booking.approved_by,
            "createdAt": booking.created_at.isoformat(),
            "updatedAt": booking.updated_at.isoformat(),
        },
        "message": f"Booking status updated to {new_status}"
    }


@router.get("/booking/{booking_id}")
async def get_booking(booking_id: str, db: Session = Depends(get_db)):
    """Get single booking by ID"""
    booking = db.query(RoomBooking).filter(RoomBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return {
        "success": True,
        "data": {
            "id": booking.id,
            "roomId": booking.room_id,
            "roomName": booking.room_name,
            "title": booking.title,
            "bookerName": booking.booker_name,
            "department": booking.department,
            "bookingDate": booking.booking_date,
            "timeSlot": booking.time_slot,
            "attendeesCount": booking.attendees_count,
            "notes": booking.notes,
            "status": booking.status,
            "approvedAt": booking.approved_at.isoformat() if booking.approved_at else None,
            "approvedBy": booking.approved_by,
            "createdAt": booking.created_at.isoformat(),
            "updatedAt": booking.updated_at.isoformat(),
        }
    }


@router.get("/bookings")
async def list_bookings(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None,
    room_id: Optional[str] = None,
    booking_date: Optional[str] = None
):
    """List all bookings with optional filters"""
    
    query = db.query(RoomBooking)
    
    # Apply filters
    if status_filter:
        query = query.filter(RoomBooking.status == status_filter)
    
    if room_id:
        query = query.filter(RoomBooking.room_id == room_id)
    
    if booking_date:
        query = query.filter(RoomBooking.booking_date == booking_date)
    
    # Sort by date and time
    bookings = query.order_by(RoomBooking.booking_date, RoomBooking.time_slot).all()
    
    bookings_list = []
    for b in bookings:
        bookings_list.append({
            "id": b.id,
            "roomId": b.room_id,
            "roomName": b.room_name,
            "title": b.title,
            "bookerName": b.booker_name,
            "department": b.department,
            "bookingDate": b.booking_date,
            "timeSlot": b.time_slot,
            "attendeesCount": b.attendees_count,
            "notes": b.notes,
            "status": b.status,
            "approvedAt": b.approved_at.isoformat() if b.approved_at else None,
            "approvedBy": b.approved_by,
            "createdAt": b.created_at.isoformat(),
            "updatedAt": b.updated_at.isoformat(),
        })
    
    return {
        "success": True,
        "data": {
            "bookings": bookings_list,
            "total": len(bookings_list),
            "filtered": bool(status_filter or room_id or booking_date)
        }
    }


@router.delete("/booking/{booking_id}")
async def delete_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Delete/cancel a booking
    Actually sets status to CANCELLED instead of hard delete
    """
    
    booking = db.query(RoomBooking).filter(RoomBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking.status = BookingStatusEnum.CANCELLED
    booking.cancelled_at = datetime.utcnow()
    booking.cancelled_by = current_user.name if current_user else "system"
    
    db.commit()
    db.refresh(booking)
    
    # Log audit
    try:
        log_audit_event(
            db,
            current_user.id if current_user else None,
            "BOOKING_CANCELLED",
            "RoomBooking",
            f"Booking {booking_id} cancelled"
        )
    except:
        pass
    
    return {
        "success": True,
        "message": "Booking cancelled successfully"
    }
