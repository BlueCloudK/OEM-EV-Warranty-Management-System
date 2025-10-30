import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../api/customerApi';

/**
 * @description Custom Hook for Customer Warranty History logic.
 */
export const useCustomerWarrantyHistory = () => {
  const navigate = useNavigate();
  const [warrantyRequests, setWarrantyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [pagination, setPagination] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0 });

  const fetchWarrantyHistory = useCallback(async (page = 0, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await customerApi.getMyWarrantyClaims({ page, size });

      if (response && response.content) {
        setWarrantyRequests(response.content);
        setPagination(prev => ({ 
          ...prev, 
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
        }));
      } else {
        setWarrantyRequests([]);
        setPagination({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
      }

    } catch (err) {
      console.error("Error fetching customer warranty history:", err);
      setError("Không thể tải lịch sử bảo hành của bạn.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // No need for localStorage check here, AuthContext handles it.
    fetchWarrantyHistory(pagination.pageNumber, pagination.pageSize);
  }, [fetchWarrantyHistory, pagination.pageNumber, pagination.pageSize]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  };

  return {
    warrantyRequests,
    loading,
    error,
    pagination,
    handlePageChange,
  };
};
