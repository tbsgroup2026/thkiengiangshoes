import { NextResponse } from 'next/server';
import { ensureKaizenSchema } from '@/lib/kaizenDbMigration';

export const dynamic = 'force-static';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

// Function to trigger real-time leaderboard recalculation
async function recalculateLeaderboardRanks(db: any) {
  try {
    const query = `
      SELECT id, so_giay_tiet_kiem, saved_seconds, diem_hieu_qua, score_points
      FROM ci_kaizen_proposals
      WHERE trang_thai IN ('DA_DANH_GIA', 'DA_XEP_HANG') OR sub_status = 'DA_DANH_GIA'
    `;
    const { results } = await db.prepare(query).all();
    if (!results || results.length === 0) return;

    // Calculate score for each proposal and sort descending
    const scoredList = results.map((p: any) => {
      const savingsSecs = Number(p.so_giay_tiet_kiem || p.saved_seconds || 0);
      const efficiencyScore = Number(p.diem_hieu_qua || p.score_points || 0);
      // Default direct sum formula
      const totalScore = savingsSecs + efficiencyScore;
      return { id: p.id, totalScore };
    });

    scoredList.sort((a: any, b: any) => b.totalScore - a.totalScore);

    // Update ranks in D1
    for (let i = 0; i < scoredList.length; i++) {
      const rank = i + 1;
      const item = scoredList[i];
      await db
        .prepare(`
          UPDATE ci_kaizen_proposals
          SET hang_xep = ?,
              diem_tong_hop = ?,
              trang_thai = 'DA_DANH_GIA',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(rank, item.totalScore, item.id)
        .run()
        .catch(() => {});
    }
  } catch (err) {
    console.error('[recalculateLeaderboardRanks] Error:', err);
  }
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
      proposalId,
      result, // 'PASS' | 'FAIL'
      verificationPhotos = [], // Array of field photo URLs
      reviewComments = '',
      savedSeconds = 0,
      efficiencyScore = 0,
      reviewerName = '',
    } = body;

    if (!proposalId || !result) {
      return NextResponse.json({ error: 'Mã đề xuất và Kết quả sơ duyệt (Đạt/Không đạt) là bắt buộc' }, { status: 400 });
    }

    const verificationPhotosJson = JSON.stringify(verificationPhotos);
    const isPass = result.toUpperCase() === 'PASS';

    if (!isPass) {
      // ── FAIL (Không đạt): Return to submitter for modification ──────
      await db
        .prepare(`
          UPDATE ci_kaizen_proposals
          SET trang_thai = 'CAN_CHINH_SUA',
              sub_status = 'CAN_CHINH_SUA',
              review_status = 'CAN_CHINH_SUA',
              status = 'REJECTED',
              anh_kiem_chung_json = ?,
              nhan_xet_kiem_chung = ?,
              rejection_reason = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(
          verificationPhotosJson,
          reviewComments,
          reviewComments || 'Sơ duyệt hiện trường không đạt. Vui lòng chỉnh sửa và nộp lại.',
          proposalId
        )
        .run();

      return NextResponse.json({
        success: true,
        message: 'Đã lưu kết quả Không đạt. Đề xuất đã được trả về cho người nộp để chỉnh sửa và nộp lại.',
        trang_thai: 'CAN_CHINH_SUA',
        proposalId,
      });
    } else {
      // ── PASS (Đạt): Move directly to DA_DANH_GIA & store metrics ─────
      const secs = Number(savedSeconds || 0);
      const eff = Number(efficiencyScore || 0);
      const totalScore = secs + eff;

      await db
        .prepare(`
          UPDATE ci_kaizen_proposals
          SET trang_thai = 'DA_DANH_GIA',
              sub_status = 'DA_DANH_GIA',
              review_status = 'DA_DANH_GIA',
              status = 'APPROVED',
              anh_kiem_chung_json = ?,
              nhan_xet_kiem_chung = ?,
              saved_seconds = ?,
              so_giay_tiet_kiem = ?,
              score_points = ?,
              diem_hieu_qua = ?,
              diem_tong_hop = ?,
              evaluated_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(
          verificationPhotosJson,
          reviewComments,
          secs,
          secs,
          eff,
          eff,
          totalScore,
          proposalId
        )
        .run();

      // Recalculate leaderboard ranks for all DA_DANH_GIA proposals
      await recalculateLeaderboardRanks(db);

      return NextResponse.json({
        success: true,
        message: 'Sơ duyệt ĐẠT! Ý tưởng đã đạt chuẩn, lưu trữ số liệu Tiết kiệm/Hiệu quả và đưa vào bảng xếp hạng.',
        trang_thai: 'DA_DANH_GIA',
        so_giay_tiet_kiem: secs,
        diem_hieu_qua: eff,
        diem_tong_hop: totalScore,
        proposalId,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi sơ duyệt hiện trường';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
