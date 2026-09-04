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
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

type PphTeam = { id: string; name: string };
type PphLine = { id: string; name: string; teams: PphTeam[] };
type PphArea = { id: string; name: string; lines: PphLine[] };
type PphFactory = { id: string; name: string; areas: PphArea[] };
type OrgType = 'FACTORY' | 'AREA' | 'LINE' | 'TEAM';

const TYPE_LABEL: Record<OrgType, string> = { FACTORY: 'Nhà máy', AREA: 'Xưởng', LINE: 'Chuyền', TEAM: 'Tổ' };

// Cài Đặt Hiệu Suất Nhà Máy — cây Nhà máy > Xưởng > Chuyền > Tổ RIÊNG cho module này, tự quản lý
// (thêm/xoá ngay ở đây) — KHÔNG dùng chung danh mục MMTB nữa (tbsMayMoc chưa có dữ liệu cấp Tổ
// thật). Mỗi Tổ có 1 mã QR cố định để dán tại chuyền, quét bằng camera Zalo.
export default function PphSettingsView({ onClose }: { onClose: () => void }) {
  const [factories, setFactories] = useState<PphFactory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAreas, setOpenAreas] = useState<Set<string>>(new Set());
  const [openLines, setOpenLines] = useState<Set<string>>(new Set());
  const [openFactories, setOpenFactories] = useState<Set<string>>(new Set());
  const [qrTeam, setQrTeam] = useState<{ id: string; name: string; path: string } | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  // addingFor: đang mở form thêm mục con cho node nào (null = không mở form nào)
  const [addingFor, setAddingFor] = useState<{ type: OrgType; parentId: string | null } | null>(null);
  const [addName, setAddName] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  function openAddForm(type: OrgType, parentId: string | null) {
    setAddingFor({ type, parentId });
    setAddName('');
    setAddError(null);
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addingFor) return;
    if (!addName.trim()) {
      setAddError('Vui lòng nhập tên');
      return;
    }
    setAddSubmitting(true);
    setAddError(null);
    try {
      const res = await fetch('/api/pph/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: addingFor.type, name: addName.trim(), parentId: addingFor.parentId }),
      });
      const result = await res.json();
      if (!result.success) {
        setAddError(result.error || 'Không thêm được');
        return;
      }
      setAddingFor(null);
      // Tự mở khung cha vừa thêm con vào để thấy ngay mục mới
      if (addingFor.parentId) {
        if (addingFor.type === 'AREA') setOpenFactories((s) => new Set(s).add(addingFor.parentId!));
        if (addingFor.type === 'LINE') setOpenAreas((s) => new Set(s).add(addingFor.parentId!));
        if (addingFor.type === 'TEAM') setOpenLines((s) => new Set(s).add(addingFor.parentId!));
      }
      await load();
    } catch {
      setAddError('Không kết nối được tới hệ thống');
    } finally {
      setAddSubmitting(false);
    }
  }

  async function handleDelete(id: string, type: OrgType, name: string) {
    if (!confirm(`Xoá ${TYPE_LABEL[type]} "${name}"? (chỉ xoá được nếu bên trong đang trống)`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/pph/org/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Không xoá được');
        return;
      }
      await load();
    } catch {
      alert('Không kết nối được tới hệ thống');
    } finally {
      setDeletingId(null);
    }
  }

  const AddInline = ({ type, parentId }: { type: OrgType; parentId: string | null }) => {
    const isOpen = addingFor?.type === type && addingFor?.parentId === parentId;
    if (!isOpen) {
      return (
        <button
          type="button"
          onClick={() => openAddForm(type, parentId)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-dashed border-slate-300 text-[11px] font-bold text-slate-500 hover:border-[#006838] hover:text-[#006838]"
        >
          <IconPlus size={12} /> Thêm {TYPE_LABEL[type]}
        </button>
      );
    }
    return (
      <form onSubmit={submitAdd} className="flex items-center gap-1.5 flex-wrap">
        <input
          autoFocus
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder={`Tên ${TYPE_LABEL[type]} mới`}
          className="px-2.5 py-1.5 bg-white border border-[#006838] rounded-lg text-[11px] font-semibold w-40 focus:outline-none"
        />
        <button type="submit" disabled={addSubmitting} className="w-7 h-7 rounded-lg bg-[#006838] text-white flex items-center justify-center disabled:opacity-50">
          <IconCheck size={13} />
        </button>
        <button type="button" onClick={() => setAddingFor(null)} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
          <IconX size={13} />
        </button>
        {addError && <span className="text-[10px] text-rose-600 font-semibold w-full">{addError}</span>}
      </form>
    );
  };

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

      {!loading && (
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <AddInline type="FACTORY" parentId={null} />
        </div>
      )}

      {!loading && !error && factories.length === 0 && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-sm text-slate-400">
          Chưa có Nhà máy nào — bấm &quot;Thêm Nhà máy&quot; ở trên để bắt đầu.
        </div>
      )}

      <div className="space-y-3">
        {factories.map((f) => {
          const fOpen = openFactories.has(f.id);
          const teamCount = f.areas.reduce((s, a) => s + a.lines.reduce((s2, l) => s2 + l.teams.length, 0), 0);
          return (
            <div key={f.id} className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="w-full flex items-center gap-2.5 px-4 py-3.5 hover:bg-slate-50/80">
                <button type="button" onClick={() => toggle(openFactories, setOpenFactories, f.id)} className="flex items-center gap-2.5 flex-1 min-w-0">
                  {fOpen ? <IconChevronDown size={16} className="text-slate-400" /> : <IconChevronRight size={16} className="text-slate-400" />}
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <IconBuildingFactory2 size={16} />
                  </div>
                  <span className="font-black text-slate-900 text-sm truncate">{f.name}</span>
                  <span className="text-[11px] text-slate-400 font-semibold flex-shrink-0">{f.areas.length} xưởng · {teamCount} tổ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(f.id, 'FACTORY', f.name)}
                  disabled={deletingId === f.id}
                  className="w-7 h-7 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                  title="Xoá Nhà máy"
                >
                  <IconTrash size={13} />
                </button>
              </div>
              {fOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {f.areas.length === 0 && <div className="px-4 py-3 text-xs text-slate-400">Chưa có Xưởng nào.</div>}
                  {f.areas.map((a) => {
                    const aOpen = openAreas.has(a.id);
                    return (
                      <div key={a.id} className="pl-4">
                        <div className="flex items-center gap-2.5 px-2 py-2.5 hover:bg-slate-50/80">
                          <button type="button" onClick={() => toggle(openAreas, setOpenAreas, a.id)} className="flex items-center gap-2.5 flex-1 min-w-0">
                            {aOpen ? <IconChevronDown size={14} className="text-slate-400" /> : <IconChevronRight size={14} className="text-slate-400" />}
                            <span className="font-bold text-slate-800 text-xs truncate">{a.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">{a.lines.length} chuyền</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(a.id, 'AREA', a.name)}
                            disabled={deletingId === a.id}
                            className="w-6 h-6 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                            title="Xoá Xưởng"
                          >
                            <IconTrash size={12} />
                          </button>
                        </div>
                        {aOpen && (
                          <div className="pl-5 pb-2 space-y-1.5">
                            {a.lines.length === 0 && <div className="px-2 py-1 text-[11px] text-slate-400">Chưa có Chuyền nào.</div>}
                            {a.lines.map((l) => {
                              const lOpen = openLines.has(l.id);
                              return (
                                <div key={l.id}>
                                  <div className="flex items-center gap-2 px-2 py-2 hover:bg-slate-50/80">
                                    <button type="button" onClick={() => toggle(openLines, setOpenLines, l.id)} className="flex items-center gap-2 flex-1 min-w-0">
                                      {lOpen ? <IconChevronDown size={12} className="text-slate-400" /> : <IconChevronRight size={12} className="text-slate-400" />}
                                      <span className="font-semibold text-slate-700 text-[11px] truncate">{l.name}</span>
                                      <span className="text-[10px] text-slate-400 flex-shrink-0">{l.teams.length} tổ</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(l.id, 'LINE', l.name)}
                                      disabled={deletingId === l.id}
                                      className="w-6 h-6 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                                      title="Xoá Chuyền"
                                    >
                                      <IconTrash size={11} />
                                    </button>
                                  </div>
                                  {lOpen && (
                                    <div className="pl-5 pb-2 flex flex-wrap items-center gap-1.5">
                                      {l.teams.map((t) => (
                                        <span
                                          key={t.id}
                                          className="flex items-center gap-1 pl-2.5 pr-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold"
                                        >
                                          <button
                                            type="button"
                                            onClick={() => setQrTeam({ id: t.id, name: t.name, path: `${f.name} › ${a.name} › ${l.name}` })}
                                            className="flex items-center gap-1.5 hover:underline"
                                          >
                                            <IconUsersGroup size={12} />
                                            {t.name}
                                            <IconQrcode size={12} className="text-emerald-500" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDelete(t.id, 'TEAM', t.name)}
                                            disabled={deletingId === t.id}
                                            className="w-5 h-5 rounded text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center disabled:opacity-40"
                                            title="Xoá Tổ"
                                          >
                                            <IconTrash size={10} />
                                          </button>
                                        </span>
                                      ))}
                                      <AddInline type="TEAM" parentId={l.id} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            <AddInline type="LINE" parentId={a.id} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="px-4 py-3">
                    <AddInline type="AREA" parentId={f.id} />
                  </div>
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
