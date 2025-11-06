import apiClient from "./apiClient";

/**
 * =================================================================
 * 📋 Recall Responses API - Phản hồi thu hồi từ customers
 * =================================================================
 * - Quản lý responses của customers cho recall campaigns
 * - Track confirmation và participation status
 */

export const recallResponsesApi = {
  /**
   * Xác nhận recall response (CUSTOMER)
   * Endpoint: PATCH /api/recall-responses/{id}/confirm
   * @param {number} id - Recall response ID
   * @param {object} confirmData - Confirmation data (scheduledDate, notes, etc.)
   * @returns {Promise<object>} Updated recall response
   */
  confirm: (id, confirmData = {}) => {
    return apiClient(`/api/recall-responses/${id}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify(confirmData),
    });
  },

  /**
   * Lấy recall responses của chính mình (CUSTOMER)
   * Endpoint: GET /api/recall-responses/my-responses
   * Security: Backend tự lấy username từ JWT token
   * @param {object} params - Pagination params (page, size, sort)
   * @returns {Promise<object>} Paged response of my recall responses
   */
  getMyResponses: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/recall-responses/my-responses?${queryParams}`);
  },

  /**
   * Lấy tất cả recall responses (ADMIN/STAFF)
   * Endpoint: GET /api/recall-responses
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of all recall responses
   */
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/recall-responses?${queryParams}`);
  },

  /**
   * Lấy recall responses theo recall campaign (ADMIN/STAFF)
   * Endpoint: GET /api/recall-responses/campaign/{recallRequestId}
   * @param {number} recallRequestId - Recall request/campaign ID
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of responses for this campaign
   */
  getByCampaign: (recallRequestId, params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/recall-responses/campaign/${recallRequestId}?${queryParams}`);
  },

  /**
   * Lấy recall response theo ID
   * Endpoint: GET /api/recall-responses/{id}
   * @param {number} id - Recall response ID
   * @returns {Promise<object>} Recall response details
   */
  getById: (id) => {
    return apiClient(`/api/recall-responses/${id}`);
  },
};

export default recallResponsesApi;
