'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconPlus, IconPencil, IconTrash, IconUsers } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';

type CategoryOption = { id: string; name: string; parentId: string | null };

type Role = 'ADMIN' | 'OPERATOR' | 'MAINTENANCE';

type Employee = {
  id: string;
  employeeCode: string;
  name: string;
  phone: string | null;
  role: Role;
  areaId: string | null;
  area: { id: string; name: string; parent: { id: string; name: string } | null } | null;
  factoryId: string | null;
  factory: { id: string; name: string } | null;
  isTeamLead: boolean;
  extraAreaIds: string[];
};

const ROLE_LABEL: Record<Role, string> = { ADMIN: 'Quản trị', OPERATOR: 'Vận hành', MAINTENANCE: 'Bảo trì' };
const ROLE_BADGE: Record<Role, string> = {
  ADMIN: 'bg-violet-100 text-violet-700',
  OPERATOR: 'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-amber-100 text-amber-700',
};

type FormData = {
  employeeCode: string;
  name: string;
  phone: string;
  password: string;
  role: Role;
  factoryId: string;
  areaId: string;
  isTeamLead: boolean;
  extraAreaIds: string[];
};

const EMPTY_FORM: FormData = {
  employeeCode: '', name: '', phone: '', password: '', role: 'OPERATOR',
  factoryId: '', areaId: '', isTeamLead: false, extraAreaIds: [],
};

// Nhân Sự — Thêm/Sửa/Xoá tài khoản đăng nhập App Mobile Native THẬT của nhân viên KG. Không tạo/
// sửa được tài khoản Quản trị (ADMIN) — tbsMayMoc chặn ở server, chỉ Admin toàn quyền làm được.
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [factories, setFactories] = useState<CategoryOption[]>([]);
  const [areas, setAreas] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterFactoryId, setFilterFactoryId] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empRes, facRes, areaRes] = await Promise.all([
        fetch('/api/maintenance/employees').then((r) => r.json()),
        fetch('/api/maintenance/categories?type=FACTORY').then((r) => r.json()),
        fetch('/api/maintenance/categories?type=AREA').then((r) => r.json()),
      ]);
      if (empRes.success) setEmployees(empRes.data || []);
      else setError(empRes.error || 'Không lấy được dữ liệu');
      if (facRes.success) setFactories(facRes.data || []);
      if (areaRes.success) setAreas(areaRes.data || []);
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

  const areasUnderFormFactory = areas.filter((a) => !formData.factoryId || a.parentId === formData.factoryId);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      const matchesQ = !q || e.employeeCode.toLowerCase().includes(q) || e.name.toLowerCase().includes(q);
      const matchesFactory = !filterFactoryId || e.factoryId === filterFactoryId;
      const matchesRole = !filterRole || e.role === filterRole;
      return matchesQ && matchesFactory && matchesRole;
    });
  }, [employees, search, filterFactoryId, filterRole]);

  function openCreateForm() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(e: Employee) {
    setEditingId(e.id);
    setFormData({
      employeeCode: e.employeeCode,
      name: e.name,
      phone: e.phone ?? '',
      password: '',
      role: e.role === 'ADMIN' ? 'OPERATOR' : e.role,
      factoryId: e.factoryId ?? '',
      areaId: e.areaId ?? '',
      isTeamLead: e.isTeamLead,
      extraAreaIds: e.extraAreaIds ?? [],
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!formData.employeeCode.trim() || !formData.name.trim() || !formData.factoryId) {
      setFormError('Thiếu Mã NV / Tên / Nhà máy');
      return;
    }
    if (!editingId && !formData.password.trim()) {
      setFormError('Vui lòng nhập mật khẩu cho tài khoản mới');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        employeeCode: formData.employeeCode.trim(),
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        ...(formData.password.trim() ? { password: formData.password.trim() } : {}),
        role: formData.role,
        factoryId: formData.factoryId,
        areaId: formData.areaId || null,
        isTeamLead: formData.role === 'MAINTENANCE' ? formData.isTeamLead : false,
        extraAreaIds: formData.role === 'MAINTENANCE' && formData.isTeamLead ? formData.extraAreaIds : [],
      };
      const url = editingId ? `/api/maintenance/employees/${editingId}` : '/api/maintenance/employees';
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

  async function handleDelete(e: Employee) {
    if (!confirm(`Xoá tài khoản "${e.name}" (${e.employeeCode})? Nhân viên này sẽ không đăng nhập được nữa.`)) return;
    setDeletingId(e.id);
    try {
      const res = await fetch(`/api/maintenance/employees/${e.id}`, { method: 'DELETE' });
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
    <MaintenanceShell title="Nhân Sự" subtitle="Tài khoản đăng nhập App Mobile Native — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-tbs-dark">Nhân Sự</h1>
            <p className="text-xs text-gray-500 mt-1">Dữ liệu thật, tài khoản đăng nhập App Mobile — {filtered.length} nhân viên</p>
          </div>
          <button onClick={openCreateForm} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-tbs-dark text-white text-xs font-bold hover:opacity-90">
            <IconPlus size={15} /> Thêm Nhân Viên
          </button>
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã NV, tên..."
            className="min-w-[220px] flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
          />
          <FilterSelect value={filterFactoryId} onChange={setFilterFactoryId} options={factories} placeholder="Tất cả nhà máy" />
          <FilterSelect
            value={filterRole}
            onChange={setFilterRole}
            options={[{ id: 'OPERATOR', name: 'Vận hành' }, { id: 'MAINTENANCE', name: 'Bảo trì' }, { id: 'ADMIN', name: 'Quản trị' }]}
            placeholder="Tất cả vai trò"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100 whitespace-nowrap">
                <th className="p-4">Mã NV</th>
                <th className="p-4">Tên</th>
                <th className="p-4">SĐT</th>
                <th className="p-4">Vai Trò</th>
                <th className="p-4">Nhà Máy</th>
                <th className="p-4">Khu Vực</th>
                <th className="p-4">Trưởng Team</th>
                <th className="p-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 whitespace-nowrap">
              {loading && <tr><td className="p-4 text-gray-400" colSpan={8}>Đang tải...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td className="p-4 text-gray-400" colSpan={8}>Không có nhân viên nào</td></tr>}
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-4 font-mono font-bold text-accent">{e.employeeCode}</td>
                  <td className="p-4 font-semibold text-tbs-dark">{e.name}</td>
                  <td className="p-4">{e.phone ?? '-'}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 font-bold rounded ${ROLE_BADGE[e.role]}`}>{ROLE_LABEL[e.role]}</span></td>
                  <td className="p-4">{e.factory?.name ?? '-'}</td>
                  <td className="p-4">{e.area?.name ?? '-'}</td>
                  <td className="p-4">{e.isTeamLead ? '✓' : '-'}</td>
                  <td className="p-4 text-center">
                    {e.role === 'ADMIN' ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openEditForm(e)} title="Sửa" className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                          <IconPencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(e)}
                          disabled={deletingId === e.id}
                          title="Xoá"
                          className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 disabled:opacity-40"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-tbs-dark flex items-center gap-2"><IconUsers size={18} /> {editingId ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên'}</h3>
            {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {formError}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Mã nhân viên *</span>
                <input value={formData.employeeCode} onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" required />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Tên *</span>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" required />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Số điện thoại</span>
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>{editingId ? 'Mật khẩu mới (để trống = giữ nguyên)' : 'Mật khẩu *'}</span>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" required={!editingId} />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Vai trò *</span>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Role, isTeamLead: false })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal">
                  <option value="OPERATOR">Vận hành</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Nhà máy *</span>
                <FilterSelect
                  value={formData.factoryId}
                  onChange={(v) => setFormData({ ...formData, factoryId: v, areaId: '' })}
                  options={factories}
                  placeholder="-- Chọn nhà máy --"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1 sm:col-span-2">
                <span>Khu vực</span>
                <FilterSelect
                  value={formData.areaId}
                  onChange={(v) => setFormData({ ...formData, areaId: v })}
                  options={areasUnderFormFactory}
                  placeholder={formData.factoryId ? '-- Chọn khu vực --' : 'Chọn nhà máy trước'}
                  disabled={!formData.factoryId}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal disabled:opacity-50"
                />
              </label>
            </div>

            {formData.role === 'MAINTENANCE' && (
              <div className="space-y-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <input type="checkbox" checked={formData.isTeamLead} onChange={(e) => setFormData({ ...formData, isTeamLead: e.target.checked, extraAreaIds: [] })} />
                  Trưởng team (quản lý thêm khu vực khác ngoài khu vực chính)
                </label>
                {formData.isTeamLead && (
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                    {areasUnderFormFactory.filter((a) => a.id !== formData.areaId).map((a) => (
                      <label key={a.id} className="flex items-center gap-1.5 text-[11px] text-amber-700">
                        <input
                          type="checkbox"
                          checked={formData.extraAreaIds.includes(a.id)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...formData.extraAreaIds, a.id]
                              : formData.extraAreaIds.filter((id) => id !== a.id);
                            setFormData({ ...formData, extraAreaIds: next });
                          }}
                        />
                        {a.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200">Huỷ</button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light disabled:opacity-50">
                {submitting ? 'Đang lưu...' : editingId ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}
              </button>
            </div>
          </form>
        </div>
      )}
    </MaintenanceShell>
  );
}
