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
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState(''); // Actual term that triggers search
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'vehicleId', direction: 'DESC' });

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
        search: effectiveSearchTerm,
        sortBy: sortConfig.key,
        sortDir: sortConfig.direction
      };

      // If the user typed something that looks like a VIN, try the VIN-specific endpoint first
      const term = (effectiveSearchTerm || '').trim();
      let response;
      const looksLikeVin = term && (term.includes('-') || /[A-Za-z]/.test(term) || term.length >= 6);

      if (term) {
        try {
          if (looksLikeVin) {
            const vehicleByVin = await dataApi.getVehicleByVin(encodeURIComponent(term));
            // vehicleByVin may be an object, or wrapper with content/vehicle
            let vehicleObj = null;
            if (!vehicleByVin) {
              vehicleObj = null;
            } else if (vehicleByVin.vehicleId || vehicleByVin.id) {
              vehicleObj = vehicleByVin;
            }

            if (vehicleObj) {
              // Found by VIN - show single result
              response = { content: [vehicleObj], totalPages: 1, totalElements: 1 };
            }
          }
        } catch (err) {
          // ignore VIN lookup errors and fallback to general search
          console.warn('VIN lookup failed, falling back to general vehicle search', err);
        }
      }

      if (!response) {
        response = await dataApi.getAllVehicles(params);
      }

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
  }, [pagination.currentPage, pagination.pageSize, effectiveSearchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await dataApi.getAllCustomers({ size: 1000 }); // Fetch all for dropdown
      if (response && response.content) {
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
    setEffectiveSearchTerm(searchTerm); // Only trigger fetch when user actually searches
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
    if (await window.confirm('Bạn có chắc chắn muốn xóa xe này không? (Admin Only)')) {
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
    sortConfig,
    handleSort,
  };
};
