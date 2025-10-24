import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';
import { adminAuthApi } from '../api/adminUsers'; // Import adminAuthApi

/**
 * @description Custom Hook for Customer Management logic.
 */
export const useCustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [searchType, setSearchType] = useState('name');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        [searchType]: searchTerm,
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
  }, [pagination.currentPage, pagination.pageSize, searchTerm, searchType]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
        await adminAuthApi.staffRegisterCustomer(formData);
      }
      fetchCustomers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} customer:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
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
    searchType, 
    setSearchType,
    handleSearch,
    handleCreateOrUpdate,
    handlePageChange,
  };
};
