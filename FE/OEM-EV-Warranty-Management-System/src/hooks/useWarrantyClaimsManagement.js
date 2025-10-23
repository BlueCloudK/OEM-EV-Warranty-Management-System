import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for all Warranty Claims Management logic for SC Staff.
 */
export const useWarrantyClaimsManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data states
  const [claims, setClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI & Form states
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [filterStatus, setFilterStatus] = useState('all');
  const prefilledVehicle = location.state?.prefilledVehicle;

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        status: filterStatus === 'all' ? null : filterStatus 
      };
      const response = await dataApi.getAllWarrantyClaims(params);
      if (response && response.content) {
        setClaims(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.error("Error fetching warranty claims:", err);
      setError("Không thể tải danh sách yêu cầu bảo hành.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filterStatus]);

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
    fetchClaims();
    fetchLookups();
  }, [fetchClaims, fetchLookups, navigate]);

  const handleCreateOrUpdate = async (formData, selectedClaimId) => {
    const isEditing = !!selectedClaimId;
    const payload = {
        ...formData,
        partId: parseInt(formData.partId),
        vehicleId: parseInt(formData.vehicleId),
    };

    try {
      if (isEditing) {
        await dataApi.updateWarrantyClaim(selectedClaimId, payload);
      } else {
        // Use the specific endpoint for SC Staff creation
        await dataApi.createWarrantyClaim(payload); // Assuming sc-create is handled by this endpoint now
      }
      fetchClaims(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} claim:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleFilterChange = (status) => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    setFilterStatus(status);
  }

  return {
    claims,
    vehicles,
    parts,
    loading,
    error,
    pagination,
    filterStatus,
    prefilledVehicle,
    handleFilterChange,
    handleCreateOrUpdate,
    handlePageChange,
  };
};
