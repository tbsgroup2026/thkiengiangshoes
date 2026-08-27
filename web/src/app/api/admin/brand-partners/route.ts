import { NextResponse } from "next/server";
import { DEFAULT_BRAND_PARTNERS } from "@/lib/landingCMS";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ success: true, data: DEFAULT_BRAND_PARTNERS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      message: "Thêm logo thương hiệu thành công (local stub).",
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}
