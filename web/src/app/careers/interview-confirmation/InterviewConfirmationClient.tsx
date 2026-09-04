"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import NavLink from "@/components/NavLink";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIChatBubble from "@/components/recruitment/AIChatBubble";
import { trackApplication, fetchInterviewSlots, scheduleInterview, type JobApplication, type InterviewSlot } from "@/lib/api";
import { IconCheck, IconMail, IconPhone, IconLoader2, IconArrowRight, IconX } from "@tabler/icons-react";

export default function InterviewConfirmationClient() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") || "";

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [showSlots, setShowSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");

  useEffect(() => {
    if (applicationId && lookupEmail) {
      loadApplication();
    } else if (applicationId) {
      setLoading(false);
    } else {
      setError("Không tìm thấy mã hồ sơ ứng tuyển");
      setLoading(false);
    }
  }, [applicationId, lookupEmail]);

  const loadApplication = async () => {
    if (!applicationId || !lookupEmail) return;
    setLoading(true); setError("");
    try {
      const data = await trackApplication(applicationId, lookupEmail);
      setApplication(data);
    } catch { setError("Không tìm thấy hồ sơ. Vui lòng kiểm tra lại email."); }
    finally { setLoading(false); }
  };

  const handleLoadSlots = async () => {
    setShowSlots(true);
    try { const data = await fetchInterviewSlots(); setSlots(data.slots); }
    catch { setScheduleError("Không thể tải lịch phỏng vấn"); }
  };

  const handleSchedule = async () => {
    if (!selectedSlot || !application) return;
    setScheduling(true); setScheduleError("");
    try { await scheduleInterview({ applicationId: application.id, scheduledAt: selectedSlot, interviewType: "IN_PERSON" }); setScheduled(true); }
    catch (err: any) { setScheduleError(err.message || "Không thể đặt lịch"); }
    finally { setScheduling(false); }
  };

  const availableSlots = slots.filter((s) => s.available);
  const slotsByDate = availableSlots.reduce<Record<string, InterviewSlot[]>>((acc, slot) => { if (!acc[slot.date]) acc[slot.date] = []; acc[slot.date].push(slot); return acc; }, {});

  // Email input step
  if (applicationId && !lookupEmail) {
    return (
      <div className="min-h-screen flex flex-col bg-tbs-light">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 max-w-md mx-4 w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <IconCheck size={32} className="text-accent" />
            </div>
            <h1 className="text-xl font-bold text-tbs-dark mb-2">Xác Nhận Danh Tính</h1>
            <p className="text-sm text-gray-500 mb-6">Nhập email bạn đã dùng khi ứng tuyển để xem thông tin hồ sơ</p>
            <input type="email" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") loadApplication(); }} placeholder="nguyenvana@gmail.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent mb-3 text-center" autoFocus />
            <button onClick={loadApplication} className="w-full py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-light transition-colors">Xem Hồ Sơ</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-tbs-light"><Header /><main className="flex-1 flex items-center justify-center"><div className="text-center"><IconLoader2 size={48} className="animate-spin text-accent mx-auto mb-4" /><p className="text-gray-500 text-sm">Đang tải...</p></div></main><Footer /></div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex flex-col bg-tbs-light"><Header /><main className="flex-1 flex items-center justify-center"><div className="text-center max-w-md mx-auto px-6"><IconX size={56} className="mx-auto text-red-300 mb-4" /><h2 className="text-xl font-bold text-tbs-dark mb-2">Không Tìm Thấy</h2><p className="text-sm text-gray-500 mb-6">{error || "Không tìm thấy hồ sơ"}</p><NavLink href="/careers" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors">Xem Các Vị Trí Tuyển Dụng<IconArrowRight size={18} /></NavLink></div></main><Footer /></div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-tbs-light">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center"><IconCheck size={40} className="text-accent" /></div>
          <h1 className="text-2xl font-black text-tbs-dark mb-2">Hồ sơ đã được gửi thành công</h1>
          <p className="text-sm text-gray-500">Cảm ơn bạn đã ứng tuyển vào TBS Group. Dưới đây là thông tin hồ sơ của bạn.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Thông tin hồ sơ</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Mã hồ sơ</span><code className="text-accent font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded">{application.id}</code></div>
            <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Họ tên</span><span className="font-semibold text-tbs-dark">{application.fullName}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Vị trí</span><span className="font-semibold text-tbs-dark text-right ml-4">{application.job?.title}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Trạng thái</span><span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">Đã gửi</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Ngày nộp</span><span className="text-tbs-dark">{new Date(application.createdAt).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8 mb-6">
          <h2 className="text-lg font-bold text-tbs-dark mb-4">⏳ Điều Gì Sẽ Xảy Ra Tiếp Theo?</h2>
          <div className="space-y-4">
            {[{ step: 1, title: "Xem xét hồ sơ", desc: "HR sẽ xem xét CV trong 3-5 ngày làm việc" }, { step: 2, title: "Liên hệ phỏng vấn", desc: "HR sẽ liên hệ để sắp xếp lịch phỏng vấn" }, { step: 3, title: "Phỏng vấn", desc: "Tham gia phỏng vấn trực tiếp hoặc online" }, { step: 4, title: "Kết quả", desc: "Nhận thông báo kết quả trong vòng 7 ngày" }].map((item) => (
              <div key={item.step} className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm shrink-0 font-bold text-accent">{item.step}</div><div><h3 className="font-semibold text-tbs-dark text-sm">{item.title}</h3><p className="text-xs text-gray-500">{item.desc}</p></div></div>
            ))}
          </div>
        </div>

        {!application.interview && !scheduled && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-bold text-tbs-dark mb-4">Bạn muốn chủ động đặt lịch?</h2>
            <p className="text-sm text-gray-600 mb-4">Bạn có thể chọn ngay một khung giờ phỏng vấn phù hợp.</p>
            {!showSlots ? (
              <button onClick={handleLoadSlots} className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors">Xem lịch trống</button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {Object.keys(slotsByDate).length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Không có lịch trống.</p> :
                    Object.entries(slotsByDate).map(([date, dateSlots]) => (
                      <div key={date}><h4 className="text-xs font-bold text-gray-500 mb-2">{new Date(date).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" })}</h4><div className="flex flex-wrap gap-2">{dateSlots.map((slot) => (<button key={slot.datetime} onClick={() => setSelectedSlot(slot.datetime)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedSlot === slot.datetime ? "bg-accent text-white" : "bg-white border border-gray-200 hover:border-accent"}`}>{slot.time}</button>))}</div></div>
                    ))}
                </div>
                {scheduleError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center">{scheduleError}</div>}
                <button onClick={handleSchedule} disabled={!selectedSlot || scheduling} className="w-full py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-light transition-colors disabled:opacity-50">{scheduling ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}</button>
              </div>
            )}
          </div>
        )}

        {scheduled && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center mb-6"><IconCheck size={32} className="mx-auto text-accent mb-2" /><h3 className="font-bold text-tbs-dark mb-1">Đã Đặt Lịch Thành Công!</h3><p className="text-sm text-gray-600">HR sẽ xác nhận lịch phỏng vấn trong thời gian sớm nhất.</p></div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <NavLink href="/careers/tracker" className="px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-light transition-colors">Theo dõi hồ sơ</NavLink>
          <NavLink href="/careers" className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">Xem Thêm Vị Trí</NavLink>
        </div>
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400 mb-2">Cần hỗ trợ? Liên hệ Phòng Nhân sự:</p>
          <div className="flex justify-center gap-4 text-xs"><a href="mailto:tuyendungdaotaovp2@tbsgroup.vn" className="flex items-center gap-1 text-accent hover:underline"><IconMail size={14} /> tuyendungdaotaovp2@tbsgroup.vn</a><a href="tel:0905359017" className="flex items-center gap-1 text-accent hover:underline"><IconPhone size={14} /> 0905 359 017</a></div>
        </div>
      </main>
      <Footer />
      <AIChatBubble />
    </div>
  );
}
