import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomerWarrantyHistory } from '../../hooks/useCustomerWarrantyHistory';
import * as S from './WarrantyHistory.styles';
import {
  FaShieldAlt, FaClock, FaCalendar, FaSpinner, FaArrowLeft,
  FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaHourglassHalf,
  FaFileAlt, FaWrench
} from 'react-icons/fa';

const WarrantyHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    warrantyRequests, loading: dataLoading, error, pagination, handlePageChange
  } = useCustomerWarrantyHistory();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (error) {
      return 'Không xác định';
    }
  };

  const getStatusInfo = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return { color: '#22c55e', bgColor: '#d1fae5', icon: <FaCheckCircle />, text: 'Hoàn thành' };
      case 'PROCESSING':
        return { color: '#f59e0b', bgColor: '#fef3c7', icon: <FaHourglassHalf />, text: 'Đang xử lý' };
      case 'SUBMITTED':
        return { color: '#6b7280', bgColor: '#e2e8f0', icon: <FaClock />, text: 'Chờ xử lý' };
      case 'REJECTED':
        return { color: '#ef4444', bgColor: '#fee2e2', icon: <FaTimesCircle />, text: 'Từ chối' };
      default:
        return { color: '#6b7280', bgColor: '#e2e8f0', icon: <FaExclamationCircle />, text: status || 'Không rõ' };
    }
  };

  if (authLoading || dataLoading) {
    return (
      <S.LoadingState>
        <div>
          <FaSpinner />
          <p>Đang tải lịch sử bảo hành...</p>
        </div>
      </S.LoadingState>
    );
  }

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.BackButton onClick={() => navigate('/customer/dashboard')}><FaArrowLeft /> Quay lại</S.BackButton>
            <div>
              <S.HeaderTitle><FaShieldAlt /> Lịch sử Bảo hành</S.HeaderTitle>
              <S.HeaderSubtitle>Theo dõi tất cả các yêu cầu bảo hành đã gửi.</S.HeaderSubtitle>
            </div>
            <S.StatsContainer>
              <S.StatBadge>{pagination.totalElements} yêu cầu</S.StatBadge>
              {pagination.totalPages > 1 && (
                <S.StatBadge>Trang {pagination.pageNumber + 1}/{pagination.totalPages}</S.StatBadge>
              )}
            </S.StatsContainer>
          </S.HeaderTop>
        </S.Header>

        {error && (
          <S.ErrorMessage>{error}</S.ErrorMessage>
        )}

        {warrantyRequests.length === 0 ? (
          <S.EmptyState>
            <FaShieldAlt style={{ fontSize: '5rem', marginBottom: '20px', opacity: '0.5' }} />
            <h3>Chưa có yêu cầu bảo hành</h3>
            <p>Tất cả các yêu cầu bảo hành của bạn sẽ được hiển thị tại đây.</p>
            <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>Lưu ý: Bạn cần đến trung tâm dịch vụ để tạo yêu cầu bảo hành mới.</p>
          </S.EmptyState>
        ) : (
          <S.ClaimsGrid>
            {warrantyRequests.map((request, index) => {
              const statusInfo = getStatusInfo(request.status);
              return (
                <S.ClaimCard key={request.warrantyClaimId || index} style={{ animationDelay: `${index * 0.1}s` }}>
                  <S.ClaimHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FaShieldAlt style={{ fontSize: '2rem', color: '#4facfe' }} />
                      <div>
                        <S.ClaimTitle>{`Yêu cầu #${request.warrantyClaimId}`}</S.ClaimTitle>
                        <S.ClaimSubtitle>{request.vehicle?.vehicleName} ({request.vehicle?.vin})</S.ClaimSubtitle>
                      </div>
                    </div>
                    <S.StatusBadge $color={statusInfo.color} $bgColor={statusInfo.bgColor}>
                      {statusInfo.icon} {statusInfo.text}
                    </S.StatusBadge>
                  </S.ClaimHeader>

                  <S.ClaimDetails>
                    <S.DetailSection>
                      <S.DetailTitle><FaFileAlt /> Mô tả vấn đề</S.DetailTitle>
                      <S.DetailText>{request.description || 'Không có mô tả'}</S.DetailText>
                    </S.DetailSection>

                    <S.InfoGrid>
                      <S.InfoItem>
                        <S.DetailTitle><FaCalendar /> Thông tin thời gian</S.DetailTitle>
                        <div>
                          <span>Ngày tạo: </span><strong>{formatDate(request.claimDate)}</strong>
                        </div>
                        {request.resolutionDate && (
                          <div>
                            <span>Hoàn thành: </span><strong style={{ color: '#22c55e' }}>{formatDate(request.resolutionDate)}</strong>
                          </div>
                        )}
                      </S.InfoItem>
                      <S.InfoItem>
                        <S.DetailTitle><FaWrench /> Thông tin xử lý</S.DetailTitle>
                        <div>
                          <span>Trung tâm: </span><strong>{request.serviceCenter?.name || 'Chưa cập nhật'}</strong>
                        </div>
                      </S.InfoItem>
                    </S.InfoGrid>

                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <S.RejectionReasonContainer>
                        <div><FaTimesCircle /><span>Lý do từ chối</span></div>
                        <p>{request.rejectionReason}</p>
                      </S.RejectionReasonContainer>
                    )}
                  </S.ClaimDetails>
                </S.ClaimCard>
              );
            })}
          </S.ClaimsGrid>
        )}

        {pagination.totalPages > 1 && (
          <S.PaginationContainer>
            <S.PageButton onClick={() => handlePageChange(pagination.pageNumber - 1)} $disabled={pagination.pageNumber === 0}>← Trước</S.PageButton>
            <S.PageInfo>Trang {pagination.pageNumber + 1} / {pagination.totalPages}</S.PageInfo>
            <S.PageButton onClick={() => handlePageChange(pagination.pageNumber + 1)} $disabled={pagination.pageNumber >= pagination.totalPages - 1}>Sau →</S.PageButton>
          </S.PaginationContainer>
        )}
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default WarrantyHistory;
