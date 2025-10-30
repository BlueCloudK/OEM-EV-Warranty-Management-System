import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for Admin Vehicle Management logic (Auth logic removed).
 */
export const useAdminVehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        search: searchTerm,
      };

      const response = await dataApi.getAllVehicles(params);

      if (response && response.content) {
        setVehicles(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Không thể tải danh sách xe.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm]);

  const fetchCustomers = useCallback(async () => {
    try {
        const response = await dataApi.getAllCustomers({ size: 1000 }); // Fetch all for dropdown
        if(response && response.content) {
            setCustomers(response.content);
        }
    } catch (err) {
        console.error("Error fetching customers for dropdown:", err);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
  }, [fetchVehicles, fetchCustomers]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    // fetchVehicles will be re-triggered by the useEffect dependency change on pagination
  };

  const handleCreateOrUpdate = async (formData, selectedVehicleId) => {
    const isEditing = !!selectedVehicleId;
    try {
      if (isEditing) {
        await dataApi.updateVehicle(selectedVehicleId, formData);
      } else {
        await dataApi.createVehicle(formData);
      }
      fetchVehicles(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} vehicle:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này không? (Admin Only)')) {
        try {
            await dataApi.deleteVehicle(vehicleId);
            fetchVehicles(); // Refresh list
        } catch (err) {
            alert(`Lỗi khi xóa xe: ${err.message}`);
        }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    vehicles,
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
