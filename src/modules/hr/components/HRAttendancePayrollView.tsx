"use client";

import React, { useState, useEffect } from "react";
import { HRLeaveRequest } from "../types";
import { IconClock, IconFileCheck, IconCoins, IconCheck, IconX, IconDownload } from "@tabler/icons-react";

export default function HRAttendancePayrollView() {
  const [tab, setTab] = useState<"attendance" | "leave" | "payroll">("leave");
  const [leaveRequests, setLeaveRequests] = useState<HRLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hr/leave");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setLeaveRequests(result.data);
      } else {
        setLeaveRequests([]);
      }
    } catch (err) {
      console.warn("Failed to fetch leave requests from D1:", err);
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl">
          {toastMsg}
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-2xs flex items-center gap-1">
        {[
          { id: "leave", label: "📅 Đơn nghỉ phép & Phê duyệt" },
          { id: "attendance", label: "⏰ Chấm công & Tăng ca" },
          { id: "payroll", label: "💰 Lương, BHXH & Chi phí nhân sự" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              tab === t.id ? "bg-[#006838] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: LEAVE APPROVAL WORKFLOW */}
      {tab === "leave" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Luồng Duyệt Đơn Xin Nghỉ Phép</h3>
              <p className="text-xs text-slate-500 font-medium">Quy trình 3 bước: CBCNV gửi đơn → Quản lý trực tiếp phê duyệt → HR xác nhận chốt ngày phép</p>
            </div>
            <button onClick={() => showToast("Đã chốt ngày phép tháng 8!")} className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
              Chốt Phép Tháng 8
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Mã đơn / Nhân viên</th>
                  <th className="px-4 py-3.5">Phòng ban</th>
                  <th className="px-4 py-3.5">Loại nghỉ phép</th>
                  <th className="px-4 py-3.5">Thời gian xin nghỉ</th>
                  <th className="px-4 py-3.5">Lý do</th>
                  <th className="px-4 py-3.5">Trạng thái duyệt</th>
                  <th className="px-4 py-3.5 text-right">Thao tác duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-slate-900">{req.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{req.id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{req.department}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{req.leaveType}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      <div>{req.startDate} → {req.endDate}</div>
                      <div className="text-[10px] text-[#006838] font-bold">({req.days} ngày)</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{req.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        req.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}>
                        {req.status === "Approved" ? "Đã duyệt" : "Chờ HR xác nhận"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === "Pending_HR" ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => showToast(`✅ Đã duyệt đơn nghỉ phép ${req.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-[#006838] text-white font-bold text-xs hover:bg-[#00522c]"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => showToast(`❌ Từ chối đơn ${req.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TIMEKEEPING & OVERTIME */}
      {tab === "attendance" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Bảng Chấm Công &amp; Theo Dõi Tăng Ca (Overtime)</h3>
              <p className="text-xs text-slate-500 font-medium">Thống kê dữ liệu quẹt thẻ máy chấm công tự động ngày 19/08/2026</p>
            </div>
            <button onClick={() => showToast("Đã đồng bộ dữ liệu từ máy chấm công vân tay!")} className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
              Đồng Bộ Máy Chấm Công
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Đã có mặt</span>
              <span className="text-xl font-black text-emerald-950">4,102</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Vắng mặt</span>
              <span className="text-xl font-black text-rose-950">24</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Đi trễ / Về sớm</span>
              <span className="text-xl font-black text-amber-950">18</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Đang nghỉ phép</span>
              <span className="text-xl font-black text-blue-950">142</span>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Đăng ký tăng ca</span>
              <span className="text-xl font-black text-purple-950">320h</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYROLL & HR COSTS FOR MANAGER */}
      {tab === "payroll" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Quản Lý Chi Phí Nhân Sự &amp; Bảng Lương Tập Đoàn T8/2026</h3>
              <p className="text-xs text-slate-500 font-medium">Tổng quan ngân sách chi trả lương, thưởng KPI, bảo hiểm bắt buộc và phúc lợi</p>
            </div>
            <button onClick={() => showToast("Đã tải bảng lương tổng hợp đợt 1!")} className="px-3.5 py-1.5 rounded-xl bg-[#006838] text-white text-xs font-bold flex items-center gap-1.5">
              <IconDownload size={14} />
              <span>Xuất Bảng Lương Tổng Hợp</span>
            </button>
          </div>

          {/* Cost breakdown cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Chi phí lương cơ bản</span>
              <div className="text-xl font-black text-slate-900 font-mono">18.4 tỷ đ</div>
              <span className="text-[10px] text-slate-500 font-medium">Đã thanh toán đợt 1</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Chi phí tăng ca (OT)</span>
              <div className="text-xl font-black text-slate-900 font-mono">1.2 tỷ đ</div>
              <span className="text-[10px] text-slate-500 font-medium">Theo dữ liệu quẹt thẻ</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Trích nộp BHXH/BHYT/BHTN</span>
              <div className="text-xl font-black text-[#006838] font-mono">2.1 tỷ đ</div>
              <span className="text-[10px] text-slate-500 font-medium">Phần doanh nghiệp đóng (21.5%)</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Quỹ phúc lợi &amp; Ăn trưa</span>
              <div className="text-xl font-black text-purple-700 font-mono">1.5 tỷ đ</div>
              <span className="text-[10px] text-slate-500 font-medium">Hỗ trợ cơm ca &amp; xăng xe</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
