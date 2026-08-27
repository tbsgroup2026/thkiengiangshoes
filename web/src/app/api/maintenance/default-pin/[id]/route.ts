import { NextResponse } from "next/server";
import { updateDefaultPin } from "@/lib/tbsMayMoc";

// Điểm ghim mặc định của 1 Chuyền/Tổ trên ảnh sơ đồ (máy không tự ghim riêng sẽ kế thừa điểm
// này) — chuyển tiếp thẳng sang tbsMayMoc.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { mapX, mapY } = (await req.json()) as { mapX: number | null; mapY: number | null };
    await updateDefaultPin(id, mapX, mapY);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lưu được điểm ghim";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
