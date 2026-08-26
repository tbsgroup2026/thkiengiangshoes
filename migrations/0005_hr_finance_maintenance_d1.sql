-- Migration 0005: HR, Finance Targets, Maintenance Machines & Tables for Cloudflare D1
-- Version: 2026-08-21

-- 1. HR Employees Table
CREATE TABLE IF NOT EXISTS hr_employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    branch TEXT DEFAULT 'Văn Phòng Chuỗi SKECHERS HQ',
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Active', -- Active, Probation, Onboarding, Resigned
    contract_type TEXT DEFAULT 'Chính thức (2 năm)',
    join_date TEXT,
    probation_end_date TEXT,
    contract_end_date TEXT,
    avatar TEXT DEFAULT '/images/tbs-logo.png',
    salary_base TEXT,
    performance_score TEXT DEFAULT 'A',
    is_high_performer INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. HR Contracts Table
CREATE TABLE IF NOT EXISTS hr_contracts (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    department TEXT NOT NULL,
    type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'Active', -- Active, Expiring, Expired, Pending_Sign
    salary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. HR Requisitions Table (Recruitment Requests)
CREATE TABLE IF NOT EXISTS hr_requisitions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    salary_range TEXT,
    reason TEXT,
    status TEXT DEFAULT 'Pending_Manager', -- Draft, Pending_Manager, Pending_CEO, Approved, Rejected
    requester_name TEXT NOT NULL,
    request_date TEXT NOT NULL,
    applicants_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. HR Onboarding Table
CREATE TABLE IF NOT EXISTS hr_onboarding (
    id TEXT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    department TEXT NOT NULL,
    join_date TEXT NOT NULL,
    mentor TEXT,
    progress INTEGER DEFAULT 0,
    items_json TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Seed Data for HR Tables if empty
INSERT OR IGNORE INTO hr_employees (id, name, title, department, branch, email, phone, status, contract_type, join_date, avatar, salary_base, performance_score, is_high_performer)
VALUES
  ('NS-001', 'Nguyễn Thị Lan Anh', 'Trưởng Phòng Nhân Sự', 'Nhân Sự - Hành Chánh', 'Văn Phòng Chuỗi SKECHERS HQ', 'ns001@tbsgroup.vn', '0988100001', 'Active', 'Chính thức (Không XĐTH)', '2020-03-15', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', '28,500,000 đ', 'A+', 1),
  ('KT-001', 'Trần Thị Thu Hương', 'Trưởng Phòng Kế Toán', 'Kế Toán & Tài Chính', 'Khối Văn Phòng TBS Group', 'kt001@tbsgroup.vn', '0988200001', 'Active', 'Chính thức (Không XĐTH)', '2019-06-01', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', '26,000,000 đ', 'A', 1),
  ('202608001', 'Phạm Nguyễn Anh Huy', 'IT - Team Chuyển Đổi Số', 'IT & CĐS', 'Văn Phòng Chuỗi SKECHERS HQ', 'anhy.work.2004@gmail.com', '0522511245', 'Active', 'Chính thức (2 năm)', '2023-01-10', 'https://res.cloudinary.com/dwl2xtbqa/image/upload/v1787117525/nzcft200bebofw7b4uzg.jpg', '22,000,000 đ', 'A+', 1),
  ('QC-001', 'Bùi Thị Hằng', 'Quản Lý QC Dây Chuyền', 'Khối QC', 'Tổ Hợp Nhà Máy NM1', 'qc001@tbsgroup.vn', '0988400001', 'Active', 'Chính thức (2 năm)', '2022-04-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '19,500,000 đ', 'B+', 0);

INSERT OR IGNORE INTO hr_contracts (id, employee_id, employee_name, department, type, start_date, end_date, status, salary)
VALUES
  ('HD-2026-001', '202608001', 'Phạm Nguyễn Anh Huy', 'IT & CĐS', 'Chính thức (2 năm)', '2024-10-01', '2026-09-30', 'Expiring', '22,000,000 đ'),
  ('HD-2026-002', 'NS-004', 'Lê Hoàng Yến', 'Nhân Sự - Hành Chánh', 'Thử việc (2 tháng)', '2026-07-01', '2026-08-31', 'Expiring', '14,000,000 đ'),
  ('HD-2026-003', 'QC-001', 'Bùi Thị Hằng', 'Khối QC', 'Chính thức (Không XĐTH)', '2022-04-15', '2027-04-15', 'Active', '19,500,000 đ');

INSERT OR IGNORE INTO hr_requisitions (id, title, department, quantity, salary_range, reason, status, requester_name, request_date, applicants_count)
VALUES
  ('YCTD-2026-01', 'Trưởng Nhóm QC Dây Chuyền Ca 2', 'Khối QC', 2, '16,000,000 - 20,000,000 đ', 'Mở rộng dây chuyền sản xuất giày Skechers D''Lites ca 2', 'Pending_CEO', 'Bùi Thị Hằng (Quản lý QC)', '2026-08-16', 14),
  ('YCTD-2026-02', 'Chuyên Viên Lập Trình Frontend React / Next.js', 'IT & CĐS', 3, '18,000,000 - 25,000,000 đ', 'Phát triển Phân hệ Quản trị Chuỗi Cung Ứng Skechers 2026', 'Approved', 'Phạm Nguyễn Anh Huy (IT Lead)', '2026-08-10', 28);

INSERT OR IGNORE INTO hr_onboarding (id, employee_name, department, join_date, mentor, progress, items_json)
VALUES
  ('ONB-01', 'Nguyễn Văn Tuấn', 'Kho & Logistics', '2026-08-15', 'Trần Văn Nam (Trưởng Kho)', 75, '[{"text":"Nộp đủ hồ sơ gốc & Giấy khám sức khỏe","done":true},{"text":"Ký hợp đồng lao động thử việc","done":true},{"text":"Tạo tài khoản email & phân quyền hệ thống TBS ERP","done":true},{"text":"Nhận đồng phục & thẻ ra vào nhà máy","done":false},{"text":"Hoàn tất khóa đào tạo An toàn lao động","done":false}]');

-- 5. Finance Targets Table
CREATE TABLE IF NOT EXISTS finance_targets (
    id TEXT PRIMARY KEY,
    year INTEGER DEFAULT 2026,
    metric_code TEXT NOT NULL UNIQUE,
    metric_name TEXT NOT NULL,
    target_value REAL NOT NULL,
    unit TEXT DEFAULT 'VNĐ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO finance_targets (id, year, metric_code, metric_name, target_value, unit)
VALUES
  ('tgt_rev_2026', 2026, 'REVENUE_YEAR', 'Chỉ tiêu Doanh Thu Năm 2026', 150000000000, 'VNĐ'),
  ('tgt_cost_2026', 2026, 'OPERATING_COST_MAX', 'Định Mức Chi Phí Vận Hành Tối Đa', 35000000000, 'VNĐ'),
  ('tgt_profit_2026', 2026, 'NET_PROFIT_YEAR', 'Chỉ tiêu Lợi Nhuận Ròng Năm 2026', 30000000000, 'VNĐ');

-- 6. Maintenance Machines Table
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    serial TEXT,
    zone TEXT NOT NULL,
    status TEXT DEFAULT 'OPERATING', -- OPERATING, DOWN, WARNING, MAINTENANCE
    qr_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO machines (id, code, name, serial, zone, status, qr_data)
VALUES
  ('mc_1', 'MC-MAY-01', 'Máy May Tự Động 1 kim A1', 'SN-99812', 'Khu A - Chuyền 1', 'OPERATING', 'TBS_MC_MAY_01'),
  ('mc_2', 'MC-MAY-04', 'Máy May Tự Động 1 kim A4', 'SN-99815', 'Khu A - Chuyền 2', 'DOWN', 'TBS_MC_MAY_04'),
  ('mc_3', 'MC-CAT-02', 'Máy Cắt Laser Công Nghiệp B2', 'SN-44310', 'Khu B - Chuyền 1', 'OPERATING', 'TBS_MC_CAT_02'),
  ('mc_4', 'MC-EP-05', 'Máy Ép Keo Nhiệt E5', 'SN-77219', 'Khu C - Chuyền 4', 'WARNING', 'TBS_MC_EP_05');
