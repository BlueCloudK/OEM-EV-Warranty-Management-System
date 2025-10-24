import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import the master auth hook
import { useCustomerManagement } from '../../hooks/useCustomerManagement';
import * as S from './CustomerManagement.styles';
import { FaUsers, FaPlus, FaEdit, FaSearch, FaSpinner, FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone, FaAddressBook } from 'react-icons/fa';

// Form Modal Component (now includes account creation fields)
const CustomerFormModal = ({ isOpen, onClose, onSubmit, customer }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', username: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(customer ? { ...customer } : { name: '', email: '', phone: '', address: '', username: '', password: '' });
      setErrors({});
    }
  }, [customer, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Tên là bắt buộc';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.phone) newErrors.phone = 'Số điện thoại là bắt buộc';
    if (!customer) { // Only validate for new customers
      if (!formData.username) newErrors.username = 'Tên đăng nhập là bắt buộc';
      if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
    }
    return newErrors;
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
        <h2>{customer ? 'Chỉnh sửa khách hàng' : 'Tạo khách hàng mới'}</h2>
        <form onSubmit={handleSubmit}>
          {errors.general && <S.ErrorText>{errors.general}</S.ErrorText>}
          <S.FormGroup>
            <S.Label><FaAddressBook /> Tên khách hàng *</S.Label>
            <S.Input $hasError={!!errors.name} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            {errors.name && <S.ErrorText>{errors.name}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label><FaEnvelope /> Email *</S.Label>
            <S.Input $hasError={!!errors.email} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            {errors.email && <S.ErrorText>{errors.email}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label><FaPhone /> Số điện thoại *</S.Label>
            <S.Input $hasError={!!errors.phone} type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            {errors.phone && <S.ErrorText>{errors.phone}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label><FaMapMarkerAlt /> Địa chỉ</S.Label>
            <S.TextArea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </S.FormGroup>
          {!customer && (
            <>
              <S.FormGroup>
                <S.Label><FaUser /> Tên đăng nhập *</S.Label>
                <S.Input $hasError={!!errors.username} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                {errors.username && <S.ErrorText>{errors.username}</S.ErrorText>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label><FaLock /> Mật khẩu *</S.Label>
                <S.Input $hasError={!!errors.password} type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                {errors.password && <S.ErrorText>{errors.password}</S.ErrorText>}
              </S.FormGroup>
            </>
          )}
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
const CustomerManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    customers, loading: dataLoading, error, pagination, searchTerm, setSearchTerm, 
    searchType, setSearchType, handleSearch, handleCreateOrUpdate, handlePageChange
  } = useCustomerManagement();

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

  if (authLoading || dataLoading) {
    return <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>;
  }

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaUsers /> Quản lý Khách hàng</S.HeaderTitle>
            <S.Button $primary onClick={openCreateForm}><FaPlus /> Tạo khách hàng</S.Button>
          </S.HeaderTop>
          <S.SearchContainer>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}><option value="name">Tên</option><option value="email">Email</option><option value="phone">SĐT</option></select>
            <S.Input placeholder={`Tìm theo ${searchType}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
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
              <thead><tr><S.Th>Tên</S.Th><S.Th>Email</S.Th><S.Th>Điện thoại</S.Th><S.Th>Thao tác</S.Th></tr></thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.customerId}>
                    <S.Td>{customer.name}</S.Td>
                    <S.Td>{customer.email}</S.Td>
                    <S.Td>{customer.phone}</S.Td>
                    <S.Td><S.Button $small onClick={() => openEditForm(customer)}><FaEdit /> Sửa</S.Button></S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
            {/* Pagination controls can be added here */}
          </S.TableContainer>
        )}

        <CustomerFormModal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleCreateOrUpdate} 
          customer={selectedCustomer} 
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default CustomerManagement;
