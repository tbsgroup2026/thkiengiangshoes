import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const session = token ? await verifyToken(token) : null;

    const body = await request.json();
    const {
      proposalId,
      evaluatorEmpCode,
      evaluatorName,
      evaluatorTitle = 'Chuyên gia Đánh giá CI / Ban Giám Đốc',
      prerequisitePass = true,
      criterion1Score = 0,
      criterion2Score = 0,
      criterion3Score = 0,
      criterion4Score = 0,
      criterion5Score = 0,
      comments = '',
      decision = 'APPROVED', // APPROVED, REJECTED, UNDER_REVIEW
    } = body;

    if (!proposalId) {
      return NextResponse.json({ error: 'Mã đề xuất Kaizen không hợp lệ' }, { status: 400 });
    }

    const roleCode = String((session as any)?.roleCode || (session as any)?.role || '').toUpperCase();
    const userEmpCode = String((session as any)?.empCode || '').trim();
    const userRoles = Array.isArray((session as any)?.roles) ? (session as any).roles : [];
    const isExecutiveOrAdmin = Boolean((session as any)?.isExecutiveOrAdmin) || ['TONG_GIAM_DOC', 'ADMIN', 'PHO_GIAM_DOC'].includes(roleCode) || userEmpCode === '201809012';
    const isJudgeRole =
      isExecutiveOrAdmin ||
      (Boolean((session as any)?.levelRank) && Number((session as any).levelRank) >= 3) ||
      userEmpCode === '201809012' ||
      userRoles.includes('deputy_director') ||
      userRoles.includes('ci') ||
      ['TONG_GIAM_DOC', 'PHO_TONG_GIAM_DOC', 'GIAM_DOC', 'PHO_GIAM_DOC', 'TRUONG_PHONG', 'CI_LEAD', 'QC', 'ADMIN'].includes(roleCode);

    if (!isJudgeRole && session) {
      return NextResponse.json(
        { error: 'Tài khoản của bạn không có quyền chấm điểm đề xuất này' },
        { status: 403 }
      );
    }

    const c1 = Number(criterion1Score) || 0;
    const c2 = Number(criterion2Score) || 0;
    const c3 = Number(criterion3Score) || 0;
    const c4 = Number(criterion4Score) || 0;
    const c5 = Number(criterion5Score) || 0;
    const totalScore = c1 + c2 + c3 + c4 + c5;

    const evalId = `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const empCode = evaluatorEmpCode || session?.empCode || 'EVAL-001';
    const name = evaluatorName || session?.name || 'Hội Đồng Đánh Giá CI';

    const db = getDbBinding();

    if (db) {
      // 1. Insert expert evaluation record
      const insertEvalQuery = `
        INSERT INTO ci_kaizen_expert_evaluations (
          id, proposal_id, evaluator_emp_code, evaluator_name, evaluator_title,
          prerequisite_pass, criterion1_score, criterion2_score, criterion3_score,
          criterion4_score, criterion5_score, total_score, comments, status, confirmed_at, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, 'CONFIRMED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `;

      await db
        .prepare(insertEvalQuery)
        .bind(
          evalId,
          proposalId,
          empCode,
          name,
          evaluatorTitle,
          prerequisitePass ? 1 : 0,
          c1,
          c2,
          c3,
          c4,
          c5,
          totalScore,
          comments
        )
        .run();

      // 2. Update proposal overall status & average score
      const updateProposalQuery = `
        UPDATE ci_kaizen_proposals
        SET score_points = ?,
            avg_rating = ?,
            status = ?,
            sub_status = 'DA_DANH_GIA',
            evaluated_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const finalStatus = decision || (totalScore >= 50 ? 'APPROVED' : 'REJECTED');
      const starRating = Math.min(5, Math.max(1, (totalScore / 100) * 5));

      await db.prepare(updateProposalQuery).bind(totalScore, starRating, finalStatus, proposalId).run();

      return NextResponse.json({
        success: true,
        message: 'Đã lưu kết quả đánh giá Chuyên Gia vào D1 thành công!',
        evaluation: {
          evalId,
          proposalId,
          totalScore,
          finalStatus,
          starRating,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Đã lưu kết quả đánh giá (Demo Local)!',
      evaluation: {
        evalId,
        proposalId,
        totalScore,
        finalStatus: decision,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi chấm điểm đánh giá Kaizen';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
