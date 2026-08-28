'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  IconDeviceLaptop,
  IconAlertTriangle,
  IconClockHour4,
  IconBulb,
  IconCircleCheck,
  IconArrowRight,
  IconStopwatch,
  IconTool,
  IconGauge,
  IconFilter,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';
import DateRangeFilter from '@/components/DateRangeFilter';
import ParetoChart, { type ParetoItem } from '@/components/charts/ParetoChart';
import TrendChart, { type TrendPoint } from '@/components/charts/TrendChart';

type Machine = { id: string; statusName: string };
type ScheduleMachine = { id: string; status: 'unscheduled' | 'overdue' | 'upcoming' | 'scheduled' };
type Proposal = { id: string; resolved: boolean };

type CategoryOption = { id: string; name: string; parent?: { id: string; name: string; parent?: { id: string; name: string } | null } | null };

type OverviewIncident = {
  id: string;
  createdAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  categoryName: string | null;
  machineId: string;
  machineCode: string;
  machineName: string;
  machineTypeName: string | null;
  areaName: string | null;
  lineName: string | null;
};

type OverviewLog = { id: string; partsReplaced: string | null };

type PartsPayload = { parts?: { partId: string; name: string; quantity: number }[]; note?: string };

function normalizeStatus(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').trim().toLowerCase();
}

function minutesBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 60000;
}

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function fmtMin(n: number | null): string {
  return n == null ? '—' : `${round1(n)}`;
}

// Tổng Quan — KPI MTTA/MTTR/MTTD + Trend Analysis + Pareto (theo Line, theo máy, theo loại lỗi) +
// Top linh kiện thay thế + báo cáo downtime theo tháng + bảng độ tin cậy từng máy, tính từ dữ liệu
// thô /api/mmtb-kg/overview-report (proxy /api/overview-report bên tbsMayMoc). Toàn bộ số liệu
// tính ở FE (không tính sẵn ở BE) để đổi bộ lọc không cần thêm route riêng. Bên dưới vẫn giữ khối
// tóm tắt nhanh cũ (Trạng thái máy / Lịch bảo trì / Truy cập nhanh) — tái dùng data đã có sẵn ở
// các trang khác, không gọi API riêng để không lệch số liệu giữa các nơi.
export default function OverviewPage() {
  // ---- Khối tóm tắt nhanh (giữ nguyên từ trước) ----
  const [machines, setMachines] = useState<Machine[]>([]);
  const [scheduleMachines, setScheduleMachines] = useState<ScheduleMachine[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [quickLoading, setQuickLoading] = useState(true);

  // ---- Bộ lọc phân tích (Nhà máy/Phân xưởng/Line + thời gian) ----
  const [factories, setFactories] = useState<CategoryOption[]>([]);
  const [areas, setAreas] = useState<CategoryOption[]>([]);
  const [lines, setLines] = useState<CategoryOption[]>([]);
  const [pFactoryId, setPFactoryId] = useState('');
  const [pAreaId, setPAreaId] = useState('');
  const [pLineId, setPLineId] = useState('');
  const [pDateFrom, setPDateFrom] = useState('');
  const [pDateTo, setPDateTo] = useState('');

  // ---- Dữ liệu phân tích ----
  const [incidents, setIncidents] = useState<OverviewIncident[]>([]);
  const [logs, setLogs] = useState<OverviewLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reliabilitySearch, setReliabilitySearch] = useState('');
  const [detailMachineCode, setDetailMachineCode] = useState<string | null>(null);

  async function loadOverview(params: { factoryId: string; areaId: string; lineId: string; dateFrom: string; dateTo: string }) {
    try {
      setLoading(true);
      setError(null);
      const qs = new URLSearchParams();
      if (params.factoryId) qs.set('factoryId', params.factoryId);
      if (params.areaId) qs.set('areaId', params.areaId);
      if (params.lineId) qs.set('lineId', params.lineId);
      if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
      if (params.dateTo) qs.set('dateTo', params.dateTo);
      const res = await fetch(`/api/mmtb-kg/overview-report${qs.toString() ? `?${qs}` : ''}`);
      const result = await res.json();
      if (result.success) {
        setIncidents(result.incidents || []);
        setLogs(result.logs || []);
      } else {
        setError(result.error || 'Không lấy được dữ liệu phân tích');
      }
    } catch {
      setError('Không kết nối được tới hệ thống MMTB');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setQuickLoading(true);
        const [machinesRes, scheduleRes, proposalsRes, facRes, areaRes, lineRes] = await Promise.all([
          fetch('/api/mmtb-kg/machines').then((r) => r.json()),
          fetch('/api/mmtb-kg/schedule').then((r) => r.json()),
          fetch('/api/mmtb-kg/proposals').then((r) => r.json()),
          fetch('/api/mmtb-kg/categories?type=FACTORY').then((r) => r.json()),
          fetch('/api/mmtb-kg/categories?type=AREA').then((r) => r.json()),
          fetch('/api/mmtb-kg/categories?type=PRODUCTION_LINE').then((r) => r.json()),
        ]);
        if (machinesRes.success) setMachines(machinesRes.data || []);
        if (scheduleRes.success) setScheduleMachines(scheduleRes.machines || []);
        if (proposalsRes.success) setProposals(proposalsRes.data || []);
        if (facRes.success) setFactories(facRes.data || []);
        if (areaRes.success) setAreas(areaRes.data || []);
        if (lineRes.success) setLines(lineRes.data || []);
      } catch {
        /* khối tóm tắt nhanh — lỗi không chặn phần phân tích bên dưới */
      } finally {
        setQuickLoading(false);
      }
    })();
    loadOverview({ factoryId: '', areaId: '', lineId: '', dateFrom: '', dateTo: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areaOptions = useMemo(
    () => areas.filter((a) => !pFactoryId || a.parent?.id === pFactoryId).map((a) => ({ id: a.id, name: a.name })),
    [areas, pFactoryId]
  );
  const lineOptions = useMemo(
    () =>
      lines
        .filter((l) => (!pAreaId || l.parent?.id === pAreaId) && (!pFactoryId || l.parent?.parent?.id === pFactoryId))
        .map((l) => ({ id: l.id, name: l.name })),
    [lines, pAreaId, pFactoryId]
  );

  function handleApplyFilter() {
    loadOverview({ factoryId: pFactoryId, areaId: pAreaId, lineId: pLineId, dateFrom: pDateFrom, dateTo: pDateTo });
  }

  // ---- Tính MTTA/MTTR/MTTD cho từng sự cố ----
  const enriched = useMemo(
    () =>
      incidents.map((i) => ({
        ...i,
        mtta: i.acceptedAt ? minutesBetween(i.createdAt, i.acceptedAt) : null,
        mttr: i.acceptedAt && i.completedAt ? minutesBetween(i.acceptedAt, i.completedAt) : null,
        mttd: i.completedAt ? minutesBetween(i.createdAt, i.completedAt) : null,
      })),
    [incidents]
  );

  const kpi = useMemo(() => {
    const mttaVals = enriched.filter((i) => i.mtta != null).map((i) => i.mtta as number);
    const mttrVals = enriched.filter((i) => i.mttr != null).map((i) => i.mttr as number);
    const mttdVals = enriched.filter((i) => i.mttd != null).map((i) => i.mttd as number);
    const avg = (arr: number[]) => (arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0);
    return {
      mtta: avg(mttaVals),
      mttr: avg(mttrVals),
      mttd: avg(mttdVals),
      count: enriched.length,
      downtime: mttdVals.reduce((s, n) => s + n, 0),
    };
  }, [enriched]);

  const trendData: TrendPoint[] = useMemo(() => {
    type Bucket = { key: number; label: string; mttaSum: number; mttaN: number; mttrSum: number; mttrN: number; mttdSum: number; mttdN: number; downtime: number };
    const buckets = new Map<number, Bucket>();
    for (const i of enriched) {
      const d = new Date(i.createdAt);
      const wk = isoWeek(d);
      const key = d.getUTCFullYear() * 100 + wk;
      let b = buckets.get(key);
      if (!b) {
        b = { key, label: `Tuần ${wk}`, mttaSum: 0, mttaN: 0, mttrSum: 0, mttrN: 0, mttdSum: 0, mttdN: 0, downtime: 0 };
        buckets.set(key, b);
      }
      if (i.mtta != null) { b.mttaSum += i.mtta; b.mttaN++; }
      if (i.mttr != null) { b.mttrSum += i.mttr; b.mttrN++; }
      if (i.mttd != null) { b.mttdSum += i.mttd; b.mttdN++; b.downtime += i.mttd; }
    }
    return Array.from(buckets.values())
      .sort((a, b) => a.key - b.key)
      .map((b) => ({
        label: b.label,
        mtta: b.mttaN ? round1(b.mttaSum / b.mttaN) : 0,
        mttr: b.mttrN ? round1(b.mttrSum / b.mttrN) : 0,
        mttd: b.mttdN ? round1(b.mttdSum / b.mttdN) : 0,
        downtime: round1(b.downtime),
      }));
  }, [enriched]);

  const paretoByLine: ParetoItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of enriched) {
      if (i.mttd == null) continue;
      const key = i.lineName || i.areaName || 'Khác';
      map.set(key, (map.get(key) ?? 0) + i.mttd);
    }
    return Array.from(map, ([label, value]) => ({ label, value: Math.round(value) }));
  }, [enriched]);

  const paretoByMachine: ParetoItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of enriched) map.set(i.machineCode, (map.get(i.machineCode) ?? 0) + 1);
    return Array.from(map, ([label, value]) => ({ label, value }));
  }, [enriched]);

  const paretoByCategory: ParetoItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of enriched) {
      const key = i.categoryName || 'Chưa phân loại';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map, ([label, value]) => ({ label, value }));
  }, [enriched]);

  const paretoByParts: ParetoItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of logs) {
      if (!l.partsReplaced) continue;
      try {
        const parsed: PartsPayload = JSON.parse(l.partsReplaced);
        if (Array.isArray(parsed.parts)) {
          for (const p of parsed.parts) {
            if (!p?.name) continue;
            map.set(p.name, (map.get(p.name) ?? 0) + (Number(p.quantity) || 1));
          }
        }
      } catch {
        /* dữ liệu cũ dạng chữ tự do, bỏ qua khi gộp thống kê */
      }
    }
    return Array.from(map, ([label, value]) => ({ label, value }));
  }, [logs]);

  const monthlyReport = useMemo(() => {
    type MBucket = { mttaSum: number; mttaN: number; mttrSum: number; mttrN: number; mttdSum: number; mttdN: number; sortKey: number };
    const map = new Map<string, MBucket>();
    for (const i of enriched) {
      const d = new Date(i.createdAt);
      const label = `Th${d.getMonth() + 1}/${d.getFullYear()}`;
      const sortKey = d.getFullYear() * 100 + d.getMonth();
      let b = map.get(label);
      if (!b) { b = { mttaSum: 0, mttaN: 0, mttrSum: 0, mttrN: 0, mttdSum: 0, mttdN: 0, sortKey }; map.set(label, b); }
      if (i.mtta != null) { b.mttaSum += i.mtta; b.mttaN++; }
      if (i.mttr != null) { b.mttrSum += i.mttr; b.mttrN++; }
      if (i.mttd != null) { b.mttdSum += i.mttd; b.mttdN++; }
    }
    const months = Array.from(map.entries()).sort((a, b) => a[1].sortKey - b[1].sortKey);
    return {
      months: months.map(([label]) => label),
      rows: [
        { metric: 'MTTA (phút)', values: months.map(([, b]) => (b.mttaN ? round1(b.mttaSum / b.mttaN) : null)), mean: round1(kpi.mtta) },
        { metric: 'MTTR (phút)', values: months.map(([, b]) => (b.mttrN ? round1(b.mttrSum / b.mttrN) : null)), mean: round1(kpi.mttr) },
        { metric: 'MTTD (phút)', values: months.map(([, b]) => (b.mttdN ? round1(b.mttdSum / b.mttdN) : null)), mean: round1(kpi.mttd) },
      ],
    };
  }, [enriched, kpi]);

  const reliability = useMemo(() => {
    type RBucket = { code: string; name: string; type: string; events: number[]; mttrSum: number; mttrN: number; downtime: number; count: number };
    const map = new Map<string, RBucket>();
    for (const i of enriched) {
      let r = map.get(i.machineCode);
      if (!r) { r = { code: i.machineCode, name: i.machineName, type: i.machineTypeName || '—', events: [], mttrSum: 0, mttrN: 0, downtime: 0, count: 0 }; map.set(i.machineCode, r); }
      r.count++;
      r.events.push(new Date(i.createdAt).getTime());
      if (i.mttr != null) { r.mttrSum += i.mttr; r.mttrN++; }
      if (i.mttd != null) r.downtime += i.mttd;
    }
    return Array.from(map.values())
      .map((r) => {
        const sorted = [...r.events].sort((a, b) => a - b);
        let mtbf: number | null = null;
        if (sorted.length >= 2) {
          const gaps: number[] = [];
          for (let k = 1; k < sorted.length; k++) gaps.push((sorted[k] - sorted[k - 1]) / 60000);
          mtbf = gaps.reduce((s, n) => s + n, 0) / gaps.length;
        }
        return { code: r.code, name: r.name, type: r.type, count: r.count, mtbf, mttr: r.mttrN ? r.mttrSum / r.mttrN : null, downtime: round1(r.downtime) };
      })
      .sort((a, b) => b.count - a.count);
  }, [enriched]);

  const reliabilityFiltered = useMemo(() => {
    const q = reliabilitySearch.trim().toLowerCase();
    if (!q) return reliability;
    return reliability.filter((r) => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
  }, [reliability, reliabilitySearch]);

  const detailIncidents = useMemo(
    () => (detailMachineCode ? enriched.filter((i) => i.machineCode === detailMachineCode).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []),
    [detailMachineCode, enriched]
  );

  // ---- Khối tóm tắt nhanh (giữ nguyên) ----
  const statusBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    machines.forEach((m) => map.set(m.statusName, (map.get(m.statusName) ?? 0) + 1));
    return Array.from(map, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [machines]);
  const overdueMaintenance = scheduleMachines.filter((m) => m.status === 'overdue').length;
  const upcomingMaintenance = scheduleMachines.filter((m) => m.status === 'upcoming').length;
  const pendingProposals = proposals.filter((p) => !p.resolved).length;
  const shortcuts = [
    { label: 'Danh Sách MMTB', href: '/maintenance/machines', icon: IconDeviceLaptop, bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Bảo Dưỡng MMTB', href: '/maintenance/schedule', icon: IconClockHour4, bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Nhu Cầu Sửa Chữa', href: '/maintenance/tickets', icon: IconAlertTriangle, bg: 'bg-rose-50', text: 'text-rose-600' },
    { label: 'Đề Xuất Cải Tiến', href: '/maintenance/proposals', icon: IconBulb, bg: 'bg-violet-50', text: 'text-violet-600' },
  ];

  return (
    <MaintenanceShell title="Tổng Quan" subtitle="Phân tích MTTA/MTTR/MTTD, Pareto sự cố — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">Tổng Quan</h1>
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>}

        {/* Bộ lọc phân tích */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end">
            <label className="block">
              <span className="block text-[11px] font-bold text-gray-500 mb-1">Nhà máy</span>
              <FilterSelect
                value={pFactoryId}
                onChange={(v) => { setPFactoryId(v); setPAreaId(''); setPLineId(''); }}
                options={factories.map((f) => ({ id: f.id, name: f.name }))}
                placeholder="Tất cả nhà máy"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-bold text-gray-500 mb-1">Phân xưởng</span>
              <FilterSelect
                value={pAreaId}
                onChange={(v) => { setPAreaId(v); setPLineId(''); }}
                options={areaOptions}
                placeholder="Tất cả phân xưởng"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-bold text-gray-500 mb-1">Line</span>
              <FilterSelect
                value={pLineId}
                onChange={setPLineId}
                options={lineOptions}
                placeholder="Tất cả line"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-bold text-gray-500 mb-1">Khoảng thời gian</span>
              <DateRangeFilter from={pDateFrom} to={pDateTo} onFromChange={setPDateFrom} onToChange={setPDateTo} />
            </label>
            <button
              onClick={handleApplyFilter}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light disabled:opacity-50 h-[38px]"
            >
              <IconFilter size={14} /> {loading ? 'Đang lọc...' : 'Lọc'}
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'MTTA', sub: 'Trung bình thời gian chờ sửa', value: `${fmtMin(kpi.mtta)} phút`, icon: IconStopwatch, bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
            { label: 'MTTR', sub: 'Trung bình thời gian sửa', value: `${fmtMin(kpi.mttr)} phút`, icon: IconTool, bg: 'bg-violet-50', iconBg: 'bg-violet-100', text: 'text-violet-600' },
            { label: 'MTTD', sub: 'Trung bình thời gian dừng máy', value: `${fmtMin(kpi.mttd)} phút`, icon: IconGauge, bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
            { label: 'Số sự cố', sub: 'Tổng số sự cố', value: `${kpi.count}`, icon: IconAlertTriangle, bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600' },
            { label: 'Downtime', sub: 'Tổng thời gian dừng máy', value: `${fmtMin(kpi.downtime)} phút`, icon: IconClockHour4, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
          ].map((c) => (
            <div key={c.label} className={`rounded-2xl ${c.bg} p-4 shadow-sm`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${c.iconBg}`}>
                  <c.icon size={16} className={c.text} />
                </div>
                <span className="text-[11px] font-bold text-gray-500 uppercase">{c.label}</span>
              </div>
              <div className="text-xl font-extrabold text-tbs-dark">{c.value}</div>
              <div className="text-[10px] font-semibold text-gray-400 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Trend Analysis */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h2 className="text-sm font-extrabold text-tbs-dark mb-1">Xu Hướng Theo Tuần</h2>
          <p className="text-[11px] text-gray-400 mb-3">Downtime tổng + MTTA/MTTR/MTTD trung bình mỗi tuần</p>
          {loading ? <div className="p-8 text-center text-xs text-gray-400">Đang tải...</div> : <TrendChart data={trendData} />}
        </div>

        {/* Pareto x3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-tbs-dark mb-3">Pareto — Downtime Theo Line / Khu Vực</h2>
            {loading ? <div className="p-8 text-center text-xs text-gray-400">Đang tải...</div> : <ParetoChart data={paretoByLine} valueLabel="Downtime (phút)" barColor="#0d7a5c" />}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-tbs-dark mb-3">Pareto — Top Máy Gặp Sự Cố</h2>
            {loading ? <div className="p-8 text-center text-xs text-gray-400">Đang tải...</div> : <ParetoChart data={paretoByMachine} valueLabel="Số lượng sự cố" barColor="#2563eb" />}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-tbs-dark mb-3">Pareto — Top Loại Lỗi (Danh Mục Hư)</h2>
            {loading ? <div className="p-8 text-center text-xs text-gray-400">Đang tải...</div> : <ParetoChart data={paretoByCategory} valueLabel="Số lượng sự cố" barColor="#e11d48" />}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-tbs-dark mb-3">Pareto — Top Linh Kiện Thay Thế Nhiều Nhất</h2>
            {loading ? <div className="p-8 text-center text-xs text-gray-400">Đang tải...</div> : <ParetoChart data={paretoByParts} valueLabel="Số lượng thay thế" barColor="#f59e0b" />}
          </div>
        </div>

        {/* Monthly Downtime Report */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h2 className="text-sm font-extrabold text-tbs-dark mb-3">Báo Cáo Downtime Theo Tháng</h2>
          {monthlyReport.months.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">Chưa có dữ liệu</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100 whitespace-nowrap">
                    <th className="p-3">Chỉ số</th>
                    {monthlyReport.months.map((m) => (
                      <th key={m} className="p-3">{m}</th>
                    ))}
                    <th className="p-3">Trung bình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {monthlyReport.rows.map((row) => (
                    <tr key={row.metric}>
                      <td className="p-3 font-bold text-tbs-dark">{row.metric}</td>
                      {row.values.map((v, idx) => (
                        <td key={idx} className="p-3 font-mono">{v == null ? '—' : v}</td>
                      ))}
                      <td className="p-3 font-mono font-bold text-accent">{row.mean}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Chi tiết độ tin cậy từng máy */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h2 className="text-sm font-extrabold text-tbs-dark">Chi Tiết Độ Tin Cậy Từng Máy</h2>
            <div className="relative">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={reliabilitySearch}
                onChange={(e) => setReliabilitySearch(e.target.value)}
                placeholder="Tìm máy theo mã/tên..."
                className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs w-56"
              />
            </div>
          </div>
          {reliabilityFiltered.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">{reliability.length === 0 ? 'Chưa có sự cố nào trong khoảng lọc' : 'Không tìm thấy máy phù hợp'}</div>
          ) : (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0">
                  <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100 whitespace-nowrap">
                    <th className="p-3">Máy</th>
                    <th className="p-3">Loại máy</th>
                    <th className="p-3">Số lần hư</th>
                    <th className="p-3">MTBF (phút)</th>
                    <th className="p-3">MTTR (phút)</th>
                    <th className="p-3">Downtime (phút)</th>
                    <th className="p-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700 whitespace-nowrap">
                  {reliabilityFiltered.map((r) => (
                    <tr key={r.code} className="hover:bg-gray-50/80">
                      <td className="p-3">
                        <div className="font-bold text-tbs-dark">{r.name}</div>
                        <div className="font-mono text-[10px] text-accent">{r.code}</div>
                      </td>
                      <td className="p-3 text-gray-500">{r.type}</td>
                      <td className="p-3 font-mono font-bold">{r.count}</td>
                      <td className="p-3 font-mono">{fmtMin(r.mtbf)}</td>
                      <td className="p-3 font-mono">{fmtMin(r.mttr)}</td>
                      <td className="p-3 font-mono">{r.downtime}</td>
                      <td className="p-3">
                        <button onClick={() => setDetailMachineCode(r.code)} className="px-2.5 py-1.5 rounded-lg bg-accent-wash text-accent text-[11px] font-bold hover:bg-emerald-100">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Khối tóm tắt nhanh */}
        {quickLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Đang tải...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-extrabold text-tbs-dark mb-3">Trạng Thái Máy</h2>
                <div className="space-y-2.5">
                  {statusBreakdown.length === 0 && <p className="text-xs text-gray-400">Chưa có dữ liệu</p>}
                  {statusBreakdown.map((s) => {
                    const key = normalizeStatus(s.name);
                    const color = key === 'su dung' ? 'bg-emerald-500' : key === 'chua su dung' ? 'bg-slate-400' : key === 'khong su dung' ? 'bg-amber-500' : key === 'de nghi thanh ly' ? 'bg-rose-500' : 'bg-blue-400';
                    const pct = machines.length ? (s.count / machines.length) * 100 : 0;
                    return (
                      <div key={s.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-600">{s.name}</span>
                          <span className="font-bold text-tbs-dark">{s.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-extrabold text-tbs-dark mb-3 flex items-center gap-1.5">
                  <IconCircleCheck size={16} className="text-emerald-500" /> Lịch Bảo Trì
                </h2>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-rose-50">
                    <div className="text-xl font-extrabold text-rose-600">{overdueMaintenance}</div>
                    <div className="text-[11px] font-semibold text-gray-500 mt-0.5">Quá hạn</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50">
                    <div className="text-xl font-extrabold text-amber-600">{upcomingMaintenance}</div>
                    <div className="text-[11px] font-semibold text-gray-500 mt-0.5">Sắp đến hạn</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100">
                    <div className="text-xl font-extrabold text-slate-500">{scheduleMachines.filter((m) => m.status === 'unscheduled').length}</div>
                    <div className="text-[11px] font-semibold text-gray-500 mt-0.5">Chưa lên lịch</div>
                  </div>
                </div>
                <Link href="/maintenance/schedule" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-accent hover:underline">
                  Xem chi tiết <IconArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-tbs-dark mb-2">Truy Cập Nhanh</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {shortcuts.map((s) => (
                  <Link key={s.href} href={s.href} className={`flex flex-col items-center gap-2 rounded-2xl ${s.bg} p-4 hover:brightness-95 transition`}>
                    <s.icon size={24} className={s.text} />
                    <span className="text-xs font-bold text-tbs-dark text-center">{s.label}</span>
                  </Link>
                ))}
                {pendingProposals > 0 && (
                  <div className="col-span-2 sm:col-span-4 text-[11px] text-gray-400 text-center">{pendingProposals} đề xuất chưa xử lý</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {detailMachineCode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDetailMachineCode(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-tbs-dark">
                Lịch sử sự cố — <span className="font-mono text-accent">{detailMachineCode}</span>
              </h3>
              <button onClick={() => setDetailMachineCode(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <IconX size={18} />
              </button>
            </div>
            <div className="overflow-y-auto space-y-2">
              {detailIncidents.length === 0 && <p className="text-xs text-gray-400">Không có dữ liệu</p>}
              {detailIncidents.map((i) => (
                <div key={i.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <span className="font-bold text-tbs-dark">{new Date(i.createdAt).toLocaleString('vi-VN')}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">{i.categoryName ?? 'Chưa phân loại'}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-gray-500">
                    <span>MTTA: <b className="text-tbs-dark">{fmtMin(i.mtta)} phút</b></span>
                    <span>MTTR: <b className="text-tbs-dark">{fmtMin(i.mttr)} phút</b></span>
                    <span>MTTD: <b className="text-tbs-dark">{fmtMin(i.mttd)} phút</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MaintenanceShell>
  );
}
