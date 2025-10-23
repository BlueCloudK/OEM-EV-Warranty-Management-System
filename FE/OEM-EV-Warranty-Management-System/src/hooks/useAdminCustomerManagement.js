import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for Admin Customer Management logic.
 * Similar to SCStaff's but dedicated to the Admin role.
 */
export const useAdminCustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        search: searchTerm,
      };

      const response = await dataApi.getAllCustomers(params);

      if (response && response.content) {
        setCustomers(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Không thể tải danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm]);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate("/login");
      return;
    }
    fetchCustomers();
  }, [fetchCustomers, navigate]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchCustomers();
  };

  const handleCreateOrUpdate = async (formData, selectedCustomerId) => {
    const isEditing = !!selectedCustomerId;
    try {
      if (isEditing) {
        await dataApi.updateCustomer(selectedCustomerId, formData);
      } else {
        await dataApi.createCustomer(formData);
      }
      fetchCustomers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} customer:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này không? (Admin Only)')) {
        try {
            await dataApi.deleteCustomer(customerId);
            fetchCustomers(); // Refresh list
        } catch (err) {
            alert(`Lỗi khi xóa khách hàng: ${err.message}`);
        }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    customers,
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
