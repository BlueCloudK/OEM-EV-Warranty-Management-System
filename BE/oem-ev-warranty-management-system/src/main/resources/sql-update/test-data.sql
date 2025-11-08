-- =====================================================
-- OEM EV WARRANTY MANAGEMENT SYSTEM - TEST DATA
-- =====================================================
-- This file contains comprehensive test data for all entities
-- Generated based on JPA entity definitions
-- All passwords are: password (BCrypt hashed)
-- =====================================================

-- =====================================================
-- 1. ROLES (Master Data)
-- =====================================================
-- Table: roles
-- Columns: role_id, role_name
# INSERT INTO roles (role_name) VALUES
# ('ADMIN'),
# ('EVM_STAFF'),
# ('SC_STAFF'),
# ('SC_TECHNICIAN'),
# ('CUSTOMER');

-- =====================================================
-- 2. SERVICE CENTERS
-- =====================================================
-- Table: service_centers
-- Columns: service_center_id, name, address, phone, opening_hours, latitude, longitude
INSERT INTO service_centers (name, address, phone, opening_hours, latitude, longitude) VALUES
(N'Trung tâm Bảo hành VinFast Hà Nội', N'123 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội', '024-3838-8888', N'08:00 - 18:00 (T2-T7)', 21.0285, 105.8542),
(N'Trung tâm Bảo hành VinFast TP.HCM', N'456 Nguyễn Văn Linh, Quận 7, TP.HCM', '028-3838-9999', N'08:00 - 18:00 (T2-CN)', 10.7769, 106.7009),
(N'Trung tâm Bảo hành VinFast Đà Nẵng', N'789 Ngô Quyền, Sơn Trà, Đà Nẵng', '0236-3838-7777', N'08:00 - 17:30 (T2-T7)', 16.0544, 108.2022);

-- =====================================================
-- 3. USERS
-- =====================================================
-- Table: users
-- Columns: username, email, password, address, created_at, role_id, service_center_id
-- Password for all users: password (BCrypt hashed for Spring Security 3.5.6)

-- ADMIN (1 user)
INSERT INTO users (username, email, password, address, created_at, role_id, service_center_id) VALUES
('admin', 'admin@vinfast.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Tòa nhà VinFast, Hà Nội', '2024-01-01 08:00:00', 1, NULL);

-- EVM_STAFF (2 users)
INSERT INTO users (username, email, password, address, created_at, role_id, service_center_id) VALUES
('evmstaff1', 'evmstaff1@vinfast.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Tòa nhà VinFast, Hà Nội', '2024-01-01 08:00:00', 2, NULL),
('evmstaff2', 'evmstaff2@vinfast.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Tòa nhà VinFast, TP.HCM', '2024-01-01 08:00:00', 2, NULL);

-- SC_STAFF (3 users - one per service center)
INSERT INTO users (username, email, password, address, created_at, role_id, service_center_id) VALUES
('scstaff_hn', 'scstaff.hn@vinfast.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Hà Nội', '2024-01-01 08:00:00', 3, 1),
('scstaff_hcm', 'scstaff.hcm@vinfast.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'TP.HCM', '2024-01-01 08:00:00', 3, 2),
('scstaff_dn', 'scstaff.dn@vinfast.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Đà Nẵng', '2024-01-01 08:00:00', 3, 3);

-- SC_TECHNICIAN (3 users - one per service center)
INSERT INTO users (username, email, password, address, created_at, role_id, service_center_id) VALUES
('tech_hn', 'tech.hn@vinfast.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Hà Nội', '2024-01-01 08:00:00', 4, 1),
('tech_hcm', 'tech.hcm@vinfast.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'TP.HCM', '2024-01-01 08:00:00', 4, 2),
('tech_dn', 'tech.dn@vinfast.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'Đà Nẵng', '2024-01-01 08:00:00', 4, 3);

-- CUSTOMER (5 users)
INSERT INTO users (username, email, password, address, created_at, role_id, service_center_id) VALUES
('customer1', 'nguyenvana@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'45 Láng Hạ, Đống Đa, Hà Nội', '2024-01-15 10:30:00', 5, NULL),
('customer2', 'tranthib@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'123 Nguyễn Huệ, Quận 1, TP.HCM', '2024-01-20 14:00:00', 5, NULL),
('customer3', 'levanc@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'67 Trần Phú, Hải Châu, Đà Nẵng', '2024-02-01 09:15:00', 5, NULL),
('customer4', 'phamthid@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'89 Hoàng Diệu, Ba Đình, Hà Nội', '2024-02-10 11:45:00', 5, NULL),
('customer5', 'hoangvane@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'234 Lê Lợi, Quận 3, TP.HCM', '2024-02-15 16:20:00', 5, NULL);

-- =====================================================
-- 4. CUSTOMERS
-- =====================================================
-- Table: customers
-- Columns: customer_id (UUID), name, phone, user_id
INSERT INTO customers (customer_id, name, phone, user_id) VALUES
('c1111111-1111-1111-1111-111111111111', N'Nguyễn Văn A', '0912-345-678', 10),
('c2222222-2222-2222-2222-222222222222', N'Trần Thị B', '0923-456-789', 11),
('c3333333-3333-3333-3333-333333333333', N'Lê Văn C', '0934-567-890', 12),
('c4444444-4444-4444-4444-444444444444', N'Phạm Thị D', '0945-678-901', 13),
('c5555555-5555-5555-5555-555555555555', N'Hoàng Văn E', '0956-789-012', 14);

-- =====================================================
-- 5. VEHICLES
-- =====================================================
-- Table: vehicles
-- Columns: vehicle_name, vehicle_model, vehicle_year, vehicle_vin, purchase_date,
--          warranty_start_date, warranty_end_date, mileage, customer_id
INSERT INTO vehicles (vehicle_name, vehicle_model, vehicle_year, vehicle_vin, purchase_date, warranty_start_date, warranty_end_date, mileage, customer_id) VALUES
(N'VF5 Plus', 'VF5', 2023, '87-MĐ-892.34', '2023-06-15', '2023-06-15', '2033-06-15', 15000, 'c1111111-1111-1111-1111-111111111111'),
(N'VF8 Eco', 'VF8', 2023, '29-A1-234.56', '2023-07-20', '2023-07-20', '2033-07-20', 8500, 'c2222222-2222-2222-2222-222222222222'),
(N'VF9 Plus', 'VF9', 2024, '30-B2-345.67', '2024-01-10', '2024-01-10', '2034-01-10', 3200, 'c3333333-3333-3333-3333-333333333333'),
(N'VF e34', 'VF e34', 2023, '51-C3-456.78', '2023-09-05', '2023-09-05', '2033-09-05', 12000, 'c4444444-4444-4444-4444-444444444444'),
(N'VF5 Plus', 'VF5', 2024, '92-D4-567.89', '2024-03-15', '2024-03-15', '2034-03-15', 1500, 'c5555555-5555-5555-5555-555555555555');

-- =====================================================
-- 6. PARTS
-- =====================================================
-- Table: parts
-- Columns: part_name, part_number, manufacturer, price, has_extended_warranty,
--          default_warranty_months, default_warranty_mileage, grace_period_days,
--          paid_warranty_fee_percentage_min, paid_warranty_fee_percentage_max
INSERT INTO parts (part_name, part_number, manufacturer, price, has_extended_warranty, default_warranty_months, default_warranty_mileage, grace_period_days, paid_warranty_fee_percentage_min, paid_warranty_fee_percentage_max) VALUES
-- Critical parts with extended warranty
(N'Pin Lithium-ion 60kWh', 'BAT-VF5-60KWH-V1', 'VinFast', 85000000.00, TRUE, 96, 192000, 365, 0.20, 0.50),
(N'Động cơ điện 150kW', 'MTR-VF8-150KW-V1', 'VinFast', 65000000.00, TRUE, 48, 100000, 180, 0.25, 0.60),
(N'Pin Lithium-ion 87kWh', 'BAT-VF8-87KWH-V1', 'VinFast', 95000000.00, TRUE, 96, 192000, 365, 0.20, 0.50),
(N'Động cơ điện 300kW', 'MTR-VF9-300KW-V1', 'VinFast', 78000000.00, TRUE, 48, 100000, 180, 0.25, 0.60),
(N'Hệ thống BMS (Battery Management)', 'BMS-VF-001', 'VinFast', 45000000.00, TRUE, 36, 80000, 90, 0.30, 0.70),

-- Regular parts (no extended warranty - follow vehicle warranty)
(N'Màn hình cảm ứng 10 inch', 'DSP-10INCH-V1', 'VinFast', 15000000.00, FALSE, NULL, NULL, NULL, NULL, NULL),
(N'Camera 360 độ', 'CAM-360-V1', 'VinFast', 8000000.00, FALSE, NULL, NULL, NULL, NULL, NULL),
(N'Đèn LED trước', 'LED-FRONT-V1', 'VinFast', 5000000.00, FALSE, NULL, NULL, NULL, NULL, NULL),
(N'Đèn LED sau', 'LED-REAR-V1', 'VinFast', 4500000.00, FALSE, NULL, NULL, NULL, NULL, NULL),
(N'Ghế da cao cấp (bộ)', 'SEAT-LEATHER-SET', 'VinFast', 25000000.00, FALSE, NULL, NULL, NULL, NULL, NULL),

-- Additional critical parts
(N'Inverter điện tử', 'INV-VF-001', 'VinFast', 48000000.00, TRUE, 36, 80000, 90, 0.30, 0.70),
(N'Bộ sạc nhanh DC', 'CHG-DC-FAST-V1', 'VinFast', 35000000.00, TRUE, 24, 50000, 60, 0.35, 0.75),
(N'Hệ thống treo khí nén', 'SUS-AIR-V1', 'VinFast', 55000000.00, TRUE, 36, 80000, 90, 0.30, 0.70),
(N'Hệ thống phanh ABS', 'BRK-ABS-V1', 'VinFast', 28000000.00, TRUE, 24, 60000, 60, 0.35, 0.75);

-- =====================================================
-- 7. INSTALLED PARTS
-- =====================================================
-- Table: installed_parts
-- Columns: installation_date, warranty_expiration_date, mileage_at_installation,
--          warranty_period_months, warranty_mileage_limit, part_id, vehicle_id

-- Vehicle 1 (VF5 Plus - VIN: 87-MĐ-892.34) - customer_id: c1111111...
INSERT INTO installed_parts (installation_date, warranty_expiration_date, mileage_at_installation, warranty_period_months, warranty_mileage_limit, part_id, vehicle_id) VALUES
('2023-06-15', '2031-06-15', 0, 96, 192000, 1, 1), -- Battery 60kWh
('2023-06-15', '2027-06-15', 0, 48, 100000, 2, 1), -- Motor 150kW
('2023-06-15', '2026-06-15', 0, 36, 80000, 5, 1),  -- BMS
('2024-08-20', '2024-08-20', 14000, NULL, NULL, 6, 1); -- Display (replaced)

-- Vehicle 2 (VF8 Eco - VIN: 29-A1-234.56) - customer_id: c2222222...
INSERT INTO installed_parts (installation_date, warranty_expiration_date, mileage_at_installation, warranty_period_months, warranty_mileage_limit, part_id, vehicle_id) VALUES
('2023-07-20', '2031-07-20', 0, 96, 192000, 3, 2), -- Battery 87kWh
('2023-07-20', '2027-07-20', 0, 48, 100000, 2, 2), -- Motor 150kW
('2023-07-20', '2026-07-20', 0, 36, 80000, 11, 2), -- Inverter
('2024-10-15', '2024-10-15', 8000, NULL, NULL, 7, 2); -- Camera 360 (replaced)

-- Vehicle 3 (VF9 Plus - VIN: 30-B2-345.67) - customer_id: c3333333...
INSERT INTO installed_parts (installation_date, warranty_expiration_date, mileage_at_installation, warranty_period_months, warranty_mileage_limit, part_id, vehicle_id) VALUES
('2024-01-10', '2032-01-10', 0, 96, 192000, 3, 3), -- Battery 87kWh
('2024-01-10', '2028-01-10', 0, 48, 100000, 4, 3), -- Motor 300kW
('2024-01-10', '2027-01-10', 0, 36, 80000, 13, 3); -- Air suspension

-- Vehicle 4 (VF e34 - VIN: 51-C3-456.78) - customer_id: c4444444...
INSERT INTO installed_parts (installation_date, warranty_expiration_date, mileage_at_installation, warranty_period_months, warranty_mileage_limit, part_id, vehicle_id) VALUES
('2023-09-05', '2031-09-05', 0, 96, 192000, 1, 4), -- Battery 60kWh
('2023-09-05', '2027-09-05', 0, 48, 100000, 2, 4), -- Motor 150kW
('2023-09-05', '2025-09-05', 0, 24, 50000, 12, 4); -- DC Fast Charger

-- Vehicle 5 (VF5 Plus - VIN: 92-D4-567.89) - customer_id: c5555555...
INSERT INTO installed_parts (installation_date, warranty_expiration_date, mileage_at_installation, warranty_period_months, warranty_mileage_limit, part_id, vehicle_id) VALUES
('2024-03-15', '2032-03-15', 0, 96, 192000, 1, 5), -- Battery 60kWh
('2024-03-15', '2028-03-15', 0, 48, 100000, 2, 5), -- Motor 150kW
('2024-03-15', '2027-03-15', 0, 36, 80000, 5, 5);  -- BMS

-- =====================================================
-- 8. WARRANTY CLAIMS
-- =====================================================
-- Table: warranty_claims
-- Columns: claim_date, status, resolution_date, description, installed_part_id, vehicle_id,
--          service_center_id, assigned_to_user_id, recall_response_id, warranty_status,
--          is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim

-- Claim 1: Free warranty (COMPLETED)
INSERT INTO warranty_claims (claim_date, status, resolution_date, description, installed_part_id, vehicle_id, service_center_id, assigned_to_user_id, recall_response_id, warranty_status, is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim) VALUES
('2024-08-10 09:30:00', 'COMPLETED', '2024-08-12 15:00:00', N'Màn hình cảm ứng bị đơ, không phản hồi', 4, 1, 1, 7, NULL, 'VALID', FALSE, NULL, NULL, 14000);

-- Claim 2: Free warranty (PROCESSING)
INSERT INTO warranty_claims (claim_date, status, resolution_date, description, installed_part_id, vehicle_id, service_center_id, assigned_to_user_id, recall_response_id, warranty_status, is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim) VALUES
('2024-10-20 10:15:00', 'PROCESSING', NULL, N'Camera 360 bị mờ, không rõ hình ảnh', 8, 2, 2, 8, NULL, 'VALID', FALSE, NULL, NULL, 8200);

-- Claim 3: Paid warranty (COMPLETED) - Expired by date
INSERT INTO warranty_claims (claim_date, status, resolution_date, description, installed_part_id, vehicle_id, service_center_id, assigned_to_user_id, recall_response_id, warranty_status, is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim) VALUES
('2024-11-01 14:20:00', 'COMPLETED', '2024-11-03 16:30:00', N'Pin sụt dung lượng nhanh', 1, 1, 1, 7, NULL, 'EXPIRED_DATE', TRUE, 15000000.00, N'Quá hạn bảo hành 5 tháng, phí bảo hành 30% chi phí sửa chữa (50 triệu)', 15200);

-- Claim 4: Submitted (SUBMITTED)
INSERT INTO warranty_claims (claim_date, status, resolution_date, description, installed_part_id, vehicle_id, service_center_id, assigned_to_user_id, recall_response_id, warranty_status, is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim) VALUES
('2024-11-05 11:00:00', 'SUBMITTED', NULL, N'Động cơ phát ra tiếng ồn bất thường', 6, 2, 2, NULL, NULL, 'VALID', FALSE, NULL, NULL, 8500);

-- Claim 5: Manager Review (MANAGER_REVIEW)
INSERT INTO warranty_claims (claim_date, status, resolution_date, description, installed_part_id, vehicle_id, service_center_id, assigned_to_user_id, recall_response_id, warranty_status, is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim) VALUES
('2024-11-06 09:45:00', 'MANAGER_REVIEW', NULL, N'Hệ thống BMS báo lỗi code E204', 3, 1, 1, 7, NULL, 'VALID', FALSE, NULL, NULL, 15000);

-- ===== PAID WARRANTY CLAIMS (Linh kiện quá hạn phải trả phí) =====

-- Claim 6: Paid warranty - Expired by mileage (PENDING_PAYMENT)
INSERT INTO warranty_claims (claim_date, status, resolution_date, description, installed_part_id, vehicle_id, service_center_id, assigned_to_user_id, recall_response_id, warranty_status, is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim) VALUES
('2024-11-07 10:20:00', 'PENDING_PAYMENT', NULL, N'Động cơ giảm công suất, mất lực khi tăng tốc', 2, 1, 1, 7, NULL, 'EXPIRED_MILEAGE', TRUE, 8500000.00, N'Xe đã đi 105,000 km vượt quá giới hạn bảo hành 100,000 km. Phí bảo hành 35% chi phí sửa chữa ước tính (24 triệu). Vui lòng thanh toán để tiếp tục xử lý.', 105000);

-- Claim 7: Paid warranty - Expired both date and mileage (PAYMENT_CONFIRMED)
INSERT INTO warranty_claims (claim_date, status, resolution_date, description, installed_part_id, vehicle_id, service_center_id, assigned_to_user_id, recall_response_id, warranty_status, is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim) VALUES
('2024-11-07 14:30:00', 'PAYMENT_CONFIRMED', NULL, N'Inverter báo lỗi E502, xe không thể sạc pin', 7, 2, 2, 8, NULL, 'EXPIRED_BOTH', TRUE, 18000000.00, N'Quá hạn bảo hành cả theo thời gian (48 tháng) và số km (85,000/80,000 km). Phí bảo hành 50% chi phí thay inverter (36 triệu). Khách hàng đã thanh toán, chờ xác nhận từ manager.', 85000);

-- Claim 8: Paid warranty - Part warranty expired (PROCESSING)
INSERT INTO warranty_claims (claim_date, status, resolution_date, description, installed_part_id, vehicle_id, service_center_id, assigned_to_user_id, recall_response_id, warranty_status, is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim) VALUES
('2024-11-08 09:00:00', 'PROCESSING', NULL, N'Bộ sạc nhanh DC không hoạt động, hiển thị lỗi charging failure', 14, 4, 3, 9, NULL, 'PART_WARRANTY_EXPIRED', TRUE, 12000000.00, N'Bộ sạc đã hết hạn bảo hành (26 tháng, giới hạn 24 tháng). Phí bảo hành 40% chi phí thay bộ sạc (30 triệu). Đã xác nhận thanh toán, đang xử lý.', 52000);

-- Claim 9: Paid warranty - Expired mileage (COMPLETED)
INSERT INTO warranty_claims (claim_date, status, resolution_date, description, installed_part_id, vehicle_id, service_center_id, assigned_to_user_id, recall_response_id, warranty_status, is_paid_warranty, warranty_fee, paid_warranty_note, mileage_at_claim) VALUES
('2024-10-25 11:15:00', 'COMPLETED', '2024-10-28 16:00:00', N'Hệ thống treo khí nén bị rò rỉ, xe bị lún một bên', 11, 3, 3, 9, NULL, 'EXPIRED_MILEAGE', TRUE, 16500000.00, N'Số km vượt giới hạn bảo hành (82,000/80,000 km). Phí bảo hành 30% chi phí sửa chữa (55 triệu). Đã hoàn thành thay module khí nén.', 82000);

-- =====================================================
-- 9. RECALL REQUESTS
-- =====================================================
-- Table: recall_requests
-- Columns: part_id, status, reason, admin_note, customer_note, created_by, approved_by,
--          created_at, updated_at

-- Recall 1: Approved recall for Battery 60kWh
INSERT INTO recall_requests (part_id, status, reason, admin_note, customer_note, created_by, approved_by, created_at, updated_at) VALUES
(1, 'APPROVED_BY_ADMIN', N'Phát hiện lỗi hàng loạt trên pin 60kWh sản xuất từ tháng 6-8/2023. Pin có nguy cơ quá nhiệt trong điều kiện sạc nhanh liên tục. Cần thay thế module quản lý nhiệt.', N'Đã xác nhận lỗi qua phòng lab. Triệu hồi ngay tất cả xe bị ảnh hưởng.', NULL, 2, 1, '2024-10-01 08:00:00', '2024-10-01 10:00:00');

-- Recall 2: Pending recall for Inverter
INSERT INTO recall_requests (part_id, status, reason, admin_note, customer_note, created_by, approved_by, created_at, updated_at) VALUES
(11, 'PENDING_ADMIN_APPROVAL', N'Nhận được báo cáo từ 15 khách hàng về hiện tượng mất điện đột ngột. Nghi ngờ lỗi firmware của inverter phiên bản v1.2.3.', NULL, NULL, 3, NULL, '2024-11-01 14:30:00', '2024-11-01 14:30:00');

-- Recall 3: Rejected recall
INSERT INTO recall_requests (part_id, status, reason, admin_note, customer_note, created_by, approved_by, created_at, updated_at) VALUES
(8, 'REJECTED_BY_ADMIN', N'Đèn LED trước bị mờ sau 6 tháng sử dụng', N'Sau kiểm tra, đây là hiện tượng bình thường do khách hàng sử dụng trong môi trường bụi bặm. Không phải lỗi sản xuất hàng loạt.', NULL, 2, 1, '2024-09-15 09:00:00', '2024-09-16 11:00:00');

-- =====================================================
-- 10. RECALL RESPONSES
-- =====================================================
-- Table: recall_responses
-- Columns: recall_request_id, vehicle_id, status, customer_note, created_at, responded_at, completed_at

-- Responses for Recall 1 (Battery 60kWh recall - recall_request_id = 1)
-- Vehicle 1 (VF5 Plus - VIN: 87-MĐ-892.34) - ACCEPTED
INSERT INTO recall_responses (recall_request_id, vehicle_id, status, customer_note, created_at, responded_at, completed_at) VALUES
(1, 1, 'ACCEPTED', N'Tôi đồng ý tham gia đợt triệu hồi. Vui lòng sắp xếp lịch sớm nhất.', '2024-10-01 10:05:00', '2024-10-02 15:30:00', NULL);

-- Vehicle 4 (VF e34 - VIN: 51-C3-456.78) - COMPLETED
INSERT INTO recall_responses (recall_request_id, vehicle_id, status, customer_note, created_at, responded_at, completed_at) VALUES
(1, 4, 'COMPLETED', N'Tôi đồng ý tham gia', '2024-10-01 10:05:00', '2024-10-03 09:00:00', '2024-10-15 17:00:00');

-- Vehicle 5 (VF5 Plus - VIN: 92-D4-567.89) - PENDING
INSERT INTO recall_responses (recall_request_id, vehicle_id, status, customer_note, created_at, responded_at, completed_at) VALUES
(1, 5, 'PENDING', NULL, '2024-10-01 10:05:00', NULL, NULL);

-- =====================================================
-- END OF TEST DATA
-- =====================================================
