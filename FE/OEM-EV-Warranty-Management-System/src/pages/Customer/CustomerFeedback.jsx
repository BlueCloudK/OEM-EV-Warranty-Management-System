import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api/customerApi';
import * as S from './CustomerFeedback.styles';
import {
  FaCommentDots, FaSpinner, FaArrowLeft, FaInfoCircle, FaStar,
  FaEdit, FaTrash, FaPlus, FaCalendar, FaShieldAlt
} from 'react-icons/fa';

const FeedbackModal = ({ isOpen, onClose, feedback, onSubmit, warrantyClaims }) => {
  const [formData, setFormData] = useState({
    warrantyClaimId: '',
    rating: 5,
    comments: ''
  });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (feedback) {
      setFormData({
        warrantyClaimId: feedback.warrantyClaim?.warrantyClaimId || '',
        rating: feedback.rating || 5,
        comments: feedback.comments || ''
      });
    } else {
      setFormData({
        warrantyClaimId: '',
        rating: 5,
        comments: ''
      });
    }
  }, [feedback]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.comments.trim()) {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }
    if (!feedback && !formData.warrantyClaimId) {
      alert('Vui lòng chọn yêu cầu bảo hành');
      return;
    }
    onSubmit(formData);
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <S.Star
        key={star}
        type="button"
        $filled={star <= (hoverRating || formData.rating)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setFormData({ ...formData, rating: star })}
      >
        <FaStar />
      </S.Star>
    ));
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <h2>
            <FaCommentDots />
            {feedback ? 'Chỉnh sửa phản hồi' : 'Tạo phản hồi mới'}
          </h2>
          <S.CloseButton onClick={onClose}>×</S.CloseButton>
        </S.ModalHeader>

        <form onSubmit={handleSubmit}>
          <S.ModalBody>
            {!feedback && (
              <S.FormGroup>
                <S.Label>Yêu cầu bảo hành *</S.Label>
                <S.Select
                  value={formData.warrantyClaimId}
                  onChange={(e) => setFormData({ ...formData, warrantyClaimId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn yêu cầu bảo hành --</option>
                  {warrantyClaims.map((claim) => (
                    <option key={claim.warrantyClaimId} value={claim.warrantyClaimId}>
                      Yêu cầu #{claim.warrantyClaimId} - {claim.vehicle?.vehicleName || claim.vehicle?.vin}
                    </option>
                  ))}
                </S.Select>
              </S.FormGroup>
            )}

            <S.FormGroup>
              <S.Label>Đánh giá *</S.Label>
              <S.RatingSelector>
                {renderStars()}
              </S.RatingSelector>
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>Nội dung phản hồi *</S.Label>
              <S.TextArea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Nhập nội dung phản hồi của bạn..."
                required
              />
            </S.FormGroup>
          </S.ModalBody>

          <S.ModalFooter>
            <S.Button type="button" onClick={onClose}>Hủy</S.Button>
            <S.Button type="submit" $primary>
              {feedback ? 'Cập nhật' : 'Gửi phản hồi'}
            </S.Button>
          </S.ModalFooter>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

const CustomerFeedback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [warrantyClaims, setWarrantyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [feedbacksResponse, claimsResponse] = await Promise.all([
        customerApi.getMyFeedbacks(user?.customerId, { page: 0, size: 100 }),
        customerApi.getMyWarrantyClaims({ page: 0, size: 100 })
      ]);

      if (feedbacksResponse && feedbacksResponse.content) {
        setFeedbacks(feedbacksResponse.content);
      } else if (Array.isArray(feedbacksResponse)) {
        setFeedbacks(feedbacksResponse);
      } else {
        setFeedbacks([]);
      }

      if (claimsResponse && claimsResponse.content) {
        // Only show completed claims that don't have feedback yet
        const completedClaims = claimsResponse.content.filter(c => c.status === 'COMPLETED');
        setWarrantyClaims(completedClaims);
      } else {
        setWarrantyClaims([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Không thể tải dữ liệu.");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedFeedback(null);
    setShowModal(true);
  };

  const handleEdit = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) {
      return;
    }

    try {
      await customerApi.deleteFeedback(feedbackId);
      await fetchData();
    } catch (err) {
      alert(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedFeedback) {
        await customerApi.updateFeedback(selectedFeedback.feedbackId, {
          rating: formData.rating,
          comments: formData.comments
        });
      } else {
        await customerApi.createFeedback({
          warrantyClaimId: parseInt(formData.warrantyClaimId),
          rating: formData.rating,
          comments: formData.comments
        });
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      alert(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} style={{ color: i < rating ? '#fbbf24' : '#d1d5db' }} />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <S.PageContainer>
        <S.LoadingState>
          <div>
            <FaSpinner />
            <p>Đang tải phản hồi...</p>
          </div>
        </S.LoadingState>
      </S.PageContainer>
    );
  }

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderTop>
            <S.BackButton onClick={() => navigate('/customer/dashboard')}>
              <FaArrowLeft /> Quay lại
            </S.BackButton>
            <div>
              <S.HeaderTitle><FaCommentDots /> Phản hồi của tôi</S.HeaderTitle>
              <S.HeaderSubtitle>Quản lý phản hồi về dịch vụ bảo hành</S.HeaderSubtitle>
            </div>
            <S.CreateButton onClick={handleCreate}>
              <FaPlus /> Tạo phản hồi mới
            </S.CreateButton>
          </S.HeaderTop>
        </S.Header>

        {error && (
          <S.ErrorMessage>
            <FaInfoCircle />
            {error}
          </S.ErrorMessage>
        )}

        {feedbacks.length === 0 ? (
          <S.EmptyState>
            <FaCommentDots />
            <h3>Chưa có phản hồi nào</h3>
            <p>Bạn chưa gửi phản hồi nào về dịch vụ bảo hành.</p>
            <p style={{ fontSize: '14px', marginTop: '16px' }}>
              Nhấn nút "Tạo phản hồi mới" để gửi phản hồi của bạn.
            </p>
          </S.EmptyState>
        ) : (
          <S.FeedbacksGrid>
            {feedbacks.map((feedback) => (
              <S.FeedbackCard key={feedback.feedbackId}>
                <S.FeedbackHeader>
                  <S.FeedbackInfo>
                    <S.FeedbackTitle>
                      <FaShieldAlt /> Yêu cầu bảo hành #{feedback.warrantyClaim?.warrantyClaimId}
                    </S.FeedbackTitle>
                    <S.FeedbackMeta>
                      <S.StarRating>{renderStars(feedback.rating)}</S.StarRating>
                      <span><FaCalendar /> {formatDate(feedback.feedbackDate)}</span>
                    </S.FeedbackMeta>
                  </S.FeedbackInfo>
                </S.FeedbackHeader>

                <S.FeedbackContent>
                  <S.FeedbackText>{feedback.comments}</S.FeedbackText>
                </S.FeedbackContent>

                <S.FeedbackActions>
                  <S.ActionButton onClick={() => handleEdit(feedback)}>
                    <FaEdit /> Chỉnh sửa
                  </S.ActionButton>
                  <S.ActionButton $danger onClick={() => handleDelete(feedback.feedbackId)}>
                    <FaTrash /> Xóa
                  </S.ActionButton>
                </S.FeedbackActions>
              </S.FeedbackCard>
            ))}
          </S.FeedbacksGrid>
        )}

        <FeedbackModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          feedback={selectedFeedback}
          onSubmit={handleSubmit}
          warrantyClaims={warrantyClaims}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default CustomerFeedback;
