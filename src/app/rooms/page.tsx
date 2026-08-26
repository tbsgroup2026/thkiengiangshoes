"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconUser,
  IconUsers,
  IconBuilding,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
  IconLock,
  IconLockOpen,
  IconId,
  IconQrcode,
  IconPrinter,
  IconSearch,
  IconFilter,
  IconBell,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconVideo,
  IconDeviceTv,
  IconCoffee,
  IconMicrophone,
  IconChecklist,
  IconEdit,
  IconSparkles,
  IconFileText,
  IconNotes,
  IconLayoutGrid,
  IconList,
  IconCalendarEvent,
  IconCalendarTime,
  IconMapPin,
  IconRefresh,
  IconSend,
} from "@tabler/icons-react";
import Can from "@/components/Can";
import UserAvatar from "@/components/UserAvatar";
import { PERMISSIONS } from "@/lib/permissions";
import { getCurrentUser, formatTitleWithDepartment } from "@/lib/userProfiles";
import { broadcastNotification } from "@/lib/browserNotifications";

interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  status: "AVAILABLE" | "BUSY" | "MAINTENANCE";
  isLocked: boolean;
  colorClass: string;
  badgeBg: string;
}

export type BookingStatus =
  | "PENDING"
  | "APPROVING"
  | "RECEPTIONIST_PROPOSED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  bookerName: string;
  department: string;
  bookingDate: string; // DD/MM/YYYY
  timeSlot: string;
  attendeesCount: number;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  proposedTimeSlot?: string;
  proposedRoomId?: string;
  proposedRoomName?: string;
  proposalNote?: string;
}

interface VisitorRecord {
  id: string;
  badgeCode: string;
  visitorName: string;
  company: string;
  idCard: string;
  hostName: string;
  department: string;
  roomLocation: string;
  visitDate: string;
  expectedTime: string;
  status: "EXPECTED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
  notes?: string;
  createdAt: string;
}

export const DEPARTMENT_OPTIONS = [
  "ĐH-QT",
  "NHÂN SỰ-HC",
  "KD PTSP",
  "QLCL & LAB",
  "CN-PPH & CI",
  "KHCB-TTPP",
];

const getTodayIsoDate = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getTodayVnDate = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}`;
};

export default function MeetingRoomsPage() {
  const [activeTab, setActiveTab] = useState<"APPROVALS" | "BOOKING" | "ROOMS" | "VISITORS" | "CALENDAR">("APPROVALS");
  const [userRole, setUserRole] = useState<"LE_TAN" | "CBCNV">("LE_TAN");
  const [reassignModalBooking, setReassignModalBooking] = useState<RoomBooking | null>(null);
  const [newAssignedRoomId, setNewAssignedRoomId] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedVisitorBadge, setSelectedVisitorBadge] = useState<VisitorRecord | null>(null);
  const [selectedEventModal, setSelectedEventModal] = useState<RoomBooking | null>(null);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<MeetingRoom | null>(null);
  const [roomGalleryImages, setRoomGalleryImages] = useState<string[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [quickNoteModalOpen, setQuickNoteModalOpen] = useState(false);

  // Preload and detect all available images in room folder when detail modal opens
  useEffect(() => {
    if (selectedRoomForDetail) {
      const roomId = selectedRoomForDetail.id;
      const candidates = [
        `/images/rooms/${roomId}/1.jpg`,
        `/images/rooms/${roomId}/2.jpg`,
        `/images/rooms/${roomId}/3.jpg`,
        `/images/rooms/${roomId}/4.jpg`,
        `/images/rooms/${roomId}/5.jpg`,
        `/images/rooms/${roomId}/room1.jpg`,
        `/images/rooms/${roomId}/room2.jpg`,
        `/images/rooms/${roomId}/room3.jpg`,
      ];

      // Instant initial load
      setRoomGalleryImages([`/images/rooms/${roomId}/1.jpg`]);
      setActiveImageIdx(0);

      let isMounted = true;
      Promise.all(
        candidates.map((url) =>
          new Promise<string | null>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => resolve(null);
            img.src = url;
          })
        )
      ).then((results) => {
        if (isMounted) {
          const validUrls = Array.from(new Set(results.filter((url): url is string => url !== null)));
          if (validUrls.length > 0) {
            setRoomGalleryImages(validUrls);
          }
        }
      });

      return () => {
        isMounted = false;
      };
    } else {
      setRoomGalleryImages([]);
      setActiveImageIdx(0);
    }
  }, [selectedRoomForDetail]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(getTodayVnDate());
  const [calendarViewMode, setCalendarViewMode] = useState<"MONTH" | "DAY_LIST">("MONTH");
  const [confirmedSubTab, setConfirmedSubTab] = useState<"CONFIRMED" | "COMPLETED">("CONFIRMED");

  // User Profile
  const [currentUser, setCurrentUser] = useState<{ name: string; title: string; department: string; avatar: string; roles?: string[]; roleCode?: string; empCode?: string }>({
    name: "Cán Bộ Công Nhân Viên",
    title: "Cán Bộ Công Nhân Viên",
    department: "Văn Phòng Chuỗi SKECHERS",
    avatar: "/images/tbs-logo.png",
  });

  useEffect(() => {
    function loadUser() {
      const cur = getCurrentUser();
      if (cur && cur.name) {
        setCurrentUser({
          ...cur,
          title: cur.title || "Cán Bộ Công Nhân Viên",
          department: cur.department || "Văn Phòng Chuỗi SKECHERS",
          avatar: cur.avatar || "/images/tbs-logo.png",
        });

        // Tự động phân quyền dựa trên tài khoản thực tế thay vì button demo
        const isRec = cur.roles?.includes("receptionist") ||
                      cur.roleCode === "LE_TAN" ||
                      cur.empCode === "LT-001" ||
                      cur.title?.includes("Lễ Tân");
        if (isRec) {
          setUserRole("LE_TAN");
          setActiveTab("APPROVALS");
        } else {
          setUserRole("CBCNV");
          setActiveTab("BOOKING");
        }
      }
    }

    loadUser();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_profile_updated", loadUser);
      return () => window.removeEventListener("tbs_profile_updated", loadUser);
    }
  }, []);

  const [d1Error, setD1Error] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadD1Rooms() {
      try {
        const res = await fetch("/api/rooms");
        const json = await res.json();
        if (isMounted) {
          if (!json.success || json.error === "D1_CONNECTION_ERROR") {
            setD1Error(json.message || "Mất kết nối CSDL D1 — dữ liệu phòng họp có thể không chính xác");
          } else {
            setD1Error(null);
            if (json.data?.rooms && json.data.rooms.length > 0) {
              setRooms(json.data.rooms);
            }
            if (json.data?.bookings && json.data.bookings.length > 0) {
              setBookings((prev) => {
                const d1Map = new Map(json.data.bookings.map((b: RoomBooking) => [b.id, b]));
                // Preserve local optimistic state (like APPROVING) until API finishes
                const merged = json.data.bookings.map((d1Item: RoomBooking) => {
                  const localMatch = prev.find((p) => p.id === d1Item.id);
                  if (localMatch && localMatch.status === "APPROVING") {
                    return localMatch;
                  }
                  return d1Item;
                });
                // Keep local temporary new bookings that haven't landed in D1 yet
                const localOnly = prev.filter((p) => p.id.startsWith("b_") && !d1Map.has(p.id));
                return [...localOnly, ...merged];
              });
            }
            if (json.data?.visitors && json.data.visitors.length > 0) {
              setVisitors((prev) => {
                const d1Map = new Map(json.data.visitors.map((v: VisitorRecord) => [v.id, v]));
                const localOnly = prev.filter((v) => v.id.startsWith("v_") && !d1Map.has(v.id));
                return [...localOnly, ...json.data.visitors];
              });
            }
          }
        }
      } catch (err: any) {
        if (isMounted) setD1Error("Mất kết nối CSDL D1 — dữ liệu phòng họp có thể không chính xác");
      }
    }
    loadD1Rooms();
    const interval = setInterval(loadD1Rooms, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);


  // Default Rooms List matching TBS Group SKX Facilities
  const [rooms, setRooms] = useState<MeetingRoom[]>([
    {
      id: "room_1",
      name: "Phòng Họp OTI / OTG",
      capacity: 16,
      location: "Tầng 3 - VP Chuỗi SKECHERS",
      equipment: ["Máy chiếu 4K", "Micro không dây", "Bảng kính", "Trà nước"],
      status: "AVAILABLE",
      isLocked: false,
      colorClass: "bg-emerald-600 border-emerald-700 text-white",
      badgeBg: "bg-emerald-100 text-[#006838]",
    },
    {
      id: "room_2",
      name: "Phòng Họp WORK",
      capacity: 30,
      location: "Tầng 2 - VP Chuỗi SKECHERS",
      equipment: ["Màn hình LED 120 inch", "4 Micro", "Camera Zoom 360", "Trà nước"],
      status: "AVAILABLE",
      isLocked: false,
      colorClass: "bg-blue-600 border-blue-700 text-white",
      badgeBg: "bg-blue-100 text-blue-800",
    },
    {
      id: "room_3",
      name: "Phòng Họp MEN USA",
      capacity: 12,
      location: "Tầng 2 - Khối Thị Trường Mỹ",
      equipment: ["Smart TV 65 inch", "Hệ thống họp từ xa", "Bảng di động"],
      status: "AVAILABLE",
      isLocked: false,
      colorClass: "bg-purple-600 border-purple-700 text-white",
      badgeBg: "bg-purple-100 text-purple-800",
    },
    {
      id: "room_4",
      name: "Phòng Họp SOURCING",
      capacity: 15,
      location: "Tầng 1 - Trung Tâm Sourcing & Vật Tư",
      equipment: ["Máy chiếu 3D", "Bảng tương tác", "Tủ mẫu vật tư SKECHERS"],
      status: "AVAILABLE",
      isLocked: false,
      colorClass: "bg-amber-600 border-amber-700 text-white",
      badgeBg: "bg-amber-100 text-amber-900",
    },
    {
      id: "room_5",
      name: "Phòng Họp Chính",
      capacity: 25,
      location: "Tầng 3 - Hội Trường Trung Tâm",
      equipment: ["Hệ thống Âm thanh Hội thảo", "Màn hình LED", "Trà nước"],
      status: "AVAILABLE",
      isLocked: false,
      colorClass: "bg-indigo-600 border-indigo-700 text-white",
      badgeBg: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "room_6",
      name: "Phòng Họp Phụ",
      capacity: 8,
      location: "Tầng 1 - Khu Hành Chánh & Nhân Sự",
      equipment: ["Smart TV 55 inch", "Bảng trắng", "Bàn phỏng vấn"],
      status: "AVAILABLE",
      isLocked: false,
      colorClass: "bg-rose-600 border-rose-700 text-white",
      badgeBg: "bg-rose-100 text-rose-800",
    },
  ]);

  // Initial Bookings List (Populated Real-Time from Cloudflare D1)
  const [bookings, setBookings] = useState<RoomBooking[]>([]);

  // Initial Visitors List for Lễ Tân Reception Desk Check-in
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);

  // Clear obsolete localStorage mock bookings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tbs_rooms_bookings");
    }
  }, []);

  // Custom Time Slot States
  const [isCustomTimeSlot, setIsCustomTimeSlot] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("08:30");
  const [customEndTime, setCustomEndTime] = useState("10:00");

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    roomId: "room_1",
    title: "",
    bookerName: "Ban Quản Lý",
    department: "Hành chính",
    bookingDate: getTodayIsoDate(),
    timeSlot: "09:00 - 10:30",
    attendeesCount: 6,
    notes: "",
    needsTeaCoffee: true,
    needsProjector: true,
  });

  // Visitor Registration Form State
  const [visitorForm, setVisitorForm] = useState({
    visitorName: "",
    company: "",
    idCard: "",
    hostName: "Ban Quản Lý",
    department: "Hành chính",
    roomLocation: "Phòng Họp Executive VIP 1",
    visitDate: getTodayIsoDate(),
    expectedTime: "14:00",
    notes: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Lễ Tân Counter-Proposal Modal State
  const [proposeModalBooking, setProposeModalBooking] = useState<RoomBooking | null>(null);
  const [proposeForm, setProposeForm] = useState({
    timeSlot: "10:00 - 11:30",
    roomId: "room_1",
    note: "",
  });

  // Lễ Tân Actions
  const handleApproveBooking = async (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    
    if (!targetBooking || targetBooking.status !== "PENDING") {
      showToast("❌ Chỉ có thể duyệt cuộc họp ở trạng thái 'Chờ Lễ Tân'!");
      return;
    }

    // ✅ Step 1: Set intermediate APPROVING state
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "APPROVING" } : b))
    );
    showToast("⏳ Đang xác nhận phòng họp...");

    try {
      const approvalTime = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const updatedNotes =
        (targetBooking.notes || "") +
        ` [APPROVED_BY_RECEPTIONIST_AT_${approvalTime}]`;

      // ✅ Step 2: Call API with await and full payload for UPSERT support
      const response = await fetch("/api/rooms/booking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          roomId: targetBooking.roomId,
          roomName: targetBooking.roomName,
          title: targetBooking.title,
          bookerName: targetBooking.bookerName,
          department: targetBooking.department,
          bookingDate: targetBooking.bookingDate,
          timeSlot: targetBooking.timeSlot,
          attendeesCount: targetBooking.attendeesCount,
          notes: updatedNotes,
          status: "CONFIRMED",
          approvedAt: new Date().toISOString(),
        }),
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "CONFIRMED", notes: updatedNotes } : b
        )
      );

      showToast("✅ Lễ Tân đã xác nhận & xếp phòng họp thành công!");

      // ✅ Step 5: Send notification
      if (targetBooking) {
        broadcastNotification({
          title: "✅ Lịch Họp Đã Được Lễ Tân Xác Nhận",
          message: `Lễ Tân đã xác nhận & xếp phòng ${targetBooking.roomName} cho cuộc họp "${targetBooking.title}" của ${targetBooking.bookerName} (${targetBooking.timeSlot} ngày ${targetBooking.bookingDate}).`,
          type: "SUCCESS",
          targetUser: targetBooking.bookerName,
          link: "/rooms",
        });
      }
    } catch (error) {
      console.error("Approve booking failed:", error);

      // ✅ Step 6: Revert to PENDING on failure
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "PENDING" } : b
        )
      );

      showToast(
        `❌ Xác nhận thất bại: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
      );

      // ✅ Step 7: Notify failure
      if (targetBooking) {
        broadcastNotification({
          title: "❌ Xác Nhận Phòng Họp Thất Bại",
          message: `Không thể xác nhận phòng "${targetBooking.title}". Vui lòng thử lại.`,
          type: "WARNING",
          targetUser: "Lễ Tân",
        });
      }
    }
  };

  const handleSendCounterProposal = () => {
    if (!proposeModalBooking) return;
    const targetRoom = rooms.find((r) => r.id === proposeForm.roomId) || rooms[0];

    setBookings((prev) =>
      prev.map((b) =>
        b.id === proposeModalBooking.id
          ? {
              ...b,
              status: "RECEPTIONIST_PROPOSED",
              proposedTimeSlot: proposeForm.timeSlot,
              proposedRoomId: targetRoom.id,
              proposedRoomName: targetRoom.name,
              proposalNote: proposeForm.note.trim() || "Lễ Tân đề xuất điều chỉnh giờ/phòng họp tối ưu.",
            }
          : b
      )
    );

    showToast(`👩‍💼 Lễ Tân đã gửi đề xuất đổi sang ${proposeForm.timeSlot} tại "${targetRoom.name}" tới người đặt họp!`);

    broadcastNotification({
      title: "🔄 Lễ Tân Đề Xuất Thay Đổi Giờ / Phòng Họp",
      message: `Lễ Tân đề xuất cuộc họp "${proposeModalBooking.title}" của bạn đổi sang ${proposeForm.timeSlot} tại ${targetRoom.name}. Ghi chú: ${proposeForm.note || "Theo sắp xếp lịch"}. Vui lòng bấm Xác nhận.`,
      type: "INFO",
      targetUser: proposeModalBooking.bookerName,
      link: "/rooms",
    });

    setProposeModalBooking(null);
  };

  const handleUserAcceptProposal = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    const finalRoomId = target.proposedRoomId || target.roomId;
    const finalRoomName = target.proposedRoomName || target.roomName;
    const finalTimeSlot = target.proposedTimeSlot || target.timeSlot;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              roomId: finalRoomId,
              roomName: finalRoomName,
              timeSlot: finalTimeSlot,
              status: "CONFIRMED",
            }
          : b
      )
    );

    showToast(`🎉 Bạn đã đồng ý & xác nhận lịch họp lúc ${finalTimeSlot} tại "${finalRoomName}"!`);

    broadcastNotification({
      title: "🎉 Lịch Họp Đã Được Chốt Chính Thức",
      message: `Cán bộ ${target.bookerName} đã đồng ý đề xuất của Lễ Tân. Cuộc họp "${target.title}" đã lên lịch chính thức lúc ${finalTimeSlot} tại ${finalRoomName}.`,
      type: "SUCCESS",
      targetUser: "Lễ Tân",
      link: "/rooms",
    });
  };

  const handleUserDeclineProposal = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
    );

    showToast("❌ Đã hủy yêu cầu đăng ký phòng họp.");

    if (target) {
      broadcastNotification({
        title: "❌ Đã Hủy Yêu Cầu Họp",
        message: `Cán bộ ${target.bookerName} đã từ chối đề xuất đổi giờ của Lễ Tân và hủy yêu cầu đăng ký phòng họp "${target.title}".`,
        type: "WARNING",
        targetUser: "Lễ Tân",
        link: "/rooms",
      });
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
    );
    try {
      await fetch("/api/rooms/booking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: "CANCELLED" }),
      });
    } catch (e) {}
    showToast("❌ Lễ Tân đã từ chối yêu cầu đặt phòng.");

    if (targetBooking) {
      broadcastNotification({
        title: "❌ Đơn Đặt Phòng Họp Bị Từ Chối",
        message: `Yêu cầu đặt phòng họp cho "${targetBooking.title}" của ${targetBooking.bookerName} đã bị Lễ Tân từ chối.`,
        type: "WARNING",
        targetUser: targetBooking.bookerName,
        link: "/rooms",
      });
    }
  };

  const handleConfirmReassignRoom = async () => {
    if (!reassignModalBooking || !newAssignedRoomId) return;
    const targetRoom = rooms.find((r) => r.id === newAssignedRoomId);
    if (!targetRoom) return;

    // Check overlap for target room
    const isConflict = bookings.some(
      (b) =>
        b.roomId === targetRoom.id &&
        b.bookingDate === reassignModalBooking.bookingDate &&
        b.timeSlot === reassignModalBooking.timeSlot &&
        b.status !== "CANCELLED" &&
        b.id !== reassignModalBooking.id
    );

    if (isConflict) {
      showToast(`❌ Phòng "${targetRoom.name}" đã có cuộc họp khác trong khung giờ ${reassignModalBooking.timeSlot}!`);
      return;
    }

    const updatedNotes = (reassignModalBooking.notes || "") + " [APPROVED_BY_RECEPTIONIST]";
    setBookings((prev) =>
      prev.map((b) =>
        b.id === reassignModalBooking.id
          ? { ...b, roomId: targetRoom.id, roomName: targetRoom.name, status: "CONFIRMED", notes: updatedNotes }
          : b
      )
    );
    try {
      await fetch("/api/rooms/booking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reassignModalBooking.id, status: "CONFIRMED", roomId: targetRoom.id, roomName: targetRoom.name, notes: updatedNotes }),
      });
    } catch (e) {}
    showToast(`👩‍💼 Lễ Tân đã điều chuyển cuộc họp sang "${targetRoom.name}"!`);

    broadcastNotification({
      title: "🔄 Đã Điều Chuyển Phòng Họp",
      message: `Lễ Tân đã điều chuyển cuộc họp "${reassignModalBooking.title}" của ${reassignModalBooking.bookerName} sang "${targetRoom.name}" (${reassignModalBooking.timeSlot}).`,
      type: "INFO",
      targetUser: reassignModalBooking.bookerName,
      link: "/rooms",
    });

    setReassignModalBooking(null);
  };

  const handleVisitorCheckIn = (visitorId: string) => {
    const targetVisitor = visitors.find((v) => v.id === visitorId);
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, status: "CHECKED_IN" } : v))
    );
    showToast("🪪 Lễ Tân đã xác nhận khách đến (Check-in) & phát thẻ ra vào!");

    if (targetVisitor) {
      broadcastNotification({
        title: "🪪 Khách Đến Lễ Tân (Check-in)",
        message: `Lễ Tân đã phát thẻ ${targetVisitor.badgeCode} cho khách ${targetVisitor.visitorName} (${targetVisitor.company}) - Người đón: ${targetVisitor.hostName}.`,
        type: "SUCCESS",
        targetUser: targetVisitor.hostName,
        link: "/rooms",
      });
    }
  };

  const handleVisitorCheckOut = (visitorId: string) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, status: "CHECKED_OUT" } : v))
    );
    showToast("📤 Lễ Tân đã thu hồi thẻ & hoàn tất thủ tục Check-out!");
  };

  const handleCheckoutRoom = async (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) return;

    const updatedBookings = bookings.map((item) =>
      item.id === bookingId ? { ...item, status: "COMPLETED" as const } : item
    );

    setBookings(updatedBookings);
    if (typeof window !== "undefined") {
      localStorage.setItem("tbs_rooms_bookings", JSON.stringify(updatedBookings));
    }

    // Persist status directly to Cloudflare D1 Database
    try {
      await fetch("/api/rooms/booking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: "COMPLETED" }),
      });
    } catch (e) {
      console.warn("Cloudflare D1 sync notice:", e);
    }

    showToast(`🟢 Đã trả phòng "${targetBooking.roomName}" thành công! Phòng hiện đã trống & sẵn sàng sử dụng.`);

    broadcastNotification({
      title: "🟢 Đã Trả Phòng Họp",
      message: `Phòng ${targetBooking.roomName} đã hoàn tất cuộc họp "${targetBooking.title}" của ${targetBooking.bookerName} và được Lễ Tân xác nhận trả phòng.`,
      type: "SUCCESS",
      targetUser: targetBooking.bookerName,
      link: "/rooms",
    });
  };

  // Sync Data with Cloudflare D1 Database
  const fetchD1RoomsData = async () => {
    try {
      const res = await fetch("/api/rooms");
      const result = await res.json();
      if (result.success && result.data) {
        if (Array.isArray(result.data.rooms) && result.data.rooms.length > 0) {
          setRooms((prev) =>
            result.data.rooms.map((r: any) => {
              const matched = prev.find((p) => p.id === r.id);
              return {
                id: r.id,
                name: r.name,
                capacity: r.capacity || 10,
                location: r.location,
                equipment: typeof r.equipment === "string" ? r.equipment.split(", ") : r.equipment || [],
                status: r.status || "AVAILABLE",
                isLocked: Boolean(r.is_locked),
                colorClass: matched?.colorClass || "bg-blue-600 border-blue-700 text-white",
                badgeBg: matched?.badgeBg || "bg-blue-100 text-blue-800",
              };
            })
          );
        }
        if (Array.isArray(result.data.bookings)) {
          const d1Bookings: RoomBooking[] = result.data.bookings.map((b: any) => ({
            id: b.id,
            roomId: b.room_id || b.roomId,
            roomName: b.room_name || b.roomName,
            title: b.title,
            bookerName: b.booker_name || b.bookerName,
            department: b.department,
            bookingDate: b.booking_date || b.bookingDate,
            timeSlot: b.time_slot || b.timeSlot,
            attendeesCount: b.attendees_count || b.attendeesCount || 5,
            notes: b.notes,
            status: b.status || "PENDING",
            createdAt: b.created_at || new Date().toLocaleString("vi-VN"),
          }));
          
          // ✅ FIX: Merge API data with local state instead of replacing
          // This preserves any client-side optimistic updates
          setBookings((prev) => {
            const merged = [...d1Bookings];
            // For each local booking, check if it exists in API data
            // If not, keep it (it might be a new unsent booking)
            for (const localBooking of prev) {
              if (!merged.find(b => b.id === localBooking.id)) {
                // Booking exists locally but not in API yet - keep it
                merged.push(localBooking);
              }
            }
            return merged;
          });
          
          if (typeof window !== "undefined") {
            localStorage.setItem("tbs_rooms_bookings", JSON.stringify(d1Bookings));
          }
        }
        if (Array.isArray(result.data.visitors)) {
          const d1Visitors: VisitorRecord[] = result.data.visitors.map((v: any) => ({
            id: v.id,
            badgeCode: v.badge_code || v.badgeCode,
            visitorName: v.visitor_name || v.visitorName,
            company: v.company,
            idCard: v.id_card || v.idCard,
            hostName: v.host_name || v.hostName,
            department: v.department,
            roomLocation: v.room_location || v.roomLocation,
            visitDate: v.visit_date || v.visitDate,
            expectedTime: v.expected_time || v.expectedTime,
            status: v.status || "EXPECTED",
            notes: v.notes,
            createdAt: v.created_at || new Date().toLocaleString("vi-VN"),
          }));
          setVisitors(d1Visitors);
          if (typeof window !== "undefined") {
            localStorage.setItem("tbs_rooms_visitors", JSON.stringify(d1Visitors));
          }
        }
      }
    } catch (err) {
      console.warn("D1 Rooms API fallback to local state:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBookings = localStorage.getItem("tbs_rooms_bookings");
      if (savedBookings) {
        try {
          const parsed = JSON.parse(savedBookings);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBookings(parsed);
          }
        } catch (e) {
          console.warn("Failed to load saved bookings", e);
        }
      }

      const savedVisitors = localStorage.getItem("tbs_rooms_visitors");
      if (savedVisitors) {
        try {
          const parsed = JSON.parse(savedVisitors);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVisitors(parsed);
          }
        } catch (e) {
          console.warn("Failed to load saved visitors", e);
        }
      }
    }
    fetchD1RoomsData();

    // Commented out: Auto-poll every 3 seconds causes booking status to reset
    // The /api/rooms endpoint doesn't reliably return updated booking data
    // Using localStorage for now until proper real-time sync is implemented
    // const timer = setInterval(() => {
    //   fetchD1RoomsData();
    // }, 3000);

    // return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && bookings.length > 0) {
      localStorage.setItem("tbs_rooms_bookings", JSON.stringify(bookings));
    }
  }, [bookings]);

  useEffect(() => {
    if (typeof window !== "undefined" && visitors.length > 0) {
      localStorage.setItem("tbs_rooms_visitors", JSON.stringify(visitors));
    }
  }, [visitors]);


  // Submit Room Booking / Quick Note
  const handleBookRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.title.trim()) {
      alert("Vui lòng nhập tiêu đề cuộc họp/ghi chú!");
      return;
    }

    if (bookingForm.bookingDate < getTodayIsoDate()) {
      showToast("⚠️ Không thể chọn ngày họp trong quá khứ! Vui lòng chọn từ ngày hôm nay trở đi.");
      return;
    }

    const selectedRoom = rooms.find((r) => r.id === bookingForm.roomId) || rooms[0];

    if (bookingForm.attendeesCount > selectedRoom.capacity) {
      showToast(`⚠️ Số người tham dự (${bookingForm.attendeesCount}) vượt quá sức chứa tối đa của ${selectedRoom.name} (${selectedRoom.capacity} người)!`);
      return;
    }
    
    const dateFmt = bookingForm.bookingDate.split("-").reverse().join("/");

    // ✅ NEW: Check if booking time is in the past
    const today = new Date();
    const bookingDateObj = new Date(bookingForm.bookingDate + "T" + bookingForm.timeSlot.split(" - ")[0]);
    
    // Parse time slot (HH:MM format)
    const timeStr = bookingForm.timeSlot.split(" - ")[0]; // Get start time "HH:MM"
    const [hours, minutes] = timeStr.split(":").map(Number);
    bookingDateObj.setHours(hours, minutes, 0, 0);
    
    if (bookingDateObj < today) {
      showToast("❌ Vui lòng kiểm tra lại lịch họp - Thời gian họp đã qua!");
      return;
    }

    // ✅ NEW: Check for double-booking conflicts
    const hasConflict = bookings.some((b) =>
      b.roomId === selectedRoom.id &&
      b.bookingDate === dateFmt &&
      b.timeSlot === bookingForm.timeSlot &&
      b.status !== "CANCELLED"
    );

    if (hasConflict) {
      showToast(`❌ Phòng ${selectedRoom.name} đã được đặt trong khung giờ ${bookingForm.timeSlot} ngày ${dateFmt}. Vui lòng chọn khung giờ khác.`);
      return;
    }

    const newBooking: RoomBooking = {
      id: `b_${Date.now()}`,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      title: bookingForm.title,
      bookerName: bookingForm.bookerName || currentUser.name,
      department: bookingForm.department,
      bookingDate: dateFmt,
      timeSlot: bookingForm.timeSlot,
      attendeesCount: bookingForm.attendeesCount,
      notes: bookingForm.notes,
      status: "PENDING", // Corrected: Initial status is PENDING awaiting Receptionist approval
      createdAt: new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
    };

    setBookings([newBooking, ...bookings]);

    // Broadcast Notification to Lễ Tân & Booker
    broadcastNotification({
      title: "🛎️ Đơn Đăng Ký Phòng Họp Mới",
      message: `Cán bộ ${newBooking.bookerName} (${newBooking.department}) vừa đăng ký phòng ${newBooking.roomName} lúc ${newBooking.timeSlot} ngày ${newBooking.bookingDate}. Chờ Lễ Tân duyệt!`,
      type: "INFO",
      targetUser: "Lễ Tân",
      link: "/rooms",
    });

    broadcastNotification({
      title: "⏳ Đã Gửi Đăng Ký Phòng Họp",
      message: `Yêu cầu đăng ký ${newBooking.roomName} (${newBooking.timeSlot} ngày ${newBooking.bookingDate}) đã gửi tới Bàn Lễ Tân thành công.`,
      type: "SUCCESS",
      targetUser: newBooking.bookerName,
      link: "/rooms",
    });

    // ✅ NEW: Better error handling with try/catch
    try {
      const response = await fetch("/api/rooms/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBooking,
          bookingDate: dateFmt,
        }),
      });

      if (!response.ok) {
        // Handle non-2xx responses
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      showToast("✅ Đặt phòng họp thành công! Lễ Tân sẽ kiểm tra & phê duyệt xếp phòng trước khi lên lịch chính thức.");
    } catch (err) {
      console.error("Booking submission error:", err);
      // If API fails, remove from local state
      setBookings(prev => prev.filter(b => b.id !== newBooking.id));
      showToast(`❌ Đặt phòng thất bại: ${err instanceof Error ? err.message : 'Lỗi mạng'}. Vui lòng thử lại.`);
      return;
    }

    setQuickNoteModalOpen(false);
    if (userRole === "LE_TAN") {
      setActiveTab("APPROVALS");
    } else {
      setActiveTab("CALENDAR");
    }
  };

  // Register External Visitor
  const handleRegisterVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.visitorName.trim()) {
      alert("Vui lòng nhập họ tên khách mời!");
      return;
    }
    if (!visitorForm.company.trim()) {
      alert("Vui lòng nhập tên đơn vị/công ty khách!");
      return;
    }

    const dateFmt = visitorForm.visitDate.split("-").reverse().join("/");
    const badgeCode = `VIS-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newVisitor: VisitorRecord = {
      id: `v_${Date.now()}`,
      badgeCode,
      visitorName: visitorForm.visitorName,
      company: visitorForm.company,
      idCard: visitorForm.idCard,
      hostName: visitorForm.hostName,
      department: visitorForm.department,
      roomLocation: visitorForm.roomLocation,
      visitDate: dateFmt,
      expectedTime: visitorForm.expectedTime,
      status: "EXPECTED",
      notes: visitorForm.notes,
      createdAt: new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
    };

    setVisitors([newVisitor, ...visitors]);

    try {
      await fetch("/api/rooms/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newVisitor,
          badgeCode,
          visitDate: dateFmt,
        }),
      });
      showToast("Đã đăng ký thông tin đón khách thành công & lưu vào D1!");
    } catch (err) {
      showToast("Đã tạo thẻ khách thành công!");
    }

    setSelectedVisitorBadge(newVisitor);
  };

  // Toggle Room Maintenance Lock
  const handleToggleRoomLock = async (roomId: string) => {
    const updatedRooms = rooms.map((r) => {
      if (r.id === roomId) {
        const nextLock = !r.isLocked;
        return {
          ...r,
          isLocked: nextLock,
          status: (nextLock ? "MAINTENANCE" : "AVAILABLE") as "AVAILABLE" | "BUSY" | "MAINTENANCE",
        };
      }
      return r;
    });

    setRooms(updatedRooms);
    const targetRoom = updatedRooms.find((r) => r.id === roomId);

    try {
      await fetch("/api/rooms/lock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: roomId,
          isLocked: targetRoom?.isLocked,
          status: targetRoom?.status,
        }),
      });
      showToast(`Đã ${targetRoom?.isLocked ? "khóa bảo trì" : "mở lại"} phòng họp thành công trong D1!`);
    } catch (err) {
      showToast(`Đã cập nhật trạng thái phòng họp!`);
    }
  };

  // Helper: Helper color getter for room cards
  const getRoomColorStyle = (roomName: string) => {
    if (roomName.includes("OTI") || roomName.includes("OTG")) return "bg-emerald-700 hover:bg-emerald-800 text-white";
    if (roomName.includes("WORK")) return "bg-blue-700 hover:bg-blue-800 text-white";
    if (roomName.includes("MEN USA")) return "bg-purple-700 hover:bg-purple-800 text-white";
    if (roomName.includes("SOURCING")) return "bg-amber-700 hover:bg-amber-800 text-white";
    if (roomName.includes("Chính")) return "bg-indigo-700 hover:bg-indigo-800 text-white";
    if (roomName.includes("Phụ") || roomName.includes("Phỏng Vấn")) return "bg-rose-700 hover:bg-rose-800 text-white";
    return "bg-slate-700 hover:bg-slate-800 text-white";
  };

  // Dynamic Real-time Calculations for Room Availability & Schedule Stats
  const activeConfirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const totalUsableRooms = rooms.filter((r) => !r.isLocked && r.status !== "MAINTENANCE");

  const occupiedRoomIdsToday = new Set<string>();
  activeConfirmedBookings.forEach((b) => {
    const matchedById = totalUsableRooms.find((r) => r.id === b.roomId);
    if (matchedById && !occupiedRoomIdsToday.has(matchedById.id)) {
      occupiedRoomIdsToday.add(matchedById.id);
      return;
    }
    const matchedByName = totalUsableRooms.find(
      (r) =>
        r.name.toLowerCase() === b.roomName?.toLowerCase() ||
        r.name.toLowerCase().includes(b.roomName?.toLowerCase() || "") ||
        (b.roomName && r.name.toLowerCase().includes(b.roomName.toLowerCase()))
    );
    if (matchedByName && !occupiedRoomIdsToday.has(matchedByName.id)) {
      occupiedRoomIdsToday.add(matchedByName.id);
      return;
    }
    const nextFree = totalUsableRooms.find((r) => !occupiedRoomIdsToday.has(r.id));
    if (nextFree) {
      occupiedRoomIdsToday.add(nextFree.id);
    }
  });

  const occupiedRoomsCount = occupiedRoomIdsToday.size;
  const availableRoomsCount = Math.max(0, totalUsableRooms.length - occupiedRoomsCount);
  const pendingBookingsCount = bookings.filter((b) => b.status === "PENDING").length;

  const confirmedBookingsToday = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
  );
  const masterCalendarConfirmedCount = confirmedBookingsToday.length;



  // Date Parsing & Formatting Helpers for Google Calendar & Month Grid
  const parseVnDate = (dateStr: string) => {
    const parts = (dateStr || getTodayVnDate()).split("/");
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    return new Date();
  };

  const formatVnDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Dynamically Generate Calendar Grid Days for Selected Month (35/42 cells)
  const augustCalendarDays = (() => {
    const currentSelectedDate = parseVnDate(selectedCalendarDate);
    const year = currentSelectedDate.getFullYear();
    const month = currentSelectedDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(1 - startDayOfWeek); // Roll back to Sunday before 1st of month

    const todayStr = getTodayVnDate();
    const days = [];

    for (let idx = 0; idx < 35; idx++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + idx);
      const dateStr = formatVnDate(d);
      const isCurrentMonth = d.getMonth() === month;
      const isToday = dateStr === todayStr;
      const dayBookings = bookings.filter(
        (b) => b.bookingDate === dateStr && (b.status === "CONFIRMED" || b.status === "COMPLETED")
      );

      days.push({
        idx,
        displayDay: d.getDate(),
        dateStr,
        isCurrentMonth,
        isToday,
        dayBookings,
      });
    }
    return days;
  })();

  const getDayNameVn = (dateStr: string) => {
    const d = parseVnDate(dateStr);
    const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return dayNames[d.getDay()];
  };

  const handlePrevDate = () => {
    const cur = parseVnDate(selectedCalendarDate);
    cur.setDate(cur.getDate() - 1);
    const newDateStr = formatVnDate(cur);
    setSelectedCalendarDate(newDateStr);
    setBookingForm((prev) => ({
      ...prev,
      bookingDate: newDateStr.split("/").reverse().join("-"),
    }));
  };

  const handleNextDate = () => {
    const cur = parseVnDate(selectedCalendarDate);
    cur.setDate(cur.getDate() + 1);
    const newDateStr = formatVnDate(cur);
    setSelectedCalendarDate(newDateStr);
    setBookingForm((prev) => ({
      ...prev,
      bookingDate: newDateStr.split("/").reverse().join("-"),
    }));
  };

  const handleTodayDate = () => {
    const todayVn = getTodayVnDate();
    const todayIso = getTodayIsoDate();
    setSelectedCalendarDate(todayVn);
    setBookingForm((prev) => ({
      ...prev,
      bookingDate: todayIso,
    }));
    showToast(`Đã chuyển về ngày hôm nay ${todayVn}`);
  };

  // Generate 7 days for the quick week switcher strip
  const weekDaysStrip = (() => {
    const base = parseVnDate(selectedCalendarDate);
    const dayOfWeek = base.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatVnDate(d);
      const dayBookings = bookings.filter(
        (b) => b.bookingDate === dateStr && (b.status === "CONFIRMED" || b.status === "COMPLETED")
      );
      const dayNamesShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      return {
        dateStr,
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        dayNameShort: dayNamesShort[d.getDay()],
        dayNameFull: ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][d.getDay()],
        isSelected: dateStr === selectedCalendarDate,
        isToday: dateStr === "15/08/2026",
        count: dayBookings.length,
      };
    });
  })();

  const TIMELINE_HOURS = [
    { hour: 7, label: "07:00", defaultSlot: "07:00 - 08:00" },
    { hour: 8, label: "08:00", defaultSlot: "08:00 - 09:30" },
    { hour: 9, label: "09:00", defaultSlot: "09:30 - 11:30" },
    { hour: 10, label: "10:00", defaultSlot: "10:00 - 11:30" },
    { hour: 11, label: "11:00", defaultSlot: "11:00 - 12:30" },
    { hour: 12, label: "12:00", defaultSlot: "12:00 - 13:00" },
    { hour: 13, label: "13:00", defaultSlot: "13:30 - 15:00" },
    { hour: 14, label: "14:00", defaultSlot: "14:00 - 15:30" },
    { hour: 15, label: "15:00", defaultSlot: "15:00 - 17:00" },
    { hour: 16, label: "16:00", defaultSlot: "16:00 - 17:30" },
    { hour: 17, label: "17:00", defaultSlot: "17:00 - 18:30" },
    { hour: 18, label: "18:00", defaultSlot: "18:00 - 19:30" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 flex flex-col justify-between font-sans">
      {/* ════════════════════════════════════════════════════════════════
          TOP EXECUTIVE HEADER BAR
         ════════════════════════════════════════════════════════════════ */}
      <header className="px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href="/work" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src="/images/tbs-logo.png"
              alt="TBS Group Logo"
              className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />
            <img
              src="/images/skechers-logo.png"
              alt="Skechers Logo"
              className="h-5 sm:h-5.5 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <span className="hidden md:inline-block px-2.5 py-1 rounded-full bg-[#e6f4ed] text-[#006838] text-xs font-bold border border-emerald-100 truncate">
            Hệ Thống Quản Lý Phòng Họp &amp; Đón Khách
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-bold flex items-center gap-1 hover:bg-slate-200 transition-colors">
            <span>VN</span>
            <IconChevronDown size={12} />
          </button>
          <button className="p-1.5 sm:p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors relative">
            <IconBell size={16} />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 border border-white" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
            <UserAvatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="sm"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-none">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                {formatTitleWithDepartment(currentUser.title, currentUser.department)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
         ════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 min-w-0 pb-28">
        {/* D1 Connection Error Banner */}
        {d1Error && (
          <div className="bg-rose-600 text-white px-4 py-3 rounded-2xl shadow-md border border-rose-700 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>Mất kết nối CSDL D1 — dữ liệu phòng họp có thể không chính xác</span>
            </div>
            <button onClick={() => window.location.reload()} className="px-2.5 py-1 bg-white text-rose-700 rounded-lg text-[11px] font-black hover:bg-rose-50 cursor-pointer">
              Tải lại
            </button>
          </div>
        )}

        {/* Title & Back Header (Flex Responsive - No Absolute Overlap on Mobile) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-emerald-50 hover:text-[#006838] transition-colors shadow-2xs"
          >
            <IconArrowLeft size={16} />
            <span>Trở về Tổng quan</span>
          </Link>

          <div className="text-center sm:text-right">
            <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
              QUẢN LÝ PHÒNG HỌP &amp; ĐÓN KHÁCH
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Hệ thống lịch tổng hợp cuộc họp, đăng ký tài nguyên phòng họp &amp; đón khách
            </p>
          </div>
        </div>

        {/* 📊 4 STAT DASHBOARD SUMMARY CARDS (RESPONSIVE FOR MOBILE) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Tổng phòng họp */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3.5 group min-w-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#006838]/10 text-[#006838] flex items-center justify-center border border-[#006838]/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <IconBuilding size={18} className="sm:hidden" />
              <IconBuilding size={24} className="hidden sm:block" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1 w-full">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 block truncate">Tổng phòng họp</span>
              <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">{rooms.length} Phòng</div>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 block truncate">
                +100% <span className="text-slate-400 font-normal hidden sm:inline">sẵn sàng sử dụng</span> ↑
              </span>
            </div>
          </div>

          {/* Card 2: Phòng trống khả dụng */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3.5 group min-w-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform flex-shrink-0">
              <IconCheck size={18} className="sm:hidden" />
              <IconCheck size={24} className="hidden sm:block" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1 w-full">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 block truncate">Phòng trống khả dụng</span>
              <div className="text-lg sm:text-2xl font-black text-[#006838] leading-tight">
                {availableRoomsCount} / {rooms.length} Phòng
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 block truncate">
                {rooms.length - availableRoomsCount > 0 ? (
                  <span className="text-amber-700 font-bold">{rooms.length - availableRoomsCount} phòng đang bận họp</span>
                ) : (
                  <span>100% phòng trống sẵn sàng</span>
                )}
              </span>
            </div>
          </div>

          {/* Card 3: Lịch họp hôm nay */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3.5 group min-w-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 group-hover:scale-105 transition-transform flex-shrink-0">
              <IconCalendar size={18} className="sm:hidden" />
              <IconCalendar size={24} className="hidden sm:block" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1 w-full">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 block truncate">Lịch họp hôm nay</span>
              <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                {confirmedBookingsToday.length} Cuộc họp
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold block truncate">
                {pendingBookingsCount > 0 ? (
                  <span className="text-amber-700 font-black">⚠️ {pendingBookingsCount} chờ Lễ Tân xếp</span>
                ) : confirmedBookingsToday.length > 0 ? (
                  <span className="text-emerald-700 font-bold">✓ {confirmedBookingsToday.length} đã duyệt &amp; lên lịch</span>
                ) : (
                  <span className="text-slate-500 font-medium">Chưa có lịch họp hôm nay</span>
                )}
              </span>
            </div>
          </div>

          {/* Card 4: Khách đón trong ngày */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3.5 group min-w-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 group-hover:scale-105 transition-transform flex-shrink-0">
              <IconId size={18} className="sm:hidden" />
              <IconId size={24} className="hidden sm:block" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 block truncate">Khách đón trong ngày</span>
              <div className="text-base sm:text-2xl font-black text-slate-900 leading-tight">{visitors.length} Lượt khách</div>
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 flex items-center gap-0.5 whitespace-nowrap truncate">
                +25% <span className="text-slate-400 font-normal hidden sm:inline">so với tuần trước</span> ↑
              </span>
            </div>
          </div>
        </div>

        {/* TOP NAVIGATION TABS */}
        <div className="bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/90 shadow-inner flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap">
          {/* Tab Bàn Lễ Tân CHỈ HIỂN THỊ VỚI LỄ TÂN, KHÔNG HIỂN THỊ VỚI CBCNV */}
          {userRole === "LE_TAN" && (
            <button
              onClick={() => setActiveTab("APPROVALS")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "APPROVALS"
                  ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                  : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
              }`}
            >
              <IconChecklist size={18} />
              <span>Bàn Lễ Tân (Xác nhận &amp; Xếp lịch)</span>
              {bookings.filter((b) => b.status === "PENDING").length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black animate-pulse">
                  {bookings.filter((b) => b.status === "PENDING").length} chờ duyệt
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab("BOOKING")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "BOOKING"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconEdit size={18} />
            <span>Đặt phòng họp</span>
          </button>

          <button
            onClick={() => setActiveTab("ROOMS")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ROOMS"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconBuilding size={18} />
            <span>Danh sách phòng họp</span>
          </button>

          <button
            onClick={() => setActiveTab("VISITORS")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "VISITORS"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconId size={18} />
            <span>Đón khách &amp; Cấp thẻ</span>
          </button>

          <button
            onClick={() => setActiveTab("CALENDAR")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "CALENDAR"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconCalendar size={18} />
            <span>Lịch tổng hợp cuộc họp</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === "CALENDAR" ? "bg-white/20 text-white" : "bg-slate-300/80 text-slate-800"
            }`}>
              {masterCalendarConfirmedCount} đã duyệt
            </span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB 0: 🛎️ BÀN LỄ TÂN (XÁC NHẬN PHÒNG, ĐỔI PHÒNG, XẾP LỊCH, ĐÓN KHÁCH)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "APPROVALS" && userRole === "LE_TAN" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {userRole !== "LE_TAN" &&
              !currentUser.roles?.includes("admin") &&
              !currentUser.roles?.includes("ceo") &&
              !currentUser.roles?.includes("deputy_ceo") &&
              !currentUser.roles?.includes("director") &&
              !currentUser.roles?.includes("deputy_director") &&
              !["SUPER_ADMIN", "TONG_GIAM_DOC", "PHO_TONG_GIAM_DOC", "GIAM_DOC", "PHO_GIAM_DOC"].includes(currentUser.roleCode || "") &&
              !["202608001", "ADMIN-2026", "TGĐ-001", "PTGĐ-002", "GĐ-003", "PGĐ-004"].includes(currentUser.empCode || "") && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔒</span>
                    <span><b>Chế độ Chỉ Xem (Read-Only):</b> Bạn đang truy cập Bàn Lễ Tân với vai trò <b>{currentUser.name}</b> ({currentUser.department}). Quyền Duyệt &amp; Xếp phòng dành riêng cho <b>Lễ Tân &amp; Ban Giám Đốc</b>. Bạn vẫn có thể gửi đăng ký ở tab "Đặt Phòng Họp".</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 text-amber-950 text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                    Chỉ Xem
                  </span>
                </div>
            )}

            {/* Lễ Tân Executive Dashboard Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#006838] via-[#043322] to-slate-900 text-white shadow-lg space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/20">
                    👩‍💼
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                      BỘ PHẬN LỄ TÂN &amp; QUẢN LÝ TÀI NGUYÊN
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      Bàn Lễ Tân — Xác Nhận Phòng, Xếp Lịch &amp; Đón Tiếp Khách
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/30">
                    🟢 Đang Hoạt Động (Ca Sáng)
                  </span>
                </div>
              </div>

              {/* Quick Status Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                  <span className="text-[11px] font-bold text-amber-300 block">Yêu cầu chờ Lễ tân xác nhận</span>
                  <div className="text-2xl font-black text-white">
                    {bookings.filter((b) => b.status === "PENDING").length} Yêu cầu
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                  <span className="text-[11px] font-bold text-emerald-300 block">Cuộc họp đã xác nhận</span>
                  <div className="text-2xl font-black text-white">
                    {bookings.filter((b) => b.status === "CONFIRMED").length} Cuộc họp
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                  <span className="text-[11px] font-bold text-purple-300 block">Khách đang tại Lễ tân</span>
                  <div className="text-2xl font-black text-white">
                    {visitors.filter((v) => v.status === "CHECKED_IN").length} Lượt khách
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                  <span className="text-[11px] font-bold text-blue-300 block">Phòng họp trống khả dụng</span>
                  <div className="text-2xl font-black text-white">
                    {availableRoomsCount} / {rooms.length} Phòng
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: YÊU CẦU ĐẶT PHÒNG HỌP CHỜ LỄ TÂN PHÊ DUYỆT & XẾP PHÒNG */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Yêu Cầu Đăng Ký Phòng Họp Chờ Lễ Tân Xác Nhận
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {bookings.filter((b) => b.status === "PENDING" || b.status === "APPROVING").length} yêu cầu đang chờ
                </span>
              </div>

              {bookings.filter((b) => b.status === "PENDING" || b.status === "APPROVING").length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-500">
                    Không có yêu cầu nào đang chờ duyệt. Tất cả phòng họp đã được Lễ Tân sắp xếp ổn định!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings
                    .filter((b) => b.status === "PENDING" || b.status === "APPROVING")
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-300 transition-all"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              booking.status === "APPROVING"
                                ? "bg-blue-100 text-blue-900 border-blue-300 animate-pulse"
                                : "bg-amber-100 text-amber-900 border-amber-300"
                            }`}>
                              {booking.status === "APPROVING" ? "⏳ Đang xác nhận..." : "Chờ Lễ Tân duyệt"}
                            </span>
                            <span className="text-xs font-extrabold text-[#006838]">
                              {booking.roomName}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              • {booking.bookingDate} ({booking.timeSlot})
                            </span>
                          </div>

                          <h4 className="text-base font-black text-slate-900">{booking.title}</h4>

                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
                            <span>Người đăng ký: <strong className="text-slate-900">{booking.bookerName}</strong> ({booking.department})</span>
                            <span>Tham dự: <strong className="text-slate-900">{booking.attendeesCount} người</strong></span>
                          </div>

                          {booking.notes && (
                            <p className="text-xs italic text-slate-500 bg-white/70 p-2 rounded-xl border border-slate-200/60 mt-1">
                              Ghi chú: {booking.notes}
                            </p>
                          )}
                        </div>

                        {/* Lễ Tân Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          <button
                            disabled={booking.status === "APPROVING"}
                            onClick={() => handleApproveBooking(booking.id)}
                            className={`px-4 py-2 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                              booking.status === "APPROVING"
                                ? "bg-blue-500 cursor-not-allowed opacity-80"
                                : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                            }`}
                          >
                            {booking.status === "APPROVING" ? (
                              <>
                                <span className="animate-spin text-sm">⏳</span>
                                <span>Đang xác nhận...</span>
                              </>
                            ) : (
                              <>
                                <IconCheck size={16} />
                                <span>Xác nhận &amp; Xếp phòng</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setReassignModalBooking(booking);
                              setNewAssignedRoomId(booking.roomId);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <IconEdit size={15} />
                            <span>Đổi Phòng Họp</span>
                          </button>

                          <button
                            onClick={() => {
                              setProposeModalBooking(booking);
                              setProposeForm({
                                timeSlot: booking.timeSlot,
                                roomId: booking.roomId,
                                note: "",
                              });
                            }}
                            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <IconRefresh size={15} />
                            <span>🔄 Đề Xuất Đổi Giờ / Phòng</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* SECTION 1.5: ĐỀ XUẤT THAY ĐỔI GIỜ / PHÒNG HỌP CHỜ NGƯỜI ĐẶT XÁC NHẬN */}
            {bookings.filter((b) => b.status === "RECEPTIONIST_PROPOSED").length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-white border border-purple-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-purple-600 animate-ping" />
                    <h3 className="text-base font-black text-purple-950 uppercase tracking-tight">
                      🔄 Đề Xuất Đổi Giờ / Phòng Của Lễ Tân — Chờ Người Đặt Xác Nhận
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {bookings.filter((b) => b.status === "RECEPTIONIST_PROPOSED").length} đề xuất chờ chốt
                  </span>
                </div>

                <div className="space-y-3">
                  {bookings
                    .filter((b) => b.status === "RECEPTIONIST_PROPOSED")
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-700 text-white text-[10px] font-black uppercase">
                              Lễ Tân Đã Đề Xuất Đổi
                            </span>
                            <h4 className="text-base font-black text-slate-900">{booking.title}</h4>
                            <span className="text-xs font-semibold text-slate-500">
                              (Người đặt: <strong className="text-slate-900">{booking.bookerName}</strong> - {booking.department})
                            </span>
                          </div>

                          {/* Original vs Proposed Details Comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Ban đầu đăng ký:</span>
                              <span className="font-bold text-slate-700">{booking.timeSlot}</span> tại <span className="font-bold text-slate-800">{booking.roomName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-black text-purple-700 uppercase block">2. 👉 Lễ Tân Đề Xuất Mới:</span>
                              <span className="font-extrabold text-purple-900">{booking.proposedTimeSlot || booking.timeSlot}</span> tại <span className="font-black text-[#006838]">{booking.proposedRoomName || booking.roomName}</span>
                            </div>
                          </div>

                          {booking.proposalNote && (
                            <p className="text-xs italic text-purple-900 font-medium bg-purple-100/50 p-2 rounded-xl border border-purple-200/60">
                              💬 <b>Lời nhắn từ Lễ Tân:</b> "{booking.proposalNote}"
                            </p>
                          )}
                        </div>

                        {/* User Confirmation Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleUserAcceptProposal(booking.id)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer animate-bounce"
                          >
                            <IconCheck size={16} />
                            <span>✅ Đồng Ý &amp; Xác Nhận Lịch Mới</span>
                          </button>

                          <button
                            onClick={() => handleUserDeclineProposal(booking.id)}
                            className="px-3.5 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <IconX size={15} />
                            <span>Hủy Đơn</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* SECTION 2: QUẢN LÝ & ĐIỀU CHỈNH PHÒNG HỌP ĐÃ XÁC NHẬN / ĐÃ TRẢ PHÒNG */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Lịch Họp Đã Phê Duyệt &amp; Sắp Xếp Bởi Lễ Tân
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setConfirmedSubTab("CONFIRMED")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      confirmedSubTab === "CONFIRMED"
                        ? "bg-[#006838] text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🟢 Đang họp ({bookings.filter((b) => b.status === "CONFIRMED").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmedSubTab("COMPLETED")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      confirmedSubTab === "COMPLETED"
                        ? "bg-slate-800 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ✓ Đã trả phòng ({bookings.filter((b) => b.status === "COMPLETED").length})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                      <th className="p-3">Thời Gian</th>
                      <th className="p-3">Phòng Họp</th>
                      <th className="p-3">Cuộc Họp</th>
                      <th className="p-3">Chủ Trì / Bộ Phận</th>
                      <th className="p-3">Trạng Thái</th>
                      <th className="p-3 text-center">Thao Tác Lễ Tân</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.filter((b) => b.status === confirmedSubTab).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
                          {confirmedSubTab === "CONFIRMED"
                            ? "Không có cuộc họp nào đang diễn ra."
                            : "Chưa có cuộc họp nào được trả phòng trong danh sách."}
                        </td>
                      </tr>
                    ) : (
                      bookings
                        .filter((b) => b.status === confirmedSubTab)
                        .map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50 font-medium">
                            <td className="p-3 font-bold text-blue-900">
                              {b.bookingDate}
                              <div className="text-[10px] text-slate-500 font-normal">{b.timeSlot}</div>
                            </td>
                            <td className="p-3 font-extrabold text-[#006838]">{b.roomName}</td>
                            <td className="p-3 font-bold text-slate-900">{b.title}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{b.bookerName}</div>
                              <div className="text-[10px] text-slate-500">{b.department}</div>
                            </td>
                            <td className="p-3">
                              {b.status === "CONFIRMED" ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006838] text-[10px] font-extrabold uppercase">
                                  ✓ Đã duyệt
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase">
                                  ⚪ Đã trả phòng
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center space-x-1.5">
                              {b.status === "CONFIRMED" ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setReassignModalBooking(b);
                                      setNewAssignedRoomId(b.roomId);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition-colors text-xs font-bold border border-blue-200 cursor-pointer"
                                  >
                                    Đổi phòng
                                  </button>
                                  <button
                                    onClick={() => handleCheckoutRoom(b.id)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-extrabold shadow-2xs cursor-pointer"
                                  >
                                    🟢 Trả phòng
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                  ✓ Hoàn tất
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>


            {/* SECTION 3: BÀN LỄ TÂN ĐÓN KHÁCH (CHECK-IN & CHECK-OUT KHÁCH ĐỐI TÁC) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Bàn Lễ Tân Đón Khách Đối Tác &amp; Cấp Thẻ Ra Vào
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {visitors.length} lượt khách trong ngày
                </span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                      <th className="p-3">Mã Thẻ</th>
                      <th className="p-3">Tên Khách / Công Ty</th>
                      <th className="p-3">Đón Tiếp Tại</th>
                      <th className="p-3">Thời Gian 到</th>
                      <th className="p-3">Trạng Thái</th>
                      <th className="p-3 text-center">Thao Tác Lễ Tân</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visitors.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#006838]">{v.badgeCode}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{v.visitorName}</div>
                          <div className="text-[10px] text-slate-500">{v.company}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{v.roomLocation}</div>
                          <div className="text-[10px] text-slate-500">Đón bởi: {v.hostName}</div>
                        </td>
                        <td className="p-3 font-bold text-slate-800">
                          {v.visitDate} ({v.expectedTime})
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${v.status === "CHECKED_IN"
                              ? "bg-emerald-100 text-[#006838]"
                              : v.status === "CHECKED_OUT"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-purple-100 text-purple-800"
                              }`}
                          >
                            {v.status === "CHECKED_IN"
                              ? "🟢 Đã Check-in"
                              : v.status === "CHECKED_OUT"
                                ? "⚪ Đã Check-out"
                                : "🟡 Chờ khách đến"}
                          </span>
                        </td>
                        <td className="p-3 text-center space-x-1.5">
                          {v.status === "EXPECTED" && (
                            <button
                              onClick={() => handleVisitorCheckIn(v.id)}
                              className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                            >
                              📥 Check-in (Khách đến)
                            </button>
                          )}
                          {v.status === "CHECKED_IN" && (
                            <button
                              onClick={() => handleVisitorCheckOut(v.id)}
                              className="px-3 py-1 rounded-xl bg-slate-700 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              📤 Check-out (Khách về)
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedVisitorBadge(v)}
                            className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-700 hover:text-white transition-colors border border-purple-200 cursor-pointer"
                          >
                            🪪 In Thẻ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: 📅 LỊCH TỔNG HỢP CUỘC HỌP (DUAL VIEW: GOOGLE CALENDAR MONTH & DAY LIST)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "CALENDAR" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Calendar Control Bar with View Mode Switcher */}
            <div className="px-3.5 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Left: View Mode Switcher & Date Navigation */}
              <div className="flex flex-wrap items-center gap-2">
                {/* View Mode Toggle: Tháng vs Ngày (Google Calendar) */}
                <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setCalendarViewMode("MONTH")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      calendarViewMode === "MONTH"
                        ? "bg-white text-[#006838] shadow-xs border border-slate-200/90"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <IconLayoutGrid size={14} />
                    <span>Lưới Tháng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalendarViewMode("DAY_LIST")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      calendarViewMode === "DAY_LIST"
                        ? "bg-[#006838] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <IconList size={14} />
                    <span>Xem Dạng Ngày (Google Calendar)</span>
                  </button>
                </div>

                {/* Date Stepper: Prev, Today, Next */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevDate}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer border border-slate-200"
                    title="Ngày trước"
                  >
                    <IconChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleTodayDate}
                    className="px-3 py-1.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <IconCalendar size={14} />
                    <span>Hôm nay</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextDate}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer border border-slate-200"
                    title="Ngày sau"
                  >
                    <IconChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Center: Current Date / Month Title */}
              <div className="text-center">
                {calendarViewMode === "MONTH" ? (
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight capitalize">
                      Tháng {parseVnDate(selectedCalendarDate).getMonth() + 1} Năm {parseVnDate(selectedCalendarDate).getFullYear()}
                    </h2>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Tổng hợp toàn bộ lịch họp các phòng trong tháng
                    </span>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#006838] tracking-tight flex items-center justify-center gap-1.5">
                      <IconCalendarEvent size={18} />
                      <span>{getDayNameVn(selectedCalendarDate)}, {selectedCalendarDate}</span>
                    </h2>
                    <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 mt-0.5 inline-block">
                      {bookings.filter((b) => b.bookingDate === selectedCalendarDate && (b.status === "CONFIRMED" || b.status === "COMPLETED")).length} cuộc họp đã xếp lịch
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Date Picker & Quick Note Button */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  min={getTodayIsoDate()}
                  value={selectedCalendarDate.split("/").reverse().join("-")}
                  onChange={(e) => {
                    if (e.target.value) {
                      if (e.target.value < getTodayIsoDate()) {
                        showToast("⚠️ Không thể chọn xem lịch ngày trong quá khứ!");
                        return;
                      }
                      const newFmt = e.target.value.split("-").reverse().join("/");
                      setSelectedCalendarDate(newFmt);
                      setBookingForm((prev) => ({ ...prev, bookingDate: e.target.value }));
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-[#006838]"
                />

                <button
                  type="button"
                  onClick={() => {
                    setBookingForm({
                      roomId: "room_1",
                      title: "",
                      bookerName: currentUser.name,
                      department: "Hành chính",
                      bookingDate: selectedCalendarDate.split("/").reverse().join("-"),
                      timeSlot: "09:00 - 10:30",
                      attendeesCount: 5,
                      notes: "",
                      needsTeaCoffee: true,
                      needsProjector: true,
                    });
                    setQuickNoteModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#006838] text-white font-extrabold text-xs hover:bg-[#00522c] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <IconPlus size={15} />
                  <span>Note cuộc họp mới</span>
                </button>
              </div>
            </div>

            {/* Quick 7-Day Week Strip (T2 -> CN) */}
            <div className="p-2 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                {weekDaysStrip.map((day) => (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedCalendarDate(day.dateStr);
                      setBookingForm((prev) => ({
                        ...prev,
                        bookingDate: day.dateStr.split("/").reverse().join("-"),
                      }));
                    }}
                    className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer border ${
                      day.isSelected
                        ? "bg-[#006838] text-white border-[#00522c] shadow-sm ring-2 ring-[#006838]/20"
                        : day.isToday
                        ? "bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase opacity-80">{day.dayNameShort}</span>
                    <span className="text-xs sm:text-sm font-black my-0.5">{day.dayNum}/{day.monthNum}</span>
                    {day.count > 0 ? (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                          day.isSelected ? "bg-white text-[#006838]" : "bg-emerald-600 text-white"
                        }`}
                      >
                        {day.count} họp
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium opacity-40">Trống</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Legends Bar */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center gap-2.5 text-[11px] font-bold text-slate-700">
              <span className="text-slate-500 uppercase text-[10px] font-black">Chú thích phòng:</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600 shadow-2xs" /> OTI / OTG</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 shadow-2xs" /> WORK</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-600 shadow-2xs" /> MEN USA</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-600 shadow-2xs" /> SOURCING</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-600 shadow-2xs" /> Phòng Chính</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-600 shadow-2xs" /> Phòng Họp Phụ</span>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                VIEW 1: 📋 GOOGLE CALENDAR DAY LIST / TIMELINE VIEW (XEM DẠNG LIST TRONG NGÀY)
               ════════════════════════════════════════════════════════════════ */}
            {calendarViewMode === "DAY_LIST" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Main Google Calendar Timeline (Col 8/12) */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-300 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {/* Day Timeline Header Banner */}
                  <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/10">
                        <IconCalendarTime size={22} />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                          <span>{getDayNameVn(selectedCalendarDate)}, {selectedCalendarDate}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            Timeline 24h
                          </span>
                        </h3>
                        <p className="text-xs text-slate-300 font-medium">
                          Danh sách chi tiết các cuộc họp theo khung giờ giống Google Calendar
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBookingForm({
                          roomId: "room_1",
                          title: "",
                          bookerName: currentUser.name,
                          department: "Hành chính",
                          bookingDate: selectedCalendarDate.split("/").reverse().join("-"),
                          timeSlot: "08:00 - 09:30",
                          attendeesCount: 5,
                          notes: "",
                          needsTeaCoffee: true,
                          needsProjector: true,
                        });
                        setQuickNoteModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <IconPlus size={14} />
                      <span>Thêm lịch họp</span>
                    </button>
                  </div>

                  {/* Hourly Schedule Timeline Slots */}
                  <div className="divide-y divide-slate-100">
                    {TIMELINE_HOURS.map((hourObj) => {
                      // Find all bookings starting in this hour on the selected date
                      const matchedBookings = bookings.filter((b) => {
                        if (b.bookingDate !== selectedCalendarDate) return false;
                        if (b.status !== "CONFIRMED" && b.status !== "COMPLETED") return false;
                        const startHourStr = b.timeSlot.split("-")[0]?.trim().split(":")[0];
                        const startHour = Number(startHourStr);
                        return startHour === hourObj.hour;
                      });

                      return (
                        <div
                          key={hourObj.hour}
                          className={`p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-colors ${
                            matchedBookings.length > 0 ? "bg-slate-50/50" : "hover:bg-emerald-50/20"
                          }`}
                        >
                          {/* Hour Axis Badge */}
                          <div className="w-16 sm:w-20 flex-shrink-0 flex items-center gap-2">
                            <span className="font-mono text-xs sm:text-sm font-black text-slate-600">
                              {hourObj.label}
                            </span>
                            <span className="h-2 w-2 rounded-full bg-slate-300" />
                          </div>

                          {/* Hour Content Canvas */}
                          <div className="flex-1 w-full space-y-2.5 min-w-0">
                            {matchedBookings.length > 0 ? (
                              matchedBookings.map((b) => (
                                <div
                                  key={b.id}
                                  onClick={() => setSelectedEventModal(b)}
                                  className={`p-3.5 rounded-2xl shadow-xs border transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer text-left space-y-2 ${getRoomColorStyle(
                                    b.roomName
                                  )}`}
                                >
                                  {/* Card Header: Room & Time Badge */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-xs">
                                        🏢 {b.roomName}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-mono font-black">
                                        ⏱️ {b.timeSlot}
                                      </span>
                                    </div>

                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                        b.status === "CONFIRMED"
                                          ? "bg-emerald-100 text-[#006838]"
                                          : b.status === "PENDING"
                                          ? "bg-amber-100 text-amber-900"
                                          : "bg-slate-100 text-slate-700"
                                      }`}
                                    >
                                      {b.status === "CONFIRMED" ? "✓ ĐÃ DUYỆT" : "⏳ CHỜ DUYỆT"}
                                    </span>
                                  </div>

                                  {/* Title & Booker Details */}
                                  <div>
                                    <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                                      {b.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/90 mt-1 font-medium">
                                      <span className="flex items-center gap-1">
                                        <IconUser size={13} />
                                        <span>Chủ trì: <strong>{b.bookerName}</strong> ({b.department})</span>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <IconUsers size={13} />
                                        <span>{b.attendeesCount} người tham gia</span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Notes & Equipment Chips */}
                                  {b.notes && (
                                    <p className="text-[11px] text-white/80 italic line-clamp-1">
                                      📝 {b.notes}
                                    </p>
                                  )}

                                  {/* Footer Action */}
                                  <div className="pt-1 flex items-center justify-between text-[11px] text-white/80">
                                    <span>Bấm để xem chi tiết cuộc họp</span>
                                    <span className="font-bold underline text-white">Xem chi tiết →</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              /* Empty Hour Slot - Quick Click-to-Book (Google Calendar Feature) */
                              <button
                                type="button"
                                onClick={() => {
                                  setBookingForm({
                                    roomId: "room_1",
                                    title: "",
                                    bookerName: currentUser.name,
                                    department: "Hành chính",
                                    bookingDate: selectedCalendarDate.split("/").reverse().join("-"),
                                    timeSlot: hourObj.defaultSlot,
                                    attendeesCount: 6,
                                    notes: "",
                                    needsTeaCoffee: true,
                                    needsProjector: true,
                                  });
                                  setQuickNoteModalOpen(true);
                                }}
                                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#006838] hover:bg-emerald-50/40 text-slate-400 hover:text-[#006838] font-bold text-xs flex items-center justify-between transition-all group cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#006838]" />
                                  <span>Khung giờ trống ({hourObj.label})</span>
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#006838] group-hover:underline">
                                  + Đặt phòng họp khung giờ này
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Sidebar: Daily Room Availability Matrix (Col 4/12) */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Daily Room Matrix Card */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <IconBuilding size={18} className="text-[#006838]" />
                        <h3 className="text-sm font-black text-slate-900">
                          Phân Bổ 6 Phòng Họp Trong Ngày
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {selectedCalendarDate}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {rooms.map((room) => {
                        const roomBookingsToday = bookings.filter(
                          (b) => b.bookingDate === selectedCalendarDate && b.roomId === room.id && (b.status === "CONFIRMED" || b.status === "COMPLETED")
                        );

                        return (
                          <div
                            key={room.id}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/30 transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#006838] flex-shrink-0" />
                                <h4 className="text-xs font-black text-slate-900 truncate">
                                  {room.name}
                                </h4>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex-shrink-0">
                                Sức chứa: {room.capacity}
                              </span>
                            </div>

                            {roomBookingsToday.length > 0 ? (
                              <div className="space-y-1">
                                {roomBookingsToday.map((rb) => (
                                  <div
                                    key={rb.id}
                                    onClick={() => setSelectedEventModal(rb)}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between cursor-pointer hover:border-[#006838] transition"
                                  >
                                    <div className="min-w-0 truncate">
                                      <span className="font-bold text-[#006838] mr-1">{rb.timeSlot}:</span>
                                      <span className="text-slate-700 truncate">{rb.title}</span>
                                    </div>
                                    <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded ml-1">
                                      {rb.bookerName}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-xl">
                                <span className="font-bold">✓ Cả ngày còn trống</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBookingForm({
                                      roomId: room.id,
                                      title: "",
                                      bookerName: currentUser.name,
                                      department: "Hành chính",
                                      bookingDate: selectedCalendarDate.split("/").reverse().join("-"),
                                      timeSlot: "09:00 - 10:30",
                                      attendeesCount: room.capacity,
                                      notes: "",
                                      needsTeaCoffee: true,
                                      needsProjector: true,
                                    });
                                    setQuickNoteModalOpen(true);
                                  }}
                                  className="text-[10px] font-black text-[#006838] hover:underline cursor-pointer"
                                >
                                  + Đặt phòng này
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reception Notice Box */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1 text-slate-700">
                    <div className="font-black text-[#006838] flex items-center gap-1.5">
                      <span>💡 Lưu ý Lễ Tân &amp; CBCNV:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      Mọi cuộc họp được đăng ký sẽ tự động gửi thông báo đến Bàn Lễ Tân. Vui lòng kiểm tra màn hình đón khách và chuẩn bị nước trà trước 15 phút.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                VIEW 2: 📅 MONTHLY CALENDAR GRID (XEM DẠNG LƯỚI THÁNG)
               ════════════════════════════════════════════════════════════════ */}
            {calendarViewMode === "MONTH" && (
              <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
                {/* Day Name Headers */}
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-300 text-center text-[11px] font-black text-blue-900 uppercase">
                  <div className="py-1.5 border-r border-slate-200">CN</div>
                  <div className="py-1.5 border-r border-slate-200">THỨ 2</div>
                  <div className="py-1.5 border-r border-slate-200">THỨ 3</div>
                  <div className="py-1.5 border-r border-slate-200">THỨ 4</div>
                  <div className="py-1.5 border-r border-slate-200">THỨ 5</div>
                  <div className="py-1.5 border-r border-slate-200">THỨ 6</div>
                  <div className="py-1.5">THỨ 7</div>
                </div>

                {/* 35 Calendar Day Cells (5 Rows x 7 Columns) */}
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 bg-slate-100">
                  {augustCalendarDays.map((dayObj) => (
                    <div
                      key={dayObj.idx}
                      onClick={() => {
                        setSelectedCalendarDate(dayObj.dateStr);
                        setBookingForm({
                          ...bookingForm,
                          bookingDate: dayObj.dateStr.split("/").reverse().join("-"),
                        });
                      }}
                      className={`min-h-[65px] sm:min-h-[78px] md:min-h-[85px] p-1 transition-all flex flex-col justify-between cursor-pointer ${
                        dayObj.isCurrentMonth ? "bg-white" : "bg-slate-50/60 text-slate-300"
                      } ${
                        dayObj.dateStr === selectedCalendarDate
                          ? "bg-emerald-50/60 ring-2 ring-[#006838] ring-inset"
                          : dayObj.isToday
                          ? "bg-blue-50/40 ring-2 ring-blue-600 ring-inset"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-[10px] font-black inline-flex items-center justify-center rounded-full w-5 h-5 ${
                            dayObj.isToday
                              ? "bg-blue-700 text-white shadow-2xs"
                              : dayObj.isCurrentMonth
                              ? "text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          {dayObj.displayDay}
                        </span>
                        {dayObj.isToday && (
                          <span className="text-[8px] font-extrabold uppercase text-blue-700 bg-blue-100 px-1 py-0.2 rounded-full">
                            Hôm nay
                          </span>
                        )}
                      </div>

                      {/* Day Event Cards Stack */}
                      <div className="space-y-0.5 overflow-y-auto max-h-[60px] flex-1">
                        {dayObj.dayBookings.map((b) => (
                          <div
                            key={b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventModal(b);
                            }}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold leading-tight shadow-2xs transition-all hover:scale-[1.02] cursor-pointer truncate ${getRoomColorStyle(
                              b.roomName
                            )}`}
                            title={`${b.timeSlot} | ${b.roomName} - ${b.title}`}
                          >
                            <span className="opacity-90 font-mono text-[8px] mr-1">
                              {b.timeSlot.split(" - ")[0]}
                            </span>
                            <span className="truncate">{b.roomName.replace("Phòng Họp ", "")}: {b.title}</span>
                          </div>
                        ))}
                      </div>

                      {/* Day Action Buttons: Switch to Day View or + Note */}
                      <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 pt-0.5 border-t border-slate-100/80">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCalendarDate(dayObj.dateStr);
                            setCalendarViewMode("DAY_LIST");
                          }}
                          className="hover:text-blue-700 transition-colors"
                          title="Xem danh sách chi tiết ngày này"
                        >
                          📋 Xem ngày
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCalendarDate(dayObj.dateStr);
                            setBookingForm({
                              roomId: "room_1",
                              title: "",
                              bookerName: currentUser.name,
                              department: "Hành chính",
                              bookingDate: dayObj.dateStr.split("/").reverse().join("-"),
                              timeSlot: "09:00 - 10:30",
                              attendeesCount: 5,
                              notes: "",
                              needsTeaCoffee: true,
                              needsProjector: true,
                            });
                            setQuickNoteModalOpen(true);
                          }}
                          className="hover:text-[#006838] transition-colors"
                        >
                          + Note
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 1: FORM ĐẶT PHÒNG HỌP & TIME SLOTS
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "BOOKING" && (
          <form onSubmit={handleBookRoomSubmit} className="space-y-6 animate-in fade-in duration-200">
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-[#e6f4ed] text-[#006838] flex items-center justify-center border border-emerald-100">
                  <IconCalendar size={18} />
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                  📋 THÔNG TIN ĐĂNG KÝ PHÒNG HỌP
                </h2>
              </div>

              {/* Grid 1: Basic Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chọn Phòng họp */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Phòng họp <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={bookingForm.roomId}
                    onChange={(e) => setBookingForm({ ...bookingForm, roomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id} disabled={r.isLocked}>
                        {r.name} ({r.capacity} người) {r.isLocked ? "- [Đang khóa bảo trì]" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tiêu đề cuộc họp */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Tiêu đề cuộc họp / Ghi chú <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên cuộc họp..."
                    value={bookingForm.title}
                    onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                {/* Người chủ trì/đặt phòng */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Người chủ trì <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.bookerName}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                {/* Bộ phận */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Bộ phận <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={bookingForm.department}
                    onChange={(e) => setBookingForm({ ...bookingForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 2: Date & Time Slots Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Ngày họp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={getTodayIsoDate()}
                    value={bookingForm.bookingDate}
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (selected && selected < getTodayIsoDate()) {
                        showToast("⚠️ Không thể chọn ngày họp trong quá khứ! Vui lòng chọn từ ngày hôm nay trở đi.");
                        setBookingForm({ ...bookingForm, bookingDate: getTodayIsoDate() });
                      } else {
                        setBookingForm({ ...bookingForm, bookingDate: selected });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Khung giờ họp <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={isCustomTimeSlot ? "CUSTOM" : bookingForm.timeSlot}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM") {
                        setIsCustomTimeSlot(true);
                        setBookingForm({ ...bookingForm, timeSlot: `${customStartTime} - ${customEndTime}` });
                      } else {
                        setIsCustomTimeSlot(false);
                        setBookingForm({ ...bookingForm, timeSlot: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  >
                    <option value="08:00 - 09:30">08:00 - 09:30 (Sáng)</option>
                    <option value="09:30 - 11:30">09:30 - 11:30 (Sáng)</option>
                    <option value="13:30 - 15:00">13:30 - 15:00 (Chiều)</option>
                    <option value="15:00 - 17:00">15:00 - 17:00 (Chiều)</option>
                    <option value="08:00 - 17:00">Cả ngày (08:00 - 17:00)</option>
                    <option value="CUSTOM">⚙️ Tùy chỉnh giờ (Nhập tự do)...</option>
                  </select>

                  {isCustomTimeSlot && (
                    <div className="grid grid-cols-2 gap-2 pt-1.5 animate-fadeIn">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Từ giờ:</span>
                        <input
                          type="time"
                          value={customStartTime}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            setCustomStartTime(newStart);
                            setBookingForm({ ...bookingForm, timeSlot: `${newStart} - ${customEndTime}` });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-emerald-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Đến giờ:</span>
                        <input
                          type="time"
                          value={customEndTime}
                          onChange={(e) => {
                            const newEnd = e.target.value;
                            setCustomEndTime(newEnd);
                            setBookingForm({ ...bookingForm, timeSlot: `${customStartTime} - ${newEnd}` });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-emerald-50/50"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Số người tham dự</label>
                  <input
                    type="number"
                    min={1}
                    value={bookingForm.attendeesCount}
                    onChange={(e) => setBookingForm({ ...bookingForm, attendeesCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-[#006838] text-white text-xs font-extrabold hover:bg-[#00522c] transition-colors shadow-md shadow-emerald-900/20 flex items-center gap-2 cursor-pointer"
                >
                  <IconCheck size={16} />
                  <span>🚀 Đăng ký đặt phòng</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 2: DANH SÁCH PHÒNG HỌP & ADMIN LOCK TOGGLE
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "ROOMS" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => {
                const isOccupiedToday = occupiedRoomIdsToday.has(room.id);
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomForDetail(room)}
                    className={`p-5 rounded-2xl bg-white border shadow-xs transition-all flex flex-col justify-between gap-4 cursor-pointer hover:shadow-md hover:border-[#006838] group ${room.isLocked
                      ? "border-rose-300 bg-rose-50/20"
                      : isOccupiedToday
                        ? "border-amber-300 bg-amber-50/10"
                        : "border-slate-200/80 hover:border-[#006838]/60"
                      }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-[#006838] transition-colors">{room.name}</h3>
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <IconMapPin size={13} className="text-slate-400" />
                            {room.location}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${room.isLocked
                            ? "bg-rose-100 text-rose-700"
                            : isOccupiedToday
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-[#006838]"
                            }`}
                        >
                          {room.isLocked ? "🔒 Khóa bảo trì" : isOccupiedToday ? "⏳ Đang họp" : "✓ Phòng trống"}
                        </span>
                      </div>

                      {/* Room Photo Preview Thumbnail */}
                      <div className="relative h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 group-hover:border-emerald-300 transition-colors">
                        <img
                          src={`/images/rooms/${room.id}/1.jpg`}
                          alt={room.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.tried) {
                              target.dataset.tried = 'true';
                              target.src = `/images/rooms/${room.id}/room1.jpg`;
                            } else {
                              target.style.display = 'none';
                              if (target.nextElementSibling) {
                                (target.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }
                          }}
                        />
                        <div className="hidden w-full h-full bg-gradient-to-br from-emerald-900 via-[#006838] to-slate-900 text-white flex-col items-center justify-center p-3 text-center">
                          <IconBuilding size={28} className="text-emerald-300 mb-1 opacity-90" />
                          <span className="text-xs font-black tracking-tight">{room.name}</span>
                          <span className="text-[10px] text-emerald-200/80 font-medium">Click xem hình ảnh &amp; thông tin chi tiết</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
                          <IconUsers size={14} />
                          <span>Sức chứa: {room.capacity} người</span>
                        </span>
                      </div>

                      {/* Equipment Tags */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 block">Trang thiết bị có sẵn:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {room.equipment.map((eq, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#006838] flex items-center gap-1 group-hover:underline">
                        <span>🔍 Xem chi tiết phòng họp</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRoomLock(room.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer ${room.isLocked
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-100 text-slate-700 hover:bg-rose-600 hover:text-white"
                          }`}
                      >
                        {room.isLocked ? (
                          <>
                            <IconLockOpen size={14} />
                            <span>Mở lại phòng</span>
                          </>
                        ) : (
                          <>
                            <IconLock size={14} />
                            <span>Khóa bảo trì</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 3: ĐÓN KHÁCH ĐỐI TÁC & CẤP THẺ KHÁCH (VISITOR BADGE GENERATOR)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "VISITORS" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Registration Form */}
            <form onSubmit={handleRegisterVisitorSubmit} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
                  <IconId size={18} />
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                  🪪 ĐĂNG KÝ ĐÓN KHÁCH NGOÀI &amp; CẤP THẺ RA VÀO
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Họ tên khách mời <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ tên khách..."
                    value={visitorForm.visitorName}
                    onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Đơn vị / Công ty <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên công ty/đối tác..."
                    value={visitorForm.company}
                    onChange={(e) => setVisitorForm({ ...visitorForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Số CMND / CCCD</label>
                  <input
                    type="text"
                    placeholder="Nhập số CCCD/Hộ chiếu..."
                    value={visitorForm.idCard}
                    onChange={(e) => setVisitorForm({ ...visitorForm, idCard: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Người đón tiếp</label>
                  <input
                    type="text"
                    required
                    value={visitorForm.hostName}
                    onChange={(e) => setVisitorForm({ ...visitorForm, hostName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Khu vực làm việc / Phòng họp</label>
                  <select
                    value={visitorForm.roomLocation}
                    onChange={(e) => setVisitorForm({ ...visitorForm, roomLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Ngày đến</label>
                  <input
                    type="date"
                    min={getTodayIsoDate()}
                    value={visitorForm.visitDate}
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (selected && selected < getTodayIsoDate()) {
                        showToast("⚠️ Không thể chọn ngày đón khách trong quá khứ! Vui lòng chọn từ ngày hôm nay trở đi.");
                        setVisitorForm({ ...visitorForm, visitDate: getTodayIsoDate() });
                      } else {
                        setVisitorForm({ ...visitorForm, visitDate: selected });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Giờ dự kiến đến</label>
                  <input
                    type="time"
                    value={visitorForm.expectedTime}
                    onChange={(e) => setVisitorForm({ ...visitorForm, expectedTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-extrabold hover:bg-purple-800 transition-colors shadow-md shadow-purple-900/20 flex items-center gap-2 cursor-pointer"
                >
                  <IconId size={16} />
                  <span>🪪 Đăng ký &amp; Xuất Thẻ Khách</span>
                </button>
              </div>
            </form>

            {/* Visitors Table List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase">Danh sách khách đăng ký đón tiếp</h3>
                <span className="text-xs font-bold text-slate-500">Tổng cộng: {visitors.length} lượt khách</span>
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                      <th className="p-3">Mã Thẻ</th>
                      <th className="p-3">Họ Tên Khách</th>
                      <th className="p-3">Công Ty / Đơn Vị</th>
                      <th className="p-3">Người Đón Tiếp</th>
                      <th className="p-3">Địa Điểm</th>
                      <th className="p-3">Thời Gian</th>
                      <th className="p-3 text-center">Thẻ Khách</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visitors.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#006838]">{v.badgeCode}</td>
                        <td className="p-3 font-bold text-slate-900">{v.visitorName}</td>
                        <td className="p-3 font-semibold text-slate-700">{v.company}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{v.hostName}</div>
                          <div className="text-[10px] text-slate-500">{v.department}</div>
                        </td>
                        <td className="p-3 font-medium text-slate-700">{v.roomLocation}</td>
                        <td className="p-3 font-bold text-slate-800">{v.visitDate} ({v.expectedTime})</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedVisitorBadge(v)}
                            className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-700 hover:text-white transition-colors text-xs font-bold border border-purple-200 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <IconQrcode size={14} />
                            <span>In Thẻ</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


      </main>

      {/* ════════════════════════════════════════════════════════════════
          MODAL POPUP: QUICK NOTE / BOOKING MODAL FOR CALENDAR CELL
         ════════════════════════════════════════════════════════════════ */}
      {quickNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-[#006838] to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconNotes size={20} />
                <h3 className="text-base font-black uppercase tracking-tight">Thêm ghi chú cuộc họp ngày {selectedCalendarDate}</h3>
              </div>
              <button onClick={() => setQuickNoteModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleBookRoomSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Tiêu đề cuộc họp / Nội dung ghi chú *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Họp triển khai Kaizen A1..."
                  value={bookingForm.title}
                  onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold outline-none focus:border-[#006838] bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Phòng họp</label>
                  <select
                    value={bookingForm.roomId}
                    onChange={(e) => setBookingForm({ ...bookingForm, roomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Khung giờ họp</label>
                  <select
                    value={isCustomTimeSlot ? "CUSTOM" : bookingForm.timeSlot}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM") {
                        setIsCustomTimeSlot(true);
                        setBookingForm({ ...bookingForm, timeSlot: `${customStartTime} - ${customEndTime}` });
                      } else {
                        setIsCustomTimeSlot(false);
                        setBookingForm({ ...bookingForm, timeSlot: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  >
                    <option value="08:00 - 09:30">08:00 - 09:30 (Sáng)</option>
                    <option value="09:30 - 11:30">09:30 - 11:30 (Sáng)</option>
                    <option value="13:30 - 15:00">13:30 - 15:00 (Chiều)</option>
                    <option value="15:00 - 17:00">15:00 - 17:00 (Chiều)</option>
                    <option value="08:00 - 17:00">Cả ngày (08:00 - 17:00)</option>
                    <option value="CUSTOM">⚙️ Tùy chỉnh giờ (Nhập tự do)...</option>
                  </select>

                  {isCustomTimeSlot && (
                    <div className="grid grid-cols-2 gap-2 pt-1.5 animate-fadeIn">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Từ giờ:</span>
                        <input
                          type="time"
                          value={customStartTime}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            setCustomStartTime(newStart);
                            setBookingForm({ ...bookingForm, timeSlot: `${newStart} - ${customEndTime}` });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-emerald-50/50"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Đến giờ:</span>
                        <input
                          type="time"
                          value={customEndTime}
                          onChange={(e) => {
                            const newEnd = e.target.value;
                            setCustomEndTime(newEnd);
                            setBookingForm({ ...bookingForm, timeSlot: `${customStartTime} - ${newEnd}` });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-emerald-50/50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Người chủ trì</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.bookerName}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold outline-none focus:border-[#006838]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Bộ phận *</label>
                  <select
                    value={bookingForm.department}
                    onChange={(e) => setBookingForm({ ...bookingForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Ghi chú bổ sung</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú chi tiết nội dung cuộc họp..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium outline-none focus:border-[#006838]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#006838] text-white font-extrabold hover:bg-[#00522c] cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <IconCheck size={16} />
                  <span>Lưu cuộc họp vào D1</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL POPUP: EVENT DETAIL MODAL (KHI CLICK VÀO CUỘC HỌP TRÊN LỊCH)
         ════════════════════════════════════════════════════════════════ */}
      {selectedEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCalendar size={20} />
                <h3 className="text-base font-black tracking-tight">Chi Tiết Cuộc Họp</h3>
              </div>
              <button onClick={() => setSelectedEventModal(null)} className="text-white/80 hover:text-white cursor-pointer">
                <IconX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Tiêu đề cuộc họp</span>
                <h4 className="text-base font-black text-slate-900">{selectedEventModal.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700 font-medium">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Phòng họp:</span>
                  <span className="font-extrabold text-[#006838]">{selectedEventModal.roomName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Thời gian:</span>
                  <span className="font-extrabold text-blue-900">{selectedEventModal.bookingDate} ({selectedEventModal.timeSlot})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Người chủ trì:</span>
                  <span className="font-bold text-slate-900">{selectedEventModal.bookerName} ({selectedEventModal.department})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Số người tham dự:</span>
                  <span className="font-bold text-slate-900">{selectedEventModal.attendeesCount} người</span>
                </div>
              </div>

              {selectedEventModal.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Ghi chú nội dung:</span>
                  <p className="text-slate-800 font-medium mt-0.5">{selectedEventModal.notes}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#006838] text-[10px] font-extrabold">
                  ✓ Đã đồng bộ D1 Database
                </span>
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL POPUP: DIGITAL VISITOR BADGE (THẺ KHÁCH BẢO VỆ CẤP)
         ════════════════════════════════════════════════════════════════ */}
      {selectedVisitorBadge && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Badge Card Container */}
            <div className="p-6 bg-gradient-to-b from-[#006838] to-slate-900 text-white text-center space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <img src="/images/tbs-logo.png" alt="TBS" className="h-6 w-auto brightness-200" />
                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">THẺ KHÁCH / VISITOR</span>
              </div>

              {/* Visitor QR Code Simulation */}
              <div className="w-32 h-32 mx-auto bg-white p-2.5 rounded-2xl shadow-md flex items-center justify-center">
                <div className="w-full h-full border-2 border-dashed border-[#006838] rounded-xl flex flex-col items-center justify-center text-[#006838] font-mono text-[10px] font-bold">
                  <IconQrcode size={48} />
                  <span>{selectedVisitorBadge.badgeCode}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight">{selectedVisitorBadge.visitorName}</h3>
                <p className="text-xs text-emerald-200 font-semibold">{selectedVisitorBadge.company}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/10 text-left text-xs space-y-1.5 border border-white/10">
                <div className="flex justify-between">
                  <span className="text-slate-300">Người tiếp đón:</span>
                  <span className="font-bold text-white">{selectedVisitorBadge.hostName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Địa điểm họp:</span>
                  <span className="font-bold text-emerald-200">{selectedVisitorBadge.roomLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Ngày giờ đến:</span>
                  <span className="font-bold text-white">{selectedVisitorBadge.visitDate} ({selectedVisitorBadge.expectedTime})</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <IconPrinter size={15} />
                  <span>In Thẻ Đeo</span>
                </button>
                <button
                  onClick={() => setSelectedVisitorBadge(null)}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL POPUP: LỄ TÂN ĐỔI PHÒNG HỌP (ROOM RE-ASSIGNMENT MODAL)
         ════════════════════════════════════════════════════════════════ */}
      {reassignModalBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-blue-800 to-[#006838] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconEdit size={20} />
                <h3 className="text-base font-black uppercase tracking-tight">👩‍💼 Lễ Tân Sắp Xếp / Đổi Phòng Họp</h3>
              </div>
              <button onClick={() => setReassignModalBooking(null)} className="text-white/80 hover:text-white cursor-pointer">
                <IconX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Cuộc họp cần điều chuyển</span>
                <h4 className="text-sm font-black text-slate-900 mt-0.5">{reassignModalBooking.title}</h4>
                <p className="text-slate-600 font-semibold mt-1">
                  Đăng ký bởi: {reassignModalBooking.bookerName} ({reassignModalBooking.department}) • {reassignModalBooking.attendeesCount} người
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 block text-xs">
                  Chọn phòng họp mới thích hợp:
                </label>
                <select
                  value={newAssignedRoomId}
                  onChange={(e) => setNewAssignedRoomId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs outline-none focus:border-[#006838] bg-white cursor-pointer"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id} disabled={r.isLocked}>
                      {r.name} (Sức chứa {r.capacity} người - {r.location}) {r.isLocked ? "[Khóa bảo trì]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignModalBooking(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReassignRoom}
                  className="px-6 py-2 rounded-xl bg-[#006838] text-white font-extrabold hover:bg-[#00522c] cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <IconCheck size={16} />
                  <span>Xác nhận Đổi &amp; Xếp Lịch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL POPUP: LỄ TÂN ĐỀ XUẤT ĐỔI GIỜ / PHÒNG HỌP (COUNTER-PROPOSAL MODAL)
         ════════════════════════════════════════════════════════════════ */}
      {proposeModalBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-purple-800 to-[#006838] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconRefresh size={20} />
                <h3 className="text-base font-black uppercase tracking-tight">Lễ Tân Đề Xuất Thay Đổi</h3>
              </div>
              <button onClick={() => setProposeModalBooking(null)} className="text-white/80 hover:text-white cursor-pointer">
                <IconX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                <span className="text-[10px] font-bold text-purple-800 uppercase block">Cuộc họp ban đầu</span>
                <h4 className="text-sm font-black text-slate-900">{proposeModalBooking.title}</h4>
                <p className="text-slate-600 font-semibold">
                  Người đăng ký: {proposeModalBooking.bookerName} ({proposeModalBooking.department})
                </p>
                <div className="text-xs font-bold text-purple-900 mt-1">
                  Khung giờ cũ: {proposeModalBooking.timeSlot} • Phòng: {proposeModalBooking.roomName}
                </div>
              </div>

              {/* Select Proposed Time Slot */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 block text-xs">
                  1. Lựa chọn Khung Giờ Đề Xuất Mới:
                </label>
                <select
                  value={proposeForm.timeSlot}
                  onChange={(e) => setProposeForm({ ...proposeForm, timeSlot: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs outline-none focus:border-[#006838] bg-white cursor-pointer"
                >
                  <option value="07:00 - 08:30">07:00 - 08:30</option>
                  <option value="08:00 - 09:30">08:00 - 09:30</option>
                  <option value="09:30 - 11:30">09:30 - 11:30</option>
                  <option value="11:00 - 12:30">11:00 - 12:30</option>
                  <option value="13:30 - 15:00">13:30 - 15:00</option>
                  <option value="15:00 - 17:00">15:00 - 17:00</option>
                  <option value="17:00 - 18:30">17:00 - 18:30</option>
                </select>
              </div>

              {/* Select Proposed Room */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 block text-xs">
                  2. Lựa chọn Phòng Họp Đề Xuất Mới:
                </label>
                <select
                  value={proposeForm.roomId}
                  onChange={(e) => setProposeForm({ ...proposeForm, roomId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs outline-none focus:border-[#006838] bg-white cursor-pointer"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id} disabled={r.isLocked}>
                      {r.name} (Sức chứa {r.capacity} người - {r.location}) {r.isLocked ? "[Khóa bảo trì]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Proposal Reason / Note */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 block text-xs">
                  3. Lời nhắn / Lý do đề xuất đổi:
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập lý do thay đổi..."
                  value={proposeForm.note}
                  onChange={(e) => setProposeForm({ ...proposeForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs outline-none focus:border-[#006838] bg-slate-50/50"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProposeModalBooking(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSendCounterProposal}
                  className="px-6 py-2 rounded-xl bg-purple-700 text-white font-extrabold hover:bg-purple-800 cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <IconSend size={16} />
                  <span>Gửi Đề Xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL POPUP: CHI TIẾT PHÒNG HỌP & HÌNH ẢNH & NÚT ĐẶT PHÒNG
         ════════════════════════════════════════════════════════════════ */}
      {selectedRoomForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#006838] via-[#005a30] to-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/10">
                  <IconBuilding size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <span>{selectedRoomForDetail.name}</span>
                  </h3>
                  <p className="text-xs text-emerald-100/90 font-medium flex items-center gap-1">
                    <IconMapPin size={13} />
                    <span>{selectedRoomForDetail.location}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRoomForDetail(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Interactive Room Photo Gallery & Slider */}
              <div className="space-y-2.5">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group">
                  {roomGalleryImages.length > 0 ? (
                    <img
                      src={roomGalleryImages[activeImageIdx] || `/images/rooms/${selectedRoomForDetail.id}/1.jpg`}
                      alt={selectedRoomForDetail.name}
                      className="w-full h-64 sm:h-72 object-cover transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}

                  {/* Fallback Banner */}
                  <div
                    className={`w-full h-64 sm:h-72 bg-gradient-to-br from-slate-900 via-[#006838] to-emerald-950 text-white flex-col items-center justify-center p-6 text-center space-y-3 ${
                      roomGalleryImages.length > 0 ? 'hidden' : 'flex'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/10">
                      <IconBuilding size={32} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{selectedRoomForDetail.name}</h4>
                      <p className="text-xs text-emerald-200 mt-0.5">{selectedRoomForDetail.location}</p>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  {roomGalleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIdx((prev) => (prev === 0 ? roomGalleryImages.length - 1 : prev - 1))
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-[#006838] text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-sm"
                        title="Ảnh trước"
                      >
                        <IconChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIdx((prev) => (prev === roomGalleryImages.length - 1 ? 0 : prev + 1))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-[#006838] text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-sm"
                        title="Ảnh tiếp theo"
                      >
                        <IconChevronRight size={18} />
                      </button>
                    </>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                        selectedRoomForDetail.isLocked
                          ? "bg-rose-600 text-white"
                          : occupiedRoomIdsToday.has(selectedRoomForDetail.id)
                          ? "bg-amber-500 text-white"
                          : "bg-[#006838] text-white"
                      }`}
                    >
                      {selectedRoomForDetail.isLocked
                        ? "Bảo trì"
                        : occupiedRoomIdsToday.has(selectedRoomForDetail.id)
                        ? "Đang có lịch họp"
                        : "Phòng trống"}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                      Sức chứa: {selectedRoomForDetail.capacity} người
                    </span>
                    {roomGalleryImages.length > 1 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono border border-white/20">
                        {activeImageIdx + 1} / {roomGalleryImages.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Horizontal Thumbnail Carousel Strip */}
                {roomGalleryImages.length > 1 && (
                  <div className="space-y-1.5 pt-0.5">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Hình ảnh phòng họp ({roomGalleryImages.length})
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {roomGalleryImages.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                            idx === activeImageIdx
                              ? "border-[#006838] ring-2 ring-[#006838]/30 shadow-xs"
                              : "border-slate-200 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Góc ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Room Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Capacity & Location card */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <h4 className="text-xs font-black text-[#006838] uppercase tracking-tight flex items-center gap-1.5">
                    <IconUsers size={16} />
                    <span>Thông tin chung</span>
                  </h4>
                  <div className="space-y-1 text-slate-700 font-semibold">
                    <p>• <strong>Vị trí:</strong> {selectedRoomForDetail.location}</p>
                    <p>• <strong>Sức chứa tối đa:</strong> {selectedRoomForDetail.capacity} người</p>
                    <p>• <strong>Đơn vị quản lý:</strong> Khối Hành Chánh TBS Group</p>
                  </div>
                </div>

                {/* Equipment card */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-tight flex items-center gap-1.5">
                    <IconDeviceTv size={16} />
                    <span>Trang thiết bị có sẵn</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRoomForDetail.equipment.map((eq, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white border border-blue-200 text-blue-900 font-extrabold text-[11px] shadow-2xs"
                      >
                        ✓ {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Today's Meetings Schedule for this room */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase flex items-center justify-between">
                  <span>📅 Lịch họp tại {selectedRoomForDetail.name} hôm nay</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {bookings.filter((b) => b.roomId === selectedRoomForDetail.id && b.bookingDate === getTodayVnDate()).length} cuộc họp
                  </span>
                </h4>

                {bookings.filter((b) => b.roomId === selectedRoomForDetail.id && b.bookingDate === getTodayVnDate()).length === 0 ? (
                  <div className="p-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 font-medium">
                    Chưa có lịch họp nào được xếp cho phòng này hôm nay. Phòng đang trống và sẵn sàng đăng ký!
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {bookings
                      .filter((b) => b.roomId === selectedRoomForDetail.id && b.bookingDate === getTodayVnDate())
                      .map((b) => (
                        <div
                          key={b.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 truncate">
                            <span className="font-mono font-bold text-[#006838] mr-2">{b.timeSlot}</span>
                            <span className="font-bold text-slate-900 truncate">{b.title}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex-shrink-0">
                            {b.bookerName} ({b.department})
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer with "Đặt phòng" Button */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedRoomForDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer text-xs"
              >
                Đóng
              </button>

              <button
                type="button"
                disabled={selectedRoomForDetail.isLocked}
                onClick={() => {
                  const roomToBook = selectedRoomForDetail;
                  setBookingForm((prev) => ({
                    ...prev,
                    roomId: roomToBook.id,
                  }));
                  setSelectedRoomForDetail(null);
                  setActiveTab("BOOKING");
                  showToast(`👉 Đã tự động chọn "${roomToBook.name}"! Vui lòng điền tiêu đề & hoàn tất đăng ký.`);
                }}
                className={`px-6 py-2.5 rounded-xl text-white font-black text-xs transition shadow-md flex items-center gap-2 cursor-pointer ${selectedRoomForDetail.isLocked
                  ? "bg-slate-400 cursor-not-allowed opacity-70"
                  : "bg-[#006838] hover:bg-[#00522c] shadow-emerald-950/20 active:scale-95"
                  }`}
              >
                <IconCalendarEvent size={18} />
                <span>📅 ĐẶT PHÒNG HỌP NÀY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <IconCheck size={16} />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-3 px-6 border-t border-slate-200 text-xs text-slate-500 text-center bg-white">
        <span>© 2026 TBS Group System - Văn Phòng Chuỗi SKECHERS. Tất cả các quyền được bảo lưu.</span>
      </footer>
    </div>
  );
}
