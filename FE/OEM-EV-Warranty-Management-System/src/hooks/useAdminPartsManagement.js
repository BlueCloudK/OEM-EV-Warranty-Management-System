import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook for Admin Parts Management logic (Auth logic removed).
 */
export const useAdminPartsManagement = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });

  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { 
        page: pagination.currentPage, 
        size: pagination.pageSize, 
        search: searchTerm,
      };

      const response = await dataApi.getAllParts(params);

      if (response && response.content) {
        setParts(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setParts([]);
      }
    } catch (err) {
      console.error("Error fetching parts:", err);
      setError("Không thể tải danh sách phụ tùng.");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, effectiveSearchTerm]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleSearch = () => {
    setEffectiveSearchTerm(searchTerm);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    // fetchParts will be re-triggered by the useEffect dependency change on pagination
  };

  const handleCreateOrUpdate = async (formData, selectedPartId) => {
    const isEditing = !!selectedPartId;
    try {
      if (isEditing) {
        await dataApi.updatePart(selectedPartId, formData);
      } else {
        await dataApi.createPart(formData);
      }
      fetchParts(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} part:`, err);
      return { success: false, message: err.message || "Đã xảy ra lỗi." };
    }
  };

  const handleDelete = async (partId) => {
    if (await window.confirm('Bạn có chắc chắn muốn xóa phụ tùng này không? (Admin Only)')) {
        try {
            await dataApi.deletePart(partId);
            fetchParts(); // Refresh list
        } catch (err) {
            alert(`Lỗi khi xóa phụ tùng: ${err.message}`);
        }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return {
    parts,
    loading,
    error,
    pagination,
    searchTerm, 
    setSearchTerm,
    handleSearch,
    handleCreateOrUpdate,
    handleDelete,
    handlePageChange,
  };
};
