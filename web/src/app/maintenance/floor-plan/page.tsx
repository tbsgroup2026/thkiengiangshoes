'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconMapPin, IconPinned, IconPlus, IconTrash, IconPencil, IconUpload,
  IconVector, IconRoute, IconCurrentLocation, IconShieldCheck, IconX,
} from '@tabler/icons-react';
import MaintenanceShell from '@/components/MaintenanceShell';
import FilterSelect from '@/components/FilterSelect';

type CategoryOption = { id: string; name: string };
type Floor = { id: string; factoryId: string; name: string; floorPlanImageUrl: string | null; order: number };
type Area = { id: string; name: string; floorId: string | null; boundaryPoints: { x: number; y: number }[] | null };
type LineOrTeam = { id: string; name: string; parentId: string; mapX: number | null; mapY: number | null };
type Factory = { id: string; name: string; geofenceLat: number | null; geofenceLng: number | null; geofenceRadius: number | null };
type GeoRefPoint = { id: string; floorId: string; mapXPercent: number; mapYPercent: number; latitude: number; longitude: number; label: string | null };
type MapPathSeg = { id: string; floorId: string; points: { x: number; y: number }[]; label: string | null };

type FloorPlanMachine = {
  id: string; code: string; name: string; statusName: string; statusColorHex: string | null;
  areaId: string; areaName: string; floorId: string; hasOwnPin: boolean;
  position: { type: 'point'; mapX: number; mapY: number } | { type: 'area'; boundaryPoints: { x: number; y: number }[] } | null;
};

type Mode = 'view' | 'pin-machine' | 'draw-area' | 'draw-path' | 'add-georef' | 'pin-default';

const MODES: { key: Mode; label: string; icon: typeof IconPinned }[] = [
  { key: 'view', label: 'Xem', icon: IconMapPin },
  { key: 'pin-machine', label: 'Ghim Máy', icon: IconPinned },
  { key: 'draw-area', label: 'Vẽ Vùng Xưởng', icon: IconVector },
  { key: 'pin-default', label: 'Ghim Mặc Định', icon: IconPinned },
  { key: 'draw-path', label: 'Vẽ Đường Đi', icon: IconRoute },
  { key: 'add-georef', label: 'Điểm GPS', icon: IconCurrentLocation },
];

// Sơ Đồ Nhà Máy — đầy đủ như tbsMayMoc: quản lý Tầng (tạo/xoá/đổi tên/tải ảnh), ghim vị trí máy,
// vẽ vùng khoanh Xưởng, ghim điểm mặc định Chuyền/Tổ, vẽ Đường đi (đồ thị hành lang), điểm hiệu
// chỉnh GPS, và vùng khuôn viên Nhà máy (geofence) — tất cả thêm/sửa/xoá được ngay tại đây, ghi
// thẳng vào tbsMayMoc, không lưu gì riêng ở thkiengiangshoes.
export default function FloorPlanPage() {
  const [factories, setFactories] = useState<CategoryOption[]>([]);
  const [factoryId, setFactoryId] = useState('');
  const [factory, setFactory] = useState<Factory | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [machines, setMachines] = useState<FloorPlanMachine[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [lines, setLines] = useState<LineOrTeam[]>([]);
  const [teams, setTeams] = useState<LineOrTeam[]>([]);
  const [floorId, setFloorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>('view');
  const [selectedMachine, setSelectedMachine] = useState<FloorPlanMachine | null>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Ghim máy
  const [pinMachineId, setPinMachineId] = useState('');

  // Vẽ vùng Xưởng
  const [drawAreaId, setDrawAreaId] = useState('');
  const [drawAreaPoints, setDrawAreaPoints] = useState<{ x: number; y: number }[]>([]);

  // Ghim mặc định Chuyền/Tổ
  const [pinDefaultType, setPinDefaultType] = useState<'LINE' | 'TEAM'>('LINE');
  const [pinDefaultId, setPinDefaultId] = useState('');

  // Vẽ đường đi
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [pathLabel, setPathLabel] = useState('');
  const [paths, setPaths] = useState<MapPathSeg[]>([]);
  const [savingPath, setSavingPath] = useState(false);

  // Điểm GPS
  const [georefPoints, setGeorefPoints] = useState<GeoRefPoint[]>([]);
  const [pendingGeoPoint, setPendingGeoPoint] = useState<{ x: number; y: number } | null>(null);
  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');
  const [geoLabel, setGeoLabel] = useState('');
  const [savingGeo, setSavingGeo] = useState(false);

  // Geofence + quản lý Tầng
  const [showGeofenceForm, setShowGeofenceForm] = useState(false);
  const [geofenceLat, setGeofenceLat] = useState('');
  const [geofenceLng, setGeofenceLng] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState('');
  const [showFloorForm, setShowFloorForm] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');
  const [renamingFloor, setRenamingFloor] = useState(false);
  const [floorNameDraft, setFloorNameDraft] = useState('');
  const [savingFloor, setSavingFloor] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch('/api/mmtb-kg/categories?type=FACTORY')
      .then((r) => r.json())
      .then((r) => { if (r.success) setFactories(r.data || []); });
  }, []);

  const loadFloorPlan = async (fid: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/mmtb-kg/floor-plan?factoryId=${fid}`);
      const result = await res.json();
      if (result.success) {
        setFactory(result.factory ?? null);
        setFloors(result.floors || []);
        setMachines(result.machines || []);
        setAreas(result.areas || []);
        setLines(result.productionLines || []);
        setTeams(result.teams || []);
        setFloorId((prev) => (result.floors?.some((f: Floor) => f.id === prev) ? prev : (result.floors || [])[0]?.id ?? ''));
      } else {
        setError(result.error || 'Không lấy được dữ liệu');
      }
    } catch (err) {
      console.warn('Failed to fetch floor-plan from tbsMayMoc:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!factoryId) { setFloors([]); setMachines([]); setAreas([]); setFloorId(''); setFactory(null); return; }
    loadFloorPlan(factoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factoryId]);

  const currentFloor = floors.find((f) => f.id === floorId) ?? null;
  const floorMachines = useMemo(() => machines.filter((m) => m.floorId === floorId), [machines, floorId]);
  const pointMachines = floorMachines.filter((m) => m.position?.type === 'point');
  const floorAreas = useMemo(() => areas.filter((a) => a.floorId === floorId), [areas, floorId]);
  const pinnableOptions = floorMachines.map((m) => ({ id: m.id, name: `${m.name} (${m.code})` }));

  // Reset trạng thái vẽ dở khi đổi Tầng/đổi chế độ.
  useEffect(() => {
    setDrawAreaPoints([]);
    setPathPoints([]);
    setPendingGeoPoint(null);
  }, [floorId, mode]);

  useEffect(() => {
    if (mode !== 'draw-path' || !floorId) { setPaths([]); return; }
    fetch(`/api/mmtb-kg/map-path?floorId=${floorId}`).then((r) => r.json()).then((r) => { if (r.success) setPaths(r.data || []); });
  }, [mode, floorId]);

  useEffect(() => {
    if (mode !== 'add-georef' || !floorId) { setGeorefPoints([]); return; }
    fetch(`/api/mmtb-kg/map-georef?floorId=${floorId}`).then((r) => r.json()).then((r) => { if (r.success) setGeorefPoints(r.data || []); });
  }, [mode, floorId]);

  function pctFromClick(e: React.MouseEvent<HTMLDivElement>): { x: number; y: number } | null {
    if (!imgWrapRef.current) return null;
    const rect = imgWrapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
  }

  async function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    const pt = pctFromClick(e);
    if (!pt) return;

    if (mode === 'pin-machine' && pinMachineId) {
      const res = await fetch(`/api/mmtb-kg/machines/${pinMachineId}/position`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mapX: pt.x, mapY: pt.y }),
      });
      const result = await res.json();
      if (!result.success) return alert(result.error || 'Không ghim được vị trí');
      setMachines((prev) => prev.map((m) => (m.id === pinMachineId ? { ...m, hasOwnPin: true, position: { type: 'point', mapX: pt.x, mapY: pt.y } } : m)));
      return;
    }

    if (mode === 'draw-area' && drawAreaId) {
      setDrawAreaPoints((prev) => [...prev, pt]);
      return;
    }

    if (mode === 'draw-path') {
      setPathPoints((prev) => [...prev, pt]);
      return;
    }

    if (mode === 'add-georef') {
      setPendingGeoPoint(pt);
      return;
    }

    if (mode === 'pin-default' && pinDefaultId) {
      const res = await fetch(`/api/mmtb-kg/default-pin/${pinDefaultId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mapX: pt.x, mapY: pt.y }),
      });
      const result = await res.json();
      if (!result.success) return alert(result.error || 'Không ghim được');
      const setter = pinDefaultType === 'LINE' ? setLines : setTeams;
      setter((prev) => prev.map((l) => (l.id === pinDefaultId ? { ...l, mapX: pt.x, mapY: pt.y } : l)));
    }
  }

  async function handleSaveAreaBoundary() {
    if (!drawAreaId || drawAreaPoints.length < 3) return alert('Cần tối thiểu 3 điểm để tạo 1 vùng khoanh');
    const res = await fetch(`/api/mmtb-kg/area-boundary/${drawAreaId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boundaryPoints: drawAreaPoints }),
    });
    const result = await res.json();
    if (!result.success) return alert(result.error || 'Không lưu được vùng khoanh');
    setAreas((prev) => prev.map((a) => (a.id === drawAreaId ? { ...a, boundaryPoints: drawAreaPoints } : a)));
    setDrawAreaPoints([]);
  }

  async function handleClearAreaBoundary() {
    if (!drawAreaId) return;
    if (!confirm('Xoá vùng khoanh của khu vực này?')) return;
    const res = await fetch(`/api/mmtb-kg/area-boundary/${drawAreaId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boundaryPoints: null }),
    });
    const result = await res.json();
    if (!result.success) return alert(result.error || 'Không xoá được');
    setAreas((prev) => prev.map((a) => (a.id === drawAreaId ? { ...a, boundaryPoints: null } : a)));
    setDrawAreaPoints([]);
  }

  async function handleSavePath() {
    if (pathPoints.length < 2) return alert('Cần tối thiểu 2 điểm để tạo 1 đoạn đường đi');
    setSavingPath(true);
    try {
      const res = await fetch('/api/mmtb-kg/map-path', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ floorId, points: pathPoints, label: pathLabel.trim() || null }),
      });
      const result = await res.json();
      if (!result.success) return alert(result.error || 'Không lưu được đường đi');
      setPaths((prev) => [...prev, result.data]);
      setPathPoints([]);
      setPathLabel('');
    } finally {
      setSavingPath(false);
    }
  }

  async function handleDeletePath(id: string) {
    if (!confirm('Xoá đoạn đường đi này?')) return;
    const res = await fetch(`/api/mmtb-kg/map-path/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) return alert(result.error || 'Không xoá được');
    setPaths((prev) => prev.filter((p) => p.id !== id));
  }

  function fillCurrentLocation(setLat: (v: string) => void, setLng: (v: string) => void) {
    if (!navigator.geolocation) return alert('Trình duyệt không hỗ trợ định vị GPS');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(String(pos.coords.latitude)); setLng(String(pos.coords.longitude)); },
      () => alert('Không lấy được vị trí GPS hiện tại'),
    );
  }

  async function handleSaveGeoPoint() {
    if (!pendingGeoPoint || !geoLat || !geoLng) return;
    setSavingGeo(true);
    try {
      const res = await fetch('/api/mmtb-kg/map-georef', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          floorId, mapXPercent: pendingGeoPoint.x, mapYPercent: pendingGeoPoint.y,
          latitude: Number(geoLat), longitude: Number(geoLng), label: geoLabel.trim() || null,
        }),
      });
      const result = await res.json();
      if (!result.success) return alert(result.error || 'Không lưu được điểm GPS');
      setGeorefPoints((prev) => [...prev, result.data]);
      setPendingGeoPoint(null);
      setGeoLat(''); setGeoLng(''); setGeoLabel('');
    } finally {
      setSavingGeo(false);
    }
  }

  async function handleDeleteGeoPoint(id: string) {
    if (!confirm('Xoá điểm hiệu chỉnh GPS này?')) return;
    const res = await fetch(`/api/mmtb-kg/map-georef/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) return alert(result.error || 'Không xoá được');
    setGeorefPoints((prev) => prev.filter((p) => p.id !== id));
  }

  function openGeofenceForm() {
    setGeofenceLat(factory?.geofenceLat != null ? String(factory.geofenceLat) : '');
    setGeofenceLng(factory?.geofenceLng != null ? String(factory.geofenceLng) : '');
    setGeofenceRadius(factory?.geofenceRadius != null ? String(factory.geofenceRadius) : '');
    setShowGeofenceForm(true);
  }

  async function handleSaveGeofence() {
    if (!factoryId) return;
    const res = await fetch(`/api/mmtb-kg/geofence/${factoryId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        geofenceLat: geofenceLat ? Number(geofenceLat) : null,
        geofenceLng: geofenceLng ? Number(geofenceLng) : null,
        geofenceRadius: geofenceRadius ? Number(geofenceRadius) : null,
      }),
    });
    const result = await res.json();
    if (!result.success) return alert(result.error || 'Không lưu được vùng khuôn viên');
    setFactory((prev) => (prev ? { ...prev, geofenceLat: geofenceLat ? Number(geofenceLat) : null, geofenceLng: geofenceLng ? Number(geofenceLng) : null, geofenceRadius: geofenceRadius ? Number(geofenceRadius) : null } : prev));
    setShowGeofenceForm(false);
  }

  async function handleCreateFloor(e: React.FormEvent) {
    e.preventDefault();
    if (!newFloorName.trim() || !factoryId) return;
    setSavingFloor(true);
    try {
      const res = await fetch('/api/mmtb-kg/floors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factoryId, name: newFloorName.trim() }),
      });
      const result = await res.json();
      if (!result.success) return alert(result.error || 'Không tạo được Tầng');
      setShowFloorForm(false);
      setNewFloorName('');
      await loadFloorPlan(factoryId);
      setFloorId(result.data.id);
    } finally {
      setSavingFloor(false);
    }
  }

  async function handleRenameFloor() {
    if (!currentFloor || !floorNameDraft.trim()) return;
    const res = await fetch(`/api/mmtb-kg/floors/${currentFloor.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: floorNameDraft.trim() }),
    });
    const result = await res.json();
    if (!result.success) return alert(result.error || 'Không đổi được tên');
    setFloors((prev) => prev.map((f) => (f.id === currentFloor.id ? { ...f, name: floorNameDraft.trim() } : f)));
    setRenamingFloor(false);
  }

  async function handleDeleteFloor() {
    if (!currentFloor) return;
    if (!confirm(`Xoá Tầng "${currentFloor.name}"? Toàn bộ vùng khoanh/đường đi/điểm GPS của Tầng này cũng bị xoá.`)) return;
    const res = await fetch(`/api/mmtb-kg/floors/${currentFloor.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) return alert(result.error || 'Không xoá được Tầng');
    await loadFloorPlan(factoryId);
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !currentFloor) return;
    setUploadingImage(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const uploadRes = await fetch('/api/mmtb-kg/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64, mimeType: file.type }),
      });
      const uploadResult = await uploadRes.json();
      if (!uploadResult.success) return alert(uploadResult.error || 'Tải ảnh lên thất bại');
      const res = await fetch(`/api/mmtb-kg/floors/${currentFloor.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ floorPlanImageUrl: uploadResult.url }),
      });
      const result = await res.json();
      if (!result.success) return alert(result.error || 'Không lưu được ảnh');
      setFloors((prev) => prev.map((f) => (f.id === currentFloor.id ? { ...f, floorPlanImageUrl: uploadResult.url } : f)));
    } finally {
      setUploadingImage(false);
    }
  }

  const pinDefaultOptions = pinDefaultType === 'LINE' ? lines : teams;

  return (
    <MaintenanceShell title="Sơ Đồ Nhà Máy" subtitle="Ảnh sơ đồ, vùng khoanh, đường đi, điểm GPS, ghim máy — Tổ hợp Kiên Giang">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-tbs-dark">Sơ Đồ Nhà Máy</h1>
            <p className="text-xs text-gray-500 mt-1">Đầy đủ như tbsMayMoc — sửa ở đây không ảnh hưởng giao diện tbsMayMoc</p>
          </div>
          {factoryId && (
            <button onClick={openGeofenceForm} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-xs font-bold hover:opacity-90">
              <IconShieldCheck size={15} /> Vùng Khuôn Viên
            </button>
          )}
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-0.5">Nhà máy:</span>
          {factories.map((f) => (
            <button
              key={f.id}
              onClick={() => setFactoryId(f.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${factoryId === f.id ? 'bg-accent text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {f.name}
            </button>
          ))}
          {factoryId && floors.length > 0 && <span className="w-px h-6 bg-gray-200 mx-1" />}
          {floors.map((f) => (
            <button
              key={f.id}
              onClick={() => setFloorId(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${floorId === f.id ? 'bg-tbs-dark text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {f.name}
            </button>
          ))}
          {factoryId && (
            <button onClick={() => setShowFloorForm(true)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-accent hover:bg-emerald-100">
              <IconPlus size={13} /> Thêm Tầng
            </button>
          )}
        </div>

        {currentFloor && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
            {renamingFloor ? (
              <>
                <input value={floorNameDraft} onChange={(e) => setFloorNameDraft(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs" autoFocus />
                <button onClick={handleRenameFloor} className="px-3 py-2 rounded-xl text-xs font-bold bg-accent text-white">Lưu</button>
                <button onClick={() => setRenamingFloor(false)} className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-500">Huỷ</button>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-gray-500">Tầng: {currentFloor.name}</span>
                <button onClick={() => { setRenamingFloor(true); setFloorNameDraft(currentFloor.name); }} title="Đổi tên" className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                  <IconPencil size={13} />
                </button>
                <button onClick={handleDeleteFloor} title="Xoá Tầng" className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                  <IconTrash size={13} />
                </button>
              </>
            )}
            <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
            <button
              onClick={() => uploadInputRef.current?.click()}
              disabled={uploadingImage}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <IconUpload size={14} /> {uploadingImage ? 'Đang tải...' : currentFloor.floorPlanImageUrl ? 'Đổi Ảnh Sơ Đồ' : 'Tải Ảnh Sơ Đồ'}
            </button>
          </div>
        )}

        {!factoryId && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Chọn nhà máy để xem sơ đồ</div>}
        {factoryId && loading && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Đang tải...</div>}
        {factoryId && !loading && floors.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-xs text-gray-400">Nhà máy này chưa có Tầng nào — bấm &quot;Thêm Tầng&quot; ở trên</div>
        )}

        {currentFloor?.floorPlanImageUrl && (
          <>
            {/* THANH CHẾ ĐỘ */}
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${mode === m.key ? 'bg-tbs-dark text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>

            {/* Ô ĐIỀU KHIỂN THEO CHẾ ĐỘ */}
            {mode === 'pin-machine' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
                <FilterSelect value={pinMachineId} onChange={setPinMachineId} options={pinnableOptions} placeholder="-- Chọn máy cần ghim --" />
                <span className="text-[11px] text-gray-400">{pinMachineId ? '👉 Bấm vào ảnh để ghim' : 'Chọn máy rồi bấm vào ảnh'}</span>
              </div>
            )}
            {mode === 'draw-area' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
                <FilterSelect value={drawAreaId} onChange={(v) => { setDrawAreaId(v); setDrawAreaPoints([]); }} options={floorAreas} placeholder="-- Chọn khu vực --" />
                {drawAreaId && (
                  <>
                    <span className="text-[11px] text-gray-400">Đã chọn {drawAreaPoints.length} điểm (cần tối thiểu 3)</span>
                    <button onClick={() => setDrawAreaPoints((p) => p.slice(0, -1))} disabled={drawAreaPoints.length === 0} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-500 disabled:opacity-40">Xoá điểm cuối</button>
                    <button onClick={handleSaveAreaBoundary} disabled={drawAreaPoints.length < 3} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-accent text-white disabled:opacity-40">Lưu Vùng</button>
                    <button onClick={handleClearAreaBoundary} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600">Xoá Vùng Hiện Có</button>
                  </>
                )}
              </div>
            )}
            {mode === 'pin-default' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
                <select value={pinDefaultType} onChange={(e) => { setPinDefaultType(e.target.value as 'LINE' | 'TEAM'); setPinDefaultId(''); }} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold">
                  <option value="LINE">Chuyền</option>
                  <option value="TEAM">Tổ</option>
                </select>
                <FilterSelect value={pinDefaultId} onChange={setPinDefaultId} options={pinDefaultOptions} placeholder={`-- Chọn ${pinDefaultType === 'LINE' ? 'Chuyền' : 'Tổ'} --`} />
                <span className="text-[11px] text-gray-400">{pinDefaultId ? '👉 Bấm vào ảnh để ghim điểm mặc định' : 'Chọn 1 mục rồi bấm vào ảnh'}</span>
              </div>
            )}
            {mode === 'draw-path' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] text-gray-400">Đã chọn {pathPoints.length} điểm (cần tối thiểu 2) — bấm liên tiếp vào ảnh để nối đoạn</span>
                <input value={pathLabel} onChange={(e) => setPathLabel(e.target.value)} placeholder="Nhãn đoạn đường (VD: Hành lang chính)" className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs flex-1 min-w-[160px]" />
                <button onClick={() => setPathPoints((p) => p.slice(0, -1))} disabled={pathPoints.length === 0} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-500 disabled:opacity-40">Xoá điểm cuối</button>
                <button onClick={handleSavePath} disabled={pathPoints.length < 2 || savingPath} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-accent text-white disabled:opacity-40">{savingPath ? 'Đang lưu...' : 'Lưu Đoạn'}</button>
              </div>
            )}
            {mode === 'add-georef' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-[11px] text-gray-400">
                Bấm vào 1 điểm trên ảnh mà bạn biết chính xác toạ độ GPS thật (VD: cổng chính), rồi nhập toạ độ đó vào form hiện ra — cần tối thiểu 2 điểm/Tầng để App Mobile tính được hướng đi.
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-4 sm:p-5 space-y-3">
              <div
                ref={imgWrapRef}
                onClick={handleImageClick}
                className={`relative w-full rounded-xl overflow-hidden border border-gray-200 ${mode !== 'view' ? 'cursor-crosshair' : ''}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh sơ đồ động từ tbsMayMoc */}
                <img src={currentFloor.floorPlanImageUrl} alt={`Sơ đồ ${currentFloor.name}`} className="w-full h-auto block select-none" draggable={false} />

                {/* SVG overlay: vùng khoanh Xưởng + đường đi (viewBox 0-100 khớp % toạ độ) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {floorAreas.map((a) =>
                    a.boundaryPoints && a.boundaryPoints.length >= 3 ? (
                      <polygon
                        key={a.id}
                        points={a.boundaryPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                        fill={a.id === drawAreaId ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.12)'}
                        stroke={a.id === drawAreaId ? '#10b981' : '#3b82f6'}
                        strokeWidth={0.3}
                      />
                    ) : null,
                  )}
                  {mode === 'draw-area' && drawAreaPoints.length >= 2 && (
                    <polyline points={drawAreaPoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#10b981" strokeWidth={0.4} strokeDasharray="1,1" />
                  )}
                  {mode === 'draw-path' &&
                    paths.map((p) => (
                      <polyline key={p.id} points={p.points.map((pt) => `${pt.x},${pt.y}`).join(' ')} fill="none" stroke="#f59e0b" strokeWidth={0.4} />
                    ))}
                  {mode === 'draw-path' && pathPoints.length >= 2 && (
                    <polyline points={pathPoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#10b981" strokeWidth={0.4} strokeDasharray="1,1" />
                  )}
                </svg>

                {/* Chấm ghim máy — luôn hiện, trừ khi đang vẽ vùng/đường (đỡ rối mắt) */}
                {(mode === 'view' || mode === 'pin-machine') &&
                  pointMachines.map((m) => {
                    const pos = m.position as { type: 'point'; mapX: number; mapY: number };
                    return (
                      <button
                        key={m.id}
                        onClick={(e) => { e.stopPropagation(); if (mode === 'view') setSelectedMachine(m); }}
                        title={m.name}
                        className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition"
                        style={{ left: `${pos.mapX}%`, top: `${pos.mapY}%`, backgroundColor: m.statusColorHex || '#3b82f6' }}
                      />
                    );
                  })}

                {/* Điểm đang vẽ vùng/đường */}
                {mode === 'draw-area' && drawAreaPoints.map((p, i) => (
                  <span key={i} className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
                ))}
                {mode === 'draw-path' && pathPoints.map((p, i) => (
                  <span key={i} className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
                ))}

                {/* Điểm ghim mặc định Chuyền/Tổ */}
                {mode === 'pin-default' &&
                  pinDefaultOptions.map((l) =>
                    l.mapX != null && l.mapY != null ? (
                      <span
                        key={l.id}
                        title={l.name}
                        className={`absolute w-3 h-3 rounded-sm border-2 border-white -translate-x-1/2 -translate-y-1/2 ${l.id === pinDefaultId ? 'bg-emerald-500' : 'bg-violet-400'}`}
                        style={{ left: `${l.mapX}%`, top: `${l.mapY}%` }}
                      />
                    ) : null,
                  )}

                {/* Điểm GPS đã lưu */}
                {mode === 'add-georef' &&
                  georefPoints.map((p) => (
                    <span key={p.id} title={p.label || `${p.latitude}, ${p.longitude}`} className="absolute w-3 h-3 rounded-full bg-blue-500 border-2 border-white -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.mapXPercent}%`, top: `${p.mapYPercent}%` }} />
                  ))}
                {mode === 'add-georef' && pendingGeoPoint && (
                  <span className="absolute w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ left: `${pendingGeoPoint.x}%`, top: `${pendingGeoPoint.y}%` }} />
                )}
              </div>

              <div className="flex items-center gap-4 text-[11px] text-gray-500 flex-wrap">
                <span className="flex items-center gap-1.5"><IconMapPin size={13} /> {pointMachines.length} máy đã ghim vị trí</span>
                {mode === 'draw-path' && <span>{paths.length} đoạn đường đi đã vẽ</span>}
                {mode === 'add-georef' && <span>{georefPoints.length} điểm hiệu chỉnh GPS</span>}
              </div>
            </div>

            {/* DANH SÁCH ĐƯỜNG ĐI ĐÃ VẼ */}
            {mode === 'draw-path' && paths.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {paths.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs font-semibold text-tbs-dark">{p.label || 'Đoạn đường không tên'} <span className="text-gray-400 font-normal">({p.points.length} điểm)</span></span>
                    <button onClick={() => handleDeletePath(p.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                      <IconTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* DANH SÁCH ĐIỂM GPS */}
            {mode === 'add-georef' && georefPoints.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {georefPoints.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs font-semibold text-tbs-dark">{p.label || 'Điểm không tên'} <span className="text-gray-400 font-normal font-mono">— {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}</span></span>
                    <button onClick={() => handleDeleteGeoPoint(p.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                      <IconTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {currentFloor && !currentFloor.floorPlanImageUrl && (
          <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">Tầng này chưa có ảnh sơ đồ — bấm &quot;Tải Ảnh Sơ Đồ&quot; ở trên</div>
        )}
      </div>

      {/* MODAL: máy đã chọn */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedMachine(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold text-tbs-dark">{selectedMachine.name}</div>
            <div className="font-mono text-xs text-accent">{selectedMachine.code}</div>
            <div className="text-xs text-gray-500">{selectedMachine.areaName}</div>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: selectedMachine.statusColorHex || '#3b82f6' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedMachine.statusColorHex || '#3b82f6' }} />
              {selectedMachine.statusName}
            </div>
            <button onClick={() => setSelectedMachine(null)} className="w-full mt-2 py-2 bg-tbs-dark text-white rounded-xl font-bold text-xs">Đóng</button>
          </div>
        </div>
      )}

      {/* MODAL: nhập toạ độ GPS cho điểm vừa bấm */}
      {pendingGeoPoint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-tbs-dark">Điểm Hiệu Chỉnh GPS</h3>
              <button onClick={() => setPendingGeoPoint(null)}><IconX size={18} className="text-gray-400" /></button>
            </div>
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Nhãn (VD: Cổng chính)</span>
              <input value={geoLabel} onChange={(e) => setGeoLabel(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs font-semibold text-gray-600 space-y-1">
                <span>Vĩ độ *</span>
                <input value={geoLat} onChange={(e) => setGeoLat(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" />
              </label>
              <label className="block text-xs font-semibold text-gray-600 space-y-1">
                <span>Kinh độ *</span>
                <input value={geoLng} onChange={(e) => setGeoLng(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" />
              </label>
            </div>
            <button onClick={() => fillCurrentLocation(setGeoLat, setGeoLng)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold">
              <IconCurrentLocation size={14} /> Dùng Vị Trí GPS Hiện Tại
            </button>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setPendingGeoPoint(null)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold">Huỷ</button>
              <button onClick={handleSaveGeoPoint} disabled={!geoLat || !geoLng || savingGeo} className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold disabled:opacity-50">
                {savingGeo ? 'Đang lưu...' : 'Lưu Điểm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thêm Tầng */}
      {showFloorForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateFloor} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-3">
            <h3 className="font-bold text-tbs-dark">Thêm Tầng Mới</h3>
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Tên Tầng *</span>
              <input value={newFloorName} onChange={(e) => setNewFloorName(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" required autoFocus />
            </label>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowFloorForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold">Huỷ</button>
              <button type="submit" disabled={savingFloor} className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold disabled:opacity-50">{savingFloor ? 'Đang lưu...' : 'Thêm'}</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Vùng khuôn viên (geofence) */}
      {showGeofenceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-tbs-dark flex items-center gap-1.5"><IconShieldCheck size={16} /> Vùng Khuôn Viên Nhà Máy</h3>
              <button onClick={() => setShowGeofenceForm(false)}><IconX size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-[11px] text-gray-400">Dùng để chặn nhân viên bấm &quot;Nhận việc&quot; khi đang ở ngoài khuôn viên nhà máy.</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs font-semibold text-gray-600 space-y-1">
                <span>Vĩ độ tâm</span>
                <input value={geofenceLat} onChange={(e) => setGeofenceLat(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" />
              </label>
              <label className="block text-xs font-semibold text-gray-600 space-y-1">
                <span>Kinh độ tâm</span>
                <input value={geofenceLng} onChange={(e) => setGeofenceLng(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" />
              </label>
            </div>
            <label className="block text-xs font-semibold text-gray-600 space-y-1">
              <span>Bán kính (mét)</span>
              <input value={geofenceRadius} onChange={(e) => setGeofenceRadius(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal" />
            </label>
            <button onClick={() => fillCurrentLocation(setGeofenceLat, setGeofenceLng)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold">
              <IconCurrentLocation size={14} /> Dùng Vị Trí GPS Hiện Tại
            </button>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setShowGeofenceForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold">Huỷ</button>
              <button onClick={handleSaveGeofence} className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </MaintenanceShell>
  );
}
