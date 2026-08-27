"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconMapPin,
  IconPlus,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconFilter,
  IconCamera,
  IconBuildingFactory,
  IconRefresh,
  IconUserCheck,
} from "@tabler/icons-react";
import CascadingOrgFilter, { CascadingFilterState } from "@/modules/ci/CascadingOrgFilter";

interface GembaRecord {
  id: string;
  walk_code: string;
  factory: string;
  department: string;
  line_name: string;
  observer_name: string;
  issue_description: string;
  category: string;
  image_url?: string;
  assigned_to?: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  created_at: string;
}

export default function GembaDedicatedPage() {
  const [walks, setWalks] = useState<GembaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [factory, setFactory] = useState("Kiên Giang 1");
  const [department, setDepartment] = useState("Xưởng May KG1");
  const [lineName, setLineName] = useState("Line May 1");
  const [observerName, setObserverName] = useState("Cán Bộ Kiểm Tra Gemba");
  const [issueDescription, setIssueDescription] = useState("");
  const [category, setCategory] = useState("AN_TOAN_5S");
  const [assignedTo, setAssignedTo] = useState("Quản Lý Xưởng");

  const [orgFilter, setOrgFilter] = useState<CascadingFilterState>({
    factories: [],
    workshops: [],
    lines: [],
    chuyens: [],
    tos: [],
  });

  const fetchWalks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/work/gemba");
      if (res.ok) {
        const data = await res.json();
        setWalks(data.walks || []);
      }
    } catch (err) {
      console.error("Lỗi kết nối API Gemba Walk:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/work/gemba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factory,
          department,
          lineName,
          observerName,
          issueDescription,
          category,
          assignedTo,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.walk) {
          setWalks((prev) => [data.walk, ...prev]);
        }
        setShowAddModal(false);
        setIssueDescription("");
      }
    } catch (err) {
      console.error("Lỗi lưu Gemba Walk:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWalks = walks.filter((w) => {
    if (orgFilter.factories.length > 0) {
      const matchFactory = orgFilter.factories.some(
        (f) => w.factory?.toLowerCase().includes(f.toLowerCase())
      );
      if (!matchFactory) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 lg:p-6 space-y-6 font-sans text-slate-900">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/work/cn-ci"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <IconArrowLeft size={16} />
            <span>Quay lại CN-CI</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
            <Link href="/work" className="hover:text-[#006838] transition-colors">
              Văn phòng SKECHERS
            </Link>
            <span>/</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-black uppercase text-[10px] border border-amber-200 flex items-center gap-1">
              <IconMapPin size={12} className="text-amber-600" />
              Gemba Walk Hiện Trường
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchWalks}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <IconRefresh size={14} className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <IconPlus size={16} />
            <span>GHI NHẬN GEMBA MỚI</span>
          </button>
        </div>
      </div>

      {/* Scope Banner & Cascading Filter */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
              <IconBuildingFactory size={16} />
              <span>Phạm vi tác nghiệp: Kiên Giang 1 — Kiên Giang 2 — Kiên Giang 3</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight mt-1">
              Nhật Ký Gemba Walk &amp; Kiểm Soát Sự Cố Hiện Trường
            </h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/30">
            Real-time D1 Sync
          </span>
        </div>

        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/15">
          <CascadingOrgFilter value={orgFilter} onChange={setOrgFilter} />
        </div>
      </div>

      {/* Gemba Records Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold text-sm bg-white rounded-2xl border border-slate-200">
          Đang tải dữ liệu Gemba Walk từ D1...
        </div>
      ) : filteredWalks.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <IconAlertCircle size={40} className="mx-auto text-amber-500" />
          <p className="text-slate-600 font-bold text-sm">Chưa có bản ghi Gemba Walk nào phù hợp bộ lọc.</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#006838] text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <IconPlus size={14} />
            Tạo bản ghi đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWalks.map((w) => (
            <div
              key={w.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-black tracking-wide border border-slate-200">
                    {w.walk_code || "GMB-2026"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      w.status === "RESOLVED" || w.status === "CLOSED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : w.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {w.status === "RESOLVED"
                      ? "Đã khắc phục"
                      : w.status === "IN_PROGRESS"
                      ? "Đang xử lý"
                      : "Chờ xử lý"}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                  {w.issue_description}
                </h3>

                <div className="space-y-1 text-xs text-slate-500 font-medium pt-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <IconBuildingFactory size={14} className="text-[#006838]" />
                    <span>
                      {w.factory} — {w.department}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconMapPin size={14} className="text-amber-600" />
                    <span>Line / Khu vực: {w.line_name || "Chuyền may"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconUserCheck size={14} className="text-blue-600" />
                    <span>Người ghi nhận: {w.observer_name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span className="flex items-center gap-1">
                  <IconClock size={12} />
                  {new Date(w.created_at).toLocaleDateString("vi-VN")}
                </span>
                <span className="text-slate-600 font-extrabold">Phụ trách: {w.assigned_to || "Xưởng trưởng"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Gemba Walk */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <IconMapPin size={20} className="text-[#006838]" />
                Ghi Nhận Sự Cố Gemba Walk (Hiện Trường)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Nhà máy *</label>
                  <select
                    value={factory}
                    onChange={(e) => setFactory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
                  >
                    <option value="KG 1">KG 1</option>
                    <option value="KG 2">KG 2</option>
                    <option value="Hoàn thiện đế">Hoàn thiện đế</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Xưởng *</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                    placeholder="VD: Xưởng Mũi KG1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Line / Chuyền *</label>
                  <input
                    type="text"
                    value={lineName}
                    onChange={(e) => setLineName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                    placeholder="VD: Line May Mũi 1"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Họ tên người kiểm tra *</label>
                  <input
                    type="text"
                    value={observerName}
                    onChange={(e) => setObserverName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Mô tả sự cố / hiện trạng phát hiện *</label>
                <textarea
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề phát hiện khi đi Gemba Walk tại chuyền..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Phân loại sự cố</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 bg-white"
                  >
                    <option value="AN_TOAN_5S">An Toàn &amp; 5S</option>
                    <option value="CHAT_LUONG_QC">Chất Lượng &amp; QC</option>
                    <option value="THIET_BI_MAYNOM">Móc Nối Thiết Bị</option>
                    <option value="LOGISTICS_VATTU">Vật Tư &amp; Băng Chuyền</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Người phụ trách xử lý</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-extrabold shadow-sm flex items-center gap-1.5"
                >
                  {submitting ? "Đang lưu..." : "LƯU BẢN GHI GEMBA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
