import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminUserManagement } from '../../hooks/useAdminUserManagement';
import * as S from './AdminUserManagement.styles';
import { FaUsers, FaPlus, FaSearch, FaTrash, FaSpinner, FaMapMarkerAlt, FaPhone, FaAddressBook, FaKey } from 'react-icons/fa';

// Role mapping for display and update
const roles = [
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'SC_STAFF' },
  { id: 3, name: 'SC_TECHNICIAN' },
  { id: 4, name: 'EVM_STAFF' },
  { id: 5, name: 'CUSTOMER' }
];

// Form Modal Component (Now only for creating new users)
const UserFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    address: '',
    name: '', 
    phone: ''  
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ username: '', email: '', password: '', role: 'CUSTOMER', address: '', name: '', phone: '' });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username là bắt buộc.';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ.';
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc.';
    if (!formData.address) newErrors.address = 'Địa chỉ là bắt buộc.';

    if (formData.role === 'CUSTOMER') {
      if (!formData.name) newErrors.name = 'Tên là bắt buộc cho khách hàng.';
      if (!formData.phone) newErrors.phone = 'Số điện thoại là bắt buộc cho khách hàng.';
    }
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
    const { success, message } = await onSubmit(formData);
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
        <h2>Tạo Người dùng mới</h2>
        <form onSubmit={handleSubmit}>
          {errors.general && <S.ErrorText>{errors.general}</S.ErrorText>}

          {/* Role Field - Moved to top */}
          <S.FormGroup>
            <S.Label>Role *</S.Label>
            <S.Select name="role" value={formData.role || ''} onChange={handleInputChange} required>
              {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </S.Select>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>Username *</S.Label>
            <S.Input name="username" value={formData.username || ''} onChange={handleInputChange} required $hasError={!!errors.username} />
            {errors.username && <S.ErrorText>{errors.username}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Email *</S.Label>
            <S.Input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} required $hasError={!!errors.email} />
            {errors.email && <S.ErrorText>{errors.email}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Password *</S.Label>
            <S.Input name="password" type="password" value={formData.password || ''} onChange={handleInputChange} required $hasError={!!errors.password} />
            {errors.password && <S.ErrorText>{errors.password}</S.ErrorText>}
          </S.FormGroup>
          
          {formData.role === 'CUSTOMER' && (
            <>
              <S.FormGroup>
                <S.Label><FaAddressBook /> Tên Khách hàng *</S.Label>
                <S.Input name="name" value={formData.name || ''} onChange={handleInputChange} required $hasError={!!errors.name} />
                {errors.name && <S.ErrorText>{errors.name}</S.ErrorText>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label><FaPhone /> Số điện thoại Khách hàng *</S.Label>
                <S.Input name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} required $hasError={!!errors.phone} />
                {errors.phone && <S.ErrorText>{errors.phone}</S.ErrorText>}
              </S.FormGroup>
            </>
          )}
          <S.FormGroup>
            <S.Label><FaMapMarkerAlt /> Địa chỉ *</S.Label>
            <S.Input name="address" value={formData.address || ''} onChange={handleInputChange} required $hasError={!!errors.address} />
            {errors.address && <S.ErrorText>{errors.address}</S.ErrorText>}
          </S.FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button $primary type="submit">Tạo mới</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component
const AdminUserManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    users, loading: dataLoading, error, pagination, searchTerm, setSearchTerm,
    handleSearch, handleCreateUser, handleChangeRole, handleResetPassword, handleDelete, handlePageChange,
    roles, selectedRole, setSelectedRole, searchType, setSearchType 
  } = useAdminUserManagement();

  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'id':
        return 'Tìm theo ID...';
      case 'username':
        return 'Tìm theo Username...';
      case 'general':
      default:
        return 'Tìm theo Username, Email, Tên...';
    }
  };

  if (authLoading || dataLoading) {
    return <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>;
  }

  return (
    <>
      <S.HeaderTop>
        <S.HeaderTitle><FaUsers /> Quản lý Người dùng (Admin)</S.HeaderTitle>
        <S.Button $primary onClick={() => setShowCreateForm(true)}><FaPlus /> Tạo Người dùng</S.Button>
      </S.HeaderTop>
      <S.SearchContainer>
        {/* Search Type Dropdown */}
        <S.Select
          value={searchType}
          onChange={(e) => {
            setSearchType(e.target.value);
            setSearchTerm('');
          }}
          style={{ marginRight: '10px', width: '150px' }}
        >
          <option value="general">Tìm kiếm chung</option>
          <option value="username">Tìm theo Username</option>
          <option value="id">Tìm theo ID</option> 
        </S.Select>

        <S.Input 
          placeholder={getSearchPlaceholder()} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
        />
        <S.Button $small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>

        {/* Role Filter Dropdown */}
        <S.Select
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
          }}
          style={{ marginLeft: '10px', width: '150px' }}
        >
          <option value="">Tất cả vai trò</option>
          {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
        </S.Select>

      </S.SearchContainer>

      {error ? (
        <S.EmptyState>{error}</S.EmptyState>
      ) : users.length === 0 ? (
        <S.EmptyState><h3>Không tìm thấy người dùng</h3></S.EmptyState>
      ) : (
        <S.TableContainer>
          <S.Table>
            <thead>
              <tr>
                <S.Th>ID</S.Th>
                <S.Th>Username</S.Th>
                <S.Th>Email</S.Th>
                <S.Th>Role</S.Th>
                <S.Th>Thao tác</S.Th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <S.Td>{user.id}</S.Td>
                  <S.Td>{user.username}</S.Td>
                  <S.Td>{user.email}</S.Td>
                  <S.Td>
                    <S.Select
                      value={roles.find(r => r.name === user.roleName)?.id || ''}
                      onChange={(e) => handleChangeRole(user.id, parseInt(e.target.value))}
                    >
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </S.Select>
                  </S.Td>
                  <S.Td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <S.Button $small onClick={() => handleResetPassword(user.id)}><FaKey /></S.Button>
                      <S.Button $small $danger onClick={() => handleDelete(user.id)}><FaTrash /></S.Button>
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
              (Tổng: {pagination.totalElements} người dùng)
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

      <UserFormModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateUser}
      />
    </>
  );
};

export default AdminUserManagement;
