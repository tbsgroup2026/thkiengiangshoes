'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import { IconDeviceLaptop, IconCircleCheck, IconCircleDashed, IconAlertTriangle, IconTrash, IconPlus, IconPencil, IconFileSpreadsheet } from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';

type CategoryOption = { id: string; name: string; parentId: string | null };

type Machine = {
  id: string;
  code: string;
  name: string;
  serial: string | null;
  factoryId: string | null;
  factoryName: string | null;
  areaId: string | null;
  areaName: string | null;
  zone: string;
  teamId: string | null;
  teamName: string | null;
  lineId: string | null;
  lineName: string | null;
  machineTypeId: string | null;
  machineTypeName: string | null;
  statusId: string;
  statusName: string;
  statusColorHex: string | null;
  originalCost: number | null;
  depreciationPercent: number | null;
  remainingValue: number | null;
  qrData: string;
};

type FilterOptions = {
  factories: CategoryOption[];
  areas: CategoryOption[];
  productionLines: CategoryOption[];
  teams: CategoryOption[];
  machineTypes: CategoryOption[];
  statuses: CategoryOption[];
};

const EMPTY_FILTERS: FilterOptions = {
  factories: [],
  areas: [],
  productionLines: [],
  teams: [],
  machineTypes: [],
  statuses: [],
};

// Nhãn/màu trạng thái — khớp ĐÚNG tên + màu 4 trạng thái chuẩn đang dùng bên tbsMayMoc (nguồn dữ
// liệu thật duy nhất, xem src/lib/tbsMayMoc.ts). Không tự đặt ra trạng thái riêng — hiện đúng dữ
// liệu thật.
function normalizeStatus(statusName: string): string {
  return statusName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .trim()
    .toLowerCase();
}

function statusBadgeClass(statusName: string): string {
  const key = normalizeStatus(statusName);
  if (key === 'su dung') return 'bg-emerald-500/15 text-emerald-700';
  if (key === 'chua su dung') return 'bg-slate-400/15 text-slate-600';
  if (key === 'khong su dung') return 'bg-amber-500/15 text-amber-700';
  if (key === 'de nghi thanh ly') return 'bg-rose-500/15 text-rose-700';
  return 'bg-slate-400/15 text-slate-600';
}

function formatMoney(n: number | null): string {
  return n != null ? n.toLocaleString('vi-VN') : '-';
}

// Form Thêm/Sửa máy — chỉ hỏi đúng các trường thkiengiangshoes cần (xem MachineWriteInput ở
// lib/tbsMayMoc.ts). Khi Sửa, các trường không hỏi (model/hãng SX...) giữ nguyên bên tbsMayMoc.
type MachineFormData = {
  code: string;
  name: string;
  location: string;
  serialNumber: string;
  factoryId: string;
  areaId: string;
  lineId: string;
  teamId: string;
  machineTypeId: string;
  statusId: string;
};

const EMPTY_FORM: MachineFormData = {
  code: '',
  name: '',
  location: '',
  serialNumber: '',
  factoryId: '',
  areaId: '',
  lineId: '',
  teamId: '',
  machineTypeId: '',
  statusId: '',
};

// Nhập Excel hàng loạt — người dùng điền TÊN (Nhà máy/Khu vực/Chuyền/Tổ/Phân loại máy/Trạng thái)
// vào file, ở đây tự tra cứu ra ID tương ứng theo danh mục đã tải (filterOptions), khớp không
// phân biệt hoa/thường/khoảng trắng thừa. Dòng nào thiếu Mã tài sản/Tên máy/Vị trí hoặc không tra
// được Khu vực/Trạng thái → báo lỗi riêng cho dòng đó, không chặn các dòng còn lại.
const IMPORT_TEMPLATE_HEADERS = [
  'Mã tài sản', 'Tên máy', 'Vị trí', 'Số Serial', 'Nhà máy', 'Khu vực', 'Chuyền', 'Tổ', 'Phân loại máy', 'Trạng thái',
] as const;

type ImportRow = { rowNumber: number; label: string; payload: {
  code: string; name: string; location: string; serialNumber: string | null;
  areaId: string; teamId: string | null; productionLineId: string | null; machineTypeId: string | null; statusId: string;
} };
type ImportRowError = { rowNumber: number; label: string; message: string };

function normLoose(s: unknown): string {
  return String(s ?? '').normalize('NFC').trim().toLowerCase();
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  // Sinh ẢNH mã QR thật (không chỉ hiện chữ) — mã hoá ĐÚNG payload App Mobile Native đang dùng
  // để quét (JSON {type:"machine", code}, xem web-admin/src/app/api/machines/[id]/qrcode/route.ts
  // bên tbsMayMoc) — máy quét cùng 1 app sẽ nhận diện y hệt QR dán trên máy thật.
  useEffect(() => {
    if (!selectedQR) {
      setQrImageUrl(null);
      return;
    }
    const payload = JSON.stringify({ type: 'machine', code: selectedQR });
    QRCode.toDataURL(payload, { width: 400, margin: 2 })
      .then(setQrImageUrl)
      .catch(() => setQrImageUrl(null));
  }, [selectedQR]);

  const [search, setSearch] = useState('');
  const [filterMachineName, setFilterMachineName] = useState('');
  const [filterFactoryId, setFilterFactoryId] = useState('');
  const [filterAreaId, setFilterAreaId] = useState('');
  const [filterLineId, setFilterLineId] = useState('');
  const [filterTeamId, setFilterTeamId] = useState('');
  const [filterStatusId, setFilterStatusId] = useState('');
  const [filterMachineTypeId, setFilterMachineTypeId] = useState('');

  // Thêm/Sửa máy — cùng 1 modal dùng chung, editingId=null nghĩa là đang Thêm mới.
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MachineFormData>(EMPTY_FORM);
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

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // Máy móc (nặng, ~2500 máy) và bộ lọc (nhẹ) tách 2 request riêng — gộp chung từng vượt giới
      // hạn CPU time của Cloudflare Worker khi chạy thật (xem _worker.js).
      const [machinesRes, filtersRes] = await Promise.all([
        fetch('/api/mmtb-kg/machines').then((r) => r.json()),
        fetch('/api/mmtb-kg/machines/filters').then((r) => r.json()),
      ]);
      if (machinesRes.success && Array.isArray(machinesRes.data)) {
        setMachines(machinesRes.data);
      } else {
        setMachines([]);
        setError(machinesRes.error || 'Không lấy được dữ liệu');
      }
      setFilterOptions(filtersRes.success ? filtersRes.filters || EMPTY_FILTERS : EMPTY_FILTERS);
    } catch (err) {
      console.warn('Failed to fetch machines from tbsMayMoc:', err);
      setMachines([]);
      setError('Không kết nối được tới hệ thống MMTB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Danh sách TÊN máy khác nhau (không trùng) — dùng cho ô lọc "Tất cả tên máy", giống hệt bộ lọc
  // bên trang Máy móc tbsMayMoc, suy ra thẳng từ danh sách máy đã tải, không cần gọi API riêng.
  const machineNameOptions = useMemo(() => {
    return Array.from(new Set(machines.map((m) => m.name))).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [machines]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return machines.filter((m) => {
      const matchesSearch =
        !q ||
        m.code.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        (m.teamName ?? '').toLowerCase().includes(q) ||
        (m.lineName ?? '').toLowerCase().includes(q);
      const matchesMachineName = !filterMachineName || m.name === filterMachineName;
      const matchesFactory = !filterFactoryId || m.factoryId === filterFactoryId;
      const matchesArea = !filterAreaId || m.areaId === filterAreaId;
      const matchesLine = !filterLineId || m.lineId === filterLineId;
      const matchesTeam = !filterTeamId || m.teamId === filterTeamId;
      const matchesStatus = !filterStatusId || m.statusId === filterStatusId;
      const matchesMachineType = !filterMachineTypeId || m.machineTypeId === filterMachineTypeId;
      return (
        matchesSearch &&
        matchesMachineName &&
        matchesFactory &&
        matchesArea &&
        matchesLine &&
        matchesTeam &&
        matchesStatus &&
        matchesMachineType
      );
    });
  }, [
    machines,
    search,
    filterMachineName,
    filterFactoryId,
    filterAreaId,
    filterLineId,
    filterTeamId,
    filterStatusId,
    filterMachineTypeId,
  ]);

  // 5 ô tổng quan (giống hàng đầu trang Tổng quan bên tbsMayMoc) — tính theo ĐÚNG danh sách đang
  // lọc/tìm kiếm ở trên (không phải luôn toàn bộ), để khớp đúng số liệu đang hiển thị trong bảng.
  const statusStats = useMemo(() => {
    let suDung = 0;
    let chuaSuDung = 0;
    let khongSuDung = 0;
    let deNghiThanhLy = 0;
    for (const m of filtered) {
      const key = normalizeStatus(m.statusName);
      if (key === 'su dung') suDung++;
      else if (key === 'chua su dung') chuaSuDung++;
      else if (key === 'khong su dung') khongSuDung++;
      else if (key === 'de nghi thanh ly') deNghiThanhLy++;
    }
    return { total: filtered.length, suDung, chuaSuDung, khongSuDung, deNghiThanhLy };
  }, [filtered]);

  function handleExport() {
    const rows = filtered.map((m) => ({
      'Mã tài sản': m.code,
      'Tên máy': m.name,
      'Nhà máy': m.factoryName ?? '',
      'Khu vực / Xưởng': m.areaName ?? '',
      Tổ: m.teamName ?? '',
      Chuyền: m.lineName ?? '',
      'Phân loại máy': m.machineTypeName ?? '',
      'Trạng thái': m.statusName,
      'Nguyên giá': m.originalCost ?? '',
      'Đánh giá %': m.depreciationPercent ?? '',
      'Trị giá còn lại': m.remainingValue ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_MMTB');
    XLSX.writeFile(wb, `Danh_Sach_MMTB_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const hasActiveFilter =
    !!search ||
    !!filterMachineName ||
    !!filterFactoryId ||
    !!filterAreaId ||
    !!filterLineId ||
    !!filterTeamId ||
    !!filterStatusId ||
    !!filterMachineTypeId;

  function clearFilters() {
    setSearch('');
    setFilterMachineName('');
    setFilterFactoryId('');
    setFilterAreaId('');
    setFilterLineId('');
    setFilterTeamId('');
    setFilterStatusId('');
    setFilterMachineTypeId('');
  }

  function openCreateForm() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(m: Machine) {
    setEditingId(m.id);
    setFormData({
      code: m.code,
      name: m.name,
      location: m.zone,
      serialNumber: m.serial ?? '',
      factoryId: m.factoryId ?? '',
      areaId: m.areaId ?? '',
      lineId: m.lineId ?? '',
      teamId: m.teamId ?? '',
      machineTypeId: m.machineTypeId ?? '',
      statusId: m.statusId,
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim() || !formData.location.trim() || !formData.areaId || !formData.statusId) {
      setFormError('Thiếu Mã tài sản / Tên máy / Vị trí / Khu vực / Trạng thái');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        location: formData.location.trim(),
        serialNumber: formData.serialNumber.trim() || null,
        areaId: formData.areaId,
        teamId: formData.teamId || null,
        productionLineId: formData.lineId || null,
        machineTypeId: formData.machineTypeId || null,
        statusId: formData.statusId,
      };
      const url = editingId ? `/api/mmtb-kg/machines/${editingId}` : '/api/mmtb-kg/machines';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) {
        setFormError(result.error || 'Không lưu được máy');
        return;
      }
      closeForm();
      await load();
    } catch {
      setFormError('Không kết nối được tới hệ thống MMTB');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(m: Machine) {
    if (!confirm(`Xoá máy "${m.name}" (${m.code})? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(m.id);
    try {
      const res = await fetch(`/api/mmtb-kg/machines/${m.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Không xoá được máy');
        return;
      }
      await load();
    } catch {
      alert('Không kết nối được tới hệ thống MMTB');
    } finally {
      setDeletingId(null);
    }
  }

  function handleDownloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      [...IMPORT_TEMPLATE_HEADERS],
      ['VD-001', 'Máy ép đế', 'Xưởng 1 - Chuyền 2', 'SN123456', 'KG1', 'Xưởng 1', 'Chuyền 2', 'Tổ 3', 'Máy ép', 'Sử dụng'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_May');
    XLSX.writeFile(wb, 'Mau_Nhap_May_MMTB.xlsx');
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
    e.target.value = ''; // cho phép chọn lại cùng 1 file lần sau
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
          const rowNumber = idx + 2; // hàng 1 là header
          const code = String(r['Mã tài sản'] ?? '').trim();
          const name = String(r['Tên máy'] ?? '').trim();
          const location = String(r['Vị trí'] ?? '').trim();
          const serial = String(r['Số Serial'] ?? '').trim();
          const label = `Dòng ${rowNumber}${code ? ` (${code})` : ''}`;

          if (!code || !name || !location) {
            errRows.push({ rowNumber, label, message: 'Thiếu Mã tài sản / Tên máy / Vị trí' });
            return;
          }

          const factory = findByName(filterOptions.factories, String(r['Nhà máy'] ?? ''));
          const area = findByName(filterOptions.areas, String(r['Khu vực'] ?? ''), factory?.id);
          if (!area) {
            errRows.push({ rowNumber, label, message: `Không tìm thấy Khu vực "${r['Khu vực']}"` });
            return;
          }
          const line = findByName(filterOptions.productionLines, String(r['Chuyền'] ?? ''), area.id);
          const team = findByName(filterOptions.teams, String(r['Tổ'] ?? ''), line?.id);
          const machineType = findByName(filterOptions.machineTypes, String(r['Phân loại máy'] ?? ''), factory?.id);
          const status = findByName(filterOptions.statuses, String(r['Trạng thái'] ?? ''));
          if (!status) {
            errRows.push({ rowNumber, label, message: `Không tìm thấy Trạng thái "${r['Trạng thái']}"` });
            return;
          }

          okRows.push({
            rowNumber,
            label,
            payload: {
              code,
              name,
              location,
              serialNumber: serial || null,
              areaId: area.id,
              teamId: team?.id ?? null,
              productionLineId: line?.id ?? null,
              machineTypeId: machineType?.id ?? null,
              statusId: status.id,
            },
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
        const res = await fetch('/api/mmtb-kg/machines', {
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
    <MaintenanceShell title="Danh Sách MMTB" subtitle={`${filtered.length} máy — Tổ hợp Kiên Giang`}>
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">Danh Sách MMTB</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateForm}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-tbs-dark text-white text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer"
          >
            <IconPlus size={15} /> Thêm Máy
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportFileChange}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-md cursor-pointer"
          >
            <IconFileSpreadsheet size={15} /> Nhập Excel
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-2.5 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Tải mẫu
          </button>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light transition shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ⬇ Xuất Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* 5 Ô TỔNG QUAN — giống hàng đầu trang Tổng quan bên tbsMayMoc */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Tổng số MMTB', value: statusStats.total, icon: IconDeviceLaptop, bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
          { label: 'Sử dụng', value: statusStats.suDung, icon: IconCircleCheck, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
          { label: 'Chưa sử dụng', value: statusStats.chuaSuDung, icon: IconCircleDashed, bg: 'bg-slate-100', iconBg: 'bg-slate-200', text: 'text-slate-500' },
          { label: 'Không sử dụng', value: statusStats.khongSuDung, icon: IconAlertTriangle, bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
          { label: 'Đề nghị thanh lý', value: statusStats.deNghiThanhLy, icon: IconTrash, bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600' },
        ].map((c) => (
          <div key={c.label} className={`flex items-center gap-3 rounded-2xl ${c.bg} p-4 shadow-sm`}>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${c.iconBg}`}>
              <c.icon size={22} className={c.text} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-2xl font-extrabold text-tbs-dark">{c.value}</div>
              <div className="truncate text-xs font-semibold text-gray-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* BỘ LỌC */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã tài sản, tên máy, tổ, chuyền..."
          className="min-w-[220px] flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
        />
        <FilterSelect
          value={filterMachineName}
          onChange={setFilterMachineName}
          options={machineNameOptions.map((name) => ({ id: name, name }))}
          placeholder="Tất cả tên máy"
        />
        <FilterSelect
          value={filterFactoryId}
          onChange={(v) => {
            setFilterFactoryId(v);
            setFilterAreaId('');
            setFilterLineId('');
            setFilterTeamId('');
          }}
          options={filterOptions.factories}
          placeholder="Tất cả nhà máy"
        />
        <FilterSelect
          value={filterAreaId}
          onChange={(v) => {
            setFilterAreaId(v);
            setFilterLineId('');
            setFilterTeamId('');
          }}
          options={filterOptions.areas.filter((a) => !filterFactoryId || a.parentId === filterFactoryId)}
          placeholder={filterFactoryId ? 'Tất cả khu vực' : 'Chọn nhà máy trước'}
          disabled={!filterFactoryId}
        />
        <FilterSelect
          value={filterLineId}
          onChange={(v) => {
            setFilterLineId(v);
            setFilterTeamId('');
          }}
          options={filterOptions.productionLines.filter((l) => !filterAreaId || l.parentId === filterAreaId)}
          placeholder={filterAreaId ? 'Tất cả chuyền' : 'Chọn khu vực trước'}
          disabled={!filterAreaId}
        />
        <FilterSelect
          value={filterTeamId}
          onChange={setFilterTeamId}
          options={filterOptions.teams.filter((t) => !filterLineId || t.parentId === filterLineId)}
          placeholder={filterLineId ? 'Tất cả tổ' : 'Chọn chuyền trước'}
          disabled={!filterLineId}
        />
        <FilterSelect
          value={filterMachineTypeId}
          onChange={setFilterMachineTypeId}
          options={filterOptions.machineTypes.filter((mt) => !filterFactoryId || mt.parentId === filterFactoryId)}
          placeholder="Tất cả phân loại máy"
        />
        <FilterSelect
          value={filterStatusId}
          onChange={setFilterStatusId}
          options={filterOptions.statuses}
          placeholder="Tất cả trạng thái"
        />
        {hasActiveFilter && (
          <button onClick={clearFilters} className="text-xs font-bold text-gray-500 hover:text-tbs-dark underline">
            Xoá bộ lọc
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100 whitespace-nowrap">
              <th className="p-4">Mã Tài Sản</th>
              <th className="p-4">Tên Máy</th>
              <th className="p-4">Nhà Máy</th>
              <th className="p-4">Khu Vực / Xưởng</th>
              <th className="p-4">Tổ</th>
              <th className="p-4">Chuyền</th>
              <th className="p-4">Phân Loại Máy</th>
              <th className="p-4">Trạng Thái</th>
              <th className="p-4 text-right">Nguyên Giá</th>
              <th className="p-4 text-right">Đánh Giá %</th>
              <th className="p-4 text-right">Trị Giá Còn Lại</th>
              <th className="p-4 text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700 whitespace-nowrap">
            {loading && (
              <tr>
                <td className="p-4 text-gray-400" colSpan={12}>Đang tải...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && !error && (
              <tr>
                <td className="p-4 text-gray-400" colSpan={12}>
                  {machines.length === 0 ? 'Chưa có máy nào trong phạm vi Tổ hợp KG' : 'Không tìm thấy máy phù hợp'}
                </td>
              </tr>
            )}
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/80 transition">
                <td className="p-4 font-mono font-bold text-accent">{m.code}</td>
                <td className="p-4 font-semibold text-tbs-dark">{m.name}</td>
                <td className="p-4">{m.factoryName ?? '-'}</td>
                <td className="p-4">{m.areaName ?? '-'}</td>
                <td className="p-4">{m.teamName ?? '-'}</td>
                <td className="p-4">{m.lineName ?? '-'}</td>
                <td className="p-4">{m.machineTypeName ?? '-'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 font-bold rounded ${statusBadgeClass(m.statusName)}`}>
                    {m.statusName}
                  </span>
                </td>
                <td className="p-4 text-right font-mono">{formatMoney(m.originalCost)}</td>
                <td className="p-4 text-right font-mono">
                  {m.depreciationPercent != null ? `${m.depreciationPercent}%` : '-'}
                </td>
                <td className="p-4 text-right font-mono">{formatMoney(m.remainingValue)}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => setSelectedQR(m.qrData)}
                      className="px-3 py-1 bg-emerald-100 text-accent font-bold rounded-lg hover:bg-emerald-200"
                    >
                      Mã QR
                    </button>
                    <button
                      onClick={() => openEditForm(m)}
                      title="Sửa"
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      <IconPencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(m)}
                      disabled={deletingId === m.id}
                      title="Xoá"
                      className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 disabled:opacity-40"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR MODAL */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-tbs-dark">Mã QR Dán Trên Máy</h3>
            <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-accent rounded-2xl flex flex-col items-center justify-center p-3 shadow-inner overflow-hidden">
              {qrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- ảnh QR sinh động (data URL), không phải asset tĩnh, không dùng next/image được
                <img src={qrImageUrl} alt={`Mã QR máy ${selectedQR}`} className="w-full h-full object-contain" />
              ) : (
                <div className="text-xs text-gray-400">Đang tạo mã QR...</div>
              )}
            </div>
            <div className="font-mono text-xs font-bold text-accent">{selectedQR}</div>
            <div className="flex gap-2">
              {qrImageUrl && (
                <a
                  href={qrImageUrl}
                  download={`QR_${selectedQR}.png`}
                  className="flex-1 py-2.5 bg-accent text-white rounded-xl font-bold text-xs hover:bg-accent-light"
                >
                  ⬇ Tải Về
                </a>
              )}
              <button
                onClick={() => setSelectedQR(null)}
                className="flex-1 py-2.5 bg-tbs-dark text-white rounded-xl font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NHẬP EXCEL — xem trước dòng hợp lệ/lỗi trước khi ghi thật vào tbsMayMoc */}
      {importOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-tbs-dark">Nhập Excel — Xem Trước</h3>
            <p className="text-xs text-gray-500">
              <span className="font-bold text-emerald-600">{importRows.length} dòng hợp lệ</span>
              {importRowErrors.length > 0 && (
                <> · <span className="font-bold text-rose-600">{importRowErrors.length} dòng lỗi</span></>
              )}
            </p>

            {importRowErrors.length > 0 && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 space-y-1 max-h-40 overflow-y-auto">
                {importRowErrors.map((e) => (
                  <div key={e.rowNumber} className="text-xs text-rose-700">
                    <span className="font-bold">{e.label}:</span> {e.message}
                  </div>
                ))}
              </div>
            )}

            {importRows.length > 0 && (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 font-semibold text-gray-500">
                      <th className="p-2.5">Dòng</th>
                      <th className="p-2.5">Mã tài sản</th>
                      <th className="p-2.5">Tên máy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importRows.map((r) => (
                      <tr key={r.rowNumber}>
                        <td className="p-2.5 text-gray-400">{r.rowNumber}</td>
                        <td className="p-2.5 font-mono font-bold text-accent">{r.payload.code}</td>
                        <td className="p-2.5">{r.payload.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setImportOpen(false); setImportRows([]); setImportRowErrors([]); }}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={async () => { await handleImportSubmit(); setImportOpen(false); }}
                disabled={importRows.length === 0 || importSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {importSubmitting ? 'Đang nhập...' : `Nhập ${importRows.length} máy`}
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
              <span className="font-bold text-emerald-600">{importResult.success} máy đã thêm thành công</span>
              {importResult.failed.length > 0 && (
                <span className="font-bold text-rose-600"> · {importResult.failed.length} thất bại</span>
              )}
            </p>
            {importResult.failed.length > 0 && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 space-y-1 max-h-52 overflow-y-auto">
                {importResult.failed.map((f, i) => (
                  <div key={i} className="text-xs text-rose-700">{f}</div>
                ))}
              </div>
            )}
            <button
              onClick={() => setImportResult(null)}
              className="w-full py-2.5 bg-tbs-dark text-white rounded-xl font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* FORM THÊM/SỬA MÁY */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-bold text-lg text-tbs-dark">{editingId ? 'Sửa Máy' : 'Thêm Máy Mới'}</h3>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                ⚠️ {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Mã tài sản *</span>
                <input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Tên máy *</span>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1 sm:col-span-2">
                <span>Vị trí *</span>
                <input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Số Serial</span>
                <input
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Trạng thái *</span>
                <select
                  value={formData.statusId}
                  onChange={(e) => setFormData({ ...formData, statusId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal"
                  required
                >
                  <option value="">-- Chọn trạng thái --</option>
                  {filterOptions.statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Nhà máy</span>
                <FilterSelect
                  value={formData.factoryId}
                  onChange={(v) => setFormData({ ...formData, factoryId: v, areaId: '', lineId: '', teamId: '' })}
                  options={filterOptions.factories}
                  placeholder="-- Chọn nhà máy --"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal disabled:opacity-50"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Khu vực *</span>
                <FilterSelect
                  value={formData.areaId}
                  onChange={(v) => setFormData({ ...formData, areaId: v, lineId: '', teamId: '' })}
                  options={filterOptions.areas.filter((a) => !formData.factoryId || a.parentId === formData.factoryId)}
                  placeholder={formData.factoryId ? '-- Chọn khu vực --' : 'Chọn nhà máy trước'}
                  disabled={!formData.factoryId}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal disabled:opacity-50"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Chuyền</span>
                <FilterSelect
                  value={formData.lineId}
                  onChange={(v) => setFormData({ ...formData, lineId: v, teamId: '' })}
                  options={filterOptions.productionLines.filter((l) => !formData.areaId || l.parentId === formData.areaId)}
                  placeholder={formData.areaId ? '-- Chọn chuyền --' : 'Chọn khu vực trước'}
                  disabled={!formData.areaId}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal disabled:opacity-50"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Tổ</span>
                <FilterSelect
                  value={formData.teamId}
                  onChange={(v) => setFormData({ ...formData, teamId: v })}
                  options={filterOptions.teams.filter((t) => !formData.lineId || t.parentId === formData.lineId)}
                  placeholder={formData.lineId ? '-- Chọn tổ --' : 'Chọn chuyền trước'}
                  disabled={!formData.lineId}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal disabled:opacity-50"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 space-y-1">
                <span>Phân loại máy</span>
                <FilterSelect
                  value={formData.machineTypeId}
                  onChange={(v) => setFormData({ ...formData, machineTypeId: v })}
                  options={filterOptions.machineTypes.filter((mt) => !formData.factoryId || mt.parentId === formData.factoryId)}
                  placeholder="-- Chọn phân loại --"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal disabled:opacity-50"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light disabled:opacity-50"
              >
                {submitting ? 'Đang lưu...' : editingId ? 'Lưu Thay Đổi' : 'Thêm Máy'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </MaintenanceShell>
  );
}
