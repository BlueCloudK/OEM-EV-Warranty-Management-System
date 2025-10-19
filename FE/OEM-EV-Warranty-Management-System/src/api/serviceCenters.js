import { http } from "./httpClient";

export const serviceCentersApi = {
  async list(params = {}) {
    const query = new URLSearchParams({
      page: 0,
      size: 50,
      ...params,
    }).toString();
    const { data } = await http.get(`/api/service-centers?${query}`, {
      suppressAuthRedirect: true,
    });
    return Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
  },
  async get(id) {
    const { data } = await http.get(`/api/service-centers/${id}`, {
      suppressAuthRedirect: true,
    });
    return data;
  },
  async create(payload) {
    const { data } = await http.post(`/api/service-centers`, payload, {
      suppressAuthRedirect: true,
    });
    return data;
  },
  async update(id, payload) {
    const { data } = await http.put(`/api/service-centers/${id}`, payload, {
      suppressAuthRedirect: true,
    });
    return data;
  },
  async remove(id) {
    const { data } = await http.delete(`/api/service-centers/${id}`, {
      suppressAuthRedirect: true,
    });
    return data;
  },
};
