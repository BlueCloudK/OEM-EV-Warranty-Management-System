import { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../api/dataApi';

/**
 * @description Custom Hook cho Admin Part Category Management
 * Quản lý logic CRUD operations, pagination, và state cho Part Categories
 * Follows pattern của useAdminPartsManagement.js
 */
export const usePartCategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination State
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });

    /**
     * Fetch part categories từ backend
     */
    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: 'categoryId', direction: 'DESC' });

    /**
     * Fetch part categories từ backend
     */
    const fetchCategories = useCallback(async (silent = false) => {
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

            const response = await dataApi.getAllPartCategories(params);

            // Backend có thể trả về array hoặc paginated object
            if (Array.isArray(response)) {
                // Nếu backend trả về array trực tiếp
                setCategories(response);
                setPagination(prev => ({
                    ...prev,
                    totalPages: 1,
                    totalElements: response.length
                }));
            } else if (response && response.content) {
                // Nếu backend trả về paginated response
                setCategories(response.content);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements
                }));
            } else {
                setCategories([]);
            }
        } catch (err) {
            console.error("Error fetching part categories:", err);
            if (!silent) {
                setError("Không thể tải danh sách loại phụ tùng.");
            }
            setCategories([]);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [pagination.currentPage, pagination.pageSize, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC'
        }));
    };

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    /**
     * Tạo hoặc cập nhật category
     * @param {object} formData - Category data (categoryName, maxQuantityPerVehicle, description, isActive)
     * @param {number|null} selectedCategoryId - Category ID nếu đang edit, null nếu đang tạo mới
     * @returns {object} { success: boolean, message?: string }
     */
    const handleCreateOrUpdate = async (formData, selectedCategoryId) => {
        const isEditing = !!selectedCategoryId;
        try {
            if (isEditing) {
                await dataApi.updatePartCategory(selectedCategoryId, formData);
            } else {
                await dataApi.createPartCategory(formData);
            }
            fetchCategories(); // Refresh the list
            return { success: true };
        } catch (err) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} category:`, err);
            return {
                success: false,
                message: err.message || `Lỗi khi ${isEditing ? 'cập nhật' : 'tạo'} loại phụ tùng.`
            };
        }
    };

    /**
     * Soft delete category (set isActive = false)
     * @param {number} categoryId - Category ID
     */
    const handleDelete = async (categoryId) => {
        if (await window.confirm('Bạn có chắc chắn muốn vô hiệu hóa loại phụ tùng này?\n\nLưu ý: Loại phụ tùng sẽ không bị xóa vĩnh viễn, chỉ được đánh dấu là không hoạt động.')) {
            try {
                await dataApi.deletePartCategory(categoryId);
                fetchCategories(); // Refresh list
                return { success: true };
            } catch (err) {
                console.error('Error deleting category:', err);
                alert(`Lỗi khi xóa loại phụ tùng: ${err.message}`);
                return { success: false, message: err.message };
            }
        }
        return { success: false, cancelled: true };
    };

    /**
     * Chuyển trang
     * @param {number} newPage - Page number (0-indexed)
     */
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    return {
        categories,
        loading,
        error,
        pagination,
        handleCreateOrUpdate,
        handleDelete,
        handlePageChange,
        handlePageChange,
        refreshCategories: fetchCategories,
        sortConfig,
        handleSort,
    };
};
