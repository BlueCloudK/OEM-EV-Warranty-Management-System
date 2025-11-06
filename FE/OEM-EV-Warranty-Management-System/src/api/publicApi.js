import apiClient from "./apiClient";

/**
 * =================================================================
 * 🌐 Public API - Endpoints không cần authentication
 * =================================================================
 * - Các endpoint công khai cho phép truy cập mà không cần đăng nhập
 * - Chủ yếu dùng cho landing pages, tìm kiếm service centers công khai
 */

export const publicApi = {
  /**
   * Lấy danh sách service centers công khai (không cần auth)
   * Endpoint: GET /api/public/service-centers
   * @param {object} params - Pagination and sort params (page, size, sortBy, sortDir)
   * @returns {Promise<object>} Paged response với service centers
   */
  getServiceCenters: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      sortBy: 'name',
      sortDir: 'ASC',
      ...params
    }).toString();
    return apiClient(`/api/public/service-centers?${queryParams}`);
  },

  /**
   * Lấy thông tin chi tiết service center (không cần auth)
   * Endpoint: GET /api/public/service-centers/{id}
   * @param {number} id - Service center ID
   * @returns {Promise<object>} Service center details
   */
  getServiceCenterById: (id) => {
    return apiClient(`/api/public/service-centers/${id}`);
  },
};

export default publicApi;
