import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarrantyClaimsManagement } from '../../hooks/useWarrantyClaimsManagement';
import PaidWarrantyClaimForm from '../../components/PaidWarrantyClaimForm';
import * as S from './WarrantyClaimsManagement.styles';
import { FaClipboardList, FaPlus, FaEdit, FaSearch, FaArrowLeft, FaSpinner, FaEye } from 'react-icons/fa';
import styled from 'styled-components';

// Modal wrapper for the PaidWarrantyClaimForm
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalWrapper = styled.div`
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s;
  color: #666;

  &:hover {
    background: white;
    color: #333;
    transform: scale(1.1);
  }
`;

// Claim Detail Modal
const ClaimDetailModal = ({ isOpen, onClose, claim }) => {
  if (!isOpen || !claim) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Chi tiết Yêu cầu Bảo hành #{claim.warrantyClaimId}</h2>
        <div style={{ marginTop: '20px' }}>
          <p><strong>Trạng thái:</strong> {claim.status}</p>
          <p><strong>Ngày tạo:</strong> {new Date(claim.claimDate).toLocaleDateString('vi-VN')}</p>
          <p><strong>Khách hàng:</strong> {claim.customerName || 'N/A'}</p>
          <p><strong>Xe (VIN):</strong> {claim.vehicleVin || 'N/A'}</p>
          <p><strong>Linh kiện:</strong> {claim.partName || 'N/A'}</p>
          <p><strong>Loại bảo hành:</strong> {claim.isPaidWarranty ? 'Tính phí' : 'Miễn phí'}</p>
          {claim.isPaidWarranty && claim.warrantyFee && (
            <p><strong>Phí:</strong> {parseFloat(claim.warrantyFee).toLocaleString('vi-VN')} VNĐ</p>
          )}
          <p><strong>Mô tả:</strong> {claim.description || 'N/A'}</p>
          {claim.rejectionReason && (
            <p style={{ color: '#f44336' }}><strong>Lý do từ chối:</strong> {claim.rejectionReason}</p>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <S.Button onClick={onClose}>Đóng</S.Button>
        </div>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Simplified vehicle selection modal for new claims
const VehicleSelectionModal = ({ isOpen, onClose, vehicles, installedParts, onSelect, fetchInstalledPartsForVehicle }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedInstalledPartId, setSelectedInstalledPartId] = useState('');

  const handleVehicleChange = (e) => {
    const vehicleId = e.target.value;
    setSelectedVehicleId(vehicleId);
    setSelectedInstalledPartId('');
    if (vehicleId) {
      fetchInstalledPartsForVehicle(vehicleId);
    }
  };

  const handleNext = () => {
    if (selectedVehicleId && selectedInstalledPartId) {
      // Pass both IDs at once to avoid async state update issues
      onSelect(selectedVehicleId, selectedInstalledPartId);
      onClose();
    } else {
      alert('Vui lòng chọn xe và linh kiện');
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <h2>Chọn Xe và Linh Kiện</h2>
        <S.FormGroup>
          <S.Label>Xe *</S.Label>
          <S.Select value={selectedVehicleId} onChange={handleVehicleChange}>
            <option value="">Chọn xe</option>
            {vehicles.map(v => (
              <option key={v.vehicleId} value={v.vehicleId}>
                {v.vehicleName} ({v.vehicleVin})
              </option>
            ))}
          </S.Select>
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>Linh kiện đã lắp đặt *</S.Label>
          <S.Select
            value={selectedInstalledPartId}
            onChange={(e) => setSelectedInstalledPartId(e.target.value)}
            disabled={!selectedVehicleId}
          >
            <option value="">Chọn linh kiện</option>
            {installedParts.map(p => (
              <option key={p.installedPartId} value={p.installedPartId}>
                {p.partName} (Lắp đặt: {p.installationDate})
              </option>
            ))}
          </S.Select>
        </S.FormGroup>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <S.Button type="button" onClick={onClose}>Hủy</S.Button>
          <S.Button primary type="button" onClick={handleNext}>Tiếp tục</S.Button>
        </div>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

// Main Page Component
const WarrantyClaimsManagement = () => {
  const navigate = useNavigate();
  const {
    claims, vehicles, parts, installedParts, loading, error, pagination, filterStatus, prefilledVehicle,
    handleFilterChange, handleCreateOrUpdate, handlePageChange, fetchInstalledPartsForVehicle, fetchClaims
  } = useWarrantyClaimsManagement();

  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  const [showWarrantyForm, setShowWarrantyForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedInstalledPartId, setSelectedInstalledPartId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  // Debug state changes
  useEffect(() => {
    console.log('[WarrantyClaimsManagement] State changed:', {
      showVehicleSelection,
      showWarrantyForm,
      selectedVehicleId,
      selectedInstalledPartId
    });
  }, [showVehicleSelection, showWarrantyForm, selectedVehicleId, selectedInstalledPartId]);

  // Auto-open form if prefilled vehicle is provided
  useEffect(() => {
    if (prefilledVehicle) {
      setSelectedVehicleId(prefilledVehicle.vehicleId);
      fetchInstalledPartsForVehicle(prefilledVehicle.vehicleId);
      setShowVehicleSelection(true);
    }
  }, [prefilledVehicle]);

  const openCreateForm = () => {
    setShowVehicleSelection(true);
  };

  const handleVehicleAndPartSelected = (vehicleId, installedPartId) => {
    console.log('[WarrantyClaimsManagement] handleVehicleAndPartSelected called with:', { vehicleId, installedPartId });
    // Set both IDs at once
    setSelectedVehicleId(vehicleId);
    setSelectedInstalledPartId(installedPartId);
    setShowVehicleSelection(false);
    setShowWarrantyForm(true);
    console.log('[WarrantyClaimsManagement] State updated - showWarrantyForm:', true);
  };

  const handleClaimSuccess = async (response) => {
    console.log('Claim created successfully:', response);
    setShowWarrantyForm(false);
    setSelectedVehicleId(null);
    setSelectedInstalledPartId(null);
    // Refresh claims list
    await fetchClaims();
  };

  const handleClaimCancel = () => {
    setShowWarrantyForm(false);
    setSelectedVehicleId(null);
    setSelectedInstalledPartId(null);
  };

  const handleViewClaim = (claim) => {
    console.log('[WarrantyClaimsManagement] View claim:', claim);
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedClaim(null);
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
              <option value="SUBMITTED">Tiếp nhận</option>
              <option value="PENDING_PAYMENT">Chờ thanh toán</option>
              <option value="PAYMENT_CONFIRMED">Đã xác nhận thanh toán</option>
              <option value="MANAGER_REVIEW">Manager đang xem xét</option>
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
                  <S.Th>Loại BH</S.Th>
                  <S.Th>Phí</S.Th>
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
                    <S.Td>
                      {claim.isPaidWarranty ? (
                        <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Tính phí</span>
                      ) : (
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Miễn phí</span>
                      )}
                    </S.Td>
                    <S.Td>
                      {claim.isPaidWarranty && claim.warrantyFee ? (
                        <span style={{ color: '#ff6f00', fontWeight: 'bold' }}>
                          {parseFloat(claim.warrantyFee).toLocaleString('vi-VN')} VNĐ
                        </span>
                      ) : (
                        '-'
                      )}
                    </S.Td>
                    <S.Td>{claim.status}</S.Td>
                    <S.Td>{new Date(claim.claimDate).toLocaleDateString()}</S.Td>
                    <S.Td>
                      <S.Button $small onClick={() => handleViewClaim(claim)}>
                        <FaEye /> Xem
                      </S.Button>
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
            {/* Pagination controls can be added here */}
          </S.TableContainer>
        )}

        {/* Vehicle Selection Modal */}
        <VehicleSelectionModal
          isOpen={showVehicleSelection}
          onClose={() => {
            setShowVehicleSelection(false);
            setSelectedVehicleId(null);
            setSelectedInstalledPartId(null);
          }}
          vehicles={vehicles}
          installedParts={installedParts}
          onSelect={handleVehicleAndPartSelected}
          fetchInstalledPartsForVehicle={fetchInstalledPartsForVehicle}
        />

        {/* Paid Warranty Claim Form Modal */}
        {showWarrantyForm && selectedVehicleId && selectedInstalledPartId && (
          <ModalOverlay>
            <ModalWrapper>
              <CloseButton onClick={handleClaimCancel}>×</CloseButton>
              <PaidWarrantyClaimForm
                vehicleId={selectedVehicleId}
                installedPartId={selectedInstalledPartId}
                onSuccess={handleClaimSuccess}
                onCancel={handleClaimCancel}
              />
            </ModalWrapper>
          </ModalOverlay>
        )}

        {/* Claim Detail Modal */}
        <ClaimDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          claim={selectedClaim}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default WarrantyClaimsManagement;
