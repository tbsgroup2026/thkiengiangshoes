'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { IconPlus, IconPencil, IconTrash, IconUsers, IconFileSpreadsheet } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';
import RefreshButton from '@/components/RefreshButton';

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

const IMPORT_TEMPLATE_HEADERS = ['Mã nhân viên', 'Tên', 'SĐT', 'Mật khẩu', 'Vai trò (Vận hành/Bảo trì)', 'Nhà máy', 'Khu vực'] as const;

type ImportRow = { rowNumber: number; label: string; payload: {
  employeeCode: string; name: string; phone: string | null; password: string; role: Role;
  factoryId: string; areaId: string | null;
} };
type ImportRowError = { rowNumber: number; label: string; message: string };

function normLoose(s: unknown): string {
  return String(s ?? '').normalize('NFC').trim().toLowerCase();
}

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

  // Nhập Excel hàng loạt
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importRowErrors, setImportRowErrors] = useState<ImportRowError[]>([]);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: string[] } | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const load = async (force = false) => {
    try {
      force ? setRefreshing(true) : setLoading(true);
      setError(null);
      const fresh = force ? '&fresh=1' : '';
      const [empRes, facRes, areaRes] = await Promise.all([
        fetch(`/api/mmtb-kg/employees${force ? '?fresh=1' : ''}`).then((r) => r.json()),
        fetch(`/api/mmtb-kg/categories?type=FACTORY${fresh}`).then((r) => r.json()),
        fetch(`/api/mmtb-kg/categories?type=AREA${fresh}`).then((r) => r.json()),
      ]);
      if (empRes.success) setEmployees(empRes.data || []);
      else setError(empRes.error || 'Không lấy được dữ liệu');
      if (facRes.success) setFactories(facRes.data || []);
      if (areaRes.success) setAreas(areaRes.data || []);
    } catch (err) {
      console.warn('Failed to fetch employees from tbsMayMoc:', err);
    } finally {
      force ? setRefreshing(false) : setLoading(false);
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
      const url = editingId ? `/api/mmtb-kg/employees/${editingId}` : '/api/mmtb-kg/employees';
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
      const res = await fetch(`/api/mmtb-kg/employees/${e.id}`, { method: 'DELETE' });
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

  function handleExport() {
    const rows = filtered.map((e) => ({
      'Mã nhân viên': e.employeeCode,
      Tên: e.name,
      SĐT: e.phone ?? '',
      'Vai trò': ROLE_LABEL[e.role],
      'Nhà máy': e.factory?.name ?? '',
      'Khu vực': e.area?.name ?? '',
      'Trưởng team': e.isTeamLead ? 'Có' : '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nhan_Su');
    XLSX.writeFile(wb, `Nhan_Su_MMTB_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function handleDownloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      [...IMPORT_TEMPLATE_HEADERS],
      ['NV-001', 'Nguyễn Văn A', '0900000000', '123456', 'Vận hành', 'KG1', 'Xưởng 1'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_NhanSu');
    XLSX.writeFile(wb, 'Mau_Nhap_Nhan_Su_MMTB.xlsx');
  }

  function findByName(list: CategoryOption[], name: string, parentId?: string | null): CategoryOption | undefined {
    const n = normLoose(name);
    if (!n) return undefined;
    const candidates = list.filter((c) => normLoose(c.name) === n);
    if (candidates.length <= 1) return candidates[0];
    return candidates.find((c) => !parentId || c.parentId === parentId) ?? candidates[0];
  }

  function handleImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

        const okRows: ImportRow[] = [];
        const errRows: ImportRowError[] = [];

        rows.forEach((r, idx) => {
          const rowNumber = idx + 2;
          const employeeCode = String(r['Mã nhân viên'] ?? '').trim();
          const name = String(r['Tên'] ?? '').trim();
          const phone = String(r['SĐT'] ?? '').trim();
          const password = String(r['Mật khẩu'] ?? '').trim();
          const roleRaw = normLoose(r['Vai trò (Vận hành/Bảo trì)'] ?? r['Vai trò'] ?? '');
          const label = `Dòng ${rowNumber}${employeeCode ? ` (${employeeCode})` : ''}`;

          if (!employeeCode || !name || !password) {
            errRows.push({ rowNumber, label, message: 'Thiếu Mã nhân viên / Tên / Mật khẩu' });
            return;
          }
          const role: Role | null = roleRaw.includes('bảo trì') || roleRaw.includes('bao tri') ? 'MAINTENANCE'
            : roleRaw.includes('vận hành') || roleRaw.includes('van hanh') || !roleRaw ? 'OPERATOR' : null;
          if (!role) {
            errRows.push({ rowNumber, label, message: `Vai trò không hợp lệ "${r['Vai trò (Vận hành/Bảo trì)']}"` });
            return;
          }
          const factory = findByName(factories, String(r['Nhà máy'] ?? ''));
          if (!factory) {
            errRows.push({ rowNumber, label, message: `Không tìm thấy Nhà máy "${r['Nhà máy']}"` });
            return;
          }
          const area = findByName(areas, String(r['Khu vực'] ?? ''), factory.id);

          okRows.push({
            rowNumber,
            label,
            payload: { employeeCode, name, phone: phone || null, password, role, factoryId: factory.id, areaId: area?.id ?? null },
          });
        });

        setImportRows(okRows);
        setImportRowErrors(errRows);
        setImportOpen(true);
      } catch {
        alert('Không đọc được file Excel — kiểm tra lại định dạng file (.xlsx)');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleImportSubmit() {
    if (importRows.length === 0) return;
    setImportSubmitting(true);
    let success = 0;
    const failed: string[] = [];
    for (const row of importRows) {
      try {
        const res = await fetch('/api/mmtb-kg/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row.payload),
        });
        const result = await res.json();
        if (result.success) success++;
        else failed.push(`${row.label}: ${result.error || 'Lỗi không rõ'}`);
      } catch {
        failed.push(`${row.label}: Không kết nối được`);
      }
    }
    setImportSubmitting(false);
    setImportResult({ success, failed });
    setImportRows([]);
    setImportRowErrors([]);
    if (success > 0) await load();
  }

  return (
    <MaintenanceShell title="Nhân Sự" subtitle="Tài khoản đăng nhập App Mobile Native — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-tbs-dark">Nhân Sự</h1>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton onClick={() => load(true)} loading={refreshing} />
            <button onClick={openCreateForm} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-tbs-dark text-white text-xs font-bold hover:opacity-90">
              <IconPlus size={15} /> Thêm Nhân Viên
            </button>
            <input ref={importInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFileChange} />
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              <IconFileSpreadsheet size={15} /> Nhập Excel
            </button>
            <button onClick={handleDownloadTemplate} className="px-3 py-2.5 text-[11px] font-bold text-blue-600 hover:underline">
              Tải mẫu
            </button>
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light disabled:opacity-40"
            >
              ⬇ Xuất Excel
            </button>
          </div>
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

      {/* NHẬP EXCEL — xem trước dòng lỗi/hợp lệ trước khi ghi thật */}
      {importOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-tbs-dark">Nhập Excel — Xem Trước</h3>
            <p className="text-xs text-gray-500">
              <span className="font-bold text-emerald-600">{importRows.length} dòng hợp lệ</span>
              {importRowErrors.length > 0 && <> · <span className="font-bold text-rose-600">{importRowErrors.length} dòng lỗi</span></>}
            </p>
            {importRowErrors.length > 0 && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 space-y-1 max-h-40 overflow-y-auto">
                {importRowErrors.map((e) => (
                  <div key={e.rowNumber} className="text-xs text-rose-700"><span className="font-bold">{e.label}:</span> {e.message}</div>
                ))}
              </div>
            )}
            {importRows.length > 0 && (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 font-semibold text-gray-500">
                      <th className="p-2.5">Dòng</th>
                      <th className="p-2.5">Mã NV</th>
                      <th className="p-2.5">Tên</th>
                      <th className="p-2.5">Vai trò</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importRows.map((r) => (
                      <tr key={r.rowNumber}>
                        <td className="p-2.5 text-gray-400">{r.rowNumber}</td>
                        <td className="p-2.5 font-mono font-bold text-accent">{r.payload.employeeCode}</td>
                        <td className="p-2.5">{r.payload.name}</td>
                        <td className="p-2.5">{ROLE_LABEL[r.payload.role]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setImportOpen(false); setImportRows([]); setImportRowErrors([]); }} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200">Huỷ</button>
              <button
                type="button"
                onClick={async () => { await handleImportSubmit(); setImportOpen(false); }}
                disabled={importRows.length === 0 || importSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {importSubmitting ? 'Đang nhập...' : `Nhập ${importRows.length} nhân viên`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KẾT QUẢ NHẬP EXCEL */}
      {importResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-tbs-dark">Kết Quả Nhập Excel</h3>
            <p className="text-sm">
              <span className="font-bold text-emerald-600">{importResult.success} nhân viên đã thêm thành công</span>
              {importResult.failed.length > 0 && <span className="font-bold text-rose-600"> · {importResult.failed.length} thất bại</span>}
            </p>
            {importResult.failed.length > 0 && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 space-y-1 max-h-52 overflow-y-auto">
                {importResult.failed.map((f, i) => <div key={i} className="text-xs text-rose-700">{f}</div>)}
              </div>
            )}
            <button onClick={() => setImportResult(null)} className="w-full py-2.5 bg-tbs-dark text-white rounded-xl font-bold text-xs">Đóng</button>
          </div>
        </div>
      )}
    </MaintenanceShell>
  );
}
