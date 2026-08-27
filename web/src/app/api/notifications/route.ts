import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      id: `notif_${Date.now()}`,
      message: "Notification created (local stub)",
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}
