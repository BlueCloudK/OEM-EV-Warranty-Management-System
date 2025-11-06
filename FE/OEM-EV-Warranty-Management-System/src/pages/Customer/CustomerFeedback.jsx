import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api/customerApi';
import * as S from './CustomerFeedback.styles';
import {
  FaCommentDots, FaSpinner, FaArrowLeft, FaInfoCircle, FaStar,
  FaEdit, FaTrash, FaPlus, FaCalendar, FaShieldAlt, FaCheckCircle
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
        comments: feedback.comment || '' // Backend uses 'comment' not 'comments'
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
                  {warrantyClaims.map((claim) => {
                    const vehicleName = claim.vehicle?.vehicleName || claim.vehicleName;
                    const vin = claim.vehicle?.vehicleVin || claim.vehicle?.vin || claim.vehicleVin;
                    const displayName = vehicleName || vin || `Claim #${claim.warrantyClaimId}`;

                    return (
                      <option key={claim.warrantyClaimId} value={claim.warrantyClaimId}>
                        Yêu cầu #{claim.warrantyClaimId} - {displayName}
                      </option>
                    );
                  })}
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
  const [customerId, setCustomerId] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [warrantyClaims, setWarrantyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Get customerId from localStorage or fetch from profile API
  useEffect(() => {
    const initializeCustomerId = async () => {
      try {
        const storedCustomerId = localStorage.getItem('customerId');
        if (storedCustomerId) {
          console.log("✅ CustomerId from localStorage:", storedCustomerId);
          setCustomerId(storedCustomerId);
        } else {
          // Fetch from profile API if not in localStorage
          console.log("⚠️ CustomerId not in localStorage, fetching from profile API...");
          const profile = await customerApi.getMyProfile();
          const fetchedCustomerId = profile?.customerId || profile?.customer?.customerId;

          if (fetchedCustomerId) {
            console.log("✅ CustomerId from profile API:", fetchedCustomerId);
            localStorage.setItem('customerId', fetchedCustomerId);
            setCustomerId(fetchedCustomerId);
          } else {
            console.error("❌ CustomerId not found in profile:", profile);
            setError("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.");
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching customerId:", err);
        setError("Không thể tải thông tin khách hàng. Vui lòng đăng nhập lại.");
        setLoading(false);
      }
    };

    initializeCustomerId();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching data with customerId:", customerId);

      if (!customerId) {
        console.error("No customer ID available");
        setError("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const [feedbacksResponse, claimsResponse] = await Promise.all([
        customerApi.getMyFeedbacks(customerId, { page: 0, size: 100 }),
        customerApi.getMyWarrantyClaims({ page: 0, size: 100 })
      ]);

      if (feedbacksResponse && feedbacksResponse.content) {
        console.log("✅ Feedbacks loaded:", feedbacksResponse.content);
        console.log("📋 First feedback sample:", feedbacksResponse.content[0]);
        setFeedbacks(feedbacksResponse.content);
      } else if (Array.isArray(feedbacksResponse)) {
        console.log("✅ Feedbacks loaded (array):", feedbacksResponse);
        setFeedbacks(feedbacksResponse);
      } else {
        console.log("⚠️ No feedbacks found");
        setFeedbacks([]);
      }

      if (claimsResponse && claimsResponse.content) {
        // Get all completed claims
        const completedClaims = claimsResponse.content.filter(c => c.status === 'COMPLETED');

        // Get list of claim IDs that already have feedback
        const feedbackClaimIds = new Set(
          (feedbacksResponse?.content || feedbacksResponse || []).map(f =>
            f.warrantyClaim?.warrantyClaimId || f.warrantyClaimId
          )
        );

        // Only show completed claims that DON'T have feedback yet
        const claimsWithoutFeedback = completedClaims.filter(claim =>
          !feedbackClaimIds.has(claim.warrantyClaimId)
        );

        console.log("📊 Completed claims:", completedClaims.length);
        console.log("📝 Claims with feedback:", feedbackClaimIds.size);
        console.log("✅ Claims available for feedback:", claimsWithoutFeedback.length);

        setWarrantyClaims(claimsWithoutFeedback);
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
    if (!await window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      // Backend tự lấy username từ JWT token, không cần customerId
      await customerApi.deleteFeedback(feedbackId);
      setSuccess('Xóa phản hồi thành công!');
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      setSuccess(null);

      if (selectedFeedback) {
        // When updating, include the original warrantyClaimId
        const warrantyClaimId = selectedFeedback.warrantyClaim?.warrantyClaimId ||
                               selectedFeedback.warrantyClaimId;

        console.log("📝 Updating feedback:", {
          feedbackId: selectedFeedback.feedbackId,
          warrantyClaimId,
          rating: formData.rating,
          comment: formData.comments
        });

        // Backend tự lấy username từ JWT token, không cần customerId
        await customerApi.updateFeedback(selectedFeedback.feedbackId, {
          warrantyClaimId: warrantyClaimId,
          rating: formData.rating,
          comment: formData.comments // Backend uses 'comment' not 'comments'
        });
        setSuccess('Cập nhật phản hồi thành công!');
      } else {
        console.log("➕ Creating feedback:", {
          warrantyClaimId: formData.warrantyClaimId,
          rating: formData.rating,
          comment: formData.comments
        });

        // Backend tự lấy username từ JWT token, không cần customerId
        await customerApi.createFeedback({
          warrantyClaimId: parseInt(formData.warrantyClaimId),
          rating: formData.rating,
          comment: formData.comments // Backend uses 'comment' not 'comments'
        });
        setSuccess('Tạo phản hồi thành công!');
      }

      setShowModal(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Lỗi: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
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

        {success && (
          <S.SuccessMessage>
            <FaCheckCircle />
            {success}
          </S.SuccessMessage>
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
            {feedbacks.map((feedback) => {
              // Extract claim and vehicle info with fallbacks
              const claimId = feedback.warrantyClaim?.warrantyClaimId || feedback.warrantyClaimId;
              const vehicleName = feedback.warrantyClaim?.vehicle?.vehicleName ||
                                 feedback.warrantyClaim?.vehicleName ||
                                 feedback.vehicleName;
              const vehicleVin = feedback.warrantyClaim?.vehicle?.vehicleVin ||
                                feedback.warrantyClaim?.vehicle?.vin ||
                                feedback.warrantyClaim?.vehicleVin ||
                                feedback.vehicleVin;

              return (
                <S.FeedbackCard key={feedback.feedbackId}>
                  <S.FeedbackHeader>
                    <S.FeedbackInfo>
                      <S.FeedbackTitle>
                        <FaShieldAlt /> Yêu cầu bảo hành #{claimId || 'N/A'}
                      </S.FeedbackTitle>
                      {(vehicleName || vehicleVin) && (
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                          Xe: {vehicleName || vehicleVin}
                        </div>
                      )}
                      <S.FeedbackMeta>
                        <S.StarRating>{renderStars(feedback.rating)}</S.StarRating>
                        <span><FaCalendar /> {formatDate(feedback.createdAt)}</span>
                      </S.FeedbackMeta>
                    </S.FeedbackInfo>
                  </S.FeedbackHeader>

                  <S.FeedbackContent>
                    <S.FeedbackText>{feedback.comment || 'Không có nội dung'}</S.FeedbackText>
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
              );
            })}
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
