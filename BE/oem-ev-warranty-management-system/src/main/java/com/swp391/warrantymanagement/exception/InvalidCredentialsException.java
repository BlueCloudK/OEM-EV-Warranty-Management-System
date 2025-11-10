package com.swp391.warrantymanagement.exception;

/**
 * Exception được ném ra khi thông tin đăng nhập không hợp lệ
 * (username không tồn tại hoặc password không đúng)
 *
 * Sẽ được GlobalExceptionHandler xử lý và trả về HTTP 401 Unauthorized
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }

    public InvalidCredentialsException(String message, Throwable cause) {
        super(message, cause);
    }
}
