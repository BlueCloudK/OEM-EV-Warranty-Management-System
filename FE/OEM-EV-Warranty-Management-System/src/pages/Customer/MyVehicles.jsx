import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../../api/customerApi';
import { dataApi } from '../../api/dataApi';
import * as S from './MyVehicles.styles';
import {
  FaCar, FaSpinner, FaArrowLeft, FaInfoCircle, FaCog, FaCalendar,
  FaCheckCircle, FaTimesCircle, FaIdCard, FaTachometerAlt, FaHistory, FaCommentDots, FaStar, FaPaperPlane, FaSyncAlt
} from 'react-icons/fa';

const VehicleDetailModal = ({ isOpen, onClose, vehicle }) => {
  const navigate = useNavigate();
  const [installedParts, setInstalledParts] = useState([]);
  const [serviceHistories, setServiceHistories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Feedback form states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [warrantyClaims, setWarrantyClaims] = useState([]);
  const [existingFeedbacks, setExistingFeedbacks] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({
    warrantyClaimId: '',
    rating: 5,
    comments: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchVehicleDetails = async () => {
    if (!vehicle?.vehicleId) {
      console.error("Vehicle ID not found");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching details for vehicle:", vehicle.vehicleId);

      // First get customer ID
      const profile = await customerApi.getMyProfile();
      const customerId = profile?.customerId || profile?.userId;

      const [partsResponse, historiesResponse, claimsResponse, feedbacksResponse] = await Promise.all([
        dataApi.getInstalledPartsByVehicle(vehicle.vehicleId, 0, 100),
        dataApi.getServiceHistoriesByVehicle(vehicle.vehicleId, { page: 0, size: 100 }),
        customerApi.getMyWarrantyClaims({ page: 0, size: 100 }),
        customerId ? customerApi.getMyFeedbacks(customerId, { page: 0, size: 100 }).catch(() => ({ content: [] })) : Promise.resolve({ content: [] })
      ]);

      console.log("Parts response:", partsResponse);
      console.log("Histories response:", historiesResponse);
      console.log("Claims response:", claimsResponse);
      console.log("Feedbacks response:", feedbacksResponse);

      // Handle different response formats
      if (partsResponse) {
        const parts = partsResponse.content || (Array.isArray(partsResponse) ? partsResponse : []);
        setInstalledParts(parts);
        console.log("Installed parts set:", parts.length);
      }

      if (historiesResponse) {
        const histories = historiesResponse.content || (Array.isArray(historiesResponse) ? historiesResponse : []);
        setServiceHistories(histories);
        console.log("Service histories set:", histories.length);
      }

      // Filter claims for this vehicle
      if (claimsResponse) {
        const allClaims = claimsResponse.content || (Array.isArray(claimsResponse) ? claimsResponse : []);
        const vehicleClaims = allClaims.filter(claim => claim.vehicleId === vehicle.vehicleId);
        setWarrantyClaims(vehicleClaims);
        console.log("Warranty claims for this vehicle:", vehicleClaims.length);
      }

      // Get existing feedbacks
      if (feedbacksResponse) {
        const allFeedbacks = feedbacksResponse.content || (Array.isArray(feedbacksResponse) ? feedbacksResponse : []);
        setExistingFeedbacks(allFeedbacks);
        console.log("Existing feedbacks:", allFeedbacks.length);
      }
    } catch (err) {
      console.error("Error fetching vehicle details:", err);
      console.error("Error details:", err.response?.data || err.message);
      setInstalledParts([]);
      setServiceHistories([]);
      setWarrantyClaims([]);
      setExistingFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    if (!feedbackForm.warrantyClaimId) {
      alert('Vui lòng chọn yêu cầu bảo hành');
      return;
    }

    try {
      setSubmitLoading(true);

      // Backend tự lấy username từ JWT token, không cần customerId
      await customerApi.createFeedback({
        ...feedbackForm,
        warrantyClaimId: parseInt(feedbackForm.warrantyClaimId)
      });

      alert('Gửi phản hồi thành công!');

      // Reset form
      setFeedbackForm({
        warrantyClaimId: '',
        rating: 5,
        comments: ''
      });

      // Refetch to update available claims
      await fetchVehicleDetails();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Không thể gửi phản hồi: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && vehicle) {
      console.log("Modal opened for vehicle:", vehicle);
      fetchVehicleDetails();
    } else {
      // Reset state when modal closes
      setInstalledParts([]);
      setServiceHistories([]);
      setWarrantyClaims([]);
      setExistingFeedbacks([]);
      setShowFeedbackForm(false);
      setFeedbackForm({
        warrantyClaimId: '',
        rating: 5,
        comments: ''
      });
    }
  }, [isOpen, vehicle?.vehicleId]);

  const isWarrantyValid = (warrantyEndDate) => {
    if (!warrantyEndDate) return false;
    return new Date(warrantyEndDate) > new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!isOpen || !vehicle) return null;

  // Map backend field names to expected names
  const vin = vehicle.vehicleVin || vehicle.vin;
  const model = vehicle.vehicleModel || vehicle.model;
  const year = vehicle.vehicleYear || vehicle.year;
  const brand = vehicle.vehicleBrand || vehicle.brand;
  const mileage = vehicle.vehicleMileage || vehicle.mileage;
  const purchaseDate = vehicle.vehiclePurchaseDate || vehicle.purchaseDate;
  const warrantyEndDate = vehicle.vehicleWarrantyEndDate || vehicle.warrantyEndDate;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <h2><FaCar /> {vehicle.vehicleName || vin || 'Chi tiết xe'}</h2>
          <S.CloseButton onClick={onClose}>×</S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <S.DetailGrid>
            <S.DetailItem>
              <S.DetailItemLabel><FaIdCard /> VIN</S.DetailItemLabel>
              <S.DetailItemValue>{vin || 'Chưa có thông tin'}</S.DetailItemValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailItemLabel><FaCar /> Tên xe</S.DetailItemLabel>
              <S.DetailItemValue>{vehicle.vehicleName || 'Chưa có thông tin'}</S.DetailItemValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailItemLabel><FaCog /> Model</S.DetailItemLabel>
              <S.DetailItemValue>{model || 'Chưa có thông tin'}</S.DetailItemValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailItemLabel><FaCalendar /> Năm sản xuất</S.DetailItemLabel>
              <S.DetailItemValue>{year || 'Chưa có thông tin'}</S.DetailItemValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailItemLabel><FaTachometerAlt /> Số Km</S.DetailItemLabel>
              <S.DetailItemValue>
                {mileage !== null && mileage !== undefined
                  ? `${Number(mileage).toLocaleString()} km`
                  : 'Chưa có thông tin'}
              </S.DetailItemValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailItemLabel><FaCalendar /> Ngày mua</S.DetailItemLabel>
              <S.DetailItemValue>{formatDate(purchaseDate)}</S.DetailItemValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailItemLabel>
                {isWarrantyValid(warrantyEndDate) ? <FaCheckCircle /> : <FaTimesCircle />}
                Bảo hành đến
              </S.DetailItemLabel>
              <S.DetailItemValue>
                <S.WarrantyBadge $valid={isWarrantyValid(warrantyEndDate)}>
                  {warrantyEndDate ? formatDate(warrantyEndDate) : 'Chưa có thông tin'}
                </S.WarrantyBadge>
              </S.DetailItemValue>
            </S.DetailItem>
          </S.DetailGrid>

          <S.SectionTitle>
            {isWarrantyValid(warrantyEndDate) ? <FaCheckCircle /> : <FaTimesCircle />}
            Thông tin bảo hành
          </S.SectionTitle>
          <S.InfoCard $color={isWarrantyValid(warrantyEndDate) ? "#10b981" : "#ef4444"}>
            <S.InfoCardContent>
              <div style={{ marginBottom: '8px' }}>
                <strong>Trạng thái:</strong>{' '}
                <S.WarrantyBadge $valid={isWarrantyValid(warrantyEndDate)}>
                  {isWarrantyValid(warrantyEndDate) ? 'Còn hạn' : 'Hết hạn'}
                </S.WarrantyBadge>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Ngày mua xe:</strong> {formatDate(purchaseDate)}
              </div>
              <div>
                <strong>Bảo hành đến:</strong> {formatDate(warrantyEndDate)}
              </div>
            </S.InfoCardContent>
            <S.ActionButton
              style={{ marginTop: '12px', width: '100%' }}
              onClick={(e) => {
                e.stopPropagation();
                setShowFeedbackForm(!showFeedbackForm);
              }}
            >
              <FaCommentDots /> {showFeedbackForm ? 'Ẩn form phản hồi' : 'Gửi phản hồi về xe này'}
            </S.ActionButton>
          </S.InfoCard>

          {/* Feedback Form */}
          {showFeedbackForm && (() => {
            // Filter out claims that already have feedback
            const feedbackClaimIds = new Set(existingFeedbacks.map(f => f.warrantyClaimId));
            const availableClaims = warrantyClaims.filter(claim => !feedbackClaimIds.has(claim.warrantyClaimId));

            return (
              <>
                <S.SectionTitle><FaCommentDots /> Gửi phản hồi</S.SectionTitle>
                <S.InfoCard $color="#3b82f6">
                  <form onSubmit={handleSubmitFeedback}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Yêu cầu bảo hành <span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        value={feedbackForm.warrantyClaimId}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, warrantyClaimId: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">-- Chọn yêu cầu bảo hành --</option>
                        {availableClaims.map(claim => (
                          <option key={claim.warrantyClaimId} value={claim.warrantyClaimId}>
                            #{claim.warrantyClaimId} - {claim.description?.substring(0, 50) || 'N/A'}
                          </option>
                        ))}
                      </select>
                      {availableClaims.length === 0 && warrantyClaims.length > 0 && (
                        <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                          Bạn đã gửi phản hồi cho tất cả yêu cầu bảo hành của xe này
                        </small>
                      )}
                      {warrantyClaims.length === 0 && (
                        <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                          Chưa có yêu cầu bảo hành nào cho xe này
                        </small>
                      )}
                    </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Đánh giá <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                          style={{
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: star <= feedbackForm.rating ? '#fbbf24' : '#d1d5db',
                            transition: 'color 0.2s'
                          }}
                        />
                      ))}
                      <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                        ({feedbackForm.rating}/5)
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Nhận xét
                    </label>
                    <textarea
                      value={feedbackForm.comments}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                      rows="4"
                      placeholder="Nhập nhận xét của bạn về dịch vụ bảo hành... (không bắt buộc)"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                    <S.ActionButton
                      type="submit"
                      disabled={submitLoading || availableClaims.length === 0}
                      style={{
                        width: '100%',
                        backgroundColor: submitLoading ? '#9ca3af' : '#3b82f6',
                        cursor: submitLoading || availableClaims.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: submitLoading || availableClaims.length === 0 ? 0.6 : 1
                      }}
                    >
                      {submitLoading ? (
                        <>
                          <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Đang gửi...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane /> Gửi phản hồi
                        </>
                      )}
                    </S.ActionButton>
                  </form>
                </S.InfoCard>
              </>
            );
          })()}

          <S.SectionTitle><FaCog /> Phụ tùng đã lắp đặt ({installedParts.length})</S.SectionTitle>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <FaSpinner style={{ fontSize: '24px', color: '#3b82f6' }} />
            </div>
          ) : installedParts.length === 0 ? (
            <S.InfoCard $color="#6b7280">
              <S.InfoCardContent>Chưa có phụ tùng nào được lắp đặt.</S.InfoCardContent>
            </S.InfoCard>
          ) : (
            installedParts.map((part, index) => (
              <S.InfoCard key={index} $color="#3b82f6">
                <S.InfoCardTitle>{part.partName || part.partId || 'N/A'}</S.InfoCardTitle>
                <S.InfoCardContent>
                  <div>Ngày lắp đặt: <strong>{formatDate(part.installationDate)}</strong></div>
                  {part.warrantyEndDate && (
                    <div>Bảo hành đến: <strong>{formatDate(part.warrantyEndDate)}</strong></div>
                  )}
                </S.InfoCardContent>
              </S.InfoCard>
            ))
          )}

          <S.SectionTitle><FaHistory /> Lịch sử dịch vụ ({serviceHistories.length})</S.SectionTitle>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <FaSpinner style={{ fontSize: '24px', color: '#3b82f6' }} />
            </div>
          ) : serviceHistories.length === 0 ? (
            <S.InfoCard $color="#6b7280">
              <S.InfoCardContent>Chưa có lịch sử dịch vụ nào.</S.InfoCardContent>
            </S.InfoCard>
          ) : (
            serviceHistories.map((history, index) => (
              <S.InfoCard key={index} $color="#10b981">
                <S.InfoCardTitle>{history.serviceType || 'Bảo dưỡng'}</S.InfoCardTitle>
                <S.InfoCardContent>
                  <div>Ngày: <strong>{formatDate(history.serviceDate)}</strong></div>
                  {history.description && <div>Mô tả: {history.description}</div>}
                </S.InfoCardContent>
              </S.InfoCard>
            ))
          )}
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

const MyVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerApi.getMyVehicles({ page: 0, size: 100 });

      if (response && response.content) {
        setVehicles(response.content);
      } else if (Array.isArray(response)) {
        setVehicles(response);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách xe.");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const isWarrantyValid = (warrantyEndDate) => {
    if (!warrantyEndDate) return false;
    return new Date(warrantyEndDate) > new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const openDetailModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <S.PageContainer>
        <S.LoadingState>
          <div>
            <FaSpinner />
            <p>Đang tải danh sách xe...</p>
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
              <S.HeaderTitle><FaCar /> Xe của tôi</S.HeaderTitle>
              <S.HeaderSubtitle>Quản lý và theo dõi thông tin xe của bạn</S.HeaderSubtitle>
            </div>
            <S.BackButton onClick={fetchVehicles} disabled={loading} title="Làm mới dữ liệu" style={{ marginLeft: 'auto' }}>
              <FaSyncAlt style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Làm mới
            </S.BackButton>
          </S.HeaderTop>
        </S.Header>

        {error && (
          <S.ErrorMessage>
            <FaInfoCircle />
            {error}
          </S.ErrorMessage>
        )}

        {vehicles.length === 0 ? (
          <S.EmptyState>
            <FaCar />
            <h3>Chưa có xe nào</h3>
            <p>Bạn chưa đăng ký xe nào trong hệ thống.</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Vui lòng liên hệ trung tâm dịch vụ để đăng ký xe mới.
            </p>
          </S.EmptyState>
        ) : (
          <S.VehiclesGrid>
            {vehicles.map((vehicle) => {
              // Map backend field names
              const vin = vehicle.vehicleVin || vehicle.vin;
              const model = vehicle.vehicleModel || vehicle.model;
              const year = vehicle.vehicleYear || vehicle.year;
              const brand = vehicle.vehicleBrand || vehicle.brand;
              const mileage = vehicle.vehicleMileage || vehicle.mileage;
              const warrantyEndDate = vehicle.vehicleWarrantyEndDate || vehicle.warrantyEndDate;

              return (
                <S.VehicleCard key={vehicle.vehicleId} onClick={() => openDetailModal(vehicle)}>
                  <S.VehicleHeader>
                    <S.VehicleIcon><FaCar /></S.VehicleIcon>
                    <div>
                      <S.VehicleTitle>{vehicle.vehicleName}</S.VehicleTitle>
                      <S.VehicleSubtitle>
                        {model || 'N/A'}
                      </S.VehicleSubtitle>
                    </div>
                  </S.VehicleHeader>

                  <S.VehicleDetails>
                    <S.DetailRow>
                      <S.DetailLabel><FaIdCard /> VIN</S.DetailLabel>
                      <S.DetailValue>{vin || 'N/A'}</S.DetailValue>
                    </S.DetailRow>
                    <S.DetailRow>
                      <S.DetailLabel><FaCalendar /> Năm SX</S.DetailLabel>
                      <S.DetailValue>{year || 'N/A'}</S.DetailValue>
                    </S.DetailRow>
                    <S.DetailRow>
                      <S.DetailLabel><FaTachometerAlt /> Số Km</S.DetailLabel>
                      <S.DetailValue>
                        {mileage !== null && mileage !== undefined
                          ? `${Number(mileage).toLocaleString()} km`
                          : 'N/A'}
                      </S.DetailValue>
                    </S.DetailRow>
                    <S.DetailRow>
                      <S.DetailLabel>
                        {isWarrantyValid(warrantyEndDate) ? <FaCheckCircle /> : <FaTimesCircle />}
                        Bảo hành
                      </S.DetailLabel>
                      <S.WarrantyBadge $valid={isWarrantyValid(warrantyEndDate)}>
                        {warrantyEndDate
                          ? (isWarrantyValid(warrantyEndDate) ? 'Còn hạn' : 'Hết hạn')
                          : 'Chưa có thông tin'}
                      </S.WarrantyBadge>
                    </S.DetailRow>
                  </S.VehicleDetails>

                  <S.ActionButton>
                    <FaInfoCircle /> Xem chi tiết
                  </S.ActionButton>
                </S.VehicleCard>
              );
            })}
          </S.VehiclesGrid>
        )}

        <VehicleDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          vehicle={selectedVehicle}
        />
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default MyVehicles;
