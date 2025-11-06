import apiClient from "./apiClient";

/**
 * =================================================================
 * 🔩 Parts API - Quản lý phụ tùng xe điện
 * =================================================================
 * - Full CRUD operations cho parts management
 * - Search và filter parts
 * - Track inventory và pricing
 */

export const partsApi = {
  /**
   * Lấy danh sách tất cả parts
   * Endpoint: GET /api/parts
   * @param {object} params - Query params (page, size, sort, search, etc.)
   * @returns {Promise<object>} Paged response of parts
   */
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/parts?${queryParams}`);
  },

  /**
   * Lấy thông tin part theo ID
   * Endpoint: GET /api/parts/{id}
   * @param {number} id - Part ID
   * @returns {Promise<object>} Part details
   */
  getById: (id) => {
    return apiClient(`/api/parts/${id}`);
  },

  /**
   * Tạo part mới
   * Endpoint: POST /api/parts
   * @param {object} partData - Part data (partName, partNumber, description, price, etc.)
   * @returns {Promise<object>} Created part
   */
  create: (partData) => {
    return apiClient('/api/parts', {
      method: 'POST',
      body: JSON.stringify(partData),
    });
  },

  /**
   * Cập nhật part
   * Endpoint: PUT /api/parts/{id}
   * @param {number} id - Part ID
   * @param {object} partData - Updated part data
   * @returns {Promise<object>} Updated part
   */
  update: (id, partData) => {
    return apiClient(`/api/parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partData),
    });
  },

  /**
   * Xóa part
   * Endpoint: DELETE /api/parts/{id}
   * @param {number} id - Part ID
   * @returns {Promise<void>}
   */
  delete: (id) => {
    return apiClient(`/api/parts/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Tìm kiếm parts
   * Endpoint: GET /api/parts/search
   * @param {object} searchParams - Search criteria (partName, partNumber, category, etc.)
   * @returns {Promise<array>} Array of matching parts
   */
  search: (searchParams = {}) => {
    const queryParams = new URLSearchParams(searchParams).toString();
    return apiClient(`/api/parts/search?${queryParams}`);
  },
};

export default partsApi;
