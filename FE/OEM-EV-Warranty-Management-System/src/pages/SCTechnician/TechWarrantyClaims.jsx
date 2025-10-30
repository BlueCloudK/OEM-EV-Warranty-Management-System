import React, { useState, useEffect, useCallback } from 'react';
import { dataApi } from '../../api/dataApi';
import * as S from './TechWarrantyClaims.styles';
import { FaClipboardList, FaSpinner, FaEye, FaPlay, FaCheckCircle, FaFilter } from 'react-icons/fa';

const ClaimDetailModal = ({ isOpen, onClose, claim, onStartProcessing, onComplete }) => {
  const [completionNote, setCompletionNote] = useState('');
  const [startNote, setStartNote] = useState('');
  const [showStartForm, setShowStartForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  if (!isOpen || !claim) return null;

  const handleStart = async () => {
    const result = await onStartProcessing(claim.warrantyClaimId, startNote);
    if (result.success) {
      setShowStartForm(false);
      setStartNote('');
      onClose();
    }
  };

  const handleComplete = async () => {
    if (!completionNote.trim()) {
      alert('Vui lòng nhập ghi chú hoàn thành');
      return;
    }
    const result = await onComplete(claim.warrantyClaimId, completionNote);
    if (result.success) {
      setShowCompleteForm(false);
      setCompletionNote('');
      onClose();
    }
  };

  const canStart = claim.status === 'MANAGER_REVIEW';
  const canComplete = claim.status === 'PROCESSING';

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <h2>Chi tiết Yêu cầu Bảo hành #{claim.warrantyClaimId}</h2>
          <S.CloseButton onClick={onClose}>×</S.CloseButton>
        </S.ModalHeader>

        <S.DetailGrid>
          <S.DetailItem>
            <S.DetailLabel>Trạng thái:</S.DetailLabel>
            <S.StatusBadge $status={claim.status}>{claim.status}</S.StatusBadge>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Ngày tạo:</S.DetailLabel>
            <S.DetailValue>{claim.claimDate ? new Date(claim.claimDate).toLocaleDateString('vi-VN') : 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Khách hàng:</S.DetailLabel>
            <S.DetailValue>{claim.customerName || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Xe (VIN):</S.DetailLabel>
            <S.DetailValue>{claim.vehicleVin || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Phụ tùng:</S.DetailLabel>
            <S.DetailValue>{claim.installedPartName || claim.installedPartId || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem>
            <S.DetailLabel>Loại vấn đề:</S.DetailLabel>
            <S.DetailValue>{claim.issueType || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          <S.DetailItem $fullWidth>
            <S.DetailLabel>Mô tả:</S.DetailLabel>
            <S.DetailValue>{claim.description || 'N/A'}</S.DetailValue>
          </S.DetailItem>
          {claim.rejectionReason && (
            <S.DetailItem $fullWidth>
              <S.DetailLabel>Lý do từ chối:</S.DetailLabel>
              <S.DetailValue style={{ color: '#ef4444' }}>{claim.rejectionReason}</S.DetailValue>
            </S.DetailItem>
          )}
        </S.DetailGrid>

        <S.ModalFooter>
          {!showStartForm && !showCompleteForm && (
            <>
              {canStart && (
                <S.Button primary onClick={() => setShowStartForm(true)}>
                  <FaPlay /> Bắt đầu xử lý
                </S.Button>
              )}
              {canComplete && (
                <S.Button primary onClick={() => setShowCompleteForm(true)}>
                  <FaCheckCircle /> Hoàn thành
                </S.Button>
              )}
              <S.Button onClick={onClose}>Đóng</S.Button>
            </>
          )}

          {showStartForm && (
            <>
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <S.Label>Ghi chú bắt đầu (tùy chọn):</S.Label>
                <S.TextArea
                  value={startNote}
                  onChange={(e) => setStartNote(e.target.value)}
                  placeholder="Nhập ghi chú về việc bắt đầu xử lý..."
                  rows={3}
                />
              </div>
              <S.Button primary onClick={handleStart}>
                <FaPlay /> Xác nhận bắt đầu
              </S.Button>
              <S.Button onClick={() => setShowStartForm(false)}>Hủy</S.Button>
            </>
          )}

          {showCompleteForm && (
            <>
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <S.Label>Ghi chú hoàn thành *:</S.Label>
                <S.TextArea
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  placeholder="Nhập ghi chú về kết quả xử lý..."
                  rows={4}
                  required
                />
              </div>
              <S.Button primary onClick={handleComplete}>
                <FaCheckCircle /> Xác nhận hoàn thành
              </S.Button>
              <S.Button onClick={() => setShowCompleteForm(false)}>Hủy</S.Button>
            </>
          )}
        </S.ModalFooter>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

const TechWarrantyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 0, pageSize: 10, totalPages: 0, totalElements: 0 });
  const [filterStatus, setFilterStatus] = useState('pending'); // pending, all, MANAGER_REVIEW, PROCESSING, COMPLETED
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
      };

      let response;
      if (filterStatus === 'pending') {
        // Get tech pending claims (MANAGER_REVIEW or PROCESSING)
        response = await dataApi.getTechPendingClaims(params);
      } else if (filterStatus === 'all') {
        // Get all claims by status (using by-status endpoint with all statuses)
        response = await dataApi.getClaimsByStatus('MANAGER_REVIEW', params);
        const processingResponse = await dataApi.getClaimsByStatus('PROCESSING', params);
        const completedResponse = await dataApi.getClaimsByStatus('COMPLETED', params);
        // Merge all responses
        response = {
          content: [...(response.content || []), ...(processingResponse.content || []), ...(completedResponse.content || [])],
          totalPages: Math.max(response.totalPages, processingResponse.totalPages, completedResponse.totalPages),
          totalElements: (response.totalElements || 0) + (processingResponse.totalElements || 0) + (completedResponse.totalElements || 0)
        };
      } else {
        // Get by specific status
        response = await dataApi.getClaimsByStatus(filterStatus, params);
      }

      if (response && response.content) {
        setClaims(response.content);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.error("Error fetching warranty claims:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách yêu cầu bảo hành.");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filterStatus]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handleStartProcessing = async (claimId, note) => {
    try {
      await dataApi.techStartClaim(claimId, note);
      await fetchClaims();
      return { success: true };
    } catch (err) {
      console.error('Error starting claim:', err);
      alert(`Lỗi: ${err.response?.data?.message || err.message}`);
      return { success: false };
    }
  };

  const handleComplete = async (claimId, completionNote) => {
    try {
      await dataApi.techCompleteClaim(claimId, completionNote);
      await fetchClaims();
      return { success: true };
    } catch (err) {
      console.error('Error completing claim:', err);
      alert(`Lỗi: ${err.response?.data?.message || err.message}`);
      return { success: false };
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const openDetailModal = (claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'MANAGER_REVIEW': return '#f59e0b';
      case 'PROCESSING': return '#3b82f6';
      case 'COMPLETED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.HeaderTitle><FaClipboardList /> Yêu cầu Bảo hành</S.HeaderTitle>
          </S.HeaderTop>
          <S.FilterContainer>
            <FaFilter />
            <span>Lọc:</span>
            <S.FilterButton
              $active={filterStatus === 'pending'}
              onClick={() => handleFilterChange('pending')}
            >
              Cần xử lý
            </S.FilterButton>
            <S.FilterButton
              $active={filterStatus === 'MANAGER_REVIEW'}
              onClick={() => handleFilterChange('MANAGER_REVIEW')}
            >
              Chờ xử lý
            </S.FilterButton>
            <S.FilterButton
              $active={filterStatus === 'PROCESSING'}
              onClick={() => handleFilterChange('PROCESSING')}
            >
              Đang xử lý
            </S.FilterButton>
            <S.FilterButton
              $active={filterStatus === 'COMPLETED'}
              onClick={() => handleFilterChange('COMPLETED')}
            >
              Hoàn thành
            </S.FilterButton>
            <S.FilterButton
              $active={filterStatus === 'all'}
              onClick={() => handleFilterChange('all')}
            >
              Tất cả
            </S.FilterButton>
          </S.FilterContainer>
        </S.Header>

        {loading ? (
          <S.LoadingState><FaSpinner /> <p>Đang tải...</p></S.LoadingState>
        ) : error ? (
          <S.EmptyState>{error}</S.EmptyState>
        ) : claims.length === 0 ? (
          <S.EmptyState><h3>Không có yêu cầu bảo hành nào.</h3></S.EmptyState>
        ) : (
          <>
            <S.TableContainer>
              <S.Table>
                <thead>
                  <tr>
                    <S.Th>ID</S.Th>
                    <S.Th>Khách hàng</S.Th>
                    <S.Th>Xe (VIN)</S.Th>
                    <S.Th>Phụ tùng</S.Th>
                    <S.Th>Loại vấn đề</S.Th>
                    <S.Th>Ngày tạo</S.Th>
                    <S.Th>Trạng thái</S.Th>
                    <S.Th>Thao tác</S.Th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(claim => (
                    <tr key={claim.warrantyClaimId}>
                      <S.Td>{claim.warrantyClaimId}</S.Td>
                      <S.Td>{claim.customerName || 'N/A'}</S.Td>
                      <S.Td>{claim.vehicleVin || 'N/A'}</S.Td>
                      <S.Td>{claim.installedPartName || claim.installedPartId || 'N/A'}</S.Td>
                      <S.Td>{claim.issueType || 'N/A'}</S.Td>
                      <S.Td>{claim.claimDate ? new Date(claim.claimDate).toLocaleDateString('vi-VN') : 'N/A'}</S.Td>
                      <S.Td>
                        <S.StatusBadge $status={claim.status}>
                          {claim.status}
                        </S.StatusBadge>
                      </S.Td>
                      <S.Td>
                        <S.Button small onClick={() => openDetailModal(claim)}>
                          <FaEye /> Chi tiết
                        </S.Button>
                      </S.Td>
                    </tr>
                  ))}
                </tbody>
              </S.Table>
            </S.TableContainer>
            {pagination.totalPages > 1 && (
              <S.PaginationContainer>
                <S.Button
                  small
                  disabled={pagination.currentPage === 0}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Trước
                </S.Button>
                <S.PageInfo>
                  Trang {pagination.currentPage + 1} / {pagination.totalPages}
                  ({pagination.totalElements} bản ghi)
                </S.PageInfo>
                <S.Button
                  small
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Sau
                </S.Button>
              </S.PaginationContainer>
            )}
          </>
        )}

        <ClaimDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          claim={selectedClaim}
          onStartProcessing={handleStartProcessing}
          onComplete={handleComplete}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default TechWarrantyClaims;
