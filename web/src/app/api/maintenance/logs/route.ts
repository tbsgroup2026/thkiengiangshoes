import { NextResponse } from "next/server";
import { fetchMaintenanceLogs } from "@/lib/tbsMayMoc";

// Lịch sử các lần bảo trì đã hoàn thành (tab "Theo dõi bảo trì") — dữ liệu thật từ tbsMayMoc.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 150) || 150;
    const data = await fetchMaintenanceLogs(limit);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được lịch sử bảo trì từ tbsMayMoc";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
