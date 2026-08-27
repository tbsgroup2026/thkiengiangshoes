import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { verifyToken } from '@/lib/auth';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('proposalId');

    if (!proposalId) {
      return NextResponse.json({ error: 'Thiếu proposalId' }, { status: 400 });
    }

    const db = getDbBinding();

    if (db) {
      const query = `SELECT * FROM ci_kaizen_expert_evaluations WHERE proposal_id = ? ORDER BY created_at DESC`;
      const { results } = await db.prepare(query).bind(proposalId).all();

      const myEvaluation = results && results.length > 0 ? results[0] : null;

      return NextResponse.json({
        success: true,
        data: {
          evaluations: results || [],
          myEvaluation,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        evaluations: [],
        myEvaluation: null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi lấy bảng chấm điểm';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const session = token ? await verifyToken(token) : null;

    const body = await request.json();
    const {
      action,
      proposalId,
      judgeEmpCode,
      prerequisitePass = true,
      c1Score = 0,
      c2Score = 0,
      c3Score = 0,
      c4Score = 0,
      c5Score = 0,
      comments = '',
    } = body;

    if (!proposalId) {
      return NextResponse.json({ error: 'Vui lòng cung cấp proposalId' }, { status: 400 });
    }

    const db = getDbBinding();

    if (action === 'ASSIGN_JUDGE') {
      return NextResponse.json({
        success: true,
        message: `Đã phân công Giám Khảo ${judgeEmpCode} chấm điểm đề xuất!`,
      });
    }

    if (action === 'REMOVE_JUDGE') {
      return NextResponse.json({
        success: true,
        message: `Đã gỡ quyền chấm điểm của Giám Khảo ${judgeEmpCode}!`,
      });
    }

    // Default action: SAVE_DRAFT or CONFIRM
    const c1 = Number(c1Score) || 0;
    const c2 = Number(c2Score) || 0;
    const c3 = Number(c3Score) || 0;
    const c4 = Number(c4Score) || 0;
    const c5 = Number(c5Score) || 0;
    const totalScore = c1 + c2 + c3 + c4 + c5;
    const evalId = `eval_${Date.now()}`;
    const status = action === 'CONFIRM' ? 'CONFIRMED' : 'DRAFT';

    if (db) {
      const insertQuery = `
        INSERT INTO ci_kaizen_expert_evaluations (
          id, proposal_id, evaluator_emp_code, evaluator_name, evaluator_title,
          prerequisite_pass, criterion1_score, criterion2_score, criterion3_score,
          criterion4_score, criterion5_score, total_score, comments, status, confirmed_at, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, 'Hội Đồng Đánh Giá CI',
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `;

      await db
        .prepare(insertQuery)
        .bind(
          evalId,
          proposalId,
          session?.empCode || 'EVAL-001',
          session?.name || 'Chuyên Gia CI',
          prerequisitePass ? 1 : 0,
          c1,
          c2,
          c3,
          c4,
          c5,
          totalScore,
          comments,
          status
        )
        .run();

      if (action === 'CONFIRM') {
        const updateQuery = `
          UPDATE ci_kaizen_proposals
          SET score_points = ?,
              status = 'APPROVED',
              sub_status = 'DA_DANH_GIA',
              evaluated_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        await db.prepare(updateQuery).bind(totalScore, proposalId).run();
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'CONFIRM' ? 'Đã xác nhận & chốt điểm chấm chuyên gia thành công!' : 'Đã lưu nháp bảng chấm điểm!',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi xử lý đánh giá chuyên gia';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
