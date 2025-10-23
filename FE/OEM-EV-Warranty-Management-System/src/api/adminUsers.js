// ...existing code...
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
  // GET ALL USERS - Lấy danh sách tất cả users
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
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

  // GET USER BY ID - Lấy thông tin user theo ID
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

  // CREATE USER - Tạo user mới
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

  // UPDATE USER - Cập nhật user
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

  // DELETE USER - Xóa user
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

  // ACTIVATE/DEACTIVATE USER - Kích hoạt/vô hiệu hóa user
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
  ,

  // GET STATISTICS - Thống kê users (Admin)
  getStatistics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/statistics`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error getting users statistics:', error);
      throw error;
    }
  }
};

export const adminAuthApi = {
  // STAFF: REGISTER CUSTOMER - Đăng ký Customer đầy đủ bởi Staff (ADMIN, SC_STAFF, EVM_STAFF)
  staffRegisterCustomer: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/staff/register-customer`, {
        method: 'POST',
        headers: getAuthHeaders(), // requires staff authorization
        body: JSON.stringify(userData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error registering customer by staff:', error);
      throw error;
    }
  },

  // ADMIN: Create user with any role (requires ADMIN token)
  adminCreateUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/create-user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error creating user by admin:', error);
      throw error;
    }
  },

  // LOGIN - Đăng nhập
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

  // GET CURRENT USER - try /api/me then fallback to /api/auth/validate
  getCurrentUser: async () => {
    const headers = getAuthHeaders();
    try {
      // First try legacy /api/me which some parts of app use
      let response = await fetch(`${API_BASE_URL}/api/me`, { method: 'GET', headers });
      if (response.ok) return await handleResponse(response);

      // Fallback to /api/auth/validate
      response = await fetch(`${API_BASE_URL}/api/auth/validate`, { method: 'GET', headers });
      if (response.ok) return await handleResponse(response);

      // If neither worked, throw with last response text
      const txt = await response.text();
      throw new Error(txt || `HTTP ${response.status}`);
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      throw error;
    }
  }
};

export default { adminUsersApi, adminAuthApi };
