import apiClient from "./apiClient";

/**
 * =================================================================
 * 📝 Feedback API - Legacy/Unused
 * =================================================================
 * ⚠️ WARNING: This file is not currently used in the codebase.
 * - Consider using customerApi.js for feedback operations instead
 * - Backend endpoint is /api/feedbacks (plural), not /api/feedback
 *
 * If you need this, update endpoints to match backend:
 * - /api/feedback → /api/feedbacks
 */

export const feedbackApi = {
  async list(params = {}) {
    const query = new URLSearchParams({
      page: 0,
      size: 50,
      ...params,
    }).toString();
    // Fixed: Changed /api/feedback to /api/feedbacks to match backend
    const data = await apiClient(`/api/feedbacks?${query}`);
    return Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
  },
  async get(id) {
    // Fixed: Changed /api/feedback to /api/feedbacks to match backend
    const data = await apiClient(`/api/feedbacks/${id}`);
    return data;
  },
  async reply(id, payload) {
    // Note: /reply endpoint may not exist on backend, verify first
    const data = await apiClient(`/api/feedbacks/${id}/reply`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  },
  async updateStatus(id, status) {
    // Note: /status endpoint may not exist on backend, verify first
    const data = await apiClient(`/api/feedbacks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(status),
    });
    return data;
  },
};
