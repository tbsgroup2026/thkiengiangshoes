// Dữ liệu MẪU cho module "Hiệu Suất Nhà Máy" (PPH/RFT/sản lượng theo giờ) — hiện CHƯA có hệ
// thống backend thật nào cho mảng dữ liệu sản xuất này (khác hẳn MMTB quản lý sự cố/bảo trì máy),
// nên toàn bộ sinh ở phía FE với seed cố định (không đổi lung tung mỗi lần render) để làm giao
// diện trước — sau này có hệ thống thật thì thay generateProductionMockData() bằng gọi API thật.

export type HourStatus = 'ok' | 'warn' | 'bad' | 'pending';
export type HourSlot = { time: string; actual: number | null; status: HourStatus };
export type EntryStatus = 'ontime' | 'late' | 'missing';

export type ProductionLine = {
  factoryId: string;
  lineNumber: number;
  shoeCode: string;
  workerCount: number;
  targetPerHour: number;
  workStart: string;
  workEnd: string;
  hours: HourSlot[];
  pph: number;
  efficiencyPct: number;
  rftPct: number;
  entryStatus: EntryStatus;
  cumulativeActual: number;
  cumulativeTarget: number;
};

export type ProductionFactory = {
  id: string;
  name: string;
  lineCount: number;
  efficiencyPct: number;
  lines: ProductionLine[];
};

const HOUR_LABELS = ['8:30', '9:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30'];
const SHOE_CODES = ['SK-2291', 'SK-1104', 'SK-0872', 'SK-3310', 'SK-4021', 'SK-1987', 'SK-2650', 'SK-3389'];
const ENTRY_WEIGHTS: EntryStatus[] = ['ontime', 'ontime', 'ontime', 'ontime', 'ontime', 'late', 'missing'];

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

const FACTORY_SEED: { id: string; name: string; lineCount: number; efficiencyPct: number }[] = [
  { id: 'KG1', name: 'KG1', lineCount: 9, efficiencyPct: 88.4 },
  { id: 'KG2', name: 'KG2', lineCount: 8, efficiencyPct: 91.2 },
  { id: 'KG3', name: 'KG3', lineCount: 10, efficiencyPct: 94.7 },
  { id: 'HTD', name: 'HTĐ', lineCount: 6, efficiencyPct: 86.1 },
];

// Giờ hiện tại giả lập — 6/8 khung giờ đã có dữ liệu, 2 khung cuối còn "-" (chưa tới ca), giống
// đúng cảm giác "cập nhật mỗi 60 phút" của ảnh mẫu.
const HOURS_ELAPSED = 6;

function statusFromRatio(ratio: number): HourStatus {
  if (ratio >= 0.95) return 'ok';
  if (ratio >= 0.75) return 'warn';
  return 'bad';
}

function generateLine(rand: () => number, factoryId: string, lineNumber: number): ProductionLine {
  const targetPerHour = 30 + Math.floor(rand() * 25); // 30-55 đôi/giờ
  const workerCount = 20 + Math.floor(rand() * 25);
  const shoeCode = SHOE_CODES[Math.floor(rand() * SHOE_CODES.length)];

  const hours: HourSlot[] = HOUR_LABELS.map((time, idx) => {
    if (idx >= HOURS_ELAPSED) return { time, actual: null, status: 'pending' };
    const ratio = 0.65 + rand() * 0.45; // 65%-110% chỉ tiêu
    const actual = Math.round(targetPerHour * ratio);
    return { time, actual, status: statusFromRatio(actual / targetPerHour) };
  });

  const doneHours = hours.filter((h) => h.actual != null);
  const cumulativeActual = doneHours.reduce((s, h) => s + (h.actual ?? 0), 0);
  const cumulativeTarget = targetPerHour * doneHours.length;
  const pph = doneHours.length ? Math.round((cumulativeActual / doneHours.length) * 10) / 10 : 0;
  const efficiencyPct = cumulativeTarget ? Math.round((cumulativeActual / cumulativeTarget) * 1000) / 10 : 0;
  const entryStatus = ENTRY_WEIGHTS[Math.floor(rand() * ENTRY_WEIGHTS.length)];
  const rftPct = Math.round((90 + rand() * 9) * 10) / 10;

  return {
    factoryId,
    lineNumber,
    shoeCode,
    workerCount,
    targetPerHour,
    workStart: '8:00',
    workEnd: '17:00',
    hours,
    pph,
    efficiencyPct: entryStatus === 'missing' ? 0 : efficiencyPct,
    rftPct,
    entryStatus,
    cumulativeActual,
    cumulativeTarget,
  };
}

export function generateProductionMockData(): ProductionFactory[] {
  const rand = mulberry32(20260828);
  return FACTORY_SEED.map((f) => ({
    ...f,
    lines: Array.from({ length: f.lineCount }, (_, i) => generateLine(rand, f.id, i + 1)),
  }));
}

export const PRODUCTION_HOUR_LABELS = HOUR_LABELS;
