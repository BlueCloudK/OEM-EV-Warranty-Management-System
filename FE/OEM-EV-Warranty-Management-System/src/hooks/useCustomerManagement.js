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
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [searchType, setSearchType] = useState('name');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const page = pagination.currentPage;
      const size = pagination.pageSize;

      if (effectiveSearchTerm) {
        switch (searchType) {
          case 'id':
            const customerById = await dataApi.getCustomerById(effectiveSearchTerm);
            response = { content: customerById ? [customerById] : [], totalPages: customerById ? 1 : 0, totalElements: customerById ? 1 : 0 };
            break;
          case 'name':
            response = await dataApi.searchCustomersByName(effectiveSearchTerm, page, size);
            break;
          case 'email':
            const customerByEmail = await dataApi.getCustomerByEmail(effectiveSearchTerm);
            response = { content: customerByEmail ? [customerByEmail] : [], totalPages: customerByEmail ? 1 : 0, totalElements: customerByEmail ? 1 : 0 };
            break;
          case 'phone':
            const customerByPhone = await dataApi.getCustomerByPhone(effectiveSearchTerm);
            response = { content: customerByPhone ? [customerByPhone] : [], totalPages: customerByPhone ? 1 : 0, totalElements: customerByPhone ? 1 : 0 };
            break;
          case 'general':
          default:
            response = await dataApi.getAllCustomers({ page, size, search: effectiveSearchTerm });
            break;
        }
      } else {
        // If no search term, just get all customers with pagination
        response = await dataApi.getAllCustomers({ page, size });
      }

      if (response && response.content) {
        setCustomers(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setCustomers([]);
        setPagination(prev => ({ ...prev, totalPages: 0, totalElements: 0 }));
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Không thể tải danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, effectiveSearchTerm, searchType]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = () => {
    setEffectiveSearchTerm(searchTerm);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    // fetchCustomers will be re-triggered by the useEffect dependency change on effectiveSearchTerm
  };

  // Reset search when search type changes
  useEffect(() => {
    setSearchTerm('');
    setEffectiveSearchTerm('');
  }, [searchType]);

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
