import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

export const useWarrantyClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [installedParts, setInstalledParts] = useState([]); // Added installedParts state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        status: filterStatus === 'all' ? '' : filterStatus,
      };

      const response = await dataApi.getAllWarrantyClaims(params);

      if (response && response.content) {
        setClaims(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.error("Error fetching claims:", err);
      setError("Không thể tải danh sách yêu cầu bảo hành.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filterStatus]);

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await dataApi.getAllVehicles({ size: 1000 });
      if (response && response.content) {
        setVehicles(response.content);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  }, []);

  const fetchParts = useCallback(async () => {
    try {
      const response = await dataApi.getAllParts({ size: 1000 });
      if (response && response.content) {
        setParts(response.content);
      }
    } catch (err) {
      console.error("Error fetching parts:", err);
    }
  }, []);

  const fetchInstalledPartsForVehicle = useCallback(async (vehicleId) => {
    try {
      const response = await dataApi.getInstalledPartsByVehicle(vehicleId);
      if (response && response.content) {
        setInstalledParts(response.content);
      }
    } catch (err) {
      console.error(`Error fetching installed parts for vehicle ${vehicleId}:`, err);
      setInstalledParts([]);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
    fetchVehicles();
    fetchParts();
  }, [fetchClaims, fetchVehicles, fetchParts]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handleCreateOrUpdate = async (formData, selectedClaimId) => {
    const isEditing = !!selectedClaimId;
    try {
      if (isEditing) {
        await dataApi.updateWarrantyClaim(selectedClaimId, formData);
      } else {
        await dataApi.createWarrantyClaim(formData);
      }
      fetchClaims();
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} claim:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    claims,
    vehicles,
    parts,
    installedParts,
    loading,
    error,
    pagination,
    filterStatus,
    handleFilterChange,
    handleCreateOrUpdate,
    handlePageChange,
    fetchInstalledPartsForVehicle, // Expose this function
  };
};
