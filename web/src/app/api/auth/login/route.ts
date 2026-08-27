import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { getRedirectRouteForUser } from '@/lib/rbac';

export async function POST(request: Request) {
  try {
    const { empCode, password, role } = await request.json();

    const EXECUTIVE_ROLES = ['ceo', 'deputy_ceo', 'director', 'deputy_director', 'TONG_GIAM_DOC', 'PHO_TONG_GIAM_DOC', 'GIAM_DOC', 'PHO_GIAM_DOC'];

    // Database tài khoản demo chính thức cho tất cả phòng ban
    const DEMO_USERS: Record<string, {
      userId: number;
      empCode: string;
      name: string;
      title: string;
      email: string;
      phone?: string;
      roleId: number;
      roleCode: string;
      roles: string[];
      roleLevel: number;
      departmentId: number;
      departmentCode: string;
      departmentName: string;
      redirectUrl: string;
      validPasswords: string[];
    }> = {
      'TGĐ-001': {
        userId: 201,
        empCode: '200405004',
        name: 'PHẠM MINH TÙNG',
        title: 'TGĐ',
        email: '200405004@tbsgroup.vn',
        roleId: 2,
        roleCode: 'TONG_GIAM_DOC',
        roles: ['ceo'],
        roleLevel: 1,
        departmentId: 1,
        departmentCode: 'DH_QT',
        departmentName: 'ĐH-QT',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      '200405004': {
        userId: 201,
        empCode: '200405004',
        name: 'PHẠM MINH TÙNG',
        title: 'TGĐ',
        email: 'tungpm@tbsgroup.vn',
        roleId: 2,
        roleCode: 'TONG_GIAM_DOC',
        roles: ['ceo'],
        roleLevel: 1,
        departmentId: 1,
        departmentCode: 'DH_QT',
        departmentName: 'ĐH-QT',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'PTGĐ-002': {
        userId: 202,
        empCode: '119504004',
        name: 'BÙI ĐÌNH TRUNG',
        title: 'P.TGĐ',
        email: 'trungbd@tbsgroup.vn',
        roleId: 3,
        roleCode: 'PHO_TONG_GIAM_DOC',
        roles: ['deputy_ceo'],
        roleLevel: 2,
        departmentId: 2,
        departmentCode: 'KHCB_TTPP',
        departmentName: 'KHCB-TTPP',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      '119504004': {
        userId: 202,
        empCode: '119504004',
        name: 'BÙI ĐÌNH TRUNG',
        title: 'P.TGĐ',
        email: 'trungbd@tbsgroup.vn',
        roleId: 3,
        roleCode: 'PHO_TONG_GIAM_DOC',
        roles: ['deputy_ceo'],
        roleLevel: 2,
        departmentId: 2,
        departmentCode: 'KHCB_TTPP',
        departmentName: 'KHCB-TTPP',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'GĐ-003': {
        userId: 203,
        empCode: '101403004',
        name: 'NGUYỄN HỮU ĐẠT',
        title: 'GĐ',
        email: 'datnh@tbsgroup.vn',
        roleId: 4,
        roleCode: 'GIAM_DOC',
        roles: ['director'],
        roleLevel: 2,
        departmentId: 3,
        departmentCode: 'KD_PTSP',
        departmentName: 'KD PTSP',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      '101403004': {
        userId: 203,
        empCode: '101403004',
        name: 'NGUYỄN HỮU ĐẠT',
        title: 'GĐ',
        email: 'datnh@tbsgroup.vn',
        roleId: 4,
        roleCode: 'GIAM_DOC',
        roles: ['director'],
        roleLevel: 2,
        departmentId: 3,
        departmentCode: 'KD_PTSP',
        departmentName: 'KD PTSP',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'PGĐ-004': {
        userId: 204,
        empCode: '201604020',
        name: 'PHẠM THỊ DƯƠNG',
        title: 'PGĐ',
        email: 'duongpt@tbsgroup.vn',
        roleId: 5,
        roleCode: 'PHO_GIAM_DOC',
        roles: ['deputy_director'],
        roleLevel: 2,
        departmentId: 4,
        departmentCode: 'QLCL_LAB',
        departmentName: 'QLCL & LAB',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      '201604020': {
        userId: 204,
        empCode: '201604020',
        name: 'PHẠM THỊ DƯƠNG',
        title: 'PGĐ',
        email: 'duongpt@tbsgroup.vn',
        roleId: 5,
        roleCode: 'PHO_GIAM_DOC',
        roles: ['deputy_director'],
        roleLevel: 2,
        departmentId: 4,
        departmentCode: 'QLCL_LAB',
        departmentName: 'QLCL & LAB',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'ADMIN-2026': {
        userId: 200,
        empCode: 'ADMIN-2026',
        name: 'Quản Trị Viên Hệ Thống',
        title: 'Quản Trị Viên Hệ Thống TBS Group',
        email: 'trivq@tbsgroup.vn',
        roleId: 1,
        roleCode: 'SUPER_ADMIN',
        roles: ['admin'],
        roleLevel: 1,
        departmentId: 5,
        departmentCode: 'IT_DIGITAL',
        departmentName: 'IT - Team Chuyển Đổi Số',
        redirectUrl: '/admin/roles',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      '202608001': {
        userId: 205,
        empCode: '202608001',
        name: 'Phạm Nguyễn Anh Huy',
        title: 'IT - Team Chuyển Đổi Số',
        email: 'huypna@tbsgroup.vn',
        phone: '0522511245',
        roleId: 6,
        roleCode: 'TRUONG_PHONG',
        roles: ['employee', 'department_head', 'ci', 'admin'],
        roleLevel: 3,
        departmentId: 9,
        departmentCode: 'IT_CDS',
        departmentName: 'IT - Team Chuyển Đổi Số',
        redirectUrl: '/work',
        validPasswords: ['21032004', '123456', 'Admin@123456'],
      },
      '202608002': {
        userId: 206,
        empCode: '202608002',
        name: 'Trần Ngọc Huy',
        title: 'Kỹ Sư IT - Team Chuyển Đổi Số',
        email: 'huytn@tbsgroup.vn',
        phone: '0522511246',
        roleId: 6,
        roleCode: 'TRUONG_PHONG',
        roles: ['employee', 'department_head', 'ci', 'admin'],
        roleLevel: 3,
        departmentId: 9,
        departmentCode: 'IT_CDS',
        departmentName: 'IT - Team Chuyển Đổi Số',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'LT-001': {
        userId: 215,
        empCode: 'LT-001',
        name: 'Lễ Tân Văn Phòng',
        title: 'Chuyên Viên Lễ Tân Văn Phòng',
        email: 'letan@tbsgroup.vn',
        phone: '0522511246',
        roleId: 9,
        roleCode: 'LE_TAN',
        roles: ['employee', 'receptionist'],
        roleLevel: 4,
        departmentId: 6,
        departmentCode: 'NHAN_SU',
        departmentName: 'Nhân Sự - Hành Chánh',
        redirectUrl: '/rooms',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'NS-001': {
        userId: 208,
        empCode: '222102020',
        name: 'DƯƠNG THỊ THANH TÌNH',
        title: 'TP',
        email: 'tinhdtt@tbsgroup.vn',
        phone: '0988000000',
        roleId: 6,
        roleCode: 'TRUONG_PHONG',
        roles: ['employee', 'department_head', 'hr'],
        roleLevel: 3,
        departmentId: 6,
        departmentCode: 'NHAN_SU_HC',
        departmentName: 'NHÂN SỰ-HC',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      '222102020': {
        userId: 208,
        empCode: '222102020',
        name: 'DƯƠNG THỊ THANH TÌNH',
        title: 'TP',
        email: 'tinhdtt@tbsgroup.vn',
        phone: '0988000000',
        roleId: 6,
        roleCode: 'TRUONG_PHONG',
        roles: ['employee', 'department_head', 'hr'],
        roleLevel: 3,
        departmentId: 6,
        departmentCode: 'NHAN_SU_HC',
        departmentName: 'NHÂN SỰ-HC',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'KT-001': {
        userId: 210,
        empCode: 'KT-001',
        name: 'Trần Thị Thu Hương',
        title: 'Trưởng Phòng Kế Toán',
        email: 'huongttt@tbsgroup.vn',
        phone: '0988200001',
        roleId: 6,
        roleCode: 'TRUONG_PHONG',
        roles: ['employee', 'department_head', 'accountant'],
        roleLevel: 3,
        departmentId: 7,
        departmentCode: 'KE_TOAN',
        departmentName: 'Kế Toán & Quản Trị Tài Chính',
        redirectUrl: '/finance',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'QC-001': {
        userId: 214,
        empCode: 'QC-001',
        name: 'Bùi Thị Hằng',
        title: 'Quản Lý QC & Kiểm Soát Chất Lượng',
        email: 'hangbt@tbsgroup.vn',
        phone: '0988400001',
        roleId: 10,
        roleCode: 'QC_MANAGER',
        roles: ['employee', 'qc'],
        roleLevel: 3,
        departmentId: 4,
        departmentCode: 'CHAT_LUONG_QC',
        departmentName: 'Khối Quản Lý Chất Lượng (QC)',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'BT-001': {
        userId: 216,
        empCode: 'BT-001',
        name: 'Phạm Văn Bảo',
        title: 'Kỹ Thuật Viên Bảo Trì Trưởng',
        email: 'baopv@tbsgroup.vn',
        phone: '0988500001',
        roleId: 8,
        roleCode: 'KY_THUAT_VIEN',
        roles: ['employee', 'maintenance'],
        roleLevel: 4,
        departmentId: 3,
        departmentCode: 'SAN_XUAT',
        departmentName: 'Tổ Hợp Nhà Máy & Sản Xuất',
        redirectUrl: '/maintenance',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'LG-001': {
        userId: 219,
        empCode: 'LG-001',
        name: 'Nguyễn Văn Minh',
        title: 'Trưởng Phòng Logistics',
        email: 'minhnv@tbsgroup.vn',
        phone: '0988600001',
        roleId: 6,
        roleCode: 'TRUONG_PHONG',
        roles: ['employee', 'department_head', 'logistics'],
        roleLevel: 3,
        departmentId: 10,
        departmentCode: 'LOGISTICS_TTPP',
        departmentName: 'Logistics - KH Chuẩn Bị TTPP',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
      'RD-001': {
        userId: 212,
        empCode: 'RD-001',
        name: 'Võ Thị Kim Loan',
        title: 'Trưởng Phòng R&D',
        email: 'loanvtk@tbsgroup.vn',
        phone: '0988300001',
        roleId: 6,
        roleCode: 'TRUONG_PHONG',
        roles: ['employee', 'department_head', 'rd'],
        roleLevel: 3,
        departmentId: 8,
        departmentCode: 'RD_PHAT_TRIEN',
        departmentName: 'R&D - Phát Triển Sản Phẩm',
        redirectUrl: '/work',
        validPasswords: ['123456', '21032004', 'Admin@123456'],
      },
    };

    const cleanEmpCode = (empCode || role || '').trim();

    // Map role alias if role code provided instead of MSNV
    const ROLE_ALIAS_MAP: Record<string, string> = {
      ceo: 'TGĐ-001',
      deputy_ceo: 'PTGĐ-002',
      director: 'GĐ-003',
      deputy_director: 'PGĐ-004',
      receptionist: 'LT-001',
      letan: 'LT-001',
      'lt-001': 'LT-001',
      department_head_ci: '202608001',
      department_head_hr: 'NS-001',
      department_head_kt: 'KT-001',
      qc_manager: 'QC-001',
      maintenance_lead: 'BT-001',
      logistics_head: 'LG-001',
      rd_head: 'RD-001',
      admin: 'ADMIN-2026',
    };

    const targetEmpCode = ROLE_ALIAS_MAP[cleanEmpCode] || cleanEmpCode;
    const demoUser = DEMO_USERS[targetEmpCode];

    if (demoUser) {
      if (!password) {
        return NextResponse.json({ error: 'Vui lòng nhập mật khẩu xác thực' }, { status: 400 });
      }

      if (demoUser.validPasswords.includes(password) || password === '123456' || password === '21032004' || password === 'Admin@123456') {
        const payload = {
          userId: demoUser.userId,
          empCode: demoUser.empCode,
          name: demoUser.name,
          title: demoUser.title,
          email: demoUser.email,
          phone: demoUser.phone,
          roleId: demoUser.roleId,
          roleCode: demoUser.roleCode,
          roles: demoUser.roles,
          roleLevel: demoUser.roleLevel,
          departmentId: demoUser.departmentId,
          departmentCode: demoUser.departmentCode,
          departmentName: demoUser.departmentName,
          redirectUrl: demoUser.redirectUrl,
        };

        const token = await signToken(payload);

        return NextResponse.json({
          success: true,
          token,
          user: payload,
          redirectUrl: demoUser.redirectUrl,
        });
      } else {
        return NextResponse.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
      }
    }

    // Fallback cho MSNV tùy chỉnh nhập trực tiếp
    if (!password) {
      return NextResponse.json({ error: 'Vui lòng nhập mật khẩu' }, { status: 400 });
    }

    const payload = {
      userId: 888,
      empCode: cleanEmpCode,
      name: `Cán Bộ Nhân Viên (${cleanEmpCode})`,
      title: 'Cán Bộ Công Nhân Viên',
      email: `${cleanEmpCode}@tbsgroup.vn`,
      roleId: 7,
      roleCode: 'NHAN_VIEN',
      roles: ['employee'],
      roleLevel: 4,
      departmentId: 11,
      departmentCode: 'TO_HOP_NHA_MAY',
      departmentName: 'Tổ hợp Kiên Giang - TBS Group',
      redirectUrl: '/work',
    };

    const token = await signToken(payload);

    return NextResponse.json({
      success: true,
      token,
      user: payload,
      redirectUrl: '/work',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

