import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomerWarrantyHistory } from '../../hooks/useCustomerWarrantyHistory';
import FeedbackModal from '../../components/FeedbackModal';
import { customerApi } from '../../api/customerApi';
import * as S from './WarrantyHistory.styles';
import {
  FaShieldAlt, FaClock, FaCalendar, FaSpinner, FaArrowLeft,
  FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaHourglassHalf,
  FaFileAlt, FaWrench, FaSort, FaSortUp, FaSortDown, FaStar, FaEdit
} from 'react-icons/fa';

const WarrantyHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    warrantyRequests, loading: dataLoading, error, pagination, sortConfig, handlePageChange, handleSort, refetch
  } = useCustomerWarrantyHistory();

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [loadingFeedbacks, setLoadingFeedbacks] = useState({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch feedback details for claims that have feedback
  useEffect(() => {
    const fetchFeedbacks = async () => {
      const claimsWithFeedback = warrantyRequests.filter(req => req.hasFeedback);

      for (const claim of claimsWithFeedback) {
        if (!feedbacks[claim.warrantyClaimId] && !loadingFeedbacks[claim.warrantyClaimId]) {
          setLoadingFeedbacks(prev => ({ ...prev, [claim.warrantyClaimId]: true }));
          try {
            const feedback = await customerApi.getFeedbackByClaim(claim.warrantyClaimId);
            setFeedbacks(prev => ({ ...prev, [claim.warrantyClaimId]: feedback }));
          } catch (err) {
            console.error(`Error fetching feedback for claim ${claim.warrantyClaimId}:`, err);
          } finally {
            setLoadingFeedbacks(prev => ({ ...prev, [claim.warrantyClaimId]: false }));
          }
        }
      }
    };

    if (warrantyRequests.length > 0) {
      fetchFeedbacks();
    }
  }, [warrantyRequests]);

  const handleOpenFeedbackModal = (claim) => {
    setSelectedClaim(claim);
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setSelectedClaim(null);
  };

  const handleFeedbackSubmitted = () => {
    // Refetch warranty history to update hasFeedback status
    if (refetch) {
      refetch();
    }
    // Clear cached feedback for this claim so it gets refetched
    if (selectedClaim) {
      setFeedbacks(prev => {
        const updated = { ...prev };
        delete updated[selectedClaim.warrantyClaimId];
        return updated;
      });
    }
  };

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

          <S.SortContainer>
            <span style={{ fontSize: '0.9rem', color: '#718096' }}>Sắp xếp:</span>
            <S.SortButton onClick={() => handleSort('claimDate')} active={sortConfig.sortBy === 'claimDate'}>
              Ngày tạo {sortConfig.sortBy === 'claimDate' && (sortConfig.sortDir === 'ASC' ? <FaSortUp /> : <FaSortDown />)}
              {sortConfig.sortBy !== 'claimDate' && <FaSort />}
            </S.SortButton>
            <S.SortButton onClick={() => handleSort('status')} active={sortConfig.sortBy === 'status'}>
              Trạng thái {sortConfig.sortBy === 'status' && (sortConfig.sortDir === 'ASC' ? <FaSortUp /> : <FaSortDown />)}
              {sortConfig.sortBy !== 'status' && <FaSort />}
            </S.SortButton>
          </S.SortContainer>
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
                          <span>Trung tâm: </span><strong>{request.serviceCenterName || 'Chưa phân công'}</strong>
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          <span>Đánh giá: </span>
                          <strong style={{ color: request.hasFeedback ? '#22c55e' : '#f59e0b' }}>
                            {request.hasFeedback ? '✓ Đã đánh giá' : '⏱ Chưa đánh giá'}
                          </strong>
                        </div>
                      </S.InfoItem>
                    </S.InfoGrid>

                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <S.RejectionReasonContainer>
                        <div><FaTimesCircle /><span>Lý do từ chối</span></div>
                        <p>{request.rejectionReason}</p>
                      </S.RejectionReasonContainer>
                    )}

                    {/* Feedback Section */}
                    {request.status === 'COMPLETED' && (
                      <S.FeedbackSection>
                        {request.hasFeedback ? (
                          feedbacks[request.warrantyClaimId] ? (
                            <S.FeedbackDisplay>
                              <S.FeedbackHeader>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FaStar style={{ color: '#fbbf24' }} />
                                  <span style={{ fontWeight: '600', color: '#1f2937' }}>Đánh giá của bạn</span>
                                </div>
                                <S.EditFeedbackButton onClick={() => handleOpenFeedbackModal(request)}>
                                  <FaEdit /> Chỉnh sửa
                                </S.EditFeedbackButton>
                              </S.FeedbackHeader>
                              <S.FeedbackRating>
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    style={{
                                      color: i < feedbacks[request.warrantyClaimId].rating ? '#fbbf24' : '#d1d5db',
                                      fontSize: '1.2rem'
                                    }}
                                  />
                                ))}
                                <span style={{ marginLeft: '8px', fontWeight: '600', color: '#374151' }}>
                                  {feedbacks[request.warrantyClaimId].rating}/5
                                </span>
                              </S.FeedbackRating>
                              {feedbacks[request.warrantyClaimId].comment && (
                                <S.FeedbackComment>
                                  <strong>Nhận xét:</strong> {feedbacks[request.warrantyClaimId].comment}
                                </S.FeedbackComment>
                              )}
                              <S.FeedbackDate>
                                Đánh giá lúc: {formatDate(feedbacks[request.warrantyClaimId].createdAt)}
                              </S.FeedbackDate>
                            </S.FeedbackDisplay>
                          ) : (
                            <S.FeedbackLoading>
                              <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                              <span>Đang tải đánh giá...</span>
                            </S.FeedbackLoading>
                          )
                        ) : (
                          <S.FeedbackPrompt>
                            <div>
                              <FaStar style={{ color: '#fbbf24', fontSize: '1.5rem', marginBottom: '8px' }} />
                              <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#1f2937' }}>
                                Dịch vụ đã hoàn thành
                              </p>
                              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                                Chia sẻ trải nghiệm của bạn để giúp chúng tôi cải thiện dịch vụ
                              </p>
                            </div>
                            <S.RateButton onClick={() => handleOpenFeedbackModal(request)}>
                              <FaStar /> Đánh giá ngay
                            </S.RateButton>
                          </S.FeedbackPrompt>
                        )}
                      </S.FeedbackSection>
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

      {/* Feedback Modal */}
      {selectedClaim && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={handleCloseFeedbackModal}
          claim={selectedClaim}
          existingFeedback={feedbacks[selectedClaim.warrantyClaimId]}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </S.PageContainer>
  );
};

export default WarrantyHistory;
