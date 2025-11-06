package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.PartService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller chịu trách nhiệm xử lý các yêu cầu HTTP liên quan đến tài nguyên Linh kiện (Part).
 * <p>
 * <strong>Thiết kế "Lean Controller" (Controller Gọn Gàng):</strong>
 * <ul>
 *     <li>Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc nhận và xác thực request,
 *     sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li>Toàn bộ logic nghiệp vụ phức tạp (ví dụ: kiểm tra trùng lặp `partNumber`, logic tìm kiếm)
 *     và việc truy cập dữ liệu đều được ủy thác cho {@link com.swp391.warrantymanagement.service.PartService}.</li>
 *     <li>Việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, dữ liệu không hợp lệ) được tự động xử lý bởi {@code GlobalExceptionHandler}.</li>
 * </ul>
 */
@RestController
@RequestMapping("api/parts")
@CrossOrigin
@RequiredArgsConstructor // REFACTOR: Sử dụng Lombok để tạo constructor, thay thế cho constructor thủ công.
public class PartController {
    private static final Logger logger = LoggerFactory.getLogger(PartController.class);

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
    private final PartService partService;

    /**
     * Lấy danh sách tất cả các linh kiện, hỗ trợ phân trang và tìm kiếm.
     * Endpoint này dành cho các vai trò quản trị và nhân viên để xem danh mục linh kiện.
     *
     * @param page   Số trang (mặc định là 0).
     * @param size   Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @param search Từ khóa tìm kiếm (tên hoặc nhà sản xuất của linh kiện).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các linh kiện.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<PartResponseDTO>> getAllParts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        logger.info("Get all parts request: page={}, size={}, search={}", page, size, search);
        // Thiết kế: Controller chỉ chịu trách nhiệm nhận các tham số tìm kiếm và phân trang,
        // sau đó ủy thác hoàn toàn cho tầng Service để thực hiện logic truy vấn phức tạp.
        // Kết quả (kể cả khi không tìm thấy) sẽ được đóng gói trong PagedResponse.
        PagedResponse<PartResponseDTO> partsPage = partService.getAllPartsPage(
                PageRequest.of(page, size), search);
        logger.info("Get all parts success, totalElements={}", partsPage.getTotalElements());
        return ResponseEntity.ok(partsPage);
    }

    /**
     * Lấy thông tin chi tiết của một linh kiện dựa trên ID.
     *
     * @param id ID của linh kiện.
     * @return {@link ResponseEntity} chứa {@link PartResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartResponseDTO> getPartById(@PathVariable Long id) {
        logger.info("Get part by id: {}", id);
        // REFACTOR: Xóa bỏ kiểm tra null.
        // Nếu không tìm thấy, service sẽ ném ra ResourceNotFoundException
        // và GlobalExceptionHandler sẽ tự động trả về lỗi 404.
        PartResponseDTO part = partService.getPartById(id);
        logger.info("Part found: {}", id);
        return ResponseEntity.ok(part);
    }

    /**
     * Tạo một linh kiện mới trong danh mục.
     * Endpoint này chủ yếu dành cho nhân viên nhà sản xuất (EVM_STAFF).
     *
     * @param requestDTO DTO chứa thông tin của linh kiện mới.
     * @return {@link ResponseEntity} chứa thông tin linh kiện đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartResponseDTO> createPart(@Valid @RequestBody PartRequestDTO requestDTO) {
        logger.info("Create part request: {}", requestDTO);
        // REFACTOR: Xóa bỏ try-catch. Các lỗi (ví dụ: part number đã tồn tại)
        // sẽ được service xử lý và ném ra exception cụ thể, sau đó GlobalExceptionHandler sẽ bắt.
        PartResponseDTO responseDTO = partService.createPart(requestDTO);
        logger.info("Part created: {}", responseDTO.getPartId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    /**
     * Cập nhật thông tin của một linh kiện.
     *
     * @param id         ID của linh kiện cần cập nhật.
     * @param requestDTO DTO chứa thông tin cập nhật.
     * @return {@link ResponseEntity} chứa thông tin linh kiện đã được cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartResponseDTO> updatePart(@PathVariable Long id,
                                                      @Valid @RequestBody PartRequestDTO requestDTO) {
        logger.info("Update part request: id={}, data={}", id, requestDTO);
        // REFACTOR: Xóa bỏ try-catch và kiểm tra null.
        PartResponseDTO updatedPart = partService.updatePart(id, requestDTO);
        logger.info("Part updated: {}", id);
        return ResponseEntity.ok(updatedPart);
    }

    /**
     * Xóa một linh kiện khỏi danh mục.
     * Endpoint này chỉ dành cho ADMIN để đảm bảo an toàn dữ liệu.
     *
     * @param id ID của linh kiện cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        logger.info("Delete part request: {}", id);
        // Thiết kế: Tầng Service sẽ chịu trách nhiệm xử lý các ràng buộc trước khi xóa.
        // 1. Nếu không tìm thấy, ném `ResourceNotFoundException` -> 404 Not Found.
        // 2. Nếu linh kiện đang được sử dụng trong một `InstalledPart`,
        //    ném `ResourceInUseException` -> 409 Conflict.
        // Controller không cần biết về các logic này, chỉ cần gọi và xử lý trường hợp thành công.
        partService.deletePart(id);
        logger.info("Part deleted: {}", id);
        // Thiết kế: Trả về 204 No Content là một best practice cho các thao tác DELETE thành công,
        // báo cho client biết rằng yêu cầu đã được thực hiện và không có nội dung nào để trả về.
        return ResponseEntity.noContent().build();
    }

    /**
     * Tìm kiếm các linh kiện theo nhà sản xuất.
     *
     * @param manufacturer Tên nhà sản xuất.
     * @param page         Số trang.
     * @param size         Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các linh kiện phù hợp.
     */
    @GetMapping("/by-manufacturer")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<PartResponseDTO>> getPartsByManufacturer(
            @RequestParam String manufacturer,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get parts by manufacturer: {}, page={}, size={}", manufacturer, page, size);
        PagedResponse<PartResponseDTO> partsPage = partService.getPartsByManufacturer(
                manufacturer, PageRequest.of(page, size));
        logger.info("Get parts by manufacturer success, totalElements={}", partsPage.getTotalElements());
        return ResponseEntity.ok(partsPage);
    }
}
