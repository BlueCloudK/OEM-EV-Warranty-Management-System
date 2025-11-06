package com.swp391.warrantymanagement.service.impl;

import java.util.Optional;
import com.swp391.warrantymanagement.dto.request.FeedbackRequestDTO;
import com.swp391.warrantymanagement.dto.response.FeedbackResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Feedback;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.FeedbackMapper;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.FeedbackRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Implementation của FeedbackService.
 * <p>
 * <strong>Business rules chính:</strong>
 * <ul>
 *     <li>Chỉ feedback cho claim có status = COMPLETED</li>
 *     <li>Verify ownership: Customer phải sở hữu vehicle của claim</li>
 *     <li>One-to-one: Mỗi claim chỉ có một feedback (tránh spam)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final WarrantyClaimRepository warrantyClaimRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    /**
     * Tạo feedback cho warranty claim đã hoàn thành.
     * <p>
     * <strong>Business rules:</strong>
     * <ul>
     *     <li>Claim phải có status = COMPLETED</li>
     *     <li>Customer phải sở hữu vehicle của claim (authorization check qua WarrantyClaim → Vehicle → Customer)</li>
     *     <li>Mỗi claim chỉ có một feedback (one-to-one constraint)</li>
     * </ul>
     *
     * @param requestDTO DTO chứa thông tin feedback (warrantyClaimId, rating, comment)
     * @param username Username của customer đang đăng nhập
     * @return FeedbackResponseDTO đã được tạo
     * @throws ResourceNotFoundException nếu claim, user, hoặc customer không tồn tại
     * @throws IllegalStateException nếu claim chưa COMPLETED hoặc đã có feedback
     * @throws IllegalArgumentException nếu customer không sở hữu vehicle
     */
    @Override
    @Transactional
    public FeedbackResponseDTO createFeedback(FeedbackRequestDTO requestDTO, String username) {
        WarrantyClaim warrantyClaim = warrantyClaimRepository.findById(requestDTO.getWarrantyClaimId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "WarrantyClaim", "id", requestDTO.getWarrantyClaimId()));

        // Chỉ feedback cho claim đã hoàn thành
        if (warrantyClaim.getStatus() != WarrantyClaimStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Cannot create feedback for claim that is not COMPLETED. Current status: " + warrantyClaim.getStatus());
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Customer customer = Optional.ofNullable(customerRepository.findByUser(user))
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user", username));

        // Authorization: Customer phải sở hữu vehicle của claim
        if (!warrantyClaim.getVehicle().getCustomer().equals(customer)) {
            throw new IllegalArgumentException(
                    "You are not authorized to provide feedback for this claim");
        }

        // One-to-one constraint: Mỗi claim chỉ có một feedback
        if (feedbackRepository.findByWarrantyClaimWarrantyClaimId(requestDTO.getWarrantyClaimId()).isPresent()) {
            throw new IllegalStateException(
                    "Feedback already exists for this warranty claim");
        }

        Feedback feedback = FeedbackMapper.toEntity(requestDTO, warrantyClaim, customer);
        Feedback savedFeedback = feedbackRepository.save(feedback);

        return FeedbackMapper.toResponseDTO(savedFeedback);
    }

    /**
     * Lấy thông tin feedback theo ID.
     *
     * @param feedbackId ID của feedback cần lấy
     * @return FeedbackResponseDTO chứa thông tin feedback
     * @throws ResourceNotFoundException nếu không tìm thấy feedback
     */
    @Override
    @Transactional(readOnly = true)
    public FeedbackResponseDTO getFeedbackById(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feedback not found with ID: " + feedbackId));
        return FeedbackMapper.toResponseDTO(feedback);
    }

    /**
     * Lấy feedback của warranty claim cụ thể (one-to-one relationship).
     *
     * @param warrantyClaimId ID của warranty claim
     * @return FeedbackResponseDTO của claim
     * @throws ResourceNotFoundException nếu claim chưa có feedback
     */
    @Override
    @Transactional(readOnly = true)
    public FeedbackResponseDTO getFeedbackByClaimId(Long warrantyClaimId) {
        Feedback feedback = feedbackRepository.findByWarrantyClaimWarrantyClaimId(warrantyClaimId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No feedback found for warranty claim ID: " + warrantyClaimId));
        return FeedbackMapper.toResponseDTO(feedback);
    }

    /**
     * Lấy danh sách feedback của customer với phân trang.
     *
     * @param customerId UUID của customer
     * @param pageable Thông tin phân trang (page, size, sort)
     * @return PagedResponse chứa danh sách feedback của customer
     * @throws ResourceNotFoundException nếu không tìm thấy customer
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FeedbackResponseDTO> getFeedbacksByCustomer(UUID customerId, Pageable pageable) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + customerId);
        }

        Page<Feedback> feedbackPage = feedbackRepository.findByCustomerCustomerId(customerId, pageable);

        return new PagedResponse<>(
                feedbackPage.getContent().stream()
                        .map(FeedbackMapper::toResponseDTO)
                        .toList(),
                feedbackPage.getNumber(),
                feedbackPage.getSize(),
                feedbackPage.getTotalElements(),
                feedbackPage.getTotalPages(),
                feedbackPage.isFirst(),
                feedbackPage.isLast()
        );
    }

    /**
     * Lấy tất cả feedback trong hệ thống với phân trang (admin dashboard).
     *
     * @param pageable Thông tin phân trang (page, size, sort)
     * @return PagedResponse chứa tất cả feedback
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FeedbackResponseDTO> getAllFeedbacks(Pageable pageable) {
        Page<Feedback> feedbackPage = feedbackRepository.findAll(pageable);
        return new PagedResponse<>(
                feedbackPage.getContent().stream()
                        .map(FeedbackMapper::toResponseDTO)
                        .toList(),
                feedbackPage.getNumber(),
                feedbackPage.getSize(),
                feedbackPage.getTotalElements(),
                feedbackPage.getTotalPages(),
                feedbackPage.isFirst(),
                feedbackPage.isLast()
        );
    }

    /**
     * Lấy feedback theo rating chính xác (1-5 sao).
     *
     * @param rating Giá trị rating (1-5)
     * @param pageable Thông tin phân trang
     * @return PagedResponse chứa danh sách feedback có rating chính xác
     * @throws IllegalStateException nếu rating không hợp lệ (< 1 hoặc > 5)
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FeedbackResponseDTO> getFeedbacksByRating(Integer rating, Pageable pageable) {
        if (rating < 1 || rating > 5) {
            throw new IllegalStateException("Rating must be between 1 and 5");
        }

        Page<Feedback> feedbackPage = feedbackRepository.findByRating(rating, pageable);

        return new PagedResponse<>(
                feedbackPage.getContent().stream()
                        .map(FeedbackMapper::toResponseDTO)
                        .toList(),
                feedbackPage.getNumber(),
                feedbackPage.getSize(),
                feedbackPage.getTotalElements(),
                feedbackPage.getTotalPages(),
                feedbackPage.isFirst(),
                feedbackPage.isLast()
        );
    }

    /**
     * Lấy feedback theo rating tối thiểu (>= minRating).
     *
     * @param rating Giá trị rating tối thiểu (1-5)
     * @param pageable Thông tin phân trang
     * @return PagedResponse chứa danh sách feedback có rating >= giá trị cho trước
     * @throws IllegalStateException nếu rating không hợp lệ (< 1 hoặc > 5)
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FeedbackResponseDTO> getFeedbacksByMinRating(Integer rating, Pageable pageable) {
        if (rating < 1 || rating > 5) {
            throw new IllegalStateException("Rating must be between 1 and 5");
        }

        Page<Feedback> feedbackPage = feedbackRepository.findByRatingGreaterThanEqual(rating, pageable);

        return new PagedResponse<>(
                feedbackPage.getContent().stream()
                        .map(FeedbackMapper::toResponseDTO)
                        .toList(),
                feedbackPage.getNumber(),
                feedbackPage.getSize(),
                feedbackPage.getTotalElements(),
                feedbackPage.getTotalPages(),
                feedbackPage.isFirst(),
                feedbackPage.isLast()
        );
    }

    /**
     * Cập nhật feedback (chỉ customer tạo feedback mới được update).
     * <p>
     * <strong>Authorization:</strong> Chỉ customer sở hữu feedback mới có quyền cập nhật.
     * warrantyClaimId không thể thay đổi (immutable).
     *
     * @param feedbackId ID của feedback cần update
     * @param requestDTO DTO chứa thông tin cập nhật (rating, comment)
     * @param username Username của customer đang đăng nhập
     * @return FeedbackResponseDTO đã cập nhật
     * @throws ResourceNotFoundException nếu không tìm thấy feedback, user, hoặc customer
     * @throws IllegalArgumentException nếu customer không sở hữu feedback
     */
    @Override
    @Transactional
    public FeedbackResponseDTO updateFeedback(Long feedbackId, FeedbackRequestDTO requestDTO, String username) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feedback not found with ID: " + feedbackId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Customer customer = Optional.ofNullable(customerRepository.findByUser(user))
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user", username));

        // Authorization: Chỉ customer sở hữu feedback mới được update
        if (!feedback.getCustomer().equals(customer)) {
            throw new IllegalArgumentException(
                    "You are not authorized to update this feedback");
        }

        FeedbackMapper.updateEntity(feedback, requestDTO);
        Feedback updatedFeedback = feedbackRepository.save(feedback);

        return FeedbackMapper.toResponseDTO(updatedFeedback);
    }

    /**
     * Xóa feedback (chỉ customer tạo feedback mới được xóa).
     * <p>
     * <strong>Authorization:</strong> Chỉ customer sở hữu feedback mới có quyền xóa.
     * <strong>Delete strategy:</strong> Hard delete (xóa vĩnh viễn khỏi DB).
     *
     * @param feedbackId ID của feedback cần xóa
     * @param username Username của customer đang đăng nhập
     * @throws ResourceNotFoundException nếu không tìm thấy feedback, user, hoặc customer
     * @throws IllegalArgumentException nếu customer không sở hữu feedback
     */
    @Override
    @Transactional
    public void deleteFeedback(Long feedbackId, String username) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feedback not found with ID: " + feedbackId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Customer customer = Optional.ofNullable(customerRepository.findByUser(user))
                .orElseThrow(() -> new ResourceNotFoundException("Customer Profile", "for user", username));

        // Authorization: Chỉ customer sở hữu feedback mới được xóa
        if (!feedback.getCustomer().equals(customer)) {
            throw new IllegalArgumentException(
                    "You are not authorized to delete this feedback");
        }

        feedbackRepository.delete(feedback);
    }

    /**
     * Tính average rating toàn hệ thống (KPI monitoring).
     *
     * @return Average rating (null nếu không có feedback nào)
     */
    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating() {
        return feedbackRepository.getAverageRating();
    }

    /**
     * Tính average rating theo service center (performance monitoring).
     * <p>
     * Query qua relationship chain: Feedback → WarrantyClaim → ServiceCenter
     *
     * @param serviceCenterId ID của service center
     * @return Average rating của service center (null nếu chưa có feedback)
     */
    @Override
    @Transactional(readOnly = true)
    public Double getAverageRatingByServiceCenter(Long serviceCenterId) {
        return feedbackRepository.getAverageRatingByServiceCenter(serviceCenterId);
    }

    /**
     * Đếm số lượng feedback theo rating (statistics & rating distribution).
     *
     * @param rating Giá trị rating (1-5)
     * @return Số lượng feedback có rating này
     * @throws IllegalStateException nếu rating không hợp lệ (< 1 hoặc > 5)
     */
    @Override
    @Transactional(readOnly = true)
    public Long countByRating(Integer rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalStateException("Rating must be between 1 and 5");
        }

        return feedbackRepository.countByRating(rating);
    }
}
