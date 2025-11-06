package com.swp391.warrantymanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception được ném ra khi có một nỗ lực xóa một tài nguyên đang được sử dụng
 * hoặc đang được tham chiếu bởi các tài nguyên khác.
 * <p>
 * Annotation {@code @ResponseStatus(HttpStatus.CONFLICT)} sẽ tự động khiến Spring MVC
 * trả về HTTP status 409 (Conflict) khi exception này được ném ra, báo cho client biết rằng
 * yêu cầu không thể được xử lý do xung đột (ví dụ: không thể xóa một 'Part' vì nó đang được
 * sử dụng trong một 'WarrantyClaim').
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ResourceInUseException extends RuntimeException {

    public ResourceInUseException(String message) {
        super(message);
    }
}
