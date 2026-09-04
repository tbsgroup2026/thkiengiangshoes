'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconPlus, IconPencil, IconTrash, IconSpeakerphone } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';
import DateRangeFilter, { inDateRange } from '@/components/DateRangeFilter';
import RefreshButton from '@/components/RefreshButton';

type CategoryOption = { id: string; name: string };

type Announcement = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  createdBy: { name: string; employeeCode: string };
  targetFactory: { id: string; name: string } | null;
  targetRole: string | null;
  createdAt: string;
};

const ROLE_LABEL: Record<string, string> = { OPERATOR: 'Vận hành', MAINTENANCE: 'Bảo trì', ADMIN: 'Quản trị' };

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

type FormData = { title: string; content: string; targetFactoryId: string; targetRole: string };
const EMPTY_FORM: FormData = { title: '', content: '', targetFactoryId: '', targetRole: '' };

// Thông báo — soạn + gửi push THẬT tới App Mobile Native của nhân viên KG. Bắt buộc chọn 1 Nhà
// máy (tbsMayMoc chặn gửi cho cả công ty từ đây) — hành động gửi KHÔNG hoàn tác được.
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [factories, setFactories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const load = async (force = false) => {
    try {
      force ? setRefreshing(true) : setLoading(true);
      setError(null);
      const fresh = force ? '?fresh=1' : '';
      const settled = await Promise.allSettled([
        fetch(`/api/mmtb-kg/announcements${fresh}`).then((r) => r.json()),
        fetch(`/api/mmtb-kg/categories?type=FACTORY${force ? '&fresh=1' : ''}`).then((r) => r.json()),
      ]);
      const [annRes, facRes] = settled.map((s) => (s.status === 'fulfilled' ? s.value : { success: false, error: String(s.reason) }));
      if (annRes.success) setAnnouncements(annRes.data || []);
      else { console.warn('Failed to load announcements from tbsMayMoc:', annRes.error); setError(annRes.error || 'Không lấy được dữ liệu'); }
      if (facRes.success) setFactories(facRes.data || []);
    } catch (err) {
      console.warn('Failed to fetch announcements from tbsMayMoc:', err);
    } finally {
      force ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => announcements.filter((a) => inDateRange(a.createdAt, dateFrom, dateTo)),
    [announcements, dateFrom, dateTo]
  );

  function openCreateForm() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(a: Announcement) {
    setEditingId(a.id);
    setFormData({ title: a.title, content: a.content, targetFactoryId: a.targetFactory?.id ?? '', targetRole: a.targetRole ?? '' });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('Thiếu tiêu đề hoặc nội dung');
      return;
    }
    if (!formData.targetFactoryId) {
      setFormError('Vui lòng chọn Nhà máy nhận thông báo');
      return;
    }
    if (!editingId && !confirm('Gửi thông báo này tới nhân viên ngay bây giờ? Hành động này không thể hoàn tác.')) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        targetFactoryId: formData.targetFactoryId,
        targetRole: formData.targetRole || null,
      };
      const url = editingId ? `/api/mmtb-kg/announcements/${editingId}` : '/api/mmtb-kg/announcements';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) {
        setFormError(result.error || 'Không lưu được');
        return;
      }
      setShowForm(false);
      await load();
    } catch {
      setFormError('Không kết nối được tới hệ thống MMTB');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(a: Announcement) {
    if (!confirm(`Xoá thông báo "${a.title}"? (đã gửi tới máy nhân viên rồi, xoá chỉ gỡ khỏi lịch sử)`)) return;
    setDeletingId(a.id);
    try {
      const res = await fetch(`/api/mmtb-kg/announcements/${a.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Không xoá được');
        return;
      }
      await load();
    } catch {
      alert('Không kết nối được tới hệ thống MMTB');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <MaintenanceShell title="Thông Báo" subtitle="Gửi thông báo tới App Mobile Native — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-tbs-dark">Thông Báo</h1>
            <p className="text-xs text-gray-500 mt-1">Gửi push thật tới nhân viên KG qua App Mobile — {announcements.length} thông báo</p>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton onClick={() => load(true)} loading={refreshing} />
            <button onClick={openCreateForm} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-tbs-dark text-white text-xs font-bold hover:opacity-90">
              <IconPlus size={15} /> Soạn Thông Báo
            </button>
          </div>
        </div>

        {/* Lỗi kết nối tbsMayMoc chỉ log console (F12), không hiện banner ngoài trang */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
          <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
        </div>

        {loading && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Đang tải...</div>}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">
            {announcements.length === 0 ? 'Chưa có thông báo nào' : 'Không có thông báo trong khoảng thời gian này'}
          </div>
        )}

        <div className="space-y-2.5">
          {filtered.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <IconSpeakerphone size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-bold text-tbs-dark">{a.title}</span>
                  {a.targetFactory && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">{a.targetFactory.name}</span>}
                  {a.targetRole && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{ROLE_LABEL[a.targetRole] ?? a.targetRole}</span>}
                </div>
                <p className="text-xs text-gray-600 mt-1">{a.content}</p>
                <p className="text-[11px] text-gray-400 mt-1.5">Gửi bởi {a.createdBy.name} · {formatDateTime(a.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openEditForm(a)} title="Sửa" className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                  <IconPencil size={14} />
                </button>
                <button onClick={() => handleDelete(a)} disabled={deletingId === a.id} title="Xoá" className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 disabled:opacity-40">
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-tbs-dark">{editingId ? 'Sửa Thông Báo' : 'Soạn Thông Báo Mới'}</h3>
            {!editingId && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                ⚠️ Gửi sẽ đẩy thông báo THẬT tới điện thoại nhân viên ngay lập tức, không hoàn tác được.
              </div>
            )}
            {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {formError}</div>}
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Tiêu đề *</span>
              <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" required autoFocus />
            </label>
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Nội dung *</span>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal resize-none" required />
            </label>
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Nhà máy nhận *</span>
              <FilterSelect
                value={formData.targetFactoryId}
                onChange={(v) => setFormData({ ...formData, targetFactoryId: v })}
                options={factories}
                placeholder="-- Chọn nhà máy --"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Vai trò nhận (bỏ trống = tất cả)</span>
              <select value={formData.targetRole} onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal">
                <option value="">Tất cả vai trò</option>
                <option value="OPERATOR">Vận hành</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </label>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200">Huỷ</button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light disabled:opacity-50">
                {submitting ? 'Đang gửi...' : editingId ? 'Lưu Thay Đổi' : 'Gửi Thông Báo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </MaintenanceShell>
  );
}
