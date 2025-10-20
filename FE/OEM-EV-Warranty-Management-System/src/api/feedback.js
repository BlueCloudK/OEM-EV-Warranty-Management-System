import { http } from "./httpClient";

export const feedbackApi = {
  async list(params = {}) {
    const query = new URLSearchParams({
      page: 0,
      size: 50,
      ...params,
    }).toString();
    const { data } = await http.get(`/api/feedback?${query}`, {
      suppressAuthRedirect: true,
    });
    return Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
  },
  async get(id) {
    const { data } = await http.get(`/api/feedback/${id}`, {
      suppressAuthRedirect: true,
    });
    return data;
  },
  async reply(id, payload) {
    const { data } = await http.post(`/api/feedback/${id}/reply`, payload, {
      suppressAuthRedirect: true,
    });
    return data;
  },
  async updateStatus(id, status) {
    const { data } = await http.patch(`/api/feedback/${id}/status`, status, {
      suppressAuthRedirect: true,
    });
    return data;
  },
};

