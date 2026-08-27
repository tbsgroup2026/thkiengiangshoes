import { NextResponse } from "next/server";
import { fetchTbsMachines, fetchMachineFilterOptions, areaLabel, createTbsMachine, type MachineWriteInput } from "@/lib/tbsMayMoc";

// Danh Sách MMTB — lấy dữ liệu Máy móc THẬT từ tbsMayMoc (không có database riêng ở đây, xem
// src/lib/tbsMayMoc.ts), đầy đủ cột + danh mục lọc giống hệt trang Máy móc bên tbsMayMoc.
export async function GET() {
  try {
    const [machines, filters] = await Promise.all([fetchTbsMachines(), fetchMachineFilterOptions()]);
    const data = machines.map((m) => ({
      id: m.id,
      code: m.code,
      name: m.name,
      serial: m.serialNumber,
      factoryId: m.area?.parent?.id ?? null,
      factoryName: m.area?.parent?.name ?? null,
      areaId: m.area?.id ?? null,
      areaName: m.area?.name ?? null,
      zone: areaLabel(m.area),
      teamId: m.team?.id ?? null,
      teamName: m.team?.name ?? null,
      lineId: m.productionLine?.id ?? null,
      lineName: m.productionLine?.name ?? null,
      machineTypeId: m.machineType?.id ?? null,
      machineTypeName: m.machineType?.name ?? null,
      statusId: m.status.id,
      statusName: m.status.name,
      statusColorHex: m.status.colorHex,
      originalCost: m.originalCost,
      depreciationPercent: m.depreciationPercent,
      remainingValue: m.remainingValue,
      qrData: m.code,
    }));
    return NextResponse.json({ success: true, data, filters });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được dữ liệu máy móc từ tbsMayMoc";
    console.error("GET /api/maintenance/machines:", message);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

// Thêm máy mới — chuyển tiếp thẳng sang tbsMayMoc, không lưu gì ở đây. tbsMayMoc tự chặn nếu
// Khu vực chọn nằm ngoài phạm vi Tổ hợp KG (403), lỗi được trả nguyên văn ra cho người dùng.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MachineWriteInput;
    if (!body.code?.trim() || !body.name?.trim() || !body.location?.trim() || !body.areaId) {
      return NextResponse.json(
        { success: false, error: "Thiếu Mã tài sản / Tên máy / Vị trí / Khu vực" },
        { status: 400 },
      );
    }
    const machine = await createTbsMachine(body);
    return NextResponse.json({ success: true, data: machine }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không tạo được máy mới";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
