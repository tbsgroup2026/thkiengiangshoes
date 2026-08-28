'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IconTarget } from '@tabler/icons-react';

export type ParetoItem = { label: string; value: number };

// Biểu đồ Pareto dùng chung — cột (giá trị) + đường (tích lũy %), 2 trục Y. Tự tính "tập trung N
// mục đạt 80% tác động" (nguyên lý 80/20) để làm nổi bật phần quan trọng nhất, giống các báo cáo
// Pareto thực tế. Màu theo bảng màu sáng của trang (accent xanh lá + tím làm điểm nhấn tích lũy).
export default function ParetoChart({
  data,
  valueLabel = 'Số lượng',
  barColor = '#0d7a5c',
  height = 320,
  maxItems = 12,
}: {
  data: ParetoItem[];
  valueLabel?: string;
  barColor?: string;
  height?: number;
  maxItems?: number;
}) {
  const [showValues, setShowValues] = useState(false);

  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, maxItems);
    const total = sorted.reduce((s, d) => s + d.value, 0);
    let running = 0;
    return sorted.map((d) => {
      running += d.value;
      return { ...d, cumulativePct: total ? Math.round((running / total) * 1000) / 10 : 0 };
    });
  }, [data, maxItems]);

  const focusCount = useMemo(() => {
    const idx = chartData.findIndex((d) => d.cumulativePct >= 80);
    return idx === -1 ? chartData.length : idx + 1;
  }, [chartData]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center text-xs text-gray-400" style={{ height }}>Chưa có dữ liệu</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-wash text-accent text-[11px] font-bold">
          <IconTarget size={13} /> Tập trung: {focusCount} mục (80% tác động)
        </span>
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 cursor-pointer select-none">
          <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} className="accent-accent" />
          Hiển thị giá trị
        </label>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7ede9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#6b7c73' }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={70}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#6b7c73' }} label={{ value: valueLabel, angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6b7c73' }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7c73' }} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e7ede9', fontSize: 11, boxShadow: '0 8px 24px rgba(12,31,25,0.12)' }}
            formatter={(value, name) => (name === 'Tích luỹ (%)' ? [`${value}%`, name] : [value, name])}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar yAxisId="left" dataKey="value" name={valueLabel} fill={barColor} radius={[6, 6, 0, 0]} maxBarSize={44}>
            {showValues && <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#4b5f56', fontWeight: 700 }} />}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="cumulativePct" name="Tích luỹ (%)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
