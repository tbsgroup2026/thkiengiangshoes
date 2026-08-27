import { NextResponse } from "next/server";
import { fetchTbsAnnouncements, createTbsAnnouncement, type AnnouncementWriteInput } from "@/lib/tbsMayMoc";

// Thông báo — soạn + gửi push THẬT tới nhân viên KG qua App Mobile Native, dữ liệu ở tbsMayMoc.
// tbsMayMoc tự bắt buộc chọn đúng 1 Nhà máy trong phạm vi Tổ hợp KG (không cho gửi cho cả công ty).
export async function GET() {
  try {
    const data = await fetchTbsAnnouncements();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không lấy được thông báo từ tbsMayMoc";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnnouncementWriteInput;
    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ success: false, error: "Thiếu tiêu đề hoặc nội dung" }, { status: 400 });
    }
    if (!body.targetFactoryId) {
      return NextResponse.json({ success: false, error: "Vui lòng chọn Nhà máy nhận thông báo" }, { status: 400 });
    }
    const announcement = await createTbsAnnouncement(body);
    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không gửi được thông báo";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
