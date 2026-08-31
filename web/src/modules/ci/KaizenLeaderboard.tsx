"use client";

import React, { useState, useEffect } from "react";
import {
  IconTrophy,
  IconStar,
  IconClock,
  IconAward,
  IconRefresh,
  IconBuildingFactory,
  IconUser,
  IconSparkles,
} from "@tabler/icons-react";
import { KaizenProposal } from "./CIModule";

interface KaizenLeaderboardProps {
  proposals?: KaizenProposal[];
  onSelectProposal?: (p: KaizenProposal) => void;
}

export default function KaizenLeaderboard({
  proposals = [],
  onSelectProposal,
}: KaizenLeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ci-kaizen/ranking");
      const json = await res.json();
      if (json.success && Array.isArray(json.leaderboard)) {
        setLeaderboardData(json.leaderboard);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Compute fallback data if API returns empty
  const displayList = leaderboardData.length > 0
    ? leaderboardData
    : proposals
        .filter(
          (p) =>
            p.trang_thai === "DA_DANH_GIA" ||
            p.sub_status === "DA_DANH_GIA" ||
            (p.score_points && p.score_points > 0)
        )
        .map((p, idx) => ({
          ...p,
          hang_xep: idx + 1,
          so_giay_tiet_kiem: p.so_giay_tiet_kiem || p.saved_seconds || 30,
          diem_hieu_qua: p.diem_hieu_qua || p.score_points || 85,
          diem_tong_hop: (p.so_giay_tiet_kiem || p.saved_seconds || 30) + (p.diem_hieu_qua || p.score_points || 85),
        }))
        .sort((a, b) => b.diem_tong_hop - a.diem_tong_hop);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-0">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b1739] via-[#0b1739] to-[#006838] p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md">
            <IconTrophy size={24} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              Bảng Xếp Hạng Ý Tưởng Cải Tiến Kaizen
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Tổng hợp điểm số = Số giây tiết kiệm + Điểm hiệu quả (Cập nhật tự động)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchLeaderboard}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
        >
          <IconRefresh size={15} className={loading ? "animate-spin" : ""} />
          <span>Làm mới xếp hạng</span>
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-wider">
              <th className="py-3 px-4 text-center w-16">HẠNG</th>
              <th className="py-3 px-4">NGƯỜI ĐỀ XUẤT</th>
              <th className="py-3 px-4">ĐƠN VỊ / LINE</th>
              <th className="py-3 px-4">TÊN CẢI TIẾN</th>
              <th className="py-3 px-4 text-center">TIẾT KIỆM (S)</th>
              <th className="py-3 px-4 text-center">HIỆU QUẢ</th>
              <th className="py-3 px-4 text-right">ĐIỂM TỔNG HỢP</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {displayList.length > 0 ? (
              displayList.map((item, idx) => {
                const rank = idx + 1;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectProposal && onSelectProposal(item)}
                    className="hover:bg-amber-50/50 transition-colors cursor-pointer"
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {rank === 1 ? (
                        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-black text-sm flex items-center justify-center mx-auto border border-amber-300 shadow-2xs">
                          🏆 1
                        </span>
                      ) : rank === 2 ? (
                        <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center mx-auto border border-slate-300 shadow-2xs">
                          🥈 2
                        </span>
                      ) : rank === 3 ? (
                        <span className="w-8 h-8 rounded-full bg-amber-900/10 text-amber-800 font-black text-sm flex items-center justify-center mx-auto border border-amber-800/30 shadow-2xs">
                          🥉 3
                        </span>
                      ) : (
                        <span className="font-extrabold text-slate-600 text-xs">
                          #{rank}
                        </span>
                      )}
                    </td>

                    {/* Proposer */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 block text-xs">
                        {item.proposer_name || "Nhân viên"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        MSNV: {item.proposer_emp_code || item.code || "CBCNV"}
                      </span>
                    </td>

                    {/* Area & Line */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 text-[11px] block">
                        {item.factory || item.region || "Kiên Giang"}
                      </span>
                      {item.line && (
                        <span className="text-[10px] text-slate-500 block">
                          Line: {item.line}
                        </span>
                      )}
                    </td>

                    {/* Proposal Title */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-extrabold text-slate-900 text-xs line-clamp-1" title={item.title}>
                        {item.title}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        {item.category_label || item.category}
                      </span>
                    </td>

                    {/* Savings Seconds */}
                    <td className="py-3.5 px-4 text-center font-black text-blue-700 text-xs">
                      ⚡ {item.so_giay_tiet_kiem || item.saved_seconds || 0}s
                    </td>

                    {/* Efficiency Score */}
                    <td className="py-3.5 px-4 text-center font-black text-amber-600 text-xs">
                      ⭐ {item.diem_hieu_qua || item.score_points || 0}đ
                    </td>

                    {/* Composite Score */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                        {item.diem_tong_hop || (item.so_giay_tiet_kiem || 0) + (item.diem_hieu_qua || 0)}đ
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <IconTrophy size={32} className="text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">
                      Chưa có đề xuất nào đạt sơ duyệt hiện trường (`DA_DANH_GIA`)
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
