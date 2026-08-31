export async function ensureKaizenSchema(db: any) {
  if (!db) return;
  try {
    // Add missing columns if they don't exist
    const columns = [
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN trang_thai TEXT DEFAULT "CHO_DUYET"',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN line TEXT',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN nguoi_kiem_chung TEXT',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN anh_kiem_chung_json TEXT',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN nhan_xet_kiem_chung TEXT',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN so_giay_tiet_kiem INTEGER DEFAULT 0',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN diem_hieu_qua REAL DEFAULT 0.0',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN diem_tong_hop REAL DEFAULT 0.0',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN hang_xep INTEGER DEFAULT 0',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN merged_into_id TEXT',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN review_status TEXT DEFAULT "CHO_DUYET"',
      'ALTER TABLE ci_kaizen_proposals ADD COLUMN is_archived INTEGER DEFAULT 0',
    ];

    for (const sql of columns) {
      await db.prepare(sql).run().catch(() => {});
    }

    // Create merged proposals tracking table if not existing
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ci_kaizen_merged_proposals (
        id TEXT PRIMARY KEY,
        original_proposal_id TEXT NOT NULL,
        merged_proposal_id TEXT NOT NULL,
        attachments_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // Sync saved_seconds to so_giay_tiet_kiem if 0
    await db.prepare(`
      UPDATE ci_kaizen_proposals
      SET so_giay_tiet_kiem = saved_seconds
      WHERE (so_giay_tiet_kiem IS NULL OR so_giay_tiet_kiem = 0) AND saved_seconds > 0
    `).run().catch(() => {});

    // Sync score_points to diem_hieu_qua if 0
    await db.prepare(`
      UPDATE ci_kaizen_proposals
      SET diem_hieu_qua = score_points
      WHERE (diem_hieu_qua IS NULL OR diem_hieu_qua = 0) AND score_points > 0
    `).run().catch(() => {});

    // Backfill trang_thai and review_status from legacy status values
    await db.prepare(`
      UPDATE ci_kaizen_proposals
      SET trang_thai = CASE
        WHEN (registration_type = 'DA_GOP' OR sub_status = 'DA_GOP' OR status = 'MERGED') THEN 'DA_GOP'
        WHEN (approval_status = 'TU_CHOI' OR sub_status = 'TU_CHOI_TRIEN_KHAI' OR status = 'REJECTED' OR trang_thai = 'CAN_CHINH_SUA') THEN 'CAN_CHINH_SUA'
        WHEN (sub_status = 'DA_DANH_GIA' OR approval_status = 'DA_DANH_GIA' OR score_points > 0 OR avg_rating > 0) THEN 'DA_DANH_GIA'
        ELSE 'CHO_DUYET'
      END,
      review_status = CASE
        WHEN (approval_status = 'TU_CHOI' OR sub_status = 'TU_CHOI_TRIEN_KHAI' OR status = 'REJECTED') THEN 'CAN_CHINH_SUA'
        WHEN (sub_status = 'DA_DANH_GIA' OR approval_status = 'DA_DANH_GIA' OR score_points > 0 OR avg_rating > 0) THEN 'DA_DANH_GIA'
        ELSE 'CHO_DUYET'
      END
      WHERE trang_thai IS NULL OR trang_thai = '' OR trang_thai = 'SUBMITTED' OR trang_thai = 'CHO_REVIEW'
    `).run().catch(() => {});

    // Update is_archived flag
    await db.prepare(`
      UPDATE ci_kaizen_proposals
      SET is_archived = CASE
        WHEN (sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED') THEN 1
        ELSE 0
      END
      WHERE is_archived IS NULL
    `).run().catch(() => {});

  } catch (err) {
    console.error("[ensureKaizenSchema] Migration error:", err);
  }
}
