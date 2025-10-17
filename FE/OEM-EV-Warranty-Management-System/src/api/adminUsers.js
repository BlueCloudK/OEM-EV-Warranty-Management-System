import { http } from "./httpClient";

const base = "/api/admin/users";

export const adminUsersApi = {
  list: async ({ page = 0, size = 10, search, role } = {}) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.set("page", page);
    if (size !== undefined) params.set("size", size);
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    const { data } = await http.get(`${base}?${params.toString()}`);
    return data;
  },

  getById: async (userId) => {
    const { data } = await http.get(`${base}/${userId}`);
    return data;
  },

  searchByUsername: async ({ username, page = 0, size = 10 }) => {
    const params = new URLSearchParams({ username, page, size });
    const { data } = await http.get(`${base}/search?${params.toString()}`);
    return data;
  },

  byRole: async ({ roleName, page = 0, size = 10 }) => {
    const params = new URLSearchParams({ page, size });
    const { data } = await http.get(
      `${base}/by-role/${encodeURIComponent(roleName)}?${params.toString()}`
    );
    return data;
  },

  updateInfo: async (userId, payload) => {
    const { data } = await http.put(`${base}/${userId}`, payload);
    return data;
  },

  updateRole: async (userId, newRoleId) => {
    const params = new URLSearchParams({ newRoleId });
    const { data } = await http.patch(
      `${base}/${userId}/role?${params.toString()}`
    );
    return data;
  },

  delete: async (userId) => {
    const { data } = await http.delete(`${base}/${userId}`);
    return data;
  },

  resetPassword: async (userId, newPassword) => {
    const params = new URLSearchParams();
    if (newPassword) params.set("newPassword", newPassword);
    const { data } = await http.post(
      `${base}/${userId}/reset-password${params.toString() ? `?${params}` : ""}`
    );
    return data;
  },

  statistics: async () => {
    const { data } = await http.get(`${base}/statistics`);
    return data;
  },
};

// Auth admin create user endpoint per guide
export const adminAuthApi = {
  createUser: async (payload) => {
    const { data } = await http.post(`/api/auth/admin/create-user`, payload);
    return data;
  },
};
