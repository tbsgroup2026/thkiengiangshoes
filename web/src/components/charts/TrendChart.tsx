'use client';

import { useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IconChartBar, IconChartLine } from '@tabler/icons-react';

export type TrendPoint = { label: string; downtime: number; mtta: number; mttr: number; mttd: number };

const TARGETS = { mtta: 5, mttr: 25, mttd: 30 };

// Trend Analysis — Downtime (trục trái, thang phút lớn) tách trục khỏi MTTA/MTTR/MTTD (trục phải,
// thang phút nhỏ) để 3 đường KPI không bị "dẹt" xuống gần 0 khi vẽ chung 1 trục với Downtime (lỗi
// thường gặp khi ghép 2 loại số liệu chênh lệch quy mô lớn). Có đường tham chiếu Mục tiêu KPI.
export default function TrendChart({ data, height = 340 }: { data: TrendPoint[]; height?: number }) {
  const [mode, setMode] = useState<'line' | 'bar'>('line');
  const [visible, setVisible] = useState({ mtta: true, mttr: true, mttd: true });

  if (data.length === 0) {
    return <div className="flex items-center justify-center text-xs text-gray-400" style={{ height }}>Chưa có dữ liệu trong khoảng thời gian này</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          {(['mtta', 'mttr', 'mttd'] as const).map((k) => (
            <label key={k} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 cursor-pointer select-none uppercase">
              <input
                type="checkbox"
                checked={visible[k]}
                onChange={(e) => setVisible((v) => ({ ...v, [k]: e.target.checked }))}
                className="accent-accent"
              />
              {k}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setMode('line')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold transition ${mode === 'line' ? 'bg-tbs-dark text-white' : 'text-gray-500 hover:text-tbs-dark'}`}
          >
            <IconChartLine size={13} /> Đường
          </button>
          <button
            onClick={() => setMode('bar')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold transition ${mode === 'bar' ? 'bg-tbs-dark text-white' : 'text-gray-500 hover:text-tbs-dark'}`}
          >
            <IconChartBar size={13} /> Cột
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7ede9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7c73' }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#6b7c73' }} label={{ value: 'Downtime (phút)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6b7c73' }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#6b7c73' }} label={{ value: 'MTTA / MTTR / MTTD (phút)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#6b7c73' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7ede9', fontSize: 11, boxShadow: '0 8px 24px rgba(12,31,25,0.12)' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />

          {mode === 'bar' ? (
            <Bar yAxisId="left" dataKey="downtime" name="Tổng Downtime" fill="#a7d9c4" radius={[6, 6, 0, 0]} maxBarSize={40} />
          ) : (
            <Line yAxisId="left" type="monotone" dataKey="downtime" name="Tổng Downtime" stroke="#0d7a5c" strokeWidth={2.5} dot={{ r: 3 }} />
          )}

          {visible.mtta && <Line yAxisId="right" type="monotone" dataKey="mtta" name="MTTA" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2.5 }} />}
          {visible.mttr && <Line yAxisId="right" type="monotone" dataKey="mttr" name="MTTR" stroke="#e11d48" strokeWidth={2} dot={{ r: 2.5 }} />}
          {visible.mttd && <Line yAxisId="right" type="monotone" dataKey="mttd" name="MTTD" stroke="#6366f1" strokeWidth={2} dot={{ r: 2.5 }} />}

          {visible.mtta && <ReferenceLine yAxisId="right" y={TARGETS.mtta} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />}
          {visible.mttr && <ReferenceLine yAxisId="right" y={TARGETS.mttr} stroke="#e11d48" strokeDasharray="4 4" strokeOpacity={0.5} />}
          {visible.mttd && <ReferenceLine yAxisId="right" y={TARGETS.mttd} stroke="#6366f1" strokeDasharray="4 4" strokeOpacity={0.5} />}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-2 text-[10px] font-semibold text-gray-400">
        <span>┄ Mục tiêu: MTTA ≤ {TARGETS.mtta} phút</span>
        <span>┄ MTTR ≤ {TARGETS.mttr} phút</span>
        <span>┄ MTTD ≤ {TARGETS.mttd} phút</span>
      </div>
    </div>
  );
}
