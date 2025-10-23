import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for all Customer Management logic.
 * Handles fetching, searching, pagination, creating, and updating customers.
 */
export const useCustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const page = pagination.currentPage;
      const size = pagination.pageSize;

      if (searchTerm) {
        switch (searchType) {
          case 'email':
            response = await dataApi.getCustomerByEmail(searchTerm); // Assumes this API exists
            break;
          case 'phone':
            response = await dataApi.getCustomerByPhone(searchTerm); // Assumes this API exists
            break;
          default: // name
            response = await dataApi.getAllCustomers({ page, size, search: searchTerm });
            break;
        }
      } else {
        response = await dataApi.getAllCustomers({ page, size });
      }

      if (response && response.content) {
        setCustomers(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else if (response && !Array.isArray(response)) {
        // Handle single object responses from email/phone search
        setCustomers([response]);
        setPagination({ currentPage: 0, pageSize: 1, totalPages: 1, totalElements: 1 });
      } else {
        setCustomers([]);
        setPagination({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
      }

    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Không thể tải danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm, searchType]);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate("/login");
      return;
    }
    fetchCustomers();
  }, [fetchCustomers, navigate]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page on new search
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
