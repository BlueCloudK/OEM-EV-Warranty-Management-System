package com.swp391.warrantymanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception tùy chỉnh được ném ra khi một hành động yêu cầu xác thực
 * nhưng không có người dùng nào được tìm thấy trong Security Context.
 *
 * @ResponseStatus(HttpStatus.UNAUTHORIZED):
 * - Annotation này báo cho Spring MVC rằng khi exception này được ném ra,
 *   hãy tự động trả về HTTP status 401 (Unauthorized) cho client.
 * - Giúp đơn giản hóa GlobalExceptionHandler, không cần viết thêm handler riêng cho lỗi này.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class AuthenticationRequiredException extends RuntimeException {
    public AuthenticationRequiredException(String message) {
        super(message);
    }
}