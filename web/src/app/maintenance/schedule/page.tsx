'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  IconDeviceLaptop,
  IconAlertTriangle,
  IconClockHour4,
  IconCircleCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCalendarStats,
} from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';
import RefreshButton from '@/components/RefreshButton';
import {
  buildMaintenanceCalendarMap,
  buildCalendarWeeks,
  type CalendarCell,
} from '@/lib/maintenanceCalendar';

type ScheduleMachine = {
  id: string;
  code: string;
  name: string;
  factoryId: string | null;
  factoryName: string | null;
  areaId: string | null;
  areaName: string | null;
  scheduled: boolean;
  periodId: string | null;
  periodName: string | null;
  periodDays: number | null;
  lastMaintenanceDate: string | null;
  dueDate: string | null;
  daysLeft: number | null;
  status: 'unscheduled' | 'overdue' | 'upcoming' | 'scheduled';
};

type Period = { id: string; name: string; days: number | null };

type LogEntry = {
  id: string;
  machineId: string;
  machineCode: string;
  machineName: string;
  factoryName: string | null;
  areaName: string | null;
  technicianName: string;
  technicianCode: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  repairDetail: string;
  partsReplaced: string | null;
  incidentDescription: string | null;
};

const STATUS_META: Record<ScheduleMachine['status'], { label: (m: ScheduleMachine) => string; bg: string; text: string }> = {
  unscheduled: { label: () => 'Chưa lên lịch', bg: 'bg-slate-100', text: 'text-slate-500' },
  overdue: { label: (m) => `Quá hạn ${Math.abs(m.daysLeft ?? 0)} ngày`, bg: 'bg-rose-100', text: 'text-rose-700' },
  upcoming: { label: (m) => `Còn ${m.daysLeft} ngày`, bg: 'bg-amber-100', text: 'text-amber-700' },
  scheduled: { label: (m) => `Còn ${m.daysLeft} ngày`, bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function todayInputValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Tab = 'assign' | 'track' | 'calendar';

export default function MaintenanceSchedulePage() {
  const [machines, setMachines] = useState<ScheduleMachine[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [completedThisMonth, setCompletedThisMonth] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('assign');

  const [refreshing, setRefreshing] = useState(false);

  const load = async (force = false) => {
    try {
      force ? setRefreshing(true) : setLoading(true);
      setError(null);
      const fresh = force ? '?fresh=1' : '';
      const settled = await Promise.allSettled([
        fetch(`/api/mmtb-kg/schedule${fresh}`).then((r) => r.json()),
        fetch(`/api/mmtb-kg/logs${fresh}`).then((r) => r.json()),
      ]);
      const [scheduleRes, logsRes] = settled.map((s) => (s.status === 'fulfilled' ? s.value : { success: false, error: String(s.reason) }));
      if (scheduleRes.success) {
        setMachines(scheduleRes.machines || []);
        setPeriods(scheduleRes.periods || []);
        setCompletedThisMonth(scheduleRes.completedThisMonth || 0);
      } else {
        console.warn('Failed to load schedule from tbsMayMoc:', scheduleRes.error);
        setError(scheduleRes.error || 'Không lấy được dữ liệu lịch bảo trì');
      }
      if (logsRes.success) setLogs(logsRes.data || []);
    } catch (err) {
      console.warn('Failed to fetch schedule from tbsMayMoc:', err);
    } finally {
      force ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Danh mục Nhà máy/Khu vực suy thẳng từ danh sách máy đã tải — không cần gọi API riêng.
  const factoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    machines.forEach((m) => { if (m.factoryId && m.factoryName) map.set(m.factoryId, m.factoryName); });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [machines]);

  const stats = useMemo(() => {
    let overdue = 0, upcoming = 0;
    for (const m of machines) {
      if (m.status === 'overdue') overdue++;
      else if (m.status === 'upcoming') upcoming++;
    }
    return { total: machines.length, overdue, upcoming, completedThisMonth };
  }, [machines, completedThisMonth]);

  return (
    <MaintenanceShell title="Bảo Dưỡng MMTB" subtitle="Lên lịch — Theo dõi — Xem lịch bảo trì định kỳ — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold text-tbs-dark">Bảo Dưỡng MMTB</h1>
          <RefreshButton onClick={() => load(true)} loading={refreshing} />
        </div>

        {/* Lỗi kết nối tbsMayMoc chỉ log console (F12), không hiện banner ngoài trang */}

        {/* 4 Ô TỔNG QUAN */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tổng số máy', value: stats.total, icon: IconDeviceLaptop, bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
            { label: 'Quá hạn', value: stats.overdue, icon: IconAlertTriangle, bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600' },
            { label: 'Sắp đến hạn', value: stats.upcoming, icon: IconClockHour4, bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
            { label: 'Hoàn thành tháng này', value: stats.completedThisMonth, icon: IconCircleCheck, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
          ].map((c) => (
            <div key={c.label} className={`flex items-center gap-3 rounded-2xl ${c.bg} p-4 shadow-sm`}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${c.iconBg}`}>
                <c.icon size={22} className={c.text} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-2xl font-extrabold text-tbs-dark">{c.value}</div>
                <div className="truncate text-xs font-semibold text-gray-500">{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'assign' as Tab, label: 'Lên Lịch Bảo Trì' },
            { key: 'track' as Tab, label: 'Theo Dõi Bảo Trì' },
            { key: 'calendar' as Tab, label: 'Xem Lịch Bảo Trì' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tab === t.key ? 'bg-tbs-dark text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Đang tải...</div>
        ) : (
          <>
            {tab === 'assign' && (
              <AssignTab machines={machines} periods={periods} factoryOptions={factoryOptions} onAssigned={load} />
            )}
            {tab === 'track' && <TrackTab machines={machines} logs={logs} factoryOptions={factoryOptions} />}
            {tab === 'calendar' && <CalendarTab machines={machines} factoryOptions={factoryOptions} />}
          </>
        )}
      </div>
    </MaintenanceShell>
  );
}

// ============================== TAB 1: LÊN LỊCH BẢO TRÌ ==============================

function AssignTab({
  machines,
  periods,
  factoryOptions,
  onAssigned,
}: {
  machines: ScheduleMachine[];
  periods: Period[];
  factoryOptions: { id: string; name: string }[];
  onAssigned: () => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [factoryId, setFactoryId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [periodId, setPeriodId] = useState('');
  const [anchorDate, setAnchorDate] = useState(todayInputValue());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const areaOptions = useMemo(() => {
    const map = new Map<string, string>();
    machines.forEach((m) => {
      if (m.areaId && m.areaName && (!factoryId || m.factoryId === factoryId)) map.set(m.areaId, m.areaName);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [machines, factoryId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return machines.filter((m) => {
      const matchesQ = !q || m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
      const matchesFactory = !factoryId || m.factoryId === factoryId;
      const matchesArea = !areaId || m.areaId === areaId;
      return matchesQ && matchesFactory && matchesArea;
    });
  }, [machines, search, factoryId, areaId]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (filtered.every((m) => prev.has(m.id))) return new Set();
      return new Set(filtered.map((m) => m.id));
    });
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!periodId) {
      setFormError('Vui lòng chọn Chu kỳ bảo trì');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/mmtb-kg/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineIds: Array.from(selected), maintenancePeriodId: periodId, anchorDate }),
      });
      const result = await res.json();
      if (!result.success) {
        setFormError(result.error || 'Không gán được lịch bảo trì');
        return;
      }
      setShowAssignForm(false);
      setSelected(new Set());
      setPeriodId('');
      await onAssigned();
    } catch {
      setFormError('Không kết nối được tới hệ thống MMTB');
    } finally {
      setSubmitting(false);
    }
  }

  const allChecked = filtered.length > 0 && filtered.every((m) => selected.has(m.id));

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã tài sản, tên máy..."
          className="min-w-[220px] flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
        />
        <FilterSelect
          value={factoryId}
          onChange={(v) => { setFactoryId(v); setAreaId(''); }}
          options={factoryOptions}
          placeholder="Tất cả nhà máy"
        />
        <FilterSelect
          value={areaId}
          onChange={setAreaId}
          options={areaOptions}
          placeholder={factoryId ? 'Tất cả khu vực' : 'Chọn nhà máy trước'}
          disabled={!factoryId}
        />
        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 && (
            <span className="text-xs font-bold text-accent">{selected.size} máy đã chọn</span>
          )}
          <button
            onClick={() => setShowAssignForm(true)}
            disabled={selected.size === 0}
            className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Gán Lịch Bảo Trì
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100 whitespace-nowrap">
              <th className="p-4 w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4" />
              </th>
              <th className="p-4">Mã Tài Sản</th>
              <th className="p-4">Tên Máy</th>
              <th className="p-4">Nhà Máy</th>
              <th className="p-4">Khu Vực</th>
              <th className="p-4">Chu Kỳ Hiện Tại</th>
              <th className="p-4">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700 whitespace-nowrap">
            {filtered.length === 0 && (
              <tr><td className="p-4 text-gray-400" colSpan={7}>Không có máy phù hợp</td></tr>
            )}
            {filtered.map((m) => {
              const meta = STATUS_META[m.status];
              return (
                <tr key={m.id} className={`hover:bg-gray-50/80 transition ${selected.has(m.id) ? 'bg-emerald-50/40' : ''}`}>
                  <td className="p-4"><input type="checkbox" checked={selected.has(m.id)} onChange={() => toggle(m.id)} className="w-4 h-4" /></td>
                  <td className="p-4 font-mono font-bold text-accent">{m.code}</td>
                  <td className="p-4 font-semibold text-tbs-dark">{m.name}</td>
                  <td className="p-4">{m.factoryName ?? '-'}</td>
                  <td className="p-4">{m.areaName ?? '-'}</td>
                  <td className="p-4">{m.periodName ?? '-'}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 font-bold rounded ${meta.bg} ${meta.text}`}>{meta.label(m)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAssignForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAssign} className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-tbs-dark">Gán Lịch Bảo Trì</h3>
            <p className="text-xs text-gray-500">Áp dụng cho <span className="font-bold text-accent">{selected.size}</span> máy đã chọn</p>
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {formError}</div>
            )}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-600">Chu kỳ bảo trì *</span>
              <div className="grid grid-cols-2 gap-2">
                {periods.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPeriodId(p.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                      periodId === p.id ? 'bg-accent text-white border-accent' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Ngày bắt đầu tính *</span>
              <input
                type="date"
                value={anchorDate}
                onChange={(e) => setAnchorDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal"
                required
              />
            </label>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAssignForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200">
                Huỷ
              </button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light disabled:opacity-50">
                {submitting ? 'Đang lưu...' : 'Áp Dụng'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ============================== TAB 2: THEO DÕI BẢO TRÌ ==============================

function TrackTab({
  machines,
  logs,
  factoryOptions,
}: {
  machines: ScheduleMachine[];
  logs: LogEntry[];
  factoryOptions: { id: string; name: string }[];
}) {
  const [factoryId, setFactoryId] = useState('');
  const [areaId, setAreaId] = useState('');

  // Xưởng lọc theo Nhà máy đã chọn — giống hệt pattern ở Tab 1 (UnscheduledMachinesXxx) và Tab 3
  // (CalendarTab), dựng từ chính danh sách máy (machines đã có sẵn areaId/areaName/factoryId).
  const areaOptions = useMemo(() => {
    const map = new Map<string, string>();
    machines.forEach((m) => {
      if (m.areaId && m.areaName && (!factoryId || m.factoryId === factoryId)) map.set(m.areaId, m.areaName);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [machines, factoryId]);

  const needsAction = useMemo(() => {
    return machines
      .filter(
        (m) =>
          (m.status === 'overdue' || m.status === 'upcoming') &&
          (!factoryId || m.factoryId === factoryId) &&
          (!areaId || m.areaId === areaId),
      )
      .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
  }, [machines, factoryId, areaId]);

  // LogEntry (lịch sử bảo trì) chỉ có tên Xưởng dạng chữ, không có ID riêng — so tên qua
  // areaOptions (đã lọc đúng Nhà máy) giống cách factoryName đang được so tên bên dưới.
  const filteredLogs = useMemo(() => {
    const areaName = areaId ? areaOptions.find((a) => a.id === areaId)?.name : null;
    return logs.filter(
      (l) =>
        (!factoryId || factoryOptions.find((f) => f.id === factoryId)?.name === l.factoryName) &&
        (!areaName || l.areaName === areaName),
    );
  }, [logs, factoryId, factoryOptions, areaId, areaOptions]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
        <FilterSelect
          value={factoryId}
          onChange={(v) => { setFactoryId(v); setAreaId(''); }}
          options={factoryOptions}
          placeholder="Tất cả nhà máy"
        />
        <FilterSelect
          value={areaId}
          onChange={setAreaId}
          options={areaOptions}
          placeholder={factoryId ? 'Tất cả khu vực' : 'Chọn nhà máy trước'}
          disabled={!factoryId}
        />
      </div>

      <div>
        <h2 className="text-sm font-extrabold text-tbs-dark mb-2 flex items-center gap-1.5">
          <IconAlertTriangle size={16} className="text-rose-500" /> Cần Xử Lý ({needsAction.length})
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100 whitespace-nowrap">
                <th className="p-4">Mã Tài Sản</th>
                <th className="p-4">Tên Máy</th>
                <th className="p-4">Nhà Máy</th>
                <th className="p-4">Khu Vực</th>
                <th className="p-4">Chu Kỳ</th>
                <th className="p-4">Hạn Tiếp Theo</th>
                <th className="p-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 whitespace-nowrap">
              {needsAction.length === 0 && (
                <tr><td className="p-4 text-gray-400" colSpan={7}>Không có máy nào cần xử lý — mọi thứ đều trong hạn 🎉</td></tr>
              )}
              {needsAction.map((m) => {
                const meta = STATUS_META[m.status];
                return (
                  <tr key={m.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4 font-mono font-bold text-accent">{m.code}</td>
                    <td className="p-4 font-semibold text-tbs-dark">{m.name}</td>
                    <td className="p-4">{m.factoryName ?? '-'}</td>
                    <td className="p-4">{m.areaName ?? '-'}</td>
                    <td className="p-4">{m.periodName ?? '-'}</td>
                    <td className="p-4">{formatDate(m.dueDate)}</td>
                    <td className="p-4"><span className={`px-2.5 py-1 font-bold rounded ${meta.bg} ${meta.text}`}>{meta.label(m)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-extrabold text-tbs-dark mb-2 flex items-center gap-1.5">
          <IconCircleCheck size={16} className="text-emerald-500" /> Lịch Sử Đã Bảo Trì ({filteredLogs.length})
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100 whitespace-nowrap">
                <th className="p-4">Mã Máy</th>
                <th className="p-4">Tên Máy</th>
                <th className="p-4">Nhà Máy / Khu Vực</th>
                <th className="p-4">Kỹ Thuật Viên</th>
                <th className="p-4">Thời Gian Hoàn Thành</th>
                <th className="p-4">Thời Lượng</th>
                <th className="p-4">Nội Dung Sửa Chữa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredLogs.length === 0 && (
                <tr><td className="p-4 text-gray-400" colSpan={7}>Chưa có lịch sử bảo trì nào</td></tr>
              )}
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/80 transition align-top">
                  <td className="p-4 font-mono font-bold text-accent whitespace-nowrap">{l.machineCode}</td>
                  <td className="p-4 font-semibold text-tbs-dark whitespace-nowrap">{l.machineName}</td>
                  <td className="p-4 whitespace-nowrap">{l.factoryName ?? '-'} / {l.areaName ?? '-'}</td>
                  <td className="p-4 whitespace-nowrap">{l.technicianName} ({l.technicianCode})</td>
                  <td className="p-4 whitespace-nowrap">{formatDateTime(l.endTime)}</td>
                  <td className="p-4 whitespace-nowrap">{l.durationMinutes} phút</td>
                  <td className="p-4 min-w-[220px]">{l.repairDetail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================== TAB 3: XEM LỊCH BẢO TRÌ ==============================

function CalendarTab({
  machines,
  factoryOptions,
}: {
  machines: ScheduleMachine[];
  factoryOptions: { id: string; name: string }[];
}) {
  const [factoryId, setFactoryId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selectedCell, setSelectedCell] = useState<CalendarCell | null>(null);

  const areaOptions = useMemo(() => {
    const map = new Map<string, string>();
    machines.forEach((m) => {
      if (m.areaId && m.areaName && (!factoryId || m.factoryId === factoryId)) map.set(m.areaId, m.areaName);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [machines, factoryId]);

  const filtered = useMemo(() => {
    return machines.filter((m) => (!factoryId || m.factoryId === factoryId) && (!areaId || m.areaId === areaId));
  }, [machines, factoryId, areaId]);

  const now = new Date();
  const monthStart = cursor;
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
  const weeks = useMemo(() => {
    const map = buildMaintenanceCalendarMap(filtered, monthStart, monthEnd, now);
    return buildCalendarWeeks(map, monthStart, monthEnd, now);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, cursor]);

  const DOT_COLOR: Record<string, string> = { overdue: 'bg-rose-500', upcoming: 'bg-amber-500', done: 'bg-emerald-500' };
  const DOT_LABEL: Record<string, string> = { overdue: 'Quá hạn', upcoming: 'Sắp đến hạn', done: 'Đã bảo trì' };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
        <FilterSelect value={factoryId} onChange={(v) => { setFactoryId(v); setAreaId(''); }} options={factoryOptions} placeholder="Tất cả nhà máy" />
        <FilterSelect value={areaId} onChange={setAreaId} options={areaOptions} placeholder={factoryId ? 'Tất cả khu vực' : 'Chọn nhà máy trước'} disabled={!factoryId} />
        <div className="ml-auto flex items-center gap-3">
          {Object.entries(DOT_LABEL).map(([k, label]) => (
            <span key={k} className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
              <span className={`w-2.5 h-2.5 rounded-full ${DOT_COLOR[k]}`} />{label}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500">
            <IconChevronLeft size={16} />
          </button>
          <span className="text-sm font-extrabold text-tbs-dark flex items-center gap-1.5">
            <IconCalendarStats size={16} className="text-accent" /> {MONTH_NAMES[cursor.getMonth()]}/{cursor.getFullYear()}
          </span>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500">
            <IconChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="text-[10px] font-bold text-gray-400 pb-1">{w}</div>
          ))}
          {weeks.flatMap((week, wi) =>
            week.map((cell, di) => {
              if (!cell) return <div key={`${wi}-${di}`} />;
              const dotColor = cell.status ? DOT_COLOR[cell.status] : '';
              return (
                <button
                  key={cell.date}
                  onClick={() => cell.machines.length > 0 && setSelectedCell(cell)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-bold border transition ${
                    cell.isToday ? 'border-accent ring-1 ring-accent' : 'border-gray-100'
                  } ${cell.machines.length > 0 ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={cell.isToday ? 'text-accent' : 'text-gray-700'}>{cell.day}</span>
                  {cell.status && (
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  )}
                  {cell.machines.length > 1 && <span className="text-[9px] text-gray-400 font-semibold">{cell.machines.length} máy</span>}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {selectedCell && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-tbs-dark">Ngày {formatDate(selectedCell.date)}</h3>
            <div className="space-y-2">
              {selectedCell.machines.map((m, i) => (
                <div key={`${m.id}-${i}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <div className="text-xs font-bold text-tbs-dark">{m.name}</div>
                    <div className="text-[11px] font-mono text-gray-400">{m.code}</div>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                    m.status === 'overdue' ? 'bg-rose-100 text-rose-700' : m.status === 'upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {DOT_LABEL[m.status]}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedCell(null)} className="w-full py-2.5 bg-tbs-dark text-white rounded-xl font-bold text-xs">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
