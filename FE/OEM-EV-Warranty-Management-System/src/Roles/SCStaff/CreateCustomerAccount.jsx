import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaMapMarkerAlt,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaSpinner
} from 'react-icons/fa';

const CreateCustomerAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và gạch ngang';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Định dạng email không hợp lệ';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    } else if (formData.address.length < 10) {
      errors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');

      console.log('🔄 Creating customer account:', {
        username: formData.username,
        email: formData.email,
        address: formData.address
      });

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Customer account created successfully:', result);
        
        setSubmitStatus('success');
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          address: ''
        });
        setFormErrors({});
        
        // Show success message for 2 seconds then redirect
        setTimeout(() => {
          navigate('/scstaff');
        }, 2000);
        
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create customer account:', errorData);
        setSubmitStatus('error');
        
        // Handle specific API errors
        if (response.status === 400) {
          if (errorData.message?.includes('username')) {
            setFormErrors({ username: 'Tên đăng nhập đã tồn tại' });
          } else if (errorData.message?.includes('email')) {
            setFormErrors({ email: 'Email đã được sử dụng' });
          } else {
            setFormErrors({ general: errorData.message || 'Dữ liệu không hợp lệ' });
          }
        } else {
          setFormErrors({ general: 'Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.' });
        }
      }
    } catch (error) {
      console.error('❌ Error creating customer account:', error);
      setSubmitStatus('error');
      setFormErrors({ general: 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Generate random username (helper function)
  const generateRandomUsername = () => {
    const adjectives = ['Smart', 'Quick', 'Bright', 'Cool', 'Fast', 'Sharp', 'Bold', 'Swift'];
    const nouns = ['User', 'Customer', 'Client', 'Member', 'Person', 'Guest'];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/scstaff')}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaArrowLeft /> Quay lại Dashboard
            </button>
            <div>
              <h1 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaUserPlus style={{ color: '#ef4444' }} />
                Tạo Tài Khoản Khách Hàng
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                Tạo tài khoản mới cho khách hàng với thông tin đầy đủ
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#065f46'
          }}>
            <strong>✅ Thành công!</strong> Tài khoản khách hàng đã được tạo thành công. Đang chuyển hướng...
          </div>
        )}

        {formErrors.general && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#dc2626'
          }}>
            <strong>❌ Lỗi:</strong> {formErrors.general}
          </div>
        )}

        {/* Form */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '24px' }}>
              
              {/* Username Field */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaUser style={{ color: '#6b7280' }} />
                  Tên đăng nhập *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: formErrors.username ? '2px solid #ef4444' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nhập tên đăng nhập (ví dụ: john_doe123)"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('username', generateRandomUsername())}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#f3f4f6',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    Tạo ngẫu nhiên
                  </button>
                </div>
                {formErrors.username && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {formErrors.username}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaEnvelope style={{ color: '#6b7280' }} />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.email ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Nhập địa chỉ email (ví dụ: khachhang@email.com)"
                />
                {formErrors.email && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaLock style={{ color: '#6b7280' }} />
                  Mật khẩu *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '45px',
                      border: formErrors.password ? '2px solid #ef4444' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.password && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Address Field */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaMapMarkerAlt style={{ color: '#6b7280' }} />
                  Địa chỉ *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formErrors.address ? '2px solid #ef4444' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Nhập địa chỉ đầy đủ (ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM)"
                />
                {formErrors.address && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/scstaff')}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: loading ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Tạo Tài Khoản
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Info Card */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '24px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>📝 Lưu ý:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '14px' }}>
            <li>Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới (_) và gạch ngang (-)</li>
            <li>Mật khẩu phải có ít nhất 6 ký tự</li>
            <li>Email phải có định dạng hợp lệ</li>
            <li>Địa chỉ phải đầy đủ và chi tiết</li>
          </ul>
        </div>
      </div>
      
      {/* CSS Animation for spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CreateCustomerAccount;