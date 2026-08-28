'use client';

// Bộ lọc khoảng thời gian (Từ ngày - Đến ngày) dùng chung cho các trang cần lọc theo thời gian:
// Thời Gian Phản Hồi, Thông Báo, Đề Xuất Cải Tiến, Nhu Cầu Sửa Chữa.
export default function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
        title="Từ ngày"
      />
      <span className="text-xs text-gray-400">—</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
        title="Đến ngày"
      />
      {(from || to) && (
        <button
          onClick={() => { onFromChange(''); onToChange(''); }}
          className="text-xs font-bold text-gray-400 hover:text-gray-600 underline"
        >
          Xoá
        </button>
      )}
    </div>
  );
}

// So khớp 1 mốc thời gian ISO với khoảng [from, to] (dạng yyyy-mm-dd từ <input type="date">) —
// from/to rỗng nghĩa là không giới hạn phía đó.
export function inDateRange(iso: string | null | undefined, from: string, to: string): boolean {
  if (!iso) return !from && !to;
  const t = new Date(iso).getTime();
  if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && t > new Date(`${to}T23:59:59.999`).getTime()) return false;
  return true;
}
