import { NextResponse } from "next/server";
import { uploadTbsImage } from "@/lib/tbsMayMoc";

// Tải ảnh sơ đồ lên — chuyển tiếp thẳng sang tbsMayMoc (lưu R2 thật), trả về URL ảnh thật.
export async function POST(req: Request) {
  try {
    const { base64, mimeType } = (await req.json()) as { base64: string; mimeType: string };
    if (!base64) {
      return NextResponse.json({ success: false, error: "Thiếu dữ liệu ảnh" }, { status: 400 });
    }
    const url = await uploadTbsImage(base64, mimeType);
    return NextResponse.json({ success: true, url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không tải được ảnh lên";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
