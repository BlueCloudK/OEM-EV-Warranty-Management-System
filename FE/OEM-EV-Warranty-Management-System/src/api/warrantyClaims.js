import apiClient from "./apiClient";

/**
 * @description Refactored Warranty Claims API to use the central apiClient.
 * Note: Many of these functions are also available in `dataApi.js` for general use.
 */
export const warrantyClaimsApi = {
  // GET ALL WARRANTY CLAIMS - Lấy danh sách tất cả warranty claims
  getAllWarrantyClaims: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient(`/api/warranty-claims?${queryParams}`);
  },

  // GET WARRANTY CLAIM BY ID - Lấy thông tin warranty claim theo ID
  getWarrantyClaimById: async (id) => {
    return apiClient(`/api/warranty-claims/${id}`);
  },

  // CREATE WARRANTY CLAIM - Tạo warranty claim mới
  createWarrantyClaim: async (claimData) => {
    return apiClient(`/api/warranty-claims`, {
      method: "POST",
      body: JSON.stringify(claimData),
    });
  },

  // UPDATE WARRANTY CLAIM - Cập nhật warranty claim
  updateWarrantyClaim: async (id, claimData) => {
    return apiClient(`/api/warranty-claims/${id}`, {
      method: "PUT",
      body: JSON.stringify(claimData),
    });
  },

  // DELETE WARRANTY CLAIM - Xóa warranty claim
  deleteWarrantyClaim: async (id) => {
    return apiClient(`/api/warranty-claims/${id}`, { method: "DELETE" });
  },

  // APPROVE WARRANTY CLAIM - Phê duyệt warranty claim (Sử dụng endpoint PATCH /evm-accept theo guide)
  approveWarrantyClaim: async (id, approvalData) => {
    return apiClient(`/api/warranty-claims/${id}/evm-accept`, {
      method: "PATCH",
      body: JSON.stringify(approvalData),
    });
  },

  // REJECT WARRANTY CLAIM - Từ chối warranty claim (Sử dụng endpoint PATCH /evm-reject theo guide)
  rejectWarrantyClaim: async (id, rejectionData) => {
    return apiClient(`/api/warranty-claims/${id}/evm-reject`, {
      method: "PATCH",
      body: JSON.stringify(rejectionData),
    });
  },

  // GET WARRANTY CLAIMS BY VEHICLE - Lấy warranty claims theo xe
  getWarrantyClaimsByVehicle: async (vehicleId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient(`/api/warranty-claims/by-vehicle/${vehicleId}?${queryParams}`);
  },

  // GET WARRANTY CLAIMS BY CUSTOMER - Lấy warranty claims theo khách hàng
  getWarrantyClaimsByCustomer: async (customerId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient(`/api/warranty-claims/by-customer/${customerId}?${queryParams}`);
  },

  // GET MY WARRANTY CLAIMS (Customer Self-Service) - Khách hàng xem claims của mình
  getMyWarrantyClaims: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient(`/api/warranty-claims/my-claims?${queryParams}`);
  },
};

export default warrantyClaimsApi;
