'use client';

import { useEffect, useState } from 'react';
import { IconArrowLeft, IconClock, IconDeviceFloppy, IconAlertTriangle, IconCheck } from '@tabler/icons-react';

type SlotWindow = { slot: string; startTime: string; endTime: string };

// Tên gọi thân thiện cho từng khung — "08:00" là mốc ĐẦU CA (chuẩn bị xong TRƯỚC giờ chạy), 8 khung
// còn lại là các mốc CẬP NHẬT SỐ LƯỢNG trong ca.
const SLOT_LABEL: Record<string, string> = {
  '08:00': 'Đầu ca (chuẩn bị)',
  '08:30': 'Khung 08:30',
  '09:30': 'Khung 09:30',
  '10:30': 'Khung 10:30',
  '11:30': 'Khung 11:30',
  '13:30': 'Khung 13:30',
  '14:30': 'Khung 14:30',
  '15:30': 'Khung 15:30',
  '16:30': 'Khung 16:30',
};

// "Ràng buộc thời gian" — cấu hình giờ MỞ/ĐÓNG dùng CHUNG cho toàn hệ thống (không phải riêng từng
// điểm quét), áp dụng cho cả 9 khung PPH. LƯU Ý: màn hình này CHỈ để CHỈNH giá trị lưu ở D1 (dùng
// cho đồng hồ đếm ngược ở trang quét /pph-scan) — CHƯA bật chặn nộp sớm/trễ theo giờ này (việc chặn
// thật vẫn theo cờ PPH_DEMO_SKIP_TIME_GATE + luật cũ, không đổi ở đây theo đúng yêu cầu).
export default function PphSlotWindowsView({ onBack }: { onBack: () => void }) {
  const [windows, setWindows] = useState<SlotWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pph/slot-windows').then((r) => r.json());
      if (res.success && Array.isArray(res.windows)) {
        setWindows(res.windows);
      } else {
        setError(res.error || 'Không tải được cấu hình giờ');
      }
    } catch {
      setError('Không kết nối được tới hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  function updateWindow(slot: string, field: 'startTime' | 'endTime', value: string) {
    setSaved(false);
    setWindows((prev) => prev.map((w) => (w.slot === slot ? { ...w, [field]: value } : w)));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/pph/slot-windows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windows }),
      });
      const result = await res.json();
      if (!result.success) {
        setSaveError(result.error || 'Không lưu được');
        return;
      }
      setWindows(result.windows || windows);
      setSaved(true);
    } catch {
      setSaveError('Không kết nối được tới hệ thống');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 my-auto">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center flex-shrink-0"
          title="Quay lại Cài Đặt"
        >
          <IconArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <IconClock size={20} className="text-[#006838]" /> Ràng Buộc Thời Gian
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Giờ mở/đóng của mỗi khung — dùng chung cho toàn hệ thống, mọi Tổ/Chuyền. Hiện tại chỉ để hiển thị đếm ngược
            ở trang quét, <span className="font-bold text-slate-600">chưa chặn nộp sớm/trễ theo giờ này</span>.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">⚠️ {error}</div>
      )}

      {loading ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-base text-slate-400">Đang tải...</div>
      ) : (
        !error && (
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {windows.map((w) => (
                <div key={w.slot} className="flex items-center gap-3 flex-wrap px-4 sm:px-5 py-3.5">
                  <div className="font-black text-slate-900 text-sm w-40 flex-shrink-0">{SLOT_LABEL[w.slot] || w.slot}</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>Mở lúc</span>
                    <input
                      type="time"
                      value={w.startTime}
                      onChange={(e) => updateWindow(w.slot, 'startTime', e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-[#006838]"
                    />
                    <span>→ Đóng lúc</span>
                    <input
                      type="time"
                      value={w.endTime}
                      onChange={(e) => updateWindow(w.slot, 'endTime', e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-[#006838]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <IconAlertTriangle size={16} /> {saveError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#006838] text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
        >
          <IconDeviceFloppy size={16} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            <IconCheck size={16} /> Đã lưu
          </span>
        )}
      </div>
    </div>
  );
}
