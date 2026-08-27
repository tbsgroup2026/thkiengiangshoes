"use client";

import React from "react";
import Link from "next/link";
import { IconMapPin, IconClock, IconUsers, IconArrowRight } from "@tabler/icons-react";
import type { Job } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  "it": "Công nghệ",
  "san-xuat": "Sản xuất",
  "qc": "Kiểm soát chất lượng",
  "ky-thuat": "Kỹ thuật",
  "hanh-chinh-nhan-su": "Hành chính — Nhân sự",
  "ke-toan": "Kế toán",
  "logistics": "Logistics",
  "kinh-doanh": "Kinh doanh",
};

const CATEGORY_COLORS: Record<string, string> = {
  "it": "bg-blue-100 text-blue-700",
  "san-xuat": "bg-amber-100 text-amber-700",
  "qc": "bg-emerald-100 text-emerald-700",
  "ky-thuat": "bg-violet-100 text-violet-700",
  "hanh-chinh-nhan-su": "bg-rose-100 text-rose-700",
  "ke-toan": "bg-cyan-100 text-cyan-700",
  "logistics": "bg-orange-100 text-orange-700",
  "kinh-doanh": "bg-indigo-100 text-indigo-700",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hôm nay";
  if (days === 1) return "1 ngày trước";
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

interface JobCardProps {
  job: Job;
  compact?: boolean;
}

export default function JobCard({ job, compact = false }: JobCardProps) {
  const categoryLabel = CATEGORY_LABELS[job.category || ""] || "";
  const categoryColor = CATEGORY_COLORS[job.category || ""] || "bg-gray-100 text-gray-700";

  return (
    <div className="group bg-surface rounded-2xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        {/* Category + Time badges */}
        <div className="flex items-center justify-between mb-3">
          {categoryLabel && (
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${categoryColor}`}>
              {categoryLabel}
            </span>
          )}
          <span className="text-[11px] text-steel">{timeAgo(job.createdAt)}</span>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-ink group-hover:text-accent transition-colors mb-2 line-clamp-2">
          {job.title}
        </h3>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-steel mb-4">
          <span className="flex items-center gap-1">
            <IconMapPin size={14} className="text-accent" />
            {job.location}
          </span>
          {!compact && (
            <>
              <span className="flex items-center gap-1">
                <IconUsers size={14} className="text-accent" />
                {job.slots} vị trí
              </span>
              <span className="flex items-center gap-1">
                <IconClock size={14} className="text-accent" />
                {job.salary}
              </span>
            </>
          )}
        </div>

        {/* Description preview */}
        {!compact && (
          <p className="text-sm text-steel line-clamp-3 mb-4 leading-relaxed">
            {job.description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs font-medium text-accent">
            {job._count?.applications ?? job.applyCount} lượt ứng tuyển
          </span>
          <Link
            href={`/careers/${job.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-light active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            Xem Chi Tiết
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
