import { NextResponse } from "next/server";

// This route is intentionally NOT force-static.
// In production on Cloudflare Workers, all requests to /api/landing-cms
// are intercepted and handled by _worker.js (with D1 persistence).
// This Next.js route serves as a fallback for local dev only.

let localCMSStore: any = null;

export async function GET() {
  if (localCMSStore) {
    return NextResponse.json({ success: true, data: localCMSStore });
  }
  return NextResponse.json({ success: true, data: null });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body) {
      return NextResponse.json({ success: false, error: "INVALID_BODY" }, { status: 400 });
    }
    // Local dev: keep in memory
    localCMSStore = body;
    return NextResponse.json({
      success: true,
      message: "Đã lưu cấu hình CMS (local dev mode).",
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
