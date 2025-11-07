import apiClient from "./apiClient";

/**
 * =================================================================
 * 🔔 Recall Requests API - Quản lý yêu cầu thu hồi sản phẩm
 * =================================================================
 * - Tạo và quản lý recall campaigns
 * - Admin phê duyệt/từ chối recalls
 * - Customer xác nhận tham gia recalls
 */

export const recallRequestsApi = {
  /**
   * Tạo recall request mới (ADMIN/EVM_STAFF)
   * Endpoint: POST /api/recall-requests
   * @param {object} recallData - Recall request data (title, description, affectedVehicles, etc.)
   * @returns {Promise<object>} Created recall request
   */
  create: (recallData) => {
    return apiClient('/api/recall-requests', {
      method: 'POST',
      body: JSON.stringify(recallData),
    });
  },

  /**
   * Phê duyệt recall request (ADMIN)
   * Endpoint: PATCH /api/recall-requests/{id}/approve
   * @param {number} id - Recall request ID
   * @param {object} approvalData - Approval data (comments, etc.)
   * @returns {Promise<object>} Updated recall request
   */
  approve: (id, approvalData = {}) => {
    return apiClient(`/api/recall-requests/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(approvalData),
    });
  },

  /**
   * Từ chối recall request (ADMIN)
   * Endpoint: PATCH /api/recall-requests/{id}/reject
   * @param {number} id - Recall request ID
   * @param {object} rejectionData - Rejection reason
   * @returns {Promise<object>} Updated recall request
   */
  reject: (id, rejectionData) => {
    return apiClient(`/api/recall-requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(rejectionData),
    });
  },

  /**
   * Customer xác nhận tham gia recall
   * Endpoint: PATCH /api/recall-requests/{id}/customer-confirm
   * @param {number} id - Recall request ID
   * @param {object} confirmData - Confirmation data
   * @returns {Promise<object>} Updated recall request
   */
  customerConfirm: (id, confirmData = {}) => {
    return apiClient(`/api/recall-requests/${id}/customer-confirm`, {
      method: 'PATCH',
      body: JSON.stringify(confirmData),
    });
  },

  /**
   * Lấy tất cả recall requests (ADMIN)
   * Endpoint: GET /api/recall-requests/admin
   * @param {object} params - Pagination params (page, size, sort)
   * @returns {Promise<object>} Paged response of recall requests
   */
  getAllForAdmin: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/recall-requests/admin?${queryParams}`);
  },

  /**
   * Lấy recall requests theo customer ID (ADMIN/STAFF)
   * Endpoint: GET /api/recall-requests/customer/{customerId}
   * @param {string} customerId - Customer UUID
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of customer's recalls
   */
  getByCustomer: (customerId, params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/recall-requests/customer/${customerId}?${queryParams}`);
  },

  /**
   * Lấy recall requests của chính mình (CUSTOMER)
   * Endpoint: GET /api/recall-requests/my-recalls
   * Security: Backend tự lấy username từ JWT token
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of my recalls
   */
  getMyRecalls: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/recall-requests/my-recalls?${queryParams}`);
  },

  /**
   * Xóa recall request (ADMIN)
   * Endpoint: DELETE /api/recall-requests/{id}
   * @param {number} id - Recall request ID
   * @returns {Promise<void>}
   */
  delete: (id) => {
    return apiClient(`/api/recall-requests/${id}`, {
      method: 'DELETE',
    });
  },
};

export default recallRequestsApi;
