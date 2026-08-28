'use client';

import { useEffect, useState } from 'react';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';

type FailureCategory = { id: string; name: string; isOther: boolean; order: number; scopeCategoryId: string | null };

// Danh mục hư — hiện ra khi nhân viên báo sự cố trên App Mobile Native. Mục có nhãn "Chung" dùng
// CHUNG cho mọi nhà máy (chỉ xem ở đây) — mục bạn tự thêm chỉ áp dụng riêng cho Tổ hợp KG.
export default function FailureCategoriesPage() {
  const [categories, setCategories] = useState<FailureCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formIsOther, setFormIsOther] = useState(false);
  const [formOrder, setFormOrder] = useState('0');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/mmtb-kg/failure-categories');
      const result = await res.json();
      if (result.success) setCategories(result.data || []);
      else setError(result.error || 'Không lấy được dữ liệu');
    } catch (err) {
      console.warn('Failed to fetch failure-categories from tbsMayMoc:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setFormName('');
    setFormIsOther(false);
    setFormOrder(String(categories.length + 1));
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(c: FailureCategory) {
    setEditingId(c.id);
    setFormName(c.name);
    setFormIsOther(c.isOther);
    setFormOrder(String(c.order));
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const url = editingId ? `/api/mmtb-kg/failure-categories/${editingId}` : '/api/mmtb-kg/failure-categories';
      const body = { name: formName.trim(), isOther: formIsOther, order: Number(formOrder) || 0 };
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  async function handleDelete(c: FailureCategory) {
    if (!confirm(`Xoá "${c.name}"?`)) return;
    setDeletingId(c.id);
    try {
      const res = await fetch(`/api/mmtb-kg/failure-categories/${c.id}`, { method: 'DELETE' });
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
    <MaintenanceShell title="Danh Mục Hư" subtitle="Danh mục lỗi khi báo sự cố — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-tbs-dark">Danh Mục Hư</h1>
            <p className="text-xs text-gray-500 mt-1">Hiện ra khi nhân viên báo sự cố trên App Mobile — {categories.length} mục</p>
          </div>
          <button onClick={openCreateForm} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-tbs-dark text-white text-xs font-bold hover:opacity-90">
            <IconPlus size={15} /> Thêm Danh Mục
          </button>
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {loading && <div className="p-4 text-xs text-gray-400">Đang tải...</div>}
            {!loading && categories.length === 0 && <div className="p-4 text-xs text-gray-400">Chưa có danh mục nào</div>}
            {categories.map((c) => {
              const shared = !c.scopeCategoryId;
              return (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/80">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 w-6">{c.order}</span>
                    <div className="text-xs font-bold text-tbs-dark flex items-center gap-1.5">
                      {c.name}
                      {shared && <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold">Chung</span>}
                      {c.isOther && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold">Khác (nhập tự do)</span>}
                    </div>
                  </div>
                  {!shared && (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEditForm(c)} title="Sửa" className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        <IconPencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c)} disabled={deletingId === c.id} title="Xoá" className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 disabled:opacity-40">
                        <IconTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-tbs-dark">{editingId ? 'Sửa Danh Mục' : 'Thêm Danh Mục Hư'}</h3>
            {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {formError}</div>}
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Tên danh mục *</span>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" required autoFocus />
            </label>
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Thứ tự hiển thị</span>
              <input type="number" value={formOrder} onChange={(e) => setFormOrder(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <input type="checkbox" checked={formIsOther} onChange={(e) => setFormIsOther(e.target.checked)} />
              Là mục &quot;Khác&quot; — bắt buộc nhập danh mục cụ thể khi chọn ở App Mobile
            </label>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200">Huỷ</button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light disabled:opacity-50">
                {submitting ? 'Đang lưu...' : editingId ? 'Lưu Thay Đổi' : 'Thêm Mới'}
              </button>
            </div>
          </form>
        </div>
      )}
    </MaintenanceShell>
  );
}
