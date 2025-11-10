package com.swp391.warrantymanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * @RestControllerAdvice: Annotation này biến class thành một "bộ xử lý lỗi toàn cục".
 * - Nó sẽ tự động "bắt" các exception được ném ra từ bất kỳ @RestController nào trong ứng dụng.
 * - Giúp tập trung toàn bộ logic xử lý lỗi vào một nơi duy nhất, làm cho code ở Controller sạch sẽ hơn.
 */
@RestControllerAdvice
public class GlobalExceptionHandler { 

    /**
     * Xử lý lỗi validation cho các DTO (Data Transfer Object).
     * - @ExceptionHandler(MethodArgumentNotValidException.class): Chỉ định rằng phương thức này sẽ được gọi khi có lỗi validation xảy ra.
     * - Lỗi này được ném ra tự động bởi Spring khi một đối tượng được đánh dấu @Valid trong tham số của Controller không thỏa mãn các ràng buộc (@NotNull, @Size, @Email...).
     *
     * @param ex Exception chứa thông tin về các lỗi validation.
     * @return Một ResponseEntity chứa cấu trúc lỗi JSON chi tiết và HTTP status 400 (Bad Request).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Step 1: Tạo một Map để lưu trữ các lỗi cụ thể của từng trường.
        Map<String, String> errors = new HashMap<>();
        // Step 2: Lặp qua tất cả các lỗi được tìm thấy trong BindingResult.
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            // Lấy tên của trường bị lỗi (ví dụ: "username", "email").
            String fieldName = ((FieldError) error).getField();
            // Lấy message lỗi đã được định nghĩa trong DTO (ví dụ: "Username is required").
            String errorMessage = error.getDefaultMessage();
            // Thêm cặp key-value (tên trường - message lỗi) vào map.
            errors.put(fieldName, errorMessage);
        });

        // Step 3: Xây dựng cấu trúc response JSON cuối cùng để trả về cho client.
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Validation failed");
        response.put("errors", errors); // Nhúng map lỗi chi tiết vào response.

        // Step 4: Trả về ResponseEntity với cấu trúc lỗi và HTTP status 400 (BAD_REQUEST).
        // Lý do: Lỗi validation là do client gửi dữ liệu không hợp lệ, nên 400 là status code phù hợp.
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xử lý lỗi "Resource Not Found" (Không tìm thấy tài nguyên).
     * - Bắt exception tùy chỉnh ResourceNotFoundException, được ném ra từ tầng Service khi không tìm thấy một đối tượng trong DB (ví dụ: tìm user với ID không tồn tại).
     * @param ex Exception chứa message lỗi cụ thể (ví dụ: "User not found with id: 5").
     * @return Một ResponseEntity chứa message lỗi và HTTP status 404 (Not Found).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage()); // Lấy message trực tiếp từ exception để trả về cho client.
        response.put("timestamp", System.currentTimeMillis());
        // Trả về status 404 (NOT_FOUND) để báo cho client biết rằng tài nguyên yêu cầu không tồn tại.
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Xử lý lỗi "Invalid Credentials" (Thông tin đăng nhập không hợp lệ).
     * - Bắt exception InvalidCredentialsException, được ném ra khi username không tồn tại hoặc password sai.
     * @param ex Exception chứa message lỗi cụ thể.
     * @return Một ResponseEntity chứa message lỗi và HTTP status 401 (Unauthorized).
     */
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("timestamp", System.currentTimeMillis());
        // Trả về status 401 (UNAUTHORIZED) để báo cho client biết thông tin đăng nhập không đúng.
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Xử lý các RuntimeException chung không được xử lý bởi các handler khác.
     * @param ex RuntimeException
     * @return Một ResponseEntity chứa message lỗi và HTTP status 500 (Internal Server Error).
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("timestamp", System.currentTimeMillis());
        // Trả về status 500 (INTERNAL_SERVER_ERROR) cho các lỗi không mong đợi.
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
