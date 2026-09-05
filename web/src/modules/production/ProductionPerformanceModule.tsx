'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IconCircleFilled,
  IconBuildingFactory2,
  IconSettings,
  IconRefresh,
  IconCalendar,
  IconAlertTriangle,
  IconUser,
  IconX,
  IconChevronLeft,
  IconClipboardList,
  IconChartBar,
} from '@tabler/icons-react';
import PphSettingsView from './PphSettingsView';

type EntryStatus = 'ontime' | 'late' | 'missing';
type HourStatus = 'ok' | 'warn' | 'bad' | 'pending';

type PphSlot = {
  slot: string;
  actualQty: number | null;
  filled: boolean;
  submittedBy?: string | null;
  submittedAt?: string | null;
  shortfallReason?: string | null;
  shortfallSolution?: string | null;
};
type PphLeaf = {
  id: string;
  name: string;
  path: string;
  setup: { workerCount: number; model: string; plannedQty: number; targetRft: number } | null;
  slots: PphSlot[];
  pphLatest: number | null;
  efficiencyPctLatest: number | null;
  perHourTarget: number;
  cumulativeActual: number;
  cumulativeTarget: number;
  entryStatus: EntryStatus;
};
type PphDashboardFactory = { id: string; name: string; leaves: PphLeaf[] };
type PphDashboardResponse = { success: boolean; data?: { date: string; factories: PphDashboardFactory[] }; error?: string };

// Bảng màu tối "executive dashboard" — chỉ áp dụng RIÊNG cho khối Hiệu Suất Nhà Máy này, phần
// khung/menu chung của trang /work vẫn giữ nền sáng như cũ.
const ENTRY_LABEL: Record<EntryStatus, { label: string; cls: string }> = {
  ontime: { label: 'Đúng giờ', cls: 'bg-emerald-500/15 text-emerald-300' },
  late: { label: 'Nhập trễ', cls: 'bg-amber-500/15 text-amber-300' },
  missing: { label: 'Chưa nhập', cls: 'bg-rose-500/15 text-rose-300' },
};

const STATUS_BAR_CLS: Record<HourStatus, string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-400',
  bad: 'bg-rose-500',
  pending: 'bg-white/10',
};

const STATUS_DOT_LABEL: { key: 'ok' | 'warn' | 'bad'; label: string; cls: string }[] = [
  { key: 'ok', label: 'Đạt chỉ tiêu', cls: 'bg-emerald-500' },
  { key: 'warn', label: 'Gần đạt', cls: 'bg-amber-400' },
  { key: 'bad', label: 'Chưa đạt', cls: 'bg-rose-500' },
];

// Màu riêng cho từng Nhà máy trong danh sách bên trái — ghi cứng tên class Tailwind (không nội
// suy chuỗi) để Tailwind nhận diện đúng lúc build. Nhà máy ngoài danh sách (VD thêm mới sau) rơi
// về DEFAULT_STYLE, không vỡ giao diện.
const FACTORY_STYLE_LIST = [
  { border: 'border-l-blue-500', iconBg: 'bg-blue-500/15', iconText: 'text-blue-400', tagText: 'text-blue-400' },
  { border: 'border-l-violet-500', iconBg: 'bg-violet-500/15', iconText: 'text-violet-400', tagText: 'text-violet-400' },
  { border: 'border-l-amber-500', iconBg: 'bg-amber-500/15', iconText: 'text-amber-400', tagText: 'text-amber-400' },
  { border: 'border-l-rose-500', iconBg: 'bg-rose-500/15', iconText: 'text-rose-400', tagText: 'text-rose-400' },
  { border: 'border-l-sky-500', iconBg: 'bg-sky-500/15', iconText: 'text-sky-400', tagText: 'text-sky-400' },
];
const DEFAULT_STYLE = FACTORY_STYLE_LIST[0];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function slotStatus(actual: number | null, target: number): HourStatus {
  if (actual == null) return 'pending';
  if (target <= 0) return actual > 0 ? 'ok' : 'pending';
  const ratio = actual / target;
  return ratio >= 0.95 ? 'ok' : ratio >= 0.75 ? 'warn' : 'bad';
}

// slotData chỉ có khi đang xem RIÊNG 1 Tổ (leafHours) — mỗi cột khi đó ứng với đúng 1 lượt nhập
// thật, bấm vào xem được ai nhập/nguyên nhân/giải pháp. Xem TOÀN nhà máy (aggregateHours) là số
// cộng dồn nhiều Tổ nên không gắn được với 1 người nhập cụ thể — không cho bấm.
type HourPoint = { time: string; actual: number | null; target: number; status: HourStatus; slotData?: PphSlot };

function leafHours(leaf: PphLeaf): HourPoint[] {
  return leaf.slots.map((s) => ({
    time: s.slot,
    actual: s.actualQty,
    target: leaf.perHourTarget,
    status: slotStatus(s.actualQty, leaf.perHourTarget),
    slotData: s,
  }));
}

// Gộp sản lượng theo giờ của TẤT CẢ điểm quét trong 1 Nhà máy thành 1 chuỗi giờ tổng (khi chưa
// chọn riêng 1 điểm) — cộng dồn thực tế + chỉ tiêu từng khung giờ, khung nào chưa ai nhập thì để
// trống (pending), không tính là 0.
function aggregateHours(leaves: PphLeaf[]): HourPoint[] {
  if (leaves.length === 0) return [];
  const slotCount = leaves[0].slots.length;
  const points: HourPoint[] = [];
  for (let idx = 0; idx < slotCount; idx++) {
    const time = leaves[0].slots[idx]?.slot ?? '';
    let actualSum = 0;
    let targetSum = 0;
    let hasData = false;
    for (const l of leaves) {
      const s = l.slots[idx];
      targetSum += l.perHourTarget;
      if (s && s.actualQty != null) {
        actualSum += s.actualQty;
        hasData = true;
      }
    }
    points.push(hasData ? { time, actual: actualSum, target: targetSum, status: slotStatus(actualSum, targetSum) } : { time, actual: null, target: targetSum, status: 'pending' });
  }
  return points;
}

const POLL_MS = 60_000;

// "Hôm nay" tính theo giờ VN (UTC+7), khớp đúng cách backend pphTodayStr() tính — không dùng
// new Date().toISOString() trực tiếp (theo UTC, có thể lệch 1 ngày tuỳ giờ trong ngày).
function todayVNStr(): string {
  const vn = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return vn.toISOString().slice(0, 10);
}

function formatDateVN(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function nowVNMinutes(): number {
  const vn = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return vn.getUTCHours() * 60 + vn.getUTCMinutes();
}

function slotMinutes(slot: string): number {
  const [h, m] = slot.split(':').map(Number);
  return h * 60 + m;
}

// Trạng thái 1 khung giờ cụ thể của 1 Tổ — dùng cho bảng chi tiết khi đang lọc riêng 1 Tổ.
function slotDueState(slot: string, filled: boolean, isToday: boolean): { label: string; cls: string } {
  if (filled) return { label: 'Đã cập nhật', cls: 'bg-emerald-500/15 text-emerald-300' };
  const due = !isToday || nowVNMinutes() >= slotMinutes(slot) - 10;
  return due ? { label: 'Chưa nhập', cls: 'bg-rose-500/15 text-rose-300' } : { label: 'Chưa tới giờ', cls: 'bg-white/5 text-slate-500' };
}

// Hiệu Suất Nhà Máy — dữ liệu THẬT từ các lượt quét QR ở /pph-scan (bảng pph_entries), gộp theo
// đúng cây Nhà máy/Xưởng/Chuyền/Tổ đang cấu hình ở trang Cài Đặt. Mặc định xem HÔM NAY, tự làm
// mới mỗi 60s cho cảm giác gần-realtime; chọn 1 ngày khác thì xem đúng dữ liệu ngày đó (không tự
// làm mới nữa vì dữ liệu ngày cũ không đổi). Giao diện dạng "executive dashboard" nền tối — chỉ
// riêng khối này, không đổi màu phần khung/menu chung của trang /work.
export default function ProductionPerformanceModule({
  viewerName,
  viewerTitle,
}: {
  viewerName?: string;
  viewerTitle?: string;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [factories, setFactories] = useState<PphDashboardFactory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => todayVNStr());
  const [factoryId, setFactoryId] = useState<string>('');
  const [leafId, setLeafId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(true);
  // Popup chi tiết 1 khung giờ — bấm từ cột trên biểu đồ HOẶC từ ô Sản lượng trong bảng chi tiết
  // (đang xem riêng 1 Tổ) đều mở popup này. actualQty/submittedBy luôn có khi khung đã nhập;
  // reason/solution chỉ có khi khung đó từng hụt chỉ tiêu/giờ.
  const [slotPopup, setSlotPopup] = useState<PphSlot | null>(null);
  const firstLoadRef = useRef(true);
  const isToday = selectedDate === todayVNStr();

  const load = useCallback(async (opts?: { silent?: boolean; fresh?: boolean; date?: string }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('date', opts?.date || selectedDate);
      if (opts?.fresh) params.set('fresh', '1');
      const res = await fetch(`/api/pph/dashboard?${params.toString()}`);
      const json: PphDashboardResponse = await res.json();
      if (json.success && json.data) {
        setFactories(json.data.factories);
        setError(null);
        setLastUpdated(new Date());
        if (firstLoadRef.current) {
          setFactoryId((prev) => prev || json.data!.factories[0]?.id || '');
          firstLoadRef.current = false;
        }
      } else {
        setError(json.error || 'Không tải được dữ liệu');
      }
    } catch {
      setError('Không kết nối được tới hệ thống');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
    if (!isToday) return; // Ngày quá khứ không đổi nữa — không cần tự làm mới định kỳ.
    const timer = setInterval(() => load({ silent: true }), POLL_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, isToday]);

  const factory = factories.find((f) => f.id === factoryId) ?? null;
  const leaf = factory && leafId ? factory.leaves.find((l) => l.id === leafId) ?? null : null;

  // Bấm 1 Nhà máy: nếu đang chọn nhà máy khác -> mở rộng xem con của nó (ẩn 2 nhà máy còn lại).
  // Bấm lại đúng nhà máy đang mở rộng -> thu gọn về hiện đủ danh sách. Bấm 1 mục con (Tổ/Chuyền)
  // -> chọn luôn mục đó VÀ tự thu gọn về hiện đủ danh sách (theo đúng yêu cầu).
  function handleSelectFactory(id: string) {
    if (id === factoryId && pickerOpen) {
      setPickerOpen(false);
      return;
    }
    setFactoryId(id);
    setLeafId(null);
    setPickerOpen(true);
  }
  function handleSelectLeaf(id: string | null) {
    setLeafId(id);
    setPickerOpen(false);
  }

  const leavesMeetingTargetNow = useMemo(() => {
    if (!factory) return { met: 0, total: 0 };
    let met = 0;
    for (const l of factory.leaves) {
      const doneHours = l.slots.filter((s) => s.actualQty != null);
      const lastSlot = doneHours[doneHours.length - 1];
      if (lastSlot && slotStatus(lastSlot.actualQty, l.perHourTarget) === 'ok') met++;
    }
    return { met, total: factory.leaves.length };
  }, [factory]);

  // Số liệu tổng hợp CẢ NHÀ MÁY — dùng khi chưa chọn riêng 1 điểm quét.
  const factoryAggregate = useMemo(() => {
    if (!factory) return null;
    const activeLeaves = factory.leaves.filter((l) => l.entryStatus !== 'missing');
    const avg = (arr: number[]) => (arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0);
    const pphVals = activeLeaves.map((l) => l.pphLatest).filter((v): v is number => v != null);
    const effVals = activeLeaves.map((l) => l.efficiencyPctLatest).filter((v): v is number => v != null);
    const rftVals = factory.leaves.map((l) => l.setup?.targetRft).filter((v): v is number => v != null);
    const totalWorkers = factory.leaves.reduce((s, l) => s + (l.setup?.workerCount || 0), 0);
    const totalTargetPerHour = factory.leaves.reduce((s, l) => s + l.perHourTarget, 0);
    const cumulativeActual = factory.leaves.reduce((s, l) => s + l.cumulativeActual, 0);
    const cumulativeTarget = factory.leaves.reduce((s, l) => s + l.cumulativeTarget, 0);
    return {
      pph: pphVals.length ? round1(avg(pphVals)) : null,
      targetRftPct: rftVals.length ? round1(avg(rftVals)) : null,
      efficiencyPct: effVals.length ? round1(avg(effVals)) : null,
      totalWorkers,
      totalTargetPerHour: round1(totalTargetPerHour),
      cumulativeActual,
      cumulativeTarget,
      hours: aggregateHours(factory.leaves),
    };
  }, [factory]);

  if (showSettings) {
    return <PphSettingsView onClose={() => { setShowSettings(false); load({ fresh: true }); }} />;
  }

  const headerProps = { lastUpdated, selectedDate, onDateChange: setSelectedDate, onRefresh: () => load({ fresh: true }), onOpenSettings: () => setShowSettings(true), viewerName, viewerTitle };

  if (loading && factories.length === 0) {
    return (
      <DarkShell>
        <Header {...headerProps} />
        <div className="p-12 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-sm text-slate-400">Đang tải dữ liệu...</div>
      </DarkShell>
    );
  }

  if (error && factories.length === 0) {
    return (
      <DarkShell>
        <Header {...headerProps} />
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center text-sm text-rose-300 font-semibold">⚠️ {error}</div>
      </DarkShell>
    );
  }

  if (factories.length === 0) {
    return (
      <DarkShell>
        <Header {...headerProps} />
        <div className="p-12 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-sm text-slate-400 space-y-2">
          <p>Chưa có Nhà máy nào được cấu hình.</p>
          <button type="button" onClick={() => setShowSettings(true)} className="text-blue-400 font-bold hover:underline">
            Vào Cài Đặt để thêm Nhà máy / Xưởng / Chuyền / Tổ →
          </button>
        </div>
      </DarkShell>
    );
  }

  const hours: HourPoint[] = leaf ? leafHours(leaf) : factoryAggregate?.hours ?? [];
  const chartTarget = leaf ? leaf.perHourTarget : factoryAggregate?.totalTargetPerHour ?? 0;

  const statCards = factory && factoryAggregate ? [
    { label: 'PPH trung bình', value: fmtOrDash(leaf ? leaf.pphLatest : factoryAggregate.pph), unit: 'đôi/giờ', accent: 'border-t-blue-500', valueCls: 'text-white' },
    { label: 'Mục tiêu RFT', value: fmtPctOrDash(leaf ? leaf.setup?.targetRft ?? null : factoryAggregate.targetRftPct), unit: '', accent: 'border-t-emerald-500', valueCls: 'text-emerald-400' },
    { label: 'Hiệu suất tổng', value: fmtPctOrDash(leaf ? leaf.efficiencyPctLatest : factoryAggregate.efficiencyPct), unit: '', accent: 'border-t-amber-500', valueCls: 'text-amber-400' },
    { label: 'Đạt chỉ tiêu giờ này', value: `${leavesMeetingTargetNow.met}/${leavesMeetingTargetNow.total}`, unit: 'điểm quét', accent: 'border-t-violet-500', valueCls: 'text-violet-400' },
  ] : [];

  return (
    <DarkShell>
      <Header {...headerProps} />

      <div className="grid grid-cols-1 @lg:grid-cols-12 gap-4">
        {/* CỘT TRÁI — Danh sách Nhà máy + Thông số — thu hẹp còn 1 nửa (2/12 thay vì 4/12) để
            nhường thêm diện tích cho cột phải (biểu đồ + bảng). */}
        <div className="@lg:col-span-2 space-y-4">
          <FactoryListPanel
            factories={factories}
            factoryId={factoryId}
            leafId={leafId}
            pickerOpen={pickerOpen}
            onSelectFactory={handleSelectFactory}
            onSelectLeaf={handleSelectLeaf}
            onCollapse={() => setPickerOpen(false)}
          />
          {factory && factoryAggregate && <InfoPanel leaf={leaf} factory={factory} factoryAggregate={factoryAggregate} />}
        </div>

        {/* CỘT PHẢI — Chỉ số nhanh + Biểu đồ + Bảng chi tiết */}
        <div className="@lg:col-span-10 space-y-4">
          {factory && factoryAggregate && (
            <>
              <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3">
                {statCards.map((c) => (
                  <div key={c.label} className={`rounded-2xl bg-[#111d33] border border-white/10 border-t-4 ${c.accent} p-4`}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{c.label}</div>
                    <div className={`text-xl font-black mt-1.5 ${c.valueCls}`}>
                      {c.value} {c.unit && <span className="text-[10px] font-bold text-slate-500">{c.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Biểu đồ sản lượng theo giờ */}
              <div className="rounded-2xl bg-[#111d33] border border-white/10 p-4 sm:p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                      <IconChartBar size={14} className="text-blue-400" />
                      Sản Lượng Theo Giờ ({leaf ? leaf.name : `Toàn ${factory.name}`})
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {leaf
                        ? `${leaf.setup?.model || 'Chưa có model'} · Chỉ tiêu ${leaf.perHourTarget} đôi/giờ`
                        : `${factory.leaves.length} điểm quét · Tổng chỉ tiêu ${chartTarget} đôi/giờ`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                    {STATUS_DOT_LABEL.map((s) => (
                      <span key={s.key} className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${s.cls}`} /> {s.label}
                      </span>
                    ))}
                  </div>
                </div>
                {hours.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-xs text-slate-500">Chưa có dữ liệu khung giờ nào hôm nay.</div>
                ) : (
                  <div className="flex items-end gap-2 sm:gap-3 h-40">
                    {hours.map((h) => {
                      const heightPct = h.actual != null && h.target > 0 ? Math.max(8, Math.min(100, (h.actual / h.target) * 80)) : 4;
                      // Chỉ bấm được khi đang xem RIÊNG 1 Tổ (có slotData gắn với đúng 1 lượt
                      // nhập) VÀ khung đó đã có người nhập — xem toàn nhà máy là số cộng dồn
                      // nhiều Tổ, không gắn được với 1 người nhập cụ thể nên không cho bấm.
                      const clickable = !!(h.slotData && h.slotData.filled);
                      const barCore = (
                        <>
                          {h.actual != null && <span className="text-[10px] font-bold text-slate-300 mb-1">{h.actual}</span>}
                          <div className={`w-full rounded-t-lg ${STATUS_BAR_CLS[h.status]} ${clickable ? 'group-hover:brightness-125 transition' : ''}`} style={{ height: `${heightPct}%` }} />
                          <span className="text-[10px] text-slate-500 mt-1.5">{h.time}</span>
                        </>
                      );
                      return clickable ? (
                        <button
                          key={h.time}
                          type="button"
                          onClick={() => setSlotPopup(h.slotData!)}
                          title="Xem chi tiết khung giờ này"
                          className="group flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                        >
                          {barCore}
                        </button>
                      ) : (
                        <div key={h.time} className="flex-1 flex flex-col items-center justify-end h-full">
                          {barCore}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Trạng thái từng điểm quét — đang xem TOÀN nhà máy: bảng tổng hợp 1 dòng/Tổ.
                  Đã chọn riêng 1 Tổ: đổi thành bảng chi tiết từng khung giờ của đúng Tổ đó. */}
              <div className="rounded-2xl bg-[#111d33] border border-white/10 overflow-hidden">
                <div className="px-4 sm:px-5 pt-4 pb-2 flex items-center justify-between gap-2">
                  <h3 className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                    <IconClipboardList size={14} className="text-blue-400" />
                    {leaf ? `Chi Tiết Từng Khung Giờ — ${leaf.name}` : 'Trạng Thái Chi Tiết Các Điểm Quét'}
                  </h3>
                  {leaf && (
                    <button
                      type="button"
                      onClick={() => setLeafId(null)}
                      className="text-[11px] font-bold text-blue-400 hover:underline shrink-0"
                    >
                      ← Xem toàn nhà máy
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                {leaf ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-500 uppercase border-b border-white/10 whitespace-nowrap">
                        <th className="px-4 sm:px-5 py-2">Khung giờ</th>
                        <th className="px-4 py-2">Sản lượng</th>
                        <th className="px-4 py-2">Người nhập</th>
                        <th className="px-4 py-2">Trạng thái cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300 whitespace-nowrap">
                      {leaf.slots.map((s) => {
                        const due = slotDueState(s.slot, s.filled, isToday);
                        const hasShortfall = !!(s.filled && s.shortfallReason);
                        return (
                          <tr key={s.slot}>
                            <td className="px-4 sm:px-5 py-2.5 font-bold text-slate-100">{s.slot}</td>
                            <td className="px-4 py-2.5">
                              {s.filled ? (
                                <button
                                  type="button"
                                  onClick={() => setSlotPopup(s)}
                                  className={`inline-flex items-center gap-1 font-bold underline underline-offset-2 transition ${
                                    hasShortfall
                                      ? 'text-rose-300 decoration-dotted decoration-rose-400/60 hover:text-rose-200'
                                      : 'text-slate-100 decoration-dotted decoration-slate-500 hover:text-white'
                                  }`}
                                  title="Xem chi tiết khung giờ này"
                                >
                                  {hasShortfall && <IconAlertTriangle size={12} />}
                                  {s.actualQty}
                                </button>
                              ) : (
                                <span className="font-bold text-slate-100">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                {s.submittedBy ? <IconUser size={12} className="text-slate-500" /> : null}
                                {s.submittedBy || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${due.cls}`}>{due.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : factory.leaves.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-slate-500">Nhà máy này chưa có điểm quét nào.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-500 uppercase border-b border-white/10 whitespace-nowrap">
                        <th className="px-4 sm:px-5 py-2">Điểm quét</th>
                        <th className="px-4 py-2">Model</th>
                        <th className="px-4 py-2">PPH</th>
                        <th className="px-4 py-2">Hiệu suất</th>
                        <th className="px-4 py-2">Trạng thái cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300 whitespace-nowrap">
                      {factory.leaves.map((l) => (
                        <tr
                          key={l.id}
                          onClick={() => setLeafId(l.id)}
                          className="cursor-pointer hover:bg-white/[0.04] transition"
                        >
                          <td className="px-4 sm:px-5 py-2.5 font-bold text-slate-100" title={l.path}>{l.name}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-400">{l.setup?.model || '—'}</td>
                          <td className="px-4 py-2.5">{fmtOrDash(l.pphLatest)}</td>
                          <td className="px-4 py-2.5 font-bold text-slate-100">{fmtPctOrDash(l.efficiencyPctLatest)}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ENTRY_LABEL[l.entryStatus].cls}`}>{ENTRY_LABEL[l.entryStatus].label}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Popup chi tiết 1 khung giờ — bấm từ cột biểu đồ hoặc ô Sản lượng trong bảng đều mở đây.
          Luôn hiện Người nhập + Sản lượng; Nguyên nhân/Giải pháp chỉ hiện khi khung đó từng hụt
          chỉ tiêu/giờ. Bấm ra ngoài hoặc nút X để đóng. */}
      {slotPopup && (() => {
        const hasShortfall = !!slotPopup.shortfallReason;
        return (
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
            onClick={() => setSlotPopup(null)}
          >
            <div
              className="bg-[#111d33] border border-white/10 rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                  {hasShortfall && <IconAlertTriangle size={16} className="text-rose-400" />}
                  Chi tiết khung {slotPopup.slot}
                </h4>
                <button
                  type="button"
                  onClick={() => setSlotPopup(null)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200 flex items-center justify-center transition shrink-0"
                >
                  <IconX size={16} />
                </button>
              </div>
              <dl className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-400 font-semibold">Sản lượng:</dt>
                  <dd className="font-black text-slate-100">{slotPopup.actualQty ?? '—'} đôi</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-400 font-semibold">Người nhập:</dt>
                  <dd className="font-black text-slate-100">{slotPopup.submittedBy || '—'}</dd>
                </div>
              </dl>
              {hasShortfall ? (
                <>
                  <div className="h-px bg-white/10" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Nguyên nhân</div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{slotPopup.shortfallReason || '—'}</p>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Giải pháp</div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{slotPopup.shortfallSolution || '—'}</p>
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-emerald-400 font-semibold">✓ Khung này đạt chỉ tiêu, không có ghi chú hụt chỉ tiêu.</p>
              )}
            </div>
          </div>
        );
      })()}
    </DarkShell>
  );
}

function fmtOrDash(n: number | null | undefined): string {
  return n == null ? '—' : `${n}`;
}
function fmtPctOrDash(n: number | null | undefined): string {
  return n == null ? '—' : `${n}%`;
}

// Khung nền tối bao toàn bộ khối Hiệu Suất Nhà Máy — tách riêng khỏi nền sáng chung của trang
// /work, đọc như 1 "màn hình điều hành" độc lập.
//
// @container: các breakpoint bên trong (@lg:...) co giãn theo đúng CHIỀU RỘNG THẬT của khối này,
// không theo chiều rộng toàn màn hình — vì khối này nằm cạnh menu trái có thể đóng/mở (w-20 hoặc
// w-64..80), 2 trạng thái đó cho khối này 2 chiều rộng khả dụng rất khác nhau dù viewport y
// nguyên. Dùng lg:/sm: (viewport-based) ở đây sẽ làm layout bể/chật khi menu đang mở dù màn hình
// đủ rộng để hiện 2 cột lúc menu đóng — container query tránh đúng lỗi này.
function DarkShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container rounded-3xl bg-[#0b1424] border border-white/10 shadow-xl shadow-slate-950/20 p-4 sm:p-6 space-y-5">
      {children}
    </div>
  );
}

function Header({
  lastUpdated,
  selectedDate,
  onDateChange,
  onRefresh,
  onOpenSettings,
  viewerName,
  viewerTitle,
}: {
  lastUpdated: Date | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  viewerName?: string;
  viewerTitle?: string;
}) {
  const isToday = selectedDate === todayVNStr();
  return (
    <div className="flex items-start justify-between flex-wrap gap-4 pb-5 border-b border-white/10">
      <div className="flex items-stretch gap-3">
        <span className="w-1 rounded-full bg-blue-500" />
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Tổ Hợp Kiên Giang — TBS Group</h2>
          <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mt-1">
            Executive Dashboard · Giám sát hiệu suất {isToday ? 'thời gian thực' : `— xem lại ${formatDateVN(selectedDate)}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2.5">
        {viewerName && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <IconCircleFilled size={7} className={isToday ? 'text-emerald-400' : 'text-slate-500'} />
            <span className="text-xs font-bold text-slate-100">
              {viewerName}
              {viewerTitle && <span className="text-slate-400 font-semibold"> ({viewerTitle})</span>}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[10px] font-semibold text-slate-500">
            {isToday
              ? `Cập nhật tự động: ${lastUpdated ? lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '...'} | ${formatDateVN(selectedDate)}`
              : `Đang xem lại: ${formatDateVN(selectedDate)}`}
          </span>
          <label
            className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition cursor-pointer"
            title="Chọn ngày xem lại"
          >
            <IconCalendar size={14} className="text-slate-500 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              max={todayVNStr()}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="bg-transparent text-[11px] font-bold outline-none cursor-pointer [color-scheme:dark]"
            />
          </label>
          {!isToday && (
            <button
              type="button"
              onClick={() => onDateChange(todayVNStr())}
              className="px-2.5 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500/25 transition"
            >
              Hôm nay
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            title="Làm mới ngay"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200 flex items-center justify-center transition"
          >
            <IconRefresh size={14} />
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            title="Cài đặt — cây Nhà máy/Xưởng/Chuyền/Tổ và mã QR quét sản lượng"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200 flex items-center justify-center transition"
          >
            <IconSettings size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Danh sách Nhà máy (cột trái, hàng đầu) — bấm 1 Nhà máy để mở rộng xem các Tổ/Chuyền con của nó
// ngay tại chỗ (ẩn 2 nhà máy còn lại); bấm 1 mục con sẽ chọn luôn mục đó và tự thu gọn về hiện đủ
// danh sách Nhà máy.
function FactoryListPanel({
  factories,
  factoryId,
  leafId,
  pickerOpen,
  onSelectFactory,
  onSelectLeaf,
  onCollapse,
}: {
  factories: PphDashboardFactory[];
  factoryId: string;
  leafId: string | null;
  pickerOpen: boolean;
  onSelectFactory: (id: string) => void;
  onSelectLeaf: (id: string | null) => void;
  onCollapse: () => void;
}) {
  const expandedIdx = factories.findIndex((f) => f.id === factoryId);
  const expandedFactory = pickerOpen && expandedIdx >= 0 ? factories[expandedIdx] : null;
  const expandedStyle = expandedIdx >= 0 ? FACTORY_STYLE_LIST[expandedIdx % FACTORY_STYLE_LIST.length] : DEFAULT_STYLE;

  return (
    <div className="rounded-2xl bg-[#111d33] border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <IconBuildingFactory2 size={16} className="text-blue-400" />
        <h3 className="text-xs font-black text-white uppercase tracking-wide">
          {expandedFactory ? `Chọn Điểm Quét — ${expandedFactory.name}` : 'Danh Sách Nhà Máy'}
        </h3>
      </div>
      <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
        {expandedFactory ? (
          <>
            <button
              type="button"
              onClick={onCollapse}
              className="w-full text-left px-4 py-2.5 flex items-center gap-1.5 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition"
            >
              <IconChevronLeft size={14} />
              <span className="text-xs font-bold">Quay lại danh sách Nhà máy</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectLeaf(null)}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold transition ${
                leafId === null ? `bg-white/[0.06] ${expandedStyle.tagText}` : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              Toàn nhà máy {expandedFactory.name}
            </button>
            {expandedFactory.leaves.length === 0 ? (
              <div className="px-4 py-4 text-xs text-slate-500">Chưa có điểm quét nào.</div>
            ) : (
              expandedFactory.leaves.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelectLeaf(l.id)}
                  title={l.path}
                  className={`w-full text-left pl-9 pr-4 py-2 text-xs font-semibold transition flex items-center justify-between gap-2 ${
                    leafId === l.id ? `bg-white/[0.06] ${expandedStyle.tagText}` : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{l.name}</span>
                  {leafId === l.id && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${expandedStyle.iconText.replace('text-', 'bg-')}`} />}
                </button>
              ))
            )}
          </>
        ) : (
          factories.map((f, idx) => {
            const style = FACTORY_STYLE_LIST[idx % FACTORY_STYLE_LIST.length];
            const selected = f.id === factoryId;
            const effVals = f.leaves.map((l) => l.efficiencyPctLatest).filter((v): v is number => v != null);
            const avgEff = effVals.length ? round1(effVals.reduce((a, b) => a + b, 0) / effVals.length) : null;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectFactory(f.id)}
                className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition border-l-[3px] ${
                  selected ? `${style.border} bg-white/[0.04]` : 'border-l-transparent hover:bg-white/[0.03]'
                }`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg} ${style.iconText}`}>
                  <IconBuildingFactory2 size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-black text-white text-sm">
                    <span className="truncate">{f.name}</span>
                    {selected && <span className={`text-[9px] font-black tracking-wide shrink-0 ${style.tagText}`}>• ĐANG XEM</span>}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
                    {f.leaves.length} điểm quét{avgEff != null ? ` · Hiệu suất ${avgEff}%` : ''}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// Thông số Nhà máy / Tổ đang xem (cột trái, hàng dưới).
function InfoPanel({
  leaf,
  factory,
  factoryAggregate,
}: {
  leaf: PphLeaf | null;
  factory: PphDashboardFactory;
  factoryAggregate: {
    totalWorkers: number;
    totalTargetPerHour: number;
    cumulativeActual: number;
    cumulativeTarget: number;
  };
}) {
  const cumActual = leaf ? leaf.cumulativeActual : factoryAggregate.cumulativeActual;
  const cumTarget = leaf ? leaf.cumulativeTarget : factoryAggregate.cumulativeTarget;
  const diff = cumActual - cumTarget;

  const rows: [string, string][] = leaf
    ? [
        ['Model sản xuất', leaf.setup?.model || 'Chưa cập nhật'],
        ['Số lao động', leaf.setup ? `${leaf.setup.workerCount} người` : 'Chưa cập nhật'],
        ['Chỉ tiêu / giờ', `${leaf.perHourTarget} đôi`],
        ['Trạng thái nhập', ENTRY_LABEL[leaf.entryStatus].label],
      ]
    : [
        ['Điểm quét', `${factory.leaves.length} điểm`],
        ['Lao động', `${factoryAggregate.totalWorkers} người`],
        ['Chỉ tiêu / giờ', `${factoryAggregate.totalTargetPerHour} đôi`],
      ];

  return (
    <div className="rounded-2xl bg-[#111d33] border border-white/10 p-4 sm:p-5">
      <h3 className="text-xs font-black text-white uppercase tracking-wide mb-3.5 flex items-center gap-1.5">
        <IconClipboardList size={14} className="text-blue-400" />
        Thông Số {leaf ? leaf.name : factory.name}
      </h3>
      <dl className="space-y-2.5 text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2">
            <dt className="text-slate-400 font-semibold">{k}:</dt>
            <dd className="font-black text-slate-100 text-right">{v}</dd>
          </div>
        ))}
        <div className="h-px bg-white/10 my-2.5" />
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-400 font-semibold">Thực tế lũy kế:</dt>
          <dd className="font-black text-slate-100">{cumActual} đôi</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-400 font-semibold">Chỉ tiêu lũy kế:</dt>
          <dd className="font-black text-slate-100">{cumTarget} đôi</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-400 font-semibold">Chênh lệch:</dt>
          <dd className={`font-black ${diff < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {diff > 0 ? '+' : ''}
            {diff} đôi
          </dd>
        </div>
      </dl>
    </div>
  );
}
