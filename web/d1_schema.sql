PRAGMA foreign_keys = OFF;

-- ============================================================
-- TBS GROUP CLOUDFLARE D1 DATABASE SCHEMA
-- ============================================================

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROLES (1: Super Admin, 2: Ban Giám đốc, 3: Trưởng phòng, 4: Văn phòng, 5: Bảo trì, 6: Công nhân)
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL DEFAULT 4,
    department_id INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 3. USERS
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_code TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL DEFAULT '123456',
    role_id INTEGER DEFAULT 5,
    department_id INTEGER DEFAULT 1,
    title TEXT,
    department TEXT,
    role_code TEXT,
    status TEXT DEFAULT 'ACTIVE',
    avatar_url TEXT,
    ngay_vao TEXT,
    vtcv_hien_tai TEXT,
    vtcv_sap TEXT,
    vtcv_sap_xep TEXT,
    bo_phan_moi TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. PERMISSIONS & ROLE_PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 5. BRANCHES, SECTORS, ZONES, LINES
CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    region TEXT NOT NULL,
    address TEXT
);

CREATE TABLE IF NOT EXISTS sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- 6. MACHINES
CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    serial_number TEXT,
    zone_id INTEGER,
    line_id INTEGER,
    branch_id INTEGER,
    status TEXT DEFAULT 'OPERATING', -- OPERATING, WARNING, DOWN, MAINTENANCE
    install_date TEXT,
    specs TEXT,
    qr_code_data TEXT UNIQUE,
    grid_x INTEGER DEFAULT 0,
    grid_y INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL,
    FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- 7. INCIDENT CATEGORIES & MAINTENANCE TICKETS
CREATE TABLE IF NOT EXISTS incident_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    default_priority TEXT DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    estimated_fix_time_mins INTEGER DEFAULT 30
);

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_code TEXT NOT NULL UNIQUE,
    machine_id INTEGER NOT NULL,
    reported_by_id INTEGER NOT NULL,
    assigned_to_id INTEGER,
    category_id INTEGER,
    branch_id INTEGER,
    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'OPEN', -- OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED
    description TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    started_at DATETIME,
    completed_at DATETIME,
    response_time_sec INTEGER DEFAULT 0,
    resolution_time_sec INTEGER DEFAULT 0,
    total_downtime_sec INTEGER DEFAULT 0,
    root_cause TEXT,
    resolution_notes TEXT,
    spare_parts_used TEXT,
    estimated_repair_cost REAL DEFAULT 0.0,
    approval_status TEXT DEFAULT 'APPROVED',
    FOREIGN KEY (machine_id) REFERENCES machines(id),
    FOREIGN KEY (reported_by_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES incident_categories(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS maintenance_performance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mechanic_id INTEGER NOT NULL,
    log_date TEXT NOT NULL,
    tickets_resolved INTEGER DEFAULT 0,
    avg_resolution_mins REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. DOCUMENT DIGITIZATION
CREATE TABLE IF NOT EXISTS documents_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    doc_type TEXT NOT NULL, -- LEAVE, PROPOSAL, QC_REPORT, MAINTENANCE_REQ, OTHER
    department_id INTEGER,
    file_r2_key TEXT NOT NULL,
    file_type TEXT NOT NULL, -- docx, pdf
    placeholders_json TEXT NOT NULL, -- JSON array of detected placeholder keys & form schema
    created_by_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS documents_generated (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    creator_id INTEGER NOT NULL,
    department_id INTEGER,
    form_data_json TEXT NOT NULL,
    file_r2_key TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES documents_templates(id),
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS document_approval_flow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    step_order INTEGER NOT NULL,
    approver_role_id INTEGER,
    approver_id INTEGER,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    comments TEXT,
    actioned_at DATETIME,
    FOREIGN KEY (document_id) REFERENCES documents_generated(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_role_id) REFERENCES roles(id),
    FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- 9. RECRUITMENT & PUBLIC SITE (JOBS & APPLICATIONS)
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    location TEXT DEFAULT 'Văn Phòng Chuỗi SKECHERS',
    department_id INTEGER,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CLOSED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT NOT NULL,
    cv_r2_key TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, REVIEWING, ACCEPTED, REJECTED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 10. NOTIFICATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    target_entity TEXT,
    details TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. SEED SUPER ADMIN USERS
INSERT OR REPLACE INTO users (id, emp_code, email, name, phone, password_hash, role_id, department_id, status)
VALUES (100, '202608001', 'cbcnv@tbsgroup.vn', 'Cán Bộ Công Nhân Viên', '0900000000', '21032004', 1, 11, 'ACTIVE');

INSERT OR REPLACE INTO users (id, emp_code, email, name, phone, password_hash, role_id, department_id, status)
VALUES (101, '202608002', 'staff2@tbsgroup.vn', 'Cán Bộ Công Nhân Viên', '0900000001', '123456', 1, 11, 'ACTIVE');

-- 12. BUSINESS TRIPS (Đăng ký & Quản lý lịch công tác)
CREATE TABLE IF NOT EXISTS business_trips (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    region TEXT DEFAULT 'VP Chuỗi',
    factory TEXT,
    creator TEXT NOT NULL,
    creator_emp_code TEXT, -- Mã nhân viên người tạo đơn (dùng cho Segregation of Duties & Scope filtering)
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    days_count INTEGER DEFAULT 1,
    transport TEXT DEFAULT 'Xe công ty',
    participants_count INTEGER DEFAULT 1,
    purpose TEXT,
    address TEXT,
    proposal_text TEXT,
    participants_json TEXT,
    attachments_json TEXT,
    invoices_json TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, PENDING_L2, APPROVED, REJECTED
    approved_level TEXT, -- L1, L2
    rejected_level TEXT, -- L1, L2
    rejection_reason TEXT,
    budget_status TEXT DEFAULT 'pending_dept_budget', -- pending_dept_budget, pending_exec_budget, budget_approved, budget_rejected
    budget_amount REAL DEFAULT 0,
    budget_rejection_reason TEXT,
    version INTEGER DEFAULT 1,
    estimated_cost REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO business_trips (id, code, title, region, factory, creator, department, location, start_date, end_date, days_count, transport, participants_count, purpose, status, created_at)
VALUES 
('rec_1', 'CT-2026-018', 'Đánh giá Gemba Walk & Kiểm định dây chuyền A1', 'VP Chuỗi', 'Nhà máy SKECHERS A1', 'Ban Quản Lý', 'Hành chính', 'Bình Dương - Cụm Nhà Máy A1', '15/08/2026', '16/08/2026', 2, 'Xe công ty', 3, 'Kiểm định dây chuyền may tự động A1', 'APPROVED', '2026-08-14 09:30:00'),
('rec_2', 'CT-2026-019', 'Khảo sát mở rộng Trung tâm Phân phối TTPP Đồng Nai', 'VP Chuỗi', 'Tổ hợp Đế Giày TTPP', 'Phòng Logistics', 'Logistics', 'Đồng Nai - Kho Logistics TTPP', '18/08/2026', '18/08/2026', 1, 'Xe công ty', 2, 'Khảo sát hiện trường kho bãi', 'PENDING', '2026-08-15 08:15:00');

-- 13. MEETING ROOMS & VISITOR MANAGEMENT (Phòng họp & Đón khách)
CREATE TABLE IF NOT EXISTS meeting_rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 10,
    location TEXT NOT NULL,
    equipment TEXT,
    status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, BUSY, MAINTENANCE
    is_locked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_bookings (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    room_name TEXT NOT NULL,
    title TEXT NOT NULL,
    booker_name TEXT NOT NULL,
    department TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    attendees_count INTEGER DEFAULT 5,
    notes TEXT,
    status TEXT DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, COMPLETED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,
    badge_code TEXT NOT NULL UNIQUE,
    visitor_name TEXT NOT NULL,
    company TEXT NOT NULL,
    id_card TEXT,
    host_name TEXT NOT NULL,
    department TEXT NOT NULL,
    room_location TEXT NOT NULL,
    visit_date TEXT NOT NULL,
    expected_time TEXT NOT NULL,
    status TEXT DEFAULT 'EXPECTED', -- EXPECTED, CHECKED_IN, CHECKED_OUT, CANCELLED
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial meeting rooms
INSERT OR REPLACE INTO meeting_rooms (id, name, capacity, location, equipment, status) VALUES
('room_1', 'Phòng Họp OTI / OTG', 16, 'Tầng 3 - VP Chuỗi SKECHERS', 'Máy chiếu 4K, Micro không dây, Bảng kính, Trà nước', 'AVAILABLE'),
('room_2', 'Phòng Họp WORK', 30, 'Tầng 2 - VP Chuỗi SKECHERS', 'Màn hình LED 120 inch, 4 Micro, Camera Zoom 360, Trà nước', 'AVAILABLE'),
('room_3', 'Phòng Họp MEN USA', 12, 'Tầng 2 - Khối Thị Trường Mỹ', 'Smart TV 65 inch, Hệ thống họp từ xa, Bảng di động', 'AVAILABLE'),
('room_4', 'Phòng Họp SOURCING', 15, 'Tầng 1 - Trung Tâm Sourcing & Vật Tư', 'Máy chiếu 3D, Bảng tương tác, Tủ mẫu vật tư SKECHERS', 'AVAILABLE'),
('room_5', 'Phòng Họp Chính', 25, 'Tầng 3 - Hội Trường Trung Tâm', 'Hệ thống Âm thanh Hội thảo, Màn hình LED, Trà nước', 'AVAILABLE'),
('room_6', 'Phòng Họp Phụ', 8, 'Tầng 1 - Khu Hành Chánh & Nhân Sự', 'Smart TV 55 inch, Bảng trắng, Bàn phỏng vấn', 'AVAILABLE');

INSERT OR REPLACE INTO room_bookings (id, room_id, room_name, title, booker_name, department, booking_date, time_slot, attendees_count, status) VALUES
('b_1', 'room_2', 'Phòng Họp Hội Thảo SKECHERS', 'Họp Đánh Giá Tiến Độ Kế Hoạch CI Q2/2026', 'Ban Quản Lý', 'Hành chính', '15/08/2026', '09:00 - 11:30', 18, 'CONFIRMED'),
('b_2', 'room_1', 'Phòng Họp Executive VIP 1', 'Tiếp Đoàn Chuyên Gia SKECHERS Global', 'Phòng R&D', 'R&D Kỹ thuật', '15/08/2026', '14:00 - 16:30', 12, 'CONFIRMED');

INSERT OR REPLACE INTO visitors (id, badge_code, visitor_name, company, id_card, host_name, department, room_location, visit_date, expected_time, status) VALUES
('v_1', 'VIS-2026-081', 'Đoàn Chuyên Gia SKECHERS', 'SKECHERS International Ltd.', 'C10928374', 'Ban Quản Lý', 'Văn phòng Chuỗi', 'Phòng Họp Executive VIP 1', '15/08/2026', '14:00', 'EXPECTED');

-- 14. MULTI-ROLE USER PROFILES SEED (Các vai trò chính)
INSERT OR REPLACE INTO users (id, emp_code, email, name, phone, password_hash, role_id, department_id, title, department, role_code, status) VALUES
(201, 'TGĐ-001', 'tgd@tbsgroup.vn', 'Tổng Giám Đốc', '0988000001', '123456', 1, 1, 'Tổng Giám Đốc Tập Đoàn TBS Group', 'Ban Giám Đốc Tập Đoàn', 'TONG_GIAM_DOC', 'ACTIVE'),
(202, 'PTGĐ-002', 'ptgd@tbsgroup.vn', 'Phó Tổng Giám Đốc', '0988000002', '123456', 2, 2, 'Phó Tổng Giám Đốc Vận Hành', 'Ban Giám Đốc Vận Hành', 'PHO_TONG_GIAM_DOC', 'ACTIVE'),
(203, 'GĐ-003', 'gd@tbsgroup.vn', 'Giám Đốc', '0988000003', '123456', 3, 3, 'Giám Đốc Khối Sản Xuất', 'Khối Sản Xuất & Nhà Máy', 'GIAM_DOC', 'ACTIVE'),
(204, 'PGĐ-004', 'pgd@tbsgroup.vn', 'Phó Giám Đốc', '0988000004', '123456', 4, 4, 'Phó Giám Đốc QC & Gemba', 'Khối Quản Lý Chất Lượng (QC)', 'PHO_GIAM_DOC', 'ACTIVE'),
(205, '202608001', 'anhy.work.2004@gmail.com', 'Phạm Nguyễn Anh Huy', '0522511245', '21032004', 5, 5, 'IT - Team Chuyển Đổi Số', 'IT - Team Chuyển Đổi Số', 'CBCNV', 'ACTIVE'),
(206, '202608002', 'tranhuy110421@gmail.com', 'Trần Ngọc Huy', '0988000002', '123456', 5, 6, 'Lễ Tân Văn Phòng', 'Nhân Sự - Hành Chánh', 'LE_TAN', 'ACTIVE'),
(207, 'EMP-003', 'staff3@tbsgroup.vn', 'Cán Bộ Công Nhân Viên', '0988000007', '123456', 5, 7, 'Cán Bộ Công Nhân Viên', 'Văn Phòng Chuỗi SKECHERS', 'CBCNV', 'ACTIVE');

DROP TABLE IF EXISTS user_profile;
CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY,
    emp_code TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar TEXT,
    title TEXT,
    department TEXT,
    role_code TEXT,
    redirect_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO user_profile (id, emp_code, name, email, phone, avatar, title, department, role_code, redirect_url, updated_at) VALUES
('current_user', '202608001', 'Phạm Nguyễn Anh Huy', 'anhy.work.2004@gmail.com', '0522511245', '/images/tbs-logo.png', 'IT - Team Chuyển Đổi Số', 'IT - Team Chuyển Đổi Số', 'CBCNV', '/work', CURRENT_TIMESTAMP);

-- 15. KAIZEN CONTINUOUS IMPROVEMENT PROPOSALS & EVALUATIONS
CREATE TABLE IF NOT EXISTS ci_kaizen_proposals (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT,
    registration_type TEXT NOT NULL DEFAULT 'THI_DUA', -- THI_DUA, LUU_TRU
    sub_status TEXT DEFAULT 'CHO_DANH_GIA', -- CHO_DANH_GIA, DA_DANH_GIA (NULL for LUU_TRU)
    region TEXT DEFAULT 'VP Chuỗi',
    department TEXT NOT NULL,
    factory TEXT,
    proposer_name TEXT NOT NULL,
    proposer_emp_code TEXT NOT NULL,
    dept_code TEXT DEFAULT 'SK',
    before_description TEXT,
    after_solution TEXT,
    saved_seconds INTEGER DEFAULT 0,
    before_image_url TEXT,
    after_image_url TEXT,
    attachments_json TEXT,
    status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED
    award_title TEXT,
    score_points REAL DEFAULT 0.0,
    avg_rating REAL DEFAULT 0.0,
    average_score REAL,
    rating_count INTEGER DEFAULT 0,
    vote_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    rejection_reason TEXT,
    trang_thai TEXT DEFAULT 'CHO_DUYET', -- CHO_DUYET, CAN_CHINH_SUA, DA_DANH_GIA, DA_XEP_HANG, DA_GOP
    line TEXT,
    nguoi_kiem_chung TEXT,
    anh_kiem_chung_json TEXT,
    nhan_xet_kiem_chung TEXT,
    so_giay_tiet_kiem INTEGER DEFAULT 0,
    diem_hieu_qua REAL DEFAULT 0.0,
    diem_tong_hop REAL DEFAULT 0.0,
    hang_xep INTEGER DEFAULT 0,
    merged_into_id TEXT,
    evaluated_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ci_kaizen_merged_proposals (
    id TEXT PRIMARY KEY,
    original_proposal_id TEXT NOT NULL,
    merged_proposal_id TEXT NOT NULL,
    attachments_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (original_proposal_id) REFERENCES ci_kaizen_proposals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ci_kaizen_evaluations (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL,
    evaluator_emp_code TEXT NOT NULL,
    evaluator_name TEXT NOT NULL,
    rating_stars REAL NOT NULL, -- 0.5 - 5.0, step 0.5
    comments TEXT,
    is_locked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES ci_kaizen_proposals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ci_kaizen_expert_evaluations (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL,
    evaluator_emp_code TEXT NOT NULL,
    evaluator_name TEXT NOT NULL,
    evaluator_title TEXT,
    prerequisite_pass INTEGER DEFAULT 1, -- 1: PASS, 0: FAIL
    criterion1_score REAL DEFAULT 0.0, -- Max 35 (Dynamic per Category)
    criterion2_score REAL DEFAULT 0.0, -- Max 20
    criterion3_score REAL DEFAULT 0.0, -- Max 20
    criterion4_score REAL DEFAULT 0.0, -- Max 15
    criterion5_score REAL DEFAULT 0.0, -- Max 10
    total_score REAL DEFAULT 0.0,      -- Max 100
    comments TEXT,
    status TEXT DEFAULT 'DRAFT',        -- DRAFT, CONFIRMED
    confirmed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES ci_kaizen_proposals(id) ON DELETE CASCADE
);

