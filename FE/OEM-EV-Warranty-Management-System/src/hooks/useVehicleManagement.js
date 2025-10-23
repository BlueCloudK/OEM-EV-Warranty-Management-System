import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for all Vehicle Management logic.
 */
export const useVehicleManagement = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('general');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        search: searchType === 'general' ? searchTerm : '',
        vin: searchType === 'vin' ? searchTerm : '',
        customerId: searchType === 'customer' ? searchTerm : '',
      };

      const response = await dataApi.getAllVehicles(params);

      if (response && response.content) {
        setVehicles(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setVehicles([]);
        setPagination(prev => ({ ...prev, totalPages: 0, totalElements: 0 }));
      }

    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Không thể tải danh sách xe.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm, searchType]);

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
    if (!localStorage.getItem('accessToken')) {
      navigate("/login");
      return;
    }
    fetchVehicles();
    fetchCustomers();
  }, [fetchVehicles, fetchCustomers, navigate]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchVehicles();
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
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này không?')) {
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
    searchType, 
    setSearchType,
    handleSearch,
    handleCreateOrUpdate,
    handleDelete,
    handlePageChange,
  };
};
