'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconAlertTriangle, IconClockHour4, IconCircleCheck, IconTool } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';
import DateRangeFilter, { inDateRange } from '@/components/DateRangeFilter';

type CategoryOption = { id: string; name: string };

type Ticket = {
  id: string;
  ticketCode: string;
  machineCode: string;
  machineName: string;
  zone: string | null;
  factoryName: string | null;
  reporter: string;
  mechanic: string | null;
  errorType: string;
  status: 'PENDING' | 'ACCEPTED' | 'DONE';
  statusLabel: string;
  reportedAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
};

const STATUS_BADGE: Record<Ticket['status'], string> = {
  PENDING: 'bg-rose-500/15 text-rose-700',
  ACCEPTED: 'bg-amber-500/15 text-amber-700',
  DONE: 'bg-emerald-500/15 text-emerald-700',
};

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

export default function MaintenanceTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [factories, setFactories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFactoryId, setFilterFactoryId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [ticketsRes, facRes] = await Promise.all([
          fetch('/api/mmtb-kg/tickets').then((r) => r.json()),
          fetch('/api/mmtb-kg/categories?type=FACTORY').then((r) => r.json()),
        ]);
        if (ticketsRes.success && Array.isArray(ticketsRes.data)) {
          setTickets(ticketsRes.data);
        } else {
          setTickets([]);
          setError(ticketsRes.error || 'Không lấy được dữ liệu');
        }
        if (facRes.success) setFactories(facRes.data || []);
      } catch (err) {
        console.warn('Failed to fetch tickets from tbsMayMoc:', err);
        setTickets([]);
        setError('Không kết nối được tới hệ thống MMTB');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesQ =
        !q || t.ticketCode.toLowerCase().includes(q) || t.machineCode.toLowerCase().includes(q) || t.machineName.toLowerCase().includes(q);
      const matchesStatus = !filterStatus || t.status === filterStatus;
      const matchesFactory = !filterFactoryId || t.factoryName === filterFactoryId;
      const matchesDate = inDateRange(t.reportedAt, dateFrom, dateTo);
      return matchesQ && matchesStatus && matchesFactory && matchesDate;
    });
  }, [tickets, search, filterStatus, filterFactoryId, dateFrom, dateTo]);

  const stats = useMemo(() => {
    let pending = 0, accepted = 0, done = 0;
    for (const t of filtered) {
      if (t.status === 'PENDING') pending++;
      else if (t.status === 'ACCEPTED') accepted++;
      else done++;
    }
    return { total: filtered.length, pending, accepted, done };
  }, [filtered]);

  return (
    <MaintenanceShell title="Nhu Cầu Sửa Chữa" subtitle="Danh sách sự cố / ticket bảo trì — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">Nhu Cầu Sửa Chữa</h1>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tổng số sự cố', value: stats.total, icon: IconTool, bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
            { label: 'Chưa ai nhận', value: stats.pending, icon: IconAlertTriangle, bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600' },
            { label: 'Đang xử lý', value: stats.accepted, icon: IconClockHour4, bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
            { label: 'Đã hoàn thành', value: stats.done, icon: IconCircleCheck, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã ticket, mã máy, tên máy..."
            className="min-w-[220px] flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
          />
          <FilterSelect value={filterFactoryId} onChange={setFilterFactoryId} options={factories.map((f) => ({ id: f.name, name: f.name }))} placeholder="Tất cả nhà máy" />
          <FilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { id: 'PENDING', name: 'Chưa ai nhận' },
              { id: 'ACCEPTED', name: 'Đang xử lý' },
              { id: 'DONE', name: 'Đã hoàn thành' },
            ]}
            placeholder="Tất cả trạng thái"
          />
          <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100 whitespace-nowrap">
                <th className="p-4">Mã Ticket</th>
                <th className="p-4">Thiết Bị</th>
                <th className="p-4">Khu Vực / Nhà Máy</th>
                <th className="p-4">Người Báo</th>
                <th className="p-4">Bảo Trì Phụ Trách</th>
                <th className="p-4">Loại Lỗi</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Thời Gian Báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 whitespace-nowrap">
              {loading && (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={8}>Đang tải...</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && !error && (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={8}>
                    {tickets.length === 0 ? 'Chưa có sự cố nào trong phạm vi Tổ hợp KG' : 'Không tìm thấy sự cố phù hợp'}
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-4 font-mono font-bold text-accent">{t.ticketCode}</td>
                  <td className="p-4">
                    <div className="font-bold text-tbs-dark">{t.machineName}</div>
                    <div className="font-mono text-[10px] text-gray-400">{t.machineCode}</div>
                  </td>
                  <td className="p-4">{t.factoryName ? `${t.factoryName} > ${t.zone ?? '—'}` : (t.zone ?? '—')}</td>
                  <td className="p-4">{t.reporter}</td>
                  <td className="p-4 font-semibold text-tbs-dark">{t.mechanic ?? '—'}</td>
                  <td className="p-4 text-red-600 font-medium">{t.errorType}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 font-bold rounded ${STATUS_BADGE[t.status]}`}>
                      {t.statusLabel}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-gray-500">{formatDateTime(t.reportedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MaintenanceShell>
  );
}
