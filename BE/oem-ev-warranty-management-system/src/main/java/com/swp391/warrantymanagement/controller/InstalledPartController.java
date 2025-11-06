package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.InstalledPartService;
import jakarta.validation.Valid;import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Linh kiện đã lắp đặt (InstalledPart).
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc nhận và xác thực request,
 *     sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp (ví dụ: kiểm tra ngày tháng, xác thực sự tồn tại của Part và Vehicle)
 *     và việc truy cập dữ liệu đều được ủy thác cho {@link com.swp391.warrantymanagement.service.InstalledPartService}.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, dữ liệu không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler}.</li>
 * </ul>
 */
@RestController
@RequestMapping("api/installed-parts")
@CrossOrigin
@RequiredArgsConstructor // REFACTOR: Sử dụng Lombok để tạo constructor, thay thế cho @Autowired
public class InstalledPartController {
    private static final Logger logger = LoggerFactory.getLogger(InstalledPartController.class);

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
    private final InstalledPartService installedPartService;

    /**
     * Lấy danh sách tất cả các linh kiện đã được lắp đặt, hỗ trợ phân trang.
     * @param page Số trang (mặc định là 0).
     * @param size Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các linh kiện đã lắp đặt.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<InstalledPartResponseDTO>> getAllInstalledParts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get all installed parts request: page={}, size={}", page, size);
        PagedResponse<InstalledPartResponseDTO> installedPartsPage =
            installedPartService.getAllInstalledParts(PageRequest.of(page, size));
        logger.info("Get all installed parts success, totalElements={}", installedPartsPage.getTotalElements());
        return ResponseEntity.ok(installedPartsPage);
    }

    /**
     * Lấy thông tin chi tiết của một linh kiện đã lắp đặt dựa trên ID.
     * @param id ID của linh kiện đã lắp đặt.
     * @return {@link ResponseEntity} chứa {@link InstalledPartResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('CUSTOMER')")
    public ResponseEntity<InstalledPartResponseDTO> getInstalledPartById(@PathVariable Long id) {
        logger.info("Get installed part by id: {}", id);
        // Thiết kế: Controller không cần kiểm tra kết quả trả về có null hay không.
        // Tầng Service được thiết kế để ném ra `ResourceNotFoundException` nếu không tìm thấy.
        // `GlobalExceptionHandler` sẽ bắt exception này và tự động trả về HTTP status 404 Not Found.
        InstalledPartResponseDTO installedPart = installedPartService.getInstalledPartById(id);
        logger.info("Installed part found: {}", id);
        return ResponseEntity.ok(installedPart);
    }

    /**
     * Tạo một bản ghi mới về việc lắp đặt linh kiện vào xe.
     * Thường được thực hiện bởi nhân viên tại trung tâm bảo hành.
     * @param requestDTO DTO chứa thông tin về Part, Vehicle và ngày lắp đặt.
     * @return {@link ResponseEntity} chứa thông tin bản ghi đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF')")
    public ResponseEntity<InstalledPartResponseDTO> createInstalledPart(
            @Valid @RequestBody InstalledPartRequestDTO requestDTO) {
        logger.info("Create installed part request: {}", requestDTO);
        // Thiết kế: Controller không cần khối try-catch.
        // Nếu có lỗi nghiệp vụ (ví dụ: Part ID hoặc Vehicle ID không tồn tại, ngày tháng không hợp lệ),
        // tầng Service sẽ ném ra một exception cụ thể (ví dụ: ResourceNotFoundException, IllegalArgumentException).
        // GlobalExceptionHandler sẽ bắt các exception này và trả về response lỗi HTTP tương ứng (404, 400,...).
        InstalledPartResponseDTO responseDTO = installedPartService.createInstalledPart(requestDTO);
        logger.info("Installed part created: {}", responseDTO.getInstalledPartId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    /**
     * Cập nhật thông tin của một bản ghi linh kiện đã lắp đặt.
     * @param id ID của bản ghi cần cập nhật.
     * @param requestDTO DTO chứa thông tin cập nhật.
     * @return {@link ResponseEntity} chứa thông tin đã được cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF')")
    public ResponseEntity<InstalledPartResponseDTO> updateInstalledPart(
            @PathVariable Long id,
            @Valid @RequestBody InstalledPartRequestDTO requestDTO) {
        logger.info("Update installed part request: id={}, data={}", id, requestDTO);
        // Thiết kế: Tương tự như các endpoint khác, Controller không xử lý logic lỗi.
        // Nếu ID không tồn tại, service sẽ ném ResourceNotFoundException -> 404 Not Found.
        InstalledPartResponseDTO updatedInstalledPart =
            installedPartService.updateInstalledPart(id, requestDTO);
        logger.info("Installed part updated: {}", id);
        return ResponseEntity.ok(updatedInstalledPart);
    }

    /**
     * Xóa một bản ghi linh kiện đã lắp đặt.
     * @param id ID của bản ghi cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInstalledPart(@PathVariable Long id) {
        logger.info("Delete installed part request: {}", id);
        // Thiết kế: Tầng Service sẽ chịu trách nhiệm xử lý các ràng buộc trước khi xóa.
        // 1. Nếu không tìm thấy, ném `ResourceNotFoundException` -> 404 Not Found.
        // 2. Nếu linh kiện này đang được liên kết với một `WarrantyClaim` đang hoạt động,
        //    ném `ResourceInUseException` -> 409 Conflict.
        installedPartService.deleteInstalledPart(id);
        logger.info("Installed part deleted: {}", id);
        // Thiết kế: Trả về 204 No Content là một best practice cho các thao tác DELETE thành công,
        // báo cho client biết rằng yêu cầu đã được thực hiện và không có nội dung nào để trả về.
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy danh sách các linh kiện đã được lắp đặt trên một chiếc xe cụ thể.
     * @param vehicleId ID của xe.
     * @param page Số trang.
     * @param size Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các linh kiện đã lắp đặt.
     */
    @GetMapping("/by-vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<InstalledPartResponseDTO>> getInstalledPartsByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get installed parts by vehicleId: {}, page={}, size={}", vehicleId, page, size);
        PagedResponse<InstalledPartResponseDTO> installedPartsPage =
            installedPartService.getInstalledPartsByVehicle(vehicleId, PageRequest.of(page, size));
        logger.info("Get installed parts by vehicleId success, totalElements={}", installedPartsPage.getTotalElements());
        return ResponseEntity.ok(installedPartsPage);
    }

    /**
     * Lấy lịch sử lắp đặt của một loại linh kiện cụ thể trên tất cả các xe.
     * @param partId ID của loại linh kiện (Part).
     * @param page Số trang.
     * @param size Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các lần lắp đặt.
     */
    @GetMapping("/by-part/{partId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<InstalledPartResponseDTO>> getInstalledPartsByPart(
            @PathVariable Long partId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get installed parts by partId: {}, page={}, size={}", partId, page, size);
        PagedResponse<InstalledPartResponseDTO> installedPartsPage =
            installedPartService.getInstalledPartsByPart(partId, PageRequest.of(page, size));
        logger.info("Get installed parts by partId success, totalElements={}", installedPartsPage.getTotalElements());
        return ResponseEntity.ok(installedPartsPage);
    }

    /**
     * Lấy danh sách các linh kiện đã lắp đặt sắp hết hạn bảo hành.
     * @param daysFromNow Khoảng thời gian (tính bằng ngày) để kiểm tra (ví dụ: sắp hết hạn trong 30 ngày tới).
     * @param page Số trang.
     * @param size Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các linh kiện sắp hết hạn.
     */
    @GetMapping("/warranty-expiring")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<InstalledPartResponseDTO>> getInstalledPartsWithExpiringWarranty(
            @RequestParam(defaultValue = "30") int daysFromNow,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get installed parts with expiring warranty: days={}, page={}, size={}",
            daysFromNow, page, size);
        PagedResponse<InstalledPartResponseDTO> installedPartsPage =
            installedPartService.getInstalledPartsWithExpiringWarranty(daysFromNow, PageRequest.of(page, size));
        logger.info("Get installed parts with expiring warranty success, totalElements={}", installedPartsPage.getTotalElements());
        return ResponseEntity.ok(installedPartsPage);
    }
}
