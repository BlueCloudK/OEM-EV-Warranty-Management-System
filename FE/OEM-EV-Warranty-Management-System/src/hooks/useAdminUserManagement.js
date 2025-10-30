import { useState, useEffect, useCallback } from 'react';
import { adminUsersApi, adminAuthApi } from '../api/adminUsers';

// Helper function to normalize the user object, similar to AuthContext's normalizeUser
const normalizeUserForDisplay = (user) => {
  if (!user) return null;

  // Ensure 'id' exists, use userId if necessary
  const userId = user.id || user.userId;

  // If roleName already exists, use it. Otherwise, derive from roles array.
  if (user.roleName) return { ...user, id: userId };

  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    const mainRole = user.roles[0]; // e.g., "ROLE_ADMIN"
    return { 
      ...user, 
      id: userId, // Ensure id is always present
      roleName: mainRole.replace('ROLE_', '') // e.g., "ADMIN"
    };
  } else {
    return { ...user, id: userId, roleName: 'UNKNOWN' }; // Ensure 'id' exists even if no roles
  }
};

/**
 * @description Custom Hook for Admin User Management logic (Auth logic removed).
 */
export const useAdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState(''); // New state for search term that actually triggers fetch
  const [selectedRole, setSelectedRole] = useState(''); // New state for role filter
  const [searchType, setSearchType] = useState('general'); // New state for search type: 'general', 'username', or 'id'

  // Mapping role name to role ID as per backend expectation
  const roles = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'SC_STAFF' },
    { id: 3, name: 'SC_TECHNICIAN' },
    { id: 4, name: 'EVM_STAFF' },
    { id: 5, name: 'CUSTOMER' }
  ];

  const roleNameToIdMap = {
    ADMIN: 1,
    SC_STAFF: 2,
    SC_TECHNICIAN: 3,
    EVM_STAFF: 4,
    CUSTOMER: 5,
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (searchType === 'id' && effectiveSearchTerm) {
        // Call specific API for ID search
        const user = await adminUsersApi.getUserById(effectiveSearchTerm);
        response = { content: user ? [user] : [], totalPages: user ? 1 : 0, totalElements: user ? 1 : 0 };
      } else if (searchType === 'username' && effectiveSearchTerm) {
        // Call specific API for username search
        response = await adminUsersApi.searchUsersByUsername(
          effectiveSearchTerm,
          pagination.currentPage,
          pagination.pageSize
        );
      } else {
        // Call general API with search term and role filter
        const params = { 
          page: pagination.currentPage, 
          size: pagination.pageSize, 
          search: effectiveSearchTerm, 
          role: selectedRole, 
        };
        response = await adminUsersApi.getAllUsers(params);
      }

      if (response && response.content) {
        const normalizedUsers = response.content.map(normalizeUserForDisplay);
        setUsers(normalizedUsers);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, effectiveSearchTerm, selectedRole, searchType]); // Add searchType to dependencies

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 })); 
    setEffectiveSearchTerm(searchTerm); 
  };

  const handleCreateUser = async (formData) => {
    const roleId = roleNameToIdMap[formData.role];
    const { role, ...restFormData } = formData; 
    const payload = { ...restFormData, roleId }; 

    try {
      if (formData.role === 'CUSTOMER') {
        await adminAuthApi.staffRegisterCustomer(payload);
      } else {
        await adminAuthApi.adminCreateUser(payload);
      }
      fetchUsers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error(`Error creating user:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handleChangeRole = async (userId, newRoleId) => {
    if (window.confirm(`Bạn có chắc chắn muốn thay đổi vai trò của người dùng này không?`)) {
      try {
        await adminUsersApi.updateUserRole(userId, newRoleId);
        fetchUsers(); // Refresh list
        return { success: true };
      } catch (err) {
        alert(`Lỗi khi thay đổi vai trò: ${err.message}`);
        return { success: false, message: err.message || "Đã xảy ra lỗi." };
      }
    }
    return { success: false, message: "Thay đổi vai trò đã bị hủy." };
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại mật khẩu người dùng này không?')) {
      try {
        const response = await adminUsersApi.resetUserPassword(userId);
        const newPassword = response.newPassword; 
        alert(`Mật khẩu đã được đặt lại thành công! Mật khẩu mới: ${newPassword || 'Đã gửi đến email người dùng'}`);
        fetchUsers(); // Refresh list (optional)
        return { success: true };
      } catch (err) {
        alert(`Lỗi khi đặt lại mật khẩu: ${err.message}`);
        return { success: false, message: err.message || "Đã xảy ra lỗi." };
      }
    }
    return { success: false, message: "Đặt lại mật khẩu đã bị hủy." };
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
        try {
            await adminUsersApi.deleteUser(userId);
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error("Lỗi khi xóa người dùng:", err); 
            let errorMessage = "Đã xảy ra lỗi khi xóa người dùng.";
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message; 
            } else if (err.message) {
                errorMessage = err.message;
            }
            alert(`Lỗi khi xóa người dùng: ${errorMessage}`);
        }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    users,
    loading,
    error,
    pagination,
    searchTerm, 
    setSearchTerm,
    handleSearch,
    handleCreateUser,
    handleChangeRole,
    handleResetPassword,
    handleDelete,
    handlePageChange,
    roles, 
    selectedRole, 
    setSelectedRole, 
    searchType, // Expose searchType
    setSearchType, // Expose setSearchType
  };
};
