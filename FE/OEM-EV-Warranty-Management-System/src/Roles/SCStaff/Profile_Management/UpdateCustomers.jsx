import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner
} from "react-icons/fa";

export default function UpdateCustomers() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get customer ID from URL params
  const [loading, setLoading] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    userId: 0
  });
  const [originalData, setOriginalData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    } else {
      setError("Không tìm thấy ID khách hàng");
      setLoadingCustomer(false);
    }
  }, [id]);

  // API: GET /api/customers/{id} - Fetch customer data for editing
  const fetchCustomerData = async () => {
    try {
      setLoadingCustomer(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vui lòng đăng nhập để chỉnh sửa thông tin khách hàng");
        setLoadingCustomer(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const customerData = {
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          userId: data.userId || 0
        };
        setFormData(customerData);
        setOriginalData(customerData);
        setError("");
      } else if (response.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem('token');
      } else if (response.status === 403) {
        setError("Bạn không có quyền chỉnh sửa thông tin khách hàng này.");
      } else if (response.status === 404) {
        setError("Không tìm thấy khách hàng này.");
      } else {
        setError(`Lỗi ${response.status}: Không thể tải thông tin khách hàng`);
      }
    } catch (err) {
      console.error("Customer fetch error:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Có lỗi xảy ra khi tải thông tin khách hàng: " + err.message);
      }
    } finally {
      setLoadingCustomer(false);
    }
  };

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
        errors.phone = "Số điện thoại không hợp lệ (VD: +84813600380 hoặc 0813600380)";
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

  // Check if form data has changed
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // API: PUT /api/customers/{id} - Update customer information
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    if (!hasChanges()) {
      setError("Không có thay đổi nào để cập nhật");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vui lòng đăng nhập để cập nhật thông tin khách hàng");
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

      const response = await fetch(`${API_BASE_URL}api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess("Cập nhật thông tin khách hàng thành công!");
        setOriginalData(formData); // Update original data to reflect changes
        
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
        setError("Bạn không có quyền cập nhật thông tin khách hàng này.");
      } else if (response.status === 404) {
        setError("Không tìm thấy khách hàng này.");
      } else if (response.status === 409) {
        setError("Email hoặc số điện thoại đã tồn tại trong hệ thống.");
      } else {
        setError(`Lỗi ${response.status}: Không thể cập nhật thông tin khách hàng`);
      }
    } catch (err) {
      console.error("Update customer error:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Có lỗi xảy ra khi cập nhật thông tin khách hàng: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setFormErrors({});
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm("Bạn có những thay đổi chưa lưu. Bạn có chắc chắn muốn hủy?")) {
        navigate("/scstaff/customers/list");
      }
    } else {
      navigate("/scstaff/customers/list");
    }
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
            onClick={handleCancel}
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
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                borderRadius: "12px",
                padding: "15px",
              }}
            >
              <FaEdit size={24} color="#f59e0b" />
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
                Cập nhật thông tin khách hàng
              </h1>
              <p
                style={{
                  color: "#666",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Chỉnh sửa thông tin khách hàng {id ? `(ID: ${id})` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Loading Customer Data */}
        {loadingCustomer && (
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "60px",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            }}
          >
            <FaSpinner
              size={32}
              color="#3b82f6"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <p style={{ marginTop: "20px", color: "#666" }}>
              Đang tải thông tin khách hàng...
            </p>
          </div>
        )}

        {/* Form */}
        {!loadingCustomer && (
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
                    placeholder="+84813600380 hoặc 0813600380"
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

              {/* Change Indicator */}
              {hasChanges() && (
                <div
                  style={{
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "20px",
                    color: "#92400e",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaEdit color="#f59e0b" />
                  Bạn có những thay đổi chưa lưu
                </div>
              )}

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
                  disabled={loading || !hasChanges()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: loading || !hasChanges() ? "#d1d5db" : "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    cursor: loading || !hasChanges() ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "0.3s",
                    opacity: loading || !hasChanges() ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => !loading && hasChanges() && (e.currentTarget.style.background = "#4b5563")}
                  onMouseOut={(e) => !loading && hasChanges() && (e.currentTarget.style.background = "#6b7280")}
                >
                  <FaTimes />
                  Đặt lại
                </button>

                <button
                  type="submit"
                  disabled={loading || !hasChanges()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: loading || !hasChanges() ? "#9ca3af" : "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    cursor: loading || !hasChanges() ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "0.3s",
                  }}
                  onMouseOver={(e) => !loading && hasChanges() && (e.currentTarget.style.background = "#d97706")}
                  onMouseOut={(e) => !loading && hasChanges() && (e.currentTarget.style.background = "#f59e0b")}
                >
                  <FaSave />
                  {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
