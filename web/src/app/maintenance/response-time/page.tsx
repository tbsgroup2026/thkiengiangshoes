'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconClockHour4, IconStopwatch, IconStar, IconTrophy } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';
import DateRangeFilter, { inDateRange } from '@/components/DateRangeFilter';
import RefreshButton from '@/components/RefreshButton';

type ResponseTimeIncident = {
  id: string;
  isMaintenanceDue: boolean;
  createdAt: string;
  acceptedAt: string;
  completedAt: string | null;
  assignedTo: { id: string; name: string; employeeCode: string } | null;
  factoryName: string | null;
  areaName: string | null;
};

type ResponseTimeLog = {
  id: string;
  createdAt: string;
  skillRating: number | null;
  technician: { id: string; name: string; employeeCode: string };
  factoryName: string | null;
};

function minutesBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 60000;
}

function formatMinutes(m: number): string {
  if (m < 60) return `${Math.round(m)} phút`;
  const h = Math.floor(m / 60);
  const rem = Math.round(m % 60);
  return `${h} giờ ${rem} phút`;
}

type CategoryOption = { id: string; name: string };

export default function ResponseTimePage() {
  const [incidents, setIncidents] = useState<ResponseTimeIncident[]>([]);
  const [logs, setLogs] = useState<ResponseTimeLog[]>([]);
  const [factories, setFactories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [factoryName, setFactoryName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  async function load(force = false) {
    try {
      force ? setRefreshing(true) : setLoading(true);
      setError(null);
      const fresh = force ? '?fresh=1' : '';
      const [resRes, facRes] = await Promise.all([
        fetch(`/api/mmtb-kg/response-time${fresh}`).then((r) => r.json()),
        fetch(`/api/mmtb-kg/categories?type=FACTORY${force ? '&fresh=1' : ''}`).then((r) => r.json()),
      ]);
      if (resRes.success) {
        setIncidents(resRes.incidents || []);
        setLogs(resRes.logs || []);
      } else {
        setError(resRes.error || 'Không lấy được dữ liệu');
      }
      if (facRes.success) setFactories(facRes.data || []);
    } catch (err) {
      console.warn('Failed to fetch response-time from tbsMayMoc:', err);
    } finally {
      force ? setRefreshing(false) : setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredIncidents = useMemo(
    () =>
      incidents.filter(
        (i) => (!factoryName || i.factoryName === factoryName) && inDateRange(i.createdAt, dateFrom, dateTo),
      ),
    [incidents, factoryName, dateFrom, dateTo],
  );
  const filteredLogs = useMemo(
    () =>
      logs.filter(
        (l) => (!factoryName || l.factoryName === factoryName) && inDateRange(l.createdAt, dateFrom, dateTo),
      ),
    [logs, factoryName, dateFrom, dateTo],
  );

  const overall = useMemo(() => {
    const acceptTimes = filteredIncidents.map((i) => minutesBetween(i.createdAt, i.acceptedAt));
    const completeTimes = filteredIncidents
      .filter((i) => i.completedAt)
      .map((i) => minutesBetween(i.acceptedAt, i.completedAt!));
    const avg = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);
    const ratings = filteredLogs.filter((l) => l.skillRating != null).map((l) => l.skillRating!);
    return {
      avgAccept: avg(acceptTimes),
      avgComplete: avg(completeTimes),
      totalHandled: filteredIncidents.length,
      avgRating: avg(ratings),
    };
  }, [filteredIncidents, filteredLogs]);

  const ranking = useMemo(() => {
    type Row = { id: string; name: string; code: string; accepts: number[]; completes: number[]; ratings: number[] };
    const byTech = new Map<string, Row>();
    for (const i of filteredIncidents) {
      if (!i.assignedTo) continue;
      const row = byTech.get(i.assignedTo.id) ?? { id: i.assignedTo.id, name: i.assignedTo.name, code: i.assignedTo.employeeCode, accepts: [], completes: [], ratings: [] };
      row.accepts.push(minutesBetween(i.createdAt, i.acceptedAt));
      if (i.completedAt) row.completes.push(minutesBetween(i.acceptedAt, i.completedAt));
      byTech.set(i.assignedTo.id, row);
    }
    for (const l of filteredLogs) {
      if (l.skillRating == null) continue;
      const row = byTech.get(l.technician.id) ?? { id: l.technician.id, name: l.technician.name, code: l.technician.employeeCode, accepts: [], completes: [], ratings: [] };
      row.ratings.push(l.skillRating);
      byTech.set(l.technician.id, row);
    }
    const avg = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null);
    return Array.from(byTech.values())
      .map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        totalHandled: r.accepts.length,
        avgAccept: avg(r.accepts),
        avgComplete: avg(r.completes),
        avgRating: avg(r.ratings),
      }))
      .sort((a, b) => b.totalHandled - a.totalHandled);
  }, [filteredIncidents, filteredLogs]);

  return (
    <MaintenanceShell title="Thời Gian Phản Hồi" subtitle="Thống kê xử lý sự cố + đánh giá nhân viên bảo trì — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold text-tbs-dark">Thời Gian Phản Hồi</h1>
          <RefreshButton onClick={() => load(true)} loading={refreshing} />
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
          <FilterSelect value={factoryName} onChange={setFactoryName} options={factories.map((f) => ({ id: f.name, name: f.name }))} placeholder="Tất cả nhà máy" />
          <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Đang tải...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Sự cố đã nhận', value: overall.totalHandled, icon: IconClockHour4, bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
                { label: 'TB thời gian nhận việc', value: formatMinutes(overall.avgAccept), icon: IconStopwatch, bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
                { label: 'TB thời gian hoàn thành', value: formatMinutes(overall.avgComplete), icon: IconStopwatch, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
                { label: 'Đánh giá trung bình', value: overall.avgRating ? `${overall.avgRating.toFixed(1)} ★` : '-', icon: IconStar, bg: 'bg-violet-50', iconBg: 'bg-violet-100', text: 'text-violet-600' },
              ].map((c) => (
                <div key={c.label} className={`flex items-center gap-3 rounded-2xl ${c.bg} p-4 shadow-sm`}>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${c.iconBg}`}>
                    <c.icon size={22} className={c.text} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-lg font-extrabold text-tbs-dark">{c.value}</div>
                    <div className="truncate text-xs font-semibold text-gray-500">{c.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-tbs-dark mb-2 flex items-center gap-1.5">
                <IconTrophy size={16} className="text-amber-500" /> Xếp Hạng Nhân Viên Bảo Trì
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100 whitespace-nowrap">
                      <th className="p-4">Nhân Viên</th>
                      <th className="p-4">Mã NV</th>
                      <th className="p-4">Số Việc Đã Nhận</th>
                      <th className="p-4">TB Thời Gian Nhận</th>
                      <th className="p-4">TB Thời Gian Hoàn Thành</th>
                      <th className="p-4">Đánh Giá TB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700 whitespace-nowrap">
                    {ranking.length === 0 && <tr><td className="p-4 text-gray-400" colSpan={6}>Chưa có dữ liệu</td></tr>}
                    {ranking.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-4 font-semibold text-tbs-dark">{r.name}</td>
                        <td className="p-4 font-mono text-gray-400">{r.code}</td>
                        <td className="p-4 font-bold text-accent">{r.totalHandled}</td>
                        <td className="p-4">{r.avgAccept != null ? formatMinutes(r.avgAccept) : '-'}</td>
                        <td className="p-4">{r.avgComplete != null ? formatMinutes(r.avgComplete) : '-'}</td>
                        <td className="p-4">{r.avgRating != null ? `${r.avgRating.toFixed(1)} ★` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </MaintenanceShell>
  );
}
