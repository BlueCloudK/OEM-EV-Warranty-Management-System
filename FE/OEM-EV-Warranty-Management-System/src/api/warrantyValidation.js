import apiClient from "./apiClient";

/**
 * API client for Warranty Validation endpoints.
 * Supports Hierarchy Warranty Model (Option 2).
 *
 * Features:
 * - Check warranty status for vehicles
 * - Check warranty status for installed parts
 * - Calculate paid warranty fees
 */
export const warrantyValidationApi = {
  /**
   * Kiểm tra bảo hành cho xe theo ID
   * @param {number} vehicleId - ID của xe
   * @returns {Promise<WarrantyValidationResponse>}
   */
  validateVehicleWarranty: async (vehicleId) => {
    return apiClient(`/api/warranty-validation/vehicle/${vehicleId}`);
  },

  /**
   * Kiểm tra bảo hành cho xe theo VIN
   * @param {string} vehicleVin - VIN của xe
   * @returns {Promise<WarrantyValidationResponse>}
   */
  validateVehicleWarrantyByVin: async (vehicleVin) => {
    return apiClient(`/api/warranty-validation/vehicle/vin/${vehicleVin}`);
  },

  /**
   * Kiểm tra bảo hành cho linh kiện đã lắp đặt
   * @param {number} installedPartId - ID của installed part
   * @returns {Promise<WarrantyValidationResponse>}
   */
  validateInstalledPartWarranty: async (installedPartId) => {
    return apiClient(`/api/warranty-validation/installed-part/${installedPartId}`);
  },

  /**
   * Tính phí bảo hành cho xe đã hết hạn
   * @param {number} vehicleId - ID của xe
   * @param {number} estimatedRepairCost - Chi phí sửa chữa ước tính (VNĐ)
   * @returns {Promise<WarrantyValidationResponse>}
   */
  calculatePaidWarrantyFee: async (vehicleId, estimatedRepairCost) => {
    return apiClient(
      `/api/warranty-validation/vehicle/${vehicleId}/calculate-fee?estimatedRepairCost=${estimatedRepairCost}`
    );
  },

  /**
   * Tính phí bảo hành cho linh kiện đã hết hạn
   * @param {number} installedPartId - ID của installed part
   * @param {number} estimatedRepairCost - Chi phí sửa chữa ước tính (VNĐ)
   * @returns {Promise<WarrantyValidationResponse>}
   */
  calculatePaidWarrantyFeeForPart: async (installedPartId, estimatedRepairCost) => {
    return apiClient(
      `/api/warranty-validation/installed-part/${installedPartId}/calculate-fee?estimatedRepairCost=${estimatedRepairCost}`
    );
  },
};

/**
 * @typedef {Object} WarrantyValidationResponse
 * @property {string} warrantyStatus - VALID, EXPIRED_DATE, EXPIRED_MILEAGE, EXPIRED_BOTH, PART_WARRANTY_EXPIRED
 * @property {string} statusDescription - Mô tả trạng thái bằng tiếng Việt
 * @property {boolean} isValidForFreeWarranty - Có hợp lệ bảo hành miễn phí không
 * @property {boolean} canProvidePaidWarranty - Có thể bảo hành tính phí không
 * @property {number} estimatedWarrantyFee - Phí bảo hành ước tính (nếu có)
 * @property {string} feeNote - Ghi chú về phí
 * @property {string} warrantyStartDate - Ngày bắt đầu bảo hành
 * @property {string} warrantyEndDate - Ngày hết hạn bảo hành
 * @property {number} daysRemaining - Số ngày còn lại (âm nếu hết hạn)
 * @property {number} currentMileage - Số km hiện tại
 * @property {number} mileageLimit - Giới hạn km
 * @property {number} mileageRemaining - Số km còn lại (âm nếu vượt)
 * @property {number} vehicleId - ID xe
 * @property {string} vehicleVin - VIN xe
 * @property {string} vehicleName - Tên xe
 * @property {number} installedPartId - ID linh kiện (nếu kiểm tra part)
 * @property {string} partName - Tên linh kiện (nếu kiểm tra part)
 * @property {string} partWarrantyExpirationDate - Ngày hết hạn bảo hành linh kiện
 * @property {number} partDaysRemaining - Số ngày còn lại của bảo hành linh kiện
 * @property {string} expirationReasons - Lý do hết hạn
 */

export default warrantyValidationApi;
