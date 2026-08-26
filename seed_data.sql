-- ============================================================
-- TBS GROUP D1 DATABASE - FULL SEED DATA
-- Database: vpchuoiskechers
-- Seed date: 2026-08-17
-- ============================================================

PRAGMA foreign_keys = OFF;

-- ============================================================
-- 1. ROLES
-- ============================================================
INSERT OR REPLACE INTO roles (id, name, code, level, description) VALUES
(1, 'Super Admin', 'SUPER_ADMIN', 1, 'Toàn quyền hệ thống'),
(2, 'Tổng Giám Đốc', 'TONG_GIAM_DOC', 2, 'Tổng Giám Đốc Tập Đoàn TBS'),
(3, 'Phó Tổng Giám Đốc', 'PHO_TONG_GIAM_DOC', 2, 'Phó Tổng Giám Đốc'),
(4, 'Giám Đốc', 'GIAM_DOC', 2, 'Giám Đốc Chuỗi Skechers'),
(5, 'Phó Giám Đốc', 'PHO_GIAM_DOC', 2, 'Phó Giám Đốc'),
(6, 'Trưởng Phòng', 'TRUONG_PHONG', 3, 'Trưởng phòng ban'),
(7, 'Nhân Viên', 'NHAN_VIEN', 4, 'Cán bộ công nhân viên'),
(8, 'Kỹ Thuật Viên', 'KY_THUAT_VIEN', 4, 'Kỹ thuật viên bảo trì'),
(9, 'Lễ Tân', 'LE_TAN', 4, 'Lễ tân văn phòng'),
(10, 'Quản Lý QC', 'QC_MANAGER', 3, 'Quản lý kiểm soát chất lượng');

-- ============================================================
-- 2. DEPARTMENTS (full set)
-- ============================================================
INSERT OR REPLACE INTO departments (id, name, code, description) VALUES
(1, 'Ban Giám Đốc Tập Đoàn', 'BAN_GIAM_DOC', 'Lãnh đạo cao nhất tập đoàn TBS'),
(2, 'Ban Giám Đốc Vận Hành', 'VAN_HANH', 'Điều hành vận hành chuỗi SKECHERS'),
(3, 'Khối Sản Xuất & Nhà Máy', 'SAN_XUAT', 'Quản lý nhà máy và sản xuất'),
(4, 'Khối Quản Lý Chất Lượng (QC)', 'CHAT_LUONG_QC', 'Quản lý chất lượng Gemba & QC'),
(5, 'IT - Team Chuyển Đổi Số', 'IT_DIGITAL', 'Phát triển hệ thống & chuyển đổi số'),
(6, 'Nhân Sự - Hành Chánh', 'NHAN_SU', 'Nhân sự, văn thư & tuyển dụng'),
(7, 'Kế Toán & Quản Trị Tài Chính', 'KE_TOAN', 'Kế toán, ngân sách & báo cáo tài chính'),
(8, 'R&D - Phát Triển Sản Phẩm', 'RD_PHAT_TRIEN', 'Nghiên cứu, thiết kế mẫu & kỹ thuật'),
(9, 'CN-CI (Cải Tiến Liên Tục)', 'CN_CI', 'Cải tiến liên tục & năng suất 4.0'),
(10, 'Logistics - KH Chuẩn Bị TTPP', 'LOGISTICS_TTPP', 'Logistics, vật tư & chuỗi cung ứng'),
(11, 'Tổ Hợp Nhà Máy & Sản Xuất', 'TO_HOP_NHA_MAY', 'Tổ hợp nhà máy SKECHERS toàn chuỗi');

-- ============================================================
-- 3. USERS - Đầy đủ nhân sự hệ thống
-- ============================================================
INSERT OR REPLACE INTO users (id, emp_code, email, name, phone, password_hash, role_id, department_id, title, department, role_code, status) VALUES
-- Ban Giám Đốc
(201, 'TGĐ-001', 'tgd@tbsgroup.vn', 'Tổng Giám Đốc', '0988000001', '123456', 2, 1, 'Tổng Giám Đốc Tập Đoàn TBS Group', 'Ban Giám Đốc Tập Đoàn', 'TONG_GIAM_DOC', 'ACTIVE'),
(202, 'PTGĐ-002', 'ptgd@tbsgroup.vn', 'Phó Tổng Giám Đốc', '0988000002', '123456', 3, 2, 'Phó Tổng Giám Đốc Vận Hành & Chuỗi Cung Ứng', 'Ban Giám Đốc Vận Hành', 'PHO_TONG_GIAM_DOC', 'ACTIVE'),
(203, 'GĐ-003', 'gd@tbsgroup.vn', 'Giám Đốc', '0988000003', '123456', 4, 3, 'Giám Đốc Khối Sản Xuất & Tổ Hợp Nhà Máy', 'Khối Sản Xuất & Nhà Máy', 'GIAM_DOC', 'ACTIVE'),
(204, 'PGĐ-004', 'pgd@tbsgroup.vn', 'Phó Giám Đốc', '0988000004', '123456', 5, 4, 'Phó Giám Đốc QC & Gemba', 'Khối Quản Lý Chất Lượng (QC)', 'PHO_GIAM_DOC', 'ACTIVE'),
-- IT Team
(205, '202608001', 'anhy.work.2004@gmail.com', 'Phạm Nguyễn Anh Huy', '0522511245', '21032004', 6, 5, 'IT - Team Chuyển Đổi Số', 'IT - Team Chuyển Đổi Số', 'TRUONG_PHONG', 'ACTIVE'),
(206, '202608002', 'tranhuy110421@gmail.com', 'Trần Ngọc Huy', '0522511246', '123456', 7, 6, 'Lễ Tân Văn Phòng', 'Nhân Sự - Hành Chánh', 'LE_TAN', 'ACTIVE'),
(207, '2026080001', 'anhy.work.2004@gmail.com', 'Phạm Nguyễn Anh Huy', '0522511245', '21032004', 6, 9, 'IT - Team Chuyển Đổi Số', 'IT - Team Chuyển Đổi Số', 'TRUONG_PHONG', 'ACTIVE'),
-- Nhân sự
(208, 'NS-001', 'ns001@tbsgroup.vn', 'Nguyễn Thị Lan Anh', '0988100001', '123456', 6, 6, 'Trưởng Phòng Nhân Sự', 'Nhân Sự - Hành Chánh', 'TRUONG_PHONG', 'ACTIVE'),
(209, 'NS-002', 'ns002@tbsgroup.vn', 'Lê Thị Minh Châu', '0988100002', '123456', 7, 6, 'Chuyên Viên Nhân Sự', 'Nhân Sự - Hành Chánh', 'NHAN_VIEN', 'ACTIVE'),
-- Kế toán
(210, 'KT-001', 'kt001@tbsgroup.vn', 'Trần Thị Thu Hương', '0988200001', '123456', 6, 7, 'Trưởng Phòng Kế Toán', 'Kế Toán & Quản Trị Tài Chính', 'TRUONG_PHONG', 'ACTIVE'),
(211, 'KT-002', 'kt002@tbsgroup.vn', 'Phạm Văn Đức', '0988200002', '123456', 7, 7, 'Kế Toán Viên', 'Kế Toán & Quản Trị Tài Chính', 'NHAN_VIEN', 'ACTIVE'),
-- R&D
(212, 'RD-001', 'rd001@tbsgroup.vn', 'Võ Thị Kim Loan', '0988300001', '123456', 6, 8, 'Trưởng Phòng R&D', 'R&D - Phát Triển Sản Phẩm', 'TRUONG_PHONG', 'ACTIVE'),
(213, 'RD-002', 'rd002@tbsgroup.vn', 'Nguyễn Quang Huy', '0988300002', '123456', 7, 8, 'Kỹ Sư R&D', 'R&D - Phát Triển Sản Phẩm', 'NHAN_VIEN', 'ACTIVE'),
-- QC
(214, 'QC-001', 'qc001@tbsgroup.vn', 'Bùi Thị Hằng', '0988400001', '123456', 10, 4, 'Quản Lý QC', 'Khối Quản Lý Chất Lượng (QC)', 'QC_MANAGER', 'ACTIVE'),
(215, 'QC-002', 'qc002@tbsgroup.vn', 'Lê Văn Tuấn', '0988400002', '123456', 7, 4, 'Kiểm Soát Viên QC', 'Khối Quản Lý Chất Lượng (QC)', 'NHAN_VIEN', 'ACTIVE'),
-- Bảo trì
(216, 'BT-001', 'bt001@tbsgroup.vn', 'Phạm Văn Bảo', '0988500001', '123456', 8, 3, 'Kỹ Thuật Viên Bảo Trì Trưởng', 'Khối Sản Xuất & Nhà Máy', 'KY_THUAT_VIEN', 'ACTIVE'),
(217, 'BT-002', 'bt002@tbsgroup.vn', 'Hoàng Văn Nam', '0988500002', '123456', 8, 3, 'Kỹ Thuật Viên Bảo Trì', 'Khối Sản Xuất & Nhà Máy', 'KY_THUAT_VIEN', 'ACTIVE'),
(218, 'BT-003', 'bt003@tbsgroup.vn', 'Trần Quốc Bình', '0988500003', '123456', 8, 3, 'Kỹ Thuật Viên Điện', 'Khối Sản Xuất & Nhà Máy', 'KY_THUAT_VIEN', 'ACTIVE'),
-- Logistics
(219, 'LG-001', 'lg001@tbsgroup.vn', 'Nguyễn Văn Minh', '0988600001', '123456', 6, 10, 'Trưởng Phòng Logistics', 'Logistics - KH Chuẩn Bị TTPP', 'TRUONG_PHONG', 'ACTIVE'),
(220, 'LG-002', 'lg002@tbsgroup.vn', 'Phạm Thị Oanh', '0988600002', '123456', 7, 10, 'Chuyên Viên Logistics', 'Logistics - KH Chuẩn Bị TTPP', 'NHAN_VIEN', 'ACTIVE');

-- ============================================================
-- 4. BRANCHES (Chi nhánh / Nhà máy)
-- ============================================================
INSERT OR REPLACE INTO branches (id, name, region, address) VALUES
(1, 'VP Chuỗi SKECHERS - Bình Dương', 'Miền Nam', 'KCN Đồng An, Thuận An, Bình Dương'),
(2, 'Nhà Máy A1 - SKECHERS', 'Miền Nam', 'Khu CN Bình Dương A1, Thuận An'),
(3, 'Nhà Máy A2 - SKECHERS', 'Miền Nam', 'Khu CN Bình Dương A2, Bến Cát'),
(4, 'Tổ Hợp TTPP - Đồng Nai', 'Miền Nam', 'KCN Long Thành, Đồng Nai'),
(5, 'Nhà Máy B - SKECHERS Xuất Khẩu', 'Miền Trung', 'KCN Dung Quất, Quảng Ngãi');

-- ============================================================
-- 5. ZONES & LINES (Phân xưởng)
-- ============================================================
INSERT OR REPLACE INTO zones (id, code, name, description) VALUES
(1, 'ZONE-A', 'Phân Xưởng May A', 'Khu may đế và thân giày SKECHERS A'),
(2, 'ZONE-B', 'Phân Xưởng May B', 'Khu may đế và thân giày SKECHERS B'),
(3, 'ZONE-C', 'Phân Xưởng Dây Chuyền C', 'Khu lắp ráp hoàn thiện'),
(4, 'ZONE-D', 'Kho Thành Phẩm', 'Khu lưu trữ và đóng gói'),
(5, 'ZONE-E', 'Khu Điện - Cơ Khí', 'Hệ thống điện và cơ khí');

INSERT OR REPLACE INTO lines (id, zone_id, code, name) VALUES
(1, 1, 'LINE-A01', 'Dây Chuyền May A01 - Thân Giày'),
(2, 1, 'LINE-A02', 'Dây Chuyền May A02 - Đế Giày'),
(3, 1, 'LINE-A03', 'Dây Chuyền May A03 - Hoàn Thiện'),
(4, 2, 'LINE-B01', 'Dây Chuyền May B01 - Thân Giày'),
(5, 2, 'LINE-B02', 'Dây Chuyền May B02 - Đế Giày'),
(6, 3, 'LINE-C01', 'Dây Chuyền Lắp Ráp C01'),
(7, 3, 'LINE-C02', 'Dây Chuyền Lắp Ráp C02'),
(8, 3, 'LINE-C03', 'Dây Chuyền Kiểm Tra Chất Lượng');

-- ============================================================
-- 6. MACHINES (Máy móc thiết bị)
-- ============================================================
INSERT OR REPLACE INTO machines (id, machine_code, name, serial_number, zone_id, line_id, branch_id, status, install_date, grid_x, grid_y) VALUES
(1, 'MCH-A01-001', 'Máy May Công Nghiệp Brother DB2-B737', 'BR-2024-00123', 1, 1, 2, 'OPERATING', '2024-01-15', 1, 1),
(2, 'MCH-A01-002', 'Máy May Công Nghiệp Juki DDL-9000C', 'JK-2024-00234', 1, 1, 2, 'OPERATING', '2024-01-15', 2, 1),
(3, 'MCH-A01-003', 'Máy May 2 Kim Kansai DFB-1412', 'KS-2024-00345', 1, 1, 2, 'WARNING', '2024-02-10', 3, 1),
(4, 'MCH-A02-001', 'Máy Ép Đế Pneumatic DESMA 3000', 'DS-2023-00456', 1, 2, 2, 'OPERATING', '2023-06-20', 1, 2),
(5, 'MCH-A02-002', 'Máy Phun Keo Tự Động Nordson', 'ND-2023-00567', 1, 2, 2, 'OPERATING', '2023-06-20', 2, 2),
(6, 'MCH-A02-003', 'Máy Cán Cao Su 3 Trục', 'CR-2022-00678', 1, 2, 2, 'DOWN', '2022-11-01', 3, 2),
(7, 'MCH-B01-001', 'Máy May Công Nghiệp Brother DB2-B737', 'BR-2024-00789', 2, 4, 3, 'OPERATING', '2024-03-01', 1, 1),
(8, 'MCH-B01-002', 'Máy Thêu Tajima TMEF-H908', 'TJ-2024-00890', 2, 4, 3, 'OPERATING', '2024-03-01', 2, 1),
(9, 'MCH-C01-001', 'Máy Dán Đế Tự Động CEMCO', 'CM-2023-00901', 3, 6, 2, 'OPERATING', '2023-09-15', 1, 1),
(10, 'MCH-C01-002', 'Dây Chuyền Kiểm Tra QC Tự Động', 'QC-2024-01012', 3, 8, 2, 'MAINTENANCE', '2024-01-20', 2, 1),
(11, 'MCH-E01-001', 'Máy Nén Khí Atlas Copco GA22', 'AC-2022-01123', 5, NULL, 2, 'OPERATING', '2022-08-10', 1, 1),
(12, 'MCH-E01-002', 'Hệ Thống Điện UPS APC 30kVA', 'AP-2023-01234', 5, NULL, 2, 'OPERATING', '2023-01-05', 2, 1);

-- ============================================================
-- 7. INCIDENT CATEGORIES
-- ============================================================
INSERT OR REPLACE INTO incident_categories (id, code, name, default_priority, estimated_fix_time_mins) VALUES
(1, 'MECHANICAL', 'Sự cố cơ khí', 'HIGH', 60),
(2, 'ELECTRICAL', 'Sự cố điện', 'HIGH', 45),
(3, 'HYDRAULIC', 'Sự cố thủy lực/khí nén', 'MEDIUM', 30),
(4, 'SOFTWARE', 'Lỗi phần mềm/PLC', 'MEDIUM', 20),
(5, 'PREVENTIVE', 'Bảo dưỡng định kỳ', 'LOW', 90),
(6, 'SAFETY', 'Vấn đề an toàn lao động', 'CRITICAL', 15),
(7, 'QUALITY', 'Sự cố ảnh hưởng chất lượng', 'HIGH', 30),
(8, 'COOLING', 'Hệ thống làm mát', 'MEDIUM', 45);

-- ============================================================
-- 8. MAINTENANCE TICKETS (Phiếu bảo trì mẫu)
-- ============================================================
INSERT OR REPLACE INTO maintenance_tickets (id, ticket_code, machine_id, reported_by_id, assigned_to_id, category_id, branch_id, priority, status, description, created_at, accepted_at, started_at, completed_at, response_time_sec, resolution_time_sec, root_cause, resolution_notes) VALUES
(1, 'MT-2026-0801', 3, 205, 216, 1, 2, 'HIGH', 'RESOLVED', 'Máy may A01-003 bị lệch mũi may, chất lượng đường may không đều', '2026-08-01 08:15:00', '2026-08-01 08:30:00', '2026-08-01 08:45:00', '2026-08-01 10:30:00', 900, 6300, 'Trục cam mòn, cần thay thế', 'Đã thay trục cam và hiệu chỉnh bộ phận tạo mũi may'),
(2, 'MT-2026-0802', 6, 215, 217, 2, 2, 'CRITICAL', 'RESOLVED', 'Máy cán cao su 3 trục bị hỏng motor điện, dây chuyền bị dừng', '2026-08-02 14:20:00', '2026-08-02 14:25:00', '2026-08-02 14:40:00', '2026-08-03 09:00:00', 300, 66600, 'Cuộn dây motor bị cháy do quá tải', 'Thay motor mới 15kW, kiểm tra hệ thống bảo vệ quá tải'),
(3, 'MT-2026-0803', 4, 216, 218, 3, 2, 'MEDIUM', 'RESOLVED', 'Áp suất khí nén giảm, ảnh hưởng lực ép đế giày', '2026-08-05 09:00:00', '2026-08-05 09:20:00', '2026-08-05 09:30:00', '2026-08-05 11:00:00', 1200, 5400, 'Van giảm áp bị rò rỉ', 'Thay van giảm áp mới và kiểm tra toàn hệ thống khí nén'),
(4, 'MT-2026-0810', 10, 205, 216, 7, 2, 'HIGH', 'IN_PROGRESS', 'Camera QC tự động báo lỗi nhận dạng, bỏ sót lỗi đế giày', '2026-08-10 13:45:00', '2026-08-10 14:00:00', '2026-08-10 14:15:00', NULL, 900, 0, NULL, NULL),
(5, 'MT-2026-0815', 1, 213, NULL, 5, 2, 'LOW', 'OPEN', 'Bảo dưỡng định kỳ 6 tháng máy may Brother DB2-B737 theo lịch', '2026-08-15 07:00:00', NULL, NULL, NULL, 0, 0, NULL, NULL),
(6, 'MT-2026-0816', 11, 205, 217, 2, 2, 'MEDIUM', 'ASSIGNED', 'Máy nén khí Atlas Copco phát tiếng ồn bất thường khi vận hành', '2026-08-16 10:30:00', '2026-08-16 10:45:00', NULL, NULL, 900, 0, NULL, NULL);

-- ============================================================
-- 9. QC METRICS (Chỉ số QC hàng tháng)
-- ============================================================
INSERT OR REPLACE INTO qc_metrics (id, date, pass_rate, defect_count, gemba_issues, oee) VALUES
(1, '2026-02-01', 97.8, 22, 5, 89.2),
(2, '2026-03-01', 98.1, 18, 4, 90.1),
(3, '2026-04-01', 98.3, 16, 4, 90.8),
(4, '2026-05-01', 98.5, 15, 3, 91.2),
(5, '2026-06-01', 98.6, 14, 3, 91.5),
(6, '2026-07-01', 98.8, 12, 2, 92.1),
(7, '2026-08-01', 99.0, 10, 2, 92.4);

-- ============================================================
-- 10. PRODUCTION METRICS (Chỉ số sản xuất)
-- ============================================================
INSERT OR REPLACE INTO production_metrics (id, date, monthly_output, active_lines, kaizen_proposals, target_pct) VALUES
(1, '2026-02-01', '521,000 Đôi', 30, 89, 98.7),
(2, '2026-03-01', '538,000 Đôi', 31, 95, 100.2),
(3, '2026-04-01', '545,000 Đôi', 31, 102, 101.1),
(4, '2026-05-01', '557,000 Đôi', 32, 110, 102.4),
(5, '2026-06-01', '569,000 Đôi', 32, 118, 103.3),
(6, '2026-07-01', '578,000 Đôi', 33, 124, 104.0),
(7, '2026-08-01', '586,000 Đôi', 33, 128, 104.2);

-- ============================================================
-- 11. SYSTEM NOTIFICATIONS
-- ============================================================
INSERT OR REPLACE INTO system_notifications (id, title, desc, dept_id, timestamp, unread) VALUES
('notif_1', 'Cập nhật chỉ số QC dây chuyền 12', 'Phòng QC vừa phê duyệt báo cáo kiểm định 1,200 đôi mẫu mới.', 'qc', '10 phút trước', 1),
('notif_2', 'Thông báo lịch họp Gemba Walk tuần 33', 'Ban Giám Đốc sẽ thực hiện Gemba Walk tại Nhà máy A1 lúc 14:00.', 'hr', '45 phút trước', 1),
('notif_3', 'Đề xuất Kaizen cải tiến khâu may đế', 'Dây chuyền 05 vừa đóng góp 02 ý tưởng tiết kiệm 12% thời gian.', 'rd', '2 giờ trước', 0),
('notif_4', 'Phiếu bảo trì khẩn MT-2026-0816 được tạo', 'Máy nén khí Atlas Copco phát tiếng ồn bất thường, đã phân công kỹ thuật viên.', 'production', '3 giờ trước', 1),
('notif_5', 'Báo cáo tháng 8 CN-CI đã nộp', 'Phòng CN-CI đã hoàn thành 128 đề xuất Kaizen, vượt KPI 4.2%.', 'ci', 'Hôm nay 08:00', 0),
('notif_6', 'Lịch phỏng vấn ứng viên Nhân sự', '03 ứng viên vị trí Kỹ Thuật Viên đã xác nhận phỏng vấn ngày 19/08.', 'hr', 'Hôm qua 16:30', 0);

-- ============================================================
-- 12. NOTIFICATIONS (Thông báo cá nhân cho users)
-- ============================================================
INSERT OR REPLACE INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 205, 'Phiếu bảo trì được chỉ định', 'Bạn đã được chỉ định xem xét phiếu MT-2026-0816', 'INFO', 0, '2026-08-16 10:45:00'),
(2, 205, 'Kaizen mới cần duyệt', '3 đề xuất Kaizen từ dây chuyền C01 đang chờ phê duyệt', 'WARNING', 0, '2026-08-15 14:00:00'),
(3, 205, 'Họp Gemba Walk', 'Nhắc nhở: Gemba Walk lúc 14:00 hôm nay tại nhà máy A1', 'INFO', 1, '2026-08-15 08:00:00'),
(4, 206, 'Khách đến thăm', 'Đoàn chuyên gia SKECHERS International sẽ đến lúc 14:00 tại Phòng họp VIP', 'INFO', 0, '2026-08-15 09:00:00'),
(5, 214, 'Cảnh báo QC', 'Dây chuyền A03 có tỷ lệ lỗi tăng 0.3% so với tuần trước', 'WARNING', 0, '2026-08-14 16:00:00');

-- ============================================================
-- 13. USER PROFILE (cho hệ thống profile)
-- ============================================================
INSERT OR REPLACE INTO user_profile (id, emp_code, name, email, phone, avatar, title, department, role_code, redirect_url, updated_at) VALUES
('202608001', '202608001', 'Phạm Nguyễn Anh Huy', 'anhy.work.2004@gmail.com', '0522511245', '/images/tbs-logo.png', 'IT - Team Chuyển Đổi Số', 'IT - Team Chuyển Đổi Số', 'TRUONG_PHONG', '/work', CURRENT_TIMESTAMP),
('2026080001', '2026080001', 'Phạm Nguyễn Anh Huy', 'anhy.work.2004@gmail.com', '0522511245', '/images/tbs-logo.png', 'IT - Team Chuyển Đổi Số', 'IT - Team Chuyển Đổi Số', 'TRUONG_PHONG', '/work', CURRENT_TIMESTAMP),
('202608002', '202608002', 'Trần Ngọc Huy', 'tranhuy110421@gmail.com', '0522511246', '/images/tbs-logo.png', 'Lễ Tân Văn Phòng', 'Nhân Sự - Hành Chánh', 'LE_TAN', '/rooms', CURRENT_TIMESTAMP),
('current_user', '202608001', 'Phạm Nguyễn Anh Huy', 'anhy.work.2004@gmail.com', '0522511245', '/images/tbs-logo.png', 'IT - Team Chuyển Đổi Số', 'IT - Team Chuyển Đổi Số', 'TRUONG_PHONG', '/work', CURRENT_TIMESTAMP);

-- ============================================================
-- 14. MEETING ROOMS (update đầy đủ)
-- ============================================================
INSERT OR REPLACE INTO meeting_rooms (id, name, capacity, location, equipment, status) VALUES
('room_1', 'Phòng Họp OTI / OTG', 16, 'Tầng 3 - VP Chuỗi SKECHERS', 'Máy chiếu 4K, Micro không dây, Bảng kính, Trà nước', 'AVAILABLE'),
('room_2', 'Phòng Họp WORK', 30, 'Tầng 2 - VP Chuỗi SKECHERS', 'Màn hình LED 120 inch, 4 Micro, Camera Zoom 360, Trà nước', 'AVAILABLE'),
('room_3', 'Phòng Họp MEN USA', 12, 'Tầng 2 - Khối Thị Trường Mỹ', 'Smart TV 65 inch, Hệ thống họp từ xa, Bảng di động', 'AVAILABLE'),
('room_4', 'Phòng Họp SOURCING', 15, 'Tầng 1 - Trung Tâm Sourcing & Vật Tư', 'Máy chiếu 3D, Bảng tương tác, Tủ mẫu vật tư SKECHERS', 'AVAILABLE'),
('room_5', 'Phòng Họp Hội Thảo', 25, 'Tầng 3 - Hội Trường Trung Tâm', 'Hệ thống Âm thanh Hội thảo, Màn hình LED, Trà nước', 'AVAILABLE'),
('room_6', 'Phòng Phỏng Vấn', 8, 'Tầng 1 - Khu Hành Chánh & Nhân Sự', 'Smart TV 55 inch, Bảng trắng, Bàn phỏng vấn', 'AVAILABLE');

-- ============================================================
-- 15. JOBS (Tuyển dụng)
-- ============================================================
INSERT OR REPLACE INTO jobs (id, title, description, requirements, location, department_id, status) VALUES
(1, 'Kỹ Thuật Viên Bảo Trì Máy May', 'Bảo trì, sửa chữa và vận hành hệ thống máy may công nghiệp trong dây chuyền sản xuất SKECHERS. Thực hiện bảo dưỡng định kỳ theo lịch và xử lý sự cố phát sinh.', '- Tốt nghiệp Trung cấp/Cao đẳng nghề Điện - Cơ khí\n- Có kinh nghiệm 1-3 năm bảo trì máy may công nghiệp\n- Ưu tiên ứng viên có kinh nghiệm với máy Brother, Juki, Kansai\n- Sức khỏe tốt, chịu khó làm việc theo ca', 'Nhà Máy A1 - Bình Dương', 3, 'ACTIVE'),
(2, 'Nhân Viên QC Dây Chuyền', 'Kiểm tra chất lượng sản phẩm giày SKECHERS trên dây chuyền sản xuất. Ghi nhận và báo cáo các điểm không phù hợp theo tiêu chuẩn QC quốc tế.', '- Tốt nghiệp THPT trở lên\n- Có kinh nghiệm QC ngành da giày là lợi thế\n- Có khả năng đọc hiểu tài liệu kỹ thuật tiếng Anh cơ bản\n- Cẩn thận, tỉ mỉ, trách nhiệm cao', 'VP Chuỗi SKECHERS - Bình Dương', 4, 'ACTIVE'),
(3, 'Chuyên Viên CN-CI (Cải Tiến Liên Tục)', 'Phân tích quy trình sản xuất, đề xuất và triển khai các dự án Kaizen nhằm tối ưu năng suất và chất lượng. Ứng dụng công cụ Lean/6 Sigma vào thực tế nhà máy.', '- Đại học chuyên ngành Kỹ thuật công nghiệp, Quản lý sản xuất hoặc tương đương\n- Có kiến thức về Lean Manufacturing, Kaizen, PDCA\n- Ưu tiên có chứng chỉ Lean/Six Sigma\n- Tiếng Anh giao tiếp tốt', 'VP Chuỗi SKECHERS - Bình Dương', 9, 'ACTIVE'),
(4, 'Kế Toán Tổng Hợp', 'Thực hiện công tác kế toán tổng hợp: hạch toán, lập báo cáo tài chính, kiểm soát ngân sách và đối chiếu công nợ theo quy định của TBS Group.', '- Đại học Kế toán/Tài chính/Kiểm toán\n- Có kinh nghiệm 2-3 năm kế toán tổng hợp\n- Thành thạo Excel, phần mềm kế toán (MISA, SAP ưu tiên)\n- Cẩn thận, chính xác, trung thực', 'VP Chuỗi SKECHERS - Bình Dương', 7, 'ACTIVE');

-- ============================================================
-- 16. AUDIT LOGS (mẫu)
-- ============================================================
INSERT OR REPLACE INTO audit_logs (id, user_id, action, target_entity, details, ip_address, timestamp) VALUES
(1, 205, 'LOGIN', 'users', 'Đăng nhập thành công với MSNV 202608001', '192.168.1.100', '2026-08-17 07:00:00'),
(2, 205, 'VIEW', 'maintenance_tickets', 'Xem danh sách phiếu bảo trì', '192.168.1.100', '2026-08-17 07:02:00'),
(3, 205, 'CREATE', 'maintenance_tickets', 'Tạo phiếu MT-2026-0816', '192.168.1.100', '2026-08-16 10:30:00'),
(4, 206, 'LOGIN', 'users', 'Đăng nhập thành công với MSNV 202608002', '192.168.1.101', '2026-08-17 07:05:00'),
(5, 214, 'UPDATE', 'qc_metrics', 'Cập nhật chỉ số QC tháng 8/2026', '192.168.1.102', '2026-08-17 08:00:00');

PRAGMA foreign_keys = ON;
