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
   * Cập nhật thông tin hồ sơ của khách hàng đang đăng nhập.
   * Endpoint: PUT /api/customers/profile (Hoặc một endpoint tương tự như /api/me)
   * @param {object} profileData - Dữ liệu hồ sơ cần cập nhật.
   * @returns {Promise<object>} Hồ sơ đã được cập nhật.
   */
  updateMyProfile: (profileData) => {
    return apiClient('/api/customers/profile', { // Giả định endpoint, cần xác nhận lại từ BE
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

export default customerApi;
