import React, { useState } from 'react';
import { useAdminWarrantyClaims } from '../../hooks/useAdminWarrantyClaims';
import RefreshIndicator from '../../components/RefreshIndicator';
import * as S from './AdminWarrantyClaimsManagement.styles';
import { FaClipboardCheck, FaSpinner, FaCheck, FaTimes, FaTrash, FaSyncAlt, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

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
    handleFilterChange, handleApprove, handleReject, handleDelete, handlePageChange, refreshClaims,
    confirmDialog,
    lastUpdated, autoRefreshing, getTimeAgo,
    sortConfig, handleSort
  } = useAdminWarrantyClaims();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  // Function to convert status to Vietnamese
  const getStatusLabel = (status) => {
    const statusMap = {
      'SUBMITTED': 'Chờ duyệt',
      'PENDING_PAYMENT': 'Chờ thanh toán',
      'PAYMENT_CONFIRMED': 'Đã xác nhận thanh toán',
      'MANAGER_REVIEW': 'Đã duyệt',
      'PROCESSING': 'Đang xử lý',
      'COMPLETED': 'Hoàn thành',
      'REJECTED': 'Từ chối'
    };
    return statusMap[status] || status;
  };

  const openRejectModal = (claim) => {
    setSelectedClaim(claim);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (reason) => {
    if (!selectedClaim) return;
    return await handleReject(selectedClaim.warrantyClaimId, reason);
  };

  const isPollingActive = claims.some(c => c.status === 'SUBMITTED' || c.status === 'MANAGER_REVIEW');

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort style={{ color: '#ccc', marginLeft: '5px' }} />;
    if (sortConfig.direction === 'ASC') return <FaSortUp style={{ color: '#3498db', marginLeft: '5px' }} />;
    return <FaSortDown style={{ color: '#3498db', marginLeft: '5px' }} />;
  };

  return (
    <S.PageContainer>
      <S.Header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <S.HeaderTitle style={{ fontSize: '28px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <FaClipboardCheck /> Duyệt Yêu cầu Bảo hành (Admin)
          </S.HeaderTitle>
          <RefreshIndicator
            lastUpdated={lastUpdated}
            autoRefreshing={autoRefreshing}
            getTimeAgo={getTimeAgo}
            isPollingActive={isPollingActive}
          />
        </div>
        <S.FilterContainer style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <S.Select value={filterStatus} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="SUBMITTED">Chờ duyệt</option>
            <option value="PENDING_PAYMENT">Chờ thanh toán</option>
            <option value="PAYMENT_CONFIRMED">Đã xác nhận thanh toán</option>
            <option value="MANAGER_REVIEW">Đã duyệt</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="REJECTED">Từ chối</option>
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
                <S.Th onClick={() => handleSort('warrantyClaimId')} style={{ cursor: 'pointer' }}>
                  ID {renderSortIcon('warrantyClaimId')}
                </S.Th>
                <S.Th>Khách hàng</S.Th>
                <S.Th onClick={() => handleSort('vehicleVin')} style={{ cursor: 'pointer' }}>
                  Xe (VIN) {renderSortIcon('vehicleVin')}
                </S.Th>
                <S.Th onClick={() => handleSort('partName')} style={{ cursor: 'pointer' }}>
                  Linh kiện {renderSortIcon('partName')}
                </S.Th>
                <S.Th>Mô tả</S.Th>
                <S.Th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Trạng thái {renderSortIcon('status')}
                </S.Th>
                <S.Th onClick={() => handleSort('claimDate')} style={{ cursor: 'pointer' }}>
                  Ngày yêu cầu {renderSortIcon('claimDate')}
                </S.Th>
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
                  <S.Td><S.StatusBadge $status={claim.status}>{getStatusLabel(claim.status)}</S.StatusBadge></S.Td>
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
              (Tổng: {pagination.totalElements} yêu cầu)
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

      <RejectClaimModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleRejectSubmit}
      />
      {confirmDialog}
    </S.PageContainer>
  );
};

export default AdminWarrantyClaimsManagement;
