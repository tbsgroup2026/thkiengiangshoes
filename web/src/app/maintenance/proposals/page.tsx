'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconPackage, IconSchool, IconPlayerPause, IconCircleCheck } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [filterFactoryId, setFilterFactoryId] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/mmtb-kg/proposals');
      const result = await res.json();
      if (result.success) setProposals(result.data || []);
      else setError(result.error || 'Không lấy được dữ liệu');
    } catch {
      setError('Không kết nối được tới hệ thống MMTB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const factoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    proposals.forEach((p) => {
      const f = p.incident.machine.area?.parent;
      if (f) map.set(f.id, f.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [proposals]);

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'PENDING' ? !p.resolved : p.resolved);
      const matchesFactory = !filterFactoryId || p.incident.machine.area?.parent?.id === filterFactoryId;
      return matchesStatus && matchesFactory;
    });
  }, [proposals, filterStatus, filterFactoryId]);

  async function toggleResolved(p: Proposal) {
    setUpdatingId(p.id);
    try {
      const res = await fetch(`/api/maintenance/proposals/${p.id}`, {
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
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">Đề Xuất Cải Tiến</h1>
          <p className="text-xs text-gray-500 mt-1">Dữ liệu thật, đồng bộ trực tiếp từ hệ thống MMTB (tbsMayMoc) — {filtered.length} đề xuất</p>
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>}

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
          <FilterSelect value={filterFactoryId} onChange={setFilterFactoryId} options={factoryOptions} placeholder="Tất cả nhà máy" />
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
