package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.WorkLogRequestDTO;
import com.swp391.warrantymanagement.dto.response.WorkLogResponseDTO;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.util.SecurityUtil;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.WorkLogService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.RequiredArgsConstructor;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Nhật ký Công việc (WorkLog).
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc nhận và xác thực request,
 *     sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp (ví dụ: xác thực quyền sở hữu, kiểm tra thời gian hợp lệ)
 *     và việc truy cập dữ liệu đều được ủy thác cho {@link com.swp391.warrantymanagement.service.WorkLogService}.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, dữ liệu không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler}.</li>
 * </ul>
 */
@RestController
@RequestMapping("api/work-logs")
@CrossOrigin
@RequiredArgsConstructor
public class WorkLogController {
    private static final Logger logger = LoggerFactory.getLogger(WorkLogController.class);

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
    private final WorkLogService workLogService;

    /**
     * Lấy danh sách tất cả các nhật ký công việc, hỗ trợ phân trang.
     * Endpoint này dành cho các vai trò quản trị để có cái nhìn tổng quan.
     *
     * @param page Số trang (mặc định là 0).
     * @param size Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các nhật ký công việc.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<WorkLogResponseDTO>> getAllWorkLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get all work logs request: page={}, size={}", page, size);
        PagedResponse<WorkLogResponseDTO> workLogsPage =
            workLogService.getAllWorkLogs(PageRequest.of(page, size));
        logger.info("Get all work logs success, totalElements={}", workLogsPage.getTotalElements());
        return ResponseEntity.ok(workLogsPage);
    }

    /**
     * Lấy thông tin chi tiết của một nhật ký công việc dựa trên ID.
     *
     * @param id ID của nhật ký công việc.
     * @return {@link ResponseEntity} chứa {@link WorkLogResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<WorkLogResponseDTO> getWorkLogById(@PathVariable Long id) {
        logger.info("Get work log by id: {}", id);
        // Thiết kế "Happy Path": Controller không cần kiểm tra null. Tầng Service sẽ ném `ResourceNotFoundException` nếu không tìm thấy.
        WorkLogResponseDTO workLog = workLogService.getWorkLogById(id);
        logger.info("Work log found: {}", id);
        return ResponseEntity.ok(workLog);
    }

    /**
     * Tạo một nhật ký công việc mới.
     *
     * @param requestDTO DTO chứa thông tin về nhật ký công việc.
     * @return {@link ResponseEntity} chứa thông tin nhật ký đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_TECHNICIAN')")
    public ResponseEntity<WorkLogResponseDTO> createWorkLog(
            @Valid @RequestBody WorkLogRequestDTO requestDTO,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng
        logger.info("Create work log request: {}", requestDTO);
        // Thiết kế bảo mật: Luôn lấy định danh của người dùng từ một nguồn đáng tin cậy là Security Context.
        // `SecurityUtil` là một lớp tiện ích giúp truy cập Security Context một cách an toàn và tập trung.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to create a work log"));
        WorkLogResponseDTO responseDTO = workLogService.createWorkLog(requestDTO, username);
        logger.info("Work log created: {}", responseDTO.getWorkLogId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    /**
     * Cập nhật một nhật ký công việc đã có.
     * Thường được sử dụng để ghi lại thời gian kết thúc công việc.
     *
     * @param id         ID của nhật ký công việc cần cập nhật.
     * @param requestDTO DTO chứa thông tin cập nhật.
     * @return {@link ResponseEntity} chứa thông tin nhật ký đã được cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_TECHNICIAN')")
    public ResponseEntity<WorkLogResponseDTO> updateWorkLog(
            @PathVariable Long id,
            @Valid @RequestBody WorkLogRequestDTO requestDTO,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // Giữ lại để tương thích, nhưng không sử dụng
        logger.info("Update work log request: id={}, data={}", id, requestDTO);
        // Thiết kế bảo mật: Lấy username từ Security Context để xác thực quyền sở hữu.
        // Tầng Service sẽ sử dụng username này để đảm bảo người dùng chỉ có thể sửa nhật ký công việc của chính họ.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to update a work log"));
        WorkLogResponseDTO updatedWorkLog = workLogService.updateWorkLog(id, requestDTO, username);
        logger.info("Work log updated: {}", id);
        return ResponseEntity.ok(updatedWorkLog);
    }

    /**
     * Xóa một nhật ký công việc. Endpoint này chỉ dành cho ADMIN.
     *
     * @param id ID của nhật ký công việc cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWorkLog(@PathVariable Long id) {
        logger.info("Delete work log request: {}", id);
        // Thiết kế: Tầng Service sẽ ném `ResourceNotFoundException` nếu không tìm thấy.
        // Trả về 204 No Content là một best practice cho các thao tác DELETE thành công.
        workLogService.deleteWorkLog(id);
        logger.info("Work log deleted: {}", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy danh sách các nhật ký công việc liên quan đến một yêu cầu bảo hành cụ thể.
     * @param claimId ID của yêu cầu bảo hành.
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các nhật ký công việc.
     */
    @GetMapping("/by-claim/{claimId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<WorkLogResponseDTO>> getWorkLogsByWarrantyClaim(
            @PathVariable Long claimId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get work logs by claimId: {}, page={}, size={}", claimId, page, size);
        PagedResponse<WorkLogResponseDTO> workLogsPage =
            workLogService.getWorkLogsByWarrantyClaim(claimId, PageRequest.of(page, size));
        logger.info("Get work logs by claimId success, totalElements={}", workLogsPage.getTotalElements());
        return ResponseEntity.ok(workLogsPage);
    }

    /**
     * Lấy danh sách các nhật ký công việc của một người dùng cụ thể.
     * Endpoint này dành cho các vai trò quản trị để xem công việc của nhân viên.
     * @param userId ID của người dùng.
     * @param page   Số trang.
     * @param size   Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các nhật ký công việc.
     */
    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<WorkLogResponseDTO>> getWorkLogsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get work logs by userId: {}, page={}, size={}", userId, page, size);
        PagedResponse<WorkLogResponseDTO> workLogsPage =
            workLogService.getWorkLogsByUser(userId, PageRequest.of(page, size));
        logger.info("Get work logs by userId success, totalElements={}", workLogsPage.getTotalElements());
        return ResponseEntity.ok(workLogsPage);
    }

    /**
     * Cho phép người dùng xem danh sách các nhật ký công việc của chính mình.
     *
     * @param page Số trang.
     * @param size Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các nhật ký công việc của người dùng.
     */
    @GetMapping("/my-work-logs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PagedResponse<WorkLogResponseDTO>> getMyWorkLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Thiết kế bảo mật: Endpoint này được tạo ra để người dùng có thể tự xem công việc của mình một cách an toàn,
        // bằng cách lấy định danh từ Security Context thay vì từ URL.
        String username = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required to view your work logs"));
        logger.info("Get my work logs request for user {}: page={}, size={}", username, page, size);
        PagedResponse<WorkLogResponseDTO> workLogsPage = workLogService.getWorkLogsByUsername(username, PageRequest.of(page, size));
        return ResponseEntity.ok(workLogsPage);
    }
}
