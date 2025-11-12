import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import warrantyValidationApi from '../api/warrantyValidation';
import warrantyClaimsApi from '../api/warrantyClaims';
import WarrantyChecker from './WarrantyChecker';
import { FaCheckCircle, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';

/**
 * PaidWarrantyClaimForm Component
 *
 * Form tạo warranty claim với hỗ trợ:
 * - Free warranty (trong thời hạn)
 * - Paid warranty (quá hạn nhưng trong grace period)
 *
 * Flow:
 * 1. Kiểm tra bảo hành (WarrantyChecker)
 * 2. Nếu hết hạn → Tính phí
 * 3. Customer đồng ý → Tạo claim với isPaidWarranty=true
 */
const PaidWarrantyClaimForm = ({ vehicleId, installedPartId, onSuccess, onCancel }) => {
  console.log('[PaidWarrantyClaimForm] Component rendered with:', { vehicleId, installedPartId });

  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    installedPartId: installedPartId || '',
    description: '',
    isPaidWarranty: false,
    estimatedRepairCost: '',
    warrantyFee: '',
    paidWarrantyNote: '',
  });

  const [warrantyInfo, setWarrantyInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Check warranty, 2: Fill form, 3: Confirm

  // Update form khi warranty info được kiểm tra
  const handleWarrantyChecked = (info) => {
    console.log('[PaidWarrantyClaimForm] handleWarrantyChecked called with:', info);
    setWarrantyInfo(info);

    // Auto-fill form
    setFormData(prev => ({
      ...prev,
      vehicleId: info.vehicleId,
      installedPartId: info.installedPartId || prev.installedPartId,
      isPaidWarranty: !info.isValidForFreeWarranty && info.canProvidePaidWarranty,
      warrantyFee: info.estimatedWarrantyFee || '',
      paidWarrantyNote: info.feeNote || '',
    }));

    // Move to step 2 if warranty is valid OR can provide paid warranty
    if (info.isValidForFreeWarranty || info.canProvidePaidWarranty) {
      console.log('[PaidWarrantyClaimForm] Moving to step 2');
      setStep(2);
      setError(null); // Clear any previous errors
    } else {
      // Warranty expired and cannot provide paid warranty
      console.log('[PaidWarrantyClaimForm] Cannot provide warranty - staying at step 1');
      setError('Xe/linh kiện đã hết hạn bảo hành và vượt quá thời gian cho phép bảo hành tính phí. Không thể tạo yêu cầu bảo hành.');
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-calculate warranty fee when estimatedRepairCost changes
    if (name === 'estimatedRepairCost' && value && parseFloat(value) > 0) {
      calculateFeeFromRepairCost(parseFloat(value));
    }
  };

  // Calculate warranty fee from repair cost
  const calculateFeeFromRepairCost = async (repairCost) => {
    if (!warrantyInfo || !formData.installedPartId) return;

    try {
      const response = await warrantyValidationApi.calculatePaidWarrantyFeeForPart(
        formData.installedPartId,
        repairCost
      );

      if (response && response.estimatedWarrantyFee) {
        setFormData(prev => ({
          ...prev,
          warrantyFee: response.estimatedWarrantyFee,
          paidWarrantyNote: response.feeNote || ''
        }));
      }
    } catch (err) {
      console.error('Error calculating warranty fee:', err);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.description || formData.description.length < 10) {
      setError('Mô tả phải có ít nhất 10 ký tự');
      return false;
    }

    if (formData.isPaidWarranty) {
      if (!formData.warrantyFee || parseFloat(formData.warrantyFee) <= 0) {
        setError('Phí bảo hành phải lớn hơn 0');
        return false;
      }
    }

    return true;
  };

  // Handle next to confirmation step
  const handleNextToConfirmation = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError(null);
    setStep(3);
  };

  // Handle back from confirmation
  const handleBackFromConfirmation = () => {
    setStep(2);
  };

  // Submit claim
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const claimData = {
        vehicleId: parseInt(formData.vehicleId),
        installedPartId: parseInt(formData.installedPartId),
        description: formData.description,
        isPaidWarranty: formData.isPaidWarranty,
        estimatedRepairCost: formData.estimatedRepairCost ? parseFloat(formData.estimatedRepairCost) : null,
        warrantyFee: formData.warrantyFee ? parseFloat(formData.warrantyFee) : null,
        paidWarrantyNote: formData.paidWarrantyNote || null,
      };

      const response = await warrantyClaimsApi.createWarrantyClaim(claimData);

      // Show success notification
      alert('Tạo yêu cầu bảo hành thành công!');

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo warranty claim');
      console.error('Claim creation error:', err);
      // Go back to form step if there's an error
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormHeader>
        <h2>Tạo Yêu Cầu Bảo Hành</h2>
        <StepIndicator>
          <Step $active={step >= 1} $completed={step > 1}>1. Kiểm Tra</Step>
          <StepSeparator />
          <Step $active={step >= 2} $completed={step > 2}>2. Thông Tin</Step>
          <StepSeparator />
          <Step $active={step >= 3}>3. Xác Nhận</Step>
        </StepIndicator>
      </FormHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Step 1: Warranty Check */}
      {step === 1 && (
        <StepSection>
          <WarrantyChecker
            vehicleId={vehicleId}
            installedPartId={installedPartId}
            onWarrantyChecked={handleWarrantyChecked}
            autoCheck={true}
          />

          {/* Show cancel button if warranty check shows cannot provide warranty */}
          {warrantyInfo && !warrantyInfo.isValidForFreeWarranty && !warrantyInfo.canProvidePaidWarranty && (
            <ButtonGroup>
              <CancelButton type="button" onClick={onCancel}>
                Đóng
              </CancelButton>
            </ButtonGroup>
          )}
        </StepSection>
      )}

      {/* Step 2: Claim Form */}
      {step === 2 && warrantyInfo && (
        <StepSection>
          <Form onSubmit={handleNextToConfirmation}>
            {/* Warranty Status Summary */}
            <WarrantySummary isPaid={formData.isPaidWarranty}>
              {formData.isPaidWarranty ? (
                <>
                  <FaExclamationTriangle />
                  <div>
                    <h4>Bảo Hành Tính Phí</h4>
                    <p>Xe/linh kiện đã hết hạn bảo hành miễn phí. Bạn có thể bảo hành với phí: <strong>{formData.warrantyFee ? parseFloat(formData.warrantyFee).toLocaleString('vi-VN') : '0'} VNĐ</strong></p>
                  </div>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <div>
                    <h4>Bảo Hành Miễn Phí</h4>
                    <p>Xe/linh kiện còn trong thời hạn bảo hành</p>
                  </div>
                </>
              )}
            </WarrantySummary>

            {/* Description */}
            <FormGroup>
              <Label htmlFor="description">Mô tả vấn đề *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={500}
                rows={5}
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải với xe/linh kiện..."
              />
              <CharCount>{formData.description.length}/500 ký tự</CharCount>
            </FormGroup>

            {/* Paid Warranty Fields */}
            {formData.isPaidWarranty && (
              <PaidWarrantyFields>
                <PaidWarrantyHeader>
                  <FaMoneyBillWave />
                  <h4>Thông Tin Phí Bảo Hành</h4>
                </PaidWarrantyHeader>

                <FormGroup>
                  <Label htmlFor="estimatedRepairCost">Chi phí sửa chữa ước tính (VNĐ)</Label>
                  <Input
                    type="number"
                    id="estimatedRepairCost"
                    name="estimatedRepairCost"
                    value={formData.estimatedRepairCost}
                    onChange={handleChange}
                    min="100000"
                    max="1000000000"
                    step="100000"
                    placeholder="Ví dụ: 5000000"
                  />
                  <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                    Nhập chi phí sửa chữa để tính phí bảo hành tự động
                  </small>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="warrantyFee">Phí bảo hành (VNĐ) *</Label>
                  <Input
                    type="number"
                    id="warrantyFee"
                    name="warrantyFee"
                    value={formData.warrantyFee}
                    required={formData.isPaidWarranty}
                    readOnly
                    style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                    Phí được tính tự động: 20%-50% của chi phí sửa chữa tùy theo số ngày quá hạn
                  </small>
                </FormGroup>

                {/* Chi tiết tính phí */}
                {formData.paidWarrantyNote && (
                  <FeeDetailsBox>
                    <FeeDetailsHeader>
                      <strong>Chi Tiết Tính Phí</strong>
                    </FeeDetailsHeader>
                    <FeeDetailsContent>
                      {formData.paidWarrantyNote}
                    </FeeDetailsContent>
                  </FeeDetailsBox>
                )}

                <PaymentNotice>
                  <strong>Lưu ý:</strong> Sau khi tạo claim, bạn cần thanh toán phí bảo hành trước khi claim được xử lý.
                </PaymentNotice>
              </PaidWarrantyFields>
            )}

            {/* Actions */}
            <FormActions>
              <CancelButton type="button" onClick={onCancel}>
                Hủy
              </CancelButton>
              <SubmitButton type="submit" disabled={loading}>
                Tiếp tục
              </SubmitButton>
            </FormActions>
          </Form>
        </StepSection>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && warrantyInfo && (
        <StepSection>
          <ConfirmationContainer>
            <ConfirmationHeader>
              <h3>Xác Nhận Thông Tin Yêu Cầu Bảo Hành</h3>
              <p>Vui lòng kiểm tra kỹ thông tin trước khi gửi yêu cầu</p>
            </ConfirmationHeader>

            <ConfirmationDetails>
              <DetailRow>
                <DetailLabel>Loại bảo hành:</DetailLabel>
                <DetailValue>
                  {formData.isPaidWarranty ? (
                    <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Bảo Hành Tính Phí</span>
                  ) : (
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Bảo Hành Miễn Phí</span>
                  )}
                </DetailValue>
              </DetailRow>

              {formData.isPaidWarranty && (
                <DetailRow>
                  <DetailLabel>Phí bảo hành:</DetailLabel>
                  <DetailValue style={{ color: '#ff6f00', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {parseFloat(formData.warrantyFee).toLocaleString('vi-VN')} VNĐ
                  </DetailValue>
                </DetailRow>
              )}

              <DetailRow>
                <DetailLabel>Mô tả vấn đề:</DetailLabel>
                <DetailValue>{formData.description}</DetailValue>
              </DetailRow>

              {formData.isPaidWarranty && formData.estimatedRepairCost && (
                <DetailRow>
                  <DetailLabel>Chi phí sửa chữa ước tính:</DetailLabel>
                  <DetailValue>
                    {parseFloat(formData.estimatedRepairCost).toLocaleString('vi-VN')} VNĐ
                  </DetailValue>
                </DetailRow>
              )}
            </ConfirmationDetails>

            {formData.isPaidWarranty && formData.paidWarrantyNote && (
              <FeeDetailsBox style={{ marginTop: '20px' }}>
                <FeeDetailsHeader>
                  <strong>Chi Tiết Tính Phí</strong>
                </FeeDetailsHeader>
                <FeeDetailsContent>
                  {formData.paidWarrantyNote}
                </FeeDetailsContent>
              </FeeDetailsBox>
            )}

            {formData.isPaidWarranty && (
              <PaymentNotice style={{ marginTop: '20px' }}>
                <strong>Lưu ý quan trọng:</strong> Sau khi tạo yêu cầu, bạn cần thanh toán phí bảo hành tại quầy trước khi yêu cầu được xử lý.
              </PaymentNotice>
            )}

            <FormActions>
              <CancelButton type="button" onClick={handleBackFromConfirmation} disabled={loading}>
                Quay lại
              </CancelButton>
              <SubmitButton type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Đang tạo claim...' : 'Xác nhận và gửi yêu cầu'}
              </SubmitButton>
            </FormActions>
          </ConfirmationContainer>
        </StepSection>
      )}
    </Container>
  );
};

// ========== STYLED COMPONENTS ==========

const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
  overflow: hidden;
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  text-align: center;

  h2 {
    margin: 0 0 24px 0;
    font-size: 2rem;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const Step = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.$completed ? '#4caf50' : props.$active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)'};
  color: ${props => props.$active && !props.$completed ? '#667eea' : 'white'};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s;
`;

const StepSeparator = styled.div`
  width: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
`;

const StepSection = styled.div`
  padding: 32px;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  border-left: 4px solid #f44336;
  color: #c62828;
  padding: 16px 24px;
  margin: 20px 32px;
  border-radius: 4px;
  font-weight: 500;
`;

const WarrantySummary = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  background: ${props => props.isPaid ? '#fff3e0' : '#e8f5e9'};
  border: 2px solid ${props => props.isPaid ? '#ff9800' : '#4caf50'};

  svg {
    font-size: 2.5rem;
    color: ${props => props.isPaid ? '#ff9800' : '#4caf50'};
    flex-shrink: 0;
  }

  h4 {
    margin: 0 0 8px 0;
    color: ${props => props.isPaid ? '#e65100' : '#2e7d32'};
  }

  p {
    margin: 0;
    color: #666;
  }

  strong {
    color: ${props => props.isPaid ? '#ff6f00' : '#1b5e20'};
    font-size: 1.1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:read-only {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:read-only {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 0.85rem;
  color: #999;
`;

const PaidWarrantyFields = styled.div`
  background: #fafafa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 24px;
`;

const PaidWarrantyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #ff9800;

  svg {
    font-size: 1.8rem;
  }

  h4 {
    margin: 0;
    font-size: 1.3rem;
  }
`;

const PaymentNotice = styled.div`
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
  color: #0d47a1;
  font-size: 0.95rem;

  strong {
    display: block;
    margin-bottom: 4px;
  }
`;

const FeeDetailsBox = styled.div`
  background: #fff9e6;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const FeeDetailsHeader = styled.div`
  color: #f57c00;
  margin-bottom: 12px;
  font-size: 1rem;

  strong {
    font-weight: 700;
  }
`;

const FeeDetailsContent = styled.pre`
  background: white;
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 0.95rem;
  color: #555;
  margin: 0;
  line-height: 1.6;
  border: 1px solid #ffe082;
`;

const FormActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e0e0e0;
`;

const SubmitButton = styled.button`
  padding: 12px 32px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
`;

const CancelButton = styled.button`
  padding: 12px 32px;
  border: 2px solid #f44336;
  background: white;
  color: #f44336;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f44336;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  }
`;

const ConfirmationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ConfirmationHeader = styled.div`
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;

  h3 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 1rem;
  }
`;

const ConfirmationDetails = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #555;
`;

const DetailValue = styled.div`
  color: #333;
  word-break: break-word;
`;

export default PaidWarrantyClaimForm;
