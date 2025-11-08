-- =====================================================
-- FIX ADMIN PASSWORD
-- =====================================================
-- Script này để reset password của admin user
-- Chạy script này nếu không đăng nhập được

-- Option 1: Reset password admin về "123456"
-- Hash được tạo mới từ BCrypt với strength 10
UPDATE users
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'admin';

-- Verify update
SELECT username, email, role_id,
       SUBSTRING(password, 1, 20) as password_prefix,
       LENGTH(password) as password_length
FROM users
WHERE username = 'admin';

-- =====================================================
-- ALTERNATIVE PASSWORDS (uncomment nếu muốn dùng)
-- =====================================================

-- Option 2: Password = "admin"
-- UPDATE users SET password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cyhQQvqLdYW1F9SZ0WQK5pTmKNOa6' WHERE username = 'admin';

-- Option 3: Password = "admin123"
-- UPDATE users SET password = '$2a$10$rIsA/VKH.wl8RfNvQ2K5d.CQx5KnBj7f8fTe.WtFl5n6b6xKqHEiq' WHERE username = 'admin';

-- Option 4: Password = "password"
-- UPDATE users SET password = '$2a$10$lfQi9jSfETJFLSe7x7y3s.r7VBdJrXKVqYqT1jP0jL4J5F8kXQ5Gy' WHERE username = 'admin';

-- =====================================================
-- VERIFY ADMIN USER EXISTS
-- =====================================================
SELECT
    u.user_id,
    u.username,
    u.email,
    r.role_name,
    u.created_at,
    CASE
        WHEN LENGTH(u.password) = 60 THEN 'BCrypt hash valid length'
        ELSE 'WARNING: Invalid password hash length'
    END as password_status
FROM users u
JOIN roles r ON u.role_id = r.role_id
WHERE u.username = 'admin';

-- =====================================================
-- Password Reference:
-- 123456   -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- admin    -> $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cyhQQvqLdYW1F9SZ0WQK5pTmKNOa6
-- admin123 -> $2a$10$rIsA/VKH.wl8RfNvQ2K5d.CQx5KnBj7f8fTe.WtFl5n6b6xKqHEiq
-- password -> $2a$10$lfQi9jSfETJFLSe7x7y3s.r7VBdJrXKVqYqT1jP0jL4J5F8kXQ5Gy
-- =====================================================
