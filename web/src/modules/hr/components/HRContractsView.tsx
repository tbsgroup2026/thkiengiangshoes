"use client";

import React, { useState, useEffect } from "react";
import { HRContract } from "../types";
import { IconFileText, IconAlertTriangle, IconCheck, IconDownload, IconPlus } from "@tabler/icons-react";

export default function HRContractsView() {
  const [contracts, setContracts] = useState<HRContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hr/contracts");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setContracts(result.data);
      } else {
        setContracts([]);
      }
    } catch (err) {
      console.warn("Failed to fetch contracts from D1:", err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl">
          {toastMsg}
        </div>
      )}

      {/* Header Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <IconAlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-950">Cảnh Báo Hợp Đồng Lao Động Sắp Hết Hạn</h3>
            <p className="text-xs text-amber-800 font-medium">Có 18 hợp đồng lao động sẽ hết hạn trong vòng 30 ngày tới cần xử lý gia hạn hoặc chốt sổ.</p>
          </div>
        </div>

        <button
          onClick={() => showToast("Đã gửi thông báo nhắc gia hạn tự động tới 18 nhân viên!")}
          className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shrink-0 cursor-pointer"
        >
          Gửi Nhắc Nhở Gia Hạn
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900">Danh Sách Hợp Đồng Lao Động Doanh Nghiệp</h3>
          <button onClick={() => showToast("Tạo dự thảo hợp đồng mới")} className="px-3.5 py-2 rounded-xl bg-[#006838] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <IconPlus size={16} />
            <span>Soạn Hợp Đồng Mới</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Mã HĐ / Nhân viên</th>
                <th className="px-4 py-3.5">Phòng ban</th>
                <th className="px-4 py-3.5">Loại hợp đồng</th>
                <th className="px-4 py-3.5">Ngày ký / Hết hạn</th>
                <th className="px-4 py-3.5">Lương chính</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-slate-900">{c.employeeName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.department}</td>
                  <td className="px-4 py-3 text-slate-800 font-bold">{c.type}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    <div>{c.startDate}</div>
                    <div className="text-[10px] text-slate-400">Đến: {c.endDate}</div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-[#006838]">{c.salary}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.status === "Expiring"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : c.status === "Pending_Sign"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {c.status === "Expiring" ? "Sắp hết hạn" : c.status === "Pending_Sign" ? "Chờ ký duyệt" : "Còn hiệu lực"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => showToast(`Gửi tờ trình gia hạn hợp đồng cho ${c.employeeName}`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                    >
                      Gia hạn HĐ
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
