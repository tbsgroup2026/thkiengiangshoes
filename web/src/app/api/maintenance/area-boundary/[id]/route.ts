import { NextResponse } from "next/server";
import { updateAreaBoundary } from "@/lib/tbsMayMoc";

// Vùng khoanh (đa giác) của 1 Khu vực/Xưởng trên ảnh sơ đồ — chuyển tiếp thẳng sang tbsMayMoc.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = (await req.json()) as { boundaryPoints: { x: number; y: number }[] | null };
    await updateAreaBoundary(id, body.boundaryPoints);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lưu được vùng khoanh";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
