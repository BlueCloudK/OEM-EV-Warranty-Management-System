import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes, FaSpinner } from 'react-icons/fa';
import * as S from './FeedbackModal.styles';
import { customerApi } from '../api/customerApi';

const FeedbackModal = ({ isOpen, onClose, claim, existingFeedback, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating || 0);
      setComment(existingFeedback.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
    setError(null);
  }, [existingFeedback, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const feedbackData = {
        warrantyClaimId: claim.warrantyClaimId,
        rating,
        comment: comment.trim() || null,
      };

      if (existingFeedback) {
        // Update existing feedback
        await customerApi.updateFeedback(existingFeedback.feedbackId, feedbackData);
      } else {
        // Create new feedback
        await customerApi.createFeedback(feedbackData);
      }

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
      onClose();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <div>
            <S.ModalTitle>
              {existingFeedback ? 'Cập nhật đánh giá' : 'Đánh giá dịch vụ bảo hành'}
            </S.ModalTitle>
            <S.ModalSubtitle>Yêu cầu #{claim.warrantyClaimId}</S.ModalSubtitle>
          </div>
          <S.CloseButton onClick={onClose}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <form onSubmit={handleSubmit}>
            <S.FormGroup>
              <S.Label>Đánh giá của bạn *</S.Label>
              <S.StarContainer>
                {[1, 2, 3, 4, 5].map((star) => (
                  <S.StarButton
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    $filled={star <= (hoveredRating || rating)}
                  >
                    <FaStar />
                  </S.StarButton>
                ))}
              </S.StarContainer>
              <S.RatingText>
                {rating === 0 && 'Chọn số sao để đánh giá'}
                {rating === 1 && 'Rất không hài lòng'}
                {rating === 2 && 'Không hài lòng'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Hài lòng'}
                {rating === 5 && 'Rất hài lòng'}
              </S.RatingText>
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>Nhận xét (tùy chọn)</S.Label>
              <S.TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ bảo hành..."
                rows={4}
                maxLength={1000}
              />
              <S.CharCount>{comment.length}/1000</S.CharCount>
            </S.FormGroup>

            {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

            <S.ButtonGroup>
              <S.CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </S.CancelButton>
              <S.SubmitButton type="submit" disabled={isSubmitting || rating === 0}>
                {isSubmitting ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Đang gửi...
                  </>
                ) : existingFeedback ? (
                  'Cập nhật'
                ) : (
                  'Gửi đánh giá'
                )}
              </S.SubmitButton>
            </S.ButtonGroup>
          </form>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default FeedbackModal;
