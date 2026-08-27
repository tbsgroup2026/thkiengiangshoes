import { NextResponse } from "next/server";

// Required for Next.js static export (output: export).
// In production on Cloudflare Workers, the Worker intercepts ALL /api/landing-cms
// requests BEFORE serving static assets — D1 persistence is handled in _worker.js.
// This stub only runs in local dev as a fallback.
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ success: true, data: null, source: "nextjs_static_stub" });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "CMS saved (local dev stub). In production, Cloudflare Worker handles D1 persistence.",
    updatedAt: new Date().toISOString(),
  });
}
