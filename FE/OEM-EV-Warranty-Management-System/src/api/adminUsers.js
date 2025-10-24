import apiClient from './apiClient';

// URL cơ sở vẫn cần cho hàm login, vì nó không đi qua apiClient
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const adminUsersApi = {
  // GET ALL USERS - Lấy danh sách tất cả users với pagination và filtering
  getAllUsers: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient(`/api/admin/users?${queryParams}`);
  },

  // GET USER BY ID - Lấy thông tin user theo ID
  getUserById: (id) => {
    return apiClient(`/api/admin/users/${id}`);
  },

  // SEARCH USERS BY USERNAME - Tìm kiếm user theo username
  searchUsersByUsername: (username, page = 0, size = 10) => {
    const queryParams = new URLSearchParams({ username, page, size }).toString();
    return apiClient(`/api/admin/users/search?${queryParams}`);
  },

  // UPDATE USER (General PUT - currently problematic with password requirement)
  updateUser: (id, userData) => {
    return apiClient(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // DELETE USER - Xóa user
  deleteUser: (id) => {
    return apiClient(`/api/admin/users/${id}`, { method: 'DELETE' });
  },

  // ACTIVATE/DEACTIVATE USER - Kích hoạt/vô hiệu hóa user
  toggleUserStatus: (id, isActive) => {
    return apiClient(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  // GET STATISTICS - Thống kê users (Admin)
  getStatistics: () => {
    return apiClient('/api/admin/users/statistics');
  },

  // NEW: UPDATE USER ROLE - Cập nhật vai trò người dùng
  updateUserRole: (userId, newRoleId) => {
    return apiClient(`/api/admin/users/${userId}/role?newRoleId=${newRoleId}`, {
      method: 'PATCH',
    });
  },

  // NEW: RESET USER PASSWORD - Đặt lại mật khẩu người dùng
  resetUserPassword: async (userId) => {
    // Return the full response data, not just success: true
    return await apiClient(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
    });
  },
};

export const adminAuthApi = {
  // STAFF: REGISTER CUSTOMER - Đăng ký Customer đầy đủ bởi Staff
  staffRegisterCustomer: (userData) => {
    return apiClient('/api/auth/staff/register-customer', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // ADMIN: Create user with any role
  adminCreateUser: (userData) => {
    return apiClient('/api/auth/admin/create-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // LOGIN - Đăng nhập (Không dùng apiClient vì đây là nơi lấy token)
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    } catch (error) {
      console.error('❌ Error logging in:', error);
      throw error;
    }
  },

  // GET CURRENT USER - Lấy thông tin người dùng hiện tại
  getCurrentUser: async () => {
    try {
      // Thử endpoint mới hơn trước
      return await apiClient('/api/me');
    } catch (error) {
      console.warn('Could not fetch from /api/me, falling back to /api/auth/validate', error);
      // Nếu thất bại, thử endpoint cũ hơn
      return apiClient('/api/auth/validate');
    }
  },

  // GET MY PROFILE - Lấy thông tin profile đầy đủ (bao gồm customerId cho CUSTOMER)
  getMyProfile: async () => {
    return apiClient('/api/profile');
  },

  // LOGOUT - Đăng xuất
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('customerId');
    // Có thể thêm logic chuyển hướng trang ở đây nếu cần
    // window.location.href = '/login';
  },
};

export default { adminUsersApi, adminAuthApi };
