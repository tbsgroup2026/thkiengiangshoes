"use client";

import React, { useState, useEffect } from "react";
import { HREmployee } from "../types";
import {
  IconSearch,
  IconDownload,
  IconPlus,
  IconUsers,
  IconSitemap,
  IconBuilding,
  IconFileText,
  IconPhone,
  IconMail,
  IconX,
  IconCheck,
  IconArrowsExchange,
  IconCrown,
} from "@tabler/icons-react";

export default function HREmployeeDirectoryView() {
  const [subTab, setSubTab] = useState<"directory" | "orgchart" | "headcount" | "transfers">("directory");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedEmp, setSelectedEmp] = useState<HREmployee | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [employees, setEmployees] = useState<HREmployee[]>([]);
  const [loading, setLoading] = useState(true);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hr/employees");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setEmployees(result.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.warn("Failed to fetch employees from D1:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department.toLowerCase().includes(deptFilter.toLowerCase());
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700">
          {toastMsg}
        </div>
      )}

      {/* Sub navigation bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {[
            { id: "directory", label: "👥 Danh sách nhân viên", icon: IconUsers },
            { id: "orgchart", label: "🏢 Cơ cấu tổ chức (Org Chart)", icon: IconSitemap },
            { id: "headcount", label: "📊 Định biên nhân sự", icon: IconBuilding },
            { id: "transfers", label: "🔄 Điều chuyển & Bổ nhiệm", icon: IconArrowsExchange },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                subTab === t.id
                  ? "bg-[#006838] text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <IconArrowsExchange size={16} />
          <span>Tạo Đề Xuất Điều Chuyển / Bổ Nhiệm</span>
        </button>
      </div>

      {/* SUBTAB 1: DANH SÁCH NHÂN VIÊN */}
      {subTab === "directory" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, mã NV, chức danh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006838]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">Tất cả phòng ban</option>
                <option value="Nhân Sự">Nhân Sự - Hành Chánh</option>
                <option value="Kế Toán">Kế Toán &amp; Tài Chính</option>
                <option value="IT">Khối IT &amp; CĐS</option>
                <option value="QC">Khối QC</option>
                <option value="Logistics">Kho &amp; Logistics</option>
              </select>

              <button
                onClick={() => showToast("Đã xuất toàn bộ hồ sơ nhân sự dạng Excel!")}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <IconDownload size={14} />
                <span>Xuất Excel</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Mã NV / Họ &amp; Tên</th>
                    <th className="px-4 py-3.5">Chức danh</th>
                    <th className="px-4 py-3.5">Phòng ban / Chi nhánh</th>
                    <th className="px-4 py-3.5">Loại hợp đồng</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-4 py-3.5 text-right">Hồ sơ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-emerald-600/30 shadow-2xs shrink-0" />
                          <div>
                            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {emp.isHighPerformer && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black">HIGH</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{emp.id} • {emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{emp.title}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{emp.department}</div>
                        <div className="text-[10px] text-slate-400">{emp.branch}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{emp.contractType}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          emp.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : emp.status === "Probation"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {emp.status === "Active" ? "Chính thức" : emp.status === "Probation" ? "Thử việc" : "Mới tiếp nhận"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedEmp(emp)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#006838] text-[#006838] hover:text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          Xem hồ sơ
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

      {/* SUBTAB 2: ORG CHART */}
      {subTab === "orgchart" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 text-center">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">Sơ Đồ Cơ Cấu Tổ Chức TBS Group &amp; Skechers HQ</h3>
            <p className="text-xs text-slate-500 font-medium">Hệ thống phân cấp Khối - Phòng ban - Bộ phận nghiệp vụ</p>
          </div>

          {/* Org chart diagram */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6 max-w-4xl mx-auto">
            {/* Level 1: CEO */}
            <div className="inline-block p-4 bg-[#006838] text-white rounded-2xl shadow-md space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-200">BAN GIÁM ĐỐC TẬP ĐOÀN</span>
              <h4 className="text-sm font-black">Tổng Giám Đốc (CEO) — TBS Group</h4>
            </div>

            <div className="w-0.5 h-6 bg-slate-300 mx-auto" />

            {/* Level 2: Directors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#006838]">KHỐI SẢN XUẤT</span>
                <h5 className="text-xs font-black text-slate-900">Giám Đốc Tổ Hợp Nhà Máy</h5>
                <p className="text-[10px] text-slate-400">2,450 nhân sự</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#006838]">KHỐI HÀNH CHÍNH &amp; HR</span>
                <h5 className="text-xs font-black text-slate-900">Nguyễn Thị Lan Anh (TP HR)</h5>
                <p className="text-[10px] text-slate-400">286 nhân sự</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#006838]">KHỐI IT &amp; CĐS</span>
                <h5 className="text-xs font-black text-slate-900">Phạm Nguyễn Anh Huy (Lead IT)</h5>
                <p className="text-[10px] text-slate-400">140 nhân sự</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: HEADCOUNT MATRIX */}
      {subTab === "headcount" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Định Biên Nhân Sự (Headcount Planning 2026)</h3>
              <p className="text-xs text-slate-500 font-medium">So sánh định biên được duyệt vs Nhân sự hiện tại theo từng phòng ban</p>
            </div>
            <button onClick={() => showToast("Đã tải bảng định biên chi tiết!")} className="px-3.5 py-1.5 rounded-xl bg-[#006838] text-white text-xs font-bold">
              Xuất Bảng Định Biên
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Phòng ban / Bộ phận</th>
                  <th className="px-4 py-3">Định biên duyệt</th>
                  <th className="px-4 py-3">Hiện có</th>
                  <th className="px-4 py-3">Còn thiếu (Tuyển thêm)</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {[
                  { dept: "Khối QC & Quản trị chất lượng", quota: 440, current: 420, missing: 20, status: "Thiếu định biên" },
                  { dept: "Khối IT & Chuyển đổi số", quota: 150, current: 140, missing: 10, status: "Thiếu định biên" },
                  { dept: "Nhân Sự - Hành Chánh", quota: 290, current: 286, missing: 4, status: "Đạt 98%" },
                  { dept: "Kế Toán & Tài Chính", quota: 100, current: 100, missing: 0, status: "Đạt 100%" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{row.dept}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{row.quota}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#006838]">{row.current}</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">+{row.missing}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: TRANSFERS & APPOINTMENTS */}
      {subTab === "transfers" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Quản Lý Điều Chuyển &amp; Bổ Nhiệm</h3>
              <p className="text-xs text-slate-500 font-medium">Theo dõi quyết định thay đổi chức danh, bổ nhiệm và luân chuyển chi nhánh</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { title: "Bổ nhiệm Phó Trưởng Phòng QC — Bùi Thị Hằng", from: "Quản Lý QC", to: "Phó TP QC Ca 2", date: "2026-08-01", status: "Đã phê duyệt" },
              { title: "Điều chuyển nhân sự IT — Phạm Nguyễn Anh Huy", from: "IT Support", to: "IT - Team Chuyển Đổi Số", date: "2026-01-10", status: "Đã phê duyệt" },
            ].map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900">{t.title}</h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Từ: <strong>{t.from}</strong></span>
                    <span>→</span>
                    <span>Thành: <strong className="text-[#006838]">{t.to}</strong></span>
                    <span>•</span>
                    <span className="font-mono">{t.date}</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPLOYEE DETAIL MODAL */}
      {selectedEmp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img src={selectedEmp.avatar} alt={selectedEmp.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#006838]" />
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedEmp.name}</h3>
                  <span className="text-xs text-slate-500 font-mono">{selectedEmp.id} • {selectedEmp.title}</span>
                </div>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="text-slate-400 hover:text-slate-700">
                <IconX size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Phòng ban</span>
                  <span className="font-bold text-slate-800">{selectedEmp.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Loại hợp đồng</span>
                  <span className="font-bold text-slate-800">{selectedEmp.contractType}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Lương cơ bản</span>
                  <span className="font-bold text-[#006838] font-mono">{selectedEmp.salaryBase || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Đánh giá KPI</span>
                  <span className="font-bold text-purple-700">{selectedEmp.performanceScore || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button onClick={() => setSelectedEmp(null)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
