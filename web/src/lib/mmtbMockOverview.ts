// Dữ liệu MẪU cho trang Tổng Quan — chỉ dùng khi chưa có sự cố THẬT nào khớp bộ lọc hiện tại (bật
// tắt qua nút "Dữ liệu mẫu" cạnh nút Lọc). Sinh từ danh sách MÁY THẬT đã tải sẵn (đúng mã/tên/Nhà
// máy/Khu vực/Line) nên khi đổi bộ lọc, dữ liệu mẫu cũng thu hẹp đúng như dữ liệu thật sẽ làm — số
// ngẫu nhiên dùng seed cố định (mulberry32) để không đổi lung tung mỗi lần render.
export type MockOverviewIncident = {
  id: string;
  createdAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  categoryName: string | null;
  machineId: string;
  machineCode: string;
  machineName: string;
  machineTypeName: string | null;
  factoryId: string | null;
  areaId: string | null;
  areaName: string | null;
  lineId: string | null;
  lineName: string | null;
};

export type MockOverviewLog = {
  id: string;
  partsReplaced: string | null;
  factoryId: string | null;
  areaId: string | null;
  lineId: string | null;
  createdAt: string;
};

export type MockMachineInput = {
  code: string;
  name: string;
  machineTypeName: string | null;
  factoryId: string | null;
  areaId: string | null;
  areaName: string | null;
  lineId: string | null;
  lineName: string | null;
};

const CATEGORY_NAMES = ['Hệ thống Điện / Điện tử', 'Cơ khí / Truyền động', 'Thủy lực', 'Motor / Động cơ', 'Cảm biến', 'Khí nén'];
const PART_NAMES = ['Dây curoa', 'Kim máy may', 'Cảm biến quang', 'Rơ le 220V', 'Ổ bi', 'Dây điện', 'Bộ lọc khí', 'Vòng bi trục chính'];

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Sinh 1 bộ dữ liệu mẫu cố định (không đổi giữa các lần render) trải trong ~8 tuần gần đây, gắn
// vào các máy THẬT đã có (để filter theo Nhà máy/Khu vực/Line hoạt động đúng).
export function generateMockOverviewData(machines: MockMachineInput[], count = 70): { incidents: MockOverviewIncident[]; logs: MockOverviewLog[] } {
  if (machines.length === 0) return { incidents: [], logs: [] };
  const rand = mulberry32(20260821);
  const incidents: MockOverviewIncident[] = [];
  const logs: MockOverviewLog[] = [];
  const now = Date.now();
  const DAY = 86400000;

  for (let i = 0; i < count; i++) {
    const m = machines[Math.floor(rand() * machines.length)];
    const daysAgo = Math.floor(rand() * 56);
    const createdAt = new Date(now - daysAgo * DAY - Math.floor(rand() * DAY));
    const mtta = 2 + rand() * 13;
    const mttr = 8 + rand() * 35;
    const acceptedAt = new Date(createdAt.getTime() + mtta * 60000);
    const completedAt = new Date(acceptedAt.getTime() + mttr * 60000);
    const id = `mock-${i}`;

    incidents.push({
      id,
      createdAt: createdAt.toISOString(),
      acceptedAt: acceptedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      categoryName: CATEGORY_NAMES[Math.floor(rand() * CATEGORY_NAMES.length)],
      machineId: m.code,
      machineCode: m.code,
      machineName: m.name,
      machineTypeName: m.machineTypeName,
      factoryId: m.factoryId,
      areaId: m.areaId,
      areaName: m.areaName,
      lineId: m.lineId,
      lineName: m.lineName,
    });

    logs.push({
      id: `mocklog-${i}`,
      partsReplaced: JSON.stringify({ parts: [{ partId: null, name: PART_NAMES[Math.floor(rand() * PART_NAMES.length)], quantity: 1 + Math.floor(rand() * 3) }] }),
      factoryId: m.factoryId,
      areaId: m.areaId,
      lineId: m.lineId,
      createdAt: completedAt.toISOString(),
    });
  }
  return { incidents, logs };
}
