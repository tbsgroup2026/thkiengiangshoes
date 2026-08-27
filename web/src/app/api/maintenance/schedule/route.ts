import { NextResponse } from "next/server";
import { fetchMaintenanceSchedule, assignMaintenanceSchedule, type AssignMaintenanceInput } from "@/lib/tbsMayMoc";

// Lịch bảo trì định kỳ (Lên lịch / Theo dõi / Xem lịch) — lấy/ghi dữ liệu thật ở tbsMayMoc, không
// lưu gì ở đây.
export async function GET() {
  try {
    const data = await fetchMaintenanceSchedule();
    return NextResponse.json({ success: true, ...data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được lịch bảo trì từ tbsMayMoc";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

// Gán/Đổi Chu kỳ bảo trì + Ngày bắt đầu tính cho 1 hoặc nhiều máy cùng lúc.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AssignMaintenanceInput;
    if (!Array.isArray(body.machineIds) || body.machineIds.length === 0) {
      return NextResponse.json({ success: false, error: "Vui lòng chọn ít nhất 1 máy" }, { status: 400 });
    }
    if (!body.maintenancePeriodId) {
      return NextResponse.json({ success: false, error: "Vui lòng chọn Chu kỳ bảo trì" }, { status: 400 });
    }
    if (!body.anchorDate) {
      return NextResponse.json({ success: false, error: "Vui lòng chọn Ngày bắt đầu tính" }, { status: 400 });
    }
    const result = await assignMaintenanceSchedule(body);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không gán được lịch bảo trì";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
