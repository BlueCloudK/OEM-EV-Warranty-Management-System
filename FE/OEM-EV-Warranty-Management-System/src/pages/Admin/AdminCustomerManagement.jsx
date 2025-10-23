import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCustomerManagement } from '../../hooks/useAdminCustomerManagement';
import * as S from './AdminCustomerManagement.styles';
import { FaUsers, FaPlus, FaEdit, FaSearch, FaTrash, FaSpinner } from 'react-icons/fa';

// Form Modal Component
const CustomerFormModal = ({ isOpen, onClose, onSubmit, customer }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(customer ? { ...customer } : { name: '', email: '', phone: '', address: '' });
    }
  }, [customer, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await onSubmit(formData, customer?.customerId);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <h2>{customer ? 'Chỉnh sửa Khách hàng' : 'Tạo Khách hàng mới'}</h2>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label>Tên *</S.Label>
            <S.Input name="name" value={formData.name || ''} onChange={handleInputChange} required />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Email *</S.Label>
            <S.Input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} required />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Điện thoại *</S.Label>
            <S.Input name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} required />
          </S.FormGroup>
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

// Main Page Component
const AdminCustomerManagement = () => {
  const navigate = useNavigate();
  const {
    customers, loading, error, pagination, searchTerm, setSearchTerm,
    handleSearch, handleCreateOrUpdate, handleDelete, handlePageChange
  } = useAdminCustomerManagement();

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const openCreateForm = () => {
    setSelectedCustomer(null);
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaUsers /> Quản lý Khách hàng (Admin)</S.HeaderTitle>
            <S.Button $primary onClick={openCreateForm}><FaPlus /> Tạo Khách hàng</S.Button>
          </S.HeaderTop>
          <S.SearchContainer>
            <S.Input placeholder="Tìm theo tên, email, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <S.Button $small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
          </S.SearchContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : customers.length === 0 ? (
          <S.EmptyState><h3>Không tìm thấy khách hàng</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead><tr><S.Th>Tên</S.Th><S.Th>Email</S.Th><S.Th>Điện thoại</S.Th><S.Th>Địa chỉ</S.Th><S.Th>Thao tác</S.Th></tr></thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.customerId}>
                    <S.Td>{customer.name}</S.Td>
                    <S.Td>{customer.email}</S.Td>
                    <S.Td>{customer.phone}</S.Td>
                    <S.Td>{customer.address}</S.Td>
                    <S.Td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <S.Button $small onClick={() => openEditForm(customer)}><FaEdit /></S.Button>
                        <S.Button $small $danger onClick={() => handleDelete(customer.customerId)}><FaTrash /></S.Button>
                      </div>
                    </S.Td>
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

export default AdminCustomerManagement;
