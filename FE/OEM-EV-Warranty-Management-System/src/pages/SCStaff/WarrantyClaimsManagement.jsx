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

// Simplified vehicle selection modal for new claims
const VehicleSelectionModal = ({ isOpen, onClose, vehicles, installedParts, onVehicleSelect, onInstalledPartSelect, fetchInstalledPartsForVehicle }) => {
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
      onVehicleSelect(selectedVehicleId);
      onInstalledPartSelect(selectedInstalledPartId);
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
    handleFilterChange, handleCreateOrUpdate, handlePageChange, fetchInstalledPartsForVehicle
  } = useWarrantyClaimsManagement();

  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  const [showWarrantyForm, setShowWarrantyForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedInstalledPartId, setSelectedInstalledPartId] = useState(null);

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

  const handleVehicleSelected = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleInstalledPartSelected = (installedPartId) => {
    setSelectedInstalledPartId(installedPartId);
    setShowVehicleSelection(false);
    setShowWarrantyForm(true);
  };

  const handleClaimSuccess = (response) => {
    setShowWarrantyForm(false);
    setSelectedVehicleId(null);
    setSelectedInstalledPartId(null);
    // Refresh claims list
    window.location.reload();
  };

  const handleClaimCancel = () => {
    setShowWarrantyForm(false);
    setSelectedVehicleId(null);
    setSelectedInstalledPartId(null);
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
                      <S.Button small onClick={() => navigate(`/scstaff/warranty-claims/${claim.warrantyClaimId}`)}>
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
          onVehicleSelect={handleVehicleSelected}
          onInstalledPartSelect={handleInstalledPartSelected}
          fetchInstalledPartsForVehicle={fetchInstalledPartsForVehicle}
        />

        {/* Paid Warranty Claim Form Modal */}
        {showWarrantyForm && (
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
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default WarrantyClaimsManagement;
