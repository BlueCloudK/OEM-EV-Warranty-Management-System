import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for Admin Service Histories Management logic.
 */
export const useAdminServiceHistoriesManagement = () => {
  const navigate = useNavigate();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  const fetchHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        search: searchTerm,
      };

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
  }, [pagination.currentPage, pagination.pageSize, searchTerm]);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate("/login");
      return;
    }
    fetchHistories();
  }, [fetchHistories, navigate]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    // fetchHistories will be called by the useEffect dependency change
  };

  const handleDelete = async (historyId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử này không? (Admin Only)')) {
        try {
            await dataApi.deleteServiceHistory(historyId);
            fetchHistories(); // Refresh list
        } catch (err) {
            alert(`Lỗi khi xóa lịch sử: ${err.message}`);
        }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    histories,
    loading,
    error,
    pagination,
    searchTerm, 
    setSearchTerm,
    handleSearch,
    handleDelete,
    handlePageChange,
  };
};
