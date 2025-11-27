import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for all Service History Management logic for SC Staff.
 */
export const useServiceHistoryManagement = () => {
  const navigate = useNavigate();

  // Data states
  const [histories, setHistories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI & Filter states
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [filters, setFilters] = useState({ searchTerm: '', vehicleId: '', partId: '', serviceType: '', startDate: '', endDate: '' });

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'serviceDate', direction: 'DESC' });

  const fetchHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
        search: filters.searchTerm,
        vehicleId: filters.vehicleId,
        partId: filters.partId,
        serviceType: filters.serviceType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortBy: sortConfig.key,
        sortDir: sortConfig.direction
      };
      // Remove null/empty params
      Object.keys(params).forEach(key => (params[key] == null || params[key] === '') && delete params[key]);

      const response = await dataApi.getAllServiceHistories(params);

      if (response && response.content) {
        setHistories(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setHistories([]);
      }
    } catch (err) {
      console.error("Error fetching service histories:", err);
      setError("Không thể tải lịch sử dịch vụ.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const fetchLookups = useCallback(async () => {
    try {
      const [vehiclesRes, partsRes] = await Promise.all([
        dataApi.getAllVehicles({ size: 1000 }),
        dataApi.getAllParts({ size: 1000 })
      ]);
      setVehicles(vehiclesRes.content || []);
      setParts(partsRes.content || []);
    } catch (err) {
      console.error("Error fetching lookup data (vehicles, parts):", err);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate("/login");
      return;
    }
    fetchHistories();
  }, [fetchHistories, navigate]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchHistories();
  };

  const clearFilters = () => {
    setFilters({ searchTerm: '', vehicleId: '', partId: '', serviceType: '', startDate: '', endDate: '' });
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    // The useEffect on fetchHistories will re-trigger
  };

  const handleCreateOrUpdate = async (formData, selectedHistoryId) => {
    const isEditing = !!selectedHistoryId;
    try {
      const payload = {
        ...formData,
        vehicleId: parseInt(formData.vehicleId),
        // partId is already a string
      };
      if (isEditing) {
        await dataApi.updateServiceHistory(selectedHistoryId, payload);
      } else {
        await dataApi.createServiceHistory(payload);
      }
      fetchHistories(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} service history:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    histories, vehicles, parts, loading, error, pagination, filters,
    handleFilterChange, applyFilters, clearFilters, handleCreateOrUpdate, handlePageChange,
    sortConfig, handleSort,
    refreshServiceHistories: fetchHistories, // Export refresh function
  };
};
