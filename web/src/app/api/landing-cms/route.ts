import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ success: true, data: null });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    return NextResponse.json({
      success: true,
      message: "Lưu cấu hình CMS thành công (local stub).",
      data: body,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: null });
  }
}
