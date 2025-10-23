import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUsersApi } from '../api/adminUsers';

/**
 * @description Custom Hook for all Admin User Management logic.
 */
export const useAdminUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        search: searchTerm,
      };

      const response = await adminUsersApi.getAllUsers(params);

      if (response && response.content) {
        setUsers(response.content);
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
  }, [pagination.currentPage, pagination.pageSize, searchTerm]);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [fetchUsers, navigate]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchUsers();
  };

  const handleCreateOrUpdate = async (formData, selectedUserId) => {
    const isEditing = !!selectedUserId;
    try {
      if (isEditing) {
        await adminUsersApi.updateUser(selectedUserId, formData);
      } else {
        // Creating user is handled by adminAuthApi
        // This form should likely be for updating only, or use a different API call
        // For now, we focus on update.
        console.warn("Create user function should be handled separately.");
      }
      fetchUsers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} user:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
        try {
            await adminUsersApi.deleteUser(userId);
            fetchUsers(); // Refresh list
        } catch (err) {
            alert(`Lỗi khi xóa người dùng: ${err.message}`);
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
    handleCreateOrUpdate,
    handleDelete,
    handlePageChange,
  };
};
