import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const msnv = searchParams.get('msnv');

    if (!msnv || msnv.trim().length < 2) {
      return NextResponse.json({ error: 'Mã số nhân viên không hợp lệ' }, { status: 400 });
    }

    const cleanCode = msnv.trim();
    const db = getDbBinding();

    if (db) {
      const query = `SELECT * FROM users WHERE emp_code = ? OR emp_code LIKE ? LIMIT 1`;
      const user = await db.prepare(query).bind(cleanCode, `%${cleanCode}%`).first();

      if (user) {
        return NextResponse.json({
          success: true,
          data: {
            name: user.name,
            emp_code: user.emp_code,
            title: user.title || 'Công Nhân Sản Xuất',
            position: user.title || user.vtcv_hien_tai || 'Công Nhân Sản Xuất',
            factory_id: user.department || 'Kiên Giang 1',
            workshop_id: user.bo_phan_moi || 'Xưởng May KG1',
            line_id: 'Line May Mũi 1',
            chuyen_id: 'Chuyền May 1',
            to_id: 'Tổ May 1A',
          },
        });
      }
    }

    // Demo fallback map for test accounts
    const DEMO_MAP: Record<string, any> = {
      '202608001': {
        name: 'Phạm Nguyễn Anh Huy',
        emp_code: '202608001',
        title: 'IT - Team Chuyển Đổi Số',
        position: 'Kỹ Sư IT',
        factory_id: 'Kiên Giang 1',
        workshop_id: 'Xưởng Mũi KG1',
        line_id: 'Line May Mũi 1',
        chuyen_id: 'Chuyền May 1',
        to_id: 'Tổ Kaizen 1',
      },
      '202608002': {
        name: 'Trần Ngọc Huy',
        emp_code: '202608002',
        title: 'Kỹ Sư IT',
        position: 'Kỹ Sư IT',
        factory_id: 'Kiên Giang 2',
        workshop_id: 'Xưởng Mũi KG2',
        line_id: 'Line May 1',
        chuyen_id: 'Chuyền May KG2-1',
        to_id: 'Tổ May 1',
      },
      'KG-09812': {
        name: 'Phạm Văn Nam',
        emp_code: 'KG-09812',
        title: 'Tổ Trưởng Cán Ép',
        position: 'Công Nhân Sản Xuất',
        factory_id: 'Kiên Giang 1',
        workshop_id: 'Xưởng Đế KG1',
        line_id: 'Line Ép 1',
        chuyen_id: 'Chuyền Cán Ép 1',
        to_id: 'Tổ Cán Ép A',
      },
    };

    const found = DEMO_MAP[cleanCode];

    if (found) {
      return NextResponse.json({
        success: true,
        data: found,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Không tìm thấy thông tin nhân viên theo MSNV' },
      { status: 404 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi tra cứu thông tin nhân viên';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
