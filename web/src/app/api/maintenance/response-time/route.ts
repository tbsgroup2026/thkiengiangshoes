import { NextResponse } from "next/server";
import { fetchResponseTimeData } from "@/lib/tbsMayMoc";

// Thống kê thời gian phản hồi + đánh giá nhân viên bảo trì — dữ liệu thô thật từ tbsMayMoc, tính
// trung bình/xếp hạng ở client.
export async function GET() {
  try {
    const data = await fetchResponseTimeData();
    return NextResponse.json({ success: true, ...data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được dữ liệu từ tbsMayMoc";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
