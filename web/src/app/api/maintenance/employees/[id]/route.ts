import { NextResponse } from "next/server";
import { updateTbsEmployee, deleteTbsEmployee, type EmployeeWriteInput } from "@/lib/tbsMayMoc";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = (await req.json()) as EmployeeWriteInput;
    if (!body.employeeCode?.trim() || !body.name?.trim() || !body.role) {
      return NextResponse.json({ success: false, error: "Thiếu Mã NV / Tên / Vai trò" }, { status: 400 });
    }
    const employee = await updateTbsEmployee(id, body);
    return NextResponse.json({ success: true, data: employee });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không sửa được nhân sự";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteTbsEmployee(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không xoá được nhân sự";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
