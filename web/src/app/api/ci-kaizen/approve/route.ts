import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { convertNumberToWords } from '@/lib/numberToWords';

export const dynamic = 'force-static';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const session = token ? await verifyToken(token) : null;

    // 🔴 SECURITY GUARD 1: Authentication check
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu đăng nhập để thực hiện phê duyệt (401 Unauthorized)' },
        { status: 401 }
      );
    }

    // 🔴 SECURITY GUARD 2: Role authorization check
    const roleCode = String((session as any)?.roleCode || (session as any)?.role || '').toUpperCase();
    const userEmpCode = String((session as any)?.empCode || '').trim();
    const userRoles = Array.isArray((session as any)?.roles) ? (session as any).roles : [];
    const isExecutiveOrAdmin = Boolean((session as any)?.isExecutiveOrAdmin) || ['TONG_GIAM_DOC', 'ADMIN', 'PHO_GIAM_DOC'].includes(roleCode) || userEmpCode === '201809012';
    const isApproverRole =
      isExecutiveOrAdmin ||
      (Boolean((session as any)?.levelRank) && Number((session as any).levelRank) >= 3) ||
      userEmpCode === '201809012' ||
      userRoles.includes('deputy_director') ||
      userRoles.includes('ci') ||
      ['TONG_GIAM_DOC', 'PHO_TONG_GIAM_DOC', 'GIAM_DOC', 'PHO_GIAM_DOC', 'TRUONG_PHONG', 'CI_LEAD', 'QC', 'ADMIN'].includes(roleCode);

    if (!isApproverRole) {
      return NextResponse.json(
        { success: false, message: 'Tài khoản của bạn không có quyền phê duyệt đề xuất này (403 Forbidden)' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      proposalId,
      decision,
      note,
      timeBeforeSeconds,
      timeAfterSeconds,
      savedSeconds,
      efficiencyValueVND,
      pairQuantity,
      so_luong_giay,
      totalSavingsVND,
      tong_tien_tiet_kiem,
      totalSavingsWords,
      tong_tien_bang_chu,
    } = body;

    if (!proposalId) {
      return NextResponse.json({ success: false, message: 'Mã đề xuất không hợp lệ' }, { status: 400 });
    }

    const pairQty = Number(pairQuantity || so_luong_giay || 0);
    const totalSavings = Number(totalSavingsVND || tong_tien_tiet_kiem || 0);
    const totalSavingsWordsVal = String(
      totalSavingsWords || tong_tien_bang_chu || (totalSavings > 0 ? convertNumberToWords(totalSavings) : 'Không đồng')
    );
    const timeBefore = Number(timeBeforeSeconds || 0);
    const timeAfter = Number(timeAfterSeconds || 0);
    const savedSecs = Number(savedSeconds || Math.max(0, timeBefore - timeAfter));
    const efficiencyVnd = Number(efficiencyValueVND || Math.round(savedSecs * 12.5));

    const isApproved = decision === 'APPROVE';
    const status = isApproved ? 'UNDER_REVIEW' : 'REJECTED';
    const subStatus = isApproved ? 'CHO_DANH_GIA' : 'TU_CHOI_TRIEN_KHAI';
    const approvalStatus = isApproved ? 'PHE_DUYET' : 'TU_CHOI';

    const afterImageUrl = body.after_image_url || body.afterImageUrl || null;
    const attachmentsJson = body.attachments_json || body.attachmentsJson || null;
    const categoryVal = body.category || null;

    const db = getDbBinding();

    if (db) {
      try {
        // Auto-migration: ensure new columns exist in ci_kaizen_proposals
        await db.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN pair_quantity INTEGER DEFAULT 0').run().catch(() => {});
        await db.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN total_savings_vnd REAL DEFAULT 0').run().catch(() => {});
        await db.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN total_savings_words TEXT').run().catch(() => {});
        await db.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN after_image_url TEXT').run().catch(() => {});
        await db.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN attachments_json TEXT').run().catch(() => {});
        await db.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN category TEXT').run().catch(() => {});

        const query = `
          UPDATE ci_kaizen_proposals
          SET approval_status = ?,
              sub_status = ?,
              status = ?,
              category = COALESCE(?, category),
              time_before_seconds = ?,
              time_after_seconds = ?,
              saved_seconds = ?,
              efficiency_value_vnd = ?,
              pair_quantity = ?,
              total_savings_vnd = ?,
              total_savings_words = ?,
              after_image_url = COALESCE(?, after_image_url),
              attachments_json = COALESCE(?, attachments_json),
              review_comment = COALESCE(?, review_comment),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        await db
          .prepare(query)
          .bind(
            approvalStatus,
            subStatus,
            status,
            categoryVal,
            timeBefore,
            timeAfter,
            savedSecs,
            efficiencyVnd,
            pairQty,
            totalSavings,
            totalSavingsWordsVal,
            afterImageUrl,
            attachmentsJson,
            note || null,
            proposalId
          )
          .run();

        // Log audit history
        await db
          .prepare(`
            INSERT INTO ci_kaizen_status_history (
              proposal_id, from_status, to_status, action, actor_id, actor_name, note, created_at
            ) VALUES (?, 'SUBMITTED', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `)
          .bind(
            proposalId,
            subStatus,
            isApproved ? 'APPROVE' : 'REJECT',
            session?.empCode || 'ADMIN-2026',
            session?.name || 'Người Phê Duyệt',
            note || (isApproved ? 'Đã phê duyệt tính khả thi (Bước 3)' : 'Từ chối triển khai')
          )
          .run()
          .catch(() => {});
      } catch (dbErr) {
        console.warn('[APPROVE API] DB update warning:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: isApproved ? 'Đã phê duyệt sáng kiến thành công!' : 'Đã từ chối triển khai sáng kiến.',
      status,
      sub_status: subStatus,
      approval_status: approvalStatus,
      time_before_seconds: timeBefore,
      time_after_seconds: timeAfter,
      saved_seconds: savedSecs,
      efficiency_value_vnd: efficiencyVnd,
      pair_quantity: pairQty,
      total_savings_vnd: totalSavings,
      total_savings_words: totalSavingsWordsVal,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi xử lý phê duyệt';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
