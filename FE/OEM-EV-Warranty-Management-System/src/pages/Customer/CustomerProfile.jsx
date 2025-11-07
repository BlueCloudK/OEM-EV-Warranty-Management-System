import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../../api/customerApi';
import * as S from './CustomerProfile.styles';
import {
  FaUser, FaSpinner, FaArrowLeft, FaInfoCircle, FaEdit, FaSave, FaTimes,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle
} from 'react-icons/fa';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    userId: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get full customer profile from /api/profile
      const response = await customerApi.getMyProfile();
      console.log('📋 Customer profile loaded:', response);

      setProfile(response);

      // Handle both CustomerProfileResponseDTO and basic user response
      const name = response.customerName || response.username || response.name || '';
      const phone = response.customerPhone || response.phone || '';
      const address = response.address || '';

      console.log('🔍 Mapped values:', { name, phone, address, userId: response.userId });
      console.log('📌 Available fields:', {
        customerName: response.customerName,
        username: response.username,
        name: response.name,
        customerPhone: response.customerPhone,
        phone: response.phone,
        email: response.email || response.customerEmail,
        address: response.address
      });

      setFormData({
        name: name,
        phone: phone,
        address: address,
        userId: response.userId
      });
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      setError(err.response?.data?.message || "Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
    setSuccess(null);
    // Reset form to original profile data
    const name = profile.customerName || profile.username || profile.name || '';
    const phone = profile.customerPhone || profile.phone || '';
    const address = profile.address || '';

    setFormData({
      name: name,
      phone: phone,
      address: address,
      userId: profile.userId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Tên khách hàng không được để trống');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Số điện thoại không được để trống');
      return;
    }
    if (!formData.address.trim()) {
      setError('Địa chỉ không được để trống');
      return;
    }
    if (formData.address.trim().length < 10) {
      setError('Địa chỉ phải có ít nhất 10 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('📤 Updating profile with data:', formData);

      // Backend expects: { name, phone, address, userId }
      await customerApi.updateMyProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        userId: formData.userId
      });

      setSuccess('Cập nhật hồ sơ thành công!');
      setEditing(false);

      // Refresh profile
      await fetchProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      setError(err.response?.data?.message || err.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading && !profile) {
    return (
      <S.PageContainer>
        <S.LoadingState>
          <div>
            <FaSpinner />
            <p>Đang tải hồ sơ...</p>
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
              <S.HeaderTitle><FaUser /> Hồ sơ cá nhân</S.HeaderTitle>
              <S.HeaderSubtitle>Quản lý thông tin tài khoản của bạn</S.HeaderSubtitle>
            </div>
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

        <S.ProfileCard>
          <S.ProfileHeader>
            <S.Avatar>{getInitials(profile?.customerName || profile?.username || profile?.name)}</S.Avatar>
            <S.ProfileInfo>
              <S.ProfileName>{profile?.customerName || profile?.username || profile?.name || 'Khách hàng'}</S.ProfileName>
              <S.ProfileEmail>{profile?.customerEmail || profile?.email || 'N/A'}</S.ProfileEmail>
            </S.ProfileInfo>
          </S.ProfileHeader>

          {/* View Mode */}
          <S.InfoSection $hidden={editing}>
            <S.InfoGrid>
              <S.InfoItem>
                <S.InfoLabel><FaUser /> Tên khách hàng</S.InfoLabel>
                <S.InfoValue>{profile?.customerName || profile?.username || profile?.name || 'N/A'}</S.InfoValue>
              </S.InfoItem>
              <S.InfoItem>
                <S.InfoLabel><FaEnvelope /> Email</S.InfoLabel>
                <S.InfoValue>{profile?.customerEmail || profile?.email || 'N/A'}</S.InfoValue>
              </S.InfoItem>
              <S.InfoItem>
                <S.InfoLabel><FaPhone /> Số điện thoại</S.InfoLabel>
                <S.InfoValue>{profile?.customerPhone || profile?.phone || 'N/A'}</S.InfoValue>
              </S.InfoItem>
              <S.InfoItem>
                <S.InfoLabel><FaMapMarkerAlt /> Địa chỉ</S.InfoLabel>
                <S.InfoValue>{profile?.address || 'Chưa cập nhật (cần ít nhất 10 ký tự)'}</S.InfoValue>
              </S.InfoItem>
            </S.InfoGrid>

            <S.ButtonGroup style={{ marginTop: '24px' }}>
              <S.Button $primary onClick={handleEdit}>
                <FaEdit /> Chỉnh sửa hồ sơ
              </S.Button>
            </S.ButtonGroup>
          </S.InfoSection>

          {/* Edit Mode */}
          <S.FormSection $hidden={!editing}>
            <form onSubmit={handleSubmit}>
              <S.FormGrid>
                <S.FormGroup $fullWidth>
                  <S.Label>Tên khách hàng *</S.Label>
                  <S.Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập tên khách hàng (ví dụ: Nguyễn Văn A)"
                    required
                  />
                  <S.HelperText>Mỗi từ phải viết hoa chữ cái đầu, hỗ trợ tiếng Việt có dấu</S.HelperText>
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>Email (chỉ xem)</S.Label>
                  <S.Input
                    type="email"
                    value={profile?.customerEmail || profile?.email || ''}
                    disabled
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <S.HelperText>Email không thể thay đổi. Liên hệ admin nếu cần cập nhật.</S.HelperText>
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>Số điện thoại *</S.Label>
                  <S.Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                    required
                  />
                  <S.HelperText>Định dạng: +84xxxxxxxxx hoặc 0xxxxxxxxx</S.HelperText>
                </S.FormGroup>

                <S.FormGroup $fullWidth>
                  <S.Label>Địa chỉ *</S.Label>
                  <S.TextArea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ của bạn (tối thiểu 10 ký tự)"
                    required
                  />
                  <S.HelperText>Địa chỉ chi tiết để liên hệ và gửi thông báo (tối thiểu 10 ký tự)</S.HelperText>
                </S.FormGroup>
              </S.FormGrid>

              <S.ButtonGroup>
                <S.Button type="button" $danger onClick={handleCancel}>
                  <FaTimes /> Hủy
                </S.Button>
                <S.Button type="submit" $primary disabled={loading}>
                  {loading ? <FaSpinner /> : <FaSave />}
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </S.Button>
              </S.ButtonGroup>
            </form>
          </S.FormSection>
        </S.ProfileCard>
      </S.ContentWrapper>
    </S.PageContainer>
  );
};

export default CustomerProfile;
