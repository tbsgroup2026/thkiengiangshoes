import { NextResponse } from "next/server";
import { createTbsFloor } from "@/lib/tbsMayMoc";

// Tạo Tầng mới cho 1 Nhà máy — chuyển tiếp thẳng sang tbsMayMoc.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { factoryId: string; name: string };
    if (!body.factoryId || !body.name?.trim()) {
      return NextResponse.json({ success: false, error: "Thiếu Nhà máy hoặc tên Tầng" }, { status: 400 });
    }
    const floor = await createTbsFloor(body.factoryId, body.name.trim());
    return NextResponse.json({ success: true, data: floor }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không tạo được Tầng mới";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
