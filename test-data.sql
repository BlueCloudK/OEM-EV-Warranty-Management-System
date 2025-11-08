-- ===================================================================
-- SQL Test Data for OEM EV Warranty Management System
-- ===================================================================
-- Tạo dữ liệu test đầy đủ cho hệ thống quản lý bảo hành xe điện
-- Bao gồm: Users, Customers, Vehicles, Parts, Warranty Claims, Recalls
-- ===================================================================

-- Clean up existing data (optional - comment out if you want to keep existing data)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE recall_responses;
-- TRUNCATE TABLE recall_requests;
-- TRUNCATE TABLE warranty_claims;
-- TRUNCATE TABLE installed_parts;
-- TRUNCATE TABLE parts;
-- TRUNCATE TABLE vehicles;
-- TRUNCATE TABLE customers;
-- TRUNCATE TABLE service_centers;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- 1. SERVICE CENTERS (Trung tâm bảo hành)
-- ===================================================================
INSERT INTO service_centers (center_name, address, phone_number, email, manager_name) VALUES
('VinFast Service Center Hà Nội', 'Số 7, Đường Trần Duy Hưng, Quận Cầu Giấy, Hà Nội', '0241234567', 'hanoi@vinfastservice.vn', 'Nguyễn Văn A'),
('VinFast Service Center TP.HCM', 'Số 123, Đường Nguyễn Văn Linh, Quận 7, TP.HCM', '0287654321', 'hcm@vinfastservice.vn', 'Trần Thị B'),
('VinFast Service Center Đà Nẵng', 'Số 45, Đường Ngô Quyền, Quận Sơn Trà, Đà Nẵng', '0236987654', 'danang@vinfastservice.vn', 'Lê Văn C');

-- ===================================================================
-- 2. USERS (Tài khoản người dùng)
-- ===================================================================
-- Password: 123456 (BCrypt hash)
INSERT INTO users (username, password, role, full_name, email, phone_number, service_center_id, is_active) VALUES
-- Admin
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'ADMIN', 'Admin System', 'admin@vinfast.vn', '0901234567', NULL, TRUE),

-- EVM Staff (Employee Warranty Management)
('evm_staff1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'EVM_STAFF', 'Phạm Văn EVM', 'evm.staff1@vinfast.vn', '0902345678', NULL, TRUE),
('evm_staff2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'EVM_STAFF', 'Hoàng Thị EVM', 'evm.staff2@vinfast.vn', '0903456789', NULL, TRUE),

-- SC Staff (Service Center Staff) - Hà Nội
('scstaff_hn1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'SC_STAFF', 'Nguyễn Văn Staff HN', 'staff.hn1@vinfastservice.vn', '0904567890', 1, TRUE),
('scstaff_hn2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'SC_STAFF', 'Trần Thị Staff HN', 'staff.hn2@vinfastservice.vn', '0905678901', 1, TRUE),

-- SC Staff - TP.HCM
('scstaff_hcm1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'SC_STAFF', 'Lê Văn Staff HCM', 'staff.hcm1@vinfastservice.vn', '0906789012', 2, TRUE),

-- SC Technician (Kỹ thuật viên) - Hà Nội
('tech_hn1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'SC_TECHNICIAN', 'Phạm Văn Tech HN', 'tech.hn1@vinfastservice.vn', '0907890123', 1, TRUE),
('tech_hn2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'SC_TECHNICIAN', 'Đỗ Thị Tech HN', 'tech.hn2@vinfastservice.vn', '0908901234', 1, TRUE),

-- SC Technician - TP.HCM
('tech_hcm1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'SC_TECHNICIAN', 'Bùi Văn Tech HCM', 'tech.hcm1@vinfastservice.vn', '0909012345', 2, TRUE),

-- Customers
('customer1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'CUSTOMER', 'Nguyễn Văn Khách', 'customer1@gmail.com', '0910123456', NULL, TRUE),
('customer2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'CUSTOMER', 'Trần Thị Khách Hàng', 'customer2@gmail.com', '0911234567', NULL, TRUE),
('customer3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'CUSTOMER', 'Lê Văn Chủ Xe', 'customer3@gmail.com', '0912345678', NULL, TRUE),
('customer4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 'CUSTOMER', 'Phạm Thị Sở Hữu', 'customer4@gmail.com', '0913456789', NULL, TRUE);

-- ===================================================================
-- 3. CUSTOMERS (Thông tin khách hàng)
-- ===================================================================
INSERT INTO customers (user_id, customer_name, address, phone_number, email) VALUES
(10, 'Nguyễn Văn Khách', 'Số 123, Đường Láng, Đống Đa, Hà Nội', '0910123456', 'customer1@gmail.com'),
(11, 'Trần Thị Khách Hàng', 'Số 456, Đường Nguyễn Huệ, Quận 1, TP.HCM', '0911234567', 'customer2@gmail.com'),
(12, 'Lê Văn Chủ Xe', 'Số 789, Đường Trần Phú, Hải Châu, Đà Nẵng', '0912345678', 'customer3@gmail.com'),
(13, 'Phạm Thị Sở Hữu', 'Số 321, Đường Hoàng Diệu, Quận 4, TP.HCM', '0913456789', 'customer4@gmail.com');

-- ===================================================================
-- 4. VEHICLES (Xe)
-- ===================================================================
INSERT INTO vehicles (customer_id, vehicle_name, vehicle_vin, vehicle_model, vehicle_year, warranty_start_date, warranty_end_date, current_mileage, service_center_id) VALUES
-- Customer 1 - Xe còn bảo hành
(1, 'VinFast VF5 Plus', '87-MĐ-892.34', 'VF5 Plus', 2023, '2023-01-15', '2026-01-15', 15000, 1),
(1, 'VinFast VF8 Eco', '30-A1-123.45', 'VF8 Eco', 2023, '2023-06-20', '2026-06-20', 8000, 1),

-- Customer 2 - Xe hết hạn gần đây
(2, 'VinFast VF6 Base', '51-B2-234.56', 'VF6 Base', 2021, '2021-03-10', '2024-03-10', 45000, 2),

-- Customer 3 - Xe còn bảo hành
(3, 'VinFast VF9 Plus', '43-C3-345.67', 'VF9 Plus', 2023, '2023-09-05', '2026-09-05', 12000, 3),

-- Customer 4 - Xe hết hạn lâu
(4, 'VinFast VF e34', '29-D4-456.78', 'VF e34', 2020, '2020-05-01', '2023-05-01', 60000, 2);

-- ===================================================================
-- 5. PARTS (Phụ tùng)
-- ===================================================================
INSERT INTO parts (part_name, part_number, manufacturer, part_category, warranty_duration_months, price) VALUES
-- Standard Parts (24 tháng)
('Pin Lithium-ion 100kWh', 'BAT-100-LI', 'VinFast', 'STANDARD', 24, 250000000),
('Động cơ điện 150kW', 'MOT-150-EV', 'VinFast', 'STANDARD', 24, 180000000),
('Bộ sạc nhanh 11kW', 'CHG-11-QC', 'VinFast', 'STANDARD', 24, 15000000),
('Hệ thống phanh ABS', 'BRK-ABS-01', 'Bosch', 'STANDARD', 24, 25000000),
('Màn hình cảm ứng 12 inch', 'SCR-12-TCH', 'LG', 'STANDARD', 24, 18000000),

-- Extended Warranty Parts (36 tháng)
('Pin Lithium-ion 150kWh Premium', 'BAT-150-PR', 'VinFast', 'EXTENDED_WARRANTY', 36, 350000000),
('Động cơ điện 200kW Premium', 'MOT-200-PR', 'VinFast', 'EXTENDED_WARRANTY', 36, 280000000),
('Hệ thống treo điện tử', 'SUS-ELC-01', 'ZF', 'EXTENDED_WARRANTY', 36, 45000000),

-- Consumables (12 tháng)
('Lốp xe Michelin 20 inch', 'TIR-20-MCH', 'Michelin', 'CONSUMABLE', 12, 8000000),
('Bộ đĩa phanh trước', 'BRK-DSC-FR', 'Brembo', 'CONSUMABLE', 12, 6000000),
('Dầu phanh DOT4', 'OIL-BRK-D4', 'Castrol', 'CONSUMABLE', 12, 500000),

-- Non-Warranty Items
('Gương chiếu hậu', 'MIR-RV-01', 'VinFast', 'NON_WARRANTY', 0, 2000000),
('Cần gạt nước', 'WPR-BLD-01', 'Bosch', 'NON_WARRANTY', 0, 800000),
('Bóng đèn LED', 'LED-LMP-01', 'Philips', 'NON_WARRANTY', 0, 1200000);

-- ===================================================================
-- 6. INSTALLED PARTS (Phụ tùng đã lắp đặt)
-- ===================================================================
INSERT INTO installed_parts (vehicle_id, part_id, installation_date, warranty_expiration_date, mileage_at_installation, installed_by_user_id, notes) VALUES
-- Vehicle 1 (VF5 Plus) - Customer 1
(1, 1, '2023-01-15', '2025-01-15', 0, 7, 'Pin gốc của xe'),
(1, 2, '2023-01-15', '2025-01-15', 0, 7, 'Động cơ gốc'),
(1, 3, '2023-01-15', '2025-01-15', 0, 7, 'Bộ sạc gốc'),
(1, 9, '2023-03-20', '2024-03-20', 5000, 7, 'Thay lốp mới'),

-- Vehicle 2 (VF8 Eco) - Customer 1
(2, 1, '2023-06-20', '2025-06-20', 0, 7, 'Pin gốc'),
(2, 2, '2023-06-20', '2025-06-20', 0, 7, 'Động cơ gốc'),
(2, 5, '2023-06-20', '2025-06-20', 0, 7, 'Màn hình gốc'),

-- Vehicle 3 (VF6 Base) - Customer 2 - Hết hạn
(3, 1, '2021-03-10', '2023-03-10', 0, 8, 'Pin gốc - hết hạn'),
(3, 2, '2021-03-10', '2023-03-10', 0, 8, 'Động cơ gốc - hết hạn'),
(3, 10, '2023-05-15', '2024-05-15', 40000, 8, 'Thay đĩa phanh'),

-- Vehicle 4 (VF9 Plus) - Customer 3
(4, 6, '2023-09-05', '2026-09-05', 0, 7, 'Pin Premium - Extended warranty'),
(4, 7, '2023-09-05', '2026-09-05', 0, 7, 'Động cơ Premium'),
(4, 8, '2023-09-05', '2026-09-05', 0, 7, 'Hệ thống treo điện tử'),

-- Vehicle 5 (VF e34) - Customer 4 - Hết hạn lâu
(5, 1, '2020-05-01', '2022-05-01', 0, 9, 'Pin gốc - hết hạn lâu'),
(5, 2, '2020-05-01', '2022-05-01', 0, 9, 'Động cơ gốc - hết hạn lâu');

-- ===================================================================
-- 7. WARRANTY CLAIMS (Yêu cầu bảo hành)
-- ===================================================================
INSERT INTO warranty_claims (vehicle_id, installed_part_id, customer_id, description, claim_date, status, is_paid_warranty, warranty_fee, paid_warranty_note, service_center_id, assigned_technician_id) VALUES
-- Claim 1: Free warranty - Đang xử lý
(1, 1, 1, 'Pin bị sụt dung lượng bất thường, chỉ còn 85% sau 15000km', NOW() - INTERVAL 10 DAY, 'PROCESSING', FALSE, NULL, NULL, 1, 7),

-- Claim 2: Free warranty - Hoàn thành
(1, 2, 1, 'Động cơ có tiếng kêu lạ khi tăng tốc', NOW() - INTERVAL 30 DAY, 'COMPLETED', FALSE, NULL, NULL, 1, 7),

-- Claim 3: Paid warranty - Chờ thanh toán
(3, 1, 2, 'Pin chai, cần thay mới. Xe hết hạn bảo hành 2 tháng', NOW() - INTERVAL 5 DAY, 'PENDING_PAYMENT', TRUE, 25000000, 'Phí bảo hành 10% giá trị pin (250tr * 10% = 25tr)', 2, NULL),

-- Claim 4: Free warranty - Tiếp nhận
(2, 3, 1, 'Bộ sạc không hoạt động', NOW() - INTERVAL 2 DAY, 'SUBMITTED', FALSE, NULL, NULL, 1, NULL),

-- Claim 5: Paid warranty - Đã thanh toán
(3, 2, 2, 'Động cơ bị giảm công suất. Xe hết hạn 1 tháng', NOW() - INTERVAL 20 DAY, 'PAYMENT_CONFIRMED', TRUE, 18000000, 'Phí bảo hành 10% giá trị động cơ (180tr * 10% = 18tr)', 2, 8),

-- Claim 6: Free warranty - Manager đang xem
(4, 6, 3, 'Pin Premium bị nóng bất thường khi sạc nhanh', NOW() - INTERVAL 3 DAY, 'MANAGER_REVIEW', FALSE, NULL, NULL, 3, NULL),

-- Claim 7: Từ chối - Không thuộc bảo hành
(1, 9, 1, 'Lốp xe bị mòn', NOW() - INTERVAL 15 DAY, 'REJECTED', FALSE, NULL, 'Lốp là vật tư tiêu hao, không thuộc diện bảo hành', 1, NULL);

-- ===================================================================
-- 8. RECALL REQUESTS (Yêu cầu thu hồi - từ Admin/EVM)
-- ===================================================================
INSERT INTO recall_requests (part_id, reason, affected_vehicles_count, status, created_by_user_id, admin_note) VALUES
-- Recall 1: Active - Pin có vấn đề
(1, 'Phát hiện lỗi hệ thống quản lý pin (BMS) có thể gây quá nhiệt. Cần kiểm tra và cập nhật phần mềm BMS cho tất cả xe sử dụng pin BAT-100-LI sản xuất từ 01/2023 đến 06/2023.',
150, 'ACTIVE', 2, 'Ưu tiên cao - Liên hệ khách hàng ngay lập tức'),

-- Recall 2: Completed - Động cơ
(2, 'Một số động cơ MOT-150-EV lô sản xuất Q1/2023 có vấn đề về ổ bi, có thể gây tiếng ồn. Cần kiểm tra và thay thế nếu cần thiết.',
80, 'COMPLETED', 2, 'Đã hoàn thành kiểm tra và thay thế'),

-- Recall 3: Active - Hệ thống phanh
(4, 'Phát hiện lỗi phần mềm hệ thống phanh ABS có thể ảnh hưởng đến khoảng cách phanh trong điều kiện đường trơn. Cần cập nhật phần mềm.',
200, 'ACTIVE', 1, 'Cần thực hiện ngay - Ảnh hưởng an toàn');

-- ===================================================================
-- 9. RECALL RESPONSES (Phản hồi thu hồi - từ Customer)
-- ===================================================================
INSERT INTO recall_responses (recall_request_id, vehicle_id, customer_id, status, customer_note, warranty_claim_id) VALUES
-- Response 1: Customer 1 - Chấp nhận recall pin
(1, 1, 1, 'ACCEPTED', 'Tôi đồng ý mang xe đến kiểm tra BMS', NULL),

-- Response 2: Customer 1 - Đã hoàn thành recall động cơ
(2, 1, 1, 'COMPLETED', 'Đã kiểm tra và thay ổ bi động cơ', 2),

-- Response 3: Customer 2 - Pending recall pin
(1, 3, 2, 'PENDING', NULL, NULL),

-- Response 4: Customer 3 - Chấp nhận recall phanh
(3, 4, 3, 'ACCEPTED', 'Tôi sẽ sắp xếp lịch mang xe đến cập nhật phần mềm', NULL),

-- Response 5: Customer 4 - Từ chối recall
(1, 5, 4, 'DECLINED', 'Xe của tôi đã hết hạn bảo hành, tôi sẽ tự kiểm tra', NULL);

-- ===================================================================
-- Summary Statistics
-- ===================================================================
SELECT 'Data insertion completed!' AS Status;

SELECT
    'SERVICE_CENTERS' AS TableName,
    COUNT(*) AS RecordCount
FROM service_centers
UNION ALL
SELECT 'USERS', COUNT(*) FROM users
UNION ALL
SELECT 'CUSTOMERS', COUNT(*) FROM customers
UNION ALL
SELECT 'VEHICLES', COUNT(*) FROM vehicles
UNION ALL
SELECT 'PARTS', COUNT(*) FROM parts
UNION ALL
SELECT 'INSTALLED_PARTS', COUNT(*) FROM installed_parts
UNION ALL
SELECT 'WARRANTY_CLAIMS', COUNT(*) FROM warranty_claims
UNION ALL
SELECT 'RECALL_REQUESTS', COUNT(*) FROM recall_requests
UNION ALL
SELECT 'RECALL_RESPONSES', COUNT(*) FROM recall_responses;

-- ===================================================================
-- Quick Test Queries
-- ===================================================================

-- 1. Check all users by role
-- SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- 2. Check vehicles with warranty status
-- SELECT
--     v.vehicle_name,
--     v.vehicle_vin,
--     v.warranty_end_date,
--     CASE
--         WHEN v.warranty_end_date >= CURDATE() THEN 'Active'
--         ELSE 'Expired'
--     END as warranty_status
-- FROM vehicles v;

-- 3. Check warranty claims by status
-- SELECT status, COUNT(*) as count FROM warranty_claims GROUP BY status;

-- 4. Check recall responses by status
-- SELECT status, COUNT(*) as count FROM recall_responses GROUP BY status;

-- ===================================================================
-- Login Credentials for Testing
-- ===================================================================
-- Username: admin          | Password: 123456 | Role: ADMIN
-- Username: evm_staff1     | Password: 123456 | Role: EVM_STAFF
-- Username: scstaff_hn1    | Password: 123456 | Role: SC_STAFF (Hà Nội)
-- Username: scstaff_hcm1   | Password: 123456 | Role: SC_STAFF (HCM)
-- Username: tech_hn1       | Password: 123456 | Role: SC_TECHNICIAN (Hà Nội)
-- Username: tech_hcm1      | Password: 123456 | Role: SC_TECHNICIAN (HCM)
-- Username: customer1      | Password: 123456 | Role: CUSTOMER
-- Username: customer2      | Password: 123456 | Role: CUSTOMER
-- Username: customer3      | Password: 123456 | Role: CUSTOMER
-- Username: customer4      | Password: 123456 | Role: CUSTOMER
-- ===================================================================
