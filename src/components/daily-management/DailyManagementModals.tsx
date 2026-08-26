"use client";

import { useState } from "react";
import {
  IconX,
  IconChartBar,
  IconBuildingFactory,
  IconBulb,
  IconSparkles,
  IconCamera,
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconShieldCheck,
  IconBrain,
} from "@tabler/icons-react";

export type DailyModalType = "daily-review" | "gemba" | "ci" | "kaizen" | null;

interface DailyManagementModalsProps {
  activeModal: DailyModalType;
  onClose: () => void;
}

export default function DailyManagementModals({
  activeModal,
  onClose,
}: DailyManagementModalsProps) {
  // Form states
  const [gembaZone, setGembaZone] = useState("Xưởng 1");
  const [gembaLine, setGembaLine] = useState("Line 2 - Chuyền may");
  const [gembaDesc, setGembaDesc] = useState("");
  const [gembaPhoto, setGembaPhoto] = useState<string | null>(null);
  const [gembaSuccess, setGembaSuccess] = useState(false);

  const [ciTitle, setCiTitle] = useState("");
  const [ciCategory, setCiCategory] = useState("Chất lượng");
  const [ciDesc, setCiDesc] = useState("");
  const [ciSuccess, setCiSuccess] = useState(false);

  const [kaizenTitle, setKaizenTitle] = useState("");
  const [kaizenCategory, setKaizenCategory] = useState("Sản xuất");
  const [kaizenDesc, setKaizenDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    similarity: number;
    isDuplicate: boolean;
    aiFeedback: string;
    comparedCount: number;
  } | null>(null);
  const [kaizenSuccess, setKaizenSuccess] = useState(false);

  if (!activeModal) return null;

  // Handle Groq AI Duplicate Checking
  const handleCheckAiDuplicate = async () => {
    if (!kaizenTitle || !kaizenDesc) {
      alert("Vui lòng nhập tiêu đề và mô tả Kaizen trước khi kiểm tra AI!");
      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await fetch("/api/ai/compare-kaizen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: kaizenTitle,
          description: kaizenDesc,
          category: kaizenCategory,
        }),
      });

      const data = await res.json();
      setAiResult(data);
    } catch {
      alert("Không thể kết nối đến AI Groq");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container / Mobile Bottom Sheet */}
      <div className="relative z-10 w-full max-w-2xl bg-[#08221a] border border-[#2fd39a]/40 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 text-white max-h-[90vh] overflow-y-auto">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
        >
          <IconX size={18} />
        </button>


        {/* ════════════════════════════════════════════════════════════════
            1. POPUP: DASHBOARD DAILY REVIEW
           ════════════════════════════════════════════════════════════════ */}
        {activeModal === "daily-review" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#2fd39a]/20 text-[#2fd39a] flex items-center justify-center font-bold">
                <IconChartBar size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Dashboard Daily Review (Nhà Máy SKECHERS)
                </h3>
                <p className="text-xs text-gray-400">
                  Báo cáo vận hành tổng hợp theo ngày &amp; theo ca làm việc
                </p>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#0d2419] border border-[#2fd39a]/30">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  OEE Trung Bình
                </span>
                <span className="text-2xl font-black font-mono text-[#2fd39a] block mt-1">
                  98.4%
                </span>
                <span className="text-[10px] text-[#2fd39a]">↑ +1.2% ca trước</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0d2419] border border-[#f2dc9a]/30">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Sản Lượng Đạt
                </span>
                <span className="text-2xl font-black font-mono text-[#f2dc9a] block mt-1">
                  34,500
                </span>
                <span className="text-[10px] text-gray-400">Đôi giày / ngày</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0d2419] border border-blue-500/30">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Gemba Sự Cố
                </span>
                <span className="text-2xl font-black font-mono text-blue-400 block mt-1">
                  3 Ticket
                </span>
                <span className="text-[10px] text-blue-300">Đã xử lý xong</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0d2419] border border-purple-500/30">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  SLA Trung Bình
                </span>
                <span className="text-2xl font-black font-mono text-purple-400 block mt-1">
                  18 Phút
                </span>
                <span className="text-[10px] text-purple-300">Chuẩn &lt; 30p</span>
              </div>
            </div>

            {/* Daily Operational Notes */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-[#f2dc9a] uppercase tracking-wider">
                📌 Ghi nhận điều hành hôm nay:
              </h4>
              <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-4">
                <li>Xưởng sản xuất 1 hoàn thành 100% chỉ tiêu ca sáng dòng SKECHERS Performance.</li>
                <li>Xưởng 2 đã khắc phục xong sự cố máy may MC-MAY-04 trong 15 phút.</li>
                <li>Tiếp nhận 12 ý tưởng Kaizen mới từ nhân viên chuyền may.</li>
              </ul>
            </div>
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════
            2. POPUP: GEMBA WALK (SỰ CỐ HIỆN TRƯỜNG & ẢNH R2)
           ════════════════════════════════════════════════════════════════ */}
        {activeModal === "gemba" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                <IconBuildingFactory size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Lập Biên Bản Gemba Walk Hiện Trường
                </h3>
                <p className="text-xs text-gray-400">
                  Ghi nhận sự cố sản xuất, gắn mã vị trí &amp; chụp ảnh minh chứng R2
                </p>
              </div>
            </div>

            {gembaSuccess ? (
              <div className="p-6 text-center space-y-3 bg-[#0d2419] rounded-2xl border border-[#2fd39a]">
                <div className="w-12 h-12 rounded-full bg-[#2fd39a]/20 text-[#2fd39a] flex items-center justify-center mx-auto">
                  <IconCheck size={28} />
                </div>
                <h4 className="text-lg font-bold text-white">Đã Tạo Ticket Gemba Walk!</h4>
                <p className="text-xs text-gray-300">
                  Hệ thống đã phân công đội Bảo Trì Kỹ Thuật tiếp nhận sự cố. Đồng hồ SLA đếm ngược 30 phút đã kích hoạt.
                </p>
                <button
                  onClick={() => {
                    setGembaSuccess(false);
                    onClose();
                  }}
                  className="px-6 py-2 rounded-xl bg-[#2fd39a] text-[#08221a] font-bold text-xs"
                >
                  Hoàn Thành
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setGembaSuccess(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Xưởng / Khu vực</label>
                    <select
                      value={gembaZone}
                      onChange={(e) => setGembaZone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0d2419] border border-white/10 text-xs text-white focus:border-[#2fd39a]"
                    >
                      <option value="Xưởng 1">Xưởng 1 — SKECHERS</option>
                      <option value="Xưởng 2">Xưởng 2 — SKECHERS</option>
                      <option value="Kho Vận">Kho Vận &amp; ICD</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Chuyền / Vị trí máy</label>
                    <input
                      type="text"
                      required
                      value={gembaLine}
                      onChange={(e) => setGembaLine(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0d2419] border border-white/10 text-xs text-white focus:border-[#2fd39a]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Mô tả chi tiết sự cố tại hiện trường</label>
                  <textarea
                    required
                    rows={3}
                    value={gembaDesc}
                    onChange={(e) => setGembaDesc(e.target.value)}
                    placeholder="Ví dụ: Máy may MC-04 bị đứt chỉ liên tục do lệch ổ chao..."
                    className="w-full p-3 rounded-xl bg-[#0d2419] border border-white/10 text-xs text-white focus:border-[#2fd39a]"
                  />
                </div>

                {/* Photo Attachment (Cloudflare R2 Mock) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <IconCamera size={16} className="text-[#2fd39a]" />
                    <span>Ảnh minh chứng hiện trường (Lưu trữ Cloudflare R2)</span>
                  </label>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-dashed border-white/20 text-center">
                    {gembaPhoto ? (
                      <div className="text-xs text-[#2fd39a] font-bold">✓ Đã đính kèm ảnh minh chứng R2</div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setGembaPhoto("r2_photo_attached.jpg")}
                        className="text-xs text-gray-400 hover:text-white underline"
                      >
                        📷 Nhấn để chụp / tải ảnh hiện trường
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#2fd39a] to-[#f2dc9a] text-[#08221a] font-extrabold text-xs uppercase tracking-wider shadow-lg"
                >
                  Gửi Biên Bản Gemba Walk
                </button>
              </form>
            )}
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════
            3. POPUP: CI (CẢI TIẾN CÔNG NGHỆ & QUY TRÌNH)
           ════════════════════════════════════════════════════════════════ */}
        {activeModal === "ci" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <IconBulb size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Đăng Ký Đề Xuất Cải Tiến CI
                </h3>
                <p className="text-xs text-gray-400">
                  Continuous Improvement — Tối ưu năng suất &amp; chất lượng sản xuất
                </p>
              </div>
            </div>

            {ciSuccess ? (
              <div className="p-6 text-center space-y-3 bg-[#0d2419] rounded-2xl border border-[#2fd39a]">
                <div className="w-12 h-12 rounded-full bg-[#2fd39a]/20 text-[#2fd39a] flex items-center justify-center mx-auto">
                  <IconCheck size={28} />
                </div>
                <h4 className="text-lg font-bold text-white">Đã Ghi Nhận Đề Xuất CI!</h4>
                <p className="text-xs text-gray-300">
                  Hội đồng CI SKECHERS - TBS Group sẽ đánh giá ý tưởng của bạn trong vòng 48 giờ.
                </p>
                <button
                  onClick={() => {
                    setCiSuccess(false);
                    onClose();
                  }}
                  className="px-6 py-2 rounded-xl bg-[#2fd39a] text-[#08221a] font-bold text-xs"
                >
                  Hoàn Thành
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCiSuccess(true);
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Tên đề xuất cải tiến CI</label>
                  <input
                    type="text"
                    required
                    value={ciTitle}
                    onChange={(e) => setCiTitle(e.target.value)}
                    placeholder="Ví dụ: Tối ưu gá kẹp máy ép keo E5 giúp giảm 20% thời gian..."
                    className="w-full p-2.5 rounded-xl bg-[#0d2419] border border-white/10 text-xs text-white focus:border-[#2fd39a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Phân nhóm cải tiến</label>
                  <select
                    value={ciCategory}
                    onChange={(e) => setCiCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0d2419] border border-white/10 text-xs text-white focus:border-[#2fd39a]"
                  >
                    <option value="Chất lượng">Chất lượng (Quality)</option>
                    <option value="Chi phí">Chi phí (Cost)</option>
                    <option value="An toàn">An toàn lao động (Safety)</option>
                    <option value="5S">5S &amp; Môi trường (5S)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Nội dung giải pháp &amp; hiệu quả dự kiến</label>
                  <textarea
                    required
                    rows={3}
                    value={ciDesc}
                    onChange={(e) => setCiDesc(e.target.value)}
                    placeholder="Mô tả hiện trạng và giải pháp cải tiến đề xuất..."
                    className="w-full p-3 rounded-xl bg-[#0d2419] border border-white/10 text-xs text-white focus:border-[#2fd39a]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#2fd39a] to-[#f2dc9a] text-[#08221a] font-extrabold text-xs uppercase tracking-wider shadow-lg"
                >
                  Nộp Đề Xuất CI
                </button>
              </form>
            )}
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════
            4. POPUP: KAIZEN + GROQ AI COMPARE API INTEGRATION
           ════════════════════════════════════════════════════════════════ */}
        {activeModal === "kaizen" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#2fd39a]/20 text-[#2fd39a] flex items-center justify-center font-bold">
                <IconBrain size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Đăng Ký Kaizen + AI Groq</span>
                  <span className="text-[10px] font-mono bg-[#2fd39a]/20 text-[#2fd39a] px-2 py-0.5 rounded-full border border-[#2fd39a]/30">
                    Smart AI LLM
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Tích hợp Groq AI so sánh trùng lặp với cơ sở dữ liệu Kaizen
                </p>
              </div>
            </div>

            {kaizenSuccess ? (
              <div className="p-6 text-center space-y-3 bg-[#0d2419] rounded-2xl border border-[#2fd39a]">
                <div className="w-12 h-12 rounded-full bg-[#2fd39a]/20 text-[#2fd39a] flex items-center justify-center mx-auto">
                  <IconCheck size={28} />
                </div>
                <h4 className="text-lg font-bold text-white">Đã Đăng Ký Kaizen Thành Công!</h4>
                <p className="text-xs text-gray-300">
                  Ý tưởng Kaizen của bạn đã được ghi nhận vào bảng dữ liệu SKECHERS - TBS Group.
                </p>
                <button
                  onClick={() => {
                    setKaizenSuccess(false);
                    onClose();
                  }}
                  className="px-6 py-2 rounded-xl bg-[#2fd39a] text-[#08221a] font-bold text-xs"
                >
                  Hoàn Thành
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setKaizenSuccess(true);
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Tên ý tưởng Kaizen</label>
                  <input
                    type="text"
                    required
                    value={kaizenTitle}
                    onChange={(e) => setKaizenTitle(e.target.value)}
                    placeholder="Ví dụ: Thay thế dao cắt mẫu thủ công bằng lưỡi dao tự động..."
                    className="w-full p-2.5 rounded-xl bg-[#0d2419] border border-white/10 text-xs text-white focus:border-[#2fd39a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Mô tả Kaizen &amp; chi tiết giải pháp</label>
                  <textarea
                    required
                    rows={3}
                    value={kaizenDesc}
                    onChange={(e) => setKaizenDesc(e.target.value)}
                    placeholder="Mô tả cụ thể phương pháp thực hiện..."
                    className="w-full p-3 rounded-xl bg-[#0d2419] border border-white/10 text-xs text-white focus:border-[#2fd39a]"
                  />
                </div>

                {/* Groq AI Check Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCheckAiDuplicate}
                    disabled={aiLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0f4133] border border-[#2fd39a]/40 text-[#2fd39a] font-bold text-xs hover:bg-[#2fd39a]/10 flex items-center justify-center gap-2 transition"
                  >
                    <IconBrain size={16} />
                    <span>{aiLoading ? "AI Groq đang quét dữ liệu..." : "🔍 Kiểm Tra Trùng Lặp Bằng AI Groq"}</span>
                  </button>
                </div>

                {/* AI Result Card Display */}
                {aiResult && (
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-[#2fd39a]/30 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#f2dc9a] flex items-center gap-1">
                        <IconSparkles size={14} />
                        Kết Quả Phân Tích AI Groq:
                      </span>
                      <span className="text-xs font-mono font-bold text-[#2fd39a]">
                        Độ trùng: {aiResult.similarity}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed bg-[#08221a] p-3 rounded-xl border border-white/5">
                      {aiResult.aiFeedback}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#2fd39a] to-[#f2dc9a] text-[#08221a] font-extrabold text-xs uppercase tracking-wider shadow-lg"
                >
                  Xác Nhận Đăng Ký Kaizen
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
