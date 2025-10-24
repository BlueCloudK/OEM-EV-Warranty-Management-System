import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../../api/customerApi';
import { dataApi } from '../../api/dataApi';
import * as S from './MyVehicles.styles';
import {
  FaCar, FaSpinner, FaArrowLeft, FaInfoCircle, FaCog, FaCalendar,
  FaCheckCircle, FaTimesCircle, FaIdCard, FaTachometerAlt, FaHistory
} from 'react-icons/fa';

const VehicleDetailModal = ({ isOpen, onClose, vehicle }) => {
  const [installedParts, setInstalledParts] = useState([]);
  const [serviceHistories, setServiceHistories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVehicleDetails = async () => {
    if (!vehicle?.vehicleId) {
      console.error("Vehicle ID not found");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching details for vehicle:", vehicle.vehicleId);

      const [partsResponse, historiesResponse] = await Promise.all([
        dataApi.getInstalledPartsByVehicle(vehicle.vehicleId, 0, 100),
        dataApi.getServiceHistoriesByVehicle(vehicle.vehicleId, { page: 0, size: 100 })
      ]);

      console.log("Parts response:", partsResponse);
      console.log("Histories response:", historiesResponse);

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
    } catch (err) {
      console.error("Error fetching vehicle details:", err);
      console.error("Error details:", err.response?.data || err.message);
      setInstalledParts([]);
      setServiceHistories([]);
    } finally {
      setLoading(false);
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
              <S.DetailItemLabel><FaCog /> Hãng</S.DetailItemLabel>
              <S.DetailItemValue>{brand || 'Chưa có thông tin'}</S.DetailItemValue>
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
                        {brand && model ? `${brand} ${model}` : model || brand || 'N/A'}
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
