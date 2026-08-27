import { NextResponse } from "next/server";
import { updateTbsMachine, deleteTbsMachine, type MachineWriteInput } from "@/lib/tbsMayMoc";

// Sửa / Xoá máy — chuyển tiếp thẳng sang tbsMayMoc, không lưu gì ở đây. tbsMayMoc tự chặn nếu máy
// hoặc Khu vực định chuyển tới nằm ngoài phạm vi Tổ hợp KG (403).
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = (await req.json()) as MachineWriteInput;
    if (!body.code?.trim() || !body.name?.trim() || !body.location?.trim() || !body.areaId || !body.statusId) {
      return NextResponse.json(
        { success: false, error: "Thiếu Mã tài sản / Tên máy / Vị trí / Khu vực / Trạng thái" },
        { status: 400 },
      );
    }
    const machine = await updateTbsMachine(id, body);
    return NextResponse.json({ success: true, data: machine });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không sửa được máy";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteTbsMachine(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không xoá được máy";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
