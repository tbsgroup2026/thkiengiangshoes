import { NextResponse } from "next/server";
import { deleteMapPath } from "@/lib/tbsMayMoc";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteMapPath(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không xoá được đường đi";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
