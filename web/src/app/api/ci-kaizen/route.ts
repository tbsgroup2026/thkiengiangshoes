import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { verifyToken } from '@/lib/auth';

const KG_FACTORIES_SQL = "('Kiên Giang 1', 'Kiên Giang 2', 'Kiên Giang 3', 'KG 1', 'KG 2', 'KG 3', 'HTĐ KG', 'VP KV KG')";

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const db = getDbBinding();

    if (db) {
      let query = `SELECT * FROM ci_kaizen_proposals WHERE factory IN ${KG_FACTORIES_SQL}`;
      const params: any[] = [];

      if (category && category !== 'ALL') {
        query += ` AND category = ?`;
        params.push(category);
      }

      if (status && status !== 'ALL') {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT 100`;

      const { results } = params.length > 0 ? await db.prepare(query).bind(...params).all() : await db.prepare(query).all();

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

    const body = await request.json();
    const {
      title,
      category = 'PRODUCTIVITY',
      categoryLabel = '3.Tăng Năng suất',
      registrationType = 'LUU_TRU',
      factory = 'Kiên Giang 1',
      department = 'Xưởng Sản Xuất KG',
      proposerName,
      proposerEmpCode,
      proposerPosition = 'Công nhân',
      productCode = '',
      beforeDescription = '',
      afterSolution = '',
      savedSeconds = 0,
      beforeImageUrl = '',
      afterImageUrl = '',
      status = 'IMPLEMENTED',
    } = body;

    if (!title || !proposerName) {
      return NextResponse.json({ error: 'Tiêu đề và Tên người đề xuất là bắt buộc' }, { status: 400 });
    }

    const safeFactory = factory && factory.toLowerCase().includes('kiên giang') ? factory : 'Kiên Giang 1';
    const id = `kz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const code = `KZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const db = getDbBinding();

    if (db) {
      const query = `
        INSERT INTO ci_kaizen_proposals (
          id, code, title, category, category_label, registration_type,
          region, department, factory, proposer_name, proposer_emp_code,
          before_description, after_solution, saved_seconds,
          before_image_url, after_image_url, status, sub_status, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          'Kiên Giang', ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, 'DA_DANH_GIA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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
          'LUU_TRU',
          department,
          safeFactory,
          proposerName,
          proposerEmpCode || session?.empCode || 'KG-EMP',
          beforeDescription,
          afterSolution,
          savedSeconds,
          beforeImageUrl,
          afterImageUrl,
          status || 'IMPLEMENTED'
        )
        .run();
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
    const { id, title, beforeDescription, afterSolution, savedSeconds } = body;

    if (!id) {
      return NextResponse.json({ error: 'Mã đề xuất không hợp lệ' }, { status: 400 });
    }

    const db = getDbBinding();

    if (db) {
      const query = `
        UPDATE ci_kaizen_proposals
        SET title = COALESCE(?, title),
            before_description = COALESCE(?, before_description),
            after_solution = COALESCE(?, after_solution),
            saved_seconds = COALESCE(?, saved_seconds),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await db.prepare(query).bind(title, beforeDescription, afterSolution, savedSeconds, id).run();
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
