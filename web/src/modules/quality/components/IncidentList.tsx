"use client";

import React, { useState } from "react";
import { IncidentItem } from "../types";
import {
  IconAlertTriangle,
  IconClock,
  IconExternalLink,
  IconCheck,
  IconLoader2,
  IconPlayerPlay,
  IconListDetails,
} from "@tabler/icons-react";

interface IncidentListProps {
  incidents: IncidentItem[];
  portalUrl?: string;
}

export default function IncidentList({ incidents, portalUrl }: IncidentListProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredIncidents =
    filter === "all" ? incidents : incidents.filter((i) => i.status === filter);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0 border border-rose-100">
            <IconAlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Danh Sách Sự Cố Cần Xử Lý (Nhà Máy KG1)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Phiếu phát hiện lỗi chất lượng và yêu cầu bảo trì trực tiếp trên chuyền sản xuất
            </p>
          </div>
        </div>

        {/* Filter Pills & Portal Link */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === "all" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
              }`}
            >
              Tất cả ({incidents.length})
            </button>
            <button
              onClick={() => setFilter("unprocessed")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === "unprocessed" ? "bg-amber-100 text-amber-900 shadow-2xs" : "hover:text-slate-900"
              }`}
            >
              Chờ tiếp nhận
            </button>
            <button
              onClick={() => setFilter("processing")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === "processing" ? "bg-blue-100 text-blue-900 shadow-2xs" : "hover:text-slate-900"
              }`}
            >
              Đang sửa chữa
            </button>
          </div>

          {portalUrl && (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-[#006838] hover:bg-[#006838] hover:text-white border border-emerald-200 text-xs font-black transition-all cursor-pointer shadow-2xs"
            >
              <span>Xem trên Portal KG1</span>
              <IconExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Incident List Rows */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => {
          let statusBadge = (
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-black flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Chờ tiếp nhận
            </span>
          );

          if (incident.status === "processing") {
            statusBadge = (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black flex items-center gap-1.5 shadow-2xs">
                <IconLoader2 size={13} className="animate-spin-slow" />
                Đang xử lý
              </span>
            );
          } else if (incident.status === "trial") {
            statusBadge = (
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-black flex items-center gap-1.5 shadow-2xs">
                <IconPlayerPlay size={13} />
                Chạy thử
              </span>
            );
          } else if (incident.status === "completed") {
            statusBadge = (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#006838] border border-emerald-200 text-[11px] font-black flex items-center gap-1.5 shadow-2xs">
                <IconCheck size={13} />
                Đã nghiệm thu
              </span>
            );
          }

          return (
            <div
              key={incident.id}
              className="p-4 rounded-xl border border-slate-200/90 hover:border-[#006838] hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group bg-white shadow-2xs"
            >
              {/* Left Details */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {incident.code}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {incident.workshop} → {incident.line} → {incident.team}
                  </span>
                  {incident.severity === "critical" && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                      SOS
                    </span>
                  )}
                </div>

                <div className="text-sm font-black text-slate-900 group-hover:text-[#006838] transition-colors truncate">
                  {incident.errorType}
                </div>

                <div className="text-xs text-slate-400 font-medium flex items-center gap-3">
                  <span>Người báo: <strong className="text-slate-700">{incident.reporter}</strong></span>
                  <span>•</span>
                  <span>{incident.createdAt}</span>
                </div>
              </div>

              {/* Right Status & Metric */}
              <div className="flex items-center gap-3 sm:flex-col sm:items-end justify-between flex-shrink-0">
                {statusBadge}

                {incident.slaRemaining && (
                  <div className="text-xs font-black text-amber-800 flex items-center gap-1">
                    <IconClock size={13} />
                    <span>SLA còn: {incident.slaRemaining}</span>
                  </div>
                )}

                {incident.mttrMinutes && (
                  <div className="text-xs font-bold text-slate-500">
                    MTTR: <strong className="text-slate-800">{incident.mttrMinutes} phút</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
