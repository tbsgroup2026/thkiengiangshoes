"use client";

import React, { useState, useEffect } from "react";
import {
  IconAward,
  IconPlus,
  IconTrash,
  IconCheck,
  IconUserCheck,
  IconShield,
  IconDeviceFloppy,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";

export interface JudgeMember {
  id: string;
  empCode: string;
  name: string;
  title: string;
  department: string;
  isActive: boolean;
  addedAt: string;
}

const DEFAULT_JUDGES: JudgeMember[] = [
  { id: "j-1", empCode: "TGĐ-001", name: "Ban Giám Đốc", title: "Tổng Giám Đốc", department: "Khối Điều Hành", isActive: true, addedAt: "2026-01-01" },
  { id: "j-2", empCode: "PTGĐ-002", name: "Phó Tổng Giám Đốc", title: "Phó TGĐ Kỹ Thuật & Sản Xuất", department: "Khối Sản Xuất", isActive: true, addedAt: "2026-01-01" },
  { id: "j-3", empCode: "GĐ-003", name: "Giám Đốc Nhà Máy", title: "Giám Đốc TH-KG", department: "Nhà Máy Kiên Giang", isActive: true, addedAt: "2026-01-01" },
  { id: "j-4", empCode: "PGĐ-004", name: "Phó Giám Đốc Kỹ Thuật", title: "PGĐ Công Nghệ & Chất Lượng", department: "R&D / QC", isActive: true, addedAt: "2026-01-01" },
  { id: "j-5", empCode: "202608001", name: "Trưởng Phòng CI", title: "Trưởng Phòng Cải Tiến Liên Tục (CI)", department: "Team CI", isActive: true, addedAt: "2026-01-01" },
];

export default function JudgesAdminPage() {
  const [judges, setJudges] = useState<JudgeMember[]>(DEFAULT_JUDGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Adding New Judge
  const [empCode, setEmpCode] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tbs_bgk_judges");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setJudges(parsed);
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleSave = (updatedJudges: JudgeMember[]) => {
    setJudges(updatedJudges);
    if (typeof window !== "undefined") {
      localStorage.setItem("tbs_bgk_judges", JSON.stringify(updatedJudges));
    }
    showToast("💾 Đã lưu danh sách Hội Đồng Đánh Giá (BGK)!");
  };

  const handleAddJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empCode.trim() || !name.trim()) {
      showToast("⚠️ Vui lòng nhập MSNV và Tên thành viên BGK!");
      return;
    }

    const newJudge: JudgeMember = {
      id: `j_${Date.now()}`,
      empCode: empCode.trim().toUpperCase(),
      name: name.trim(),
      title: title.trim() || "Thành Viên Hội Đồng Đánh Giá",
      department: department.trim() || "Team CI / Khối Quản Lý",
      isActive: true,
      addedAt: new Date().toISOString().substring(0, 10),
    };

    const updated = [newJudge, ...judges];
    handleSave(updated);

    // Reset Form
    setEmpCode("");
    setName("");
    setTitle("");
    setDepartment("");
    setIsAdding(false);
  };

  const handleRemoveJudge = (id: string) => {
    const updated = judges.filter((j) => j.id !== id);
    handleSave(updated);
    showToast("🗑️ Đã gỡ thành viên khỏi Hội Đồng Đánh Giá!");
  };

  const handleToggleActive = (id: string) => {
    const updated = judges.map((j) => (j.id === id ? { ...j, isActive: !j.isActive } : j));
    handleSave(updated);
  };

  const filteredJudges = judges.filter((j) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.name.toLowerCase().includes(q) ||
      j.empCode.toLowerCase().includes(q) ||
      j.title.toLowerCase().includes(q) ||
      j.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-left">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700 text-xs font-bold">
          <IconCheck size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#08221a] flex items-center gap-2">
            <IconAward size={28} className="text-amber-500" />
            <span>Quản Lý Hội Đồng Đánh Giá (BGK Kaizen)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân công thành viên Hội Đồng Đánh Giá có quyền chấm điểm Bước 5 và gắn nhãn 🏆 <strong>"Thi đua"</strong> cho sáng kiến đã Lưu trữ theo QĐ-TBKG/2026.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <IconPlus size={16} />
          <span>{isAdding ? "Đóng Form" : "Thêm Thành Viên BGK"}</span>
        </button>
      </div>

      {/* ADD NEW JUDGE FORM */}
      {isAdding && (
        <form onSubmit={handleAddJudge} className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4 animate-in fade-in">
          <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
            <IconUserCheck size={16} className="text-amber-600" />
            <span>Phân Công Thành Viên Hội Đồng Đánh Giá Mới</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">MSNV / Mã Thẻ *</label>
              <input
                type="text"
                required
                placeholder="VD: 202608002 hoặc TGĐ-002"
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Họ và Tên *</label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Chức Danh BGK</label>
              <input
                type="text"
                placeholder="VD: Đại diện Phòng Công Nghệ TH"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Phòng Ban / Đơn Vị</label>
              <input
                type="text"
                placeholder="VD: Phòng Chất Lượng TH"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#006838] text-white text-xs font-black hover:bg-[#00522c] shadow-sm flex items-center gap-1.5"
            >
              <IconDeviceFloppy size={16} />
              <span>Xác Nhận Thêm BGK</span>
            </button>
          </div>
        </form>
      )}

      {/* SEARCH BAR */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Tìm theo mã thẻ, tên, chức danh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#006838]"
          />
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Tổng số thành viên BGK: <strong className="text-slate-900">{filteredJudges.length}</strong>
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">STT</th>
                <th className="p-3.5">Mã Thẻ / MSNV</th>
                <th className="p-3.5">Họ và Tên</th>
                <th className="p-3.5">Chức Danh BGK</th>
                <th className="p-3.5">Phòng Ban</th>
                <th className="p-3.5 text-center">Trạng Thái</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredJudges.map((judge, idx) => (
                <tr key={judge.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3.5 font-mono font-black text-amber-700">{judge.empCode}</td>
                  <td className="p-3.5 font-bold text-slate-900">{judge.name}</td>
                  <td className="p-3.5 text-slate-600">{judge.title}</td>
                  <td className="p-3.5 text-slate-600">{judge.department}</td>
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(judge.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-colors cursor-pointer ${
                        judge.isActive
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-500 border border-slate-300"
                      }`}
                    >
                      {judge.isActive ? "✅ Đang hoạt động" : "⏸️ Tạm ngưng"}
                    </button>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveJudge(judge.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                      title="Gỡ khỏi BGK"
                    >
                      <IconTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
