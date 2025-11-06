package com.swp391.warrantymanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serializable;

/**
 * Exception tùy chỉnh cho các lỗi "Không tìm thấy tài nguyên".
 * - Được ném ra từ tầng Service khi một tài nguyên (ví dụ: User, Vehicle) không tồn tại trong database.
 * - Kế thừa từ RuntimeException để không bắt buộc phải try-catch (unchecked exception).
 *
 * @ResponseStatus(HttpStatus.NOT_FOUND):
 * - Annotation này báo cho Spring MVC rằng khi exception này được ném ra,
 *   hãy tự động trả về HTTP status 404 (Not Found).
 * - Giúp code rõ ràng và có thể giảm bớt code trong GlobalExceptionHandler.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException implements Serializable {

    // Best practice: Thêm serialVersionUID cho các exception có thể được serialize.
    private static final long serialVersionUID = 1L;

    private final String resourceName;
    private final String fieldName;
    private final Object fieldValue;

    /**
     * Constructor để tạo một exception có cấu trúc rõ ràng.
     * @param resourceName Tên của tài nguyên không tìm thấy (ví dụ: "User", "Vehicle").
     * @param fieldName Tên của trường dùng để tìm kiếm (ví dụ: "id", "email").
     * @param fieldValue Giá trị của trường tìm kiếm (ví dụ: 5, "test@example.com").
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        // Step 1: Gọi constructor của lớp cha (RuntimeException) với một message lỗi được format sẵn.
        // Message này sẽ được hiển thị trong log và có thể được trả về cho client.
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));

        // Step 2: Lưu lại các thông tin chi tiết để có thể truy cập sau này (ví dụ: trong GlobalExceptionHandler).
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    /**
     * Constructor cho các trường hợp lỗi "not found" chung chung hơn.
     * @param message Message lỗi tùy chỉnh.
     */
    public ResourceNotFoundException(String message) {
        super(message);
        // Các trường chi tiết sẽ là null trong trường hợp này.
        this.resourceName = null;
        this.fieldName = null;
        this.fieldValue = null;
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getFieldName() {
        return fieldName;
    }

    public Object getFieldValue() {
        return fieldValue;
    }
}
