import apiClient from "./apiClient";

export const serviceCentersApi = {
  async list(params = {}) {
    const query = new URLSearchParams({
      page: 0,
      size: 50,
      ...params,
    }).toString();
    const data = await apiClient(`/api/service-centers?${query}`);
    return Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
  },
  async get(id) {
    const data = await apiClient(`/api/service-centers/${id}`);
    return data;
  },
  async create(payload) {
    const data = await apiClient(`/api/service-centers`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  },
  async update(id, payload) {
    const data = await apiClient(`/api/service-centers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return data;
  },
  async remove(id) {
    const data = await apiClient(`/api/service-centers/${id}`, {
      method: "DELETE",
    });
    return data;
  },
};
