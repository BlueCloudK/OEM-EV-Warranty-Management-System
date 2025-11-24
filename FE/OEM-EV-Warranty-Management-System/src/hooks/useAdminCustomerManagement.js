import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for Admin Customer Management logic (Auth logic removed).
 */
export const useAdminCustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState(''); // New state for search term that actually triggers fetch
  const [searchType, setSearchType] = useState('general'); // New state for search type

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'customerId', direction: 'DESC' });

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
            response = await dataApi.getAllCustomers({
              page,
              size,
              search: effectiveSearchTerm,
              sortBy: sortConfig.key,
              sortDir: sortConfig.direction
            });
            break;
        }
      } else {
        // If no search term, just get all customers with pagination and sorting
        response = await dataApi.getAllCustomers({
          page,
          size,
          sortBy: sortConfig.key,
          sortDir: sortConfig.direction
        });
      }

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
  }, [pagination.currentPage, pagination.pageSize, effectiveSearchTerm, searchType, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    setEffectiveSearchTerm(searchTerm);
  };

  const handleCreateOrUpdate = async (formData, selectedCustomerId) => {
    const isEditing = !!selectedCustomerId;
    try {
      if (isEditing) {
        await dataApi.updateCustomer(selectedCustomerId, formData);
      } else {
        // Use the correct API for creating a customer account
        await dataApi.registerCustomerByStaff(formData);
      }
      fetchCustomers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} customer:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handleDelete = async (customerId) => {
    if (await window.confirm('Bạn có chắc chắn muốn xóa khách hàng này không? (Admin Only)')) {
      try {
        await dataApi.deleteCustomer(customerId);
        fetchCustomers(); // Refresh list
      } catch (err) {
        console.error("Lỗi khi xóa khách hàng:", err); // Log the full error
        let errorMessage = "Đã xảy ra lỗi khi xóa khách hàng.";
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message; // Use backend error message
        } else if (err.message) {
          errorMessage = err.message;
        }
        alert(`Lỗi khi xóa khách hàng: ${errorMessage}`);
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
    searchType, // Expose searchType
    setSearchType, // Expose setSearchType
    sortConfig,
    handleSort,
  };
};
