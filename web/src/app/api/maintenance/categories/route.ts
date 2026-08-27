import { NextResponse } from "next/server";
import { fetchTbsCategoriesByType, createTbsCategory, type CategoryWriteInput } from "@/lib/tbsMayMoc";

const READABLE_TYPES = ["FACTORY", "AREA", "PRODUCTION_LINE", "TEAM", "MACHINE_TYPE", "PART", "MAINTENANCE_PERIOD", "MACHINE_STATUS"];
const WRITABLE_TYPES = ["AREA", "PRODUCTION_LINE", "TEAM", "MACHINE_TYPE", "PART", "MAINTENANCE_PERIOD", "MACHINE_STATUS"];

// Danh mục dùng cho trang "Quản Lý Danh Mục" — Nhà máy chỉ đọc (không cho tạo/sửa/xoá ở đây, xem
// createTbsCategory), các loại còn lại cho Thêm/Sửa/Xoá đầy đủ, dữ liệu thật lấy từ tbsMayMoc.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  if (!type || !READABLE_TYPES.includes(type)) {
    return NextResponse.json({ success: false, error: "Loại danh mục không hợp lệ" }, { status: 400 });
  }
  try {
    const data = await fetchTbsCategoriesByType(type);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được danh mục từ tbsMayMoc";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CategoryWriteInput;
    if (!body.type || !WRITABLE_TYPES.includes(body.type)) {
      return NextResponse.json({ success: false, error: "Loại danh mục không hợp lệ" }, { status: 400 });
    }
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: "Thiếu tên danh mục" }, { status: 400 });
    }
    if (["AREA", "PRODUCTION_LINE", "TEAM", "MACHINE_TYPE", "PART"].includes(body.type) && !body.parentId) {
      return NextResponse.json({ success: false, error: "Thiếu mục cha" }, { status: 400 });
    }
    if (body.type === "PART" && (body.quantity == null || Number(body.quantity) < 0)) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập số lượng tồn kho hợp lệ" }, { status: 400 });
    }
    const category = await createTbsCategory(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không tạo được danh mục mới";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
