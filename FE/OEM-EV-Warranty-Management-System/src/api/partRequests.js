import apiClient from "./apiClient";

export const partRequestsApi = {
  async list(params = {}) {
    const query = new URLSearchParams({
      page: 0,
      size: 50,
      ...params,
    }).toString();
    const data = await apiClient(`/api/part-requests?${query}`);
    return Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
  },
  async get(id) {
    const data = await apiClient(`/api/part-requests/${id}`);
    return data;
  },
  async updateStatus(id, status) {
    const data = await apiClient(`/api/part-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(status),
    });
    return data;
  },
};
