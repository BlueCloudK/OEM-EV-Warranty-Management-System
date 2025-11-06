package com.swp391.warrantymanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception được ném ra khi có một nỗ lực tạo ra một tài nguyên đã tồn tại (ví dụ: tạo user với username đã có).
 * <p>
 * Annotation {@code @ResponseStatus(HttpStatus.CONFLICT)} sẽ tự động khiến Spring MVC
 * trả về HTTP status 409 (Conflict) khi exception này được ném ra, báo cho client biết rằng
 * yêu cầu không thể được xử lý do xung đột với trạng thái hiện tại của tài nguyên.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s with %s '%s' already exists.", resourceName, fieldName, fieldValue));
    }

    public DuplicateResourceException(String message) {
        super(message);
    }
}
