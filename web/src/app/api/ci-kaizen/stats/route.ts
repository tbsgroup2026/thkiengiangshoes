import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET() {
  try {
    const db = getDbBinding();

    if (db) {
      try {
        // Auto-migration: ensure required columns exist
        await db.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN is_thi_dua INTEGER DEFAULT 1').run().catch(() => {});
        await db.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN sub_status TEXT DEFAULT "CHO_DANH_GIA"').run().catch(() => {});
        await db.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN approval_status TEXT DEFAULT "PHE_DUYET"').run().catch(() => {});
      } catch (e) {}

      // Overall counts query across ALL proposals in system
      const countsQuery = `
        SELECT 
          SUM(CASE WHEN COALESCE(is_thi_dua, 1) = 1 OR registration_type = 'THI_DUA' OR sub_status IN ('CHO_DANH_GIA', 'DA_DANH_GIA') THEN 1 ELSE 0 END) as thi_dua_count,
          SUM(CASE WHEN (sub_status = 'CHO_REVIEW' OR (approval_status = 'PENDING' AND sub_status NOT IN ('CHO_DANH_GIA', 'DA_DANH_GIA', 'LUU_TRU'))) THEN 1 ELSE 0 END) as cho_review_count,
          SUM(CASE WHEN (sub_status = 'CHO_DANH_GIA' OR (approval_status = 'PHE_DUYET' AND sub_status NOT IN ('DA_DANH_GIA', 'LUU_TRU'))) THEN 1 ELSE 0 END) as cho_danh_gia_count,
          SUM(CASE WHEN (sub_status = 'DA_DANH_GIA' OR approval_status = 'DA_DANH_GIA' OR (COALESCE(average_score, 0) > 0 AND sub_status NOT IN ('CHO_REVIEW', 'CHO_DANH_GIA'))) THEN 1 ELSE 0 END) as da_danh_gia_count,
          SUM(CASE WHEN (sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED') THEN 1 ELSE 0 END) as luu_tru_count
        FROM ci_kaizen_proposals
      `;

      const countsRes = await db.prepare(countsQuery).first().catch(() => null);

      // Region breakdown query
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
