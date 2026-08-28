'use client';

import { useMemo, useState } from 'react';
import { IconFlask, IconCircleFilled } from '@tabler/icons-react';
import { generateProductionMockData, type ProductionFactory, type ProductionLine, type EntryStatus } from '@/lib/productionMockData';

const ENTRY_LABEL: Record<EntryStatus, { label: string; cls: string }> = {
  ontime: { label: 'Đúng giờ', cls: 'bg-emerald-50 text-emerald-700' },
  late: { label: 'Nhập trễ', cls: 'bg-amber-50 text-amber-700' },
  missing: { label: 'Chưa nhập', cls: 'bg-rose-50 text-rose-700' },
};

const STATUS_BAR_CLS: Record<string, string> = {
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

// Hiệu Suất Nhà Máy — PPH/RFT/sản lượng theo giờ theo Nhà máy > Chuyền. CHƯA có hệ thống backend
// thật cho mảng dữ liệu sản xuất này (khác MMTB) nên toàn bộ là dữ liệu MẪU sinh phía FE, có nút
// ẩn/hiện — khi có hệ thống QC-chuyền thật, chỉ cần thay generateProductionMockData() bằng gọi API.
export default function ProductionPerformanceModule() {
  const [testDataOn, setTestDataOn] = useState(true);
  const factories = useMemo<ProductionFactory[]>(() => generateProductionMockData(), []);
  const [factoryId, setFactoryId] = useState(factories[0]?.id ?? '');
  const [lineNumber, setLineNumber] = useState<number | null>(null);

  const factory = factories.find((f) => f.id === factoryId) ?? null;
  const line: ProductionLine | null = factory && lineNumber != null ? factory.lines.find((l) => l.lineNumber === lineNumber) ?? null : null;

  function handleSelectFactory(id: string) {
    setFactoryId(id);
    setLineNumber(null);
  }

  const linesMeetingTargetNow = useMemo(() => {
    if (!factory) return { met: 0, total: 0 };
    let met = 0;
    for (const l of factory.lines) {
      const doneHours = l.hours.filter((h) => h.actual != null);
      const last = doneHours[doneHours.length - 1];
      if (last && last.status === 'ok') met++;
    }
    return { met, total: factory.lines.length };
  }, [factory]);

  if (!testDataOn) {
    return (
      <div className="space-y-4 my-auto">
        <Header testDataOn={testDataOn} onToggle={() => setTestDataOn(true)} />
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-sm text-slate-400">
          Chưa có dữ liệu sản xuất thật — bật &quot;Dữ liệu mẫu&quot; ở trên để xem giao diện minh hoạ.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-auto">
      <Header testDataOn={testDataOn} onToggle={() => setTestDataOn(false)} />

      {/* 4 Ô Nhà Máy */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {factories.map((f) => (
          <button
            key={f.id}
            onClick={() => handleSelectFactory(f.id)}
            className={`text-left p-4 rounded-2xl border transition-all ${
              factoryId === f.id ? 'bg-[#e6f4ed] border-[#006838] shadow-sm' : 'bg-[#f7f8f6] border-transparent hover:border-slate-200'
            }`}
          >
            <div className="font-black text-slate-900">{f.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{f.lineCount} chuyền · {f.efficiencyPct}%</div>
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-500">
        Đang xem: <span className="font-bold text-slate-700">{factory?.name}</span> ·{' '}
        {line ? <span className="font-bold text-[#006838]">Chuyền {line.lineNumber}</span> : 'Tất cả chuyền'}
      </div>

      {/* Chọn chuyền */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="text-xs font-bold text-slate-400 mb-2.5">{line ? 'Chọn chuyền khác' : 'Chọn chuyền để xem chi tiết'}</div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
          {factory?.lines.map((l) => (
            <button
              key={l.lineNumber}
              onClick={() => setLineNumber(l.lineNumber)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                lineNumber === l.lineNumber ? 'bg-[#006838] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Chuyền {l.lineNumber}
            </button>
          ))}
        </div>
      </div>

      {!line && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-sm text-slate-400">
          👉 Chọn 1 chuyền ở trên để xem chi tiết sản lượng theo giờ
        </div>
      )}

      {line && factory && (
        <>
          {/* 4 chỉ số nhanh */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'PPH trung bình', value: `${line.pph}`, unit: 'đôi/giờ', cls: 'bg-white' },
              { label: 'RFT (đạt ngay lần 1)', value: `${line.rftPct}%`, unit: '', cls: 'bg-[#f7f8f6]' },
              { label: 'Hiệu suất chuyền', value: `${line.efficiencyPct}%`, unit: '', cls: 'bg-white' },
              { label: 'Đạt chỉ tiêu giờ này', value: `${linesMeetingTargetNow.met}/${linesMeetingTargetNow.total}`, unit: 'chuyền', cls: 'bg-[#f7f8f6]' },
            ].map((c) => (
              <div key={c.label} className={`p-4 rounded-2xl border border-slate-200/80 shadow-sm ${c.cls}`}>
                <div className="text-xs font-bold text-slate-500">{c.label}</div>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {c.value} {c.unit && <span className="text-xs font-bold text-slate-400">{c.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Biểu đồ sản lượng theo giờ */}
            <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Sản lượng theo giờ — Chuyền {line.lineNumber}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mã giày {line.shoeCode} · Chỉ tiêu {line.targetPerHour} đôi/giờ</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                  {STATUS_DOT_LABEL.map((s) => (
                    <span key={s.key} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${s.cls}`} /> {s.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-2 sm:gap-3 h-40">
                {line.hours.map((h) => {
                  const heightPct = h.actual != null ? Math.max(8, Math.min(100, (h.actual / line.targetPerHour) * 80)) : 4;
                  return (
                    <div key={h.time} className="flex-1 flex flex-col items-center justify-end h-full">
                      {h.actual != null && <span className="text-[10px] font-bold text-slate-500 mb-1">{h.actual}</span>}
                      <div
                        className={`w-full rounded-t-lg ${STATUS_BAR_CLS[h.status]}`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[10px] text-slate-400 mt-1.5">{h.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thông tin ca */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-3">Thông tin ca — Chuyền {line.lineNumber}</h3>
              <dl className="space-y-2.5 text-xs">
                {[
                  ['Mã giày', line.shoeCode],
                  ['Số lao động', `${line.workerCount} người`],
                  ['Chỉ tiêu / giờ', `${line.targetPerHour} đôi`],
                  ['Thời gian làm việc', `${line.workStart} – ${line.workEnd}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-bold text-slate-800">{v}</dd>
                  </div>
                ))}
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Lũy kế thực tế</dt>
                  <dd className="font-bold text-slate-800">{line.cumulativeActual} đôi</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Lũy kế chỉ tiêu</dt>
                  <dd className="font-bold text-slate-800">{line.cumulativeTarget} đôi</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Chênh lệch</dt>
                  <dd className={`font-bold ${line.cumulativeActual - line.cumulativeTarget < 0 ? 'text-rose-600' : 'text-[#006838]'}`}>
                    {line.cumulativeActual - line.cumulativeTarget > 0 ? '+' : ''}
                    {line.cumulativeActual - line.cumulativeTarget} đôi
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Trạng thái từng chuyền */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
            <div className="px-4 sm:px-5 pt-4 pb-2">
              <h3 className="text-sm font-black text-slate-900">Trạng thái từng chuyền — hôm nay</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100 whitespace-nowrap">
                  <th className="px-4 sm:px-5 py-2">Chuyền</th>
                  <th className="px-4 py-2">Mã giày</th>
                  <th className="px-4 py-2">PPH</th>
                  <th className="px-4 py-2">Hiệu suất</th>
                  <th className="px-4 py-2">Trạng thái nhập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700 whitespace-nowrap">
                {factory.lines.map((l) => (
                  <tr key={l.lineNumber} onClick={() => setLineNumber(l.lineNumber)} className={`cursor-pointer hover:bg-slate-50/80 ${l.lineNumber === line.lineNumber ? 'bg-[#f7fbf9]' : ''}`}>
                    <td className="px-4 sm:px-5 py-2.5 font-bold text-slate-800">Chuyền {l.lineNumber}</td>
                    <td className="px-4 py-2.5 font-mono">{l.shoeCode}</td>
                    <td className="px-4 py-2.5">{l.pph}</td>
                    <td className="px-4 py-2.5 font-bold">{l.efficiencyPct}%</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ENTRY_LABEL[l.entryStatus].cls}`}>{ENTRY_LABEL[l.entryStatus].label}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Header({ testDataOn, onToggle }: { testDataOn: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 className="text-lg font-black text-slate-900">🏭 Hiệu Suất Nhà Máy</h2>
        <p className="text-xs text-slate-500 mt-0.5">Theo dõi sản lượng theo giờ so với chỉ tiêu — cập nhật mỗi 60 phút từ QC chuyền.</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <IconCircleFilled size={8} className="text-[#006838]" /> Đang trực tuyến
        </span>
        <button
          type="button"
          onClick={onToggle}
          title={testDataOn ? 'Đang hiện dữ liệu mẫu — bấm để tắt' : 'Đang tắt dữ liệu mẫu — bấm để bật lại'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
            testDataOn ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}
        >
          <IconFlask size={12} /> Dữ liệu mẫu: {testDataOn ? 'Bật' : 'Tắt'}
        </button>
      </div>
    </div>
  );
}
