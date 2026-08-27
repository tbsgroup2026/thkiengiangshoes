"use client";

import React, { useState } from "react";
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconUpload,
  IconArrowUp,
  IconArrowDown,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconBuildingStore,
  IconPhoto,
  IconExternalLink,
} from "@tabler/icons-react";
import { BrandPartner, DEFAULT_BRAND_PARTNERS } from "@/lib/landingCMS";

interface Props {
  brandPartners: BrandPartner[];
  onChange: (partners: BrandPartner[]) => void;
  showToast: (msg: string) => void;
}

export default function BrandPartnersManager({ brandPartners, onChange, showToast }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<BrandPartner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Add / Edit Modal
  const [formName, setFormName] = useState("");
  const [formLogo, setFormLogo] = useState("");
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const CLOUDINARY_CLOUD_NAME = "dwl2xtbqa";
  const CLOUDINARY_PRESET = "vpchuoisk";

  // Open Modal for Creating
  const handleOpenAddModal = () => {
    setEditingPartner(null);
    setFormName("");
    setFormLogo("");
    const maxOrder = brandPartners.reduce((max, p) => (p.displayOrder > max ? p.displayOrder : max), 0);
    setFormOrder(maxOrder + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Modal for Editing
  const handleOpenEditModal = (partner: BrandPartner) => {
    setEditingPartner(partner);
    setFormName(partner.name);
    setFormLogo(partner.logo);
    setFormOrder(partner.displayOrder);
    setFormIsActive(partner.isActive);
    setIsModalOpen(true);
  };

  // Handle Logo Upload to Cloudinary & Local DataURL fallback
  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ Dung lượng tệp ảnh quá lớn (vượt quá 5MB)!");
      return;
    }

    try {
      setIsUploading(true);

      // Instant local preview via FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary CDN
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          setFormLogo(data.secure_url);
          showToast(`☁️ Tải logo "${file.name}" lên Cloudinary CDN thành công!`);
        }
      }
    } catch (e: any) {
      console.warn("Cloudinary upload warning:", e);
    } finally {
      setIsUploading(false);
    }
  };

  // Save Add / Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Vui lòng nhập tên thương hiệu!");
      return;
    }
    if (!formLogo.trim()) {
      alert("Vui lòng tải lên hoặc nhập đường dẫn ảnh logo!");
      return;
    }

    if (editingPartner) {
      // Update existing
      const updated = brandPartners.map((p) =>
        p.id === editingPartner.id
          ? {
              ...p,
              name: formName.trim(),
              logo: formLogo.trim(),
              displayOrder: Number(formOrder) || p.displayOrder,
              isActive: formIsActive,
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      updated.sort((a, b) => a.displayOrder - b.displayOrder);
      onChange(updated);
      showToast(`✅ Đã cập nhật thương hiệu "${formName}" thành công!`);
    } else {
      // Add new
      const newPartner: BrandPartner = {
        id: `bp-${Date.now()}`,
        name: formName.trim(),
        logo: formLogo.trim(),
        displayOrder: Number(formOrder) || brandPartners.length + 1,
        isActive: formIsActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...brandPartners, newPartner];
      updated.sort((a, b) => a.displayOrder - b.displayOrder);
      onChange(updated);
      showToast(`🎉 Đã thêm mới thương hiệu "${formName}" thành công!`);
    }

    setIsModalOpen(false);
  };

  // Toggle Active Status directly from list
  const handleToggleActive = (id: string) => {
    const updated = brandPartners.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
    onChange(updated);
    const partner = brandPartners.find((p) => p.id === id);
    showToast(
      partner?.isActive
        ? `👁️ Đã ẩn logo "${partner.name}" khỏi trang chủ`
        : `✅ Đã bật hiển thị logo "${partner?.name}" trên trang chủ`
    );
  };

  // Move Order Up / Down
  const handleMoveOrder = (index: number, direction: "UP" | "DOWN") => {
    if (
      (direction === "UP" && index === 0) ||
      (direction === "DOWN" && index === brandPartners.length - 1)
    ) {
      return;
    }

    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const updated = [...brandPartners];

    // Swap displayOrder values
    const tempOrder = updated[index].displayOrder;
    updated[index] = { ...updated[index], displayOrder: updated[targetIdx].displayOrder };
    updated[targetIdx] = { ...updated[targetIdx], displayOrder: tempOrder };

    // Sort by new displayOrder
    updated.sort((a, b) => a.displayOrder - b.displayOrder);
    onChange(updated);
    showToast("↔️ Đã cập nhật thứ tự hiển thị logo đối tác");
  };

  // Delete Partner
  const handleDeletePartner = (id: string) => {
    const partnerName = brandPartners.find((p) => p.id === id)?.name || "";
    const updated = brandPartners.filter((p) => p.id !== id);
    onChange(updated);
    setDeleteConfirmId(null);
    showToast(`🗑️ Đã xóa thương hiệu "${partnerName}" khỏi hệ thống`);
  };

  // Reset to default initial partners
  const handleResetDefaults = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục danh sách 10 thương hiệu mặc định?")) {
      onChange([...DEFAULT_BRAND_PARTNERS]);
      showToast("🔄 Đã khôi phục danh sách đối tác thương hiệu mặc định thành công!");
    }
  };

  const activeCount = brandPartners.filter((p) => p.isActive).length;
  const hiddenCount = brandPartners.length - activeCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Stats & Main Action Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#006838]" />
              Quản Lý Đối Tác Thương Hiệu Tin Cậy (Brand Partners)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Quản lý danh sách logo đối tác chạy slider ngang trên trang chủ (Decathlon, Skechers, ECCO, Coach...)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <IconRefresh size={16} />
              <span>Khôi phục mặc định</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <IconPlus size={18} />
              <span>Thêm Thương Hiệu Mới</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block uppercase">Tổng Số Thương Hiệu</span>
            <span className="text-xl font-black text-slate-900">{brandPartners.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-bold text-[#006838] block uppercase">Đang Hiển Thị Trang Chủ</span>
            <span className="text-xl font-black text-[#006838]">{activeCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-[11px] font-bold text-amber-700 block uppercase">Đã Ẩn (Tắt)</span>
            <span className="text-xl font-black text-amber-700">{hiddenCount}</span>
          </div>
        </div>
      </div>

      {/* Grid of Brand Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brandPartners.map((partner, index) => (
          <div
            key={partner.id}
            className={`p-4 rounded-3xl bg-white border transition-all shadow-2xs relative flex flex-col justify-between space-y-4 ${
              partner.isActive
                ? "border-slate-200/90 hover:border-[#006838]/40 hover:shadow-md"
                : "border-slate-200 bg-slate-50/70 opacity-75"
            }`}
          >
            {/* Header / Badges */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-extrabold border border-slate-200">
                Thứ tự #{partner.displayOrder}
              </span>

              <button
                type="button"
                onClick={() => handleToggleActive(partner.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  partner.isActive
                    ? "bg-emerald-100 text-[#006838] border border-emerald-200 hover:bg-emerald-200"
                    : "bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300"
                }`}
              >
                {partner.isActive ? <IconEye size={13} /> : <IconEyeOff size={13} />}
                <span>{partner.isActive ? "Đang Hiện" : "Đã Ẩn"}</span>
              </button>
            </div>

            {/* Logo Preview Container */}
            <div className="h-24 rounded-2xl bg-slate-900/90 border border-slate-800 p-3 flex items-center justify-center relative overflow-hidden group">
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-14 max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="text-white text-xs font-bold font-mono tracking-wider truncate px-2 max-w-full">
                {partner.name}
              </span>
            </div>

            {/* Title & Actions */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 truncate">{partner.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {partner.id}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, "UP")}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer transition-colors"
                    title="Lên trên"
                  >
                    <IconArrowUp size={14} />
                  </button>

                  <button
                    type="button"
                    disabled={index === brandPartners.length - 1}
                    onClick={() => handleMoveOrder(index, "DOWN")}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer transition-colors"
                    title="Xuống dưới"
                  >
                    <IconArrowDown size={14} />
                  </button>
                </div>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(partner)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <IconEdit size={14} />
                    <span>Sửa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(partner.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <IconTrash size={14} />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006838]" />
                {editingPartner ? "Chỉnh Sửa Logo Thương Hiệu" : "Thêm Logo Thương Hiệu Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Brand Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Tên Thương Hiệu Đối Tác</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Skechers, Decathlon, Nike..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:border-[#006838] focus:bg-white outline-none"
                />
              </div>

              {/* Logo File Upload & Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Ảnh Logo Thương Hiệu (SVG/PNG/JPG)</label>

                {formLogo ? (
                  <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col items-center justify-center gap-2">
                    <img src={formLogo} alt="Preview" className="max-h-16 max-w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setFormLogo("")}
                      className="text-[11px] font-bold text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <IconTrash size={13} />
                      <span>Xóa ảnh chọn lại</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#006838] bg-slate-50 text-center transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                      id="brand-logo-file-input"
                    />
                    <label
                      htmlFor="brand-logo-file-input"
                      className="cursor-pointer space-y-1 block"
                    >
                      <IconUpload size={24} className="mx-auto text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 block">
                        {isUploading ? "Đang nạp ảnh..." : "Bấm để chọn tệp logo hoặc kéo thả"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Định dạng SVG, PNG, WEBP, JPG (Max 5MB)</span>
                    </label>
                  </div>
                )}

                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Hoặc dán đường dẫn URL trực tiếp:</span>
                  <input
                    type="text"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="https://.../logo.png"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono outline-none focus:border-[#006838]"
                  />
                </div>
              </div>

              {/* Display Order & Active Toggle Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={1}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-[#006838]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Trạng thái hiển thị</label>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      formIsActive
                        ? "bg-emerald-50 border-emerald-300 text-[#006838]"
                        : "bg-slate-100 border-slate-200 text-slate-500"
                    }`}
                  >
                    {formIsActive ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                    <span>{formIsActive ? "BẬT HIỆN" : "TẮT (ẨN)"}</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-extrabold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <IconCheck size={16} />
                  <span>{editingPartner ? "Lưu Thay Đổi" : "Tạo Mới"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <IconTrash size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">Xác Nhận Xóa Thương Hiệu?</h4>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa logo{" "}
                <strong className="text-slate-900">
                  {brandPartners.find((p) => p.id === deleteConfirmId)?.name}
                </strong>{" "}
                khỏi hệ thống? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={() => handleDeletePartner(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
