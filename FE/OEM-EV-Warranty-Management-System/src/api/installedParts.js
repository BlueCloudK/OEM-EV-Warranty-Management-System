import apiClient from "./apiClient";

/**
 * =================================================================
 * 🔧 Installed Parts API - Quản lý phụ tùng đã lắp
 * =================================================================
 * - Tracking parts đã được install vào vehicles
 * - History của part replacements
 * - Warranty tracking cho installed parts
 */

export const installedPartsApi = {
  /**
   * Lấy danh sách tất cả installed parts
   * Endpoint: GET /api/installed-parts
   * @param {object} params - Query params (page, size, sort)
   * @returns {Promise<object>} Paged response of installed parts
   */
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/installed-parts?${queryParams}`);
  },

  /**
   * Lấy installed part theo ID
   * Endpoint: GET /api/installed-parts/{id}
   * @param {number} id - Installed part ID
   * @returns {Promise<object>} Installed part details
   */
  getById: (id) => {
    return apiClient(`/api/installed-parts/${id}`);
  },

  /**
   * Tạo installed part record mới
   * Endpoint: POST /api/installed-parts
   * @param {object} installedPartData - Data (vehicleId, partId, installDate, technicianId, etc.)
   * @returns {Promise<object>} Created installed part
   */
  create: (installedPartData) => {
    return apiClient('/api/installed-parts', {
      method: 'POST',
      body: JSON.stringify(installedPartData),
    });
  },

  /**
   * Cập nhật installed part
   * Endpoint: PUT /api/installed-parts/{id}
   * @param {number} id - Installed part ID
   * @param {object} installedPartData - Updated data
   * @returns {Promise<object>} Updated installed part
   */
  update: (id, installedPartData) => {
    return apiClient(`/api/installed-parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(installedPartData),
    });
  },

  /**
   * Xóa installed part
   * Endpoint: DELETE /api/installed-parts/{id}
   * @param {number} id - Installed part ID
   * @returns {Promise<void>}
   */
  delete: (id) => {
    return apiClient(`/api/installed-parts/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Lấy installed parts theo vehicle
   * Endpoint: GET /api/installed-parts/by-vehicle/{vehicleId}
   * @param {number} vehicleId - Vehicle ID
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of vehicle's installed parts
   */
  getByVehicle: (vehicleId, params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/installed-parts/by-vehicle/${vehicleId}?${queryParams}`);
  },

  /**
   * Lấy installed parts của my vehicles (CUSTOMER)
   * Endpoint: GET /api/installed-parts/my-parts
   * Security: Backend tự lấy username từ JWT token
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of my installed parts
   */
  getMyInstalledParts: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/installed-parts/my-parts?${queryParams}`);
  },
};

export default installedPartsApi;
