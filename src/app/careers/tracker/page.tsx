"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIChatBubble from "@/components/recruitment/AIChatBubble";
import { trackApplication, scheduleInterview, fetchInterviewSlots, respondToInterview, type JobApplication, type InterviewSlot } from "@/lib/api";
import {
  IconSearch,
  IconLoader2,
  IconCheck,
  IconX,
  IconClock,
  IconMapPin,
  IconPhone,
  IconMail,
  IconCalendar,
  IconArrowLeft,
  IconBuilding,
} from "@tabler/icons-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  SUBMITTED: { label: "Đã gửi", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: "IconSend" },
  REVIEWING: { label: "Đang xem xét", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: "IconSearch" },
  INTERVIEW_SCHEDULED: { label: "Đã lên lịch phỏng vấn", color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: "IconCalendar" },
  ACCEPTED: { label: "Trúng tuyển", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "IconConfetti" },
  REJECTED: { label: "Chưa phù hợp", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "IconX" },
};

const DAY_LABELS: Record<number, string> = {
  0: "CN", 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7",
};

export default function TrackerPage() {
  const [appId, setAppId] = useState("");
  const [email, setEmail] = useState("");
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Interview scheduling
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [showSlots, setShowSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.trim() || !email.trim()) {
      setError("Vui lòng nhập mã hồ sơ và email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await trackApplication(appId.trim(), email.trim());
      setApplication(data);
    } catch (err: any) {
      setError(err.message || "Không tìm thấy hồ sơ");
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSlots = async () => {
    setShowSlots(true);
    setScheduleError("");
    try {
      const data = await fetchInterviewSlots();
      setSlots(data.slots);
    } catch {
      setScheduleError("Không thể tải lịch phỏng vấn");
    }
  };

  const handleSchedule = async () => {
    if (!selectedSlot || !application) return;
    setScheduling(true);
    setScheduleError("");
    try {
      await scheduleInterview({
        applicationId: application.id,
        scheduledAt: selectedSlot,
        interviewType: "IN_PERSON",
      });
      setScheduleSuccess(true);
      // Refresh application data
      const updated = await trackApplication(application.id, email.trim());
      setApplication(updated);
    } catch (err: any) {
      setScheduleError(err.message || "Không thể đặt lịch");
    } finally {
      setScheduling(false);
    }
  };

  const handleConfirm = async () => {
    if (!application?.interview?.id) return;
    setConfirming(true);
    try {
      await respondToInterview(application.interview.id, "CONFIRM");
      const updated = await trackApplication(application.id, email.trim());
      setApplication(updated);
    } catch {
      setScheduleError("Không thể xác nhận lịch");
    } finally {
      setConfirming(false);
    }
  };

  const statusConfig = application ? STATUS_CONFIG[application.status] || STATUS_CONFIG.SUBMITTED : null;

  const availableSlots = slots.filter((s) => s.available);

  // Group slots by date
  const slotsByDate = availableSlots.reduce<Record<string, InterviewSlot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-tbs-light">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <div className="mb-8">
          <Link href="/careers" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-accent transition-colors mb-4">
            <IconArrowLeft size={14} />
            Quay lại trang tuyển dụng
          </Link>
          <h1 className="text-3xl font-black text-tbs-dark">Tra Cứu Hồ Sơ Ứng Tuyển</h1>
          <p className="text-sm text-gray-500 mt-1">Kiểm tra trạng thái hồ sơ và lịch phỏng vấn của bạn</p>
        </div>

        {/* Lookup Form */}
        {!application && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã Hồ Sơ Ứng Tuyển *</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="Nhập mã hồ sơ bạn đã nhận được"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Đã Ứng Tuyển *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nguyenvana@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent transition-all"
                />
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    Đang tra cứu...
                  </>
                ) : (
                  <>
                    <IconSearch size={16} />
                    Tra Cứu Hồ Sơ
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Application Result */}
        {application && statusConfig && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`rounded-2xl border-2 p-6 sm:p-8 ${statusConfig.bg}`}>
              <div className="text-center mb-4">
                <span className="text-4xl">{statusConfig.icon}</span>
                <h2 className={`text-xl font-bold mt-2 ${statusConfig.color}`}>
                  {statusConfig.label}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Mã hồ sơ: <code className="bg-white/50 px-2 py-0.5 rounded text-tbs-dark font-mono">{application.id}</code>
                </p>
              </div>

              <div className="bg-white/60 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Họ tên:</span>
                  <span className="font-semibold text-tbs-dark">{application.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vị trí:</span>
                  <span className="font-semibold text-tbs-dark">{application.job?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày nộp:</span>
                  <span className="text-tbs-dark">{new Date(application.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            </div>

            {/* Interview Info */}
            {application.interview && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
                <h2 className="text-lg font-bold text-tbs-dark mb-4">Lịch phỏng vấn của bạn</h2>
                <div className="bg-emerald-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <IconCalendar size={18} className="text-accent" />
                    <span className="text-sm font-semibold text-tbs-dark">
                      {new Date(application.interview.scheduledAt).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconMapPin size={18} className="text-accent" />
                    <span className="text-sm text-tbs-dark">{application.interview.location}</span>
                  </div>
                  {application.interview.notes && (
                    <p className="text-xs text-gray-500 mt-1">{application.interview.notes}</p>
                  )}
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    application.interview.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : application.interview.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {application.interview.status === "CONFIRMED" ? "Đã xác nhận" :
                     application.interview.status === "PENDING" ? "Chờ xác nhận" :
                     application.interview.status === "CANCELLED" ? "Đã hủy" :
                     application.interview.status === "RESCHEDULED" ? "Đang đổi lịch" :
                     application.interview.status}
                  </div>
                </div>

                {/* Confirm / Reschedule actions */}
                {application.interview.status === "PENDING" && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-50"
                    >
                      {confirming ? "Đang xác nhận..." : "Xác nhận lịch"}
                    </button>
                    <button
                      onClick={handleViewSlots}
                      className="flex-1 py-2.5 rounded-xl bg-amber-100 text-amber-700 text-sm font-semibold hover:bg-amber-200 transition-colors"
                    >
                      Đổi lịch khác
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Schedule Interview (if not yet scheduled) */}
            {!application.interview && application.status === "SUBMITTED" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
                <h2 className="text-lg font-bold text-tbs-dark mb-4">Đặt lịch phỏng vấn</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Bạn có thể chủ động đặt lịch phỏng vấn. HR sẽ xác nhận lại thời gian phù hợp.
                </p>

                {!showSlots ? (
                  <button
                    onClick={handleViewSlots}
                    className="px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-light transition-colors"
                  >
                    Xem lịch trống & đặt hẹn
                  </button>
                ) : (
                  <div className="space-y-4">
                    {scheduleSuccess ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
                        Đặt lịch phỏng vấn thành công. HR sẽ xác nhận trong thời gian sớm nhất.
                      </div>
                    ) : (
                      <>
                        {/* Slot grid by date */}
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                          {Object.keys(slotsByDate).length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">
                              Không có lịch trống trong 14 ngày tới. Vui lòng thử lại sau.
                            </p>
                          ) : (
                            Object.entries(slotsByDate).map(([date, dateSlots]) => (
                              <div key={date}>
                                <h4 className="text-xs font-bold text-gray-500 mb-2">
                                  {new Date(date).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" })}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {dateSlots.map((slot) => (
                                    <button
                                      key={slot.datetime}
                                      onClick={() => setSelectedSlot(slot.datetime)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        selectedSlot === slot.datetime
                                          ? "bg-accent text-white shadow-sm"
                                          : "bg-white border border-gray-200 text-gray-700 hover:border-accent"
                                      }`}
                                    >
                                      {slot.time} ({slot.remaining})
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {scheduleError && (
                          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center">
                            {scheduleError}
                          </div>
                        )}

                        <button
                          onClick={handleSchedule}
                          disabled={!selectedSlot || scheduling}
                          className="w-full py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-light transition-colors disabled:opacity-50"
                        >
                          {scheduling ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Contact HR */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 text-center">
              <h3 className="text-sm font-bold text-tbs-dark mb-2">Cần Hỗ Trợ?</h3>
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <a href={`mailto:${application.job?.contactEmail || "tuyendungdaotaovp2@tbsgroup.vn"}`} className="flex items-center gap-1 text-accent hover:underline">
                  <IconMail size={14} />
                  {application.job?.contactEmail || "tuyendungdaotaovp2@tbsgroup.vn"}
                </a>
                <a href={`tel:${application.job?.contactPhone || "0905359017"}`} className="flex items-center gap-1 text-accent hover:underline">
                  <IconPhone size={14} />
                  {application.job?.contactPhone || "0905 359 017"}
                </a>
              </div>
            </div>

            {/* Reset */}
            <div className="text-center">
              <button
                onClick={() => {
                  setApplication(null);
                  setAppId("");
                  setEmail("");
                  setSlots([]);
                  setShowSlots(false);
                  setSelectedSlot("");
                  setScheduleSuccess(false);
                  setError("");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Tra cứu hồ sơ khác
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <AIChatBubble />
    </div>
  );
}
