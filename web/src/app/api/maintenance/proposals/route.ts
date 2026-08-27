import { NextResponse } from "next/server";
import { fetchTbsProposals } from "@/lib/tbsMayMoc";

// Đề xuất (cần vật tư / đào tạo lại / đang chờ xử lý, đã được Trưởng team xác nhận) — dữ liệu
// thật từ tbsMayMoc.
export async function GET() {
  try {
    const data = await fetchTbsProposals();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được đề xuất từ tbsMayMoc";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
