import { NextResponse } from "next/server";
import { fetchTbsEmployees, createTbsEmployee, type EmployeeWriteInput } from "@/lib/tbsMayMoc";

// Nhân sự — Thêm/Sửa/Xoá tài khoản đăng nhập App Mobile Native THẬT, dữ liệu ở tbsMayMoc. tbsMayMoc
// tự chặn tạo tài khoản ADMIN hoặc Nhà máy ngoài phạm vi Tổ hợp KG (403).
export async function GET() {
  try {
    const data = await fetchTbsEmployees();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được nhân sự từ tbsMayMoc";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as EmployeeWriteInput;
    if (!body.employeeCode?.trim() || !body.name?.trim() || !body.password || !body.role) {
      return NextResponse.json({ success: false, error: "Thiếu Mã NV / Tên / Mật khẩu / Vai trò" }, { status: 400 });
    }
    const employee = await createTbsEmployee(body);
    return NextResponse.json({ success: true, data: employee }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không tạo được nhân sự mới";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
