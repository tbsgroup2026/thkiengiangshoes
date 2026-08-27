import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { verifyToken } from '@/lib/auth';

const KG_FACTORIES_SQL = "('KG 1', 'KG 2', 'KG 3', 'Hoàn thiện đế', 'Kiên Giang 1', 'Kiên Giang 2', 'Kiên Giang 3', 'HTĐ KG', 'Phòng kế hoạch', 'Phòng CN-CI', 'Phòng chất lượng', 'Phòng nhân sự', 'P. Kế Hoạch', 'P. CN-CI', 'P. Chất Lượng', 'P. Nhân Sự')";

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const factory = searchParams.get('factory');
    const status = searchParams.get('status');

    const db = getDbBinding();

    if (db) {
      let query = `SELECT * FROM maintenance_tickets WHERE branch_id IS NOT NULL OR description LIKE '%Gemba%'`;
      const params: any[] = [];

      if (status && status !== 'ALL') {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT 50`;

      const { results } = params.length > 0 ? await db.prepare(query).bind(...params).all() : await db.prepare(query).all();

      return NextResponse.json({
        success: true,
        scope: 'Kiên Giang 1, 2, 3',
        walks: results || [],
      });
    }

    // Demo Gemba Walks fallback for local dev
    return NextResponse.json({
      success: true,
      scope: 'Kiên Giang 1, 2, 3 (Fallback)',
      walks: [
        {
          id: 'gemba_01',
          walk_code: 'GMB-2026-0801',
          factory: 'Kiên Giang 1',
          department: 'Xưởng Mũi KG1',
          line_name: 'Line May Mũi 1',
          observer_name: 'Trần Văn Tùng',
          observer_emp_code: 'KG-1029',
          issue_description: 'Chuyền may 1 bị nghẽn vật tư tại trạm ép keo nhiệt',
          category: 'AN_TOAN_VANCHUYEN',
          image_url: '/images/tbs-logo.png',
          assigned_to: 'Lê Văn Bình (Trưởng xưởng)',
          status: 'IN_PROGRESS',
          created_at: new Date().toISOString(),
        },
        {
          id: 'gemba_02',
          walk_code: 'GMB-2026-0802',
          factory: 'Kiên Giang 2',
          department: 'Xưởng Gò KG2',
          line_name: 'Line Gò 1',
          observer_name: 'Nguyễn Thị Mai',
          observer_emp_code: 'KG-2045',
          issue_description: 'Đèn chiếu sáng khu vực kiểm hàng bị thiếu độ sáng chuẩn (dưới 500 Lux)',
          category: 'CHAT_LUONG_QC',
          image_url: '/images/tbs-logo.png',
          assigned_to: 'Bảo trì Kiên Giang 2',
          status: 'RESOLVED',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi lấy danh sách Gemba Walk';
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
      factory = 'Kiên Giang 1',
      department = 'Xưởng May KG1',
      lineName = 'Line May 1',
      observerName,
      issueDescription,
      category = 'AN_TOAN_5S',
      imageUrl = '',
      assignedTo = 'Chưa phân công',
    } = body;

    if (!issueDescription) {
      return NextResponse.json({ error: 'Vui lòng mô tả vấn đề ghi nhận tại hiện trường Gemba' }, { status: 400 });
    }

    const walkCode = `GMB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `gmb_${Date.now()}`;
    const name = observerName || session?.name || 'Cán Bộ Kiểm Tra Gemba';

    const db = getDbBinding();

    if (db) {
      const query = `
        INSERT INTO maintenance_tickets (
          ticket_code, machine_id, reported_by_id, priority, status, description, image_url, created_at
        ) VALUES (?, 1, ?, 'MEDIUM', 'OPEN', ?, ?, CURRENT_TIMESTAMP)
      `;

      await db
        .prepare(query)
        .bind(
          walkCode,
          session?.userId || 205,
          `[GEMBA WALK - ${factory} - ${department} - ${lineName}] ${issueDescription} (Phân công: ${assignedTo})`,
          imageUrl
        )
        .run();
    }

    return NextResponse.json({
      success: true,
      message: 'Ghi nhận Gemba Walk hiện trường thành công!',
      walk: {
        id,
        walk_code: walkCode,
        factory,
        department,
        line_name: lineName,
        observer_name: name,
        issue_description: issueDescription,
        category,
        assigned_to: assignedTo,
        status: 'OPEN',
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi ghi nhận Gemba Walk';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
