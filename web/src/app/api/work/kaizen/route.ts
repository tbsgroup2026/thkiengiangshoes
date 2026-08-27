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
    const factory = searchParams.get('factory');
    const search = searchParams.get('search');

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

      if (factory && factory !== 'ALL') {
        query += ` AND (factory = ? OR factory LIKE ?)`;
        params.push(factory, `%${factory}%`);
      }

      if (search) {
        query += ` AND (title LIKE ? OR proposer_name LIKE ? OR code LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY created_at DESC LIMIT 100`;

      const stmt = db.prepare(query);
      const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

      return NextResponse.json({
        success: true,
        proposals: results || [],
        total: (results || []).length,
        scoped: 'Kiên Giang 1, 2, 3',
      });
    }

    return NextResponse.json({
      success: true,
      proposals: [],
      total: 0,
      scoped: 'Kiên Giang 1, 2, 3 (Fallback)',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi lấy dữ liệu Kaizen';
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
      department,
      proposerName,
      proposerEmpCode,
      beforeDescription,
      afterSolution,
      savedSeconds = 0,
      beforeImageUrl,
      afterImageUrl,
      status = 'IMPLEMENTED',
    } = body;

    if (!title || !proposerName) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ tiêu đề và tên người đề xuất' },
        { status: 400 }
      );
    }

    const safeFactory = factory && factory.toLowerCase().includes('kiên giang') ? factory : 'Kiên Giang 1';
    const id = `kz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
          ?, ?, ?, ?, ?, 'LUU_TRU',
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
          department || 'Khối Sản Xuất KG',
          safeFactory,
          proposerName,
          proposerEmpCode || session?.empCode || 'KG-EMP',
          beforeDescription || '',
          afterSolution || '',
          savedSeconds,
          beforeImageUrl || '',
          afterImageUrl || '',
          status || 'IMPLEMENTED'
        )
        .run();

      return NextResponse.json({
        success: true,
        message: 'Tạo đề xuất Kaizen và lưu trữ thành công!',
        proposal: { id, code, title, factory: safeFactory, status: status || 'IMPLEMENTED' },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Ghi nhận đề xuất Kaizen (Demo Local)!',
      proposal: { id, code, title, factory: safeFactory, status: 'IMPLEMENTED' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi tạo đề xuất Kaizen';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
