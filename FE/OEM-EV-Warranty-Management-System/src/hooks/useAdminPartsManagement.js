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

  // Part Categories State (for dropdown in create/edit form)
  const [categories, setCategories] = useState([]);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'partId', direction: 'DESC' });

  const fetchParts = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
        sortBy: sortConfig.key,
        sortDir: sortConfig.direction
      };

      if (effectiveSearchTerm) {
        params.search = effectiveSearchTerm;
      }

      console.log('🔍 Fetching parts with params:', params);

      const response = await dataApi.getAllParts(params);

      if (response && response.content) {
        setParts(response.content);
        setPagination(prev => ({ ...prev, totalPages: response.totalPages, totalElements: response.totalElements }));
      } else {
        setParts([]);
      }
    } catch (err) {
      console.error("Error fetching parts:", err);
      if (!silent) {
        setError("Không thể tải danh sách phụ tùng.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [pagination.currentPage, pagination.pageSize, effectiveSearchTerm, sortConfig]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  // Fetch active categories for dropdown
  const fetchCategories = useCallback(async () => {
    try {
      const data = await dataApi.getActivePartCategories();
      console.log("useAdminPartsManagement fetched categories:", data); // DEBUG LOG
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = () => {
    setEffectiveSearchTerm(searchTerm);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
    }));
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
    categories, // Active categories for dropdown
    refreshParts: fetchParts,
    sortConfig,
    handleSort,
  };
};
