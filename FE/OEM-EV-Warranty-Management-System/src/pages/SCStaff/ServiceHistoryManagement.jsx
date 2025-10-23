import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServiceHistoryManagement } from '../../hooks/useServiceHistoryManagement';
import * as S from './ServiceHistoryManagement.styles';
import { FaHistory, FaPlus, FaEdit, FaSearch, FaArrowLeft, FaSpinner, FaFilter, FaTimes } from 'react-icons/fa';

// Form Modal Component
const HistoryFormModal = ({ isOpen, onClose, onSubmit, history, vehicles, parts }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(history ? { ...history } : { serviceDate: new Date().toISOString().slice(0, 16), serviceType: 'REPAIR', description: '', partId: '', vehicleId: '' });
    }
  }, [history, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success } = await onSubmit(formData, history?.serviceHistoryId);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <h2>{history ? 'Chỉnh sửa Lịch sử' : 'Tạo Lịch sử Dịch vụ'}</h2>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label>Ngày dịch vụ *</S.Label>
            <S.Input name="serviceDate" type="datetime-local" value={formData.serviceDate || ''} onChange={handleInputChange} required />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Loại dịch vụ *</S.Label>
            <S.Select name="serviceType" value={formData.serviceType || ''} onChange={handleInputChange} required>
              <option value="REPAIR">Sửa chữa</option>
              <option value="REPLACEMENT">Thay thế</option>
              <option value="MAINTENANCE">Bảo dưỡng</option>
              <option value="INSPECTION">Kiểm tra</option>
            </S.Select>
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Xe *</S.Label>
            <S.Select name="vehicleId" value={formData.vehicleId || ''} onChange={handleInputChange} required>
              <option value="">Chọn xe</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleName} ({v.vin})</option>)}
            </S.Select>
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Linh kiện *</S.Label>
            <S.Select name="partId" value={formData.partId || ''} onChange={handleInputChange} required>
              <option value="">Chọn linh kiện</option>
              {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </S.Select>
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Mô tả *</S.Label>
            <S.TextArea name="description" value={formData.description || ''} onChange={handleInputChange} required rows={4} />
          </S.FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button primary type="submit">{history ? 'Cập nhật' : 'Tạo mới'}</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component
const ServiceHistoryManagement = () => {
  const navigate = useNavigate();
  const {
    histories, vehicles, parts, loading, error, pagination, filters,
    handleFilterChange, applyFilters, clearFilters, handleCreateOrUpdate, handlePageChange
  } = useServiceHistoryManagement();

  const [showForm, setShowForm] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const openCreateForm = () => {
    setSelectedHistory(null);
    setShowForm(true);
  };

  const openEditForm = (history) => {
    setSelectedHistory(history);
    setShowForm(true);
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaHistory /> Quản lý Lịch sử Dịch vụ</S.HeaderTitle>
            <S.Button primary onClick={openCreateForm}><FaPlus /> Tạo Lịch sử</S.Button>
          </S.HeaderTop>
          <S.FilterContainer>
            <S.Input placeholder="Tìm kiếm..." value={filters.searchTerm} onChange={(e) => handleFilterChange('searchTerm', e.target.value)} />
            <S.Select value={filters.vehicleId} onChange={(e) => handleFilterChange('vehicleId', e.target.value)}><option value="">Tất cả xe</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleName}</option>)}</S.Select>
            <S.Select value={filters.partId} onChange={(e) => handleFilterChange('partId', e.target.value)}><option value="">Tất cả linh kiện</option>{parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</S.Select>
            <S.Select value={filters.serviceType} onChange={(e) => handleFilterChange('serviceType', e.target.value)}><option value="">Tất cả loại DV</option><option value="REPAIR">Sửa chữa</option><option value="REPLACEMENT">Thay thế</option><option value="MAINTENANCE">Bảo dưỡng</option><option value="INSPECTION">Kiểm tra</option></S.Select>
            <S.Button secondary onClick={applyFilters}><FaFilter /> Lọc</S.Button>
            <S.Button onClick={clearFilters}><FaTimes /> Xóa lọc</S.Button>
          </S.FilterContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : histories.length === 0 ? (
          <S.EmptyState><h3>Không có lịch sử dịch vụ nào</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead><tr><S.Th>Ngày</S.Th><S.Th>Loại DV</S.Th><S.Th>Mô tả</S.Th><S.Th>Xe</S.Th><S.Th>Linh kiện</S.Th><S.Th>Thao tác</S.Th></tr></thead>
              <tbody>
                {histories.map(history => (
                  <tr key={history.id}>
                    <S.Td>{new Date(history.serviceDate).toLocaleDateString('vi-VN')}</S.Td>
                    <S.Td>{history.serviceType}</S.Td>
                    <S.Td>{history.description}</S.Td>
                    <S.Td>{history.vehicle?.vin || 'N/A'}</S.Td>
                    <S.Td>{history.part?.name || 'N/A'}</S.Td>
                    <S.Td><S.Button small onClick={() => openEditForm(history)}><FaEdit /> Sửa</S.Button></S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
            {/* Pagination controls can be added here */}
          </S.TableContainer>
        )}

        <HistoryFormModal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleCreateOrUpdate} 
          history={selectedHistory} 
          vehicles={vehicles}
          parts={parts}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default ServiceHistoryManagement;
