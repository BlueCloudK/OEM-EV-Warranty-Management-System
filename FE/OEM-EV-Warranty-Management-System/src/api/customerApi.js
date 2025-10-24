import apiClient from './apiClient';

/**
 * =================================================================
 * 👤 Customer API - Endpoints dành riêng cho vai trò CUSTOMER
 * =================================================================
 * - Sử dụng apiClient để có tính năng tự động refresh token.
 * - Tuân thủ theo các quy tắc trong API Guide.
 */

export const customerApi = {
  /**
   * Lấy danh sách các yêu cầu bảo hành của khách hàng đang đăng nhập.
   * Endpoint: GET /api/warranty-claims/my-claims
   * @param {object} params - Các tham số truy vấn (ví dụ: page, size, sort).
   * @returns {Promise<object>} Dữ liệu phân trang của các yêu cầu bảo hành.
   */
  getMyWarrantyClaims: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient(`/api/warranty-claims/my-claims?${queryParams}`);
  },

  /**
   * Lấy chi tiết một yêu cầu bảo hành cụ thể của khách hàng đang đăng nhập.
   * Endpoint: GET /api/warranty-claims/my-claims/{id}
   * @param {number} id - ID của yêu cầu bảo hành.
   * @returns {Promise<object>} Chi tiết yêu cầu bảo hành.
   */
  getMyWarrantyClaimById: (id) => {
    return apiClient(`/api/warranty-claims/my-claims/${id}`);
  },

  /**
   * Lấy danh sách các xe của khách hàng đang đăng nhập.
   * Endpoint: GET /api/vehicles/my-vehicles
   * @param {object} params - Các tham số truy vấn.
   * @returns {Promise<object>} Dữ liệu phân trang của các xe.
   */
  getMyVehicles: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient(`/api/vehicles/my-vehicles?${queryParams}`);
  },

  /**
   * Lấy lịch sử dịch vụ cho các xe của khách hàng đang đăng nhập.
   * Endpoint: GET /api/service-histories/my-services
   * @param {object} params - Các tham số truy vấn.
   * @returns {Promise<object>} Dữ liệu phân trang của lịch sử dịch vụ.
   */
  getMyServiceHistories: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient(`/api/service-histories/my-services?${queryParams}`);
  },
  
  /**
   * Lấy thông tin hồ sơ đầy đủ của khách hàng đang đăng nhập.
   * Endpoint: GET /api/profile
   * @returns {Promise<object>} Hồ sơ đầy đủ của khách hàng.
   */
  getMyProfile: () => {
    return apiClient('/api/profile');
  },

  /**
   * Cập nhật thông tin hồ sơ của khách hàng đang đăng nhập.
   * Endpoint: PUT /api/customers/profile
   * @param {object} profileData - Dữ liệu hồ sơ cần cập nhật (name, phone, userId).
   * @returns {Promise<object>} Hồ sơ đã được cập nhật.
   */
  updateMyProfile: (profileData) => {
    return apiClient('/api/customers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Lấy danh sách phản hồi của khách hàng đang đăng nhập.
   * Endpoint: GET /api/feedbacks/by-customer/{customerId}
   * @param {number} customerId - ID của khách hàng.
   * @param {object} params - Các tham số truy vấn.
   * @returns {Promise<object>} Dữ liệu phân trang của các phản hồi.
   */
  getMyFeedbacks: (customerId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient(`/api/feedbacks/by-customer/${customerId}?${queryParams}`);
  },

  /**
   * Tạo phản hồi mới.
   * Endpoint: POST /api/feedbacks?customerId={customerId}
   * @param {object} feedbackData - Dữ liệu phản hồi (warrantyClaimId, rating, comments, customerId).
   * @returns {Promise<object>} Phản hồi đã tạo.
   */
  createFeedback: (feedbackData) => {
    const { customerId, ...data } = feedbackData;
    return apiClient(`/api/feedbacks?customerId=${customerId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Lấy chi tiết phản hồi.
   * Endpoint: GET /api/feedbacks/{id}
   * @param {number} id - ID của phản hồi.
   * @returns {Promise<object>} Chi tiết phản hồi.
   */
  getFeedbackById: (id) => {
    return apiClient(`/api/feedbacks/${id}`);
  },

  /**
   * Cập nhật phản hồi.
   * Endpoint: PUT /api/feedbacks/{id}?customerId={customerId}
   * @param {number} id - ID của phản hồi.
   * @param {object} feedbackData - Dữ liệu phản hồi cần cập nhật (bao gồm customerId).
   * @returns {Promise<object>} Phản hồi đã cập nhật.
   */
  updateFeedback: (id, feedbackData) => {
    const { customerId, ...data } = feedbackData;
    return apiClient(`/api/feedbacks/${id}?customerId=${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Xóa phản hồi.
   * Endpoint: DELETE /api/feedbacks/{id}?customerId={customerId}
   * @param {number} id - ID của phản hồi.
   * @param {string} customerId - ID của khách hàng.
   * @returns {Promise<void>}
   */
  deleteFeedback: (id, customerId) => {
    return apiClient(`/api/feedbacks/${id}?customerId=${customerId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Lấy phản hồi theo yêu cầu bảo hành.
   * Endpoint: GET /api/feedbacks/by-claim/{claimId}
   * @param {number} claimId - ID của yêu cầu bảo hành.
   * @returns {Promise<object>} Phản hồi cho yêu cầu bảo hành.
   */
  getFeedbackByClaim: (claimId) => {
    return apiClient(`/api/feedbacks/by-claim/${claimId}`);
  },
};

export default customerApi;
