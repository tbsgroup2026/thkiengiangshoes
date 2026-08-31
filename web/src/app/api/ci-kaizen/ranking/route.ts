import { NextResponse } from 'next/server';
import { ensureKaizenSchema } from '@/lib/kaizenDbMigration';

export const dynamic = 'force-static';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET(request: Request) {
  try {
    const db = getDbBinding();
    if (!db) {
      return NextResponse.json({ success: true, leaderboard: [] });
    }

    await ensureKaizenSchema(db);

    const { searchParams } = new URL(request.url);
    const weightSavings = Number(searchParams.get('weight_savings') || 1.0);
    const weightEfficiency = Number(searchParams.get('weight_efficiency') || 1.0);

    const query = `
      SELECT * FROM ci_kaizen_proposals
      WHERE trang_thai IN ('DA_DANH_GIA', 'DA_XEP_HANG')
         OR sub_status = 'DA_DANH_GIA'
         OR (score_points > 0 AND (trang_thai IS NULL OR trang_thai != 'DA_GOP'))
      ORDER BY created_at DESC
    `;

    const { results } = await db.prepare(query).all();

    if (!results || results.length === 0) {
      return NextResponse.json({ success: true, leaderboard: [] });
    }

    // Calculate composite score for each proposal
    const rankedList = results.map((p: any) => {
      const savingsSecs = Number(p.so_giay_tiet_kiem || p.saved_seconds || 0);
      const efficiencyScore = Number(p.diem_hieu_qua || p.score_points || 0);
      const totalScore = Math.round((savingsSecs * weightSavings + efficiencyScore * weightEfficiency) * 10) / 10;

      return {
        ...p,
        so_giay_tiet_kiem: savingsSecs,
        diem_hieu_qua: efficiencyScore,
        diem_tong_hop: totalScore,
      };
    });

    // Sort by composite score descending
    rankedList.sort((a: any, b: any) => b.diem_tong_hop - a.diem_tong_hop);


    // Update ranks in database
    for (let i = 0; i < rankedList.length; i++) {
      const rank = i + 1;
      const item = rankedList[i];
      item.hang_xep = rank;

      await db
        .prepare(`
          UPDATE ci_kaizen_proposals
          SET hang_xep = ?,
              diem_tong_hop = ?,
              trang_thai = 'DA_DANH_GIA',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(rank, item.diem_tong_hop, item.id)
        .run()
        .catch(() => {});
    }

    return NextResponse.json({
      success: true,
      count: rankedList.length,
      leaderboard: rankedList,
      weights: { weightSavings, weightEfficiency },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi lấy bảng xếp hạng';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
