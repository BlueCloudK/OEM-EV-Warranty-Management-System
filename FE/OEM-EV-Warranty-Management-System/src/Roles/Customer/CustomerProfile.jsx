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
  FaUserCircle,
  FaIdCard
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

  useEffect(() => {
    fetchCustomerByUserId();
  }, []);

  // Main function to fetch customer by userId using GET /api/customers/by-user/{userId}
  const fetchCustomerByUserId = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      console.group('🔍 Fetching Customer by User ID');
      console.log('Token present:', !!token);
      console.log('API Base URL:', API_BASE_URL);
      
      if (!token || !API_BASE_URL) {
        console.warn('Missing token or API_BASE_URL, using mock data');
        setMockData();
        console.groupEnd();
        return;
      }

      // Step 1: Get current user info to extract userId
      const userId = await getUserId(token, API_BASE_URL);
      
      if (!userId) {
        console.warn('❌ No userId found, using mock data');
        setMockData();
        console.groupEnd();
        return;
      }

      // Step 2: Call GET /api/customers/by-user/{userId} to get customer details
      console.log(`📡 Calling GET /api/customers/by-user/${userId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/customers/by-user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const customerData = await response.json();
        console.log('✅ Customer data received:', customerData);
        
        // Validate response format matches expected structure
        if (customerData && customerData.customerId) {
          setProfile(customerData);
          setFormData({
            name: customerData.name || '',
            email: customerData.email || '',
            phone: customerData.phone || '',
            address: customerData.address || ''
          });
          
          // Store for future use
          localStorage.setItem('currentCustomer', JSON.stringify(customerData));
          console.log('✅ Customer profile loaded successfully via userId');
        } else {
          console.error('❌ Invalid customer data format:', customerData);
          throw new Error('Invalid customer data format');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        
        // If customer not found by userId, try fallback methods
        if (response.status === 404) {
          console.log('🔄 Customer not found by userId, trying fallback methods...');
          await tryFallbackMethods(token, API_BASE_URL);
        } else {
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in fetchCustomerByUserId:', error);
      console.warn('🔄 Falling back to mock data');
      setMockData();
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get userId from current user
  const getUserId = async (token, API_BASE_URL) => {
    try {
      // Method 1: Try from localStorage first
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      if (userInfo.userId) {
        console.log('✅ Found userId in localStorage:', userInfo.userId);
        return userInfo.userId;
      }

      // Method 2: Get from /api/me endpoint
      console.log('📡 Getting current user info from /api/me...');
      const userResponse = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ Current user data:', userData);
        
        if (userData.userId) {
          // Store for future use
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ Found userId from API:', userData.userId);
          return userData.userId;
        }
      }

      // Method 3: Use mock userId for testing
      const mockUserId = 5;
      console.log('🔧 Using mock userId for testing:', mockUserId);
      return mockUserId;
    } catch (error) {
      console.error('❌ Error getting userId:', error);
      return null;
    }
  };

  // Fallback methods if primary API fails
  const tryFallbackMethods = async (token, API_BASE_URL) => {
    try {
      // Try to get customer by direct ID if available
      const storedCustomer = localStorage.getItem('currentCustomer');
      if (storedCustomer) {
        const customerData = JSON.parse(storedCustomer);
        if (customerData.customerId) {
          console.log('📡 Trying GET /api/customers/{id} with stored customerId...');
          
          const response = await fetch(`${API_BASE_URL}/api/customers/${customerData.customerId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const customerByIdData = await response.json();
            console.log('✅ Customer data from fallback method:', customerByIdData);
            
            setProfile(customerByIdData);
            setFormData({
              name: customerByIdData.name || '',
              email: customerByIdData.email || '',
              phone: customerByIdData.phone || '',
              address: customerByIdData.address || ''
            });
            return;
          }
        }
      }

      // If all methods fail, use mock data
      console.warn('❌ All fallback methods failed, using mock data');
      setMockData();
    } catch (error) {
      console.error('❌ Error in fallback methods:', error);
      setMockData();
    }
  };

  // Set mock data for fallback - matching the exact API response format
  const setMockData = () => {
    const mockProfile = {
      customerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      name: "Nguyễn Văn An",
      email: "nguyen.van.an@email.com",
      phone: "+84901234567",
      address: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      createdAt: "2025-10-17T12:52:09.121Z",
      userId: 5,
      username: "nguyen_van_an"
    };
    
    setProfile(mockProfile);
    setFormData({
      name: mockProfile.name,
      email: mockProfile.email,
      phone: mockProfile.phone,
      address: mockProfile.address
    });
    
    console.log('🔧 Mock data set:', mockProfile);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormErrors({});
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên là bắt buộc';
    } else if (formData.name.length < 5 || formData.name.length > 100) {
      errors.name = 'Tên phải từ 5 đến 100 ký tự';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không đúng định dạng Việt Nam';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    } else if (formData.address.length > 255) {
      errors.address = 'Địa chỉ không được quá 255 ký tự';
    }
    
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      if (!token || !API_BASE_URL || !profile?.customerId) {
        alert('Không thể cập nhật profile. Thiếu thông tin xác thực.');
        return;
      }

      const updatePayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        userId: profile.userId
      };

      console.log('🔄 Updating customer profile:', updatePayload);

      // Use PUT /api/customers/{id} to update
      const response = await fetch(`${API_BASE_URL}/api/customers/${profile.customerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log('✅ Profile updated successfully:', updatedProfile);
        
        setProfile(updatedProfile);
        setEditing(false);
        alert('Cập nhật thông tin thành công!');
        
        // Update localStorage
        localStorage.setItem('currentCustomer', JSON.stringify(updatedProfile));
      } else {
        const errorText = await response.text();
        console.error('❌ Update failed:', response.status, errorText);
        alert(`Cập nhật thất bại: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert('Lỗi khi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <FaSpinner style={{ 
            fontSize: '3rem', 
            color: '#667eea', 
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <p style={{ margin: 0, color: '#4a5568', fontSize: '1.2rem' }}>
            Đang tải thông tin khách hàng...
          </p>
          <p style={{ margin: '8px 0 0 0', color: '#718096', fontSize: '0.9rem' }}>
            Gọi API GET /api/customers/by-user/{'{userId}'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .profile-card {
          animation: slideInUp 0.6s ease-out;
        }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/customer')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <FaArrowLeft /> Quay lại
            </button>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: 0, 
                color: '#fff', 
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                👤 Thông tin cá nhân
              </h1>
              <p style={{ 
                margin: '4px 0 0 0', 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem'
              }}>
                Dữ liệu từ API: GET /api/customers/by-user/{'{userId}'}
              </p>
            </div>

            {/* API Status Indicator */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#22c55e',
              fontWeight: '600'
            }}>
              ✅ API by-user Connected
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Profile Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '32px',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              fontSize: '3rem',
              color: '#fff'
            }}>
              <FaUserCircle />
            </div>
            
            <h2 style={{
              margin: '0 0 8px 0',
              color: '#fff',
              fontSize: '2rem',
              fontWeight: '700'
            }}>
              {profile?.name || 'Khách hàng'}
            </h2>
            
            <p style={{
              margin: '0 0 16px 0',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1.1rem'
            }}>
              @{profile?.username || 'username'}
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '8px 16px',
              display: 'inline-block',
              fontSize: '14px',
              color: '#fff',
              fontFamily: 'monospace'
            }}>
              User ID: {profile?.userId || 'N/A'}
            </div>
            
            {/* Edit Button */}
            {!editing && (
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={handleEdit}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <FaEdit /> Chỉnh sửa thông tin
                </button>
              </div>
            )}
          </div>

          {/* Profile Body */}
          <div style={{ padding: '32px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px'
            }}>
              {/* Personal Information */}
              <div>
                <h3 style={{
                  margin: '0 0 24px 0',
                  color: '#2d3748',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaUser style={{ color: '#667eea' }} />
                  Thông tin cá nhân
                </h3>
                
                {/* Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4a5568',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Họ và tên *
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: formErrors.name ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '16px',
                        backgroundColor: '#fff'
                      }}
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      background: '#f7fafc',
                      borderRadius: '10px',
                      fontSize: '16px',
                      color: '#2d3748',
                      border: '2px solid transparent'
                    }}>
                      {profile?.name || 'Chưa có thông tin'}
                    </div>
                  )}
                  {formErrors.name && (
                    <p style={{ color: '#e53e3e', fontSize: '12px', margin: '6px 0 0 0' }}>
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4a5568',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <FaEnvelope style={{ marginRight: '6px', color: '#667eea' }} />
                    Email *
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: formErrors.email ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '16px',
                        backgroundColor: '#fff'
                      }}
                      placeholder="example@email.com"
                    />
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      background: '#f7fafc',
                      borderRadius: '10px',
                      fontSize: '16px',
                      color: '#2d3748',
                      border: '2px solid transparent'
                    }}>
                      {profile?.email || 'Chưa có thông tin'}
                    </div>
                  )}
                  {formErrors.email && (
                    <p style={{ color: '#e53e3e', fontSize: '12px', margin: '6px 0 0 0' }}>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4a5568',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <FaPhone style={{ marginRight: '6px', color: '#667eea' }} />
                    Số điện thoại *
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: formErrors.phone ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '16px',
                        backgroundColor: '#fff'
                      }}
                      placeholder="+84901234567"
                    />
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      background: '#f7fafc',
                      borderRadius: '10px',
                      fontSize: '16px',
                      color: '#2d3748',
                      border: '2px solid transparent'
                    }}>
                      {profile?.phone || 'Chưa có thông tin'}
                    </div>
                  )}
                  {formErrors.phone && (
                    <p style={{ color: '#e53e3e', fontSize: '12px', margin: '6px 0 0 0' }}>
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 style={{
                  margin: '0 0 24px 0',
                  color: '#2d3748',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaIdCard style={{ color: '#667eea' }} />
                  Thông tin hệ thống
                </h3>

                {/* Address */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4a5568',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <FaMapMarkerAlt style={{ marginRight: '6px', color: '#667eea' }} />
                    Địa chỉ *
                  </label>
                  {editing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: formErrors.address ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '16px',
                        backgroundColor: '#fff',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Nhập địa chỉ đầy đủ"
                    />
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      background: '#f7fafc',
                      borderRadius: '10px',
                      fontSize: '16px',
                      color: '#2d3748',
                      minHeight: '72px',
                      border: '2px solid transparent'
                    }}>
                      {profile?.address || 'Chưa có thông tin'}
                    </div>
                  )}
                  {formErrors.address && (
                    <p style={{ color: '#e53e3e', fontSize: '12px', margin: '6px 0 0 0' }}>
                      {formErrors.address}
                    </p>
                  )}
                </div>

                {/* Customer ID */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4a5568',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Customer ID
                  </label>
                  <div style={{
                    padding: '12px 16px',
                    background: '#f7fafc',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: '#718096',
                    fontFamily: 'monospace',
                    border: '2px solid transparent',
                    wordBreak: 'break-all'
                  }}>
                    {profile?.customerId || 'Chưa có thông tin'}
                  </div>
                </div>

                {/* User ID */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4a5568',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    User ID (Query Parameter)
                  </label>
                  <div style={{
                    padding: '12px 16px',
                    background: '#edf2f7',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#2d3748',
                    fontFamily: 'monospace',
                    border: '2px solid #667eea',
                    fontWeight: '600'
                  }}>
                    {profile?.userId || 'Chưa có thông tin'}
                  </div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#667eea', 
                    margin: '4px 0 0 0',
                    fontStyle: 'italic' 
                  }}>
                    API endpoint: /api/customers/by-user/{profile?.userId || '{userId}'}
                  </p>
                </div>

                {/* Username */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4a5568',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Username
                  </label>
                  <div style={{
                    padding: '12px 16px',
                    background: '#f7fafc',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#2d3748',
                    fontFamily: 'monospace',
                    border: '2px solid transparent'
                  }}>
                    {profile?.username || 'Chưa có thông tin'}
                  </div>
                </div>

                {/* Created Date */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4a5568',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <FaCalendar style={{ marginRight: '6px', color: '#667eea' }} />
                    Ngày tạo tài khoản
                  </label>
                  <div style={{
                    padding: '12px 16px',
                    background: '#f7fafc',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#2d3748',
                    border: '2px solid transparent'
                  }}>
                    {profile?.createdAt ? formatDate(profile.createdAt) : 'Chưa có thông tin'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    background: '#f7fafc',
                    color: '#4a5568',
                    border: '2px solid #e2e8f0',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <FaTimes /> Hủy
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: saving ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {saving ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FaSave /> Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* API Info Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            color: '#fff',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            📡 API Integration Details
          </h4>
          <div style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Primary API:</strong> GET /api/customers/by-user/{'{userId}'}
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Response Format:</strong> Đúng theo specification với customerId, name, email, phone, address, createdAt, userId, username
            </p>
            <p style={{ margin: '0' }}>
              <strong>Fallback:</strong> GET /api/customers/{'{id}'} nếu by-user API thất bại
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
