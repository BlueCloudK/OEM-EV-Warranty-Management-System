import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCustomerAccount } from '../../hooks/useCreateCustomerAccount';
import * as S from './CreateCustomerAccount.styles';
import {
  FaUserPlus, FaArrowLeft, FaUser, FaEnvelope, FaLock, FaMapMarkerAlt,
  FaEye, FaEyeSlash, FaSave, FaPhone, FaAddressBook
} from 'react-icons/fa';

// Main Presentational Component
const CreateCustomerAccount = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    loading,
    formData,
    formErrors,
    submitStatus,
    createdCustomer,
    handleInputChange,
    handleSubmit,
  } = useCreateCustomerAccount();

  return (
    <S.PageContainer>
      <S.ContentWrapper>
        <S.Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <S.BackButton onClick={() => navigate('/scstaff')}><FaArrowLeft /> Quay lại</S.BackButton>
            <div>
              <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}><FaUserPlus style={{ color: '#ef4444' }} />Tạo Tài Khoản Khách Hàng</h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>Tạo tài khoản và hồ sơ cho khách hàng mới trong một bước.</p>
            </div>
          </div>
        </S.Header>

        {submitStatus && (
          <S.Notification type={submitStatus}>
            {submitStatus === 'success' ? (
              <p>✅ Thành công! Tài khoản cho <strong>{createdCustomer?.name}</strong> đã được tạo. Đang chuyển hướng...</p>
            ) : (
              <p>❌ Lỗi: {formErrors.general || 'Đã có lỗi xảy ra.'}</p>
            )}
          </S.Notification>
        )}

        <S.FormContainer>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <S.FormGrid>
              <S.FullWidthField>
                <label><FaAddressBook /> Họ và tên *</label>
                <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Nguyễn Văn A" />
                {formErrors.name && <p>{formErrors.name}</p>}
              </S.FullWidthField>

              <div>
                <label><FaUser /> Tên đăng nhập *</label>
                <input type="text" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} placeholder="nguyenvana" />
                {formErrors.username && <p>{formErrors.username}</p>}
              </div>

              <div>
                <label><FaEnvelope /> Email *</label>
                <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="nguyenvana@email.com" />
                {formErrors.email && <p>{formErrors.email}</p>}
              </div>

              <div>
                <label><FaPhone /> Số điện thoại *</label>
                <input type="text" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="09xxxxxxxx" />
                {formErrors.phone && <p>{formErrors.phone}</p>}
              </div>

              <div>
                <label><FaLock /> Mật khẩu *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Ít nhất 6 ký tự" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.password && <p>{formErrors.password}</p>}
              </div>

              <S.FullWidthField>
                <label><FaMapMarkerAlt /> Địa chỉ *</label>
                <textarea value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} rows={3} placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" />
                {formErrors.address && <p>{formErrors.address}</p>}
              </S.FullWidthField>
            </S.FormGrid>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <S.Button type="button" onClick={() => navigate('/scstaff')}>Hủy</S.Button>
              <S.Button $primary type="submit" disabled={loading}> {/* Changed primary to $primary */}
                {loading ? <S.Spinner><FaSpinner /></S.Spinner> : <FaSave />} {loading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
              </S.Button>
            </div>
          </form>
        </S.FormContainer>
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default CreateCustomerAccount;
