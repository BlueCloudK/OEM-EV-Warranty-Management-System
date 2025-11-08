package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.response.WarrantyValidationResponseDTO;

/**
 * Service xử lý nghiệp vụ kiểm tra tính hợp lệ của bảo hành.
 * <p>
 * <strong>Mục đích:</strong> Cung cấp business rules để xác định:
 * <ul>
 *     <li>Bảo hành còn hiệu lực hay đã hết hạn</li>
 *     <li>Nguyên nhân hết hạn (theo thời gian, số km, hoặc cả hai)</li>
 *     <li>Có thể bảo hành tính phí hay không</li>
 *     <li>Ước tính phí bảo hành (nếu áp dụng)</li>
 * </ul>
 * <p>
 * <strong>Business rules:</strong>
 * <ul>
 *     <li>Bảo hành hợp lệ khi: Chưa quá {@code warrantyEndDate} VÀ chưa vượt giới hạn km</li>
 *     <li>Bảo hành theo linh kiện: Kiểm tra thêm {@code installedPart.warrantyExpirationDate}</li>
 *     <li>Bảo hành tính phí: Áp dụng khi hết hạn nhưng trong thời gian grace period</li>
 * </ul>
 */
public interface WarrantyValidationService {

    /**
     * Kiểm tra tính hợp lệ của bảo hành cho một xe.
     * <p>
     * <strong>Business logic:</strong>
     * <ul>
     *     <li>Kiểm tra {@code vehicle.warrantyEndDate} so với ngày hiện tại</li>
     *     <li>Kiểm tra {@code vehicle.mileage} so với giới hạn (nếu có)</li>
     *     <li>Trả về trạng thái: VALID, EXPIRED_DATE, EXPIRED_MILEAGE, EXPIRED_BOTH</li>
     * </ul>
     *
     * @param vehicleId ID của xe cần kiểm tra
     * @return WarrantyValidationResponseDTO chứa đầy đủ thông tin về bảo hành
     * @throws com.swp391.warrantymanagement.exception.ResourceNotFoundException nếu không tìm thấy xe
     */
    WarrantyValidationResponseDTO validateVehicleWarranty(Long vehicleId);

    /**
     * Kiểm tra tính hợp lệ của bảo hành cho một linh kiện cụ thể.
     * <p>
     * <strong>Business logic:</strong>
     * <ul>
     *     <li>Kiểm tra {@code installedPart.warrantyExpirationDate}</li>
     *     <li>Kiểm tra cả bảo hành của xe (warranty hierarchy)</li>
     *     <li>Trả về trạng thái dựa trên điều kiện nghiêm ngặt nhất</li>
     * </ul>
     *
     * @param installedPartId ID của linh kiện đã lắp đặt
     * @return WarrantyValidationResponseDTO chứa thông tin bảo hành linh kiện
     * @throws com.swp391.warrantymanagement.exception.ResourceNotFoundException nếu không tìm thấy linh kiện
     */
    WarrantyValidationResponseDTO validateInstalledPartWarranty(Long installedPartId);

    /**
     * Kiểm tra tính hợp lệ của bảo hành cho một xe theo VIN.
     * <p>
     * <strong>Use case:</strong> Customer hoặc SC_STAFF tra cứu nhanh bằng VIN
     * thay vì phải biết vehicleId.
     *
     * @param vehicleVin VIN của xe (Vehicle Identification Number)
     * @return WarrantyValidationResponseDTO chứa thông tin bảo hành
     * @throws com.swp391.warrantymanagement.exception.ResourceNotFoundException nếu không tìm thấy xe với VIN này
     */
    WarrantyValidationResponseDTO validateVehicleWarrantyByVin(String vehicleVin);

    /**
     * Kiểm tra và tính toán phí bảo hành cho xe đã hết hạn.
     * <p>
     * <strong>Business logic:</strong>
     * <ul>
     *     <li>Nếu còn trong grace period → Cho phép bảo hành tính phí</li>
     *     <li>Tính phí dựa trên: thời gian quá hạn, loại xe, loại sửa chữa</li>
     *     <li>Nếu quá lâu không còn bảo hành tính phí → Từ chối</li>
     * </ul>
     *
     * @param vehicleId ID của xe
     * @param estimatedRepairCost Chi phí sửa chữa ước tính (để tính % phí)
     * @return WarrantyValidationResponseDTO với thông tin phí bảo hành
     */
    WarrantyValidationResponseDTO calculatePaidWarrantyFee(Long vehicleId, java.math.BigDecimal estimatedRepairCost);

    /**
     * Kiểm tra và tính toán phí bảo hành cho linh kiện đã hết hạn.
     *
     * @param installedPartId ID của linh kiện
     * @param estimatedRepairCost Chi phí sửa chữa ước tính
     * @return WarrantyValidationResponseDTO với thông tin phí bảo hành linh kiện
     */
    WarrantyValidationResponseDTO calculatePaidWarrantyFeeForPart(Long installedPartId, java.math.BigDecimal estimatedRepairCost);
}
