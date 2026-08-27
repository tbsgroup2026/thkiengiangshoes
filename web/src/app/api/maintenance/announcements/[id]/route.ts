import { NextResponse } from "next/server";
import { updateTbsAnnouncement, deleteTbsAnnouncement, type AnnouncementWriteInput } from "@/lib/tbsMayMoc";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = (await req.json()) as AnnouncementWriteInput;
    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ success: false, error: "Thiếu tiêu đề hoặc nội dung" }, { status: 400 });
    }
    const announcement = await updateTbsAnnouncement(id, body);
    return NextResponse.json({ success: true, data: announcement });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không sửa được thông báo";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteTbsAnnouncement(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không xoá được thông báo";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
