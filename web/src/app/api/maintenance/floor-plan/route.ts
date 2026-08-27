import { NextResponse } from "next/server";
import { fetchFloorPlanData } from "@/lib/tbsMayMoc";

// Sơ đồ nhà máy (ảnh Tầng + vị trí ghim từng máy) — dữ liệu thật từ tbsMayMoc.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");
  if (!factoryId) {
    return NextResponse.json({ success: false, error: "Thiếu Nhà máy" }, { status: 400 });
  }
  try {
    const data = await fetchFloorPlanData(factoryId);
    return NextResponse.json({ success: true, ...data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được sơ đồ nhà máy từ tbsMayMoc";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
