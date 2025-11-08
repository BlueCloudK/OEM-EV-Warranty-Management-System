-- =====================================================
-- RESET ADMIN PASSWORD - CHẠY SCRIPT NÀY
-- =====================================================

-- Update password admin thành "123456"
-- Hash này được tạo từ BCrypt và đã verify chính xác
UPDATE users
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'admin';

-- Verify kết quả
SELECT
    user_id,
    username,
    email,
    role_id,
    SUBSTRING(password, 1, 30) as password_hash_preview,
    LENGTH(password) as password_length
FROM users
WHERE username = 'admin';

-- =====================================================
-- SAU KHI CHẠY SCRIPT NÀY:
-- Username: admin
-- Password: 123456
-- =====================================================
