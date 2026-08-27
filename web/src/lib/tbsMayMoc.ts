/**
 * Kết nối MMTB Tổ hợp KG sang hệ thống tbsMayMoc (nguồn dữ liệu thật duy nhất — Máy móc/Sự cố).
 * Chỉ gọi từ SERVER (route API trong thkiengiangshoes), không gọi trực tiếp từ trình duyệt — JWT
 * dịch vụ (TBSMAYMOC_SERVICE_TOKEN) không được lộ ra client.
 *
 * Không lưu trữ gì ở phía thkiengiangshoes — mỗi lần gọi lấy đúng dữ liệu mới nhất từ tbsMayMoc,
 * không có bản sao/cache nào giữ lại.
 */

function getConfig() {
  const baseUrl = process.env.TBSMAYMOC_API_URL;
  const token = process.env.TBSMAYMOC_SERVICE_TOKEN;
  if (!baseUrl || !token) {
    throw new Error(
      "Thiếu cấu hình TBSMAYMOC_API_URL/TBSMAYMOC_SERVICE_TOKEN — xem .env.local (dev) hoặc Cloudflare Worker Secrets (production).",
    );
  }
  return { baseUrl, token };
}

async function fetchTbsMayMoc<T>(path: string): Promise<T> {
  const { baseUrl, token } = getConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    // Không cache — luôn lấy dữ liệu mới nhất mỗi lần gọi.
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`tbsMayMoc API lỗi ${res.status} (${path}): ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

// Ghi dữ liệu (Thêm/Sửa/Xoá) — gọi thẳng API tbsMayMoc, KHÔNG lưu gì ở thkiengiangshoes. Server
// tbsMayMoc tự kiểm tra máy/khu vực có nằm trong phạm vi Tổ hợp KG hay không (đã làm sẵn ở
// requireAdmin()/scope.ts bên đó) — trả lỗi 403 nếu cố ghi ra ngoài phạm vi, thkiengiangshoes chỉ
// việc chuyển tiếp lỗi đó ra cho người dùng.
async function writeTbsMayMoc<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  const { baseUrl, token } = getConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string })?.error || `tbsMayMoc API lỗi ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

// --- Máy móc ---

export type TbsMachineStatus = {
  id: string;
  name: string; // "Sử dụng" | "Chưa sử dụng" | "Không sử dụng" | "Đề nghị thanh lý" | tên tự đặt khác
  colorHex: string | null;
};

type CategoryRef = { id: string; name: string } | null;

export type TbsMachine = {
  id: string;
  code: string;
  name: string;
  serialNumber: string | null;
  status: TbsMachineStatus;
  area: { id: string; name: string; parent: { id: string; name: string } | null } | null;
  team: CategoryRef;
  productionLine: CategoryRef;
  machineType: CategoryRef;
  originalCost: number | null;
  depreciationPercent: number | null;
  remainingValue: number | null;
};

export async function fetchTbsMachines(): Promise<TbsMachine[]> {
  return fetchTbsMayMoc<TbsMachine[]>("/api/machines");
}

// Chỉ gồm các trường form Thêm/Sửa máy ở thkiengiangshoes thật sự hỏi (đủ dùng cho MMTB Tổ hợp
// KG) — các trường khác của Machine bên tbsMayMoc (model/hãng SX/xuất xứ/năm SX...) chưa hỏi ở
// đây, giữ nguyên giá trị cũ khi Sửa (không gửi field = API tbsMayMoc tự hiểu là giữ nguyên).
export type MachineWriteInput = {
  code: string;
  name: string;
  location: string;
  serialNumber?: string | null;
  areaId: string;
  teamId?: string | null;
  productionLineId?: string | null;
  machineTypeId?: string | null;
  statusId: string;
};

export async function createTbsMachine(input: MachineWriteInput): Promise<TbsMachine> {
  return writeTbsMayMoc<TbsMachine>("/api/machines", "POST", input);
}

export async function updateTbsMachine(id: string, input: MachineWriteInput): Promise<TbsMachine> {
  return writeTbsMayMoc<TbsMachine>(`/api/machines/${id}`, "PUT", input);
}

export async function deleteTbsMachine(id: string): Promise<void> {
  await writeTbsMayMoc<{ ok: boolean }>(`/api/machines/${id}`, "DELETE");
}

// --- Danh mục dùng cho bộ lọc (Nhà máy/Khu vực/Chuyền/Tổ/Phân loại máy/Trạng thái) — API
// /api/categories bên tbsMayMoc đã tự lọc đúng phạm vi Tổ hợp KG theo JWT dịch vụ, không cần lọc
// thêm gì ở đây.
export type TbsCategory = {
  id: string;
  name: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
};

export type MachineFilterOptions = {
  factories: TbsCategory[];
  areas: TbsCategory[];
  productionLines: TbsCategory[];
  teams: TbsCategory[];
  machineTypes: TbsCategory[];
  statuses: TbsCategory[];
};

async function fetchTbsCategories(type: string): Promise<TbsCategory[]> {
  return fetchTbsMayMoc<TbsCategory[]>(`/api/categories?type=${type}`);
}

export async function fetchMachineFilterOptions(): Promise<MachineFilterOptions> {
  const [factories, areas, productionLines, teams, machineTypes, statuses] = await Promise.all([
    fetchTbsCategories("FACTORY"),
    fetchTbsCategories("AREA"),
    fetchTbsCategories("PRODUCTION_LINE"),
    fetchTbsCategories("TEAM"),
    fetchTbsCategories("MACHINE_TYPE"),
    fetchTbsCategories("MACHINE_STATUS"),
  ]);
  return { factories, areas, productionLines, teams, machineTypes, statuses };
}

// --- Danh mục (Nhà máy/Khu vực/Chuyền/Tổ/Phân loại máy/Chu kỳ bảo trì) — Thêm/Sửa/Xoá thẳng
// từ thkiengiangshoes, không lưu gì ở đây. tbsMayMoc tự chặn nếu mục (hoặc mục cha định chuyển
// tới) nằm ngoài phạm vi Tổ hợp KG (403), và tự chặn tạo/xoá Nhà máy (chỉ Admin toàn quyền bên
// tbsMayMoc mới được) — thkiengiangshoes chỉ việc chuyển tiếp lỗi ra cho người dùng.
export type CategoryWriteType =
  | "AREA"
  | "PRODUCTION_LINE"
  | "TEAM"
  | "MACHINE_TYPE"
  | "PART"
  | "MAINTENANCE_PERIOD"
  | "MACHINE_STATUS";

export type CategoryWriteInput = {
  type: CategoryWriteType;
  name: string;
  // Bắt buộc với AREA/PRODUCTION_LINE/TEAM/MACHINE_TYPE/PART (Nhà máy). Bỏ qua với
  // MAINTENANCE_PERIOD/MACHINE_STATUS — tbsMayMoc tự gán = đúng Tổ hợp KG theo JWT dịch vụ, không
  // cho tạo mục "chung toàn hệ thống" từ đây.
  parentId?: string | null;
  days?: number | null; // chỉ MAINTENANCE_PERIOD
  colorHex?: string | null; // chỉ MACHINE_STATUS
  quantity?: number | null; // chỉ PART (số lượng tồn kho)
  order?: number;
};

export async function fetchTbsCategoriesByType(type: string): Promise<TbsCategory[]> {
  return fetchTbsCategories(type);
}

export async function createTbsCategory(input: CategoryWriteInput): Promise<TbsCategory> {
  return writeTbsMayMoc<TbsCategory>("/api/categories", "POST", input);
}

export async function updateTbsCategory(
  id: string,
  input: Partial<Pick<CategoryWriteInput, "name" | "parentId" | "days" | "order">>,
): Promise<TbsCategory> {
  return writeTbsMayMoc<TbsCategory>(`/api/categories/${id}`, "PUT", input);
}

export async function deleteTbsCategory(id: string): Promise<void> {
  await writeTbsMayMoc<{ ok: boolean }>(`/api/categories/${id}`, "DELETE");
}

// Bảng màu 4 trạng thái máy CHUẨN của tbsMayMoc (đúng y hệt màu đang dùng bên trang Tổng quan
// tbsMayMoc — xem admin/page.tsx statusSummaryCards) — so khớp không phân biệt hoa/thường/khoảng
// trắng thừa, đề phòng lệch chính tả giống lỗi đã từng gặp bên tbsMayMoc. Tên KHÁC 4 tên chuẩn
// (Admin tbsMayMoc tự thêm danh mục Trạng thái máy tuỳ ý) rơi vào "slate" mặc định.
const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  "su dung": { bg: "bg-emerald-500/15", text: "text-emerald-700", dot: "bg-emerald-500" },
  "chua su dung": { bg: "bg-slate-400/15", text: "text-slate-600", dot: "bg-slate-400" },
  "khong su dung": { bg: "bg-amber-500/15", text: "text-amber-700", dot: "bg-amber-500" },
  "de nghi thanh ly": { bg: "bg-rose-500/15", text: "text-rose-700", dot: "bg-rose-500" },
};
const DEFAULT_STATUS_COLOR = { bg: "bg-slate-400/15", text: "text-slate-600", dot: "bg-slate-400" };

function normalizeVN(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // bỏ dấu (sau khi tách tổ hợp NFD)
    .replace(/đ/gi, "d")
    .trim()
    .toLowerCase();
}

export function statusColorFor(statusName: string) {
  return STATUS_COLOR_MAP[normalizeVN(statusName)] || DEFAULT_STATUS_COLOR;
}

export function areaLabel(area: TbsMachine["area"]): string {
  if (!area) return "Chưa gán khu vực";
  return area.parent ? `${area.parent.name} > ${area.name}` : area.name;
}

// --- Sự cố / Ticket bảo trì ---

export type TbsIncident = {
  id: string;
  description: string;
  status: "PENDING" | "ACCEPTED" | "DONE";
  isMaintenanceDue: boolean;
  categoryName: string | null;
  createdAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  machine: {
    id: string;
    name: string;
    code: string;
    areaName: string | null;
    factoryName: string | null;
  };
  reporter: { name: string; employeeCode: string } | null;
  assignedTo: { name: string; employeeCode: string } | null;
};

export async function fetchTbsIncidents(): Promise<TbsIncident[]> {
  return fetchTbsMayMoc<TbsIncident[]>("/api/incidents?limit=200");
}

// --- Đề xuất (từ thẻ sự cố — cần vật tư / đào tạo lại / đang chờ xử lý) ---

export type TbsProposal = {
  id: string;
  type: "PARTS_REQUEST" | "RETRAIN_OPERATOR" | "HOLD";
  parts: string | null;
  reason: string;
  resolved: boolean;
  resolvedAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  submittedBy: { id: string; name: string; employeeCode: string };
  operator: { id: string; name: string; employeeCode: string } | null;
  confirmedBy: { id: string; name: string; employeeCode: string } | null;
  incident: {
    id: string;
    description: string;
    machine: {
      id: string;
      name: string;
      code: string;
      area: { id: string; name: string; parent: { id: string; name: string } | null } | null;
    };
  };
};

export async function fetchTbsProposals(): Promise<TbsProposal[]> {
  return fetchTbsMayMoc<TbsProposal[]>("/api/admin/proposals");
}

export async function resolveTbsProposal(id: string, resolved: boolean): Promise<TbsProposal> {
  return writeTbsMayMoc<TbsProposal>(`/api/admin/proposals/${id}`, "PUT", { resolved });
}

// --- Thời gian phản hồi (thống kê xử lý sự cố + đánh giá nhân viên bảo trì) ---

export type ResponseTimeIncident = {
  id: string;
  isMaintenanceDue: boolean;
  createdAt: string;
  acceptedAt: string;
  completedAt: string | null;
  assignedTo: { id: string; name: string; employeeCode: string } | null;
  factoryName: string | null;
  areaName: string | null;
};

export type ResponseTimeLog = {
  id: string;
  createdAt: string;
  skillRating: number | null;
  partsReplaced: string | null;
  technician: { id: string; name: string; employeeCode: string };
  isMaintenanceDue: boolean;
  machineName: string;
  machineCode: string;
  factoryName: string | null;
  areaName: string | null;
};

export type ResponseTimeData = { incidents: ResponseTimeIncident[]; logs: ResponseTimeLog[] };

export async function fetchResponseTimeData(): Promise<ResponseTimeData> {
  return fetchTbsMayMoc<ResponseTimeData>("/api/response-time");
}

// --- Sơ đồ nhà máy (ảnh Tầng + ghim vị trí máy) ---

export type TbsFloor = { id: string; factoryId: string; name: string; floorPlanImageUrl: string | null; order: number };

export type FloorPlanMachinePosition =
  | { type: "point"; mapX: number; mapY: number }
  | { type: "area"; boundaryPoints: { x: number; y: number }[] };

export type FloorPlanMachine = {
  id: string;
  code: string;
  name: string;
  statusName: string;
  statusColorHex: string | null;
  areaId: string;
  areaName: string;
  floorId: string;
  hasOwnPin: boolean;
  position: FloorPlanMachinePosition | null;
};

export type FloorPlanArea = { id: string; name: string; floorId: string | null; boundaryPoints: { x: number; y: number }[] | null };
export type FloorPlanLine = { id: string; name: string; parentId: string; mapX: number | null; mapY: number | null };
export type FloorPlanFactory = { id: string; name: string; geofenceLat: number | null; geofenceLng: number | null; geofenceRadius: number | null };

export type FloorPlanData = {
  factory: FloorPlanFactory | null;
  floors: TbsFloor[];
  machines: FloorPlanMachine[];
  areas: FloorPlanArea[];
  productionLines: FloorPlanLine[];
  teams: FloorPlanLine[];
};

export async function fetchFloorPlanData(factoryId: string): Promise<FloorPlanData> {
  return fetchTbsMayMoc<FloorPlanData>(`/api/floor-plan-data?factoryId=${encodeURIComponent(factoryId)}`);
}

export async function updateMachinePosition(machineId: string, mapX: number | null, mapY: number | null): Promise<void> {
  await writeTbsMayMoc(`/api/machines/${machineId}/position`, "PUT", { mapX, mapY });
}

// --- Tầng (Floor): tạo/sửa tên/xoá/tải ảnh sơ đồ mới ---

export async function createTbsFloor(factoryId: string, name: string): Promise<TbsFloor> {
  return writeTbsMayMoc<TbsFloor>("/api/floors", "POST", { factoryId, name });
}

export async function updateTbsFloor(id: string, input: { name?: string; floorPlanImageUrl?: string | null }): Promise<TbsFloor> {
  return writeTbsMayMoc<TbsFloor>(`/api/floors/${id}`, "PUT", input);
}

export async function deleteTbsFloor(id: string): Promise<void> {
  await writeTbsMayMoc<{ ok: boolean }>(`/api/floors/${id}`, "DELETE");
}

// Ảnh -> data URL base64 sẵn (FE tự đọc file rồi gửi lên), tbsMayMoc lưu vào R2 và trả về URL thật.
export async function uploadTbsImage(base64: string, mimeType: string): Promise<string> {
  const result = await writeTbsMayMoc<{ url: string }>("/api/admin/upload", "POST", { base64, mimeType });
  return result.url;
}

// --- Vùng khuôn viên Nhà máy (geofence) + vùng Xưởng (boundary polygon) + điểm ghim mặc định
// Chuyền/Tổ — đều đi qua PUT /api/categories/[id] với payload {floorPlan: {...}} (đã có sẵn ở
// tbsMayMoc, dùng chung 1 action cho cả 3 loại tuỳ theo type của category đó).

export async function updateFactoryGeofence(
  factoryId: string,
  geofence: { geofenceLat: number | null; geofenceLng: number | null; geofenceRadius: number | null },
): Promise<void> {
  await writeTbsMayMoc(`/api/categories/${factoryId}`, "PUT", { floorPlan: geofence });
}

export async function updateAreaBoundary(areaId: string, boundaryPoints: { x: number; y: number }[] | null): Promise<void> {
  await writeTbsMayMoc(`/api/categories/${areaId}`, "PUT", { floorPlan: { boundaryPoints } });
}

export async function updateDefaultPin(categoryId: string, mapX: number | null, mapY: number | null): Promise<void> {
  await writeTbsMayMoc(`/api/categories/${categoryId}`, "PUT", { floorPlan: { mapX, mapY } });
}

// --- Điểm hiệu chỉnh GPS (MapGeoRef) — quy đổi % trên ảnh <-> toạ độ GPS thật, dùng cho "Đường
// đi" trên App Mobile. Tối thiểu 2 điểm/Tầng để tính được phép biến đổi.

export type TbsGeoRefPoint = {
  id: string;
  floorId: string;
  mapXPercent: number;
  mapYPercent: number;
  latitude: number;
  longitude: number;
  label: string | null;
};

export async function fetchGeoRefPoints(floorId: string): Promise<TbsGeoRefPoint[]> {
  return fetchTbsMayMoc<TbsGeoRefPoint[]>(`/api/map-georef?floorId=${floorId}`);
}

export async function createGeoRefPoint(input: {
  floorId: string;
  mapXPercent: number;
  mapYPercent: number;
  latitude: number;
  longitude: number;
  label?: string | null;
}): Promise<TbsGeoRefPoint> {
  return writeTbsMayMoc<TbsGeoRefPoint>("/api/map-georef", "POST", input);
}

export async function deleteGeoRefPoint(id: string): Promise<void> {
  await writeTbsMayMoc<{ ok: boolean }>(`/api/map-georef/${id}`, "DELETE");
}

// --- Đường đi (MapPath) — từng đoạn hành lang/lối đi vẽ trên ảnh, mobile ghép lại tìm đường ngắn
// nhất thay vì đường thẳng chim bay.

export type TbsMapPath = { id: string; floorId: string; points: { x: number; y: number }[]; label: string | null };

export async function fetchMapPaths(floorId: string): Promise<TbsMapPath[]> {
  return fetchTbsMayMoc<TbsMapPath[]>(`/api/map-path?floorId=${floorId}`);
}

export async function createMapPath(input: { floorId: string; points: { x: number; y: number }[]; label?: string | null }): Promise<TbsMapPath> {
  return writeTbsMayMoc<TbsMapPath>("/api/map-path", "POST", input);
}

export async function deleteMapPath(id: string): Promise<void> {
  await writeTbsMayMoc<{ ok: boolean }>(`/api/map-path/${id}`, "DELETE");
}

// --- Nhân sự (CRUD tài khoản đăng nhập App Mobile Native thật) ---

export type TbsEmployeeRole = "ADMIN" | "OPERATOR" | "MAINTENANCE";

export type TbsEmployee = {
  id: string;
  employeeCode: string;
  name: string;
  phone: string | null;
  role: TbsEmployeeRole;
  areaId: string | null;
  area: { id: string; name: string; parent: { id: string; name: string } | null } | null;
  factoryId: string | null;
  factory: { id: string; name: string } | null;
  isTeamLead: boolean;
  extraAreaIds: string[];
  createdAt: string;
};

export type EmployeeWriteInput = {
  employeeCode: string;
  name: string;
  phone?: string | null;
  password?: string; // bắt buộc khi tạo mới, bỏ trống khi sửa = giữ nguyên mật khẩu cũ
  role: TbsEmployeeRole;
  areaId?: string | null;
  factoryId?: string | null;
  isTeamLead?: boolean;
  extraAreaIds?: string[];
};

export async function fetchTbsEmployees(): Promise<TbsEmployee[]> {
  return fetchTbsMayMoc<TbsEmployee[]>("/api/employees");
}

export async function createTbsEmployee(input: EmployeeWriteInput): Promise<TbsEmployee> {
  return writeTbsMayMoc<TbsEmployee>("/api/employees", "POST", input);
}

export async function updateTbsEmployee(id: string, input: EmployeeWriteInput): Promise<TbsEmployee> {
  return writeTbsMayMoc<TbsEmployee>(`/api/employees/${id}`, "PUT", input);
}

export async function deleteTbsEmployee(id: string): Promise<void> {
  await writeTbsMayMoc<{ ok: boolean }>(`/api/employees/${id}`, "DELETE");
}

// --- Thông báo (soạn + gửi push thật tới App Mobile Native) ---

export type TbsAnnouncement = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  createdBy: { name: string; employeeCode: string };
  targetFactory: { id: string; name: string } | null;
  targetRole: string | null;
  createdAt: string;
};

export type AnnouncementWriteInput = {
  title: string;
  content: string;
  image?: string | null;
  targetFactoryId?: string | null; // bắt buộc với AMDKG — tbsMayMoc tự chặn nếu thiếu/ngoài phạm vi
  targetRole?: string | null;
};

export async function fetchTbsAnnouncements(): Promise<TbsAnnouncement[]> {
  return fetchTbsMayMoc<TbsAnnouncement[]>("/api/announcements");
}

export async function createTbsAnnouncement(input: AnnouncementWriteInput): Promise<TbsAnnouncement> {
  return writeTbsMayMoc<TbsAnnouncement>("/api/announcements", "POST", input);
}

export async function updateTbsAnnouncement(id: string, input: AnnouncementWriteInput): Promise<TbsAnnouncement> {
  return writeTbsMayMoc<TbsAnnouncement>(`/api/announcements/${id}`, "PUT", input);
}

export async function deleteTbsAnnouncement(id: string): Promise<void> {
  await writeTbsMayMoc<{ ok: boolean }>(`/api/announcements/${id}`, "DELETE");
}

// --- Danh mục hư (dùng khi báo sự cố — mục CHUNG toàn hệ thống + mục RIÊNG của Tổ hợp KG) ---

export type TbsFailureCategory = { id: string; name: string; isOther: boolean; order: number; scopeCategoryId: string | null };

export async function fetchTbsFailureCategories(): Promise<TbsFailureCategory[]> {
  return fetchTbsMayMoc<TbsFailureCategory[]>("/api/failure-categories");
}

export async function createTbsFailureCategory(input: { name: string; isOther?: boolean; order?: number }): Promise<TbsFailureCategory> {
  return writeTbsMayMoc<TbsFailureCategory>("/api/failure-categories", "POST", input);
}

export async function updateTbsFailureCategory(
  id: string,
  input: { name: string; isOther?: boolean; order?: number },
): Promise<TbsFailureCategory> {
  return writeTbsMayMoc<TbsFailureCategory>(`/api/failure-categories/${id}`, "PUT", input);
}

export async function deleteTbsFailureCategory(id: string): Promise<void> {
  await writeTbsMayMoc<{ ok: boolean }>(`/api/failure-categories/${id}`, "DELETE");
}

export const INCIDENT_STATUS_LABEL: Record<TbsIncident["status"], string> = {
  PENDING: "Chưa ai nhận",
  ACCEPTED: "Đang xử lý",
  DONE: "Đã hoàn thành",
};

export const INCIDENT_STATUS_COLOR: Record<TbsIncident["status"], { bg: string; text: string }> = {
  PENDING: { bg: "bg-rose-500/15", text: "text-rose-700" },
  ACCEPTED: { bg: "bg-amber-500/15", text: "text-amber-700" },
  DONE: { bg: "bg-emerald-500/15", text: "text-emerald-700" },
};

// --- Lịch bảo trì định kỳ (Bảo Dưỡng MMTB — Lên lịch / Theo dõi / Xem lịch) ---

export type MaintenanceScheduleMachine = {
  id: string;
  code: string;
  name: string;
  factoryId: string | null;
  factoryName: string | null;
  areaId: string | null;
  areaName: string | null;
  scheduled: boolean;
  periodId: string | null;
  periodName: string | null;
  periodDays: number | null;
  lastMaintenanceDate: string | null;
  dueDate: string | null;
  daysLeft: number | null;
  status: "unscheduled" | "overdue" | "upcoming" | "scheduled";
};

export type MaintenancePeriodOption = { id: string; name: string; days: number | null };

export type MaintenanceScheduleData = {
  machines: MaintenanceScheduleMachine[];
  periods: MaintenancePeriodOption[];
  completedThisMonth: number;
};

export async function fetchMaintenanceSchedule(): Promise<MaintenanceScheduleData> {
  return fetchTbsMayMoc<MaintenanceScheduleData>("/api/maintenance-schedule");
}

export type AssignMaintenanceInput = {
  machineIds: string[];
  maintenancePeriodId: string;
  anchorDate: string; // ISO date — "ngày bắt đầu tính chu kỳ"
};

export async function assignMaintenanceSchedule(
  input: AssignMaintenanceInput,
): Promise<{ updated: number; requested: number }> {
  return writeTbsMayMoc<{ updated: number; requested: number }>("/api/machines/bulk-maintenance", "POST", input);
}

export type MaintenanceLogEntry = {
  id: string;
  machineId: string;
  machineCode: string;
  machineName: string;
  factoryName: string | null;
  areaName: string | null;
  technicianName: string;
  technicianCode: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  repairDetail: string;
  partsReplaced: string | null;
  imagesBefore: string | null;
  proofImages: string | null;
  incidentDescription: string | null;
};

export async function fetchMaintenanceLogs(limit = 150): Promise<MaintenanceLogEntry[]> {
  return fetchTbsMayMoc<MaintenanceLogEntry[]>(`/api/maintenance-logs?limit=${limit}`);
}
