import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminCustomerManagement } from '../../hooks/useAdminCustomerManagement';
import * as S from './AdminCustomerManagement.styles';
import { FaUsers, FaPlus, FaEdit, FaSearch, FaTrash, FaSpinner, FaIdCard } from 'react-icons/fa';

// Form Modal Component
const CustomerFormModal = ({ isOpen, onClose, onSubmit, customer }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', userId: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(customer ? { ...customer, userId: customer.userId || '' } : { name: '', email: '', phone: '', address: '', userId: '' });
            setErrors({});
        }
    }, [customer, isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Tên là bắt buộc';
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
        if (!formData.phone) newErrors.phone = 'Số điện thoại là bắt buộc';
        // Only validate userId if it's a new customer
        if (!customer && !formData.userId) newErrors.userId = 'User ID là bắt buộc';
        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        const { success, message } = await onSubmit(formData, customer?.customerId);
        if (success) {
            onClose();
        } else {
            setErrors({ general: message });
        }
    };

    if (!isOpen) return null;

    return (
        <S.ModalOverlay>
            <S.ModalContent>
                <h2>{customer ? 'Chỉnh sửa Khách hàng' : 'Tạo Khách hàng mới'}</h2>
                <form onSubmit={handleSubmit}>
                    {errors.general && <S.ErrorText>{errors.general}</S.ErrorText>}
                    <S.FormGroup>
                        <S.Label>Tên *</S.Label>
                        <S.Input name="name" value={formData.name || ''} onChange={handleInputChange} required />
                        {errors.name && <S.ErrorText>{errors.name}</S.ErrorText>}
                    </S.FormGroup>
                    <S.FormGroup>
                        <S.Label>Email *</S.Label>
                        <S.Input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} required />
                        {errors.email && <S.ErrorText>{errors.email}</S.ErrorText>}
                    </S.FormGroup>
                    <S.FormGroup>
                        <S.Label>Số điện thoại *</S.Label>
                        <S.Input name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} required />
                        {errors.phone && <S.ErrorText>{errors.phone}</S.ErrorText>}
                    </S.FormGroup>
                    {/* User ID Field - Only show for new customers */}
                    {!customer && (
                        <S.FormGroup>
                            <S.Label><FaIdCard /> User ID *</S.Label>
                            <S.Input name="userId" type="number" value={formData.userId || ''} onChange={handleInputChange} required hasError={!!errors.userId} placeholder="Nhập User ID" />
                            {errors.userId && <S.ErrorText>{errors.userId}</S.ErrorText>}
                        </S.FormGroup>
                    )}
                    <S.FormGroup>
                        <S.Label>Địa chỉ</S.Label>
                        <S.TextArea name="address" value={formData.address || ''} onChange={handleInputChange} rows={3} />
                    </S.FormGroup>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <S.Button type="button" onClick={onClose}>Hủy</S.Button>
                        <S.Button $primary type="submit">{customer ? 'Cập nhật' : 'Tạo mới'}</S.Button>
                    </div>
                </form>
            </S.ModalContent>
        </S.ModalOverlay>
    );
};

// Main Page Component with new Authentication Flow
const AdminCustomerManagement = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const {
        customers, loading: dataLoading, error, pagination, searchTerm, setSearchTerm,
        handleSearch, handleCreateOrUpdate, handleDelete, handlePageChange,
        searchType, setSearchType // Get searchType and setSearchType
    } = useAdminCustomerManagement();

    const [showForm, setShowForm] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, authLoading, navigate]);

    const openCreateForm = () => {
        setSelectedCustomer(null);
        setShowForm(true);
    };

    const openEditForm = (customer) => {
        setSelectedCustomer(customer);
        setShowForm(true);
    };

    const getSearchPlaceholder = () => {
        switch (searchType) {
            case 'id':
                return 'Tìm theo ID...';
            case 'name':
                return 'Tìm theo Tên...';
            case 'email':
                return 'Tìm theo Email...';
            case 'phone':
                return 'Tìm theo Số điện thoại...';
            case 'general':
            default:
                return 'Tìm theo Tên, Email, SĐT...';
        }
    };

    if (authLoading || dataLoading) {
        return <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>;
    }

    return (
        <S.PageContainer>
            <S.ContentWrapper>
                <S.Header>
                    <S.HeaderTop>
                        <S.HeaderTitle><FaUsers /> Quản lý Khách hàng (Admin)</S.HeaderTitle>
                        <S.Button $primary onClick={openCreateForm}><FaPlus /> Tạo Khách hàng</S.Button>
                    </S.HeaderTop>
                    <S.SearchContainer>
                        {/* Search Type Dropdown */}
                        <S.Select
                            value={searchType}
                            onChange={(e) => {
                                setSearchType(e.target.value);
                                setSearchTerm(''); // Clear search term when changing search type
                            }}
                            style={{ marginRight: '10px', width: '150px' }} // Basic styling
                        >
                            <option value="general">Tìm kiếm chung</option>
                            <option value="id">Tìm theo ID</option>
                            <option value="name">Tìm theo Tên</option>
                            <option value="email">Tìm theo Email</option>
                            <option value="phone">Tìm theo SĐT</option>
                        </S.Select>

                        <S.Input
                            placeholder={getSearchPlaceholder()}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <S.Button $small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
                    </S.SearchContainer>
                </S.Header>

                {error ? (
                    <S.EmptyState>{error}</S.EmptyState>
                ) : customers.length === 0 ? (
                    <S.EmptyState><h3>Không tìm thấy khách hàng</h3></S.EmptyState>
                ) : (
                    <S.TableContainer>
                        <S.Table>
                            <thead><tr><S.Th>Tên</S.Th><S.Th>Email</S.Th><S.Th>Điện thoại</S.Th><S.Th>Địa chỉ</S.Th><S.Th>Thao tác</S.Th></tr></thead>
                            <tbody>
                            {customers.map(customer => (
                                <tr key={customer?.customerId || `customer-${Math.random()}`}>
                                    <S.Td>{customer?.name || ''}</S.Td>
                                    <S.Td>{customer?.email || ''}</S.Td>
                                    <S.Td>{customer?.phone || ''}</S.Td>
                                    <S.Td>{customer?.address || ''}</S.Td>
                                    <S.Td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <S.Button $small onClick={() => openEditForm(customer)}><FaEdit /></S.Button>
                                            <S.Button $small $danger onClick={() => handleDelete(customer?.customerId)}><FaTrash /></S.Button>
                                        </div>
                                    </S.Td>
                                </tr>
                            ))}
                            </tbody>
                        </S.Table>
                    </S.TableContainer>
                )}

                {/* Pagination Controls */}
                {pagination && !error && (
                    <S.PaginationContainer>
                        <S.Button
                            $small
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 0}
                        >
                            Trước
                        </S.Button>
                        <span style={{ margin: '0 15px', fontWeight: 'bold' }}>
                            Trang {pagination.currentPage + 1} / {pagination.totalPages}
                            <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9em' }}>
                                (Tổng: {pagination.totalElements} khách hàng)
                            </span>
                        </span>
                        <S.Button
                            $small
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages - 1}
                        >
                            Tiếp
                        </S.Button>
                    </S.PaginationContainer>
                )}

                <CustomerFormModal
                    isOpen={showForm}
                    onClose={() => setShowForm(false)}
                    onSubmit={handleCreateOrUpdate}
                    customer={selectedCustomer}
                    customers={customers} // Pass customers to the modal
                />
            </S.ContentWrapper>
        </S.PageContainer>
    );
};

export default AdminCustomerManagement;
