import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

export const useVehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parts, setParts] = useState([]);
  const [installedParts, setInstalledParts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [searchType, setSearchType] = useState('general');

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const page = pagination.currentPage;
      const size = pagination.pageSize;

      if (searchTerm) {
        switch (searchType) {
          case 'id':
            const vehicleById = await dataApi.getVehicleById(searchTerm);
            response = { content: vehicleById ? [vehicleById] : [], totalPages: vehicleById ? 1 : 0, totalElements: vehicleById ? 1 : 0 };
            break;
          case 'vin':
            const vehicleByVin = await dataApi.getVehicleByVin(searchTerm);
            response = { content: vehicleByVin ? [vehicleByVin] : [], totalPages: vehicleByVin ? 1 : 0, totalElements: vehicleByVin ? 1 : 0 };
            break;
          case 'customer':
            response = await dataApi.getVehiclesByCustomerId(searchTerm, page, size);
            break;
          case 'model':
            response = await dataApi.searchVehicles({ model: searchTerm, page, size });
            break;
          case 'brand':
            response = await dataApi.searchVehicles({ brand: searchTerm, page, size });
            break;
          case 'general':
          default:
            response = await dataApi.getAllVehicles({ page, size, search: searchTerm });
            break;
        }
      } else {
        response = await dataApi.getAllVehicles({ page, size });
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
  }, [pagination.currentPage, pagination.pageSize, searchTerm, searchType]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await dataApi.getAllCustomers({ size: 1000 }); 
      if (response && response.content) {
        setCustomers(response.content);
      }
    } catch (err) {
      console.error("Error fetching customers for dropdown:", err);
    }
  }, []);

  const fetchParts = useCallback(async () => { 
    try {
      const response = await dataApi.getAllParts({ size: 1000 }); 
      if (response && response.content) {
        setParts(response.content);
      }
    } catch (err) {
      console.error("Error fetching parts for dropdown:", err);
    }
  }, []);

  const fetchInstalledPartsForVehicle = useCallback(async (vehicleId) => { 
    try {
      const response = await dataApi.getInstalledPartsByVehicle(vehicleId);
      if (response && response.content) {
        setInstalledParts(response.content);
      } else {
        setInstalledParts([]);
      }
    } catch (err) {
      console.error(`Error fetching installed parts for vehicle ${vehicleId}:`, err);
      setInstalledParts([]);
    }
  }, []);

  const clearInstalledParts = useCallback(() => { // Added this function
    setInstalledParts([]);
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
    fetchParts(); 
  }, [fetchVehicles, fetchCustomers, fetchParts]);

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
      fetchVehicles(); 
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
            fetchVehicles(); 
        } catch (err) {
            alert(`Lỗi khi xóa xe: ${err.message}`);
        }
    }
  };

  const handleInstallPart = async (formData) => { 
    try {
      await dataApi.createInstalledPart(formData);
      return { success: true };
    } catch (err) {
      console.error("Error installing part:", err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    vehicles,
    customers,
    parts, 
    installedParts, 
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
    handleInstallPart, 
    fetchInstalledPartsForVehicle, 
    clearInstalledParts, // Expose clear function
    handlePageChange,
  };
};
