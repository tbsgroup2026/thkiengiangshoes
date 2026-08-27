import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ success: true, avatars: {} });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    return NextResponse.json({
      success: true,
      message: "Avatar updated (local stub)",
      avatars: body ? { [body.empCode || "user"]: body.avatarUrl || body.avatar } : {},
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, avatars: {} });
  }
}
