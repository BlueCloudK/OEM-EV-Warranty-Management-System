import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaUserPlus,
  FaSave,
  FaTimes
} from "react-icons/fa";

export default function CreateCustomer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    userId: 0
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = "Họ tên không được để trống";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Họ tên phải có ít nhất 2 ký tự";
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email không được để trống";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Email không hợp lệ";
      }
    }

    // Validate phone
    if (!formData.phone.trim()) {
      errors.phone = "Số điện thoại không được để trống";
    } else {
      const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        errors.phone = "Số điện thoại không hợp lệ (VD: +84493764870 hoặc 0493764870)";
      }
    }

    // Validate address
    if (!formData.address.trim()) {
      errors.address = "Địa chỉ không được để trống";
    } else if (formData.address.trim().length < 5) {
      errors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    // Validate userId
    if (formData.userId < 0) {
      errors.userId = "User ID phải là số không âm";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle userId as number
    if (name === 'userId') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // API: POST /api/customers - Create new customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vui lòng đăng nhập để tạo khách hàng");
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      // Prepare data for API
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        userId: formData.userId
      };

      const response = await fetch(`${API_BASE_URL}api/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess("Tạo khách hàng thành công!");
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          userId: 0
        });

        // Navigate back to customer list after 2 seconds
        setTimeout(() => {
          navigate("/scstaff/customers/list");
        }, 2000);

      } else if (response.status === 400) {
        const errorData = await response.json();
        setError(`Dữ liệu không hợp lệ: ${errorData.message || 'Vui lòng kiểm tra lại thông tin'}`);
      } else if (response.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem('token');
      } else if (response.status === 403) {
        setError("Bạn không có quyền tạo khách hàng.");
      } else if (response.status === 409) {
        setError("Email hoặc số điện thoại đã tồn tại trong hệ thống.");
      } else {
        setError(`Lỗi ${response.status}: Không thể tạo khách hàng`);
      }
    } catch (err) {
      console.error("Create customer error:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Có lỗi xảy ra khi tạo khách hàng: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      userId: 0
    });
    setFormErrors({});
    setError("");
    setSuccess("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate("/scstaff/customers/list")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#044835",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              marginBottom: "20px",
              fontWeight: "500",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#06694e")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#044835")}
          >
            <FaArrowLeft /> Quay về danh sách
          </button>

          {/* Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                borderRadius: "12px",
                padding: "15px",
              }}
            >
              <FaUserPlus size={24} color="#10b981" />
            </div>
            <div>
              <h1
                style={{
                  color: "#044835",
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: 0,
                  marginBottom: "5px",
                }}
              >
                Tạo khách hàng mới
              </h1>
              <p
                style={{
                  color: "#666",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Nhập thông tin để tạo khách hàng mới trong hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          }}
        >
          {/* Success Message */}
          {success && (
            <div
              style={{
                background: "#d1fae5",
                border: "1px solid #a7f3d0",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                color: "#065f46",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaSave color="#10b981" />
              <strong>{success}</strong>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaTimes color="#ef4444" />
              <strong>{error}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              {/* Name Field */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  <FaUser color="#6b7280" size={14} />
                  Họ tên <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập họ tên khách hàng"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: formErrors.name ? "1px solid #ef4444" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.3s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => !formErrors.name && (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => !formErrors.name && (e.target.style.borderColor = "#d1d5db")}
                />
                {formErrors.name && (
                  <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0 0" }}>
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  <FaEnvelope color="#6b7280" size={14} />
                  Email <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ email"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: formErrors.email ? "1px solid #ef4444" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.3s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => !formErrors.email && (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => !formErrors.email && (e.target.style.borderColor = "#d1d5db")}
                />
                {formErrors.email && (
                  <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0 0" }}>
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  <FaPhone color="#6b7280" size={14} />
                  Số điện thoại <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+84493764870 hoặc 0493764870"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: formErrors.phone ? "1px solid #ef4444" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.3s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => !formErrors.phone && (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => !formErrors.phone && (e.target.style.borderColor = "#d1d5db")}
                />
                {formErrors.phone && (
                  <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0 0" }}>
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* User ID Field */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  <FaUser color="#6b7280" size={14} />
                  User ID
                </label>
                <input
                  type="number"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: formErrors.userId ? "1px solid #ef4444" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.3s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => !formErrors.userId && (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => !formErrors.userId && (e.target.style.borderColor = "#d1d5db")}
                />
                {formErrors.userId && (
                  <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0 0" }}>
                    {formErrors.userId}
                  </p>
                )}
              </div>
            </div>

            {/* Address Field - Full Width */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                <FaMapMarkerAlt color="#6b7280" size={14} />
                Địa chỉ <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ đầy đủ của khách hàng"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: formErrors.address ? "1px solid #ef4444" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.3s",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => !formErrors.address && (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => !formErrors.address && (e.target.style.borderColor = "#d1d5db")}
              />
              {formErrors.address && (
                <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0 0" }}>
                  {formErrors.address}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "0.3s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.background = "#4b5563")}
                onMouseOut={(e) => !loading && (e.currentTarget.style.background = "#6b7280")}
              >
                <FaTimes />
                Đặt lại
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: loading ? "#9ca3af" : "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.background = "#059669")}
                onMouseOut={(e) => !loading && (e.currentTarget.style.background = "#10b981")}
              >
                <FaSave />
                {loading ? "Đang tạo..." : "Tạo khách hàng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}