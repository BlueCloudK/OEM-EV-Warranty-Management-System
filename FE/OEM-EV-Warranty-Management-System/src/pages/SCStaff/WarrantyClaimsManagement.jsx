import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarrantyClaimsManagement } from '../../hooks/useWarrantyClaimsManagement';
import * as S from './WarrantyClaimsManagement.styles';
import { FaClipboardList, FaPlus, FaEdit, FaSearch, FaArrowLeft, FaSpinner, FaEye } from 'react-icons/fa';

// Form Modal Component
const ClaimFormModal = ({ isOpen, onClose, onSubmit, claim, vehicles, parts, prefilledVehicle }) => {
  const [formData, setFormData] = useState({ description: '', partId: '', vehicleId: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (claim) {
        setFormData({ description: claim.description, partId: claim.part.id, vehicleId: claim.vehicle.id });
      } else if (prefilledVehicle) {
        setFormData({ description: `Yêu cầu cho xe ${prefilledVehicle.vehicleName}`, partId: '', vehicleId: prefilledVehicle.vehicleId });
      } else {
        setFormData({ description: '', partId: '', vehicleId: '' });
      }
      setErrors({});
    }
  }, [claim, prefilledVehicle, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.description) newErrors.description = 'Mô tả là bắt buộc';
    if (!formData.vehicleId) newErrors.vehicleId = 'Phải chọn xe';
    if (!formData.partId) newErrors.partId = 'Phải chọn linh kiện';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const { success, message } = await onSubmit(formData, claim?.id);
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
        <h2>{claim ? 'Chỉnh sửa Yêu cầu' : 'Tạo Yêu cầu mới'}</h2>
        <form onSubmit={handleSubmit}>
          {errors.general && <S.ErrorText>{errors.general}</S.ErrorText>}
          <S.FormGroup>
            <S.Label>Xe *</S.Label>
            <S.Select name="vehicleId" value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} hasError={!!errors.vehicleId} disabled={!!prefilledVehicle}>
              <option value="">Chọn xe</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleName} ({v.vin})</option>)}
            </S.Select>
            {errors.vehicleId && <S.ErrorText>{errors.vehicleId}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Linh kiện *</S.Label>
            <S.Select name="partId" value={formData.partId} onChange={(e) => setFormData({ ...formData, partId: e.target.value })} hasError={!!errors.partId}>
              <option value="">Chọn linh kiện</option>
              {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </S.Select>
            {errors.partId && <S.ErrorText>{errors.partId}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Mô tả vấn đề *</S.Label>
            <S.TextArea name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} hasError={!!errors.description} rows={4} />
            {errors.description && <S.ErrorText>{errors.description}</S.ErrorText>}
          </S.FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button primary type="submit">{claim ? 'Cập nhật' : 'Tạo mới'}</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component
const WarrantyClaimsManagement = () => {
  const navigate = useNavigate();
  const {
    claims, vehicles, parts, loading, error, pagination, filterStatus, prefilledVehicle,
    handleFilterChange, handleCreateOrUpdate, handlePageChange
  } = useWarrantyClaimsManagement();

  const [showForm, setShowForm] = useState(!!prefilledVehicle);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const openCreateForm = () => {
    setSelectedClaim(null);
    setShowForm(true);
  };

  const openEditForm = (claim) => {
    setSelectedClaim(claim);
    setShowForm(true);
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaClipboardList /> Quản lý Yêu cầu Bảo hành</S.HeaderTitle>
            <S.Button primary onClick={openCreateForm}><FaPlus /> Tạo Yêu cầu</S.Button>
          </S.HeaderTop>
          <S.FilterContainer>
            <S.Select value={filterStatus} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="SUBMITTED">Chờ duyệt</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="REJECTED">Từ chối</option>
            </S.Select>
          </S.FilterContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : claims.length === 0 ? (
          <S.EmptyState><h3>Không có yêu cầu bảo hành nào</h3></S.EmptyState>
        ) : (
          <S.TableContainer>
            <S.Table>
              <thead><tr><S.Th>ID</S.Th><S.Th>Mô tả</S.Th><S.Th>Xe</S.Th><S.Th>Linh kiện</S.Th><S.Th>Trạng thái</S.Th><S.Th>Thao tác</S.Th></tr></thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim.id}>
                    <S.Td>{claim.id}</S.Td>
                    <S.Td>{claim.description}</S.Td>
                    <S.Td>{claim.vehicle?.vin || 'N/A'}</S.Td>
                    <S.Td>{claim.part?.name || 'N/A'}</S.Td>
                    <S.Td>{claim.status}</S.Td>
                    <S.Td><S.Button small onClick={() => openEditForm(claim)}><FaEdit /> Sửa</S.Button></S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
            {/* Pagination controls can be added here */}
          </S.TableContainer>
        )}

        <ClaimFormModal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleCreateOrUpdate} 
          claim={selectedClaim} 
          vehicles={vehicles}
          parts={parts}
          prefilledVehicle={prefilledVehicle}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default WarrantyClaimsManagement;
