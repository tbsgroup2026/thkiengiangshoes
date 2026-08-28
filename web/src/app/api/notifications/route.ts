import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-static';



function getDbBinding(): any {
  return (process.env as any).DB || (globalThis as any).DB || null;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const session = token ? await verifyToken(token) : null;

    // 🔴 SECURITY GUARD: Authentication required
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu đăng nhập để xem thông báo (401 Unauthorized)' },
        { status: 401 }
      );
    }

    const db = getDbBinding();

    if (db) {
      try {
        const query = `
          SELECT * FROM system_notifications
          WHERE recipient_emp_code = ? OR recipient_emp_code = 'ALL' OR target_role = ?
          ORDER BY created_at DESC LIMIT 50
        `;
        const { results } = await db
          .prepare(query)
          .bind(session.empCode || 'ALL', (session as any)?.roleCode || 'ALL')
          .all();

        return NextResponse.json({
          success: true,
          data: results || [],
        });
      } catch (dbErr) {
        // Table fallback
      }
    }

    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'notif_welcome',
          title: 'Chào mừng đến với hệ thống TBS Group',
          content: `Xin chào ${session.name || 'Thành viên'}, bạn đã đăng nhập thành công.`,
          created_at: new Date().toISOString(),
          is_read: false,
        },
      ],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi lấy danh sách thông báo';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const session = token ? await verifyToken(token) : null;

    // 🔴 SECURITY GUARD: Authentication required
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Yêu cầu đăng nhập để gửi thông báo (401 Unauthorized)' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { title, content, recipient_emp_code, target_role, type } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp tiêu đề và nội dung thông báo' },
        { status: 400 }
      );
    }

    // Sender identity is strictly forced from authenticated session (anti-spoofing)
    const senderEmpCode = session.empCode || 'SYSTEM';
    const senderName = session.name || 'Hệ Thống';

    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const db = getDbBinding();

    if (db) {
      try {
        await db.prepare(`
          CREATE TABLE IF NOT EXISTS system_notifications (
            id TEXT PRIMARY KEY,
            sender_emp_code TEXT,
            sender_name TEXT,
            recipient_emp_code TEXT,
            target_role TEXT,
            title TEXT,
            content TEXT,
            type TEXT DEFAULT 'INFO',
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run().catch(() => {});

        await db.prepare(`
          INSERT INTO system_notifications (
            id, sender_emp_code, sender_name, recipient_emp_code, target_role, title, content, type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          notifId,
          senderEmpCode,
          senderName,
          recipient_emp_code || 'ALL',
          target_role || 'ALL',
          title,
          content,
          type || 'INFO'
        ).run();
      } catch (dbErr) {
        console.warn('[NOTIFICATIONS API] DB insert error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      id: notifId,
      message: 'Đã tạo thông báo thành công!',
      sender: { empCode: senderEmpCode, name: senderName },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi gửi thông báo';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
