import { NextResponse } from "next/server";
import { fetchTbsFailureCategories, createTbsFailureCategory } from "@/lib/tbsMayMoc";

export async function GET() {
  try {
    const data = await fetchTbsFailureCategories();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được danh mục hư từ tbsMayMoc";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name: string; isOther?: boolean; order?: number };
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: "Thiếu tên danh mục" }, { status: 400 });
    }
    const category = await createTbsFailureCategory(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không tạo được danh mục hư mới";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
