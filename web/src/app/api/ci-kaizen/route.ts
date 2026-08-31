import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { verifyToken } from '@/lib/auth';
import { ensureKaizenSchema } from '@/lib/kaizenDbMigration';

const KG_FACTORIES_SQL = "('KG 1', 'KG 2', 'KG 3', 'Hoàn thiện đế', 'Kiên Giang 1', 'Kiên Giang 2', 'Kiên Giang 3', 'HTĐ KG', 'Phòng kế hoạch', 'Phòng CN-CI', 'Phòng chất lượng', 'Phòng nhân sự', 'P. Kế Hoạch', 'P. CN-CI', 'P. Chất Lượng', 'P. Nhân Sự')";

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET(request: Request) {
  try {
    const db = getDbBinding();

    if (db) {
      await ensureKaizenSchema(db);
      // Always fetch ALL proposals — filtering is done client-side in CIModule
      const query = `SELECT * FROM ci_kaizen_proposals WHERE factory IN ${KG_FACTORIES_SQL} ORDER BY created_at DESC LIMIT 500`;
      const { results } = await db.prepare(query).all();

      return NextResponse.json({
        success: true,
        data: results || [],
        proposals: results || [],
        scoped: 'Kiên Giang 1, 2, 3',
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
      proposals: [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi truy vấn Kaizen';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const session = token ? await verifyToken(token) : null;

    const db = getDbBinding();
    if (db) {
      await ensureKaizenSchema(db);
    }

    const body = await request.json();
    const {
      id: existingId,
      code: existingCode,
      title,
      category = 'PRODUCTIVITY',
      categoryLabel = '3.Tăng Năng suất',
      registrationType = 'THI_DUA',
      factory = 'Kiên Giang 1',
      department = 'Xưởng Sản Xuất KG',
      line = '',
      proposerName,
      proposerEmpCode,
      proposerPosition = 'Công nhân',
      productCode = '',
      beforeDescription = '',
      afterSolution = '',
      savedSeconds = 0,
      beforeImageUrl = '',
      afterImageUrl = '',
      attachments = [],
      status = 'SUBMITTED',
    } = body;

    if (!title || !proposerName) {
      return NextResponse.json({ error: 'Tiêu đề và Tên người đề xuất là bắt buộc' }, { status: 400 });
    }

    const safeFactory = factory || 'Kiên Giang 1';
    const id = existingId || `kz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const code = existingCode || `KZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const attachmentsJson = Array.isArray(attachments) && attachments.length > 0
      ? JSON.stringify(attachments)
      : JSON.stringify([
          ...(beforeImageUrl ? [{ url: beforeImageUrl, tag: 'BEFORE', type: 'image' }] : []),
          ...(afterImageUrl ? [{ url: afterImageUrl, tag: 'AFTER', type: 'image' }] : []),
        ]);

    if (db) {
      if (existingId) {
        // Re-submission after CAN_CHINH_SUA Fail status
        const updateQuery = `
          UPDATE ci_kaizen_proposals
          SET title = ?,
              category = ?,
              category_label = ?,
              factory = ?,
              department = ?,
              line = ?,
              proposer_name = ?,
              before_description = ?,
              after_solution = ?,
              before_image_url = ?,
              after_image_url = ?,
              attachments_json = ?,
              trang_thai = 'CHO_DUYET',
              sub_status = 'CHO_DUYET',
              review_status = 'CHO_DUYET',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        await db
          .prepare(updateQuery)
          .bind(
            title,
            category,
            categoryLabel,
            safeFactory,
            department,
            line,
            proposerName,
            beforeDescription,
            afterSolution,
            beforeImageUrl,
            afterImageUrl,
            attachmentsJson,
            existingId
          )
          .run();
      } else {
        const query = `
          INSERT INTO ci_kaizen_proposals (
            id, code, title, category, category_label, registration_type,
            region, department, factory, line, proposer_name, proposer_emp_code,
            before_description, after_solution, saved_seconds, so_giay_tiet_kiem,
            before_image_url, after_image_url, attachments_json, status, sub_status,
            trang_thai, review_status, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, 'CHO_DUYET',
            'CHO_DUYET', 'CHO_DUYET', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `;

        await db
          .prepare(query)
          .bind(
            id,
            code,
            title,
            category,
            categoryLabel,
            registrationType || 'THI_DUA',
            safeFactory,
            department,
            safeFactory,
            line,
            proposerName,
            proposerEmpCode || session?.empCode || 'KG-EMP',
            beforeDescription,
            afterSolution,
            savedSeconds || 0,
            savedSeconds || 0,
            beforeImageUrl,
            afterImageUrl,
            attachmentsJson,
            'SUBMITTED'
          )
          .run();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Gửi đề xuất Kaizen và lưu trữ thành công!',
      code,
      id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi đăng ký Kaizen';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, category, categoryLabel, beforeDescription, afterSolution, savedSeconds } = body;

    if (!id) {
      return NextResponse.json({ error: 'Mã đề xuất không hợp lệ' }, { status: 400 });
    }

    const db = getDbBinding();

    if (db) {
      const query = `
        UPDATE ci_kaizen_proposals
        SET title = COALESCE(?, title),
            category = COALESCE(?, category),
            category_label = COALESCE(?, category_label),
            before_description = COALESCE(?, before_description),
            after_solution = COALESCE(?, after_solution),
            saved_seconds = COALESCE(?, saved_seconds),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await db.prepare(query).bind(title, category, categoryLabel, beforeDescription, afterSolution, savedSeconds, id).run();
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật đề xuất Kaizen thành công!',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi cập nhật Kaizen';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
