import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendar,
  FaSpinner,
  FaArrowLeft,
  FaUserCircle
} from 'react-icons/fa';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Mock profile data
  const mockProfile = {
    customerId: "123e4567-e89b-12d3-a456-426614174000",
    name: "Nguyễn Văn An",
    email: "nguyen.van.an@email.com",
    phone: "+84901234567",
    address: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    createdAt: "2024-01-15T10:30:00.000+00:00",
    userId: 5,
    username: "nguyen_van_an"
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name,
          email: mockProfile.email,
          phone: mockProfile.phone,
          address: mockProfile.address
        });
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      // First get current user info to find customer profile
      const userResponse = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ User data:', userData);
        
        // Get customer profile by user ID
        const profileResponse = await fetch(`${API_BASE_URL}/api/customers/by-user/${userData.userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Profile data:', profileData);
          
          // Handle both single customer and paginated response
          const customer = profileData.content ? profileData.content[0] : profileData;
          
          if (customer) {
            setProfile(customer);
            setFormData({
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address
            });
          } else {
            // Use mock data as fallback
            setProfile(mockProfile);
            setFormData({
              name: mockProfile.name,
              email: mockProfile.email,
              phone: mockProfile.phone,
              address: mockProfile.address
            });
          }
        } else {
          console.error('Failed to fetch profile:', profileResponse.status);
          // Use mock data as fallback
          setProfile(mockProfile);
          setFormData({
            name: mockProfile.name,
            email: mockProfile.email,
            phone: mockProfile.phone,
            address: mockProfile.address
          });
        }
      } else {
        console.error('Failed to fetch user data:', userResponse.status);
        // Use mock data as fallback
        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name,
          email: mockProfile.email,
          phone: mockProfile.phone,
          address: mockProfile.address
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use mock data as fallback
      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone,
        address: mockProfile.address
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên là bắt buộc';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^(\+84|0)[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    }
    
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      // Use the self-service profile update endpoint
      const response = await fetch(`${API_BASE_URL}/api/customers/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId: profile.userId
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log('✅ Profile updated:', updatedProfile);
        
        setProfile(updatedProfile);
        setEditing(false);
        setFormErrors({});
        
        alert('Cập nhật profile thành công!');
      } else {
        const error = await response.json();
        console.error('Failed to update profile:', error);
        alert(`Cập nhật profile thất bại: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Lỗi khi cập nhật profile. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address
    });
    setFormErrors({});
    setEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: '48px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '18px' }}>Đang tải thông tin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: 'auto' }}>
        {/* Header */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => navigate('/customer/dashboard')}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaArrowLeft /> Quay lại
              </button>
              <div>
                <h1 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaUserCircle style={{ color: '#3b82f6' }} />
                  Profile của tôi
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                  Quản lý thông tin cá nhân của bạn
                </p>
              </div>
            </div>
            
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <FaEdit /> Chỉnh sửa
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px'
                  }}
                >
                  <FaTimes /> Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaSave />}
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          {profile && (
            <div>
              {/* Profile Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '24px' }}>
                    {profile.name}
                  </h2>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                    Customer ID: {profile.customerId?.substring(0, 8)}...
                  </p>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    Username: {profile.username} (User ID: {profile.userId})
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Name Field */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      <FaUser style={{ marginRight: '8px', color: '#6b7280' }} />
                      Họ và tên
                    </label>
                    {editing ? (
                      <div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: formErrors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Nhập họ và tên"
                        />
                        {formErrors.name && (
                          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
                            {formErrors.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p style={{ 
                        margin: 0, 
                        padding: '12px', 
                        background: '#f9fafb', 
                        borderRadius: '8px',
                        color: '#1f2937',
                        fontSize: '14px'
                      }}>
                        {profile.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      <FaEnvelope style={{ marginRight: '8px', color: '#6b7280' }} />
                      Email
                    </label>
                    {editing ? (
                      <div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: formErrors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Nhập email"
                        />
                        {formErrors.email && (
                          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p style={{ 
                        margin: 0, 
                        padding: '12px', 
                        background: '#f9fafb', 
                        borderRadius: '8px',
                        color: '#1f2937',
                        fontSize: '14px'
                      }}>
                        {profile.email}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Phone Field */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      <FaPhone style={{ marginRight: '8px', color: '#6b7280' }} />
                      Số điện thoại
                    </label>
                    {editing ? (
                      <div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: formErrors.phone ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Nhập số điện thoại"
                        />
                        {formErrors.phone && (
                          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
                            {formErrors.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p style={{ 
                        margin: 0, 
                        padding: '12px', 
                        background: '#f9fafb', 
                        borderRadius: '8px',
                        color: '#1f2937',
                        fontSize: '14px'
                      }}>
                        {profile.phone}
                      </p>
                    )}
                  </div>

                  {/* Created Date */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      <FaCalendar style={{ marginRight: '8px', color: '#6b7280' }} />
                      Ngày tạo tài khoản
                    </label>
                    <p style={{ 
                      margin: 0, 
                      padding: '12px', 
                      background: '#f9fafb', 
                      borderRadius: '8px',
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Address Field */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    <FaMapMarkerAlt style={{ marginRight: '8px', color: '#6b7280' }} />
                    Địa chỉ
                  </label>
                  {editing ? (
                    <div>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: formErrors.address ? '2px solid #ef4444' : '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          minHeight: '80px',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Nhập địa chỉ đầy đủ"
                      />
                      {formErrors.address && (
                        <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={{ 
                      margin: 0, 
                      padding: '12px', 
                      background: '#f9fafb', 
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {profile.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;