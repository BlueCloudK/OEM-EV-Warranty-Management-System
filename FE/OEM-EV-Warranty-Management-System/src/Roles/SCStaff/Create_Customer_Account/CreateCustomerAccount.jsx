// ===========================================================================================
// PHẦN 1: IMPORT CÁC THƯ VIỆN VÀ COMPONENTS CẦN THIẾT
// ===========================================================================================

import React, { useState } from 'react'; // React hook để quản lý state
import { useNavigate } from 'react-router-dom'; // Hook để điều hướng giữa các trang
import { 
  FaUserPlus,     // Icon thêm người dùng
  FaArrowLeft,    // Icon mũi tên quay lại
  FaUser,         // Icon người dùng (cho username)
  FaEnvelope,     // Icon thư (cho email)
  FaLock,         // Icon khóa (cho password)
  FaMapMarkerAlt, // Icon vị trí (cho địa chỉ)
  FaEye,          // Icon mắt mở (hiện password)
  FaEyeSlash,     // Icon mắt đóng (ẩn password)
  FaSave,         // Icon lưu
  FaSpinner       // Icon loading xoay tròn
} from 'react-icons/fa';

// ===========================================================================================
// PHẦN 2: COMPONENT CHÍNH VÀ KHAI BÁO CÁC STATE
// ===========================================================================================

const CreateCustomerAccount = () => {
  // Hook để điều hướng trang
  const navigate = useNavigate();
  
  // ===== CÁC STATE QUẢN LÝ COMPONENT =====
  const [loading, setLoading] = useState(false);           // Trạng thái loading khi submit form
  const [showPassword, setShowPassword] = useState(false); // Ẩn/hiện mật khẩu
  
  // State chứa dữ liệu form
  const [formData, setFormData] = useState({
    username: '',  // Tên đăng nhập
    email: '',     // Email khách hàng
    password: '',  // Mật khẩu
    address: ''    // Địa chỉ khách hàng
  });
  
  // State chứa lỗi validation của từng field
  const [formErrors, setFormErrors] = useState({});
  
  // State theo dõi trạng thái submit: 'success'(thành công), 'error'(lỗi), null(chưa submit)
  const [submitStatus, setSubmitStatus] = useState(null);
  
  // State lưu trữ userId sau khi tạo tài khoản thành công
  const [createdUserId, setCreatedUserId] = useState(null);

  // ===========================================================================================
  // PHẦN 3: HÀM VALIDATION FORM - KIỂM TRA DỮ LIỆU ĐẦU VÀO
  // ===========================================================================================
  
  const validateForm = () => {
    const errors = {};
    
    // ===== VALIDATION CHO USERNAME =====
    if (!formData.username.trim()) {
      errors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và gạch ngang';
    }
    
    // ===== VALIDATION CHO EMAIL =====
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Định dạng email không hợp lệ';
    }
    
    // ===== VALIDATION CHO PASSWORD =====
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // ===== VALIDATION CHO ADDRESS =====
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    } else if (formData.address.length < 10) {
      errors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }
    
    return errors; // Trả về object chứa các lỗi (nếu có)
  };

  // ===========================================================================================
  // PHẦN 4: HÀM XỬ LÝ SUBMIT FORM - GỬI DỮ LIỆU LÊN SERVER
  // ===========================================================================================
  
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form reload trang
    
    // ===== BƯỚC 1: VALIDATE DỮ LIỆU =====
    const errors = validateForm();
    setFormErrors(errors);
    
    // Nếu có lỗi thì dừng lại, không submit
    if (Object.keys(errors).length > 0) {
      return;
    }

    // ===== BƯỚC 2: BẮT ĐẦU QUẢN LÝ LOADING STATE =====
    setLoading(true);        // Bật trạng thái loading
    setSubmitStatus(null);   // Reset trạng thái submit
    setCreatedUserId(null);  // Reset userId cũ

    try {
      // ===== BƯỚC 3: CHUẨN BỊ VÀ GỬI REQUEST =====
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Lấy URL API từ env
      const token = localStorage.getItem('token');             // Lấy token xác thực

      console.log('🔄 Creating customer account:', {
        username: formData.username,
        email: formData.email,
        address: formData.address
      });

      // Gửi POST request để tạo tài khoản
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Thêm token để xác thực
        },
        body: JSON.stringify(formData) // Chuyển dữ liệu form thành JSON
      });

      // ===== BƯỚC 4: XỬ LÝ RESPONSE THÀNH CÔNG =====
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Customer account created successfully:', result);
        console.log('🔍 Checking for userId in response:', {
          'result.userId': result.userId,
          'result.id': result.id,
          'result.user?.id': result.user?.id,
          'result.data?.id': result.data?.id,
          'result.data?.userId': result.data?.userId,
          'full result structure': result
        });
        
        setSubmitStatus('success'); // Đánh dấu trạng thái thành công
        
        // Lưu userId từ response để chuyển hướng
        const extractUserId = (res) => {
          if (!res) return null;
          // Common shapes
          if (res.userId) return res.userId;
          if (res.id) return res.id;
          if (res.user && (res.user.id || res.user.userId)) return res.user.id || res.user.userId;
          if (res.data) {
            if (Array.isArray(res.data) && res.data.length > 0) {
              const first = res.data[0];
              if (first.id) return first.id;
              if (first.userId) return first.userId;
              if (first.user && (first.user.id || first.user.userId)) return first.user.id || first.user.userId;
            }
            if (res.data.id) return res.data.id;
            if (res.data.userId) return res.data.userId;
            if (res.data.user && (res.data.user.id || res.data.user.userId)) return res.data.user.id || res.data.user.userId;
          }
          if (res.payload && (res.payload.id || res.payload.userId)) return res.payload.id || res.payload.userId;
          return null;
        };

        let extractedUserId = extractUserId(result);
        // Normalize to string if present
        if (extractedUserId !== null && extractedUserId !== undefined) {
          extractedUserId = String(extractedUserId);
        } else {
          extractedUserId = null;
        }

        console.log('🆔 Extracted userId:', extractedUserId);
        setCreatedUserId(extractedUserId);
        
        // ===== RESET FORM SAU KHI TẠO THÀNH CÔNG =====
        setFormData({
          username: '',
          email: '',
          password: '',
          address: ''
        });
        setFormErrors({});
        
        // ===== TỰ ĐỘNG CHUYỂN HƯỚNG ĐẾN CUSTOMER MANAGEMENT SAU 3 GIÂY =====
        setTimeout(() => {
          if (extractedUserId) {
            // Chuyển hướng đến trang CustomerManagement với userId (string)
            navigate('/scstaff/customers', { 
              state: { 
                userId: extractedUserId,
                fromAccountCreation: true,
                openCreateForm: true 
              } 
            });
          } else {
            // Nếu không có userId, quay về dashboard
            navigate('/scstaff');
          }
        }, 3000);
        
      } else {
        // ===== BƯỚC 5: XỬ LÝ LỖI TỪ SERVER =====
        const errorData = await response.json();
        console.error('❌ Failed to create customer account:', errorData);
        setSubmitStatus('error');
        
        // Xử lý các loại lỗi cụ thể từ API
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
      // ===== BƯỚC 6: XỬ LÝ LỖI NETWORK/CONNECTION =====
      console.error('❌ Error creating customer account:', error);
      setSubmitStatus('error');
      setFormErrors({ general: 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.' });
    } finally {
      // ===== BƯỚC 7: LUÔN TẮT LOADING SAU KHI XONG =====
      setLoading(false);
    }
  };

  // ===========================================================================================
  // PHẦN 5: HÀM XỬ LÝ THAY ĐỔI INPUT - CẬP NHẬT FORM DATA
  // ===========================================================================================
  
  const handleInputChange = (field, value) => {
    // Cập nhật giá trị trong formData cho field tương ứng
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Xóa lỗi của field này khi user bắt đầu nhập (để UX mượt mà hơn)
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // ===========================================================================================
  // PHẦN 6: HÀM TẠO USERNAME NGẪU NHIÊN - TIỆN ÍCH CHO USER
  // ===========================================================================================
  
  const generateRandomUsername = () => {
    // Danh sách các tính từ và danh từ để tạo username
    const adjectives = ['Smart', 'Quick', 'Bright', 'Cool', 'Fast', 'Sharp', 'Bold', 'Swift'];
    const nouns = ['User', 'Customer', 'Client', 'Member', 'Person', 'Guest'];
    const randomNumber = Math.floor(Math.random() * 1000); // Số ngẫu nhiên 0-999
    
    // Chọn ngẫu nhiên 1 tính từ và 1 danh từ
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    // Ghép thành username: VD "SmartUser123"
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

  // ===========================================================================================
  // PHẦN 7: RENDER UI - HIỂN THỊ GIAO DIỆN NGƯỜI DÙNG
  // ===========================================================================================
  
  return (
    // Container chính với background gradient và padding
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: 'auto' }}>
        
        {/* ===== HEADER SECTION - TIÊU ĐỀ VÀ NÚT QUAY LẠI ===== */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Nút quay lại Dashboard */}
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
            {/* Tiêu đề và mô tả trang */}
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

        {/* ===== SUCCESS/ERROR MESSAGES - THÔNG BÁO TRẠNG THÁI ===== */}
        {submitStatus === 'success' && (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#065f46'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>✅ Thành công!</strong> Tài khoản đã được tạo thành công.
            </div>
            {createdUserId && (
              <div style={{ 
                background: '#ecfdf5', 
                padding: '12px', 
                borderRadius: '6px', 
                margin: '8px 0',
                border: '1px solid #22c55e' 
              }}>
                <strong style={{ color: '#16a34a' }}>userId: {createdUserId}</strong>
                <br />
                <span style={{ fontSize: '14px', color: '#15803d' }}>
                  Đây là userId của khách hàng dùng để tạo thông tin khách hàng
                </span>
              </div>
            )}
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              🔄 Đang chuyển hướng đến trang quản lý khách hàng để tạo thông tin chi tiết trong 3 giây...
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  if (createdUserId) {
                    navigate('/scstaff/customers', { 
                      state: { 
                        userId: createdUserId,
                        fromAccountCreation: true,
                        openCreateForm: true 
                      } 
                    });
                  } else {
                    navigate('/scstaff/customers');
                  }
                }}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ➡️ Đến trang quản lý khách hàng ngay
              </button>
              <button
                onClick={() => navigate('/scstaff')}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🏠 Về Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Hiển thị lỗi chung (nếu có) */}
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

        {/* ===== FORM SECTION - BIỂU MẪU NHẬP LIỆU ===== */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '24px' }}>
              
              {/* ===== USERNAME FIELD - TRƯỜNG TÊN ĐĂNG NHẬP ===== */}
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
                  {/* Input cho username */}
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
                  {/* Nút tạo username ngẫu nhiên */}
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
                {/* Hiển thị lỗi validation cho username (nếu có) */}
                {formErrors.username && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {formErrors.username}
                  </p>
                )}
              </div>

              {/* ===== EMAIL FIELD - TRƯỜNG EMAIL ===== */}
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
                {/* Input cho email */}
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
                {/* Hiển thị lỗi validation cho email (nếu có) */}
                {formErrors.email && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* ===== PASSWORD FIELD - TRƯỜNG MẬT KHẨU ===== */}
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
                  {/* Input cho password với tính năng ẩn/hiện */}
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
                  {/* Nút toggle ẩn/hiện mật khẩu */}
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
                {/* Hiển thị lỗi validation cho password (nếu có) */}
                {formErrors.password && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* ===== ADDRESS FIELD - TRƯỜNG ĐỊA CHỈ ===== */}
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
                {/* Textarea cho địa chỉ (cho phép nhiều dòng) */}
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
                {/* Hiển thị lỗi validation cho address (nếu có) */}
                {formErrors.address && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* ===== SUBMIT BUTTONS - CÁC NÚT HÀNH ĐỘNG ===== */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                {/* Nút Hủy - quay về dashboard */}
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
                {/* Nút Submit - tạo tài khoản */}
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
        
        {/* ===== INFO CARD - THÔNG TIN HƯỚNG DẪN ===== */}
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
      
      {/* ===== CSS ANIMATION - HIỆU ỨNG XOAY CHO SPINNER ===== */}
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

// ===========================================================================================
// PHẦN 8: EXPORT COMPONENT - XUẤT COMPONENT ĐỂ SỬ DỤNG Ở NƠI KHÁC
// ===========================================================================================

export default CreateCustomerAccount;