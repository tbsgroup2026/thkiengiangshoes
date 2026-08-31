"use client";

import React, { useState } from "react";
import {
  IconShieldCheck,
  IconCheck,
  IconX,
  IconUpload,
  IconPhoto,
  IconClock,
  IconStar,
  IconAlertCircle,
  IconTrash,
  IconSend,
  IconLoader2,
} from "@tabler/icons-react";
import { KaizenProposal } from "./CIModule";

interface PreliminaryReviewModalProps {
  proposal: KaizenProposal;
  onClose: () => void;
  onSuccess: () => void;
}

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dwl2xtbqa";
const CLOUDINARY_PRESET = "vpchuoisk";

export default function PreliminaryReviewModal({
  proposal,
  onClose,
  onSuccess,
}: PreliminaryReviewModalProps) {
  const [result, setResult] = useState<"PASS" | "FAIL">("PASS");
  const [reviewerName, setReviewerName] = useState("Cán Bộ Sơ Duyệt Hiện Trường");
  const [reviewComments, setReviewComments] = useState("");
  const [savedSeconds, setSavedSeconds] = useState<number>(proposal.saved_seconds || proposal.so_giay_tiet_kiem || 30);
  const [efficiencyScore, setEfficiencyScore] = useState<number>(proposal.score_points || proposal.diem_hieu_qua || 85.0);
  const [verificationPhotos, setVerificationPhotos] = useState<string[]>([]);
  const [newPhotoLink, setNewPhotoLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Handle Photo Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("❌ Vui lòng chọn file hình ảnh (JPG, PNG, WEBP)");
      return;
    }

    try {
      setUploading(true);
      showToast("☁️ Đang tải ảnh kiểm chứng hiện trường lên...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload error");
      const data = await res.json();
      setVerificationPhotos((prev) => [...prev, data.secure_url]);
      showToast("✅ Đã đính kèm ảnh kiểm chứng hiện trường thành công!");
    } catch (err) {
      showToast("❌ Lỗi tải ảnh kiểm chứng!");
    } finally {
      setUploading(false);
    }

  };

  const handleAddLink = () => {
    if (!newPhotoLink.trim()) return;
    setVerificationPhotos((prev) => [...prev, newPhotoLink.trim()]);
    setNewPhotoLink("");
    showToast("✅ Đã đính kèm link ảnh!");
  };

  const handleRemovePhoto = (idx: number) => {
    setVerificationPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewComments.trim()) {
      showToast("⚠️ Vui lòng nhập ghi chú / nhận xét sơ duyệt hiện trường!");
      return;
    }

    if (result === "PASS" && (isNaN(savedSeconds) || savedSeconds < 0)) {
      showToast("⚠️ Vui lòng nhập số liệu Tiết kiệm (giây) hợp lệ!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/ci-kaizen/preliminary-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          result,
          verificationPhotos,
          reviewComments,
          savedSeconds: result === "PASS" ? savedSeconds : 0,
          efficiencyScore: result === "PASS" ? efficiencyScore : 0,
          reviewerName,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(`🎉 ${json.message}`);
        onSuccess();
        onClose();
      } else {
        showToast(`❌ ${json.error || "Lỗi sơ duyệt hiện trường"}`);
      }
    } catch (err) {
      showToast("❌ Lỗi kết nối máy chủ!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col w-full max-w-2xl max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-extrabold text-xs shadow-2xl animate-in slide-in-from-top-3 flex items-center gap-2 border border-slate-700">
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-[#006838] via-[#0b1739] to-[#0b1739] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center border border-white/20">
              <IconShieldCheck size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                GIAI ĐOẠN 2 — SƠ DUYỆT HIỆN TRƯỜNG
              </span>
              <h3 className="text-base font-black text-white">
                Kiểm Chứng Thực Tế Ý Tưởng #{proposal.code}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Proposal Info Summary Box */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 text-sm">{proposal.title}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
              {proposal.category_label || proposal.category}
            </span>
          </div>
          <p className="text-slate-600 font-medium">
            👤 <strong>Người đề xuất:</strong> {proposal.proposer_name} ({proposal.proposer_emp_code}) — 📍 <strong>Đơn vị:</strong> {proposal.factory || proposal.region} {proposal.department ? `- ${proposal.department}` : ""}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
          {/* Decision Buttons (ĐẠT / KHÔNG ĐẠT) */}
          <div className="space-y-1.5">
            <label className="font-black text-slate-900 text-xs block">
              1. Kết Quả Sơ Duyệt Hiện Trường <span className="text-rose-600 font-bold">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResult("PASS")}
                className={`py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  result === "PASS"
                    ? "bg-[#006838] text-white border-[#006838] shadow-md shadow-emerald-900/20"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-emerald-50"
                }`}
              >
                <IconCheck size={18} />
                <span>🟢 ĐẠT (CHUYỂN ĐÃ ĐÁNH GIÁ)</span>
              </button>

              <button
                type="button"
                onClick={() => setResult("FAIL")}
                className={`py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  result === "FAIL"
                    ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-900/20"
                    : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-rose-50"
                }`}
              >
                <IconX size={18} />
                <span>🔴 KHÔNG ĐẠT (YÊU CẦU CHỈNH SỬA)</span>
              </button>
            </div>
          </div>

          {/* Conditional inputs if PASS */}
          {result === "PASS" ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[#006838] font-black text-xs uppercase tracking-wider">
                <IconStar size={16} />
                <span>NHẬP SỐ LIỆU ĐÁNH GIÁ THI ĐƯA & XẾP HẠNG</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Saved Seconds */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-900 text-[11px] flex items-center gap-1">
                    <IconClock size={14} className="text-emerald-700" />
                    <span>Số giây Tiết kiệm (giây) *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={savedSeconds}
                    onChange={(e) => setSavedSeconds(Number(e.target.value))}
                    placeholder="VD: 30"
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white outline-none focus:border-[#006838]"
                  />
                </div>

                {/* Efficiency score */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-900 text-[11px] flex items-center gap-1">
                    <IconStar size={14} className="text-amber-600" />
                    <span>Điểm Hiệu quả (0 - 100) *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    required
                    value={efficiencyScore}
                    onChange={(e) => setEfficiencyScore(Number(e.target.value))}
                    placeholder="VD: 85.0"
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white outline-none focus:border-[#006838]"
                  />
                </div>
              </div>

              <div className="text-[11px] font-extrabold text-emerald-900 bg-white p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span>Điểm tổng hợp tính tự động:</span>
                <span className="text-sm font-black text-[#006838]">
                  {((savedSeconds || 0) + (efficiencyScore || 0)).toFixed(1)} Điểm
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-2">
              <IconAlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>
                Ý tưởng sẽ chuyển sang trạng thái <strong>Cần chỉnh sửa</strong> (`CAN_CHINH_SUA`) và trả về cho người đề xuất nộp lại (giữ nguyên mã đề xuất cũ #{proposal.code}).
              </span>
            </div>
          )}

          {/* Verification Photos */}
          <div className="space-y-2">
            <label className="font-black text-slate-900 text-xs">
              2. Ảnh Xác Nhận Hiện Trường (Tùy chọn)
            </label>

            {verificationPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pb-1">
                {verificationPhotos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300">
                    <img src={url} alt="Verification" className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <IconTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs cursor-pointer flex items-center gap-1.5 border border-slate-300">
                <IconUpload size={15} />
                <span>Tải ảnh hiện trường</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>

              <input
                type="text"
                value={newPhotoLink}
                onChange={(e) => setNewPhotoLink(e.target.value)}
                placeholder="Hoặc dán link ảnh hiện trường..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#006838]"
              />

              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Inspection Notes / Comments */}
          <div className="space-y-1">
            <label className="font-black text-slate-900 text-xs">
              3. Ghi Chú / Nhận Xét Sơ Duyệt hiện trường <span className="text-rose-600 font-bold">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder={
                result === "PASS"
                  ? "Nhập nhận xét kiểm chứng thực tế tại hiện trường, ghi nhận cải tiến thực tế đã áp dụng..."
                  : "Nêu lý do không đạt và chi tiết nội dung người đề xuất cần bổ sung / chỉnh sửa lại..."
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#006838] resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={submitting || uploading}
              className={`px-6 py-2.5 rounded-2xl text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                result === "PASS" ? "bg-[#006838] hover:bg-[#004d29]" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {submitting ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>ĐANG NỘP KẾT QUẢ...</span>
                </>
              ) : (
                <>
                  <IconSend size={16} />
                  <span>
                    NỘP KẾT QUẢ SƠ DUYỆT ({result === "PASS" ? "ĐẠT" : "KHÔNG ĐẠT"})
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
