package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

/**
 * Service xử lý business logic cho InstalledPart
 * - Ghi nhận part được lắp vào xe cụ thể
 * - Tracking installation date và warranty expiration
 * - Tìm part sắp hết bảo hành để notification
 */
public interface InstalledPartService {
    // Lấy thông tin installed part theo ID
    InstalledPartResponseDTO getInstalledPartById(Long id);

    // Ghi nhận lắp đặt part mới vào xe (Dealer Staff)
    InstalledPartResponseDTO createInstalledPart(InstalledPartRequestDTO requestDTO);

    // Cập nhật thông tin installed part
    InstalledPartResponseDTO updateInstalledPart(Long id, InstalledPartRequestDTO requestDTO);

    /**
     * Xóa một bản ghi linh kiện đã lắp đặt.
     * REFACTOR: Thay đổi kiểu trả về từ boolean sang void.
     * Phương thức sẽ ném ra ResourceNotFoundException nếu không tìm thấy ID.
     */
    void deleteInstalledPart(Long id);

    // Lấy danh sách tất cả installed parts
    PagedResponse<InstalledPartResponseDTO> getAllInstalledParts(Pageable pageable);

    // Lấy tất cả part đã lắp trên xe cụ thể
    PagedResponse<InstalledPartResponseDTO> getInstalledPartsByVehicle(Long vehicleId, Pageable pageable);

    // Lấy tất cả lần lắp đặt của part cụ thể (tracking)
    PagedResponse<InstalledPartResponseDTO> getInstalledPartsByPart(Long partId, Pageable pageable);

    // Tìm part sắp hết bảo hành (notification cho customer)
    PagedResponse<InstalledPartResponseDTO> getInstalledPartsWithExpiringWarranty(int daysFromNow, Pageable pageable);
}
