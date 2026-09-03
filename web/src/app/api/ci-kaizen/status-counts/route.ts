import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { ensureKaizenSchema } from '@/lib/kaizenDbMigration';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET() {
  try {
    const db = getDbBinding();

    if (db) {
      await ensureKaizenSchema(db);

      // ── Status counts (Loại đăng ký) ────────────────────────────────────
      const countsQuery = `
        SELECT 
          SUM(CASE WHEN (COALESCE(trang_thai, sub_status) IN ('CHO_DUYET', 'CHO_DANH_GIA', 'DA_DANH_GIA', 'DA_XEP_HANG') AND COALESCE(is_archived, 0) = 0) THEN 1 ELSE 0 END) as thi_dua,
          SUM(CASE WHEN (COALESCE(trang_thai, sub_status, review_status) = 'CHO_DUYET' OR COALESCE(trang_thai, sub_status, review_status) = 'CHO_PHE_DUYET') AND COALESCE(is_archived, 0) = 0 THEN 1 ELSE 0 END) as cho_phe_duyet,
          SUM(CASE WHEN (COALESCE(trang_thai, sub_status, review_status) = 'CHO_DANH_GIA' AND COALESCE(is_archived, 0) = 0) THEN 1 ELSE 0 END) as cho_danh_gia,
          SUM(CASE WHEN ((COALESCE(trang_thai, sub_status, review_status) = 'DA_DANH_GIA' OR COALESCE(trang_thai, sub_status, review_status) = 'DA_XEP_HANG') AND COALESCE(is_archived, 0) = 0) THEN 1 ELSE 0 END) as da_danh_gia,
          SUM(CASE WHEN (COALESCE(is_archived, 0) = 1 OR registration_type = 'LUU_TRU' OR sub_status = 'LUU_TRU' OR trang_thai = 'DA_GOP') THEN 1 ELSE 0 END) as luu_tru
        FROM ci_kaizen_proposals
      `;

      const countsRes = await db.prepare(countsQuery).first().catch(() => null);

      // ── Region counts (Khu vực) — GROUP BY factory which stores area name ─
      const regionsQuery = `
        SELECT factory, COUNT(*) as cnt 
        FROM ci_kaizen_proposals 
        WHERE factory IS NOT NULL AND factory != ''
        GROUP BY factory
      `;
      const { results: regionResults } = await db.prepare(regionsQuery).all().catch(() => ({ results: [] }));

      const regionMap: Record<string, number> = {};
      if (Array.isArray(regionResults)) {
        for (const row of regionResults) {
          if (row.factory) regionMap[String(row.factory)] = Number(row.cnt || 0);
        }
      }

      // ── Category counts (Phân loại) — GROUP BY category ─────────────────
      const categoryQuery = `
        SELECT category, COUNT(*) as cnt 
        FROM ci_kaizen_proposals 
        WHERE category IS NOT NULL AND category != ''
        GROUP BY category
      `;
      const { results: categoryResults } = await db.prepare(categoryQuery).all().catch(() => ({ results: [] }));

      const categoryMap: Record<string, number> = {};
      if (Array.isArray(categoryResults)) {
        for (const row of categoryResults) {
          if (row.category) categoryMap[String(row.category)] = Number(row.cnt || 0);
        }
      }

      const counts = {
        thi_dua: Number(countsRes?.thi_dua || 0),
        cho_phe_duyet: Number(countsRes?.cho_phe_duyet || 0),
        cho_danh_gia: Number(countsRes?.cho_danh_gia || 0),
        da_danh_gia: Number(countsRes?.da_danh_gia || 0),
        luu_tru: Number(countsRes?.luu_tru || 0),
      };

      return NextResponse.json(
        {
          success: true,
          counts,
          regions: regionMap,
          category_counts: categoryMap,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      counts: {
        thi_dua: 0,
        cho_phe_duyet: 0,
        cho_danh_gia: 0,
        da_danh_gia: 0,
        luu_tru: 0,
      },
      regions: {},
      category_counts: {},
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi lấy status-counts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
