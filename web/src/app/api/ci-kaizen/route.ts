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

      return NextResponse.json(
        {
          success: true,
          data: results || [],
          proposals: results || [],
          scoped: 'Kiên Giang 1, 2, 3',
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        }
      );
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
      beforeVideoUrl = '',
      afterVideoUrl = '',
      attachments = [],
      attachmentsJson: rawAttachmentsJson,
      status = 'SUBMITTED',
    } = body;

    if (!title || !proposerName) {
      return NextResponse.json({ error: 'Tiêu đề và Tên người đề xuất là bắt buộc' }, { status: 400 });
    }

    const safeFactory = factory || 'Kiên Giang 1';
    const id = existingId || `kz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const code = existingCode || `KZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const finalBeforeVid = (beforeVideoUrl || body.before_video_url || body.beforeVideoLink || '').trim();
    const finalAfterVid = (afterVideoUrl || body.after_video_url || body.afterVideoLink || '').trim();

    let attachmentsJson = typeof rawAttachmentsJson === 'string' && rawAttachmentsJson.trim()
      ? rawAttachmentsJson.trim()
      : (body as any).attachments_json || null;

    if (!attachmentsJson) {
      const attsList: any[] = [];
      if (beforeImageUrl) attsList.push({ type: 'image', url: beforeImageUrl, tag: 'BEFORE' });
      if (afterImageUrl) attsList.push({ type: 'image', url: afterImageUrl, tag: 'AFTER' });
      if (finalBeforeVid) attsList.push({ type: 'video_before', url: finalBeforeVid, title: 'Video TRƯỚC Cải Tiến' });
      if (finalAfterVid) attsList.push({ type: 'video_after', url: finalAfterVid, title: 'Video SAU Cải Tiến' });

      if (Array.isArray(attachments) && attachments.length > 0) {
        attsList.push(...attachments);
      }

      if (attsList.length > 0) {
        attachmentsJson = JSON.stringify(attsList);
      }
    }

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
              before_video_url = ?,
              after_video_url = ?,
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
            finalBeforeVid,
            finalAfterVid,
            attachmentsJson,
            existingId
          )
          .run();
      } else {
        try {
          const recentDup = await db.prepare(`
            SELECT id, code FROM ci_kaizen_proposals
            WHERE title = ? AND (proposer_name = ? OR proposer_emp_code = ?)
              AND datetime(created_at) >= datetime('now', '-60 seconds')
            LIMIT 1
          `).bind(title, proposerName, proposerEmpCode || session?.empCode || 'KG-EMP').first();

          if (recentDup) {
            return NextResponse.json({
              success: true,
              message: 'Gửi đề xuất Kaizen thành công (chống trùng)!',
              code: recentDup.code,
              id: recentDup.id,
              duplicateBlocked: true,
            });
          }
        } catch (e) {}

        const query = `
          INSERT INTO ci_kaizen_proposals (
            id, code, title, category, category_label, registration_type,
            region, department, factory, line, proposer_name, proposer_emp_code,
            before_description, after_solution, saved_seconds, so_giay_tiet_kiem,
            before_image_url, after_image_url, before_video_url, after_video_url,
            attachments_json, status, sub_status, trang_thai, review_status, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, 'CHO_DUYET',
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
            finalBeforeVid,
            finalAfterVid,
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
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: 'Mã đề xuất không hợp lệ' }, { status: 400 });
    }

    const title = body.title;
    const category = body.category;
    const categoryLabel = body.categoryLabel || body.category_label;
    const beforeDescription = body.beforeDescription !== undefined ? body.beforeDescription : body.before_description;
    const afterSolution = body.afterSolution !== undefined ? body.afterSolution : body.after_solution;
    const savedSeconds = body.savedSeconds !== undefined ? body.savedSeconds : body.saved_seconds;
    const beforeImageUrl = body.beforeImageUrl !== undefined ? body.beforeImageUrl : body.before_image_url;
    const afterImageUrl = body.afterImageUrl !== undefined ? body.afterImageUrl : body.after_image_url;
    const beforeVideoUrl = body.beforeVideoUrl !== undefined ? body.beforeVideoUrl : body.before_video_url;
    const afterVideoUrl = body.afterVideoUrl !== undefined ? body.afterVideoUrl : body.after_video_url;
    const attachmentsJson = body.attachmentsJson !== undefined ? body.attachmentsJson : (typeof body.videos === 'object' ? JSON.stringify(body.videos) : body.attachments_json);
    const productCode = body.productCode !== undefined ? body.productCode : body.product_code;
    const quantity = body.quantity;
    const pairQuantity = body.pairQuantity !== undefined ? body.pairQuantity : body.pair_quantity;
    const totalSavingsVnd = body.totalSavingsVnd !== undefined ? body.totalSavingsVnd : body.total_savings_vnd;
    const totalSavingsWords = body.totalSavingsWords !== undefined ? body.totalSavingsWords : body.total_savings_words;
    const pricingDirection = body.pricingDirection !== undefined ? body.pricingDirection : body.pricing_direction;
    const timeBeforeSeconds = body.timeBeforeSeconds !== undefined ? body.timeBeforeSeconds : body.time_before_seconds;
    const timeAfterSeconds = body.timeAfterSeconds !== undefined ? body.timeAfterSeconds : body.time_after_seconds;
    const efficiencyValueVND = body.efficiencyValueVND !== undefined ? body.efficiencyValueVND : body.efficiency_value_vnd;
    const customer = body.customer;
    const productGroup = body.productGroup !== undefined ? body.productGroup : body.product_group;
    const proposerPosition = body.proposerPosition !== undefined ? body.proposerPosition : body.proposer_position;

    const costBefore = body.costBefore !== undefined ? body.costBefore : (body.cost_before !== undefined ? body.cost_before : body.chi_phi_truoc);
    const costAfter = body.costAfter !== undefined ? body.costAfter : (body.cost_after !== undefined ? body.cost_after : body.chi_phi_sau);

    const db = getDbBinding();

    if (db) {
      await ensureKaizenSchema(db);

      const query = `
        UPDATE ci_kaizen_proposals
        SET title = COALESCE(?, title),
            category = COALESCE(?, category),
            category_label = COALESCE(?, category_label),
            before_description = COALESCE(?, before_description),
            after_solution = COALESCE(?, after_solution),
            saved_seconds = COALESCE(?, saved_seconds),
            so_giay_tiet_kiem = COALESCE(?, so_giay_tiet_kiem),
            before_image_url = COALESCE(?, before_image_url),
            after_image_url = COALESCE(?, after_image_url),
            before_video_url = COALESCE(?, before_video_url),
            after_video_url = COALESCE(?, after_video_url),
            attachments_json = COALESCE(?, attachments_json),
            product_code = COALESCE(?, product_code),
            quantity = COALESCE(?, quantity),
            pair_quantity = COALESCE(?, pair_quantity),
            total_savings_vnd = COALESCE(?, total_savings_vnd),
            tong_tien_tiet_kiem = COALESCE(?, tong_tien_tiet_kiem),
            total_savings_words = COALESCE(?, total_savings_words),
            pricing_direction = COALESCE(?, pricing_direction),
            time_before_seconds = COALESCE(?, time_before_seconds),
            time_after_seconds = COALESCE(?, time_after_seconds),
            efficiency_value_vnd = COALESCE(?, efficiency_value_vnd),
            customer = COALESCE(?, customer),
            product_group = COALESCE(?, product_group),
            proposer_position = COALESCE(?, proposer_position),
            cost_before = COALESCE(?, cost_before),
            chi_phi_truoc = COALESCE(?, chi_phi_truoc),
            cost_after = COALESCE(?, cost_after),
            chi_phi_sau = COALESCE(?, chi_phi_sau),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? OR code = ?
      `;

      await db
        .prepare(query)
        .bind(
          title ?? null,
          category ?? null,
          categoryLabel ?? null,
          beforeDescription ?? null,
          afterSolution ?? null,
          savedSeconds ?? null,
          savedSeconds ?? null,
          beforeImageUrl ?? null,
          afterImageUrl ?? null,
          beforeVideoUrl ?? null,
          afterVideoUrl ?? null,
          attachmentsJson ?? null,
          productCode ?? null,
          quantity ?? null,
          pairQuantity ?? quantity ?? null,
          totalSavingsVnd ?? null,
          totalSavingsVnd ?? null,
          totalSavingsWords ?? null,
          pricingDirection ?? null,
          timeBeforeSeconds ?? null,
          timeAfterSeconds ?? null,
          efficiencyValueVND ?? null,
          customer ?? null,
          productGroup ?? null,
          proposerPosition ?? null,
          costBefore ?? null,
          costBefore ?? null,
          costAfter ?? null,
          costAfter ?? null,
          id,
          id
        )
        .run();
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
