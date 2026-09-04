'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  IconArrowLeft,
  IconBuildingFactory2,
  IconChevronDown,
  IconChevronRight,
  IconQrcode,
  IconDownload,
  IconUsersGroup,
  IconRefresh,
} from '@tabler/icons-react';

type PphTeam = { id: string; name: string };
type PphLine = { id: string; name: string; teams: PphTeam[] };
type PphArea = { id: string; name: string; lines: PphLine[] };
type PphFactory = { id: string; name: string; areas: PphArea[] };

// Cài Đặt Hiệu Suất Nhà Máy — duyệt cây Nhà máy > Xưởng > Chuyền > Tổ (dùng CHUNG danh mục MMTB,
// chỉ đọc tên/id qua /api/pph/tree — không có nút thêm/sửa/xoá ở đây, việc đó làm bên trang Danh
// Mục của MMTB) và sinh mã QR CỐ ĐỊNH cho từng Tổ để dán tại chuyền, quét bằng camera Zalo.
export default function PphSettingsView({ onClose }: { onClose: () => void }) {
  const [factories, setFactories] = useState<PphFactory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAreas, setOpenAreas] = useState<Set<string>>(new Set());
  const [openLines, setOpenLines] = useState<Set<string>>(new Set());
  const [openFactories, setOpenFactories] = useState<Set<string>>(new Set());
  const [qrTeam, setQrTeam] = useState<{ id: string; name: string; path: string } | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/pph/tree').then((r) => r.json());
      if (res.success) setFactories(res.data || []);
      else {
        console.warn('Failed to load PPH tree:', res.error);
        setError(res.error || 'Không lấy được cây tổ chức');
      }
    } catch (err) {
      console.warn('Failed to fetch PPH tree:', err);
      setError('Không kết nối được tới hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!qrTeam) {
      setQrImageUrl(null);
      return;
    }
    const url = `${window.location.origin}/pph-scan?team=${encodeURIComponent(qrTeam.id)}`;
    QRCode.toDataURL(url, { width: 480, margin: 2 })
      .then(setQrImageUrl)
      .catch(() => setQrImageUrl(null));
  }, [qrTeam]);

  function toggle(set: Set<string>, setSet: (s: Set<string>) => void, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSet(next);
  }

  return (
    <div className="space-y-4 my-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center flex-shrink-0"
            title="Về Hiệu Suất Nhà Máy"
          >
            <IconArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900">⚙️ Cài Đặt — Hiệu Suất Nhà Máy</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhà máy › Xưởng › Chuyền › Tổ — mỗi Tổ có 1 mã QR cố định để dán tại chuyền, quét bằng camera Zalo.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <IconRefresh size={14} /> Làm mới
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
          ⚠️ {error} — kiểm tra Console (F12) để biết chi tiết.
        </div>
      )}

      {loading && <div className="p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-sm text-slate-400">Đang tải...</div>}

      {!loading && !error && factories.length === 0 && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-sm text-slate-400">
          Chưa có Nhà máy/Xưởng/Chuyền/Tổ nào bên MMTB.
        </div>
      )}

      <div className="space-y-3">
        {factories.map((f) => {
          const fOpen = openFactories.has(f.id);
          const teamCount = f.areas.reduce((s, a) => s + a.lines.reduce((s2, l) => s2 + l.teams.length, 0), 0);
          return (
            <div key={f.id} className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(openFactories, setOpenFactories, f.id)}
                className="w-full flex items-center gap-2.5 px-4 py-3.5 hover:bg-slate-50/80"
              >
                {fOpen ? <IconChevronDown size={16} className="text-slate-400" /> : <IconChevronRight size={16} className="text-slate-400" />}
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <IconBuildingFactory2 size={16} />
                </div>
                <span className="font-black text-slate-900 text-sm">{f.name}</span>
                <span className="text-[11px] text-slate-400 font-semibold">{f.areas.length} xưởng · {teamCount} tổ</span>
              </button>
              {fOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {f.areas.length === 0 && <div className="px-4 py-3 text-xs text-slate-400">Chưa có Xưởng nào.</div>}
                  {f.areas.map((a) => {
                    const aOpen = openAreas.has(a.id);
                    return (
                      <div key={a.id} className="pl-4">
                        <button
                          type="button"
                          onClick={() => toggle(openAreas, setOpenAreas, a.id)}
                          className="w-full flex items-center gap-2.5 px-2 py-2.5 hover:bg-slate-50/80"
                        >
                          {aOpen ? <IconChevronDown size={14} className="text-slate-400" /> : <IconChevronRight size={14} className="text-slate-400" />}
                          <span className="font-bold text-slate-800 text-xs">{a.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{a.lines.length} chuyền</span>
                        </button>
                        {aOpen && (
                          <div className="pl-5 pb-1">
                            {a.lines.length === 0 && <div className="px-2 py-2 text-[11px] text-slate-400">Chưa có Chuyền nào.</div>}
                            {a.lines.map((l) => {
                              const lOpen = openLines.has(l.id);
                              return (
                                <div key={l.id}>
                                  <button
                                    type="button"
                                    onClick={() => toggle(openLines, setOpenLines, l.id)}
                                    className="w-full flex items-center gap-2 px-2 py-2 hover:bg-slate-50/80"
                                  >
                                    {lOpen ? <IconChevronDown size={12} className="text-slate-400" /> : <IconChevronRight size={12} className="text-slate-400" />}
                                    <span className="font-semibold text-slate-700 text-[11px]">{l.name}</span>
                                    <span className="text-[10px] text-slate-400">{l.teams.length} tổ</span>
                                  </button>
                                  {lOpen && (
                                    <div className="pl-5 pb-1.5 flex flex-wrap gap-1.5">
                                      {l.teams.length === 0 && <span className="text-[11px] text-slate-400 px-1">Chưa có Tổ nào.</span>}
                                      {l.teams.map((t) => (
                                        <button
                                          key={t.id}
                                          type="button"
                                          onClick={() => setQrTeam({ id: t.id, name: t.name, path: `${f.name} › ${a.name} › ${l.name}` })}
                                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100"
                                        >
                                          <IconUsersGroup size={12} />
                                          {t.name}
                                          <IconQrcode size={12} className="text-emerald-500" />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal mã QR */}
      {qrTeam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setQrTeam(null)}>
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">{qrTeam.path}</div>
              <h3 className="font-black text-lg text-slate-900">Tổ {qrTeam.name}</h3>
            </div>
            <div className="flex items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {qrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrImageUrl} alt={`QR Tổ ${qrTeam.name}`} className="w-56 h-56" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">Đang tạo mã...</div>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Dán mã này tại vị trí Tổ — quét bằng camera Zalo để mở form cập nhật sản lượng.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQrTeam(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
              >
                Đóng
              </button>
              {qrImageUrl && (
                <a
                  href={qrImageUrl}
                  download={`QR-To-${qrTeam.name.replace(/\s+/g, '-')}.png`}
                  className="flex-1 py-2.5 rounded-xl bg-[#006838] text-white text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <IconDownload size={14} /> Tải ảnh
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
