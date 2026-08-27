-- Cloudflare D1 Database Schema for vpchuoiskechers

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  num TEXT NOT NULL,
  name TEXT NOT NULL,
  sub TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  has_data INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Profile Table
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY DEFAULT 'current_user',
  name TEXT NOT NULL DEFAULT 'Cán Bộ Công Nhân Viên',
  email TEXT NOT NULL DEFAULT 'cbcnv@tbsgroup.vn',
  phone TEXT NOT NULL DEFAULT '0988 000 005',
  avatar TEXT NOT NULL DEFAULT '/images/tbs-logo.png',
  title TEXT NOT NULL DEFAULT 'Cán Bộ Công Nhân Viên',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. System Notifications Table
CREATE TABLE IF NOT EXISTS system_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  desc TEXT NOT NULL,
  dept_id TEXT,
  timestamp TEXT NOT NULL,
  unread INTEGER DEFAULT 1
);

-- 4. QC Metrics Table
CREATE TABLE IF NOT EXISTS qc_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  pass_rate REAL DEFAULT 98.6,
  defect_count INTEGER DEFAULT 14,
  gemba_issues INTEGER DEFAULT 3,
  oee REAL DEFAULT 91.5
);

-- 5. Production Metrics Table
CREATE TABLE IF NOT EXISTS production_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  monthly_output TEXT DEFAULT '586,000 Đôi',
  active_lines INTEGER DEFAULT 33,
  kaizen_proposals INTEGER DEFAULT 128,
  target_pct REAL DEFAULT 104.2
);

-- Seed Default Departments Data
INSERT OR REPLACE INTO departments (id, num, name, sub, icon_name, has_data) VALUES
('hr', '01', 'Nhân sự hành chánh', 'Quản lý văn thư, tài sản & tuyển dụng', 'IconUsers', 1),
('finance', '02', 'Kế toán và quản trị', 'Quản lý tài chính, ngân sách & báo cáo', 'IconCalculator', 0),
('rd', '03', 'R&D (phát triển sản phẩm)', 'Nghiên cứu, thiết kế mẫu & kỹ thuật', 'IconFlask', 1),
('ci', '04', 'CN-CI', 'Cải tiến liên tục & năng suất 4.0', 'IconSettings', 0),
('qc', '05', 'Quản lý chất lượng', 'Chất lượng Gemba, QC & thử nghiệm', 'IconShieldCheck', 1),
('logistics', '06', 'Kế hoạch chuẩn bị – TTPP', 'Logistics, vật tư & chuỗi cung ứng', 'IconTruck', 0),
('production', '07', 'Tổ hợp Nhà máy', 'Quản lý tổ hợp nhà máy & sản xuất chuỗi', 'IconBuildingFactory', 1);

-- Seed Default User Profile Data
INSERT OR REPLACE INTO user_profile (id, name, email, phone, avatar, title, updated_at) VALUES
('current_user', 'Cán Bộ Công Nhân Viên', 'cbcnv@tbsgroup.vn', '0988 000 005', '/images/tbs-logo.png', 'Cán Bộ Công Nhân Viên', CURRENT_TIMESTAMP);

-- Seed Default System Notifications Data
INSERT OR REPLACE INTO system_notifications (id, title, desc, dept_id, timestamp, unread) VALUES
('notif_1', 'Cập nhật chỉ số QC dây chuyền 12', 'Phòng QC vừa phê duyệt báo cáo kiểm định 1,200 đôi mẫu mới.', 'qc', '10 phút trước', 1),
('notif_2', 'Thông báo lịch họp Gemba Walk tuần 33', 'Ban Giám Đốc sẽ thực hiện Gemba Walk tại Nhà máy A1 lúc 14:00.', 'hr', '45 phút trước', 1),
('notif_3', 'Đề xuất Kaizen cải tiến khâu may đế', 'Dây chuyền 05 vừa đóng góp 02 ý tưởng tiết kiệm 12% thời gian.', 'rd', '2 giờ trước', 0);
