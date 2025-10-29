import React, { useState } from 'react';
import { useAdminWarrantyClaims } from '../../hooks/useAdminWarrantyClaims';
import * as S from './AdminWarrantyClaimsManagement.styles';
import { FaClipboardCheck, FaSpinner, FaCheck, FaTimes, FaTrash, FaSyncAlt } from 'react-icons/fa';

const RejectClaimModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    const { success } = await onSubmit(reason);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <h2>Nhập lý do từ chối</h2>
        <form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.TextArea 
              rows="4" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="Ví dụ: Hư hỏng do người dùng, không thuộc phạm vi bảo hành..."
            />
          </S.FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button $danger type="submit">Xác nhận Từ chối</S.Button>
          </div>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

const AdminWarrantyClaimsManagement = () => {
  const {
    claims, loading, error, pagination, filterStatus,
    handleFilterChange, handleApprove, handleReject, handleDelete, handlePageChange, refreshClaims
  } = useAdminWarrantyClaims();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const openRejectModal = (claim) => {
    setSelectedClaim(claim);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (reason) => {
    if (!selectedClaim) return;
    return await handleReject(selectedClaim.warrantyClaimId, reason);
  };

  return (
    <S.PageContainer>
      <S.Header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <S.HeaderTitle style={{ fontSize: '28px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <FaClipboardCheck /> Duyệt Yêu cầu Bảo hành (Admin)
        </S.HeaderTitle>
        <S.FilterContainer style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <S.Select value={filterStatus} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="SUBMITTED">Chờ duyệt (SUBMITTED)</option>
            <option value="MANAGER_REVIEW">Đã duyệt (MANAGER_REVIEW)</option>
            <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
            <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
            <option value="REJECTED">Từ chối (REJECTED)</option>
          </S.Select>
          <S.Button onClick={refreshClaims} disabled={loading} title="Làm mới dữ liệu">
            <FaSyncAlt style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Làm mới
          </S.Button>
        </S.FilterContainer>
      </S.Header>

      {loading ? (
        <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
      ) : error ? (
        <S.EmptyState>{error}</S.EmptyState>
      ) : claims.length === 0 ? (
        <S.EmptyState><h3>Không có yêu cầu nào.</h3></S.EmptyState>
      ) : (
        <S.TableContainer>
          <S.Table>
            <thead>
              <tr>
                <S.Th>ID</S.Th>
                <S.Th>Khách hàng</S.Th>
                <S.Th>Xe (VIN)</S.Th>
                <S.Th>Linh kiện</S.Th>
                <S.Th>Mô tả</S.Th>
                <S.Th>Trạng thái</S.Th>
                <S.Th>Ngày yêu cầu</S.Th>
                <S.Th>Hành động</S.Th>
              </tr>
            </thead>
            <tbody>
              {claims.map(claim => (
                <tr key={claim.warrantyClaimId}>
                  <S.Td>{claim.warrantyClaimId}</S.Td>
                  <S.Td>{claim.customerName}</S.Td>
                  <S.Td>{claim.vehicleVin}</S.Td>
                  <S.Td>{claim.partName}</S.Td>
                  <S.Td>{claim.description}</S.Td>
                  <S.Td><S.StatusBadge $status={claim.status}>{claim.status}</S.StatusBadge></S.Td>
                  <S.Td>{new Date(claim.claimDate).toLocaleDateString()}</S.Td>
                  <S.Td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {claim.status === 'SUBMITTED' && (
                        <>
                          <S.Button $small $success onClick={() => handleApprove(claim.warrantyClaimId)}><FaCheck /> Duyệt</S.Button>
                          <S.Button $small $danger onClick={() => openRejectModal(claim)}><FaTimes /> Từ chối</S.Button>
                        </>
                      )}
                      <S.Button $small $danger onClick={() => handleDelete(claim.warrantyClaimId)}><FaTrash /></S.Button>
                    </div>
                  </S.Td>
                </tr>
              ))}
            </tbody>
          </S.Table>
          {/* Pagination controls can be added here */}
        </S.TableContainer>
      )}

      <RejectClaimModal 
        isOpen={showRejectModal} 
        onClose={() => setShowRejectModal(false)} 
        onSubmit={handleRejectSubmit} 
      />
    </S.PageContainer>
  );
};

export default AdminWarrantyClaimsManagement;
