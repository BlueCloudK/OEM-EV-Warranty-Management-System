import apiClient from "./apiClient";

export const feedbackApi = {
  async list(params = {}) {
    const query = new URLSearchParams({
      page: 0,
      size: 50,
      ...params,
    }).toString();
    const data = await apiClient(`/api/feedback?${query}`);
    return Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
  },
  async get(id) {
    const data = await apiClient(`/api/feedback/${id}`);
    return data;
  },
  async reply(id, payload) {
    const data = await apiClient(`/api/feedback/${id}/reply`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  },
  async updateStatus(id, status) {
    const data = await apiClient(`/api/feedback/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(status),
    });
    return data;
  },
};
