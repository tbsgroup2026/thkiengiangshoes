"""
TBS II - Supply Orders Router
Quản lý đơn đặt hàng vật tư, phụ tùng.
"""
import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import SupplyOrder, SupplyOrderItem, SparePart, User, RoleEnum
from schemas import SupplyOrderCreate, SupplyOrderOut, SupplyOrderItemOut
from auth import get_current_user, require_role, log_audit_event

router = APIRouter(prefix="/api/v1/orders", tags=["Supply Orders"])


@router.get("", response_model=list[SupplyOrderOut])
def get_orders(
    branch_id: Optional[int] = None,
    sector_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Danh sách đơn hàng. User thường chỉ thấy đơn của mình."""
    query = db.query(SupplyOrder)
    if current_user.role not in [RoleEnum.MANAGER.value, RoleEnum.ADMIN.value]:
        query = query.filter(SupplyOrder.creator_id == current_user.id)

    if branch_id:
        query = query.filter(SupplyOrder.branch_id == branch_id)
    if sector_id:
        query = query.filter(SupplyOrder.sector_id == sector_id)

    orders = query.all()

    out = []
    for o in orders:
        creator_name = o.creator.name if o.creator else "Unknown"
        items_out = []
        for item in o.items:
            items_out.append(SupplyOrderItemOut(
                id=item.id, part_id=item.part_id,
                part_code=item.part.part_code if item.part else "Unknown",
                part_name=item.part.name if item.part else "Unknown",
                quantity=item.quantity, unit_cost=item.unit_cost
            ))
        out.append(SupplyOrderOut(
            id=o.id, order_code=o.order_code, creator_id=o.creator_id,
            creator_name=creator_name, branch_id=o.branch_id,
            sector_id=o.sector_id, branch=o.branch, sector=o.sector,
            status=o.status, total_cost=o.total_cost,
            created_at=o.created_at, items=items_out
        ))
    return out


@router.post("", response_model=SupplyOrderOut)
def create_order(
    req: SupplyOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo đơn đặt hàng mới."""
    if not req.items:
        raise HTTPException(status_code=400, detail="Danh sách vật tư không được để trống")

    # Validate số lượng
    for item in req.items:
        if item.quantity <= 0 or item.quantity > 10000:
            raise HTTPException(
                status_code=400,
                detail=f"Số lượng không hợp lệ cho part_id={item.part_id} (1-10000)"
            )

    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    order_code = f"ORD-{timestamp}"

    order = SupplyOrder(
        order_code=order_code,
        creator_id=current_user.id,
        branch_id=current_user.branch_id,
        sector_id=current_user.sector_id,
        status="PENDING",
        total_cost=0.0
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    total = 0.0
    items_out = []

    for req_item in req.items:
        part = db.query(SparePart).filter(SparePart.id == req_item.part_id).first()
        if not part:
            # Rollback: xóa order vừa tạo
            db.delete(order)
            db.commit()
            raise HTTPException(
                status_code=404,
                detail=f"Không tìm thấy vật tư ID {req_item.part_id}"
            )

        unit_cost = part.unit_cost
        subtotal = unit_cost * req_item.quantity
        total += subtotal

        item = SupplyOrderItem(
            order_id=order.id, part_id=req_item.part_id,
            quantity=req_item.quantity, unit_cost=unit_cost
        )
        db.add(item)
        items_out.append(SupplyOrderItemOut(
            id=item.id, part_id=item.part_id,
            part_code=part.part_code, part_name=part.name,
            quantity=item.quantity, unit_cost=unit_cost
        ))

    order.total_cost = total
    db.commit()
    db.refresh(order)

    log_audit_event(
        db, current_user.id, "CREATE_ORDER", "SupplyOrder",
        f"Tạo đơn hàng {order_code}, tổng {total:,.0f} VNĐ, {len(req.items)} mục"
    )

    return SupplyOrderOut(
        id=order.id, order_code=order.order_code,
        creator_id=order.creator_id, creator_name=current_user.name,
        branch_id=order.branch_id, sector_id=order.sector_id,
        branch=order.branch, sector=order.sector,
        status=order.status, total_cost=order.total_cost,
        created_at=order.created_at, items=items_out
    )


@router.get("/{order_id}", response_model=SupplyOrderOut)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chi tiết đơn hàng."""
    o = db.query(SupplyOrder).filter(SupplyOrder.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    # Permission check
    if (current_user.role not in [RoleEnum.MANAGER.value, RoleEnum.ADMIN.value]
            and o.creator_id != current_user.id):
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem đơn này")

    creator_name = o.creator.name if o.creator else "Unknown"
    items_out = []
    for item in o.items:
        items_out.append(SupplyOrderItemOut(
            id=item.id, part_id=item.part_id,
            part_code=item.part.part_code if item.part else "Unknown",
            part_name=item.part.name if item.part else "Unknown",
            quantity=item.quantity, unit_cost=item.unit_cost
        ))

    return SupplyOrderOut(
        id=o.id, order_code=o.order_code, creator_id=o.creator_id,
        creator_name=creator_name, branch_id=o.branch_id,
        sector_id=o.sector_id, branch=o.branch, sector=o.sector,
        status=o.status, total_cost=o.total_cost,
        created_at=o.created_at, items=items_out
    )


@router.post("/{order_id}/approve")
def approve_order(
    order_id: int,
    approval: dict,
    current_user: User = Depends(require_role([RoleEnum.MANAGER, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    """Phê duyệt hoặc từ chối đơn hàng."""
    order = db.query(SupplyOrder).filter(SupplyOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    new_status = approval.get("status")
    if new_status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Trạng thái phải là APPROVED hoặc REJECTED")

    old_status = order.status
    order.status = new_status
    db.commit()

    log_audit_event(
        db, current_user.id, "APPROVE_ORDER", "SupplyOrder",
        f"Phê duyệt đơn {order.order_code}: {old_status} -> {new_status}"
    )

    return {"message": f"Đơn hàng đã được {new_status}", "order_id": order.id}


@router.post("/{order_id}/deliver")
def deliver_order(
    order_id: int,
    current_user: User = Depends(require_role([RoleEnum.MAINTENANCE, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    """Xác nhận giao hàng - trừ kho."""
    order = db.query(SupplyOrder).filter(SupplyOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    if order.status != "APPROVED":
        raise HTTPException(status_code=400, detail="Chỉ đơn hàng đã APPROVED mới được giao")

    # Trừ kho - kiểm tra không âm
    for item in order.items:
        part = db.query(SparePart).filter(SparePart.id == item.part_id).first()
        if part:
            if part.stock_qty < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Vật tư {part.part_code} không đủ số lượng (còn {part.stock_qty}, cần {item.quantity})"
                )
            part.stock_qty -= item.quantity

    order.status = "DELIVERED"
    db.commit()

    log_audit_event(
        db, current_user.id, "DELIVER_ORDER", "SupplyOrder",
        f"Giao hàng đơn {order.order_code}, đã trừ kho"
    )

    return {"message": "Giao hàng thành công. Đã cập nhật tồn kho.", "order_id": order.id}
