import { NextResponse } from "next/server";
import { updateMachinePosition } from "@/lib/tbsMayMoc";

// Ghim lại vị trí 1 máy trên ảnh sơ đồ — chuyển tiếp thẳng sang tbsMayMoc.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { mapX, mapY } = (await req.json()) as { mapX: number | null; mapY: number | null };
    await updateMachinePosition(id, mapX, mapY);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không ghim được vị trí máy";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
