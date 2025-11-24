import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import warrantyValidationApi from '../api/warrantyValidation';
import warrantyClaimsApi from '../api/warrantyClaims';
import installedPartsApi from '../api/installedParts';
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
  const [installedPartInfo, setInstalledPartInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Check warranty, 2: Fill form, 3: Confirm

  // Load installed part info để lấy giá part
  useEffect(() => {
    const loadInstalledPartInfo = async () => {
      if (installedPartId) {
        try {
          const partInfo = await installedPartsApi.getById(installedPartId);
          setInstalledPartInfo(partInfo);
          console.log('[PaidWarrantyClaimForm] Loaded installed part info:', partInfo);
        } catch (err) {
          console.error('[PaidWarrantyClaimForm] Error loading installed part:', err);
        }
      }
    };
    loadInstalledPartInfo();
  }, [installedPartId]);

  // Tự động tính phí khi có đủ thông tin
  useEffect(() => {
    if (formData.isPaidWarranty && installedPartInfo?.price && !formData.estimatedRepairCost) {
      const partPrice = parseFloat(installedPartInfo.price);
      const markupPercent = installedPartInfo.paidWarrantyFeePercentageMin
        ? parseFloat(installedPartInfo.paidWarrantyFeePercentageMin)
        : 0;

      // Tính phí cuối cùng luôn = giá × (1 + markup%)
      const finalFee = partPrice * (1 + markupPercent / 100);

      console.log('[PaidWarrantyClaimForm] Auto-calculating fee from part price:', {
        partPrice,
        markupPercent,
        finalFee,
        partName: installedPartInfo.partName
      });

      setFormData(prev => ({
        ...prev,
        warrantyFee: finalFee,
        paidWarrantyNote: `${installedPartInfo.partName}: ${partPrice.toLocaleString('vi-VN')} VNĐ${markupPercent > 0 ? ` + ${markupPercent}%` : ''}`
      }));
    }
  }, [installedPartInfo, formData.isPaidWarranty, formData.estimatedRepairCost]);

  // Update form khi warranty info được kiểm tra
  const handleWarrantyChecked = (info) => {
    console.log('[PaidWarrantyClaimForm] handleWarrantyChecked called with:', info);
    setWarrantyInfo(info);

    // Auto-fill form
    const isPaid = !info.isValidForFreeWarranty && info.canProvidePaidWarranty;

    setFormData(prev => ({
      ...prev,
      vehicleId: info.vehicleId,
      installedPartId: info.installedPartId || prev.installedPartId,
      isPaidWarranty: isPaid,
      // Fee sẽ được tính tự động trong useEffect khi có installedPartInfo
      warrantyFee: info.estimatedWarrantyFee || prev.warrantyFee || '',
      paidWarrantyNote: info.feeNote || prev.paidWarrantyNote || '',
    }));

    // Move to step 2 if warranty is valid OR can provide paid warranty
    if (info.isValidForFreeWarranty || info.canProvidePaidWarranty) {
      console.log('[PaidWarrantyClaimForm] Moving to step 2');
      setStep(2);
      setError(null); // Clear any previous errors
    } else {
      // Warranty expired and cannot provide paid warranty
      console.log('[PaidWarrantyClaimForm] Cannot provide warranty - staying at step 1');
      setError(
        info.expirationReasons
          ? `Không thể tạo yêu cầu: ${info.expirationReasons}`
          : 'Xe/linh kiện đã hết hạn bảo hành và vượt quá thời gian cho phép bảo hành tính phí.'
      );
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

    // BACKEND AUTO-CALCULATES WARRANTY FEE - No need to validate here
    // Backend will calculate fee from part price when isPaidWarranty = true

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
        // Backend auto-calculates warrantyFee from part price when isPaidWarranty = true
        // Only send if user manually calculated it via estimatedRepairCost
        warrantyFee: (formData.warrantyFee && formData.estimatedRepairCost) ? parseFloat(formData.warrantyFee) : null,
        paidWarrantyNote: formData.paidWarrantyNote || null,
      };

      const response = await warrantyClaimsApi.createWarrantyClaim(claimData);

      // Show success notification with warranty fee details
      let successMessage = '✅ Tạo yêu cầu bảo hành thành công!';
      if (formData.isPaidWarranty && response.warrantyFee) {
        const finalFee = parseFloat(response.warrantyFee);
        successMessage += `\n\n💰 Phí bảo hành: ${finalFee.toLocaleString('vi-VN')} VNĐ`;
        if (formData.paidWarrantyNote) {
          successMessage += `\n(${formData.paidWarrantyNote})`;
        }
        successMessage += '\n\n⚠️ Khách hàng cần thanh toán tại quầy trước khi xử lý';
      }
      alert(successMessage);

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
            <WarrantySummary $isPaid={formData.isPaidWarranty}>
              {formData.isPaidWarranty ? (
                <>
                  <FaExclamationTriangle />
                  <div>
                    <h4>⚠️ Bảo Hành Tính Phí</h4>
                    <p>Xe/linh kiện đã hết hạn bảo hành miễn phí.</p>
                    {warrantyInfo?.expirationReasons && (
                      <p style={{ color: '#d84315', fontWeight: '500', marginTop: '4px' }}>
                        Lý do: {warrantyInfo.expirationReasons}
                      </p>
                    )}
                    <FeeFormulaInfo>
                      <small>
                        💰 Phí sẽ tính tự động từ giá linh kiện khi gửi yêu cầu
                      </small>
                    </FeeFormulaInfo>
                  </div>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <div>
                    <h4>✅ Bảo Hành Miễn Phí</h4>
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
                  <Label htmlFor="estimatedRepairCost">Chi phí sửa chữa ước tính (VNĐ) - Tùy chọn</Label>
                  <Input
                    type="number"
                    id="estimatedRepairCost"
                    name="estimatedRepairCost"
                    value={formData.estimatedRepairCost}
                    onChange={handleChange}
                    min="100000"
                    max="1000000000"
                    step="100000"
                    placeholder="Ví dụ: 5000000 (không bắt buộc)"
                  />
                  <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                    💡 <strong>Tùy chọn:</strong> Nhập để xem phí ước tính, hoặc để trống - hệ thống sẽ tự động tính từ giá linh kiện
                  </small>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="warrantyFee">Phí Bảo Hành</Label>
                  {formData.warrantyFee ? (
                    <>
                      <FeeDisplayBox>
                        <div>
                          <FeeAmount>
                            {parseFloat(formData.warrantyFee).toLocaleString('vi-VN')} VNĐ
                          </FeeAmount>
                          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                            {installedPartInfo && (
                              <>
                                📦 {installedPartInfo.partName}: {parseFloat(installedPartInfo.price).toLocaleString('vi-VN')} VNĐ
                                {installedPartInfo.paidWarrantyFeePercentageMin > 0 && (
                                  <> + {parseFloat(installedPartInfo.paidWarrantyFeePercentageMin)}% markup</>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </FeeDisplayBox>
                      {installedPartInfo && (
                        <div style={{
                          marginTop: '8px',
                          padding: '10px 12px',
                          background: '#fff3e0',
                          borderLeft: '3px solid #ff9800',
                          fontSize: '0.85rem',
                          color: '#e65100',
                          lineHeight: '1.6'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>📐 Công thức tính phí:</div>
                          <div>Phí = Giá linh kiện × (1 + Markup%)</div>
                          <div style={{ marginTop: '4px' }}>
                            = {parseFloat(installedPartInfo.price).toLocaleString('vi-VN')} × (1 + {parseFloat(installedPartInfo.paidWarrantyFeePercentageMin || 0)}%)
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            = <strong>{parseFloat(formData.warrantyFee).toLocaleString('vi-VN')} VNĐ</strong>
                          </div>
                          {(installedPartInfo.paidWarrantyFeePercentageMin > 0 || installedPartInfo.paidWarrantyFeePercentageMax > 0) && warrantyInfo && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #ffb74d', fontSize: '0.8rem', color: '#666', lineHeight: '1.5' }}>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📊 Cách tính Markup%:</div>
                              {installedPartInfo.paidWarrantyFeePercentageMax > installedPartInfo.paidWarrantyFeePercentageMin ? (
                                <>
                                  <div>• Markup = Min% + (Max% - Min%) × (Ngày hết hạn / Grace period)</div>
                                  <div style={{ marginTop: '2px' }}>
                                    • Range: {installedPartInfo.paidWarrantyFeePercentageMin}% - {installedPartInfo.paidWarrantyFeePercentageMax}%
                                  </div>
                                  <div style={{ marginTop: '2px', fontStyle: 'italic' }}>
                                    → Vừa hết hạn = markup thấp, hết lâu = markup cao
                                  </div>
                                  {(() => {
                                    const today = new Date();
                                    // Dùng warranty expiration từ warrantyInfo (đã tính đúng vehicle vs part)
                                    let daysExpired = 0;
                                    if (warrantyInfo.daysRemaining < 0) {
                                      daysExpired = Math.abs(warrantyInfo.daysRemaining);
                                    }
                                    const gracePeriod = installedPartInfo.gracePeriodDays || warrantyInfo.gracePeriodDays || 30;
                                    const minPercent = parseFloat(installedPartInfo.paidWarrantyFeePercentageMin);
                                    const maxPercent = parseFloat(installedPartInfo.paidWarrantyFeePercentageMax);

                                    if (true) { // Always show calculation
                                      const ratio = Math.min(daysExpired / gracePeriod, 1);
                                      const calculatedMarkup = minPercent + (maxPercent - minPercent) * ratio;

                                      return (
                                        <div style={{ marginTop: '6px', padding: '6px', background: '#fff9e6', borderRadius: '4px', fontSize: '0.75rem' }}>
                                          <div style={{ fontWeight: 'bold', marginBottom: '3px', color: '#e65100' }}>Tính toán cho claim này:</div>
                                          <div>• Grace period: {gracePeriod} ngày</div>
                                          <div>• Ngày hết hạn: {daysExpired} ngày</div>
                                          <div>• Tính toán:</div>
                                          <div style={{ paddingLeft: '12px' }}>
                                            <div>- Ratio = {daysExpired} / {gracePeriod} = {ratio.toFixed(2)}</div>
                                            <div>- Markup = {minPercent}% + ({maxPercent}% - {minPercent}%) × {ratio.toFixed(2)}</div>
                                            <div>- Markup = {minPercent}% + {(maxPercent - minPercent).toFixed(1)}% × {ratio.toFixed(2)}</div>
                                            <div style={{ fontWeight: 'bold', color: '#e65100' }}>- Markup = {calculatedMarkup.toFixed(1)}%</div>
                                          </div>
                                          <div style={{ marginTop: '3px' }}>• Phí = {parseFloat(installedPartInfo.price).toLocaleString('vi-VN')} × (1 + {calculatedMarkup.toFixed(1)}%)</div>
                                          <div style={{ fontWeight: 'bold', color: '#e65100' }}>
                                            • Phí = {parseFloat(formData.warrantyFee).toLocaleString('vi-VN')} VNĐ
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </>
                              ) : (
                                <div>• Markup cố định: {installedPartInfo.paidWarrantyFeePercentageMin || 0}% (không phân biệt ngày hết hạn)</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Input
                      type="text"
                      readOnly
                      value=""
                      style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                      placeholder="Đang tải..."
                    />
                  )}
                  <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>
                    Hoặc nhập chi phí sửa chữa bên trên để tính phí khác
                  </small>
                </FormGroup>

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

              {formData.isPaidWarranty && formData.warrantyFee && (
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

            {formData.isPaidWarranty && (
              <PaymentNotice style={{ marginTop: '20px' }}>
                {formData.paidWarrantyNote && (
                  <div style={{ marginBottom: '8px' }}>📋 {formData.paidWarrantyNote}</div>
                )}
                <strong>→ Khách hàng cần thanh toán tại quầy trước khi xử lý</strong>
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
  background: ${props => props.$isPaid ? '#fff3e0' : '#e8f5e9'};
  border: 2px solid ${props => props.$isPaid ? '#ff9800' : '#4caf50'};

  svg {
    font-size: 2.5rem;
    color: ${props => props.$isPaid ? '#ff9800' : '#4caf50'};
    flex-shrink: 0;
  }

  h4 {
    margin: 0 0 8px 0;
    color: ${props => props.$isPaid ? '#e65100' : '#2e7d32'};
    font-size: 1.3rem;
  }

  p {
    margin: 0;
    color: #666;
    line-height: 1.6;
  }

  strong {
    color: ${props => props.$isPaid ? '#ff6f00' : '#1b5e20'};
    font-size: 1.1rem;
  }
`;

const FeeFormulaInfo = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  padding: 10px 12px;
  margin-top: 12px;

  small {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.8;
    display: block;
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

const FeeDisplayBox = styled.div`
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 2px solid #2196f3;
  border-radius: 8px;
  padding: 16px 20px;
  margin: 8px 0;
`;

const FeeAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1565c0;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FeeSource = styled.div`
  font-size: 0.9rem;
  color: #555;
  font-style: italic;

  strong {
    color: #0d47a1;
  }
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
