// Dựng lưới lịch bảo trì theo tháng — tính THUẦN từ dữ liệu đã có sẵn trong
// MaintenanceScheduleMachine (lastMaintenanceDate/dueDate/status, xem lib/tbsMayMoc.ts), không
// gọi lại tbsMayMoc lần nữa. Độc lập với lib/maintenance-schedule.ts bên tbsMayMoc (không import
// chéo repo) — cùng ý tưởng nhưng viết lại riêng để trang này đổi giao diện tự do.

export type DayStatus = 'overdue' | 'upcoming' | 'done';
export type CalendarMachineEvent = { id: string; code: string; name: string; status: DayStatus };
export type CalendarDay = { date: string; status: DayStatus | null; machines: CalendarMachineEvent[] };
export type CalendarCell = CalendarDay & { day: number; isToday: boolean };

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const PRIORITY: Record<DayStatus, number> = { overdue: 3, upcoming: 2, done: 1 };

export function buildMaintenanceCalendarMap(
  machines: { id: string; code: string; name: string; lastMaintenanceDate: string | null; dueDate: string | null }[],
  monthStart: Date,
  monthEnd: Date,
  now: Date,
): Map<string, CalendarDay> {
  const map = new Map<string, CalendarDay>();

  function addEvent(date: Date, status: DayStatus, m: { id: string; code: string; name: string }) {
    if (date < monthStart || date > monthEnd) return;
    const key = dateKey(date);
    const existing = map.get(key) ?? { date: key, status: null, machines: [] };
    existing.machines.push({ id: m.id, code: m.code, name: m.name, status });
    if (!existing.status || PRIORITY[status] > PRIORITY[existing.status]) existing.status = status;
    map.set(key, existing);
  }

  for (const m of machines) {
    if (m.lastMaintenanceDate) addEvent(new Date(m.lastMaintenanceDate), 'done', m);
    if (m.dueDate) {
      const due = new Date(m.dueDate);
      addEvent(due, due < now ? 'overdue' : 'upcoming', m);
    }
  }
  return map;
}

export function buildCalendarWeeks(
  map: Map<string, CalendarDay>,
  monthStart: Date,
  monthEnd: Date,
  now: Date,
): (CalendarCell | null)[][] {
  const firstWeekdayIndex = (monthStart.getDay() + 6) % 7; // 0 = Thứ 2
  const daysInMonth = monthEnd.getDate();
  const todayKey = dateKey(now);

  const cells: (CalendarCell | null)[] = [
    ...Array(firstWeekdayIndex).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = map.get(key);
      return {
        day,
        date: key,
        isToday: key === todayKey,
        status: entry?.status ?? null,
        machines: entry?.machines ?? [],
      };
    }),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (CalendarCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
