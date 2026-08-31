"use client";

import React, { useState } from "react";
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconUpload,
  IconArrowUp,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconRefresh,
  IconEye,
  IconPhoto,
  IconBuilding,
  IconBuildingWarehouse,
  IconBriefcase,
  IconShieldCheck,
  IconDeviceDesktop,
  IconUsers,
  IconFileText,
  IconUsersGroup,
} from "@tabler/icons-react";
import {
  WorkspaceDepartment,
  WorkspaceImageItem,
  DEFAULT_WORKSPACE_DEPARTMENTS,
  LandingCMSConfig,
} from "@/lib/landingCMS";
import WorkspaceGallery from "@/components/home/WorkspaceGallery";
import { uploadCloudinaryFile } from "@/lib/cloudinary";
import SafeImage from "@/components/SafeImage";

const ICON_OPTIONS = [
  { value: "building", label: "Sảnh / Tòa nhà", icon: IconBuilding },
  { value: "factory", label: "Nhà máy / Xưởng", icon: IconBuildingWarehouse },
  { value: "briefcase", label: "Văn phòng Điều hành", icon: IconBriefcase },
  { value: "check-shield", label: "Phòng QC / Chất lượng", icon: IconShieldCheck },
  { value: "monitor", label: "Phòng IT / Công nghệ", icon: IconDeviceDesktop },
  { value: "users", label: "Phòng Nhân sự / Đào tạo", icon: IconUsers },
  { value: "file-text", label: "Phòng Kế toán / Tài chính", icon: IconFileText },
  { value: "users-round", label: "Phòng Họp / Hội nghị", icon: IconUsersGroup },
];

interface Props {
  departments: WorkspaceDepartment[];
  onChange: (deps: WorkspaceDepartment[]) => void;
  onSave?: () => void;
  showToast: (msg: string) => void;
}

export default function WorkspaceCMSManager({ departments, onChange, onSave, showToast }: Props) {
  const [deps, setDeps] = useState<WorkspaceDepartment[]>(
    departments && departments.length > 0 ? departments : DEFAULT_WORKSPACE_DEPARTMENTS
  );
  const [selectedDepId, setSelectedDepId] = useState<string>(
    departments?.[0]?.id || "sanh"
  );
  const [activePreviewTab, setActivePreviewTab] = useState<"edit" | "preview">("edit");
  const [isUploading, setIsUploading] = useState(false);

  const CLOUDINARY_CLOUD_NAME = "dwl2xtbqa";
  const CLOUDINARY_PRESET = "vpchuoisk";

  const selectedDepartment =
    deps.find((d) => d.id === selectedDepId) || deps[0] || {
      id: "sanh",
      name: "Sảnh",
      icon: "building",
      order: 1,
      images: [],
    };

  // Department name update
  const handleDepartmentNameChange = (depId: string, newName: string) => {
    const updated = deps.map((d) => (d.id === depId ? { ...d, name: newName } : d));
    setDeps(updated);
    onChange(updated);
  };

  // Department icon update
  const handleDepartmentIconChange = (depId: string, newIcon: string) => {
    const updated = deps.map((d) => (d.id === depId ? { ...d, icon: newIcon } : d));
    setDeps(updated);
    onChange(updated);
  };

  // Reorder department
  const handleMoveDepartment = (depIdx: number, direction: "UP" | "DOWN") => {
    if (
      (direction === "UP" && depIdx === 0) ||
      (direction === "DOWN" && depIdx === deps.length - 1)
    ) {
      return;
    }

    const targetIdx = direction === "UP" ? depIdx - 1 : depIdx + 1;
    const newDeps = [...deps];
    const temp = newDeps[depIdx];
    newDeps[depIdx] = newDeps[targetIdx];
    newDeps[targetIdx] = temp;

    setDeps(newDeps);
    onChange(newDeps);
    showToast("↔️ Đã thay đổi thứ tự phòng ban");
  };

  // Add new department
  const handleAddDepartment = () => {
    const newDepId = `dep-${Date.now()}`;
    const newDep: WorkspaceDepartment = {
      id: newDepId,
      name: "Phòng Ban Mới",
      icon: "building",
      order: deps.length + 1,
      images: [
        {
          id: `img-${Date.now()}-1`,
          src: "/images/KGLV/MẶT TIỀN SẢNH.png",
          caption: "Không gian làm việc mới",
          order: 1,
        },
      ],
    };
    const updated = [...deps, newDep];
    setDeps(updated);
    setSelectedDepId(newDepId);
    onChange(updated);
    showToast("🎉 Đã tạo thêm 1 phòng ban mới!");
  };

  // Delete department
  const handleDeleteDepartment = (depId: string) => {
    if (deps.length <= 1) {
      alert("⚠️ Không thể xóa! Phải giữ lại ít nhất 1 phòng ban.");
      return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa phòng ban này cùng toàn bộ hình ảnh thuộc về nó?")) {
      const updated = deps.filter((d) => d.id !== depId);
      setDeps(updated);
      setSelectedDepId(updated[0]?.id || "sanh");
      onChange(updated);
      showToast("🗑️ Đã xóa phòng ban thành công");
    }
  };

  // Image Upload handler
  const handleImageFileUpload = async (file: File, depId: string, imgIndex: number) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ Dung lượng tệp ảnh quá lớn (vượt quá 5MB)!");
      return;
    }

    try {
      setIsUploading(true);

      // Local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          updateImageSrc(depId, imgIndex, reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Unique Cloudinary upload
      const res = await uploadCloudinaryFile(file, { category: "workspace" });
      if (res.secure_url) {
        updateImageSrc(depId, imgIndex, res.secure_url);
        showToast(`☁️ Tải ảnh "${file.name}" lên Cloudinary CDN thành công!`);
      }
    } catch (e: any) {
      console.warn("Cloudinary upload warning:", e);
    } finally {
      setIsUploading(false);
    }
  };

  // Direct image src update
  const updateImageSrc = (depId: string, imgIndex: number, newSrc: string) => {
    const updated = deps.map((dep) => {
      if (dep.id !== depId) return dep;
      const newImages = [...dep.images];
      if (newImages[imgIndex]) {
        newImages[imgIndex] = { ...newImages[imgIndex], src: newSrc };
      }
      return { ...dep, images: newImages };
    });
    setDeps(updated);
    onChange(updated);
  };

  // Image caption update
  const updateImageCaption = (depId: string, imgIndex: number, newCaption: string) => {
    const updated = deps.map((dep) => {
      if (dep.id !== depId) return dep;
      const newImages = [...dep.images];
      if (newImages[imgIndex]) {
        newImages[imgIndex] = { ...newImages[imgIndex], caption: newCaption };
      }
      return { ...dep, images: newImages };
    });
    setDeps(updated);
    onChange(updated);
  };

  // Reorder image inside department
  const handleMoveImage = (depId: string, imgIdx: number, direction: "LEFT" | "RIGHT") => {
    const dep = deps.find((d) => d.id === depId);
    if (!dep) return;

    if (
      (direction === "LEFT" && imgIdx === 0) ||
      (direction === "RIGHT" && imgIdx === dep.images.length - 1)
    ) {
      return;
    }

    const targetIdx = direction === "LEFT" ? imgIdx - 1 : imgIdx + 1;
    const newImages = [...dep.images];
    const temp = newImages[imgIdx];
    newImages[imgIdx] = newImages[targetIdx];
    newImages[targetIdx] = temp;

    const updated = deps.map((d) => (d.id === depId ? { ...d, images: newImages } : d));
    setDeps(updated);
    onChange(updated);
    showToast("↔️ Đã thay đổi thứ tự ảnh");
  };

  // Add image to department
  const handleAddImageToDepartment = (depId: string) => {
    const updated = deps.map((dep) => {
      if (dep.id !== depId) return dep;
      const newImg: WorkspaceImageItem = {
        id: `img-${dep.id}-${Date.now()}`,
        src: "/images/KGLV/MẶT TIỀN SẢNH.png",
        caption: `Không gian ${dep.name} mới`,
        order: dep.images.length + 1,
      };
      return { ...dep, images: [...dep.images, newImg] };
    });
    setDeps(updated);
    onChange(updated);
    showToast(`➕ Đã thêm 1 ảnh mới vào phòng ban "${selectedDepartment.name}"`);
  };

  // Delete image from department
  const handleDeleteImageFromDepartment = (depId: string, imgIndex: number) => {
    const updated = deps.map((dep) => {
      if (dep.id !== depId) return dep;
      const newImages = dep.images.filter((_, idx) => idx !== imgIndex);
      return { ...dep, images: newImages };
    });
    setDeps(updated);
    onChange(updated);
    showToast("🗑️ Đã xóa ảnh khỏi phòng ban");
  };

  // Reset Defaults
  const handleResetDefaults = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục 10 phòng ban mặc định cùng toàn bộ ảnh mẫu?")) {
      setDeps(DEFAULT_WORKSPACE_DEPARTMENTS);
      setSelectedDepId("sanh");
      onChange(DEFAULT_WORKSPACE_DEPARTMENTS);
      showToast("🔄 Đã khôi phục 10 phòng ban mặc định thành công!");
    }
  };

  // Save Config
  const handleSaveConfig = () => {
    onChange(deps);
    if (onSave) onSave();
    showToast("💾 ĐÃ LƯU & ĐỒNG BỘ THAY ĐỔI KHÔNG GIAN LÀM VIỆC LÊN MÁY CHỦ!");
  };

  const totalImagesCount = deps.reduce((acc, d) => acc + (d.images?.length || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Control Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#006838]" />
              Quản Lý Không Gian Làm Việc (Workspace Gallery)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Quản lý danh sách 10 phòng ban (Sảnh, Nhà máy 1, 2, 3, QC, IT, HR, Kế toán...) và album ảnh tĩnh tương ứng
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setActivePreviewTab("edit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                  activePreviewTab === "edit"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <IconEdit size={14} />
                <span>Chỉnh sửa</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewTab("preview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                  activePreviewTab === "preview"
                    ? "bg-[#006838] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <IconEye size={14} />
                <span>Xem Trước Live</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <IconRefresh size={16} />
              <span>Reset Mặc Định</span>
            </button>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-5 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <IconCheck size={18} />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 font-mono font-bold pt-1">
          <span>Tổng số phòng ban: {deps.length}</span>
          <span>Tổng số hình ảnh: {totalImagesCount} ảnh</span>
        </div>
      </div>

      {/* Mode 1: Edit Form */}
      {activePreviewTab === "edit" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Department List Management */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Danh Sách Phòng Ban ({deps.length})
              </h4>
              <button
                type="button"
                onClick={handleAddDepartment}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006838] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <IconPlus size={14} />
                <span>Thêm Mới</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
              {deps.map((dep, depIdx) => {
                const isSelected = dep.id === selectedDepId;
                const imgCount = dep.images?.length || 0;

                return (
                  <div
                    key={dep.id}
                    className={`p-3 rounded-2xl border transition-all space-y-2 ${
                      isSelected
                        ? "bg-slate-900 border-slate-900 text-white shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDepId(dep.id)}
                        className="flex-1 text-left flex items-center gap-2 truncate cursor-pointer"
                      >
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                            isSelected ? "bg-[#2fd39a] text-slate-950" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          #{depIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={dep.name}
                          onChange={(e) => handleDepartmentNameChange(dep.id, e.target.value)}
                          className={`w-full px-2 py-1 rounded-lg text-xs font-black outline-none ${
                            isSelected
                              ? "bg-slate-800 border border-slate-700 text-white focus:border-[#2fd39a]"
                              : "bg-white border border-slate-200 text-slate-900 focus:border-[#006838]"
                          }`}
                        />
                      </button>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex-shrink-0 ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {imgCount} ảnh
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/40">
                      {/* Icon selector */}
                      <select
                        value={dep.icon || "building"}
                        onChange={(e) => handleDepartmentIconChange(dep.id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold outline-none cursor-pointer ${
                          isSelected
                            ? "bg-slate-800 text-slate-200 border border-slate-700"
                            : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={depIdx === 0}
                          onClick={() => handleMoveDepartment(depIdx, "UP")}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                          title="Lên trên"
                        >
                          <IconArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={depIdx === deps.length - 1}
                          onClick={() => handleMoveDepartment(depIdx, "DOWN")}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                          title="Xuống dưới"
                        >
                          <IconArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDepartment(dep.id)}
                          className="p-1 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer"
                          title="Xóa phòng ban"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Photos Manager for Selected Department */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006838]" />
                  Quản Lý Ảnh: {selectedDepartment.name} ({selectedDepartment.images?.length || 0})
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Thêm, xóa, thay ảnh hoặc đổi chú thích hiển thị cho phòng ban này
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddImageToDepartment(selectedDepartment.id)}
                className="px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-extrabold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <IconPlus size={16} />
                <span>Thêm Ảnh Vào {selectedDepartment.name}</span>
              </button>
            </div>

            {/* Photo Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedDepartment.images || []).map((imgItem, imgIdx) => (
                <div
                  key={imgItem.id || imgIdx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between"
                >
                  {/* Image Preview Box */}
                  <div className="aspect-video rounded-xl bg-slate-900 flex items-center justify-center relative overflow-hidden group">
                    <SafeImage
                      productId={imgItem.id || imgIdx}
                      src={imgItem.src}
                      alt={imgItem.caption || `Photo ${imgIdx + 1}`}
                      fallbackTitle={imgItem.caption || `Ảnh #${imgIdx + 1}`}
                      objectFit="cover"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-white font-mono text-[10px] font-bold">
                      #{imgIdx + 1}
                    </span>
                  </div>

                  {/* Upload & Caption Form */}
                  <div className="space-y-2">
                    <label className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs">
                      <IconUpload size={14} />
                      <span>{isUploading ? "Đang tải..." : "Thay Ảnh Từ Máy"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileUpload(file, selectedDepartment.id, imgIdx);
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      value={imgItem.src}
                      onChange={(e) => updateImageSrc(selectedDepartment.id, imgIdx, e.target.value)}
                      placeholder="URL đường dẫn ảnh..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-mono outline-none focus:border-[#006838]"
                    />

                    <input
                      type="text"
                      value={imgItem.caption || ""}
                      onChange={(e) => updateImageCaption(selectedDepartment.id, imgIdx, e.target.value)}
                      placeholder="Chú thích ảnh (Ví dụ: Không gian làm việc chuẩn)..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold outline-none focus:border-[#006838]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={imgIdx === 0}
                        onClick={() => handleMoveImage(selectedDepartment.id, imgIdx, "LEFT")}
                        className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                        title="Qua trái"
                      >
                        <IconArrowLeft size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={imgIdx === (selectedDepartment.images?.length || 0) - 1}
                        onClick={() => handleMoveImage(selectedDepartment.id, imgIdx, "RIGHT")}
                        className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                        title="Qua phải"
                      >
                        <IconArrowRight size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteImageFromDepartment(selectedDepartment.id, imgIdx)}
                      className="text-rose-500 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Live Preview Block */}
      {activePreviewTab === "preview" && (
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#006838] text-xs font-bold flex items-center gap-2">
            <IconEye size={18} />
            <span>Xem trước Giao diện Không Gian Làm Việc xuất hiện trên Trang Chủ:</span>
          </div>

          <WorkspaceGallery />
        </div>
      )}
    </div>
  );
}
