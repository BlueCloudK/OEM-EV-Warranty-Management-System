import React, { useState, useEffect } from 'react';
import * as S from './AdminFeedbackManagement.styles';
import {
  FaCommentDots, FaSpinner, FaStar, FaFilter, FaChartBar,
  FaUser, FaCar, FaShieldAlt, FaCalendar, FaTrash
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';

const AdminFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10
  });

  // Fetch statistics
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Fetch feedbacks when filter or page changes
  useEffect(() => {
    fetchFeedbacks();
  }, [filterRating, pagination.currentPage]);

  const fetchStatistics = async () => {
    try {
      const response = await apiClient('/api/feedbacks/statistics/summary');
      setStatistics(response);
      console.log('📊 Feedback statistics:', response);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/feedbacks';
      const params = new URLSearchParams({
        page: pagination.currentPage,
        size: pagination.pageSize,
        sortBy: 'createdAt',
        sortDir: 'DESC'
      });

      // Apply rating filter if not 'all'
      if (filterRating !== 'all') {
        url = `/api/feedbacks/by-rating/${filterRating}`;
      }

      const response = await apiClient(`${url}?${params}`);

      console.log('✅ Feedbacks loaded:', response);

      if (response.content) {
        setFeedbacks(response.content);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
      } else if (Array.isArray(response)) {
        setFeedbacks(response);
      } else {
        setFeedbacks([]);
      }
    } catch (err) {
      console.error('❌ Error fetching feedbacks:', err);
      setError(err.message || 'Không thể tải dữ liệu feedback');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId, customerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa feedback này?')) {
      return;
    }

    try {
      await apiClient(`/api/feedbacks/${feedbackId}?customerId=${customerId}`, {
        method: 'DELETE'
      });

      alert('Xóa feedback thành công!');
      await fetchFeedbacks();
      await fetchStatistics();
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleFilterChange = (rating) => {
    setFilterRating(rating);
    setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        style={{
          color: i < rating ? '#fbbf24' : '#d1d5db',
          fontSize: '18px'
        }}
      />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <S.PageContainer>
      <S.Header>
        <S.HeaderTitle>
          <FaCommentDots /> Quản lý Feedback
        </S.HeaderTitle>
        <S.HeaderSubtitle>
          Xem và quản lý phản hồi từ khách hàng
        </S.HeaderSubtitle>
      </S.Header>

      {/* Statistics Section */}
      {statistics && (
        <S.StatisticsSection>
          <S.StatCard>
            <S.StatIcon style={{ color: '#fbbf24' }}>
              <FaChartBar />
            </S.StatIcon>
            <div>
              <S.StatLabel>Đánh giá trung bình</S.StatLabel>
              <S.StatValue>
                {statistics.averageRating?.toFixed(1) || '0.0'} / 5.0
              </S.StatValue>
            </div>
          </S.StatCard>

          {statistics.ratingCounts && Object.entries(statistics.ratingCounts).map(([rating, count]) => (
            <S.StatCard key={rating}>
              <S.StatIcon style={{ color: '#8b5cf6' }}>
                <FaStar />
              </S.StatIcon>
              <div>
                <S.StatLabel>{rating} sao</S.StatLabel>
                <S.StatValue>{count} phản hồi</S.StatValue>
              </div>
            </S.StatCard>
          ))}
        </S.StatisticsSection>
      )}

      {/* Filter Section */}
      <S.FilterSection>
        <S.FilterLabel>
          <FaFilter /> Lọc theo đánh giá:
        </S.FilterLabel>
        <S.FilterButtons>
          <S.FilterButton
            $active={filterRating === 'all'}
            onClick={() => handleFilterChange('all')}
          >
            Tất cả
          </S.FilterButton>
          {[5, 4, 3, 2, 1].map(rating => (
            <S.FilterButton
              key={rating}
              $active={filterRating === rating.toString()}
              onClick={() => handleFilterChange(rating.toString())}
            >
              {rating} <FaStar style={{ fontSize: '12px' }} />
            </S.FilterButton>
          ))}
        </S.FilterButtons>
      </S.FilterSection>

      {/* Feedbacks List */}
      {loading ? (
        <S.LoadingState>
          <FaSpinner />
          <p>Đang tải feedback...</p>
        </S.LoadingState>
      ) : error ? (
        <S.ErrorState>{error}</S.ErrorState>
      ) : feedbacks.length === 0 ? (
        <S.EmptyState>
          <FaCommentDots />
          <h3>Không có feedback nào</h3>
          <p>Chưa có phản hồi nào từ khách hàng.</p>
        </S.EmptyState>
      ) : (
        <>
          <S.FeedbacksGrid>
            {feedbacks.map((feedback) => {
              const claimId = feedback.warrantyClaim?.warrantyClaimId || feedback.warrantyClaimId;
              const customerName = feedback.customer?.customerName || feedback.customerName || 'N/A';
              const customerId = feedback.customer?.customerId || feedback.customerId;
              const vehicleName = feedback.warrantyClaim?.vehicle?.vehicleName ||
                                 feedback.warrantyClaim?.vehicleName ||
                                 feedback.vehicleName;
              const vehicleVin = feedback.warrantyClaim?.vehicle?.vehicleVin ||
                                feedback.warrantyClaim?.vehicleVin ||
                                feedback.vehicleVin;

              return (
                <S.FeedbackCard key={feedback.feedbackId}>
                  <S.FeedbackHeader>
                    <S.FeedbackInfo>
                      <S.FeedbackTitle>
                        <FaUser /> {customerName}
                      </S.FeedbackTitle>
                      <S.FeedbackMeta>
                        <span>
                          <FaShieldAlt /> Claim #{claimId || 'N/A'}
                        </span>
                        {(vehicleName || vehicleVin) && (
                          <span>
                            <FaCar /> {vehicleName || vehicleVin}
                          </span>
                        )}
                        <span>
                          <FaCalendar /> {formatDate(feedback.createdAt)}
                        </span>
                      </S.FeedbackMeta>
                    </S.FeedbackInfo>
                    <S.RatingDisplay>
                      {renderStars(feedback.rating)}
                    </S.RatingDisplay>
                  </S.FeedbackHeader>

                  <S.FeedbackContent>
                    <S.FeedbackText>
                      {feedback.comment || 'Không có nội dung'}
                    </S.FeedbackText>
                  </S.FeedbackContent>

                  <S.FeedbackActions>
                    <S.DeleteButton onClick={() => handleDelete(feedback.feedbackId, customerId)}>
                      <FaTrash /> Xóa
                    </S.DeleteButton>
                  </S.FeedbackActions>
                </S.FeedbackCard>
              );
            })}
          </S.FeedbacksGrid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <S.PaginationContainer>
              <S.PaginationButton
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
              >
                ← Trước
              </S.PaginationButton>

              <S.PaginationInfo>
                Trang {pagination.currentPage + 1} / {pagination.totalPages}
                {' '}({pagination.totalElements} feedback)
              </S.PaginationInfo>

              <S.PaginationButton
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
              >
                Sau →
              </S.PaginationButton>
            </S.PaginationContainer>
          )}
        </>
      )}
    </S.PageContainer>
  );
};

export default AdminFeedbackManagement;
