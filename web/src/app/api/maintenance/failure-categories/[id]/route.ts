import { NextResponse } from "next/server";
import { updateTbsFailureCategory, deleteTbsFailureCategory } from "@/lib/tbsMayMoc";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = (await req.json()) as { name: string; isOther?: boolean; order?: number };
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: "Thiếu tên danh mục" }, { status: 400 });
    }
    const category = await updateTbsFailureCategory(id, body);
    return NextResponse.json({ success: true, data: category });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không sửa được danh mục hư";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteTbsFailureCategory(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không xoá được danh mục hư";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
