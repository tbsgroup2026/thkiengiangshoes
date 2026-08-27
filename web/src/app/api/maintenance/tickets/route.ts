import { NextResponse } from "next/server";
import { fetchTbsIncidents, INCIDENT_STATUS_LABEL } from "@/lib/tbsMayMoc";

// Bảo Dưỡng MMTB / Nhu Cầu Sửa Chữa (cùng dùng chung 1 trang) — lấy dữ liệu Sự cố THẬT từ
// tbsMayMoc (xem src/lib/tbsMayMoc.ts). Route này trước đây không tồn tại — trang chỉ hiện 2 dòng
// dữ liệu giả cứng trong code, giờ nối thật.
export async function GET() {
  try {
    const incidents = await fetchTbsIncidents();
    const data = incidents.map((i) => ({
      id: i.id,
      ticketCode: `SC-${i.id.slice(-6).toUpperCase()}`,
      machineCode: i.machine.code,
      machineName: i.machine.name,
      zone: i.machine.areaName,
      factoryName: i.machine.factoryName,
      reporter: i.isMaintenanceDue ? "Hệ thống (nhắc bảo trì định kỳ)" : (i.reporter?.name ?? "—"),
      mechanic: i.assignedTo?.name ?? null,
      errorType: i.categoryName ?? i.description,
      description: i.description,
      status: i.status,
      statusLabel: INCIDENT_STATUS_LABEL[i.status],
      reportedAt: i.createdAt,
      acceptedAt: i.acceptedAt,
      completedAt: i.completedAt,
    }));
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được dữ liệu sự cố từ tbsMayMoc";
    console.error("GET /api/maintenance/tickets:", message);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
