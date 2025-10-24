import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarrantyClaimsManagement } from '../../hooks/useWarrantyClaimsManagement';
import * as S from './WarrantyClaimsManagement.styles';
import { FaClipboardList, FaPlus, FaEdit, FaSearch, FaArrowLeft, FaSpinner, FaEye } from 'react-icons/fa';

// Form Modal Component
const ClaimFormModal = ({ isOpen, onClose, onSubmit, claim, vehicles, parts, installedParts, prefilledVehicle, onVehicleChange }) => {
  const [formData, setFormData] = useState({ description: '', installedPartId: '', vehicleId: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (claim) {
        setFormData({ 
          description: claim.description, 
          installedPartId: claim.installedPartId, 
          vehicleId: claim.vehicleId 
        });
        onVehicleChange(claim.vehicleId);
      } else if (prefilledVehicle) {
        setFormData({ description: `Yêu cầu cho xe ${prefilledVehicle.vehicleName}`, installedPartId: '', vehicleId: prefilledVehicle.vehicleId });
        onVehicleChange(prefilledVehicle.vehicleId);
      } else {
        setFormData({ description: '', installedPartId: '', vehicleId: '' });
      }
      setErrors({});
    }
  }, [claim, prefilledVehicle, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.description) newErrors.description = 'Mô tả là bắt buộc';
    if (!formData.vehicleId) newErrors.vehicleId = 'Phải chọn xe';
    if (!formData.installedPartId) newErrors.installedPartId = 'Phải chọn linh kiện đã lắp đặt';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const { success, message } = await onSubmit(formData, claim?.warrantyClaimId);
    if (success) {
      onClose();
    } else {
      setErrors({ general: message });
    }
  };

  const handleVehicleChange = (e) => {
    const vehicleId = e.target.value;
    setFormData({ ...formData, vehicleId, installedPartId: '' }); // Reset installedPartId when vehicle changes
    onVehicleChange(vehicleId);
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
            <S.Select name="vehicleId" value={formData.vehicleId} onChange={handleVehicleChange} hasError={!!errors.vehicleId} disabled={!!prefilledVehicle || !!claim}>
              <option value="">Chọn xe</option>
              {vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.vehicleName} ({v.vehicleVin})</option>)} 
            </S.Select>
            {errors.vehicleId && <S.ErrorText>{errors.vehicleId}</S.ErrorText>}
          </S.FormGroup>
          <S.FormGroup>
            <S.Label>Linh kiện đã lắp đặt *</S.Label>
            <S.Select name="installedPartId" value={formData.installedPartId} onChange={(e) => setFormData({ ...formData, installedPartId: e.target.value })} hasError={!!errors.installedPartId} disabled={!formData.vehicleId || !!claim}>
              <option value="">Chọn linh kiện đã lắp đặt</option>
              {installedParts.map(p => <option key={p.installedPartId} value={p.installedPartId}>{p.partName} (Lắp đặt: {p.installationDate})</option>)} 
            </S.Select>
            {errors.installedPartId && <S.ErrorText>{errors.installedPartId}</S.ErrorText>}
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
    claims, vehicles, parts, installedParts, loading, error, pagination, filterStatus, prefilledVehicle,
    handleFilterChange, handleCreateOrUpdate, handlePageChange, fetchInstalledPartsForVehicle
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
              <thead>
                <tr>
                  <S.Th>ID</S.Th>
                  <S.Th>Khách hàng</S.Th>
                  <S.Th>Xe</S.Th>
                  <S.Th>Linh kiện</S.Th>
                  <S.Th>Trạng thái</S.Th>
                  <S.Th>Ngày yêu cầu</S.Th>
                  <S.Th>Thao tác</S.Th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim.warrantyClaimId}>
                    <S.Td>{claim.warrantyClaimId}</S.Td>
                    <S.Td>{claim.customerName}</S.Td>
                    <S.Td>{claim.vehicleVin}</S.Td>
                    <S.Td>{claim.partName}</S.Td>
                    <S.Td>{claim.status}</S.Td>
                    <S.Td>{new Date(claim.claimDate).toLocaleDateString()}</S.Td>
                    <S.Td>
                      <S.Button small onClick={() => openEditForm(claim)}>
                        <FaEdit /> Sửa
                      </S.Button>
                    </S.Td>
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
          installedParts={installedParts}
          prefilledVehicle={prefilledVehicle}
          onVehicleChange={fetchInstalledPartsForVehicle}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default WarrantyClaimsManagement;
