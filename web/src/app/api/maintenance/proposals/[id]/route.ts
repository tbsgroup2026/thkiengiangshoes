import { NextResponse } from "next/server";
import { resolveTbsProposal } from "@/lib/tbsMayMoc";

// Đánh dấu 1 đề xuất đã xử lý xong / bỏ đánh dấu — chuyển tiếp thẳng sang tbsMayMoc.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = (await req.json()) as { resolved: boolean };
    const proposal = await resolveTbsProposal(id, !!body.resolved);
    return NextResponse.json({ success: true, data: proposal });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không cập nhật được đề xuất";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
