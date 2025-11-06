import apiClient from "./apiClient";

/**
 * =================================================================
 * 📝 Work Logs API - Nhật ký công việc của technicians
 * =================================================================
 * - Tracking work performed by technicians
 * - Time logging và task management
 * - Work history cho warranty claims
 */

export const workLogsApi = {
  /**
   * Lấy danh sách tất cả work logs (ADMIN/STAFF)
   * Endpoint: GET /api/work-logs
   * @param {object} params - Query params (page, size, sort)
   * @returns {Promise<object>} Paged response of work logs
   */
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/work-logs?${queryParams}`);
  },

  /**
   * Lấy work log theo ID
   * Endpoint: GET /api/work-logs/{id}
   * @param {number} id - Work log ID
   * @returns {Promise<object>} Work log details
   */
  getById: (id) => {
    return apiClient(`/api/work-logs/${id}`);
  },

  /**
   * Tạo work log mới (TECHNICIAN)
   * Endpoint: POST /api/work-logs
   * @param {object} workLogData - Data (warrantyClaimId, description, hoursWorked, etc.)
   * @returns {Promise<object>} Created work log
   */
  create: (workLogData) => {
    return apiClient('/api/work-logs', {
      method: 'POST',
      body: JSON.stringify(workLogData),
    });
  },

  /**
   * Cập nhật work log (TECHNICIAN)
   * Endpoint: PUT /api/work-logs/{id}
   * @param {number} id - Work log ID
   * @param {object} workLogData - Updated data
   * @returns {Promise<object>} Updated work log
   */
  update: (id, workLogData) => {
    return apiClient(`/api/work-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workLogData),
    });
  },

  /**
   * Xóa work log (ADMIN)
   * Endpoint: DELETE /api/work-logs/{id}
   * @param {number} id - Work log ID
   * @returns {Promise<void>}
   */
  delete: (id) => {
    return apiClient(`/api/work-logs/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Lấy work logs theo warranty claim
   * Endpoint: GET /api/work-logs/by-claim/{warrantyClaimId}
   * @param {number} warrantyClaimId - Warranty claim ID
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of claim's work logs
   */
  getByClaim: (warrantyClaimId, params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/work-logs/by-claim/${warrantyClaimId}?${queryParams}`);
  },

  /**
   * Lấy work logs theo technician
   * Endpoint: GET /api/work-logs/by-technician/{technicianId}
   * @param {number} technicianId - User ID of technician
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of technician's work logs
   */
  getByTechnician: (technicianId, params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/work-logs/by-technician/${technicianId}?${queryParams}`);
  },

  /**
   * Lấy work logs của chính mình (TECHNICIAN)
   * Endpoint: GET /api/work-logs/my-logs
   * Security: Backend tự lấy username từ JWT token
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of my work logs
   */
  getMyLogs: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/work-logs/my-logs?${queryParams}`);
  },
};

export default workLogsApi;
