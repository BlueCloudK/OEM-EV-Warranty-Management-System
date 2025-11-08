import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import warrantyValidationApi from '../api/warrantyValidation';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCar, FaCog, FaCalendarAlt, FaTachometerAlt, FaMoneyBillWave } from 'react-icons/fa';

/**
 * WarrantyChecker Component
 *
 * Kiểm tra tình trạng bảo hành cho:
 * - Xe (by ID hoặc VIN)
 * - Linh kiện đã lắp đặt
 *
 * Hỗ trợ:
 * - Hiển thị trạng thái bảo hành
 * - Tính phí bảo hành tính phí (nếu hết hạn)
 * - Phân biệt Extended Warranty Parts vs Standard Parts
 */
const WarrantyChecker = ({ vehicleId, installedPartId, onWarrantyChecked, autoCheck = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warrantyInfo, setWarrantyInfo] = useState(null);
  const [estimatedRepairCost, setEstimatedRepairCost] = useState('');
  const [showFeeCalculation, setShowFeeCalculation] = useState(false);

  // Kiểm tra bảo hành
  const handleCheckWarranty = async () => {
    setLoading(true);
    setError(null);
    setWarrantyInfo(null);
    setShowFeeCalculation(false);

    try {
      let response;
      if (installedPartId) {
        // Kiểm tra bảo hành linh kiện
        response = await warrantyValidationApi.validateInstalledPartWarranty(installedPartId);
      } else if (vehicleId) {
        // Kiểm tra bảo hành xe
        response = await warrantyValidationApi.validateVehicleWarranty(vehicleId);
      } else {
        throw new Error('Vui lòng cung cấp vehicleId hoặc installedPartId');
      }

      setWarrantyInfo(response);

      // Callback để parent component biết
      if (onWarrantyChecked) {
        onWarrantyChecked(response);
      }

      // Nếu hết hạn nhưng có thể bảo hành tính phí, hiển thị form tính phí
      if (!response.isValidForFreeWarranty && response.canProvidePaidWarranty) {
        setShowFeeCalculation(true);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi kiểm tra bảo hành');
      console.error('Warranty check error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto check warranty on mount if autoCheck is true
  useEffect(() => {
    if (autoCheck && (vehicleId || installedPartId)) {
      handleCheckWarranty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCheck, vehicleId, installedPartId]); // Re-run when IDs change

  // Tính phí bảo hành
  const handleCalculateFee = async () => {
    if (!estimatedRepairCost || estimatedRepairCost <= 0) {
      alert('Vui lòng nhập chi phí sửa chữa ước tính');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (installedPartId) {
        response = await warrantyValidationApi.calculatePaidWarrantyFeeForPart(
          installedPartId,
          parseFloat(estimatedRepairCost)
        );
      } else if (vehicleId) {
        response = await warrantyValidationApi.calculatePaidWarrantyFee(
          vehicleId,
          parseFloat(estimatedRepairCost)
        );
      }

      setWarrantyInfo(response);

      if (onWarrantyChecked) {
        onWarrantyChecked(response);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tính phí bảo hành');
      console.error('Fee calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusConfig = {
      VALID: { icon: <FaCheckCircle />, color: '#4caf50', text: 'Còn Bảo Hành' },
      EXPIRED_DATE: { icon: <FaExclamationTriangle />, color: '#ff9800', text: 'Hết Hạn (Ngày)' },
      EXPIRED_MILEAGE: { icon: <FaExclamationTriangle />, color: '#ff9800', text: 'Hết Hạn (Km)' },
      EXPIRED_BOTH: { icon: <FaTimesCircle />, color: '#f44336', text: 'Hết Hạn (Cả 2)' },
      PART_WARRANTY_EXPIRED: { icon: <FaTimesCircle />, color: '#f44336', text: 'Linh Kiện Hết Hạn' },
    };

    const config = statusConfig[status] || { icon: <FaTimesCircle />, color: '#9e9e9e', text: 'Không xác định' };

    return (
      <StatusBadge color={config.color}>
        {config.icon}
        <span>{config.text}</span>
      </StatusBadge>
    );
  };

  return (
    <Container>
      {!autoCheck && (
        <Header>
          <h3>Kiểm Tra Bảo Hành</h3>
          <CheckButton onClick={handleCheckWarranty} disabled={loading}>
            {loading ? 'Đang kiểm tra...' : 'Kiểm Tra Ngay'}
          </CheckButton>
        </Header>
      )}

      {autoCheck && loading && (
        <LoadingState>
          <h3>Đang kiểm tra bảo hành tự động...</h3>
          <p>Vui lòng đợi trong giây lát</p>
        </LoadingState>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {warrantyInfo && (
        <ResultContainer>
          {/* Status Badge */}
          <StatusSection>
            {renderStatusBadge(warrantyInfo.warrantyStatus)}
            <StatusDescription>{warrantyInfo.statusDescription}</StatusDescription>
          </StatusSection>

          {/* Vehicle/Part Info */}
          <InfoSection>
            <InfoRow>
              <InfoLabel><FaCar /> Xe:</InfoLabel>
              <InfoValue>{warrantyInfo.vehicleName} ({warrantyInfo.vehicleVin})</InfoValue>
            </InfoRow>

            {warrantyInfo.partName && (
              <InfoRow>
                <InfoLabel><FaCog /> Linh kiện:</InfoLabel>
                <InfoValue>{warrantyInfo.partName}</InfoValue>
              </InfoRow>
            )}

            <InfoRow>
              <InfoLabel><FaCalendarAlt /> Thời hạn bảo hành:</InfoLabel>
              <InfoValue>
                {new Date(warrantyInfo.warrantyStartDate).toLocaleDateString('vi-VN')} - {new Date(warrantyInfo.warrantyEndDate).toLocaleDateString('vi-VN')}
                <DaysInfo isExpired={warrantyInfo.daysRemaining < 0}>
                  ({warrantyInfo.daysRemaining >= 0 ? 'Còn' : 'Quá'} {Math.abs(warrantyInfo.daysRemaining)} ngày)
                </DaysInfo>
              </InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel><FaTachometerAlt /> Số km:</InfoLabel>
              <InfoValue>
                {warrantyInfo.currentMileage?.toLocaleString('vi-VN')} / {warrantyInfo.mileageLimit?.toLocaleString('vi-VN')} km
                <DaysInfo isExpired={warrantyInfo.mileageRemaining < 0}>
                  ({warrantyInfo.mileageRemaining >= 0 ? 'Còn' : 'Vượt'} {Math.abs(warrantyInfo.mileageRemaining).toLocaleString('vi-VN')} km)
                </DaysInfo>
              </InfoValue>
            </InfoRow>
          </InfoSection>

          {/* Expiration Reasons */}
          {warrantyInfo.expirationReasons && (
            <ExpirationSection>
              <strong>Lý do:</strong> {warrantyInfo.expirationReasons}
            </ExpirationSection>
          )}

          {/* Paid Warranty Section */}
          {!warrantyInfo.isValidForFreeWarranty && warrantyInfo.canProvidePaidWarranty && (
            <PaidWarrantySection>
              <PaidWarrantyHeader>
                <FaMoneyBillWave />
                <h4>Bảo Hành Tính Phí</h4>
              </PaidWarrantyHeader>

              {showFeeCalculation && !warrantyInfo.estimatedWarrantyFee && (
                <FeeCalculationForm>
                  <FormGroup>
                    <label htmlFor="repairCost">Chi phí sửa chữa ước tính (VNĐ):</label>
                    <Input
                      id="repairCost"
                      type="number"
                      min="0"
                      step="100000"
                      value={estimatedRepairCost}
                      onChange={(e) => setEstimatedRepairCost(e.target.value)}
                      placeholder="Ví dụ: 2000000"
                    />
                  </FormGroup>
                  <CalculateButton onClick={handleCalculateFee} disabled={loading}>
                    {loading ? 'Đang tính...' : 'Tính Phí'}
                  </CalculateButton>
                </FeeCalculationForm>
              )}

              {warrantyInfo.estimatedWarrantyFee && (
                <FeeResult>
                  <FeeAmount>
                    Phí bảo hành: <strong>{warrantyInfo.estimatedWarrantyFee.toLocaleString('vi-VN')} VNĐ</strong>
                  </FeeAmount>
                  {warrantyInfo.feeNote && (
                    <FeeNote>{warrantyInfo.feeNote}</FeeNote>
                  )}
                </FeeResult>
              )}
            </PaidWarrantySection>
          )}

          {/* Cannot Provide Warranty */}
          {!warrantyInfo.isValidForFreeWarranty && !warrantyInfo.canProvidePaidWarranty && (
            <CannotProvideWarranty>
              <FaTimesCircle />
              <p>Không thể bảo hành (quá grace period)</p>
              <small>Xe/linh kiện đã quá thời hạn cho phép bảo hành tính phí.</small>
            </CannotProvideWarranty>
          )}
        </ResultContainer>
      )}
    </Container>
  );
};

// ========== STYLED COMPONENTS ==========

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;

  h3 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
  }
`;

const CheckButton = styled.button`
  background: #2196f3;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #1976d2;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  border-left: 4px solid #f44336;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const ResultContainer = styled.div`
  margin-top: 20px;
`;

const StatusSection = styled.div`
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  margin-bottom: 24px;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: ${props => props.color};
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  svg {
    font-size: 1.5rem;
  }
`;

const StatusDescription = styled.div`
  margin-top: 12px;
  color: #555;
  font-size: 1rem;
`;

const InfoSection = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #666;
  flex: 0 0 180px;

  svg {
    color: #2196f3;
  }
`;

const InfoValue = styled.div`
  flex: 1;
  text-align: right;
  color: #333;
`;

const DaysInfo = styled.span`
  margin-left: 8px;
  color: ${props => props.isExpired ? '#f44336' : '#4caf50'};
  font-weight: 600;
`;

const ExpirationSection = styled.div`
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  color: #e65100;
`;

const PaidWarrantySection = styled.div`
  background: #e8f5e9;
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const PaidWarrantyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2e7d32;
  margin-bottom: 16px;

  svg {
    font-size: 1.5rem;
  }

  h4 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

const FeeCalculationForm = styled.div`
  background: white;
  border-radius: 6px;
  padding: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }
`;

const CalculateButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #388e3c;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const FeeResult = styled.div`
  background: white;
  border-radius: 6px;
  padding: 16px;
`;

const FeeAmount = styled.div`
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #2e7d32;

  strong {
    color: #1b5e20;
    font-size: 1.5rem;
  }
`;

const FeeNote = styled.pre`
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const CannotProvideWarranty = styled.div`
  background: #ffebee;
  border: 2px solid #f44336;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #c62828;
  margin-top: 20px;

  svg {
    font-size: 3rem;
    margin-bottom: 12px;
  }

  p {
    margin: 8px 0;
    font-size: 1.2rem;
    font-weight: 600;
  }

  small {
    display: block;
    margin-top: 8px;
    color: #d32f2f;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 8px;
  margin-bottom: 20px;

  h3 {
    margin: 0 0 8px 0;
    color: #1976d2;
    font-size: 1.3rem;
  }

  p {
    margin: 0;
    color: #555;
    font-size: 1rem;
  }
`;

export default WarrantyChecker;
