import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for Admin Warranty Claims Management logic.
 */
export const useAdminWarrantyClaimsManagement = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [filters, setFilters] = useState({ searchTerm: '', status: '' });
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        search: filters.searchTerm,
        status: filters.status === 'all' ? '' : filters.status,
      };
      Object.keys(params).forEach(key => (params[key] == null || params[key] === '') && delete params[key]);

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
  }, [pagination.currentPage, pagination.pageSize, filters]);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate("/login");
      return;
    }
    fetchClaims();
  }, [fetchClaims, navigate]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchClaims();
  };

  const handleUpdateStatus = async (claimId, status, reason = null) => {
    try {
        let response;
        if(status === 'APPROVED') {
            response = await dataApi.evmAcceptClaim(claimId);
        } else if (status === 'REJECTED') {
            response = await dataApi.evmRejectClaim(claimId, { reason });
        } else {
            response = await dataApi.updateWarrantyClaimStatus(claimId, { status });
        }
        fetchClaims();
        return { success: true, data: response };
    } catch(err) {
        console.error(`Error updating claim status to ${status}:`, err);
        return { success: false, message: err.message };
    }
  };

  const handleDelete = async (claimId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này không? (Admin Only)')) {
        try {
            await dataApi.deleteWarrantyClaim(claimId);
            fetchClaims(); // Refresh list
        } catch (err) {
            alert(`Lỗi khi xóa yêu cầu: ${err.message}`);
        }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    claims,
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    applyFilters,
    handleUpdateStatus,
    handleDelete,
    handlePageChange,
  };
};
