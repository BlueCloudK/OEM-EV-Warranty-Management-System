package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Lịch sử Bảo dưỡng (ServiceHistory).
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc nhận và xác thực request,
 *     sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp (ví dụ: xác thực sự tồn tại của Part và Vehicle, tạo khóa phức hợp)
 *     và việc truy cập dữ liệu đều được ủy thác cho {@link ServiceHistoryService}.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, dữ liệu không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler}.</li>
 * </ul>
 */
@RestController
@RequestMapping("api/service-histories")
@CrossOrigin
@RequiredArgsConstructor // REFACTOR: Sử dụng Lombok để tạo constructor, thay thế cho @Autowired
public class ServiceHistoryController {
    private static final Logger logger = LoggerFactory.getLogger(ServiceHistoryController.class);

    /**
     * <strong>Constructor Injection:</strong>
     * <p>
     * Sử dụng {@code @RequiredArgsConstructor} của Lombok kết hợp với các trường {@code final} để thực hiện Constructor Injection.
     * Đây là cách được khuyến khích để tiêm phụ thuộc trong Spring vì:
     * <ul>
     *     <li><b>Bất biến (Immutability):</b> Các dependency không thể bị thay đổi sau khi đối tượng được tạo.</li>
     *     <li><b>An toàn (Null-safety):</b> Đảm bảo các dependency bắt buộc phải được cung cấp khi khởi tạo, tránh lỗi {@code NullPointerException}.</li>
     *     <li><b>Dễ dàng cho việc Test:</b> Rất dễ dàng để tạo một instance của Controller với các đối tượng mock trong Unit Test.</li>
     * </ul>
     */
    private final ServiceHistoryService serviceHistoryService;

    /**
     * Lấy danh sách tất cả các lịch sử bảo dưỡng, hỗ trợ phân trang và tìm kiếm.
     * Endpoint này dành cho các vai trò quản trị và nhân viên.
     *
     * @param page   Số trang (mặc định là 0).
     * @param size   Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @param search Từ khóa tìm kiếm (trong mô tả hoặc loại dịch vụ).
     * @param sortBy  Trường để sắp xếp (mặc định: serviceDate).
     * @param sortDir Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các lịch sử bảo dưỡng.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getAllServiceHistories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "serviceDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        logger.info("Get all service histories request: page={}, size={}, search={}, sortBy={}, sortDir={}", page, size, search, sortBy, sortDir);

        // Map frontend sortBy to actual entity fields
        String mappedSortBy = sortBy;
        if ("vehicleVin".equals(sortBy)) {
            mappedSortBy = "vehicle.vehicleVin";
        } else if ("vehicleName".equals(sortBy)) {
            mappedSortBy = "vehicle.vehicleName";
        }

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(mappedSortBy).ascending() : Sort.by(mappedSortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getAllServiceHistoriesPage(
            pageable, search);
        logger.info("Get all service histories success, totalElements={}", historiesPage.getTotalElements());
        return ResponseEntity.ok(historiesPage);
    }

    /**
     * Lấy thông tin chi tiết của một lịch sử bảo dưỡng dựa trên ID.
     *
     * @param id ID của lịch sử bảo dưỡng.
     * @return {@link ResponseEntity} chứa {@link ServiceHistoryResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('EVM_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<ServiceHistoryResponseDTO> getServiceHistoryById(@PathVariable Long id) {
        logger.info("Get service history by id: {}", id);
        // Thiết kế "Happy Path": Controller không cần kiểm tra kết quả trả về có null hay không.
        // Tầng Service được thiết kế để ném ra `ResourceNotFoundException` nếu không tìm thấy.
        // `GlobalExceptionHandler` sẽ bắt exception này và tự động trả về HTTP status 404 Not Found.
        ServiceHistoryResponseDTO history = serviceHistoryService.getServiceHistoryById(id);
        logger.info("Service history found: {}", id);
        return ResponseEntity.ok(history);
    }

    /**
     * Tạo một bản ghi lịch sử bảo dưỡng mới.
     *
     * @param requestDTO DTO chứa thông tin về lịch sử bảo dưỡng.
     * @return {@link ResponseEntity} chứa thông tin bản ghi đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('EVM_STAFF')")
    public ResponseEntity<ServiceHistoryResponseDTO> createServiceHistory(@Valid @RequestBody ServiceHistoryRequestDTO requestDTO) {
        logger.info("Create service history request: {}", requestDTO);
        // Thiết kế: Controller không cần khối try-catch.
        // Nếu có lỗi nghiệp vụ (ví dụ: Part ID hoặc Vehicle ID không tồn tại),
        // tầng Service sẽ ném ra một exception cụ thể (ví dụ: ResourceNotFoundException).
        // GlobalExceptionHandler sẽ bắt exception này và trả về response lỗi HTTP tương ứng (404).
        ServiceHistoryResponseDTO responseDTO = serviceHistoryService.createServiceHistory(requestDTO);
        logger.info("Service history created: {}", responseDTO.getServiceHistoryId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    /**
     * Cập nhật thông tin của một lịch sử bảo dưỡng.
     *
     * @param id         ID của lịch sử bảo dưỡng cần cập nhật.
     * @param requestDTO DTO chứa thông tin cập nhật.
     * @return {@link ResponseEntity} chứa thông tin đã được cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('EVM_STAFF')")
    public ResponseEntity<ServiceHistoryResponseDTO> updateServiceHistory(@PathVariable Long id,
                                                                        @Valid @RequestBody ServiceHistoryRequestDTO requestDTO) {
        logger.info("Update service history request: id={}, data={}", id, requestDTO);
        // Thiết kế: Tương tự như các endpoint khác, Controller không xử lý logic lỗi.
        // Nếu ID không tồn tại, service sẽ ném ResourceNotFoundException -> 404 Not Found.
        ServiceHistoryResponseDTO updatedHistory = serviceHistoryService.updateServiceHistory(id, requestDTO);
        logger.info("Service history updated: {}", id);
        return ResponseEntity.ok(updatedHistory);
    }

    /**
     * Xóa một lịch sử bảo dưỡng. Endpoint này chỉ dành cho ADMIN.
     *
     * @param id ID của lịch sử bảo dưỡng cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteServiceHistory(@PathVariable Long id) {
        logger.info("Delete service history request: {}", id);
        // Thiết kế: Tầng Service sẽ chịu trách nhiệm xử lý các ràng buộc trước khi xóa.
        // Nếu không tìm thấy, ném `ResourceNotFoundException` -> 404 Not Found.
        serviceHistoryService.deleteServiceHistory(id);
        logger.info("Service history deleted: {}", id);
        // Thiết kế: Trả về 204 No Content là một best practice cho các thao tác DELETE thành công,
        // báo cho client biết rằng yêu cầu đã được thực hiện và không có nội dung nào để trả về.
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy danh sách lịch sử bảo dưỡng của một chiếc xe cụ thể.
     *
     * @param vehicleId ID của xe.
     * @param page      Số trang.
     * @param size      Số lượng phần tử trên trang.
     * @param sortBy    Trường để sắp xếp (mặc định: serviceDate).
     * @param sortDir   Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các lịch sử bảo dưỡng.
     */
    @GetMapping("/by-vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('EVM_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getServiceHistoriesByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        logger.info("Get service histories by vehicleId: {}, page={}, size={}, sortBy={}, sortDir={}", vehicleId, page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getServiceHistoriesByVehicleId(
            vehicleId, pageable);
        logger.info("Get service histories by vehicleId success, totalElements={}", historiesPage.getTotalElements());
        return ResponseEntity.ok(historiesPage);
    }

    /**
     * Lấy danh sách các lịch sử bảo dưỡng có liên quan đến một loại linh kiện cụ thể.
     *
     * @param partId ID của loại linh kiện.
     * @param page   Số trang.
     * @param size   Số lượng phần tử trên trang.
     * @param sortBy  Trường để sắp xếp (mặc định: serviceDate).
     * @param sortDir Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các lịch sử bảo dưỡng.
     */
    @GetMapping("/by-part/{partId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getServiceHistoriesByPart(
            @PathVariable String partId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        logger.info("Get service histories by partId: {}, page={}, size={}, sortBy={}, sortDir={}", partId, page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getServiceHistoriesByPartId(
            partId, pageable);
        logger.info("Get service histories by partId success, totalElements={}", historiesPage.getTotalElements());
        return ResponseEntity.ok(historiesPage);
    }

    /**
     * Cho phép khách hàng xem danh sách lịch sử bảo dưỡng của tất cả các xe họ sở hữu.
     *
     * @param page Số trang.
     * @param size Số lượng phần tử trên trang.
     * @param sortBy  Trường để sắp xếp (mặc định: serviceDate).
     * @param sortDir Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các lịch sử bảo dưỡng của người dùng.
     */
    @GetMapping("/my-services")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getMyServiceHistories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng
        logger.info("Get my service histories request: page={}, size={}, sortBy={}, sortDir={}", page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Thiết kế bảo mật: Luôn lấy định danh của người dùng từ một nguồn đáng tin cậy là Security Context,
        // không bao giờ tin tưởng vào ID do client gửi lên. `SecurityUtil` là một lớp tiện ích
        // giúp truy cập Security Context một cách an toàn và tập trung.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to view your service histories"));
        PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getServiceHistoriesByCurrentUser(
            username, pageable);
        logger.info("Get my service histories success, totalElements={}", historiesPage.getTotalElements());
        return ResponseEntity.ok(historiesPage);
    }

    /**
     * Tìm kiếm các lịch sử bảo dưỡng trong một khoảng thời gian nhất định.
     *
     * @param startDate Ngày bắt đầu (định dạng yyyy-MM-dd).
     * @param endDate   Ngày kết thúc (định dạng yyyy-MM-dd).
     * @param page      Số trang.
     * @param size      Số lượng phần tử trên trang.
     * @param sortBy    Trường để sắp xếp (mặc định: serviceDate).
     * @param sortDir   Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các lịch sử bảo dưỡng phù hợp.
     */
    @GetMapping("/by-date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getServiceHistoriesByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        logger.info("Get service histories by date range: startDate={}, endDate={}, page={}, size={}, sortBy={}, sortDir={}", startDate, endDate, page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Thiết kế: Việc xác thực và chuyển đổi định dạng ngày tháng được ủy thác cho tầng Service.
        // Nếu định dạng ngày tháng không hợp lệ, service sẽ ném `IllegalArgumentException`,
        // và `GlobalExceptionHandler` sẽ bắt lỗi này để trả về HTTP status 400 Bad Request.
        PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getServiceHistoriesByDateRange(
            startDate, endDate, pageable);
        logger.info("Get service histories by date range success, totalElements={}", historiesPage.getTotalElements());
        return ResponseEntity.ok(historiesPage);
    }
}
