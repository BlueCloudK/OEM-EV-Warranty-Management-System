package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.ServiceCenterRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.service.ServiceCenterService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Trung tâm bảo hành (ServiceCenter).
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc nhận và xác thực request,
 *     sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp (ví dụ: kiểm tra trùng lặp, tính toán khoảng cách địa lý)
 *     và việc truy cập dữ liệu đều được ủy thác cho {@link ServiceCenterService}.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, dữ liệu không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler}.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/service-centers")
@RequiredArgsConstructor
public class ServiceCenterController {

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
     * Tạo một trung tâm bảo hành mới. Endpoint này chỉ dành cho ADMIN.
     *
     * @param requestDTO DTO chứa thông tin của trung tâm bảo hành mới.
     * @return {@link ResponseEntity} chứa thông tin trung tâm đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCenterResponseDTO> createServiceCenter(
            @Valid @RequestBody ServiceCenterRequestDTO requestDTO) {
        // Thiết kế: Controller không cần khối try-catch.
        // Nếu có lỗi nghiệp vụ (ví dụ: tên hoặc số điện thoại đã tồn tại),
        // tầng Service sẽ ném ra một exception cụ thể (ví dụ: DuplicateResourceException).
        // GlobalExceptionHandler sẽ bắt exception này và trả về response lỗi HTTP tương ứng (409 Conflict).
        ServiceCenterResponseDTO response = serviceCenterService.createServiceCenter(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy thông tin chi tiết của một trung tâm bảo hành dựa trên ID.
     *
     * @param id ID của trung tâm bảo hành.
     * @return {@link ResponseEntity} chứa {@link ServiceCenterResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<ServiceCenterResponseDTO> getServiceCenterById(@PathVariable Long id) {
        // Thiết kế "Happy Path": Controller không cần kiểm tra kết quả trả về có null hay không.
        // Tầng Service được thiết kế để ném ra `ResourceNotFoundException` nếu không tìm thấy.
        // `GlobalExceptionHandler` sẽ bắt exception này và tự động trả về HTTP status 404 Not Found.
        ServiceCenterResponseDTO response = serviceCenterService.getServiceCenterById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách tất cả các trung tâm bảo hành, hỗ trợ phân trang và sắp xếp.
     *
     * @param page    Số trang (mặc định là 0).
     * @param size    Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @param sortBy  Trường để sắp xếp.
     * @param sortDir Hướng sắp xếp (ASC hoặc DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các trung tâm bảo hành.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
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
     * Cập nhật thông tin của một trung tâm bảo hành. Endpoint này chỉ dành cho ADMIN.
     *
     * @param id         ID của trung tâm cần cập nhật.
     * @param requestDTO DTO chứa thông tin cập nhật.
     * @return {@link ResponseEntity} chứa thông tin trung tâm đã được cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCenterResponseDTO> updateServiceCenter(
            @PathVariable Long id,
            @Valid @RequestBody ServiceCenterRequestDTO requestDTO) {
        ServiceCenterResponseDTO response = serviceCenterService.updateServiceCenter(id, requestDTO);
        // Thiết kế: Tương tự như các endpoint khác, Controller không xử lý logic lỗi.
        // Nếu ID không tồn tại, service sẽ ném ResourceNotFoundException -> 404 Not Found.
        // Nếu dữ liệu không hợp lệ (ví dụ: số điện thoại mới bị trùng), service sẽ ném exception -> 400/409.
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa một trung tâm bảo hành. Endpoint này chỉ dành cho ADMIN.
     *
     * @param id ID của trung tâm cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteServiceCenter(@PathVariable Long id) {
        serviceCenterService.deleteServiceCenter(id);
        // Thiết kế: Tầng Service sẽ chịu trách nhiệm xử lý các ràng buộc trước khi xóa.
        // 1. Nếu không tìm thấy, ném `ResourceNotFoundException` -> 404 Not Found.
        // 2. Nếu trung tâm đang có nhân viên hoặc yêu cầu bảo hành, ném `ResourceInUseException` -> 409 Conflict.
        // Trả về 204 No Content là một best practice cho các thao tác DELETE thành công.
        return ResponseEntity.noContent().build();
    }

    /**
     * Tìm kiếm các trung tâm bảo hành theo tên hoặc địa chỉ, hỗ trợ phân trang.
     *
     * @param keyword Từ khóa tìm kiếm.
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên trang.
     * @param sortBy  Trường để sắp xếp.
     * @param sortDir Hướng sắp xếp.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các trung tâm bảo hành phù hợp.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<PagedResponse<ServiceCenterResponseDTO>> searchServiceCenters(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceCenterId") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ServiceCenterResponseDTO> response = serviceCenterService.searchServiceCenters(keyword, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Tìm các trung tâm bảo hành ở gần một vị trí địa lý cho trước (trong một bán kính nhất định).
     *
     * @param latitude  Vĩ độ của vị trí trung tâm.
     * @param longitude Kinh độ của vị trí trung tâm.
     * @param radius    Bán kính tìm kiếm (tính bằng km).
     * @return {@link ResponseEntity} chứa một danh sách các trung tâm bảo hành trong bán kính đó.
     */
    @GetMapping("/nearby")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<List<ServiceCenterResponseDTO>> findServiceCentersNearby(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude,
            @RequestParam(defaultValue = "10.0") @Positive double radius) {

        // Thiết kế: Logic tính toán khoảng cách địa lý phức tạp (sử dụng công thức Haversine)
        // được đóng gói hoàn toàn trong tầng Service, giúp Controller giữ được sự đơn giản.
        List<ServiceCenterResponseDTO> response = serviceCenterService
                .findServiceCentersNearLocation(latitude, longitude, radius);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách tất cả các trung tâm bảo hành, được sắp xếp theo khoảng cách từ gần đến xa
     * so với một vị trí địa lý cho trước.
     *
     * @param latitude  Vĩ độ của vị trí tham chiếu.
     * @param longitude Kinh độ của vị trí tham chiếu.
     * @return {@link ResponseEntity} chứa một danh sách các trung tâm bảo hành đã được sắp xếp.
     */
    @GetMapping("/ordered-by-distance")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<List<ServiceCenterResponseDTO>> findAllOrderedByDistance(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude) {

        List<ServiceCenterResponseDTO> response = serviceCenterService
                .findAllOrderedByDistanceFrom(latitude, longitude);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật chỉ riêng thông tin vị trí (tọa độ) của một trung tâm bảo hành.
     * Endpoint này chỉ dành cho ADMIN.
     *
     * @param id        ID của trung tâm cần cập nhật.
     * @param latitude  Vĩ độ mới.
     * @param longitude Kinh độ mới.
     * @return {@link ResponseEntity} chứa thông tin trung tâm đã được cập nhật.
     */
    @PatchMapping("/{id}/location")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCenterResponseDTO> updateServiceCenterLocation(
            @PathVariable Long id,
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude) {

        ServiceCenterResponseDTO response = serviceCenterService
                .updateServiceCenterLocation(id, latitude, longitude);
        return ResponseEntity.ok(response);
    }
}
