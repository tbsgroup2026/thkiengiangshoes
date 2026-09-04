'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconPackage, IconSchool, IconPlayerPause, IconCircleCheck, IconClipboardList, IconClock } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';
import DateRangeFilter, { inDateRange } from '@/components/DateRangeFilter';
import RefreshButton from '@/components/RefreshButton';

type CategoryOption = { id: string; name: string };

type Proposal = {
  id: string;
  type: 'PARTS_REQUEST' | 'RETRAIN_OPERATOR' | 'HOLD';
  parts: string | null;
  reason: string;
  resolved: boolean;
  resolvedAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  submittedBy: { id: string; name: string; employeeCode: string };
  operator: { id: string; name: string; employeeCode: string } | null;
  confirmedBy: { id: string; name: string; employeeCode: string } | null;
  incident: {
    id: string;
    description: string;
    machine: { id: string; name: string; code: string; area: { id: string; name: string; parent: { id: string; name: string } | null } | null };
  };
};

type PartItem = { partId: string | null; partName: string; quantity: number };

const TYPE_META: Record<Proposal['type'], { label: string; icon: typeof IconPackage; bg: string; text: string }> = {
  PARTS_REQUEST: { label: 'Cần bổ sung vật tư', icon: IconPackage, bg: 'bg-amber-50', text: 'text-amber-700' },
  RETRAIN_OPERATOR: { label: 'Đào tạo lại công nhân', icon: IconSchool, bg: 'bg-violet-50', text: 'text-violet-700' },
  HOLD: { label: 'Đang chờ xử lý sau', icon: IconPlayerPause, bg: 'bg-slate-100', text: 'text-slate-600' },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [factories, setFactories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [filterFactoryId, setFilterFactoryId] = useState('');
  const [filterAreaId, setFilterAreaId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const load = async (force = false) => {
    try {
      force ? setRefreshing(true) : setLoading(true);
      setError(null);
      const fresh = force ? '?fresh=1' : '';
      const settled = await Promise.allSettled([
        fetch(`/api/mmtb-kg/proposals${fresh}`).then((r) => r.json()),
        fetch(`/api/mmtb-kg/categories?type=FACTORY${force ? '&fresh=1' : ''}`).then((r) => r.json()),
      ]);
      const [propRes, facRes] = settled.map((s) => (s.status === 'fulfilled' ? s.value : { success: false, error: String(s.reason) }));
      if (propRes.success) setProposals(propRes.data || []);
      else { console.warn('Failed to load proposals from tbsMayMoc:', propRes.error); setError(propRes.error || 'Không lấy được dữ liệu'); }
      if (facRes.success) setFactories(facRes.data || []);
    } catch (err) {
      console.warn('Failed to fetch proposals from tbsMayMoc:', err);
    } finally {
      force ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xưởng lọc theo Nhà máy đã chọn — dựng thẳng từ chính dữ liệu đề xuất (mỗi đề xuất đã có sẵn
  // incident.machine.area đầy đủ id/name/parent), không cần gọi thêm API riêng cho AREA.
  const areaOptions = useMemo(() => {
    const map = new Map<string, string>();
    proposals.forEach((p) => {
      const area = p.incident.machine.area;
      if (area && (!filterFactoryId || area.parent?.id === filterFactoryId)) map.set(area.id, area.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [proposals, filterFactoryId]);

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'PENDING' ? !p.resolved : p.resolved);
      const matchesFactory = !filterFactoryId || p.incident.machine.area?.parent?.id === filterFactoryId;
      const matchesArea = !filterAreaId || p.incident.machine.area?.id === filterAreaId;
      const matchesDate = inDateRange(p.createdAt, dateFrom, dateTo);
      return matchesStatus && matchesFactory && matchesArea && matchesDate;
    });
  }, [proposals, filterStatus, filterFactoryId, filterAreaId, dateFrom, dateTo]);

  const stats = useMemo(() => {
    let unresolved = 0, resolved = 0, parts = 0, retrain = 0, hold = 0;
    for (const p of proposals) {
      if (p.resolved) resolved++; else unresolved++;
      if (p.type === 'PARTS_REQUEST') parts++;
      else if (p.type === 'RETRAIN_OPERATOR') retrain++;
      else hold++;
    }
    return { total: proposals.length, unresolved, resolved, parts, retrain, hold };
  }, [proposals]);

  async function toggleResolved(p: Proposal) {
    setUpdatingId(p.id);
    try {
      const res = await fetch(`/api/mmtb-kg/proposals/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: !p.resolved }),
      });
      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Không cập nhật được');
        return;
      }
      await load();
    } catch {
      alert('Không kết nối được tới hệ thống MMTB');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <MaintenanceShell title="Đề Xuất Cải Tiến" subtitle="Vật tư / đào tạo lại / đang chờ xử lý — đã Trưởng team xác nhận — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold text-tbs-dark">Đề Xuất Cải Tiến</h1>
          <RefreshButton onClick={() => load(true)} loading={refreshing} />
        </div>

        {/* Lỗi kết nối tbsMayMoc chỉ log console (F12), không hiện banner ngoài trang */}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Tổng đề xuất', value: stats.total, icon: IconClipboardList, bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
            { label: 'Chưa xử lý', value: stats.unresolved, icon: IconClock, bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600' },
            { label: 'Đã xử lý', value: stats.resolved, icon: IconCircleCheck, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
            { label: 'Cần bổ sung vật tư', value: stats.parts, icon: IconPackage, bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
            { label: 'Đào tạo lại công nhân', value: stats.retrain, icon: IconSchool, bg: 'bg-violet-50', iconBg: 'bg-violet-100', text: 'text-violet-600' },
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
          {[
            { key: 'PENDING' as const, label: 'Chưa xử lý' },
            { key: 'RESOLVED' as const, label: 'Đã xử lý' },
            { key: 'ALL' as const, label: 'Tất cả' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                filterStatus === s.key ? 'bg-tbs-dark text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s.label}
            </button>
          ))}
          <FilterSelect
            value={filterFactoryId}
            onChange={(v) => { setFilterFactoryId(v); setFilterAreaId(''); }}
            options={factories.map((f) => ({ id: f.id, name: f.name }))}
            placeholder="Tất cả nhà máy"
          />
          <FilterSelect
            value={filterAreaId}
            onChange={setFilterAreaId}
            options={areaOptions}
            placeholder={filterFactoryId ? 'Tất cả khu vực' : 'Chọn nhà máy trước'}
            disabled={!filterFactoryId}
          />
          <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
        </div>

        {loading && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Đang tải...</div>}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Không có đề xuất nào</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((p) => {
            const meta = TYPE_META[p.type];
            const Icon = meta.icon;
            let parts: PartItem[] = [];
            if (p.type === 'PARTS_REQUEST' && p.parts) {
              try { parts = JSON.parse(p.parts); } catch { /* ignore */ }
            }
            return (
              <div key={p.id} className={`rounded-2xl border shadow-sm p-4 space-y-2.5 ${p.resolved ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${meta.bg} ${meta.text}`}>
                    <Icon size={13} /> {meta.label}
                  </span>
                  {p.resolved && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <IconCircleCheck size={13} /> Đã xử lý
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-tbs-dark">{p.incident.machine.name} <span className="font-mono text-accent">({p.incident.machine.code})</span></div>
                  <div className="text-[11px] text-gray-400">{p.incident.machine.area?.parent?.name ?? '-'} / {p.incident.machine.area?.name ?? '-'}</div>
                </div>
                <div className="text-xs text-gray-600">{p.reason}</div>
                {parts.length > 0 && (
                  <ul className="text-[11px] text-gray-500 list-disc list-inside space-y-0.5">
                    {parts.map((it, i) => (
                      <li key={i}>{it.partName} × {it.quantity}</li>
                    ))}
                  </ul>
                )}
                {p.operator && <div className="text-[11px] text-gray-500">Công nhân: {p.operator.name} ({p.operator.employeeCode})</div>}
                <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-3">
                  <span>Gửi bởi: {p.submittedBy.name}</span>
                  <span>{formatDateTime(p.createdAt)}</span>
                </div>
                <button
                  onClick={() => toggleResolved(p)}
                  disabled={updatingId === p.id}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 ${
                    p.resolved ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-accent text-white hover:bg-accent-light'
                  }`}
                >
                  {updatingId === p.id ? 'Đang lưu...' : p.resolved ? 'Bỏ Đánh Dấu' : 'Đánh Dấu Đã Xử Lý'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </MaintenanceShell>
  );
}
