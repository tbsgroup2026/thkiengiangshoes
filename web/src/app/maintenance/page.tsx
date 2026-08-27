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
} from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';

type Machine = { id: string; statusName: string };
type Incident = { id: string; status: 'PENDING' | 'ACCEPTED' | 'DONE' };
type ScheduleMachine = { id: string; status: 'unscheduled' | 'overdue' | 'upcoming' | 'scheduled' };
type Proposal = { id: string; resolved: boolean };

function normalizeStatus(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').trim().toLowerCase();
}

// Tổng Quan — gộp số liệu từ các trang khác lại 1 nơi (không gọi API riêng, tái dùng đúng những gì
// Danh Sách MMTB / Bảo Dưỡng MMTB / Nhu Cầu Sửa Chữa / Đề Xuất đã có) để 4 nơi không lệch số liệu.
export default function OverviewPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [scheduleMachines, setScheduleMachines] = useState<ScheduleMachine[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [machinesRes, incidentsRes, scheduleRes, proposalsRes] = await Promise.all([
          fetch('/api/maintenance/machines').then((r) => r.json()),
          fetch('/api/maintenance/tickets').then((r) => r.json()).catch(() => null),
          fetch('/api/maintenance/schedule').then((r) => r.json()),
          fetch('/api/maintenance/proposals').then((r) => r.json()),
        ]);
        if (machinesRes.success) setMachines(machinesRes.data || []);
        if (incidentsRes?.success) setIncidents(incidentsRes.data || []);
        if (scheduleRes.success) setScheduleMachines(scheduleRes.machines || []);
        if (proposalsRes.success) setProposals(proposalsRes.data || []);
      } catch {
        setError('Không kết nối được tới hệ thống MMTB');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    machines.forEach((m) => map.set(m.statusName, (map.get(m.statusName) ?? 0) + 1));
    return Array.from(map, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [machines]);

  const pendingIncidents = incidents.filter((i) => i.status === 'PENDING').length;
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
    <MaintenanceShell title="Tổng Quan" subtitle="Tổng hợp số liệu MMTB — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">Tổng Quan</h1>
          <p className="text-xs text-gray-500 mt-1">Dữ liệu thật, đồng bộ trực tiếp từ hệ thống MMTB (tbsMayMoc)</p>
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>}

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Đang tải...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Tổng số máy', value: machines.length, icon: IconDeviceLaptop, bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
                { label: 'Sự cố chưa xử lý', value: pendingIncidents, icon: IconAlertTriangle, bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600' },
                { label: 'Máy quá hạn bảo trì', value: overdueMaintenance, icon: IconClockHour4, bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
                { label: 'Đề xuất chưa xử lý', value: pendingProposals, icon: IconBulb, bg: 'bg-violet-50', iconBg: 'bg-violet-100', text: 'text-violet-600' },
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
              </div>
            </div>
          </>
        )}
      </div>
    </MaintenanceShell>
  );
}
