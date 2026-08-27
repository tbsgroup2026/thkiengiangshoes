import { NextResponse } from "next/server";
import { updateTbsCategory, deleteTbsCategory } from "@/lib/tbsMayMoc";

// Sửa / Xoá danh mục — chuyển tiếp thẳng sang tbsMayMoc, không lưu gì ở đây. tbsMayMoc tự chặn
// nếu mục (hoặc mục cha định chuyển tới) nằm ngoài phạm vi Tổ hợp KG (403), hoặc đang bị máy
// móc/mục con khác tham chiếu (409) — thkiengiangshoes chỉ việc chuyển tiếp lỗi ra người dùng.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    if (body.name !== undefined && !String(body.name).trim()) {
      return NextResponse.json({ success: false, error: "Tên danh mục không được để trống" }, { status: 400 });
    }
    const category = await updateTbsCategory(id, body);
    return NextResponse.json({ success: true, data: category });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không sửa được danh mục";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteTbsCategory(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không xoá được danh mục";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
