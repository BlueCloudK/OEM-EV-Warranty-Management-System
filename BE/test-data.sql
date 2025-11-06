-- =====================================================
-- TEST DATA SQL SCRIPT
-- OEM EV Warranty Management System
-- =====================================================
-- Purpose: Populate database with test data for authentication and basic features
-- Usage: Run this script after application creates tables (spring.jpa.hibernate.ddl-auto=update)
--
-- Test Users:
-- 1. admin / admin123 (ADMIN role)
-- 2. evmstaff / evm123 (EVM_STAFF role)
-- 3. scstaff / sc123 (SC_STAFF role)
-- 4. technician / tech123 (SC_TECHNICIAN role)
-- 5. customer / customer123 (CUSTOMER role)
-- =====================================================

-- Clean existing data (optional - comment out if you want to keep existing data)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE users;
-- TRUNCATE TABLE roles;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. INSERT ROLES
-- =====================================================
-- Note: Role names are stored WITHOUT "ROLE_" prefix in database
-- CustomUserDetailsService will add "ROLE_" prefix automatically

INSERT INTO roles (role_id, role_name, description, created_at, updated_at) VALUES
(1, 'ADMIN', 'System Administrator - Full access to all features', NOW(), NOW()),
(2, 'EVM_STAFF', 'EV Manufacturer Staff - Manage vehicles, parts, warranty policies', NOW(), NOW()),
(3, 'SC_STAFF', 'Service Center Staff - Manage warranty claims, service histories', NOW(), NOW()),
(4, 'SC_TECHNICIAN', 'Service Center Technician - Perform repairs, update work logs', NOW(), NOW()),
(5, 'CUSTOMER', 'Vehicle Owner - View warranty info, submit claims', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    role_name = VALUES(role_name),
    description = VALUES(description),
    updated_at = NOW();

-- =====================================================
-- 2. INSERT USERS
-- =====================================================
-- Passwords match DataInitializer.java:
-- - admin: "admin123" (BCrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)
-- - others: "1234567" (BCrypt: $2a$10$eImiTXuWVxfM37uY4JANjO8YRqBJFBAa3sMlm0KfHvPXPz7xWPKPi)

-- ADMIN User (password: admin123)
INSERT INTO users (user_id, username, password, email, phone, full_name, role_id, created_at, updated_at) VALUES
(1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@warranty.com', '0901234567', 'System Administrator', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    email = VALUES(email),
    updated_at = NOW();

-- EVM_STAFF User (password: 1234567)
INSERT INTO users (user_id, username, password, email, phone, full_name, role_id, created_at, updated_at) VALUES
(2, 'evmstaff', '$2a$10$eImiTXuWVxfM37uY4JANjO8YRqBJFBAa3sMlm0KfHvPXPz7xWPKPi', 'evm.staff@manufacturer.com', '0901234568', 'EVM Staff Manager', 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    email = VALUES(email),
    updated_at = NOW();

-- SC_STAFF User (password: 1234567)
INSERT INTO users (user_id, username, password, email, phone, full_name, role_id, created_at, updated_at) VALUES
(3, 'scstaff', '$2a$10$eImiTXuWVxfM37uY4JANjO8YRqBJFBAa3sMlm0KfHvPXPz7xWPKPi', 'sc.staff@servicecenter.com', '0901234569', 'Service Center Manager', 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    email = VALUES(email),
    updated_at = NOW();

-- SC_TECHNICIAN User (password: 1234567)
INSERT INTO users (user_id, username, password, email, phone, full_name, role_id, created_at, updated_at) VALUES
(4, 'technician', '$2a$10$eImiTXuWVxfM37uY4JANjO8YRqBJFBAa3sMlm0KfHvPXPz7xWPKPi', 'technician@servicecenter.com', '0901234570', 'Lead Technician', 4, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    email = VALUES(email),
    updated_at = NOW();

-- CUSTOMER User (password: 1234567)
INSERT INTO users (user_id, username, password, email, phone, full_name, role_id, created_at, updated_at) VALUES
(5, 'customer', '$2a$10$eImiTXuWVxfM37uY4JANjO8YRqBJFBAa3sMlm0KfHvPXPz7xWPKPi', 'customer@email.com', '0901234571', 'John Customer', 5, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    email = VALUES(email),
    updated_at = NOW();

-- =====================================================
-- 3. INSERT SAMPLE SERVICE CENTER (for testing)
-- =====================================================
INSERT INTO service_centers (service_center_id, center_name, address, city, phone, email, latitude, longitude, created_at, updated_at) VALUES
(1, 'Official Service Center Hanoi', '123 Nguyen Trai, Thanh Xuan', 'Hanoi', '0243456789', 'hanoi@servicecenter.com', 21.0285, 105.8542, NOW(), NOW()),
(2, 'Official Service Center HCMC', '456 Le Lai, District 1', 'Ho Chi Minh', '0283456789', 'hcmc@servicecenter.com', 10.7769, 106.7009, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    center_name = VALUES(center_name),
    updated_at = NOW();

-- =====================================================
-- 4. INSERT SAMPLE CUSTOMER (linked to customer user)
-- =====================================================
INSERT INTO customers (customer_id, user_id, full_name, phone, email, address, city, created_at, updated_at) VALUES
(1, 5, 'John Customer', '0901234571', 'customer@email.com', '789 Test Street, District 1', 'Ho Chi Minh', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    updated_at = NOW();

-- =====================================================
-- 5. INSERT SAMPLE VEHICLE (for customer)
-- =====================================================
INSERT INTO vehicles (vehicle_id, vin, license_plate, model, manufacturer, year, color, customer_id, purchase_date, warranty_start_date, warranty_end_date, mileage, status, created_at, updated_at) VALUES
(1, 'VIN1234567890ABCD', '29A-12345', 'EV Model X', 'Tesla Vietnam', 2024, 'White', 1, '2024-01-15', '2024-01-15', '2027-01-15', 5000, 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    license_plate = VALUES(license_plate),
    updated_at = NOW();

-- =====================================================
-- 6. INSERT SAMPLE PARTS
-- =====================================================
INSERT INTO parts (part_id, part_number, part_name, description, category, warranty_months, price, stock_quantity, created_at, updated_at) VALUES
(1, 'BAT-001', 'Battery Module 75kWh', 'Main battery pack module', 'BATTERY', 96, 150000000, 50, NOW(), NOW()),
(2, 'MOT-001', 'Electric Motor', 'Front drive motor 250kW', 'MOTOR', 60, 80000000, 30, NOW(), NOW()),
(3, 'INV-001', 'Power Inverter', 'DC to AC power inverter', 'ELECTRONICS', 36, 35000000, 100, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    part_name = VALUES(part_name),
    updated_at = NOW();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify data was inserted correctly:

-- Check roles
-- SELECT * FROM roles;

-- Check users with their roles
-- SELECT u.user_id, u.username, u.email, u.full_name, r.role_name
-- FROM users u
-- JOIN roles r ON u.role_id = r.role_id;

-- Check service centers
-- SELECT * FROM service_centers;

-- Check customers
-- SELECT c.*, u.username
-- FROM customers c
-- JOIN users u ON c.user_id = u.user_id;

-- Check vehicles
-- SELECT v.*, c.full_name as customer_name
-- FROM vehicles v
-- JOIN customers c ON v.customer_id = c.customer_id;

-- =====================================================
-- TEST CREDENTIALS SUMMARY
-- =====================================================
-- Passwords match DataInitializer.java for consistency
--
-- Username: admin      | Password: admin123 | Role: ADMIN
-- Username: evmstaff   | Password: 1234567  | Role: EVM_STAFF
-- Username: scstaff    | Password: 1234567  | Role: SC_STAFF
-- Username: technician | Password: 1234567  | Role: SC_TECHNICIAN
-- Username: customer   | Password: 1234567  | Role: CUSTOMER
-- =====================================================
-- BCrypt hashes:
-- - admin123: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- - 1234567:  $2a$10$eImiTXuWVxfM37uY4JANjO8YRqBJFBAa3sMlm0KfHvPXPz7xWPKPi
-- Generate custom passwords at: https://bcrypt-generator.com/
-- =====================================================
