import { NextResponse } from "next/server";
import { fetchGeoRefPoints, createGeoRefPoint } from "@/lib/tbsMayMoc";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const floorId = searchParams.get("floorId");
  if (!floorId) return NextResponse.json({ success: false, error: "Thiếu Tầng" }, { status: 400 });
  try {
    const data = await fetchGeoRefPoints(floorId);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được điểm hiệu chỉnh GPS";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const point = await createGeoRefPoint(body);
    return NextResponse.json({ success: true, data: point }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không thêm được điểm hiệu chỉnh GPS";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
