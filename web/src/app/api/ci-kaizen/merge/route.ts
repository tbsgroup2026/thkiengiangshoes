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
    const {
      originalProposalId,
      newProposalId,
      newAttachments = [],
      beforeDescription = '',
      afterSolution = '',
      proposerName = '',
    } = body;

    if (!originalProposalId) {
      return NextResponse.json({ error: 'Mã đề xuất gốc không được để trống' }, { status: 400 });
    }

    // 1. Fetch original proposal
    const originalRes = await db
      .prepare('SELECT * FROM ci_kaizen_proposals WHERE id = ?')
      .bind(originalProposalId)
      .first();

    if (!originalRes) {
      return NextResponse.json({ error: 'Không tìm thấy đề xuất gốc để gộp' }, { status: 404 });
    }

    // 2. Parse existing attachments and combine with new attachments
    let existingAttachments: any[] = [];
    if (originalRes.attachments_json) {
      try {
        existingAttachments = JSON.parse(originalRes.attachments_json);
      } catch (e) {}
    }

    const mergedAttachments = [
      ...existingAttachments,
      ...newAttachments.map((att: any) => ({
        ...att,
        mergedFrom: proposerName || 'Đề xuất trùng lặp',
        mergedAt: new Date().toISOString(),
      })),
    ];

    const mergedId = `mrg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 3. Log to ci_kaizen_merged_proposals
    await db
      .prepare(`
        INSERT INTO ci_kaizen_merged_proposals (
          id, original_proposal_id, merged_proposal_id, attachments_json, created_at
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `)
      .bind(
        mergedId,
        originalProposalId,
        newProposalId || mergedId,
        JSON.stringify(newAttachments)
      )
      .run();

    // 4. Update original proposal with combined attachments
    await db
      .prepare(`
        UPDATE ci_kaizen_proposals
        SET attachments_json = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(JSON.stringify(mergedAttachments), originalProposalId)
      .run();

    // 5. If newProposalId was created, mark its status as DA_GOP
    if (newProposalId) {
      await db
        .prepare(`
          UPDATE ci_kaizen_proposals
          SET trang_thai = 'DA_GOP',
              status = 'MERGED',
              registration_type = 'DA_GOP',
              merged_into_id = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(originalProposalId, newProposalId)
        .run();
    }

    return NextResponse.json({
      success: true,
      message: `Đã gộp thành công hình ảnh/video bổ sung vào đề xuất gốc ${originalRes.code || originalProposalId}!`,
      originalCode: originalRes.code,
      originalProposalId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi gộp đề xuất';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
