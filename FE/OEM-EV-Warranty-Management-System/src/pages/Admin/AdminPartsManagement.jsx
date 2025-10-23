import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminPartsManagement } from '../../hooks/useAdminPartsManagement';
import * as S from './AdminPartsManagement.styles';
import { FaCogs, FaPlus, FaEdit, FaSearch, FaTrash, FaSpinner } from 'react-icons/fa';

// Form Modal Component for creating/editing parts
const PartFormModal = ({ isOpen, onClose, onSubmit, part }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(part ? { ...part } : { name: '', partNumber: '', manufacturer: '', price: 0 });
    }
  }, [part, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await onSubmit(formData, part?.id);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <h2>{part ? 'Chỉnh sửa Phụ tùng' : 'Tạo Phụ tùng mới'}</h2>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label>Tên phụ tùng *</S.Label>
            <S.Input name="name" value={formData.name || ''} onChange={handleInputChange} required />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Mã phụ tùng (Part Number) *</S.Label>
            <S.Input name="partNumber" value={formData.partNumber || ''} onChange={handleInputChange} required />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Nhà sản xuất</S.Label>
            <S.Input name="manufacturer" value={formData.manufacturer || ''} onChange={handleInputChange} />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Giá (VNĐ)</S.Label>
            <S.Input name="price" type="number" value={formData.price || 0} onChange={handleInputChange} />
          </S.FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button $primary type="submit">{part ? 'Cập nhật' : 'Tạo mới'}</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component
const AdminPartsManagement = () => {
  const navigate = useNavigate();
  const {
    parts, loading, error, pagination, searchTerm, setSearchTerm,
    handleSearch, handleCreateOrUpdate, handleDelete, handlePageChange
  } = useAdminPartsManagement();

  const [showForm, setShowForm] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  const openCreateForm = () => {
    setSelectedPart(null);
    setShowForm(true);
  };

  const openEditForm = (part) => {
    setSelectedPart(part);
    setShowForm(true);
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaCogs /> Quản lý Phụ tùng (Admin)</S.HeaderTitle>
            <S.Button $primary onClick={openCreateForm}><FaPlus /> Tạo Phụ tùng</S.Button>
          </S.HeaderTop>
          <S.SearchContainer>
            <S.Input placeholder="Tìm theo tên, mã, nhà sản xuất..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <S.Button $small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
          </S.SearchContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : parts.length === 0 ? (
          <S.EmptyState><h3>Không tìm thấy phụ tùng</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead><tr><S.Th>ID</S.Th><S.Th>Tên</S.Th><S.Th>Mã Phụ tùng</S.Th><S.Th>Nhà sản xuất</S.Th><S.Th>Giá</S.Th><S.Th>Thao tác</S.Th></tr></thead>
              <tbody>
                {parts.map(part => (
                  <tr key={part.id}>
                    <S.Td>{part.id}</S.Td>
                    <S.Td>{part.name}</S.Td>
                    <S.Td>{part.partNumber}</S.Td>
                    <S.Td>{part.manufacturer}</S.Td>
                    <S.Td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.price)}</S.Td>
                    <S.Td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <S.Button $small onClick={() => openEditForm(part)}><FaEdit /></S.Button>
                        <S.Button $small $danger onClick={() => handleDelete(part.id)}><FaTrash /></S.Button>
                      </div>
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
            {/* Pagination controls can be added here */}
          </S.TableContainer>
        )}

        <PartFormModal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleCreateOrUpdate} 
          part={selectedPart} 
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default AdminPartsManagement;
