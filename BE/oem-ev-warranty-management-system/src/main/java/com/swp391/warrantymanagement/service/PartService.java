package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

/**
 * Service xử lý business logic cho Part (danh mục linh kiện).
 * - CRUD: Tạo, đọc, cập nhật, xóa part
 * - Search: Tìm theo tên, nhà sản xuất
 * - Chỉ EVM_STAFF được quản lý catalog
 */
public interface PartService {
    /**
     * Lấy thông tin part theo ID.
     * @param id ID của part cần lấy
     * @return PartResponseDTO chứa thông tin part
     * @throws com.swp391.warrantymanagement.exception.ResourceNotFoundException nếu không tìm thấy part
     */
    PartResponseDTO getPartById(Long id);

    /**
     * Tạo part mới trong catalog.
     * @param requestDTO DTO chứa thông tin part mới
     * @return PartResponseDTO của part đã tạo
     * @throws com.swp391.warrantymanagement.exception.DuplicateResourceException nếu part number đã tồn tại
     */
    PartResponseDTO createPart(PartRequestDTO requestDTO);

    /**
     * Cập nhật thông tin part.
     * @param id ID của part cần cập nhật
     * @param requestDTO DTO chứa thông tin cập nhật
     * @return PartResponseDTO của part đã cập nhật
     * @throws com.swp391.warrantymanagement.exception.ResourceNotFoundException nếu không tìm thấy part
     */
    PartResponseDTO updatePart(Long id, PartRequestDTO requestDTO);

    /**
     * Xóa part khỏi catalog.
     * @param id ID của part cần xóa
     * @throws com.swp391.warrantymanagement.exception.ResourceNotFoundException nếu không tìm thấy part
     * @throws com.swp391.warrantymanagement.exception.ResourceInUseException nếu part đang được sử dụng trong claim
     */
    void deletePart(Long id);

    /**
     * Lấy danh sách part với phân trang và tìm kiếm.
     * @param pageable Thông tin phân trang (page, size, sort)
     * @param search Từ khóa tìm kiếm (tìm trong name hoặc part number)
     * @return PagedResponse chứa danh sách part
     */
    PagedResponse<PartResponseDTO> getAllPartsPage(Pageable pageable, String search);

    /**
     * Tìm part theo nhà sản xuất.
     * @param manufacturer Tên nhà sản xuất
     * @param pageable Thông tin phân trang
     * @return PagedResponse chứa danh sách part của nhà sản xuất
     */
    PagedResponse<PartResponseDTO> getPartsByManufacturer(String manufacturer, Pageable pageable);
}
