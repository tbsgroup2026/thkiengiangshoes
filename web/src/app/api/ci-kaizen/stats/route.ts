import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

const KG_FACTORIES_SQL = "('KG 1', 'KG 2', 'KG 3', 'Hoàn thiện đế', 'Kiên Giang 1', 'Kiên Giang 2', 'Kiên Giang 3', 'HTĐ KG', 'Phòng kế hoạch', 'Phòng CN-CI', 'Phòng chất lượng', 'Phòng nhân sự', 'P. Kế Hoạch', 'P. CN-CI', 'P. Chất Lượng', 'P. Nhân Sự')";

export async function GET() {
  try {
    const db = getDbBinding();

    if (db) {
      // 1. Overall counts query across ALL proposals in system
      const countsQuery = `
        SELECT 
          SUM(CASE WHEN is_thi_dua = 1 OR registration_type = 'THI_DUA' THEN 1 ELSE 0 END) as thi_dua_count,
          SUM(CASE WHEN (sub_status = 'CHO_REVIEW' OR (approval_status = 'PENDING' AND sub_status != 'CHO_DANH_GIA' AND sub_status != 'DA_DANH_GIA' AND sub_status != 'LUU_TRU')) THEN 1 ELSE 0 END) as cho_review_count,
          SUM(CASE WHEN (sub_status = 'CHO_DANH_GIA' OR (approval_status = 'PHE_DUYET' AND sub_status != 'DA_DANH_GIA' AND sub_status != 'LUU_TRU')) THEN 1 ELSE 0 END) as cho_danh_gia_count,
          SUM(CASE WHEN (sub_status = 'DA_DANH_GIA' OR approval_status = 'DA_DANH_GIA' OR (average_score > 0 AND sub_status != 'CHO_REVIEW' AND sub_status != 'CHO_DANH_GIA')) THEN 1 ELSE 0 END) as da_danh_gia_count,
          SUM(CASE WHEN (sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED') THEN 1 ELSE 0 END) as luu_tru_count
        FROM ci_kaizen_proposals
      `;

      const countsRes = await db.prepare(countsQuery).first().catch(() => null);

      // 2. Region breakdown query
      const regionsQuery = `
        SELECT region, COUNT(*) as cnt 
        FROM ci_kaizen_proposals 
        GROUP BY region
      `;
      const { results: regionResults } = await db.prepare(regionsQuery).all().catch(() => ({ results: [] }));

      const regionMap: Record<string, number> = {};
      if (Array.isArray(regionResults)) {
        for (const row of regionResults) {
          if (row.region) regionMap[row.region] = Number(row.cnt || 0);
        }
      }

      const stats = {
        thiDua: Number(countsRes?.thi_dua_count || 0),
        choReview: Number(countsRes?.cho_review_count || 0),
        choDanhGia: Number(countsRes?.cho_danh_gia_count || 0),
        daDanhGia: Number(countsRes?.da_danh_gia_count || 0),
        luuTru: Number(countsRes?.luu_tru_count || 0),
        regions: regionMap,
      };

      return NextResponse.json({
        success: true,
        stats,
      });
    }

    // Fallback if DB binding is unavailable
    return NextResponse.json({
      success: true,
      stats: {
        thiDua: 0,
        choReview: 0,
        choDanhGia: 0,
        daDanhGia: 0,
        luuTru: 0,
        regions: {},
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi lấy thống kê Kaizen';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
