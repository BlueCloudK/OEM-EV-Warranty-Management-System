import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

export const useEVMWarrantyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [filterStatus, setFilterStatus] = useState('SUBMITTED'); // Default to SUBMITTED for approval

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'DESC' });

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
        status: filterStatus === 'all' ? '' : filterStatus,
        sortBy: sortConfig.key,
        sortDir: sortConfig.direction
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
  }, [pagination.currentPage, pagination.pageSize, filterStatus, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleApprove = async (claimId) => {
    if (await window.confirm('Bạn có chắc chắn muốn DUYỆT yêu cầu bảo hành này không?')) {
      try {
        await dataApi.evmAcceptClaim(claimId);
        fetchClaims(); // Refresh the list
      } catch (err) {
        alert(`Lỗi khi duyệt yêu cầu: ${err.message}`);
      }
    }
  };

  const handleReject = async (claimId, reason) => {
    try {
      await dataApi.evmRejectClaim(claimId, { comments: reason });
      fetchClaims(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error("Error rejecting claim:", err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    claims,
    loading,
    error,
    pagination,
    filterStatus,
    handleFilterChange,
    handleApprove,
    handleReject,
    handlePageChange,
    sortConfig,
    handleSort,
  };
};
