'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  IconBuildingFactory2,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconUsers,
  IconShoe,
  IconTarget,
  IconChartBar,
} from '@tabler/icons-react';

type ScanInfo = {
  success: boolean;
  error?: string;
  team?: { id: string; name: string; lineName: string; areaName: string; factoryName: string };
  date?: string;
  slots?: string[];
  filledSlots?: string[];
  setup?: { workerCount: number; model: string; plannedQty: number } | null;
  nextAction?: 'setup' | 'quantity' | 'wait' | 'done';
  targetSlot?: string | null;
  nextSlot?: string;
};

// Trang quét QR CÔNG KHAI, mở qua camera Zalo — không cần đăng nhập. teamId truyền qua query
// param (?team=...), KHÔNG dùng route segment động vì site build tĩnh (output:'export') không
// biết trước danh sách Tổ lúc build — xem next.config.ts.
export default function PphScanClient() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get('team') || '';

  const [info, setInfo] = useState<ScanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittedBy, setSubmittedBy] = useState('');
  const [workerCount, setWorkerCount] = useState('');
  const [model, setModel] = useState('');
  const [plannedQty, setPlannedQty] = useState('');
  const [actualQty, setActualQty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slot: string } | null>(null);

  const load = async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/pph/scan-info?teamId=${encodeURIComponent(teamId)}`).then((r) => r.json());
      setInfo(res);
    } catch (err) {
      console.warn('Failed to fetch scan-info:', err);
      setInfo({ success: false, error: 'Không kết nối được tới hệ thống' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submittedBy.trim()) {
      setFormError('Vui lòng nhập tên người báo cáo');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const isSetup = info?.nextAction === 'setup';
      const body: Record<string, unknown> = { teamId, submittedBy: submittedBy.trim() };
      if (isSetup) {
        const wc = Number(workerCount);
        const pq = Number(plannedQty);
        if (!Number.isFinite(wc) || wc <= 0) { setFormError('Vui lòng nhập đúng Số lượng công nhân'); setSubmitting(false); return; }
        if (!model.trim()) { setFormError('Vui lòng nhập Model sản xuất'); setSubmitting(false); return; }
        if (!Number.isFinite(pq) || pq <= 0) { setFormError('Vui lòng nhập đúng Số lượng kế hoạch'); setSubmitting(false); return; }
        body.workerCount = wc;
        body.model = model.trim();
        body.plannedQty = pq;
      } else {
        const aq = Number(actualQty);
        if (!Number.isFinite(aq) || aq < 0) { setFormError('Vui lòng nhập đúng Số lượng'); setSubmitting(false); return; }
        body.actualQty = aq;
      }
      const res = await fetch('/api/pph/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!result.success) {
        setFormError(result.error || 'Không lưu được, vui lòng thử lại');
        return;
      }
      setSuccess({ slot: result.slot });
    } catch {
      setFormError('Không kết nối được tới hệ thống, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  }

  if (!teamId) {
    return (
      <ScanShell>
        <StateCard icon={IconAlertTriangle} tone="rose" title="Thiếu mã Tổ" desc="Đường dẫn QR không hợp lệ — vui lòng quét lại mã đã dán tại Tổ." />
      </ScanShell>
    );
  }

  if (loading) {
    return (
      <ScanShell>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#006838] border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Đang tải...</p>
        </div>
      </ScanShell>
    );
  }

  if (!info?.success || !info.team) {
    return (
      <ScanShell>
        <StateCard icon={IconAlertTriangle} tone="rose" title="Không tìm thấy Tổ" desc={info?.error || 'Mã QR có thể đã cũ — liên hệ quản lý để lấy mã mới.'} />
      </ScanShell>
    );
  }

  if (success) {
    return (
      <ScanShell team={info.team}>
        <StateCard
          icon={IconCircleCheck}
          tone="emerald"
          title="Đã ghi nhận!"
          desc={`Cập nhật khung giờ ${success.slot} thành công. Cảm ơn bạn!`}
        />
      </ScanShell>
    );
  }

  if (info.nextAction === 'wait') {
    return (
      <ScanShell team={info.team}>
        <StateCard icon={IconClock} tone="amber" title="Chưa tới giờ nhập" desc={`Khung tiếp theo lúc ${info.nextSlot}. Quay lại quét sau nhé.`} />
      </ScanShell>
    );
  }

  if (info.nextAction === 'done') {
    return (
      <ScanShell team={info.team}>
        <StateCard icon={IconCircleCheck} tone="emerald" title="Đã cập nhật đủ hôm nay" desc="Cảm ơn bạn đã báo cáo đầy đủ các khung giờ hôm nay!" />
      </ScanShell>
    );
  }

  const isSetup = info.nextAction === 'setup';

  return (
    <ScanShell team={info.team}>
      <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
        <IconClock size={14} />
        {isSetup ? 'Cập nhật đầu ca' : `Khung giờ ${info.targetSlot}`}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {isSetup ? (
          <>
            <Field label="Số lượng công nhân hôm nay *" icon={IconUsers}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={workerCount}
                onChange={(e) => setWorkerCount(e.target.value)}
                placeholder="VD: 42"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
                required
              />
            </Field>
            <Field label="Model sản xuất *" icon={IconShoe}>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="VD: SK-GoRun-2026"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
                required
              />
            </Field>
            <Field label="Số lượng kế hoạch hôm nay *" icon={IconTarget}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={plannedQty}
                onChange={(e) => setPlannedQty(e.target.value)}
                placeholder="VD: 411"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
                required
              />
            </Field>
          </>
        ) : (
          <Field label={`Số lượng làm được (${info.targetSlot}) *`} icon={IconChartBar}>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={actualQty}
              onChange={(e) => setActualQty(e.target.value)}
              placeholder="VD: 45"
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
              required
              autoFocus
            />
          </Field>
        )}

        <Field label="Tên người báo cáo *" icon={IconUsers}>
          <input
            type="text"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            placeholder="Nhập họ tên của bạn"
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006838]"
            required
          />
        </Field>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">⚠️ {formError}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-[#006838] text-white text-sm font-black hover:opacity-90 disabled:opacity-50 transition"
        >
          {submitting ? 'Đang lưu...' : 'Xác Nhận Cập Nhật'}
        </button>
      </form>
    </ScanShell>
  );
}

function ScanShell({
  team,
  children,
}: {
  team?: { name: string; lineName: string; areaName: string; factoryName: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f7f5] flex items-start justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-4 justify-center">
          <img src="/images/tbs-logo.png" alt="TBS Group" className="h-7 w-auto object-contain" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Hiệu Suất Nhà Máy</span>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/70 p-5 sm:p-6">
          {team && (
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <IconBuildingFactory2 size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-black text-slate-900 text-sm truncate">{team.name}</div>
                <div className="text-[11px] text-slate-400 font-semibold truncate">
                  {[team.factoryName, team.areaName, team.lineName].filter(Boolean).join(' › ')}
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof IconUsers; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
        <Icon size={13} className="text-slate-400" />
        {label}
      </span>
      {children}
    </label>
  );
}

const TONE_CLS: Record<string, { bg: string; text: string; iconBg: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', iconBg: 'bg-rose-100' },
};

function StateCard({
  icon: Icon,
  tone,
  title,
  desc,
}: {
  icon: typeof IconCircleCheck;
  tone: 'emerald' | 'amber' | 'rose';
  title: string;
  desc: string;
}) {
  const t = TONE_CLS[tone];
  return (
    <div className="text-center py-6 space-y-3">
      <div className={`w-14 h-14 mx-auto rounded-2xl ${t.iconBg} ${t.text} flex items-center justify-center`}>
        <Icon size={26} />
      </div>
      <h3 className="font-black text-slate-900 text-base">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed px-2">{desc}</p>
    </div>
  );
}
