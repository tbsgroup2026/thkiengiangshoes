'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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

const ENTRY_LABEL: Record<EntryStatus, { label: string; cls: string }> = {
  ontime: { label: 'Đúng giờ', cls: 'bg-emerald-50 text-emerald-700' },
  late: { label: 'Nhập trễ', cls: 'bg-amber-50 text-amber-700' },
  missing: { label: 'Chưa nhập', cls: 'bg-rose-50 text-rose-700' },
};

const STATUS_BAR_CLS: Record<HourStatus, string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-400',
  bad: 'bg-rose-500',
  pending: 'bg-slate-100',
};

// Badge màu cho các chỉ số PPH/Hiệu suất trong bảng — cùng ngôn ngữ màu với 3 màu trên biểu đồ
// (đạt/gần đạt/chưa đạt), giúp nhìn bảng là biết ngay Tổ nào đang ổn/đang hụt mà không cần dò số.
const STATUS_BADGE_CLS: Record<HourStatus, string> = {
  ok: 'bg-emerald-50 text-emerald-700',
  warn: 'bg-amber-50 text-amber-700',
  bad: 'bg-rose-50 text-rose-700',
  pending: 'bg-slate-100 text-slate-500',
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
  { border: 'border-l-blue-500', selBg: 'bg-blue-50', iconBg: 'bg-blue-100', iconText: 'text-blue-600', tagText: 'text-blue-600' },
  { border: 'border-l-violet-500', selBg: 'bg-violet-50', iconBg: 'bg-violet-100', iconText: 'text-violet-600', tagText: 'text-violet-600' },
  { border: 'border-l-amber-500', selBg: 'bg-amber-50', iconBg: 'bg-amber-100', iconText: 'text-amber-600', tagText: 'text-amber-600' },
  { border: 'border-l-rose-500', selBg: 'bg-rose-50', iconBg: 'bg-rose-100', iconText: 'text-rose-600', tagText: 'text-rose-600' },
  { border: 'border-l-sky-500', selBg: 'bg-sky-50', iconBg: 'bg-sky-100', iconText: 'text-sky-600', tagText: 'text-sky-600' },
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

// Trạng thái 1 khung giờ cụ thể của 1 Tổ — dùng cho bảng chi tiết khi đang lọc riêng 1 Tổ. Đã QUA
// giờ của khung mà vẫn chưa nhập -> "Quá hạn" (khác với "Chưa tới giờ" — chưa đến lúc, bình
// thường, không có gì đáng lo).
function slotDueState(slot: string, filled: boolean, isToday: boolean): { label: string; cls: string } {
  if (filled) return { label: 'Đã cập nhật', cls: 'bg-emerald-50 text-emerald-700' };
  const due = !isToday || nowVNMinutes() >= slotMinutes(slot) - 10;
  return due ? { label: 'Quá hạn', cls: 'bg-rose-50 text-rose-700' } : { label: 'Chưa tới giờ', cls: 'bg-slate-100 text-slate-400' };
}

// Trạng thái cập nhật của CẢ 1 Tổ (bảng tổng hợp toàn nhà máy + dòng "Trạng thái nhập" ở Thông
// Số) — server chỉ trả "ontime/late/missing"; "missing" gộp chung 2 tình huống rất khác nhau: (1)
// còn SỚM, chưa tới lúc phải nhập gì cả (bình thường) và (2) ĐÃ QUA giờ 1 khung nào đó mà vẫn
// chưa nhập (đáng chú ý, cần nhắc). Tách riêng ở đây bằng đúng dữ liệu slots đã có sẵn, không cần
// đổi gì bên server.
function leafStatusBadge(leaf: PphLeaf, isToday: boolean): { label: string; cls: string } {
  if (leaf.entryStatus !== 'missing') return ENTRY_LABEL[leaf.entryStatus];
  if (!isToday) return { label: 'Quá hạn', cls: 'bg-rose-50 text-rose-700' }; // Ngày đã qua — còn thiếu chắc chắn là trễ.
  if (!leaf.setup) {
    // Chưa cập nhật đầu ca — chỉ tính "quá hạn" khi đã qua luôn cả mốc khung số lượng ĐẦU TIÊN
    // (không có đầu ca thì không nhập được khung nào cả, nên mốc quan trọng là khung đầu tiên).
    const firstQtyDueMin = slotMinutes('08:30') - 10;
    return nowVNMinutes() >= firstQtyDueMin
      ? { label: 'Quá hạn', cls: 'bg-rose-50 text-rose-700' }
      : { label: 'Chưa tới hạn', cls: 'bg-slate-100 text-slate-400' };
  }
  const overdue = leaf.slots.some((s) => !s.filled && nowVNMinutes() >= slotMinutes(s.slot) - 10);
  return overdue
    ? { label: 'Quá hạn', cls: 'bg-rose-50 text-rose-700' }
    : { label: 'Chưa tới hạn', cls: 'bg-slate-100 text-slate-400' };
}

// Hiệu Suất Nhà Máy — dữ liệu THẬT từ các lượt quét QR ở /pph-scan (bảng pph_entries), gộp theo
// đúng cây Nhà máy/Xưởng/Chuyền/Tổ đang cấu hình ở trang Cài Đặt. Mặc định xem HÔM NAY, tự làm
// mới mỗi 60s cho cảm giác gần-realtime; chọn 1 ngày khác thì xem đúng dữ liệu ngày đó (không tự
// làm mới nữa vì dữ liệu ngày cũ không đổi).
export default function ProductionPerformanceModule() {
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

  const headerProps = { lastUpdated, selectedDate, onDateChange: setSelectedDate, onRefresh: () => load({ fresh: true }), onOpenSettings: () => setShowSettings(true) };

  if (loading && factories.length === 0) {
    return (
      <Shell>
        <Header {...headerProps} />
        <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 text-center text-base text-slate-400">Đang tải dữ liệu...</div>
      </Shell>
    );
  }

  if (error && factories.length === 0) {
    return (
      <Shell>
        <Header {...headerProps} />
        <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center text-base text-rose-600 font-semibold">⚠️ {error}</div>
      </Shell>
    );
  }

  if (factories.length === 0) {
    return (
      <Shell>
        <Header {...headerProps} />
        <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 text-center text-base text-slate-400 space-y-2">
          <p>Chưa có Nhà máy nào được cấu hình.</p>
          <button type="button" onClick={() => setShowSettings(true)} className="text-[#006838] font-bold hover:underline">
            Vào Cài Đặt để thêm Nhà máy / Xưởng / Chuyền / Tổ →
          </button>
        </div>
      </Shell>
    );
  }

  const hours: HourPoint[] = leaf ? leafHours(leaf) : factoryAggregate?.hours ?? [];
  const chartTarget = leaf ? leaf.perHourTarget : factoryAggregate?.totalTargetPerHour ?? 0;

  const statCards = factory && factoryAggregate ? [
    { label: 'PPH trung bình', value: fmtOrDash(leaf ? leaf.pphLatest : factoryAggregate.pph), unit: 'đôi/giờ', accent: 'border-t-blue-500', valueCls: 'text-blue-600' },
    { label: 'Mục tiêu RFT', value: fmtPctOrDash(leaf ? leaf.setup?.targetRft ?? null : factoryAggregate.targetRftPct), unit: '', accent: 'border-t-emerald-500', valueCls: 'text-emerald-600' },
    { label: 'Hiệu suất tổng', value: fmtPctOrDash(leaf ? leaf.efficiencyPctLatest : factoryAggregate.efficiencyPct), unit: '', accent: 'border-t-amber-500', valueCls: 'text-amber-600' },
    { label: 'Đạt chỉ tiêu giờ này', value: `${leavesMeetingTargetNow.met}/${leavesMeetingTargetNow.total}`, unit: 'điểm quét', accent: 'border-t-violet-500', valueCls: 'text-violet-600' },
  ] : [];

  return (
    <Shell>
      <Header {...headerProps} />

      {/* Dùng flex + chiều rộng CỐ ĐỊNH cho cột trái (không phải tỉ lệ %/12 cột) — vì lúc đóng
          menu bên trái, khoảng trống khả dụng tăng lên nhiều, tỉ lệ % sẽ kéo cột trái rộng ra theo
          dù nội dung (tên Nhà máy, vài dòng Thông số) không cần thêm chỗ — cố định lại để cột trái
          luôn gọn như nhau, mọi khoảng dư đều nhường hết cho cột phải (biểu đồ + bảng). */}
      <div className="flex flex-col @lg:flex-row gap-4">
        <div className="@lg:w-72 @lg:flex-shrink-0 space-y-4">
          <FactoryListPanel
            factories={factories}
            factoryId={factoryId}
            leafId={leafId}
            pickerOpen={pickerOpen}
            onSelectFactory={handleSelectFactory}
            onSelectLeaf={handleSelectLeaf}
            onCollapse={() => setPickerOpen(false)}
          />
          {factory && factoryAggregate && <InfoPanel leaf={leaf} factory={factory} factoryAggregate={factoryAggregate} isToday={isToday} />}
        </div>

        {/* CỘT PHẢI — Chỉ số nhanh + Biểu đồ + Bảng chi tiết — nhận hết phần rộng còn dư */}
        <div className="flex-1 min-w-0 space-y-4">
          {factory && factoryAggregate && (
            <>
              <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3">
                {statCards.map((c) => (
                  <div key={c.label} className={`rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 ${c.accent} p-4`}>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{c.label}</div>
                    <div className={`text-2xl font-black mt-1.5 ${c.valueCls}`}>
                      {c.value} {c.unit && <span className="text-xs font-bold text-slate-400">{c.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Biểu đồ sản lượng theo giờ */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <IconChartBar size={16} className="text-blue-600" />
                      Sản Lượng Theo Giờ ({leaf ? leaf.name : `Toàn ${factory.name}`})
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {leaf
                        ? `${leaf.setup?.model || 'Chưa có model'} · Chỉ tiêu ${leaf.perHourTarget} đôi/giờ`
                        : `${factory.leaves.length} điểm quét · Tổng chỉ tiêu ${chartTarget} đôi/giờ`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    {STATUS_DOT_LABEL.map((s) => (
                      <span key={s.key} className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.cls}`} /> {s.label}
                      </span>
                    ))}
                  </div>
                </div>
                {hours.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-sm text-slate-400">Chưa có dữ liệu khung giờ nào hôm nay.</div>
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
                          {h.actual != null && <span className="text-xs font-bold text-slate-600 mb-1">{h.actual}</span>}
                          <div className={`w-full rounded-t-lg ${STATUS_BAR_CLS[h.status]} ${clickable ? 'group-hover:brightness-110 transition' : ''}`} style={{ height: `${heightPct}%` }} />
                          <span className="text-xs text-slate-400 mt-1.5">{h.time}</span>
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
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 pt-4 pb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <IconClipboardList size={16} className="text-blue-600" />
                    {leaf ? `Chi Tiết Từng Khung Giờ — ${leaf.name}` : 'Trạng Thái Chi Tiết Các Điểm Quét'}
                  </h3>
                  {leaf && (
                    <button
                      type="button"
                      onClick={() => setLeafId(null)}
                      className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                    >
                      ← Xem toàn nhà máy
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                {leaf ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100 whitespace-nowrap">
                        <th className="px-4 sm:px-5 py-2.5">Khung giờ</th>
                        <th className="px-4 py-2.5">Sản lượng</th>
                        <th className="px-4 py-2.5">Người nhập</th>
                        <th className="px-4 py-2.5">Trạng thái cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm text-slate-700 whitespace-nowrap">
                      {leaf.slots.map((s) => {
                        const due = slotDueState(s.slot, s.filled, isToday);
                        const hasShortfall = !!(s.filled && s.shortfallReason);
                        const status = slotStatus(s.actualQty, leaf.perHourTarget);
                        return (
                          <tr key={s.slot}>
                            <td className="px-4 sm:px-5 py-3 font-bold text-slate-900">{s.slot}</td>
                            <td className="px-4 py-3">
                              {s.filled ? (
                                <button
                                  type="button"
                                  onClick={() => setSlotPopup(s)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition hover:brightness-95 ${STATUS_BADGE_CLS[status]}`}
                                  title="Xem chi tiết khung giờ này"
                                >
                                  {hasShortfall && <IconAlertTriangle size={13} />}
                                  {s.actualQty}
                                </button>
                              ) : (
                                <span className="font-bold text-slate-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                {s.submittedBy ? <IconUser size={13} className="text-slate-400" /> : null}
                                {s.submittedBy || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${due.cls}`}>{due.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : factory.leaves.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-slate-400">Nhà máy này chưa có điểm quét nào.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100 whitespace-nowrap">
                        <th className="px-4 sm:px-5 py-2.5">Điểm quét</th>
                        <th className="px-4 py-2.5">Model</th>
                        <th className="px-4 py-2.5">PPH</th>
                        <th className="px-4 py-2.5">Hiệu suất</th>
                        <th className="px-4 py-2.5">Trạng thái cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm text-slate-700 whitespace-nowrap">
                      {factory.leaves.map((l) => {
                        const status = slotStatus(l.pphLatest, l.perHourTarget);
                        return (
                          <tr
                            key={l.id}
                            onClick={() => setLeafId(l.id)}
                            className="cursor-pointer hover:bg-slate-50 transition"
                          >
                            <td className="px-4 sm:px-5 py-3 font-bold text-slate-900" title={l.path}>{l.name}</td>
                            <td className="px-4 py-3 font-mono text-slate-500">{l.setup?.model || '—'}</td>
                            <td className="px-4 py-3">
                              {l.pphLatest != null ? (
                                <span className={`px-2 py-1 rounded-lg font-bold ${STATUS_BADGE_CLS[status]}`}>{fmtOrDash(l.pphLatest)}</span>
                              ) : (
                                <span className="font-bold text-slate-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {l.efficiencyPctLatest != null ? (
                                <span className={`px-2 py-1 rounded-lg font-bold ${STATUS_BADGE_CLS[status]}`}>{fmtPctOrDash(l.efficiencyPctLatest)}</span>
                              ) : (
                                <span className="font-bold text-slate-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {(() => {
                                const badge = leafStatusBadge(l, isToday);
                                return <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>;
                              })()}
                            </td>
                          </tr>
                        );
                      })}
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
            className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
            onClick={() => setSlotPopup(null)}
          >
            <div
              className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-1.5">
                  {hasShortfall && <IconAlertTriangle size={18} className="text-rose-500" />}
                  Chi tiết khung {slotPopup.slot}
                </h4>
                <button
                  type="button"
                  onClick={() => setSlotPopup(null)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition shrink-0"
                >
                  <IconX size={18} />
                </button>
              </div>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 font-semibold">Sản lượng:</dt>
                  <dd className="font-black text-slate-900">{slotPopup.actualQty ?? '—'} đôi</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 font-semibold">Người nhập:</dt>
                  <dd className="font-black text-slate-900">{slotPopup.submittedBy || '—'}</dd>
                </div>
              </dl>
              {hasShortfall ? (
                <>
                  <div className="h-px bg-slate-100" />
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Nguyên nhân</div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{slotPopup.shortfallReason || '—'}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Giải pháp</div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{slotPopup.shortfallSolution || '—'}</p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-emerald-600 font-semibold">✓ Khung này đạt chỉ tiêu, không có ghi chú hụt chỉ tiêu.</p>
              )}
            </div>
          </div>
        );
      })()}
    </Shell>
  );
}

function fmtOrDash(n: number | null | undefined): string {
  return n == null ? '—' : `${n}`;
}
function fmtPctOrDash(n: number | null | undefined): string {
  return n == null ? '—' : `${n}%`;
}

// Khung nền TRẮNG bao toàn bộ khối Hiệu Suất Nhà Máy.
//
// @container: các breakpoint bên trong (@lg:...) co giãn theo đúng CHIỀU RỘNG THẬT của khối này,
// không theo chiều rộng toàn màn hình — vì khối này nằm cạnh menu trái có thể đóng/mở (w-20 hoặc
// w-64..80), 2 trạng thái đó cho khối này 2 chiều rộng khả dụng rất khác nhau dù viewport y
// nguyên. Dùng lg:/sm: (viewport-based) ở đây sẽ làm layout bể/chật khi menu đang mở dù màn hình
// đủ rộng để hiện 2 cột lúc menu đóng — container query tránh đúng lỗi này.
function Shell({ children }: { children: React.ReactNode }) {
  // Nền xám riêng cho khối này (khác màu trắng của trang/menu xung quanh) — để thấy rõ ranh giới
  // khối, các card/bảng bên trong vẫn trắng nên tự nổi lên trên nền xám này. slate-50 thử trước
  // gần trắng quá, gần như không thấy khác biệt — slate-100 rõ ràng hơn hẳn mà vẫn nhẹ nhàng.
  return (
    <div className="@container rounded-3xl bg-slate-100 border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
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
}: {
  lastUpdated: Date | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
}) {
  const isToday = selectedDate === todayVNStr();
  return (
    <div className="flex items-start justify-between flex-wrap gap-4 pb-5 border-b border-slate-200">
      <div className="flex items-stretch gap-3">
        <span className="w-1 rounded-full bg-[#006838]" />
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Hiệu Suất Nhà Máy</h2>
          <p className="text-xs font-bold uppercase tracking-wider text-[#006838] mt-1">
            Executive Dashboard · Giám sát hiệu suất {isToday ? 'thời gian thực' : `— xem lại ${formatDateVN(selectedDate)}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-xs font-semibold text-slate-500">
          {isToday
            ? `Cập nhật tự động: ${lastUpdated ? lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '...'} | ${formatDateVN(selectedDate)}`
            : `Đang xem lại: ${formatDateVN(selectedDate)}`}
        </span>
        <label
          className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          title="Chọn ngày xem lại"
        >
          <IconCalendar size={15} className="text-slate-400 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            max={todayVNStr()}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
          />
        </label>
        {!isToday && (
          <button
            type="button"
            onClick={() => onDateChange(todayVNStr())}
            className="px-2.5 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-[#006838] text-sm font-bold hover:bg-emerald-100 transition"
          >
            Hôm nay
          </button>
        )}
        <button
          type="button"
          onClick={onRefresh}
          title="Làm mới ngay"
          className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition"
        >
          <IconRefresh size={16} />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          title="Cài đặt — cây Nhà máy/Xưởng/Chuyền/Tổ và mã QR quét sản lượng"
          className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition"
        >
          <IconSettings size={16} />
        </button>
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
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <IconBuildingFactory2 size={18} className="text-blue-600" />
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
          {expandedFactory ? `Chọn Điểm Quét — ${expandedFactory.name}` : 'Danh Sách Nhà Máy'}
        </h3>
      </div>
      <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
        {expandedFactory ? (
          <>
            <button
              type="button"
              onClick={onCollapse}
              className="w-full text-left px-4 py-2.5 flex items-center gap-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <IconChevronLeft size={16} />
              <span className="text-sm font-bold">Quay lại danh sách Nhà máy</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectLeaf(null)}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold transition ${
                leafId === null ? `${expandedStyle.selBg} ${expandedStyle.tagText}` : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Toàn nhà máy {expandedFactory.name}
            </button>
            {expandedFactory.leaves.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-400">Chưa có điểm quét nào.</div>
            ) : (
              expandedFactory.leaves.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelectLeaf(l.id)}
                  title={l.path}
                  className={`w-full text-left pl-9 pr-4 py-2.5 text-sm font-semibold transition flex items-center justify-between gap-2 ${
                    leafId === l.id ? `${expandedStyle.selBg} ${expandedStyle.tagText}` : 'text-slate-600 hover:bg-slate-50'
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
                  selected ? `${style.border} ${style.selBg}` : 'border-l-transparent hover:bg-slate-50'
                }`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg} ${style.iconText}`}>
                  <IconBuildingFactory2 size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-black text-slate-900 text-base">
                    <span className="truncate">{f.name}</span>
                    {selected && <span className={`text-[10px] font-black tracking-wide shrink-0 ${style.tagText}`}>• ĐANG XEM</span>}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5 truncate">
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
  isToday,
}: {
  leaf: PphLeaf | null;
  factory: PphDashboardFactory;
  factoryAggregate: {
    totalWorkers: number;
    totalTargetPerHour: number;
    cumulativeActual: number;
    cumulativeTarget: number;
  };
  isToday: boolean;
}) {
  const cumActual = leaf ? leaf.cumulativeActual : factoryAggregate.cumulativeActual;
  const cumTarget = leaf ? leaf.cumulativeTarget : factoryAggregate.cumulativeTarget;
  const diff = cumActual - cumTarget;

  const rows: [string, string][] = leaf
    ? [
        ['Model sản xuất', leaf.setup?.model || 'Chưa cập nhật'],
        ['Số lao động', leaf.setup ? `${leaf.setup.workerCount} người` : 'Chưa cập nhật'],
        ['Chỉ tiêu / giờ', `${leaf.perHourTarget} đôi`],
        ['Trạng thái nhập', leafStatusBadge(leaf, isToday).label],
      ]
    : [
        ['Điểm quét', `${factory.leaves.length} điểm`],
        ['Lao động', `${factoryAggregate.totalWorkers} người`],
        ['Chỉ tiêu / giờ', `${factoryAggregate.totalTargetPerHour} đôi`],
      ];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3.5 flex items-center gap-1.5">
        <IconClipboardList size={16} className="text-blue-600" />
        Thông Số {leaf ? leaf.name : factory.name}
      </h3>
      <dl className="space-y-2.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2">
            <dt className="text-slate-500 font-semibold">{k}:</dt>
            <dd className="font-black text-slate-900 text-right">{v}</dd>
          </div>
        ))}
        <div className="h-px bg-slate-100 my-2.5" />
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-500 font-semibold">Thực tế lũy kế:</dt>
          <dd className="font-black text-slate-900">{cumActual} đôi</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-500 font-semibold">Chỉ tiêu lũy kế:</dt>
          <dd className="font-black text-slate-900">{cumTarget} đôi</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-500 font-semibold">Chênh lệch:</dt>
          <dd className={`font-black ${diff < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {diff > 0 ? '+' : ''}
            {diff} đôi
          </dd>
        </div>
      </dl>
    </div>
  );
}
