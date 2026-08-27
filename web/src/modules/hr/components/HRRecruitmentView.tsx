"use client";

import React, { useState, useEffect } from "react";
import { HRRequisition } from "../types";
import { IconBriefcase, IconPlus, IconCheck, IconX, IconUserCheck, IconSend } from "@tabler/icons-react";

export default function HRRecruitmentView() {
  const [requisitions, setRequisitions] = useState<HRRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQuantity, setNewQuantity] = useState("2");
  const [newSalary, setNewSalary] = useState("15,000,000 - 20,000,000 đ");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hr/requisitions");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setRequisitions(result.data);
      } else {
        setRequisitions([]);
      }
    } catch (err) {
      console.warn("Failed to fetch requisitions from D1:", err);
      setRequisitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl">
          {toastMsg}
        </div>
      )}

      {/* Recruitment Pipeline Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "1. Đề xuất tuyển", val: "7", sub: "3 chờ TGĐ duyệt" },
          { label: "2. Đang đăng tin", val: "37", sub: "Vị trí tuyển dụng" },
          { label: "3. Hồ sơ ứng tuyển", val: "142", sub: "Hồ sơ tiếp nhận" },
          { label: "4. Đã phỏng vấn", val: "28", sub: "Vòng 1 & Vòng 2" },
          { label: "5. Đã phát Offer", val: "12", sub: "Chờ ứng viên chốt" },
          { label: "6. Tỷ lệ tuyển đúng", val: "94.2%", sub: "Đạt chỉ tiêu T8" },
        ].map((c, idx) => (
          <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">{c.label}</span>
            <div className="text-xl font-black text-slate-900">{c.val}</div>
            <span className="text-[9px] text-slate-400 font-medium block">{c.sub}</span>
          </div>
        ))}
      </div>

      {/* Recruitment Requisitions Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">Danh Sách Yêu Cầu Tuyển Dụng &amp; Luồng Trình Duyệt</h3>
            <p className="text-xs text-slate-500 font-medium">Quy trình: Nhân sự đề xuất → TP HR rà soát định biên → Trình Sếp Tổng (TGĐ) phê duyệt ngân sách</p>
          </div>

          <button
            onClick={() => setIsReqModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
          >
            <IconPlus size={16} />
            <span>Yêu Cầu Tuyển Dụng Mới</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Mã YC / Vị trí tuyển</th>
                <th className="px-4 py-3.5">Phòng ban đề xuất</th>
                <th className="px-4 py-3.5">Số lượng</th>
                <th className="px-4 py-3.5">Mức lương dự kiến</th>
                <th className="px-4 py-3.5">Trạng thái duyệt</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {requisitions.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-slate-900">{r.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{r.id} • Đề xuất bởi: {r.requesterName}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.department}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.quantity} người</td>
                  <td className="px-4 py-3 font-mono text-[#006838] font-bold">{r.salaryRange}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      r.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : r.status === "Pending_CEO"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {r.status === "Approved" ? "Sếp Tổng đã duyệt" : r.status === "Pending_CEO" ? "Chờ TGĐ duyệt" : "TP HR rà soát"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "Pending_CEO" ? (
                      <button
                        onClick={async () => {
                          try {
                            await fetch("/api/hr/requisitions", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ...r, status: "Approved" })
                            });
                            showToast(`Đã duyệt yêu cầu ${r.id}!`);
                            fetchRequisitions();
                          } catch (e) {}
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#006838] text-white font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <IconSend size={14} />
                        <span>Duyệt Yêu Cầu</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => showToast(`Xem danh sách ${r.applicantsCount} ứng viên vị trí ${r.title}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200"
                      >
                        Xem ứng viên ({r.applicantsCount})
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruitment Kanban Pipeline */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">Quy Trình Pipeline Phỏng Vấn &amp; Offer</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { stage: "Sàng lọc hồ sơ", count: 42, color: "bg-slate-100 text-slate-800" },
            { stage: "Hội đồng phỏng vấn", count: 18, color: "bg-blue-50 text-blue-800 border-blue-200" },
            { stage: "Phát Offer nhận việc", count: 8, color: "bg-amber-50 text-amber-800 border-amber-200" },
            { stage: "Đã chốt nhận việc", count: 12, color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
          ].map((col, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-800">{col.stage}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${col.color}`}>{col.count}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">Phạm Văn Minh</div>
                <div className="text-[10px] text-slate-400">Ứng tuyển: Dev React / Next.js</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REQUISITION MODAL */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Tạo Đề Xuất Tuyển Dụng Mới</h3>
              <button onClick={() => setIsReqModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await fetch("/api/hr/requisitions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: newTitle || "Chuyên Viên QC Lead Ca 2",
                    quantity: Number(newQuantity) || 2,
                    salaryRange: newSalary || "15,000,000 - 20,000,000 đ",
                    department: "Tổ hợp Kiên Giang - TBS Group",
                    status: "Pending_Manager"
                  })
                });
                showToast("✅ Đã tạo đề xuất tuyển dụng thành công vào CSDL D1!");
                fetchRequisitions();
              } catch(e) {}
              setIsReqModalOpen(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Vị trí cần tuyển</label>
                <input required type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="VD: Chuyên viên QC Lead Ca 2..." className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Số lượng tuyển</label>
                  <input required type="number" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium" />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Khung lương</label>
                  <input required type="text" value={newSalary} onChange={(e) => setNewSalary(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium" />
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsReqModalOpen(false)} className="flex-1 py-2.5 rounded-xl border font-bold">Hủy</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#006838] text-white font-bold">Gửi Trình Duyệt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
