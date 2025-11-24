import apiClient from "./apiClient";

/**
 * =================================================================
 * 🏷️ Part Categories API - Quản lý loại phụ tùng
 * =================================================================
 * - Giới hạn số lượng phụ tùng theo loại trên mỗi xe
 * - CRUD operations cho category management (Admin only)
 * - Support cho dropdown selection trong part forms
 */

export const partCategoriesApi = {
    /**
     * Lấy tất cả part categories (bao gồm cả inactive)
     * Endpoint: GET /api/part-categories
     * @param {object} params - Query params (page, size, sort)
     * @returns {Promise<array>} Array of all part categories
     */
    getAll: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return apiClient(`/api/part-categories${queryParams ? `?${queryParams}` : ''}`);
    },

    /**
     * Lấy chỉ active part categories
     * Endpoint: GET /api/part-categories/active
     * Use case: Dropdown selection khi tạo/cập nhật part
     * @returns {Promise<array>} Array of active categories only
     */
    getActive: () => {
        return apiClient('/api/part-categories/active');
    },

    /**
     * Lấy chi tiết part category theo ID
     * Endpoint: GET /api/part-categories/{id}
     * @param {number} id - Category ID
     * @returns {Promise<object>} Category details
     */
    getById: (id) => {
        return apiClient(`/api/part-categories/${id}`);
    },

    /**
     * Tạo part category mới (Admin only)
     * Endpoint: POST /api/part-categories
     * @param {object} categoryData - Category data
     * @param {string} categoryData.categoryName - Tên category (required, unique)
     * @param {number} categoryData.maxQuantityPerVehicle - Số lượng tối đa/xe (required, >= 1)
     * @param {string} categoryData.description - Mô tả (optional)
     * @param {boolean} categoryData.isActive - Trạng thái (default: true)
     * @returns {Promise<object>} Created category
     */
    create: (categoryData) => {
        return apiClient('/api/part-categories', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    },

    /**
     * Cập nhật part category (Admin only)
     * Endpoint: PUT /api/part-categories/{id}
     * @param {number} id - Category ID
     * @param {object} categoryData - Updated category data
     * @returns {Promise<object>} Updated category
     */
    update: (id, categoryData) => {
        return apiClient(`/api/part-categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    },

    /**
     * Soft delete part category (Admin only)
     * Endpoint: DELETE /api/part-categories/{id}
     * Note: Chỉ set isActive = false, không xóa vật lý
     * Parts đã tham chiếu đến category vẫn giữ nguyên
     * @param {number} id - Category ID
     * @returns {Promise<void>}
     */
    softDelete: (id) => {
        return apiClient(`/api/part-categories/${id}`, {
            method: 'DELETE',
        });
    },
};

export default partCategoriesApi;
