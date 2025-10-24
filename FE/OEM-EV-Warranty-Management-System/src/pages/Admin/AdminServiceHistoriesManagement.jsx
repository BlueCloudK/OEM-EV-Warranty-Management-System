import React, { useState, useEffect } from 'react';
import { useAdminServiceHistoriesManagement } from '../../hooks/useAdminServiceHistoriesManagement';
import * as S from './AdminServiceHistoriesManagement.styles';
import { FaHistory, FaSpinner, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

const ServiceHistoryFormModal = ({ isOpen, onClose, onSubmit, history }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (history) {
        // Format serviceDate to YYYY-MM-DD for date input
        // Handle timezone offset to prevent date shifting
        let formattedDate;
        if (history.serviceDate) {
          const date = new Date(history.serviceDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        } else {
          formattedDate = new Date().toISOString().slice(0, 10);
        }

        setFormData({
          vehicleId: history.vehicleId || '',
          description: history.description || '',
          serviceDate: formattedDate,
          serviceType: history.serviceType || 'INSPECTION',
          partId: history.partId || ''
        });
      } else {
        setFormData({
          vehicleId: '',
          description: '',
          serviceDate: new Date().toISOString().slice(0, 10),
          serviceType: 'INSPECTION',
          partId: ''
        });
      }
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
        <h2>{history ? 'Chỉnh sửa Lịch sử Dịch vụ' : 'Tạo Lịch sử Dịch vụ'}</h2>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label>ID Xe *</S.Label>
            <S.Input
              name="vehicleId"
              type="number"
              value={formData.vehicleId || ''}
              onChange={handleInputChange}
              required
            />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Loại dịch vụ *</S.Label>
            <S.Select
              name="serviceType"
              value={formData.serviceType || 'INSPECTION'}
              onChange={handleInputChange}
              required
            >
              <option value="INSPECTION">INSPECTION</option>
              <option value="REPAIR">REPAIR</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="REPLACEMENT">REPLACEMENT</option>
            </S.Select>
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>ID Phụ tùng *</S.Label>
            <S.Input
              name="partId"
              type="text"
              value={formData.partId || ''}
              onChange={handleInputChange}
              required
              placeholder="VD: PART-001"
            />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Mô tả *</S.Label>
            <S.TextArea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              required
              rows={4}
            />
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Ngày dịch vụ *</S.Label>
            <S.Input
              name="serviceDate"
              type="date"
              value={formData.serviceDate || ''}
              onChange={handleInputChange}
              required
            />
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

const AdminServiceHistoriesManagement = () => {
  const {
    serviceHistories, loading, error, pagination, searchTerm, setSearchTerm,
    searchType, setSearchType, dateRange, setDateRange, handleSearch, handleClearSearch, handleCreateOrUpdate, handleDelete, handlePageChange
  } = useAdminServiceHistoriesManagement();

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
            <S.HeaderTitle><FaHistory /> Lịch sử Dịch vụ (Admin)</S.HeaderTitle>
            <S.Button primary onClick={openCreateForm}><FaPlus /> Tạo mới</S.Button>
          </S.HeaderTop>
          <S.SearchContainer>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="general">Tìm chung</option>
              <option value="vehicle">VIN</option>
              <option value="part">ID Phụ tùng</option>
              <option value="dateRange">Khoảng thời gian</option>
            </select>
            {searchType === 'dateRange' ? (
              <>
                <S.Input
                  type="date"
                  placeholder="Từ ngày"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <S.Input
                  type="date"
                  placeholder="Đến ngày"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </>
            ) : (
              <S.Input
                type={searchType === 'vehicle' ? 'number' : 'text'}
                placeholder={searchType === 'general' ? 'Tìm kiếm...' : searchType === 'vehicle' ? 'Nhập ID Xe (số)...' : 'Nhập ID Phụ tùng...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            )}
            <S.Button small onClick={handleSearch}><FaSearch /> Tìm kiếm</S.Button>
            {(searchTerm || dateRange.startDate || dateRange.endDate) && (
              <S.Button small onClick={handleClearSearch}><FaTimes /> Xóa</S.Button>
            )}
          </S.SearchContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : serviceHistories.length === 0 ? (
          <S.EmptyState><h3>Không có lịch sử dịch vụ nào.</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead>
                <tr>
                  <S.Th>ID</S.Th>
                  <S.Th>Xe (VIN)</S.Th>
                  <S.Th>Tên xe</S.Th>
                  <S.Th>Loại dịch vụ</S.Th>
                  <S.Th>Phụ tùng</S.Th>
                  <S.Th>Mô tả</S.Th>
                  <S.Th>Ngày dịch vụ</S.Th>
                  <S.Th>Thao tác</S.Th>
                </tr>
              </thead>
              <tbody>
                {serviceHistories.map(history => (
                  <tr key={history.serviceHistoryId}>
                    <S.Td>{history.serviceHistoryId}</S.Td>
                    <S.Td>{history.vehicleVin || 'N/A'}</S.Td>
                    <S.Td>{history.vehicleName || 'N/A'}</S.Td>
                    <S.Td>{history.serviceType || 'N/A'}</S.Td>
                    <S.Td>{history.partName ? `${history.partName} (${history.partId})` : history.partId || 'N/A'}</S.Td>
                    <S.Td>{history.description}</S.Td>
                    <S.Td>{new Date(history.serviceDate).toLocaleDateString()}</S.Td>
                    <S.Td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <S.Button small onClick={() => openEditForm(history)}><FaEdit /></S.Button>
                        <S.Button small danger onClick={() => handleDelete(history.serviceHistoryId)}><FaTrash /></S.Button>
                      </div>
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
            {/* Pagination controls can be added here */}
          </S.TableContainer>
        )}

        <ServiceHistoryFormModal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleCreateOrUpdate} 
          history={selectedHistory} 
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default AdminServiceHistoriesManagement;
