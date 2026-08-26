"use client";

import React, { useState, useRef, useCallback } from "react";
import { IconUpload, IconFile, IconX, IconArrowLeft, IconArrowRight, IconCheck, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";
import { uploadCV, applyToJob } from "@/lib/api";

interface ApplyFormData {
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
}

const INITIAL_FORM: ApplyFormData = {
  fullName: "",
  email: "",
  phone: "",
  coverLetter: "",
};

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (applicationId: string) => void;
}

export default function ApplyModal({ jobId, jobTitle, isOpen, onClose, onSuccess }: ApplyModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ApplyFormData>(INITIAL_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedCvUrl, setUploadedCvUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFile = useCallback((f: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(f.type)) {
      setError("Chỉ chấp nhận file PDF, DOC hoặc DOCX");
      return;
    }

    if (f.size > maxSize) {
      setError("File vượt quá dung lượng cho phép (tối đa 10MB)");
      return;
    }

    setFile(f);
    setError("");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const validateStep1 = (): boolean => {
    if (!form.fullName.trim()) {
      setError("Vui lòng nhập họ và tên");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không đúng định dạng");
      return false;
    }
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) {
      setError("Số điện thoại không đúng định dạng (VD: 0901234567)");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (!file) {
        setError("Vui lòng tải CV lên");
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      // Step A: Upload CV
      const uploadResult = await uploadCV(file);
      setUploadedCvUrl(uploadResult.cvUrl);

      // Step B: Submit application
      const result = await applyToJob(jobId, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        coverLetter: form.coverLetter,
        cvUrl: uploadResult.cvUrl,
      });

      onSuccess(result.application.id);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi nộp hồ sơ");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const steps = ["Thông Tin Cá Nhân", "Tải CV", "Xác Nhận"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-tbs-dark">Ứng Tuyển</h2>
            <p className="text-xs text-gray-500 truncate max-w-[300px]">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Đóng"
          >
            <IconX size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i + 1 < step
                        ? "bg-accent text-white"
                        : i + 1 === step
                        ? "bg-accent text-white ring-4 ring-emerald-100"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i + 1 < step ? <IconCheck size={16} /> : i + 1}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 hidden sm:block">{label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i + 1 < step ? "bg-accent" : "bg-gray-100"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-2 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nguyenvana@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số Điện Thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Thư Giới Thiệu <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                </label>
                <textarea
                  name="coverLetter"
                  value={form.coverLetter}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  placeholder="Giới thiệu ngắn về bản thân và lý do bạn muốn ứng tuyển..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
                />
                <div className="text-[10px] text-gray-400 text-right mt-0.5">
                  {form.coverLetter.length}/2000 ký tự
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload CV */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Tải CV của bạn lên (hỗ trợ PDF, DOC, DOCX — tối đa 10MB)</p>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-accent bg-emerald-50"
                    : file
                    ? "border-accent bg-emerald-50/50"
                    : "border-gray-200 hover:border-accent hover:bg-gray-50"
                }`}
              >
                {file ? (
                  <div className="space-y-2">
                    <IconFile size={40} className="mx-auto text-accent" />
                    <p className="text-sm font-semibold text-tbs-dark">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Xóa và tải file khác
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <IconUpload size={40} className="mx-auto text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Kéo thả file CV vào đây hoặc <span className="text-accent font-semibold">chọn file</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — tối đa 10MB</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-tbs-dark mb-2">Xác nhận thông tin ứng tuyển</h3>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Vị trí:</span>
                  <span className="font-semibold text-tbs-dark">{jobTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Họ tên:</span>
                  <span className="font-semibold text-tbs-dark">{form.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-tbs-dark">{form.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SĐT:</span>
                  <span className="text-tbs-dark">{form.phone}</span>
                </div>
                {form.coverLetter && (
                  <div>
                    <span className="text-gray-500 block mb-1">Thư giới thiệu:</span>
                    <p className="text-tbs-dark text-xs leading-relaxed">{form.coverLetter}</p>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-500">CV:</span>
                  <span className="font-semibold text-accent">{file?.name}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Sau khi gửi, bộ phận Nhân sự sẽ xem xét hồ sơ và liên hệ với bạn trong 3-5 ngày làm việc.
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center">
            <IconAlertTriangle size={16} className="inline mr-1 shrink-0" /> {error}
          </div>
        )}

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={goBack}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <IconArrowLeft size={16} />
              Quay Lại
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors shadow-sm"
            >
              Tiếp Tục
              <IconArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  Đang Gửi...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  Gửi Hồ Sơ
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
