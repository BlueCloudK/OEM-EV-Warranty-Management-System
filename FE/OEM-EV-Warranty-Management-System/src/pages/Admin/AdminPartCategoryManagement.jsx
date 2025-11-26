import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePartCategoryManagement } from '../../hooks/usePartCategoryManagement';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import * as S from './AdminPartCategoryManagement.styles';
import { FaLayerGroup, FaPlus, FaEdit, FaTrash, FaSpinner, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

/**
 * Modal Form Component cho tạo/sửa Part Category
 */
const CategoryFormModal = ({ isOpen, onClose, onSubmit, category }) => {
    const [formData, setFormData] = useState({
        categoryName: category?.categoryName || '',
        maxQuantityPerVehicle: category?.maxQuantityPerVehicle || 1,
        description: category?.description || '',
        isActive: category?.isActive ?? true,
    });

    const [errors, setErrors] = useState({});

    // Update form data when category changes or modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                categoryName: category?.categoryName || '',
                maxQuantityPerVehicle: category?.maxQuantityPerVehicle || 1,
                description: category?.description || '',
                isActive: category?.isActive ?? true,
            });
            setErrors({});
        }
    }, [category, isOpen]);

    // Validate form
    const validate = () => {
        const newErrors = {};

        if (!formData.categoryName.trim()) {
            newErrors.categoryName = 'Tên category là bắt buộc';
        } else if (formData.categoryName.length > 100) {
            newErrors.categoryName = 'Tên category không được vượt quá 100 ký tự';
        }

        if (!formData.maxQuantityPerVehicle || formData.maxQuantityPerVehicle < 1) {
            newErrors.maxQuantityPerVehicle = 'Số lượng tối đa phải >= 1';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear error khi user nhập lại
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const result = await onSubmit({
            ...formData,
            maxQuantityPerVehicle: parseInt(formData.maxQuantityPerVehicle, 10),
        });

        if (result.success) {
            onClose();
        } else if (result.message) {
            // Hiển thị backend error
            alert(result.message);
        }
    };

    if (!isOpen) return null;

    return (
        <S.ModalOverlay onClick={onClose}>
            <S.ModalContent onClick={(e) => e.stopPropagation()}>
                <S.ModalTitle>
                    {category ? 'Chỉnh sửa Loại phụ tùng' : 'Tạo Loại phụ tùng mới'}
                </S.ModalTitle>

                <form onSubmit={handleSubmit}>
                    <S.FormGroup>
                        <S.Label>Tên Category *</S.Label>
                        <S.Input
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleInputChange}
                            placeholder="VD: Động cơ điện"
                            $hasError={!!errors.categoryName}
                        />
                        {errors.categoryName && <S.ErrorText>{errors.categoryName}</S.ErrorText>}
                    </S.FormGroup>

                    <S.FormGroup>
                        <S.Label>Số lượng tối đa / xe *</S.Label>
                        <S.Input
                            type="number"
                            name="maxQuantityPerVehicle"
                            value={formData.maxQuantityPerVehicle}
                            onChange={handleInputChange}
                            min="1"
                            $hasError={!!errors.maxQuantityPerVehicle}
                        />
                        {errors.maxQuantityPerVehicle && <S.ErrorText>{errors.maxQuantityPerVehicle}</S.ErrorText>}
                        <S.HelpText>Số lượng tối đa phụ tùng thuộc category này trên 1 xe</S.HelpText>
                    </S.FormGroup>

                    <S.FormGroup>
                        <S.Label>Mô tả</S.Label>
                        <S.Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Mô tả chi tiết về category này..."
                            maxLength={500}
                            $hasError={!!errors.description}
                        />
                        {errors.description && <S.ErrorText>{errors.description}</S.ErrorText>}
                        <S.HelpText>{formData.description.length}/500 ký tự</S.HelpText>
                    </S.FormGroup>

                    <S.FormGroup>
                        <S.CheckboxLabel>
                            <S.Checkbox
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                            />
                            <span>Kích hoạt (hiển thị khi tạo part mới)</span>
                        </S.CheckboxLabel>
                    </S.FormGroup>

                    <S.ButtonGroup>
                        <S.Button type="button" onClick={onClose}>
                            Hủy
                        </S.Button>
                        <S.Button type="submit" $primary>
                            {category ? 'Cập nhật' : 'Tạo mới'}
                        </S.Button>
                    </S.ButtonGroup>
                </form>
            </S.ModalContent>
        </S.ModalOverlay>
    );
};

/**
 * Main Component - Admin Part Category Management
 */
const AdminPartCategoryManagement = () => {
    const navigate = useNavigate();
    const { userRole } = useAuth();

    const {
        categories,
        loading,
        error,
        pagination,
        handleCreateOrUpdate,
        handleDelete,
        handlePageChange,
        refreshCategories,
        sortConfig,
        handleSort
    } = usePartCategoryManagement();

    // Auto-refresh logic (Visibility only)
    const { lastUpdated, isRefreshing } = useAutoRefresh({
        fetchData: (silent) => refreshCategories(silent),
        shouldPoll: false
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Auth check
    React.useEffect(() => {
        if (userRole && userRole !== 'ADMIN') {
            alert('Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý loại phụ tùng.');
            navigate('/');
        }
    }, [userRole, navigate]);

    const openCreateModal = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    const handleFormSubmit = async (formData) => {
        return await handleCreateOrUpdate(formData, selectedCategory?.categoryId);
    };

    const handleDeleteCategory = async (categoryId) => {
        await handleDelete(categoryId);
    };

    // Helper to render sort icon
    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort style={{ color: '#ccc', marginLeft: '5px' }} />;
        if (sortConfig.direction === 'ASC') return <FaSortUp style={{ color: '#3498db', marginLeft: '5px' }} />;
        return <FaSortDown style={{ color: '#3498db', marginLeft: '5px' }} />;
    };

    // Loading state
    if (loading && categories.length === 0) {
        return (
            <S.PageContainer>
                <S.ContentWrapper>
                    <S.LoadingState>
                        <FaSpinner />
                        <p>Đang tải danh sách loại phụ tùng...</p>
                    </S.LoadingState>
                </S.ContentWrapper>
            </S.PageContainer>
        );
    }

    // Error state
    if (error && categories.length === 0) {
        return (
            <S.PageContainer>
                <S.ContentWrapper>
                    <S.EmptyState>
                        <p style={{ color: '#ef4444' }}>❌ {error}</p>
                    </S.EmptyState>
                </S.ContentWrapper>
            </S.PageContainer>
        );
    }

    return (
        <S.PageContainer>
            <S.ContentWrapper>
                <S.Header>
                    <S.HeaderTop>
                        <S.HeaderTitle>
                            <FaLayerGroup />
                            Quản lý Loại phụ tùng (Part Categories)
                            {lastUpdated && (
                                <small style={{ color: '#7f8c8d', fontSize: '12px', marginLeft: '12px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {isRefreshing && <FaSpinner className="spinner" />}
                                    Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                                </small>
                            )}
                        </S.HeaderTitle>
                        <S.Button $primary onClick={openCreateModal}>
                            <FaPlus /> Tạo Category mới
                        </S.Button>
                    </S.HeaderTop>
                    <p style={{ color: '#6b7280', marginTop: '8px', marginBottom: 0 }}>
                        Quản lý các loại phụ tùng và giới hạn số lượng trên mỗi xe
                    </p>
                </S.Header>

                {categories.length === 0 ? (
                    <S.EmptyState>
                        <FaLayerGroup style={{ fontSize: '48px', color: '#d1d5db' }} />
                        <p style={{ marginTop: '16px', color: '#6b7280' }}>
                            Chưa có loại phụ tùng nào. Nhấn "Tạo Category mới" để bắt đầu.
                        </p>
                    </S.EmptyState>
                ) : (
                    <S.TableContainer>
                        <S.Table>
                            <thead>
                                <tr>
                                    <S.Th onClick={() => handleSort('categoryName')} style={{ cursor: 'pointer' }}>
                                        Tên Category {renderSortIcon('categoryName')}
                                    </S.Th>
                                    <S.Th onClick={() => handleSort('maxQuantityPerVehicle')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                                        Max Qty / Xe {renderSortIcon('maxQuantityPerVehicle')}
                                    </S.Th>
                                    <S.Th style={{ textAlign: 'center' }}>
                                        Số Parts
                                    </S.Th>
                                    <S.Th onClick={() => handleSort('isActive')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                                        Trạng thái {renderSortIcon('isActive')}
                                    </S.Th>
                                    <S.Th style={{ textAlign: 'center' }}>Thao tác</S.Th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.categoryId}>
                                        <S.Td>
                                            <S.CategoryNameCell>
                                                <S.CategoryNameMain>{category.categoryName}</S.CategoryNameMain>
                                                {category.description && (
                                                    <S.CategoryDescription>{category.description}</S.CategoryDescription>
                                                )}
                                            </S.CategoryNameCell>
                                        </S.Td>
                                        <S.Td style={{ textAlign: 'center', fontWeight: '600' }}>
                                            {category.maxQuantityPerVehicle}
                                        </S.Td>
                                        <S.Td style={{ textAlign: 'center' }}>
                                            <S.PartsCountBadge>
                                                {category.partCount || 0} parts
                                            </S.PartsCountBadge>
                                        </S.Td>
                                        <S.Td style={{ textAlign: 'center' }}>
                                            <S.StatusBadge $active={category.isActive}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </S.StatusBadge>
                                        </S.Td>
                                        <S.Td style={{ textAlign: 'center' }}>
                                            <S.Button $small onClick={() => openEditModal(category)}>
                                                <FaEdit /> Sửa
                                            </S.Button>
                                            {' '}
                                            <S.Button $small $danger onClick={() => handleDeleteCategory(category.categoryId)}>
                                                <FaTrash /> Vô hiệu hóa
                                            </S.Button>
                                        </S.Td>
                                    </tr>
                                ))}
                            </tbody>
                        </S.Table>
                    </S.TableContainer>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <S.PaginationContainer>
                        <S.Button
                            $small
                            disabled={pagination.currentPage === 0}
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                        >
                            ← Trước
                        </S.Button>
                        <span>
                            Trang {pagination.currentPage + 1} / {pagination.totalPages}
                        </span>
                        <S.Button
                            $small
                            disabled={pagination.currentPage >= pagination.totalPages - 1}
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                        >
                            Sau →
                        </S.Button>
                    </S.PaginationContainer>
                )}

                {/* Modal */}
                <CategoryFormModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSubmit={handleFormSubmit}
                    category={selectedCategory}
                />
            </S.ContentWrapper>
        </S.PageContainer>
    );
};

export default AdminPartCategoryManagement;
