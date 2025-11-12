import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

export const useAdminServiceHistoriesManagement = () => {
  const [serviceHistories, setServiceHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('general');

  const fetchServiceHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      const page = pagination.currentPage;
      const size = pagination.pageSize;

      if (searchTerm && searchTerm.trim()) {
        // Search by specific criteria
        switch (searchType) {
          case 'vehicleName':
            try {
              
              // Use getAllVehicles with search parameter
              const vehiclesResponse = await dataApi.getAllVehicles({ search: searchTerm.trim(), size: 10 });
              
              if (vehiclesResponse?.content?.length > 0) {
                const vehicleId = vehiclesResponse.content[0].vehicleId || vehiclesResponse.content[0].id;
                response = await dataApi.getServiceHistoriesByVehicle(vehicleId, { page, size });
                
              } else {

                response = await dataApi.getAllServiceHistories({ page, size, search: searchTerm.trim() });
              }
            } catch (err) {
              
              // If all fails, fallback to general search
              response = await dataApi.getAllServiceHistories({ page, size, search: searchTerm.trim() });
              
            }
            break;
          case 'vehicleVin':
            try {
              // Try to find vehicle by VIN first, then get service histories for that vehicle
              const vehicleByVin = await dataApi.getVehicleByVin(searchTerm.trim());
              if (vehicleByVin && vehicleByVin.vehicleId) {
                response = await dataApi.getServiceHistoriesByVehicle(vehicleByVin.vehicleId, { page, size });
              } else {
                // If no vehicle found by VIN, return empty result
                response = { content: [], totalPages: 0, totalElements: 0 };
              }
            } catch (err) {
              // If VIN search fails, fallback to general search
              response = await dataApi.getAllServiceHistories({ page, size, search: searchTerm.trim() });
            }
            break;
          case 'general':
          default:
            // General search - add search term to params
            response = await dataApi.getAllServiceHistories({ page, size, search: searchTerm.trim() });
            break;
        }
      } else {
        // No search criteria - get all
        response = await dataApi.getAllServiceHistories({ page, size });
      }

      if (response && response.content) {
        setServiceHistories(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setServiceHistories([]);
      }
    } catch (err) {
      console.error("Error fetching service histories:", err);
      setError("Không thể tải lịch sử dịch vụ.");
      setServiceHistories([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm, searchType]);

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
    if (await window.confirm('Bạn có chắc chắn muốn xóa lịch sử này không?')) {
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
    handleSearch,
    handleClearSearch,
    handleCreateOrUpdate,
    handleDelete,
    handlePageChange,
  };
};
