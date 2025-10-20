import { http } from "./httpClient";

export const partRequestsApi = {
  async list(params = {}) {
    const query = new URLSearchParams({
      page: 0,
      size: 50,
      ...params,
    }).toString();
    const { data } = await http.get(`/api/part-requests?${query}`, {
      suppressAuthRedirect: true,
    });
    return Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
  },
  async get(id) {
    const { data } = await http.get(`/api/part-requests/${id}`, {
      suppressAuthRedirect: true,
    });
    return data;
  },
  async updateStatus(id, status) {
    const { data } = await http.patch(
      `/api/part-requests/${id}/status`,
      status,
      { suppressAuthRedirect: true }
    );
    return data;
  },
};

