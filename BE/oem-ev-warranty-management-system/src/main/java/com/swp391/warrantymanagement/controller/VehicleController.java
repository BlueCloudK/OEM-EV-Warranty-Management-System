package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.service.VehicleService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller cho các API liên quan đến Xe (Vehicle).
 * <p>
 * Controller này xử lý các hoạt động CRUD cho xe và các nghiệp vụ liên quan.
 * <p>
 * <b>Quy tắc nghiệp vụ:</b>
 * <ul>
 *     <li>CUSTOMER chỉ có thể quản lý các xe của chính mình.</li>
 *     <li>ADMIN/STAFF có thể quản lý tất cả các xe trong hệ thống.</li>
 * </ul>
 */
@RestController
@RequestMapping("api/vehicles")
@CrossOrigin
public class VehicleController {
    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);
    @Autowired
    private VehicleService vehicleService;

    /**
     * Lấy danh sách tất cả các xe trong hệ thống với phân trang, tìm kiếm và sắp xếp.
     * <p>
     * Endpoint này chỉ dành cho các vai trò quản trị và nhân viên.
     *
     * @param page    Số trang (mặc định là 0).
     * @param size    Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @param search  Chuỗi tìm kiếm (có thể là VIN, model, brand, tên khách hàng).
     * @param sortBy  Trường để sắp xếp (mặc định: vehicleId).
     * @param sortDir Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các xe.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "vehicleId") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        logger.info("Get all vehicles request: page={}, size={}, search={}, sortBy={}, sortDir={}", page, size, search, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getAllVehiclesPage(pageable, search);
        logger.info("Get all vehicles success, totalElements={}", vehiclesPage.getTotalElements());
        return ResponseEntity.ok(vehiclesPage);
    }

    /**
     * Lấy thông tin chi tiết của một xe dựa trên ID.
     * <p>
     * CUSTOMER chỉ có thể truy cập xe của chính mình (logic được xử lý ở tầng Service).
     *
     * @param id ID của xe cần lấy thông tin.
     * @return {@link ResponseEntity} chứa {@link VehicleResponseDTO} nếu tìm thấy, ngược lại trả về 404 Not Found.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('CUSTOMER')")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable Long id) {
        logger.info("Get vehicle by id: {}", id);
        VehicleResponseDTO vehicle = vehicleService.getVehicleById(id);
        if (vehicle != null) {
            logger.info("Vehicle found: {}", id);
            return ResponseEntity.ok(vehicle);
        }
        logger.warn("Vehicle not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    /**
     * Tạo một xe mới trong hệ thống.
     * <p>
     * Chỉ dành cho các vai trò quản trị và nhân viên.
     *
     * @param requestDTO DTO chứa thông tin xe mới.
     * @return {@link ResponseEntity} chứa thông tin xe đã được tạo với HTTP status 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<VehicleResponseDTO> createVehicle(@Valid @RequestBody VehicleRequestDTO requestDTO) {
        logger.info("Create vehicle request: {}", requestDTO);
        try {
            VehicleResponseDTO createdVehicle = vehicleService.createVehicle(requestDTO);
            logger.info("Vehicle created: {}", createdVehicle.getVehicleId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (RuntimeException e) {
            logger.error("Create vehicle failed - Error: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Cập nhật thông tin của một xe đã tồn tại.
     *
     * @param id         ID của xe cần cập nhật.
     * @param requestDTO DTO chứa thông tin cập nhật.
     * @return {@link ResponseEntity} chứa thông tin xe đã được cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequestDTO requestDTO) {

        logger.info("Update vehicle request: id={}, data={}", id, requestDTO);
        VehicleResponseDTO updatedVehicle = vehicleService.updateVehicle(id, requestDTO);
        if (updatedVehicle != null) {
            logger.info("Vehicle updated: {}", id);
            return ResponseEntity.ok(updatedVehicle);
        }
        logger.warn("Vehicle not found for update: {}", id);
        return ResponseEntity.notFound().build();
    }

    /**
     * Xóa một xe khỏi hệ thống.
     *
     * @param id ID của xe cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        logger.info("Delete vehicle request: {}", id);
        vehicleService.deleteVehicle(id);
        logger.info("Vehicle deleted: {}", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy danh sách các xe thuộc về một khách hàng cụ thể.
     * <p>
     * Chỉ dành cho các vai trò quản trị và nhân viên.
     *
     * @param customerId ID của khách hàng.
     * @param page       Số trang.
     * @param size       Số lượng phần tử trên trang.
     * @param sortBy     Trường để sắp xếp (mặc định: purchaseDate).
     * @param sortDir    Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các xe của khách hàng đó.
     */
    @GetMapping("/by-customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getVehiclesByCustomer(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "purchaseDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        logger.info("Get vehicles by customer: {}, page={}, size={}, sortBy={}, sortDir={}", customerId, page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getVehiclesByCustomerId(customerId, pageable);
        logger.info("Get vehicles by customer success, totalElements={}", vehiclesPage.getTotalElements());
        return ResponseEntity.ok(vehiclesPage);
    }

    /**
     * Cho phép khách hàng (CUSTOMER) tự lấy danh sách các xe của chính mình.
     * <p>
     * Hệ thống sẽ tự động lấy thông tin người dùng đang đăng nhập từ Security Context.
     *
     * @param page    Số trang.
     * @param size    Số lượng phần tử trên trang.
     * @param sortBy  Trường để sắp xếp (mặc định: purchaseDate).
     * @param sortDir Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC).
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các xe của người dùng hiện tại.
     */
    @GetMapping("/my-vehicles")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getMyVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "purchaseDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        logger.info("Get my vehicles request: page={}, size={}, sortBy={}, sortDir={}", page, size, sortBy, sortDir);
        try {
            // Lấy username từ SecurityContext (đã được xác thực bởi JWT filter)
            String username = SecurityUtil.getCurrentUsername()
                    .orElseThrow(() -> new RuntimeException("User not authenticated"));
            logger.info("Current authenticated user: {}", username);

            Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getVehiclesByCurrentUser(username, pageable);
            logger.info("Get my vehicles success, totalElements={}", vehiclesPage.getTotalElements());
            return ResponseEntity.ok(vehiclesPage);
        } catch (RuntimeException e) {
            logger.error("Get my vehicles failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Tìm kiếm một xe dựa trên số VIN (Vehicle Identification Number).
     *
     * @param vin Số VIN của xe.
     * @return {@link ResponseEntity} chứa {@link VehicleResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/by-vin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<VehicleResponseDTO> getVehicleByVin(@RequestParam String vin) {
        logger.info("Get vehicle by VIN: {}", vin);
        VehicleResponseDTO vehicle = vehicleService.getVehicleByVin(vin);
        if (vehicle != null) {
            logger.info("Vehicle found by VIN: {}", vin);
            return ResponseEntity.ok(vehicle);
        }
        logger.warn("Vehicle not found by VIN: {}", vin);
        return ResponseEntity.notFound().build();
    }

    /**
     * Tìm kiếm xe dựa trên model hoặc brand.
     *
     * @param model Model của xe (không bắt buộc).
     * @param brand Hãng sản xuất của xe (không bắt buộc).
     * @param page  Số trang.
     * @param size  Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các xe phù hợp.
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> searchVehicles(
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Search vehicles request: model={}, brand={}, page={}, size={}", model, brand, page, size);
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.searchVehicles(
            model, brand, PageRequest.of(page, size));
        logger.info("Search vehicles success, totalElements={}", vehiclesPage.getTotalElements());
        return ResponseEntity.ok(vehiclesPage);
    }

    /**
     * Lấy danh sách các xe sắp hết hạn bảo hành.
     * <p>
     * Đây là một tính năng nghiệp vụ (business intelligence) cho phép nhân viên chủ động liên hệ khách hàng.
     *
     * @param daysFromNow Số ngày tính từ hiện tại (ví dụ: 30 ngày tới).
     * @param page        Số trang.
     * @param size        Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một {@link PagedResponse} các xe sắp hết hạn bảo hành.
     */
    @GetMapping("/warranty-expiring")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getVehiclesWithExpiringWarranty(
            @RequestParam(defaultValue = "30") int daysFromNow,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Get vehicles with expiring warranty: days={}, page={}, size={}", daysFromNow, page, size);
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getVehiclesWithExpiringWarranty(
            daysFromNow, PageRequest.of(page, size));
        logger.info("Get expiring warranty vehicles success, totalElements={}", vehiclesPage.getTotalElements());
        return ResponseEntity.ok(vehiclesPage);
    }
}
