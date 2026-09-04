'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconCircleFilled, IconBuildingFactory2, IconSettings, IconRefresh } from '@tabler/icons-react';
import PphSettingsView from './PphSettingsView';

type EntryStatus = 'ontime' | 'late' | 'missing';
type HourStatus = 'ok' | 'warn' | 'bad' | 'pending';

type PphSlot = { slot: string; actualQty: number | null; filled: boolean };
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
  ok: 'bg-[#006838]',
  warn: 'bg-amber-400',
  bad: 'bg-rose-400',
  pending: 'bg-slate-100',
};

const STATUS_DOT_LABEL: { key: 'ok' | 'warn' | 'bad'; label: string; cls: string }[] = [
  { key: 'ok', label: 'Đạt chỉ tiêu', cls: 'bg-[#006838]' },
  { key: 'warn', label: 'Gần đạt', cls: 'bg-amber-400' },
  { key: 'bad', label: 'Không đạt', cls: 'bg-rose-400' },
];

// Màu riêng cho từng Nhà máy — làm hàng nút đầu tiên nổi bật/dễ phân biệt. Ghi cứng tên class
// Tailwind (không nội suy chuỗi) để Tailwind nhận diện đúng lúc build. Nhà máy không nằm trong
// danh sách này (VD tên mới thêm sau) rơi về DEFAULT_STYLE, không vỡ giao diện.
const FACTORY_STYLE_LIST = [
  { dot: 'bg-blue-500', selBg: 'bg-blue-50', selBorder: 'border-blue-500', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  { dot: 'bg-violet-500', selBg: 'bg-violet-50', selBorder: 'border-violet-500', iconBg: 'bg-violet-100', iconText: 'text-violet-600' },
  { dot: 'bg-amber-500', selBg: 'bg-amber-50', selBorder: 'border-amber-500', iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
  { dot: 'bg-rose-500', selBg: 'bg-rose-50', selBorder: 'border-rose-500', iconBg: 'bg-rose-100', iconText: 'text-rose-600' },
  { dot: 'bg-sky-500', selBg: 'bg-sky-50', selBorder: 'border-sky-500', iconBg: 'bg-sky-100', iconText: 'text-sky-600' },
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

type HourPoint = { time: string; actual: number | null; target: number; status: HourStatus };

function leafHours(leaf: PphLeaf): HourPoint[] {
  return leaf.slots.map((s) => ({
    time: s.slot,
    actual: s.actualQty,
    target: leaf.perHourTarget,
    status: slotStatus(s.actualQty, leaf.perHourTarget),
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

// Hiệu Suất Nhà Máy — dữ liệu THẬT từ các lượt quét QR ở /pph-scan (bảng pph_entries), gộp theo
// đúng cây Nhà máy/Xưởng/Chuyền/Tổ đang cấu hình ở trang Cài Đặt. Tự làm mới mỗi 60s để cảm giác
// gần-realtime mà không cần bấm lại; API /api/pph/dashboard cũng tự xoá cache ngay khi có ai nộp
// số liệu mới nên số liệu luôn đúng thời điểm gần nhất.
export default function ProductionPerformanceModule() {
  const [showSettings, setShowSettings] = useState(false);
  const [factories, setFactories] = useState<PphDashboardFactory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [factoryId, setFactoryId] = useState<string>('');
  const [leafId, setLeafId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(true);
  const firstLoadRef = useRef(true);

  const load = useCallback(async (opts?: { silent?: boolean; fresh?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch(`/api/pph/dashboard${opts?.fresh ? '?fresh=1' : ''}`);
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
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => load({ silent: true }), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const factory = factories.find((f) => f.id === factoryId) ?? null;
  const leaf = factory && leafId ? factory.leaves.find((l) => l.id === leafId) ?? null : null;
  const style = (factory && FACTORY_STYLE_LIST[factories.indexOf(factory) % FACTORY_STYLE_LIST.length]) || DEFAULT_STYLE;

  function handleSelectFactory(id: string) {
    if (id === factoryId) {
      setPickerOpen((v) => !v);
      return;
    }
    setFactoryId(id);
    setLeafId(null);
    setPickerOpen(true);
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

  if (loading && factories.length === 0) {
    return (
      <div className="space-y-4 my-auto">
        <Header lastUpdated={lastUpdated} onRefresh={() => load({ fresh: true })} onOpenSettings={() => setShowSettings(true)} />
        <div className="p-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-sm text-slate-400">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error && factories.length === 0) {
    return (
      <div className="space-y-4 my-auto">
        <Header lastUpdated={lastUpdated} onRefresh={() => load({ fresh: true })} onOpenSettings={() => setShowSettings(true)} />
        <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center text-sm text-rose-600 font-semibold">⚠️ {error}</div>
      </div>
    );
  }

  if (factories.length === 0) {
    return (
      <div className="space-y-4 my-auto">
        <Header lastUpdated={lastUpdated} onRefresh={() => load({ fresh: true })} onOpenSettings={() => setShowSettings(true)} />
        <div className="p-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-sm text-slate-400 space-y-2">
          <p>Chưa có Nhà máy nào được cấu hình.</p>
          <button type="button" onClick={() => setShowSettings(true)} className="text-[#006838] font-bold hover:underline">
            Vào Cài Đặt để thêm Nhà máy / Xưởng / Chuyền / Tổ →
          </button>
        </div>
      </div>
    );
  }

  const hours: HourPoint[] = leaf ? leafHours(leaf) : factoryAggregate?.hours ?? [];
  const chartTarget = leaf ? leaf.perHourTarget : factoryAggregate?.totalTargetPerHour ?? 0;

  return (
    <div className="space-y-4 my-auto">
      <Header lastUpdated={lastUpdated} onRefresh={() => load({ fresh: true })} onOpenSettings={() => setShowSettings(true)} />

      {/* Ô các Nhà máy — hàng đầu tiên, mỗi nhà máy 1 màu riêng để dễ phân biệt */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {factories.map((f, idx) => {
          const s = FACTORY_STYLE_LIST[idx % FACTORY_STYLE_LIST.length];
          const selected = factoryId === f.id;
          const effVals = f.leaves.map((l) => l.efficiencyPctLatest).filter((v): v is number => v != null);
          const avgEff = effVals.length ? round1(effVals.reduce((a, b) => a + b, 0) / effVals.length) : null;
          return (
            <button
              key={f.id}
              onClick={() => handleSelectFactory(f.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                selected ? `${s.selBg} ${s.selBorder} shadow-md` : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg} ${s.iconText}`}>
                <IconBuildingFactory2 size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-black text-slate-900 flex items-center gap-1.5">
                  {f.name}
                  {selected && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {f.leaves.length} điểm quét{avgEff != null ? ` · ${avgEff}%` : ''}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chọn điểm quét — bấm lại ô Nhà máy đang chọn ở hàng trên để ẩn/hiện khung này. */}
      {pickerOpen && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold text-slate-400 mb-2.5">Chọn điểm quét để xem riêng (không chọn = xem cả nhà máy)</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setLeafId(null); setPickerOpen(false); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                leafId === null ? 'bg-[#006838] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Toàn nhà máy
            </button>
            {factory?.leaves.length === 0 && (
              <span className="text-xs text-slate-400 py-2">Nhà máy này chưa có điểm quét nào.</span>
            )}
            {factory?.leaves.map((l) => (
              <button
                key={l.id}
                onClick={() => { setLeafId(l.id); setPickerOpen(false); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                  leafId === l.id ? 'bg-[#006838] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                title={l.path}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {factory && factoryAggregate && (
        <>
          {/* 4 chỉ số nhanh */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'PPH trung bình', value: fmtOrDash(leaf ? leaf.pphLatest : factoryAggregate.pph), unit: 'đôi/giờ', cls: 'bg-white' },
              { label: 'Mục tiêu RFT', value: fmtPctOrDash(leaf ? leaf.setup?.targetRft ?? null : factoryAggregate.targetRftPct), unit: '', cls: 'bg-[#f7f8f6]' },
              { label: 'Hiệu suất', value: fmtPctOrDash(leaf ? leaf.efficiencyPctLatest : factoryAggregate.efficiencyPct), unit: '', cls: 'bg-white' },
              { label: 'Đạt chỉ tiêu giờ này', value: `${leavesMeetingTargetNow.met}/${leavesMeetingTargetNow.total}`, unit: 'điểm quét', cls: 'bg-[#f7f8f6]' },
            ].map((c) => (
              <div key={c.label} className={`p-4 rounded-2xl border border-slate-200/80 shadow-sm ${c.cls}`}>
                <div className="text-xs font-bold text-slate-500">{c.label}</div>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {c.value} {c.unit && <span className="text-xs font-bold text-slate-400">{c.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Biểu đồ sản lượng theo giờ */}
            <div className="lg:col-span-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Sản lượng theo giờ — {leaf ? leaf.name : `Toàn ${factory.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
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
                <div className="h-40 flex items-center justify-center text-xs text-slate-400">Chưa có dữ liệu khung giờ nào hôm nay.</div>
              ) : (
                <div className="flex items-end gap-2 sm:gap-3 h-40">
                  {hours.map((h) => {
                    const heightPct = h.actual != null && h.target > 0 ? Math.max(8, Math.min(100, (h.actual / h.target) * 80)) : 4;
                    return (
                      <div key={h.time} className="flex-1 flex flex-col items-center justify-end h-full">
                        {h.actual != null && <span className="text-[10px] font-bold text-slate-500 mb-1">{h.actual}</span>}
                        <div className={`w-full rounded-t-lg ${STATUS_BAR_CLS[h.status]}`} style={{ height: `${heightPct}%` }} />
                        <span className="text-[10px] text-slate-400 mt-1.5">{h.time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Thông tin ca / Thông tin nhà máy */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4">
                {leaf ? `Thông tin ca — ${leaf.name}` : `Thông tin nhà máy — ${factory.name}`}
              </h3>
              <dl className="space-y-4 text-sm">
                {leaf ? (
                  <>
                    {[
                      ['Model sản xuất', leaf.setup?.model || 'Chưa cập nhật'],
                      ['Số lao động', leaf.setup ? `${leaf.setup.workerCount} người` : 'Chưa cập nhật'],
                      ['Chỉ tiêu / giờ', `${leaf.perHourTarget} đôi`],
                      ['Trạng thái nhập', ENTRY_LABEL[leaf.entryStatus].label],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <dt className="text-slate-500 font-semibold">{k}</dt>
                        <dd className="font-black text-slate-900 text-base">{v}</dd>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      ['Số điểm quét', `${factory.leaves.length} điểm`],
                      ['Tổng lao động', `${factoryAggregate.totalWorkers} người`],
                      ['Tổng chỉ tiêu / giờ', `${factoryAggregate.totalTargetPerHour} đôi`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <dt className="text-slate-500 font-semibold">{k}</dt>
                        <dd className="font-black text-slate-900 text-base">{v}</dd>
                      </div>
                    ))}
                  </>
                )}
                <div className="h-px bg-slate-100 my-3" />
                {(() => {
                  const cumActual = leaf ? leaf.cumulativeActual : factoryAggregate.cumulativeActual;
                  const cumTarget = leaf ? leaf.cumulativeTarget : factoryAggregate.cumulativeTarget;
                  const diff = cumActual - cumTarget;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500 font-semibold">Lũy kế thực tế</dt>
                        <dd className="font-black text-slate-900 text-base">{cumActual} đôi</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500 font-semibold">Lũy kế chỉ tiêu</dt>
                        <dd className="font-black text-slate-900 text-base">{cumTarget} đôi</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500 font-semibold">Chênh lệch</dt>
                        <dd className={`font-black text-base ${diff < 0 ? 'text-rose-600' : 'text-[#006838]'}`}>
                          {diff > 0 ? '+' : ''}
                          {diff} đôi
                        </dd>
                      </div>
                    </>
                  );
                })()}
              </dl>
            </div>
          </div>

          {/* Trạng thái từng điểm quét */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
            <div className="px-4 sm:px-5 pt-4 pb-2">
              <h3 className="text-sm font-black text-slate-900">Trạng thái từng điểm quét — hôm nay</h3>
            </div>
            {factory.leaves.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-400">Nhà máy này chưa có điểm quét nào.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100 whitespace-nowrap">
                    <th className="px-4 sm:px-5 py-2">Điểm quét</th>
                    <th className="px-4 py-2">Model</th>
                    <th className="px-4 py-2">PPH</th>
                    <th className="px-4 py-2">Hiệu suất</th>
                    <th className="px-4 py-2">Trạng thái nhập</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-700 whitespace-nowrap">
                  {factory.leaves.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => setLeafId(l.id)}
                      className={`cursor-pointer hover:bg-slate-50/80 ${l.id === leafId ? 'bg-[#f7fbf9]' : ''}`}
                    >
                      <td className="px-4 sm:px-5 py-2.5 font-bold text-slate-800" title={l.path}>{l.name}</td>
                      <td className="px-4 py-2.5 font-mono">{l.setup?.model || '—'}</td>
                      <td className="px-4 py-2.5">{fmtOrDash(l.pphLatest)}</td>
                      <td className="px-4 py-2.5 font-bold">{fmtPctOrDash(l.efficiencyPctLatest)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ENTRY_LABEL[l.entryStatus].cls}`}>{ENTRY_LABEL[l.entryStatus].label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function fmtOrDash(n: number | null | undefined): string {
  return n == null ? '—' : `${n}`;
}
function fmtPctOrDash(n: number | null | undefined): string {
  return n == null ? '—' : `${n}%`;
}

function Header({
  lastUpdated,
  onRefresh,
  onOpenSettings,
}: {
  lastUpdated: Date | null;
  onRefresh: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 className="text-lg font-black text-slate-900">🏭 Hiệu Suất Nhà Máy</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi sản lượng theo giờ so với chỉ tiêu — dữ liệu thật từ quét QR tại Tổ/Chuyền, tự làm mới mỗi 60 giây.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <IconCircleFilled size={8} className="text-[#006838]" />
          {lastUpdated ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Đang tải...'}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          title="Làm mới ngay"
          className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition"
        >
          <IconRefresh size={14} />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          title="Cài đặt — cây Nhà máy/Xưởng/Chuyền/Tổ và mã QR quét sản lượng"
          className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition"
        >
          <IconSettings size={14} />
        </button>
      </div>
    </div>
  );
}
