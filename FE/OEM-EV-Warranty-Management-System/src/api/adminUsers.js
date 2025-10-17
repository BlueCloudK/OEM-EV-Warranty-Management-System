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
// ===========================================================================================
// Admin Users API - Quản lý Users cho Admin
// ===========================================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Helper function để lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function để tạo headers với authentication
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function để xử lý response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return null; // For DELETE requests
};

export const adminUsersApi = {
  // ===========================================================================================
  // GET ALL USERS - Lấy danh sách tất cả users
  // ===========================================================================================
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Thêm các query parameters
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      
      const url = `${API_BASE_URL}/api/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error getting users:', error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET USER BY ID - Lấy thông tin user theo ID
  // ===========================================================================================
  getUserById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error getting user ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // CREATE USER - Tạo user mới
  // ===========================================================================================
  createUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  // ===========================================================================================
  // UPDATE USER - Cập nhật user
  // ===========================================================================================
  updateUser: async (id, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error updating user ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // DELETE USER - Xóa user
  // ===========================================================================================
  deleteUser: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error deleting user ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // ACTIVATE/DEACTIVATE USER - Kích hoạt/vô hiệu hóa user
  // ===========================================================================================
  toggleUserStatus: async (id, isActive) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error toggling user status ${id}:`, error);
      throw error;
    }
  }
};

export const adminAuthApi = {
  // ===========================================================================================
  // REGISTER USER - Đăng ký user mới
  // ===========================================================================================
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error registering user:', error);
      throw error;
    }
  },

  // ===========================================================================================
  // LOGIN - Đăng nhập
  // ===========================================================================================
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error logging in:', error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET CURRENT USER - Lấy thông tin user hiện tại
  // ===========================================================================================
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      throw error;
    }
  }
};

export default { adminUsersApi, adminAuthApi };
