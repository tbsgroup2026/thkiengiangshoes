'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { buildQrLabelImage } from '@/lib/qrLabelImage';
import {
  IconArrowLeft,
  IconBuildingFactory2,
  IconQrcode,
  IconDownload,
  IconRefresh,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

type PphTeam = { id: string; name: string };
type PphLine = { id: string; name: string; teams: PphTeam[] };
type PphArea = { id: string; name: string; lines: PphLine[]; teams: PphTeam[] };
type PphFactory = { id: string; name: string; areas: PphArea[] };
type OrgType = 'FACTORY' | 'AREA' | 'LINE' | 'TEAM';

const TYPE_LABEL: Record<OrgType, string> = { FACTORY: 'Nhà máy', AREA: 'Phân xưởng', LINE: 'Chuyền', TEAM: 'Tổ' };

// Cài Đặt Hiệu Suất Nhà Máy — cây Nhà máy > Xưởng > (Chuyền > Tổ) HOẶC (Tổ thẳng) RIÊNG cho module
// này, tự quản lý. KHÔNG dùng dạng cây thu gọn nữa — hiện hết, chữ to, nút lớn, mỗi Nhà máy 1 khối
// riêng. Điểm quét QR có thể là Xưởng (VD "Đầu vào" — không chia gì thêm), Chuyền (VD "Gò" — không
// có Tổ bên dưới), hoặc Tổ (VD "May" — gắn thẳng dưới Xưởng, bỏ qua Chuyền) — bất kỳ mục nào KHÔNG
// còn mục con thì tự động là điểm quét, hiện nút QR ngay tại đó.
export default function PphSettingsView({ onClose }: { onClose: () => void }) {
  const [factories, setFactories] = useState<PphFactory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrTeam, setQrTeam] = useState<{ id: string; name: string; path: string } | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  // Ảnh THỰC SỰ tải về khi bấm "Tải ảnh" — đã ghép sẵn đường dẫn + tên vào ảnh, khác với qrImageUrl
  // (chỉ là mã QR trần, dùng để hiển thị xem trước trong popup).
  const [qrDownloadUrl, setQrDownloadUrl] = useState<string | null>(null);

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
      setQrDownloadUrl(null);
      return;
    }
    setQrDownloadUrl(null);
    const url = `${window.location.origin}/pph-scan?team=${encodeURIComponent(qrTeam.id)}`;
    QRCode.toDataURL(url, { width: 480, margin: 2 })
      .then(async (dataUrl) => {
        setQrImageUrl(dataUrl);
        // Ghép sẵn đường dẫn + tên vào ảnh tải về — để dán ra thực tế là biết ngay mã này ở đâu,
        // không cần mở lại hệ thống mới biết. Lỗi ở bước ghép KHÔNG chặn việc xem mã QR bình
        // thường — chỉ đơn giản là nút "Tải ảnh" khi đó tải mã QR trần (vẫn dùng được).
        try {
          const labelUrl = await buildQrLabelImage({ path: qrTeam.path, name: qrTeam.name, qrDataUrl: dataUrl });
          setQrDownloadUrl(labelUrl);
        } catch (err) {
          console.warn('Không ghép được nhãn vào ảnh QR:', err);
          setQrDownloadUrl(dataUrl);
        }
      })
      .catch(() => setQrImageUrl(null));
  }, [qrTeam]);

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

  const AddInline = ({ type, parentId, big }: { type: OrgType; parentId: string | null; big?: boolean }) => {
    const isOpen = addingFor?.type === type && addingFor?.parentId === parentId;
    const sizeCls = big ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-xs';
    if (!isOpen) {
      return (
        <button
          type="button"
          onClick={() => openAddForm(type, parentId)}
          className={`flex items-center gap-1.5 rounded-xl bg-white border-2 border-dashed border-slate-300 font-extrabold text-slate-500 hover:border-[#006838] hover:text-[#006838] hover:bg-emerald-50/50 transition ${sizeCls}`}
        >
          <IconPlus size={big ? 16 : 13} /> Thêm {TYPE_LABEL[type]}
        </button>
      );
    }
    return (
      <form onSubmit={submitAdd} className="flex items-center gap-2 flex-wrap bg-emerald-50 border-2 border-[#006838] rounded-xl p-2">
        <input
          autoFocus
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder={`Tên ${TYPE_LABEL[type]} mới`}
          className="px-3 py-2 bg-white border border-[#006838]/40 rounded-lg text-sm font-bold w-44 focus:outline-none"
        />
        <button type="submit" disabled={addSubmitting} className="w-9 h-9 rounded-lg bg-[#006838] text-white flex items-center justify-center disabled:opacity-50">
          <IconCheck size={16} />
        </button>
        <button type="button" onClick={() => setAddingFor(null)} className="w-9 h-9 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
          <IconX size={16} />
        </button>
        {addError && <span className="text-xs text-rose-600 font-bold w-full">{addError}</span>}
      </form>
    );
  };

  const QrChip = ({ id, name, path, type }: { id: string; name: string; path: string; type: OrgType }) => (
    <div className="flex items-center gap-1 pl-4 pr-1.5 py-3 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800">
      <button type="button" onClick={() => setQrTeam({ id, name, path })} className="flex items-center gap-2 font-black text-sm flex-1">
        <IconQrcode size={18} className="text-emerald-500 flex-shrink-0" />
        {name}
      </button>
      <button
        type="button"
        onClick={() => handleDelete(id, type, name)}
        disabled={deletingId === id}
        className="w-8 h-8 rounded-lg text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
        title={`Xoá ${TYPE_LABEL[type]}`}
      >
        <IconTrash size={14} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5 my-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center flex-shrink-0"
            title="Về Hiệu Suất Nhà Máy"
          >
            <IconArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">⚙️ Cài Đặt — Hiệu Suất Nhà Máy</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Nhà máy › Phân xưởng › Chuyền/Tổ — mục nào không còn mục con là 1 điểm quét, có mã QR riêng để dán tại chỗ.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <IconRefresh size={16} /> Làm mới
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
          ⚠️ {error} — kiểm tra Console (F12) để biết chi tiết.
        </div>
      )}

      {loading && <div className="p-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-base text-slate-400">Đang tải...</div>}

      {!loading && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <AddInline type="FACTORY" parentId={null} big />
        </div>
      )}

      {!loading && !error && factories.length === 0 && (
        <div className="p-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center text-base text-slate-400">
          Chưa có Nhà máy nào — bấm &quot;Thêm Nhà máy&quot; ở trên để bắt đầu.
        </div>
      )}

      <div className="space-y-5">
        {factories.map((f) => (
          <div key={f.id} className="rounded-3xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden">
            {/* Header Nhà máy — to, nổi bật */}
            <div className="flex items-center gap-3 px-5 py-4 bg-[#08221a] text-white">
              <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <IconBuildingFactory2 size={22} />
              </div>
              <h3 className="font-black text-lg flex-1 truncate">{f.name}</h3>
              <button
                type="button"
                onClick={() => handleDelete(f.id, 'FACTORY', f.name)}
                disabled={deletingId === f.id}
                className="w-9 h-9 rounded-lg text-white/50 hover:bg-white/10 hover:text-rose-300 flex items-center justify-center flex-shrink-0 disabled:opacity-30"
                title="Xoá Nhà máy"
              >
                <IconTrash size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {f.areas.length === 0 && <div className="text-sm text-slate-400 py-2">Chưa có Phân xưởng nào.</div>}

              {f.areas.map((a) => {
                const isLeafArea = a.lines.length === 0 && a.teams.length === 0;
                return (
                  <div key={a.id} className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-black text-slate-900 text-base flex-1">{a.name}</h4>
                      {!isLeafArea && (
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id, 'AREA', a.name)}
                          disabled={deletingId === a.id}
                          className="w-8 h-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                          title="Xoá Phân xưởng"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>

                    {/* Xưởng trống hẳn (VD Đầu vào) → chính Xưởng là điểm quét */}
                    {isLeafArea && (
                      <QrChip id={a.id} name={a.name} path={f.name} type="AREA" />
                    )}

                    {/* Tổ gắn thẳng dưới Xưởng (VD May) */}
                    {a.teams.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {a.teams.map((t) => (
                          <QrChip key={t.id} id={t.id} name={t.name} path={`${f.name} › ${a.name}`} type="TEAM" />
                        ))}
                      </div>
                    )}

                    {/* Chuyền dưới Xưởng (VD Gò) — Chuyền không có Tổ con thì Chuyền là điểm quét */}
                    {a.lines.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {a.lines.map((l) =>
                          l.teams.length === 0 ? (
                            <QrChip key={l.id} id={l.id} name={l.name} path={`${f.name} › ${a.name}`} type="LINE" />
                          ) : (
                            <div key={l.id} className="col-span-full rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm flex-1">{l.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(l.id, 'LINE', l.name)}
                                  disabled={deletingId === l.id}
                                  className="w-7 h-7 rounded-lg text-rose-400 hover:bg-rose-50 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                                >
                                  <IconTrash size={12} />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {l.teams.map((t) => (
                                  <QrChip key={t.id} id={t.id} name={t.name} path={`${f.name} › ${a.name} › ${l.name}`} type="TEAM" />
                                ))}
                                <AddInline type="TEAM" parentId={l.id} />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Nút thêm — chỉ hiện khi Xưởng chưa "chốt" thành điểm quét trống */}
                    {!isLeafArea && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <AddInline type="LINE" parentId={a.id} />
                        <AddInline type="TEAM" parentId={a.id} />
                      </div>
                    )}
                  </div>
                );
              })}

              <AddInline type="AREA" parentId={f.id} big />
            </div>
          </div>
        ))}
      </div>

      {/* Modal mã QR */}
      {qrTeam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setQrTeam(null)}>
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="text-xs text-slate-400 font-semibold">{qrTeam.path}</div>
              <h3 className="font-black text-xl text-slate-900">{qrTeam.name}</h3>
            </div>
            <div className="flex items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {qrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrImageUrl} alt={`QR ${qrTeam.name}`} className="w-56 h-56" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">Đang tạo mã...</div>
              )}
            </div>
            <p className="text-xs text-slate-400">Dán mã này tại vị trí tương ứng — quét bằng camera Zalo để mở form cập nhật sản lượng.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQrTeam(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200"
              >
                Đóng
              </button>
              {qrImageUrl && (
                <a
                  href={qrDownloadUrl || qrImageUrl}
                  download={`QR-${qrTeam.name.replace(/\s+/g, '-')}.png`}
                  className="flex-1 py-3 rounded-xl bg-[#006838] text-white text-sm font-bold hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <IconDownload size={16} /> Tải ảnh
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
