import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUserManagement } from '../../hooks/useAdminUserManagement';
import * as S from './AdminUserManagement.styles';
import { FaUsers, FaPlus, FaEdit, FaSearch, FaTrash, FaSpinner } from 'react-icons/fa';

// Form Modal Component for creating/editing users
const UserFormModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({}); // Add error state for the form

  useEffect(() => {
    if (isOpen) {
      setFormData(user ? { ...user } : { username: '', email: '', password: '', role: 'CUSTOMER' });
      setErrors({}); // Reset errors when modal opens
    }
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if(errors[name]) setErrors(prev => ({...prev, [name]: null})); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.username || !formData.email) {
        setErrors({ general: 'Username and Email are required.' });
        return;
    }
    const { success, message } = await onSubmit(formData, user?.id);
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
        <h2>{user ? 'Chỉnh sửa Người dùng' : 'Tạo Người dùng mới'}</h2>
        <form onSubmit={handleSubmit}>
          {errors.general && <S.ErrorText>{errors.general}</S.ErrorText>}
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
          {!user && (
            <S.FormGroup>
              <S.Label>Password *</S.Label>
              <S.Input name="password" type="password" value={formData.password || ''} onChange={handleInputChange} required $hasError={!!errors.password} />
              {errors.password && <S.ErrorText>{errors.password}</S.ErrorText>}
            </S.FormGroup>
          )}
          <S.FormGroup>
            <S.Label>Role *</S.Label>
            <S.Select name="role" value={formData.role || ''} onChange={handleInputChange} required>
              <option value="CUSTOMER">Customer</option>
              <option value="SC_STAFF">SC Staff</option>
              <option value="SC_TECHNICIAN">SC Technician</option>
              <option value="EVM_STAFF">EVM Staff</option>
              <option value="ADMIN">Admin</option>
            </S.Select>
          </S.FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button $primary type="submit">{user ? 'Cập nhật' : 'Tạo mới'}</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component
const AdminUserManagement = () => {
  const navigate = useNavigate();
  const {
    users, loading, error, pagination, searchTerm, setSearchTerm,
    handleSearch, handleCreateOrUpdate, handleDelete, handlePageChange
  } = useAdminUserManagement();

  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openCreateForm = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaUsers /> Quản lý Người dùng (Admin)</S.HeaderTitle>
            <S.Button $primary onClick={openCreateForm}><FaPlus /> Tạo Người dùng</S.Button>
          </S.HeaderTop>
          <S.SearchContainer>
            <S.Input placeholder="Tìm theo tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <S.Button $small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
          </S.SearchContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : users.length === 0 ? (
          <S.EmptyState><h3>Không tìm thấy người dùng</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead><tr><S.Th>ID</S.Th><S.Th>Username</S.Th><S.Th>Email</S.Th><S.Th>Role</S.Th><S.Th>Thao tác</S.Th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <S.Td>{user.id}</S.Td>
                    <S.Td>{user.username}</S.Td>
                    <S.Td>{user.email}</S.Td>
                    <S.Td>{user.role}</S.Td>
                    <S.Td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <S.Button $small onClick={() => openEditForm(user)}><FaEdit /></S.Button>
                        <S.Button $small $danger onClick={() => handleDelete(user.id)}><FaTrash /></S.Button>
                      </div>
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
            {/* Pagination controls can be added here */}
          </S.TableContainer>
        )}

        <UserFormModal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleCreateOrUpdate} 
          user={selectedUser} 
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default AdminUserManagement;
