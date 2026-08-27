'use client';

import { useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/maintenance/tickets');
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setTickets(result.data);
        } else {
          setTickets([]);
          setError(result.error || 'Không lấy được dữ liệu');
        }
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

  return (
    <div className="min-h-screen bg-tbs-light p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">Danh Sách Ticket Sự Cố Bảo Trì</h1>
          <p className="text-xs text-gray-500 mt-1">
            Dữ liệu thật, đồng bộ trực tiếp từ hệ thống Quản lý MMTB (tbsMayMoc) — Tổ hợp Kiên Giang
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100">
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
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {loading && (
              <tr>
                <td className="p-4 text-gray-400" colSpan={8}>Đang tải...</td>
              </tr>
            )}
            {!loading && tickets.length === 0 && !error && (
              <tr>
                <td className="p-4 text-gray-400" colSpan={8}>Chưa có sự cố nào trong phạm vi Tổ hợp KG</td>
              </tr>
            )}
            {tickets.map((t) => (
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
  );
}
