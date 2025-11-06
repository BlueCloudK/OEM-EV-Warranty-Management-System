package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.service.ServiceCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller chịu trách nhiệm cung cấp các API công khai (Public API),
 * không yêu cầu người dùng phải xác thực (đăng nhập).
 * <p>
 * <strong>Thiết kế:</strong>
 * <ul>
 *     <li>Việc tách các endpoint công khai ra một Controller riêng biệt là một quyết định thiết kế có chủ đích.
 *     Nó giúp phân tách rõ ràng các luồng truy cập, làm cho việc quản lý bảo mật ở file {@code SecurityConfig}
 *     trở nên đơn giản và dễ dàng hơn (ví dụ: cho phép toàn bộ {@code /api/public/**}).</li>
 *     <li>Controller này cũng tuân thủ nguyên tắc "Lean Controller", chỉ điều hướng request đến tầng Service
 *     và không chứa logic nghiệp vụ.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    /**
     * <strong>Constructor Injection:</strong>
     * <p>
     * Sử dụng {@code @RequiredArgsConstructor} của Lombok kết hợp với trường {@code final} để thực hiện Constructor Injection.
     * Đây là cách được khuyến khích để tiêm phụ thuộc trong Spring vì:
     * <ul>
     *     <li><b>Bất biến (Immutability):</b> Các dependency không thể bị thay đổi sau khi đối tượng được tạo.</li>
     *     <li><b>An toàn (Null-safety):</b> Đảm bảo các dependency bắt buộc phải được cung cấp khi khởi tạo, tránh lỗi {@code NullPointerException}.</li>
     *     <li><b>Dễ dàng cho việc Test:</b> Rất dễ dàng để tạo một instance của Controller với các đối tượng mock trong Unit Test.</li>
     * </ul>
     */
    private final ServiceCenterService serviceCenterService;

    /**
     * Lấy danh sách tất cả các trung tâm bảo hành, hỗ trợ phân trang và sắp xếp.
     * Endpoint này là công khai để người dùng (kể cả chưa đăng nhập) có thể tìm kiếm trung tâm bảo hành.
     *
     * @param page    Số trang (mặc định là 0).
     * @param size    Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @param sortBy  Trường để sắp xếp.
     * @param sortDir Hướng sắp xếp (ASC hoặc DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các trung tâm bảo hành.
     */
    @GetMapping("/service-centers")
    public ResponseEntity<PagedResponse<ServiceCenterResponseDTO>> getAllServiceCenters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceCenterId") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        
        // Thiết kế: Controller chịu trách nhiệm xây dựng các đối tượng Pageable và Sort từ các request param,
        // sau đó ủy thác hoàn toàn cho tầng Service để thực hiện logic truy vấn.
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ServiceCenterResponseDTO> response = serviceCenterService.getAllServiceCenters(pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy thông tin chi tiết của một trung tâm bảo hành dựa trên ID.
     * Endpoint này là công khai.
     *
     * @param id ID của trung tâm bảo hành.
     * @return {@link ResponseEntity} chứa {@link ServiceCenterResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/service-centers/{id}")
    public ResponseEntity<ServiceCenterResponseDTO> getServiceCenterById(@PathVariable Long id) {
        // Thiết kế "Happy Path": Controller không cần kiểm tra kết quả trả về có null hay không.
        // Tầng Service được thiết kế để ném ra `ResourceNotFoundException` nếu không tìm thấy trung tâm bảo hành.
        // `GlobalExceptionHandler` sẽ bắt exception này và tự động trả về HTTP status 404 Not Found.
        // Điều này giúp code ở Controller luôn gọn gàng và chỉ tập trung vào luồng xử lý thành công.
        ServiceCenterResponseDTO response = serviceCenterService.getServiceCenterById(id);
        return ResponseEntity.ok(response);
    }
}
