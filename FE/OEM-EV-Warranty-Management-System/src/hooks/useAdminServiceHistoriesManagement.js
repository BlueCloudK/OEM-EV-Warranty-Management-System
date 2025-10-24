import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

export const useAdminServiceHistoriesManagement = () => {
  const [serviceHistories, setServiceHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('general');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchServiceHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
      };
      let response;

      // Check if searching by date range
      if (searchType === 'dateRange' && dateRange.startDate && dateRange.endDate) {
        const dateParams = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          page: pagination.currentPage,
          size: pagination.pageSize,
        };
        response = await dataApi.getServiceHistoriesByDateRange(dateParams);
      } else if (searchTerm && searchTerm.trim()) {
        // Search by other criteria
        switch (searchType) {
          case 'vehicle':
            // Search by vehicle ID (must be a number)
            const vehicleId = parseInt(searchTerm.trim(), 10);
            if (isNaN(vehicleId)) {
              setError("ID Xe phải là số.");
              setServiceHistories([]);
              setLoading(false);
              return;
            }
            response = await dataApi.getServiceHistoriesByVehicle(vehicleId, params);
            break;
          case 'part':
            // Search by part ID (string)
            response = await dataApi.getServiceHistoriesByPart(searchTerm.trim(), params);
            break;
          default:
            // General search - add search term to params
            params.search = searchTerm.trim();
            response = await dataApi.getAllServiceHistories(params);
            break;
        }
      } else {
        // No search criteria - get all
        response = await dataApi.getAllServiceHistories(params);
      }

      if (response && response.content) {
        setServiceHistories(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setServiceHistories([]);
      }
    } catch (err) {
      console.error("Error fetching service histories:", err);
      setError(err.response?.data?.message || "Không thể tải lịch sử dịch vụ.");
      setServiceHistories([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm, searchType, dateRange]);

  useEffect(() => {
    fetchServiceHistories();
  }, [fetchServiceHistories]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchServiceHistories();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchType('general');
    setDateRange({ startDate: '', endDate: '' });
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handleCreateOrUpdate = async (formData, selectedHistoryId) => {
    const isEditing = !!selectedHistoryId;
    try {
      if (isEditing) {
        await dataApi.updateServiceHistory(selectedHistoryId, formData);
      } else {
        await dataApi.createServiceHistory(formData);
      }
      fetchServiceHistories();
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} service history:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handleDelete = async (historyId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử này không?')) {
      try {
        await dataApi.deleteServiceHistory(historyId);
        fetchServiceHistories();
      } catch (err) {
        alert(`Lỗi khi xóa: ${err.message}`);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    serviceHistories,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    dateRange,
    setDateRange,
    handleSearch,
    handleClearSearch,
    handleCreateOrUpdate,
    handleDelete,
    handlePageChange,
  };
};
