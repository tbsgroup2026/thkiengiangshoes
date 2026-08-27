import { NextResponse } from "next/server";
import { updateFactoryGeofence } from "@/lib/tbsMayMoc";

// Vùng khuôn viên Nhà máy (geofence) — chuyển tiếp thẳng sang tbsMayMoc.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = (await req.json()) as { geofenceLat: number | null; geofenceLng: number | null; geofenceRadius: number | null };
    await updateFactoryGeofence(id, body);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lưu được vùng khuôn viên";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
