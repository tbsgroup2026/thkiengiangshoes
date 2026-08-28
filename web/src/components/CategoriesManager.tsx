'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconPlus, IconPencil, IconTrash, IconBuildingFactory2 } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';

type Category = {
  id: string;
  name: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  days?: number | null;
  colorHex?: string | null;
  quantity?: number | null;
};

export type CategoryTabKey = 'FACTORY' | 'AREA' | 'PRODUCTION_LINE' | 'TEAM' | 'MACHINE_TYPE' | 'PART' | 'MAINTENANCE_PERIOD' | 'MACHINE_STATUS';

// 'NONE' = không cha (Nhà máy — chỉ đọc). 'FACTORY'/'AREA'/'PRODUCTION_LINE' = cần chọn đúng
// tầng phạm vi đó trước khi Thêm/xem danh sách. 'SCOPE_KG' = KHÔNG cần chọn phạm vi tầng nào —
// mục CHUNG toàn hệ thống (parentId=null, chỉ xem) trộn với mục RIÊNG của Tổ hợp KG (parentId =
// đúng Tổ hợp KG, Thêm/Sửa/Xoá tự do) — tbsMayMoc đã lọc + tự gán cha đúng ở backend.
type ParentLevel = 'NONE' | 'FACTORY' | 'AREA' | 'PRODUCTION_LINE' | 'SCOPE_KG';

const ALL_TAB_CONFIG: Record<CategoryTabKey, { label: string; parentLevel: ParentLevel; hasDays?: boolean; hasColor?: boolean; hasQuantity?: boolean }> = {
  FACTORY: { label: 'Nhà máy', parentLevel: 'NONE' },
  AREA: { label: 'Khu vực / Xưởng', parentLevel: 'FACTORY' },
  PRODUCTION_LINE: { label: 'Chuyền', parentLevel: 'AREA' },
  TEAM: { label: 'Tổ', parentLevel: 'PRODUCTION_LINE' },
  MACHINE_TYPE: { label: 'Phân loại máy', parentLevel: 'FACTORY' },
  PART: { label: 'Phụ tùng / Linh kiện', parentLevel: 'FACTORY', hasQuantity: true },
  MAINTENANCE_PERIOD: { label: 'Chu kỳ bảo trì', parentLevel: 'SCOPE_KG', hasDays: true },
  MACHINE_STATUS: { label: 'Trạng thái máy', parentLevel: 'SCOPE_KG', hasColor: true },
};

const EMPTY: Record<CategoryTabKey, Category[]> = {
  FACTORY: [], AREA: [], PRODUCTION_LINE: [], TEAM: [], MACHINE_TYPE: [], PART: [], MAINTENANCE_PERIOD: [], MACHINE_STATUS: [],
};

// Component dùng chung cho mọi trang Danh mục (Quản Lý Khu Vực, Phân Loại Máy, Phụ Tùng/Linh
// Kiện, Bảo Trì, Trạng Thái Máy) — mỗi trang route riêng chỉ truyền vào đúng bộ tabKeys cần hiện,
// tránh chép lại logic CRUD 8 lần. Xem các trang trong app/maintenance/categories/*.
export default function CategoriesManager({
  tabKeys,
  pageTitle,
  pageSubtitle,
}: {
  tabKeys: CategoryTabKey[];
  pageTitle: string;
  pageSubtitle: string;
}) {
  const [data, setData] = useState<Record<CategoryTabKey, Category[]>>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<CategoryTabKey>(tabKeys[0]);

  const [scopeFactoryId, setScopeFactoryId] = useState('');
  const [scopeAreaId, setScopeAreaId] = useState('');
  const [scopeLineId, setScopeLineId] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDays, setFormDays] = useState('');
  const [formColor, setFormColor] = useState('#64748b');
  const [formQuantity, setFormQuantity] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Danh sách các loại thực sự cần tải — luôn kèm FACTORY (dùng cho combobox phạm vi) + AREA/
  // PRODUCTION_LINE khi tab cần đến chúng để lọc phạm vi (VD trang Phân Loại Máy chỉ cần
  // FACTORY+MACHINE_TYPE, không cần AREA/PRODUCTION_LINE).
  const fetchTypes = useMemo(() => {
    const set = new Set<CategoryTabKey>(['FACTORY', ...tabKeys]);
    if (tabKeys.includes('PRODUCTION_LINE') || tabKeys.includes('TEAM')) set.add('AREA');
    if (tabKeys.includes('TEAM')) set.add('PRODUCTION_LINE');
    return Array.from(set);
  }, [tabKeys]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await Promise.all(
        fetchTypes.map((t) => fetch(`/api/mmtb-kg/categories?type=${t}`).then((r) => r.json())),
      );
      const next = { ...EMPTY };
      results.forEach((r, i) => {
        next[fetchTypes[i]] = r.success && Array.isArray(r.data) ? r.data : [];
      });
      setData(next);
    } catch (err) {
      console.warn('Failed to fetch categories from tbsMayMoc:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabConfig = ALL_TAB_CONFIG[tab];

  const items = useMemo(() => {
    if (tabConfig.parentLevel === 'NONE' || tabConfig.parentLevel === 'SCOPE_KG') return data[tab];
    if (tabConfig.parentLevel === 'FACTORY') return scopeFactoryId ? data[tab].filter((c) => c.parentId === scopeFactoryId) : [];
    if (tabConfig.parentLevel === 'AREA') return scopeAreaId ? data[tab].filter((c) => c.parentId === scopeAreaId) : [];
    if (tabConfig.parentLevel === 'PRODUCTION_LINE') return scopeLineId ? data[tab].filter((c) => c.parentId === scopeLineId) : [];
    return [];
  }, [tab, tabConfig, data, scopeFactoryId, scopeAreaId, scopeLineId]);

  const areasUnderScope = data.AREA.filter((a) => !scopeFactoryId || a.parentId === scopeFactoryId);
  const linesUnderScope = data.PRODUCTION_LINE.filter((l) => !scopeAreaId || l.parentId === scopeAreaId);

  const canCreate =
    tabConfig.parentLevel === 'SCOPE_KG' ||
    (tabConfig.parentLevel === 'FACTORY' && !!scopeFactoryId) ||
    (tabConfig.parentLevel === 'AREA' && !!scopeAreaId) ||
    (tabConfig.parentLevel === 'PRODUCTION_LINE' && !!scopeLineId);

  function parentIdForNew(): string | null {
    if (tabConfig.parentLevel === 'FACTORY') return scopeFactoryId || null;
    if (tabConfig.parentLevel === 'AREA') return scopeAreaId || null;
    if (tabConfig.parentLevel === 'PRODUCTION_LINE') return scopeLineId || null;
    return null;
  }

  function isShared(c: Category) {
    return tabConfig.parentLevel === 'SCOPE_KG' && !c.parentId;
  }

  function openCreateForm() {
    setEditingId(null);
    setFormName('');
    setFormDays('');
    setFormColor('#64748b');
    setFormQuantity('');
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(c: Category) {
    setEditingId(c.id);
    setFormName(c.name);
    setFormDays(c.days != null ? String(c.days) : '');
    setFormColor(c.colorHex || '#64748b');
    setFormQuantity(c.quantity != null ? String(c.quantity) : '');
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên');
      return;
    }
    if (tabConfig.hasDays && (!formDays || Number(formDays) <= 0)) {
      setFormError('Vui lòng nhập số ngày hợp lệ');
      return;
    }
    if (tabConfig.hasQuantity && (formQuantity === '' || Number(formQuantity) < 0)) {
      setFormError('Vui lòng nhập số lượng tồn kho hợp lệ');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const url = editingId ? `/api/mmtb-kg/categories/${editingId}` : '/api/mmtb-kg/categories';
      const extra = {
        ...(tabConfig.hasDays ? { days: Number(formDays) } : {}),
        ...(tabConfig.hasColor ? { colorHex: formColor } : {}),
        ...(tabConfig.hasQuantity ? { quantity: Number(formQuantity) } : {}),
      };
      const body = editingId
        ? { name: formName.trim(), ...extra }
        : { type: tab, name: formName.trim(), parentId: parentIdForNew(), ...extra };
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

  async function handleDelete(c: Category) {
    if (!confirm(`Xoá "${c.name}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(c.id);
    try {
      const res = await fetch(`/api/mmtb-kg/categories/${c.id}`, { method: 'DELETE' });
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

  const readOnlyTab = tabConfig.parentLevel === 'NONE';

  return (
    <MaintenanceShell title={pageTitle} subtitle={pageSubtitle}>
      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">{pageTitle}</h1>
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>}

        {tabKeys.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {tabKeys.map((k) => (
              <button
                key={k}
                onClick={() => { setTab(k); setShowForm(false); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                  tab === k ? 'bg-tbs-dark text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-accent/40'
                }`}
              >
                {ALL_TAB_CONFIG[k].label}
              </button>
            ))}
          </div>
        )}

        {tabConfig.parentLevel === 'SCOPE_KG' && (
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            ℹ️ Đây là danh mục dùng chung toàn hệ thống — mục có nhãn <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold mx-0.5">Chung</span> chỉ xem được (nhà máy khác cũng đang dùng). Mục bạn tự thêm ở đây chỉ áp dụng riêng cho Tổ hợp KG, không ảnh hưởng nhà máy khác.
          </div>
        )}

        {(tabConfig.parentLevel === 'FACTORY' || tabConfig.parentLevel === 'AREA' || tabConfig.parentLevel === 'PRODUCTION_LINE') && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-extrabold text-tbs-dark shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-accent">
                <IconBuildingFactory2 size={18} />
              </span>
              Phạm vi
            </span>
            <FilterSelect
              value={scopeFactoryId}
              onChange={(v) => { setScopeFactoryId(v); setScopeAreaId(''); setScopeLineId(''); }}
              options={data.FACTORY}
              placeholder="-- Chọn nhà máy --"
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold min-w-[180px] disabled:opacity-50"
            />
            {(tabConfig.parentLevel === 'AREA' || tabConfig.parentLevel === 'PRODUCTION_LINE') && (
              <FilterSelect
                value={scopeAreaId}
                onChange={(v) => { setScopeAreaId(v); setScopeLineId(''); }}
                options={areasUnderScope}
                placeholder={scopeFactoryId ? '-- Chọn khu vực --' : 'Chọn nhà máy trước'}
                disabled={!scopeFactoryId}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold min-w-[180px] disabled:opacity-50"
              />
            )}
            {tabConfig.parentLevel === 'PRODUCTION_LINE' && (
              <FilterSelect
                value={scopeLineId}
                onChange={setScopeLineId}
                options={linesUnderScope}
                placeholder={scopeAreaId ? '-- Chọn chuyền --' : 'Chọn khu vực trước'}
                disabled={!scopeAreaId}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold min-w-[180px] disabled:opacity-50"
              />
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <span className="text-sm font-extrabold text-tbs-dark">{items.length} mục</span>
            {!readOnlyTab && (
              <button
                onClick={openCreateForm}
                disabled={!canCreate}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <IconPlus size={16} /> Thêm {tabConfig.label}
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {loading && <div className="p-5 text-sm text-gray-400">Đang tải...</div>}
            {!loading && items.length === 0 && (
              <div className="p-5 text-sm text-gray-400">
                {readOnlyTab || tabConfig.parentLevel === 'SCOPE_KG' ? 'Chưa có mục nào' : canCreate ? 'Chưa có mục nào — bấm Thêm để tạo mới' : 'Vui lòng chọn đủ phạm vi ở trên'}
              </div>
            )}
            {items.map((c) => {
              const shared = isShared(c);
              return (
                <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/80">
                  <div className="flex items-center gap-3">
                    {tabConfig.hasColor && (
                      <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: c.colorHex || '#94a3b8' }} />
                    )}
                    <div>
                      <div className="text-sm font-extrabold text-tbs-dark flex items-center gap-2">
                        {c.name}
                        {shared && <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold">Chung</span>}
                      </div>
                      {tabConfig.hasDays && c.days != null && <div className="text-xs text-gray-400 mt-0.5">{c.days} ngày</div>}
                      {tabConfig.hasQuantity && c.quantity != null && <div className="text-xs text-gray-400 mt-0.5">Tồn kho: {c.quantity}</div>}
                    </div>
                  </div>
                  {!readOnlyTab && !shared && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditForm(c)} title="Sửa" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        <IconPencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                        title="Xoá"
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 disabled:opacity-40"
                      >
                        <IconTrash size={16} />
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
            <h3 className="font-bold text-lg text-tbs-dark">{editingId ? `Sửa ${tabConfig.label}` : `Thêm ${tabConfig.label}`}</h3>
            {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {formError}</div>}
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Tên *</span>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" required autoFocus />
            </label>
            {tabConfig.hasDays && (
              <label className="block text-xs font-semibold text-gray-600 space-y-1">
                <span>Số ngày *</span>
                <input type="number" min={1} value={formDays} onChange={(e) => setFormDays(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" required />
              </label>
            )}
            {tabConfig.hasQuantity && (
              <label className="block text-xs font-semibold text-gray-600 space-y-1">
                <span>Số lượng tồn kho *</span>
                <input type="number" min={0} value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" required />
              </label>
            )}
            {tabConfig.hasColor && (
              <label className="block text-xs font-semibold text-gray-600 space-y-1">
                <span>Màu hiển thị</span>
                <input type="color" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="w-full h-9 px-1 py-1 bg-gray-50 border border-gray-200 rounded-xl" />
              </label>
            )}
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
