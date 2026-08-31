import { NextResponse } from 'next/server';
import { ensureKaizenSchema } from '@/lib/kaizenDbMigration';

export const dynamic = 'force-static';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function POST(request: Request) {
  try {
    const db = getDbBinding();
    if (!db) {
      return NextResponse.json({ error: 'Không tìm thấy kết nối CSDL' }, { status: 500 });
    }

    await ensureKaizenSchema(db);

    const body = await request.json();
    const { proposalId, reviewerEmpCode, reviewerName } = body;

    if (!proposalId || !reviewerEmpCode) {
      return NextResponse.json({ error: 'Mã đề xuất và Cán bộ sơ duyệt là bắt buộc' }, { status: 400 });
    }

    const reviewerInfo = reviewerName ? `${reviewerName} (${reviewerEmpCode})` : reviewerEmpCode;

    await db
      .prepare(`
        UPDATE ci_kaizen_proposals
        SET nguoi_kiem_chung = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(reviewerInfo, proposalId)
      .run();

    return NextResponse.json({
      success: true,
      message: `Đã phân công cán bộ sơ duyệt ${reviewerInfo} thành công!`,
      proposalId,
      nguoi_kiem_chung: reviewerInfo,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi phân công cán bộ sơ duyệt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
