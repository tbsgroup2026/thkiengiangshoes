import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { SYSTEM_USERS, normalizeEmpCode } from '@/lib/userProfiles';

export const dynamic = "force-static";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/tbs_token=([^;]+)/);
    const authHeader = request.headers.get('authorization') || '';
    
    let token = match ? match[1] : null;
    if (!token && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.empCode) {
        const mappedCode = normalizeEmpCode(payload.empCode);
        const sysUser = SYSTEM_USERS[mappedCode];

        const userProfile = {
          userId: payload.userId || sysUser?.userId || 212,
          empCode: mappedCode,
          name: (payload.name && !payload.name.startsWith('Cán Bộ')) ? payload.name : (sysUser?.name || `Cán bộ (${mappedCode})`),
          title: payload.title || sysUser?.title || 'Cán Bộ Công Nhân Viên',
          department: payload.departmentName || payload.department || sysUser?.department || 'TBS Group',
          email: payload.email || sysUser?.email || `${mappedCode.toLowerCase()}@tbsgroup.vn`,
          phone: payload.phone || sysUser?.phone || '',
          roleCode: payload.roleCode || sysUser?.roleCode || 'CBCNV',
          avatar: sysUser?.avatar || '/images/tbs-logo.png',
        };

        return NextResponse.json({ success: true, user: userProfile, data: userProfile });
      }
    }

    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ success: true, message: 'Profile saved successfully', data: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}
