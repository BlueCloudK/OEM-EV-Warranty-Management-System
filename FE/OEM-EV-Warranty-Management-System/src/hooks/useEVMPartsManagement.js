// Hook for EVM Staff Parts Management
import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

export const useEVMPartsManagement = () => {
  // Data state
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & search
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'partId', direction: 'DESC' });

  // Categories for dropdown
  const [categories, setCategories] = useState([]);

  // ---------- Fetch parts ----------
  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
        search: searchTerm,
        sortBy: sortConfig.key,
        sortDir: sortConfig.direction,
      };
      const response = await dataApi.getAllParts(params);
      if (response && response.content) {
        setParts(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setParts([]);
      }
    } catch (err) {
      console.error('Error fetching parts:', err);
      setError('Không thể tải danh sách phụ tùng.');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm, sortConfig]);

  // ---------- Fetch categories ----------
  const fetchCategories = useCallback(async () => {
    try {
      const response = await dataApi.getActivePartCategories();
      // API should return an array; fallback to empty array
      const cats = Array.isArray(response) ? response : (response && response.content) ? response.content : [];
      setCategories(cats);
      console.log('Fetched categories count:', cats.length);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  }, []);

  // ---------- Effects ----------
  useEffect(() => {
    fetchParts();
    fetchCategories();
  }, [fetchParts, fetchCategories]);

  // ---------- Handlers ----------
  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchParts();
  };

  const handleCreateOrUpdate = async (formData, selectedPartId) => {
    const isEditing = !!selectedPartId;
    try {
      if (isEditing) {
        await dataApi.updatePart(selectedPartId, formData);
      } else {
        await dataApi.createPart(formData);
      }
      fetchParts();
      return { success: true };
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} part:`, err);
      return { success: false, message: err.message || 'Đã xảy ra lỗi.' };
    }
  };

  const handleDelete = async partId => {
    if (await window.confirm('Bạn có chắc muốn xóa phụ tùng này không?')) {
      try {
        await dataApi.deletePart(partId);
        fetchParts();
      } catch (err) {
        alert(`Lỗi khi xóa phụ tùng: ${err.message}`);
      }
    }
  };

  const handlePageChange = newPage => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // ---------- Return ----------
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
    sortConfig,
    handleSort,
    categories,
    refreshParts: fetchParts, // Export refresh function
  };
};
