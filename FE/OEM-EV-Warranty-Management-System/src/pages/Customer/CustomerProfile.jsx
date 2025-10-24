import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api/customerApi';
import { dataApi } from '../../api/dataApi';
import * as S from './CustomerProfile.styles';
import {
  FaUser, FaSpinner, FaArrowLeft, FaInfoCircle, FaEdit, FaSave, FaTimes,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle
} from 'react-icons/fa';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get customer profile by user's customerId
      if (user?.customerId) {
        const response = await dataApi.getCustomerById(user.customerId);
        setProfile(response);
        setFormData({
          customerName: response.customerName || '',
          email: response.email || '',
          phone: response.phone || '',
          address: response.address || ''
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
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
    setFormData({
      customerName: profile.customerName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.customerName.trim()) {
      setError('Tên khách hàng không được để trống');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email không được để trống');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Số điện thoại không được để trống');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await customerApi.updateMyProfile(formData);

      setSuccess('Cập nhật hồ sơ thành công!');
      setEditing(false);

      // Refresh profile
      await fetchProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Không thể cập nhật hồ sơ.");
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
            <S.Avatar>{getInitials(profile?.customerName)}</S.Avatar>
            <S.ProfileInfo>
              <S.ProfileName>{profile?.customerName || 'Khách hàng'}</S.ProfileName>
              <S.ProfileEmail>{profile?.email || 'N/A'}</S.ProfileEmail>
            </S.ProfileInfo>
          </S.ProfileHeader>

          {/* View Mode */}
          <S.InfoSection $hidden={editing}>
            <S.InfoGrid>
              <S.InfoItem>
                <S.InfoLabel><FaUser /> Tên khách hàng</S.InfoLabel>
                <S.InfoValue>{profile?.customerName || 'N/A'}</S.InfoValue>
              </S.InfoItem>
              <S.InfoItem>
                <S.InfoLabel><FaEnvelope /> Email</S.InfoLabel>
                <S.InfoValue>{profile?.email || 'N/A'}</S.InfoValue>
              </S.InfoItem>
              <S.InfoItem>
                <S.InfoLabel><FaPhone /> Số điện thoại</S.InfoLabel>
                <S.InfoValue>{profile?.phone || 'N/A'}</S.InfoValue>
              </S.InfoItem>
              <S.InfoItem>
                <S.InfoLabel><FaMapMarkerAlt /> Địa chỉ</S.InfoLabel>
                <S.InfoValue>{profile?.address || 'Chưa cập nhật'}</S.InfoValue>
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
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Nhập tên khách hàng"
                    required
                  />
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>Email *</S.Label>
                  <S.Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                    required
                  />
                </S.FormGroup>

                <S.FormGroup>
                  <S.Label>Số điện thoại *</S.Label>
                  <S.Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </S.FormGroup>

                <S.FormGroup $fullWidth>
                  <S.Label>Địa chỉ</S.Label>
                  <S.TextArea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                  />
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
