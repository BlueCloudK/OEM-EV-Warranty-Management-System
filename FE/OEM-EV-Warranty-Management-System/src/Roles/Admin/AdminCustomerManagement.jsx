import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ================================
 * 🔐 ADMIN CUSTOMER MANAGEMENT
 * ================================
 *
 * 📋 API ENDPOINTS SỬ DỤNG:
 *
 * 1️⃣ GET /api/customers              → Lấy danh sách khách hàng (có phân trang + tìm kiếm)
 * 2️⃣ GET /api/customers/{id}         → Xem chi tiết 1 khách hàng
 * 3️⃣ POST /api/customers             → Tạo khách hàng mới
 * 4️⃣ PUT /api/customers/{id}         → Cập nhật thông tin khách hàng
 * 5️⃣ DELETE /api/customers/{id}      → Xóa khách hàng (ADMIN only)
 *
 * 🔑 PERMISSIONS:
 * - Đọc/Tạo/Sửa: ADMIN, SC_STAFF, EVM_STAFF
 * - Xóa: Chỉ ADMIN
 *
 * 📝 VALIDATION RULES:
 * - Name: 5-100 ký tự
 * - Email: Format hợp lệ
 * - Phone: +84xxxxxxxxx hoặc 0xxxxxxxxx
 * - Address: Tối đa 255 ký tự
 * - User ID: Số nguyên dương
 */

const AdminCustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    userId: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Local storage for demo customers persistence
  const LOCAL_CUSTOMERS_KEY = "admin_local_customers";
  const loadLocalCustomers = () => {
    try {
      const stored = localStorage.getItem(LOCAL_CUSTOMERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };
  const saveLocalCustomers = (list) => {
    try {
      localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(list));
    } catch {}
  };

  // Mock customers data for demo
  const mockCustomers = [
    {
      customerId: "123e4567-e89b-12d3-a456-426614174000",
      name: "Nguyễn Văn An",
      email: "an.nguyen@email.com",
      phone: "+84901234567",
      address: "123 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
      createdAt: "2024-01-15T10:30:00.000+00:00",
      userId: 5,
      username: "an_nguyen",
    },
    {
      customerId: "456e7890-e89b-12d3-a456-426614174001",
      name: "Trần Thị Bình",
      email: "binh.tran@email.com",
      phone: "+84901234568",
      address: "456 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      createdAt: "2024-02-10T09:15:00.000+00:00",
      userId: 6,
      username: "binh_tran",
    },
    {
      customerId: "789e1234-e89b-12d3-a456-426614174002",
      name: "Lê Minh Châu",
      email: "chau.le@email.com",
      phone: "+84901234569",
      address: "789 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh",
      createdAt: "2024-03-05T14:20:00.000+00:00",
      userId: 7,
      username: "chau_le",
    },
  ];

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  // ================================
  // 📊 ENDPOINT 1: LẤY DANH SÁCH KHÁCH HÀNG
  // GET /api/customers?page=0&size=10&search=keyword
  // Permissions: ADMIN, SC_STAFF, EVM_STAFF
  // ================================
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found, user not authenticated");
        const locals = loadLocalCustomers();
        const merged = [...mockCustomers, ...locals];
        setCustomers(merged);
        setTotalElements(merged.length);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      console.log(
        "🔍 Fetching customers from API:",
        `${API_BASE_URL}/api/customers`
      );

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        size: 10,
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`${API_BASE_URL}/api/customers?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("📊 Customer API Response Status:", response.status);

      if (!response.ok) {
        // Check if response is HTML (error page)
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error(
            `API endpoint not found (returned HTML). Status: ${response.status}`
          );
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response is actually JSON
      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("⚠️ API returned non-JSON response:", contentType);
        throw new Error(
          "API returned non-JSON response (likely HTML error page)"
        );
      }

      const data = await response.json();
      console.log("✅ Customers fetched successfully:", data);

      // Handle paginated response
      if (data.content) {
        setCustomers(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } else {
        // Handle non-paginated response
        setCustomers(data);
        setTotalElements(data.length);
        setTotalPages(1);
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching customers:", error);

      // More specific error handling
      if (
        error.message.includes("<!DOCTYPE") ||
        error.message.includes("Unexpected token")
      ) {
        console.error(
          "🚨 API returned HTML instead of JSON - endpoint may have issues"
        );
      } else if (error.message.includes("fetch")) {
        console.error("🌐 Network error - check API server status");
      } else {
        console.error("🔧 API error:", error.message);
      }

      // Fallback to mock data + local storage
      console.log("🔄 Falling back to mock data");
      const locals = loadLocalCustomers();
      const merged = [...mockCustomers, ...locals];
      setCustomers(merged);
      setTotalElements(merged.length);
      setTotalPages(1);
      setLoading(false);
    }
  };

  // ================================
  // 👁️ ENDPOINT 2: XEM CHI TIẾT KHÁCH HÀNG
  // GET /api/customers/{id}
  // Permissions: ADMIN, SC_STAFF, EVM_STAFF
  // ================================
  const handleViewCustomer = async (customer) => {
    try {
      setLoadingDetails(true);
      setShowViewModal(true);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found, using cached data");
        setViewingCustomer(customer);
        setLoadingDetails(false);
        return;
      }

      console.log("👁️ Fetching customer details:", customer.customerId);

      const response = await fetch(
        `${API_BASE_URL}/api/customers/${customer.customerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log("📊 Customer Details API Response Status:", response.status);

      if (!response.ok) {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error(
            `API endpoint not found (returned HTML). Status: ${response.status}`
          );
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API returned non-JSON response");
      }

      const detailData = await response.json();
      console.log("✅ Customer details fetched successfully:", detailData);

      setViewingCustomer(detailData);
    } catch (error) {
      console.error("❌ Error fetching customer details:", error);

      // Fallback to cached customer data
      console.log("🔄 Using cached customer data for details view");
      setViewingCustomer(customer);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Tên khách hàng là bắt buộc";
    } else if (formData.name.length < 5 || formData.name.length > 100) {
      errors.name = "Tên phải từ 5 đến 100 ký tự";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Định dạng email không hợp lệ";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^(\+84|0)[0-9]{9,10}$/.test(formData.phone)) {
      errors.phone =
        "Số điện thoại không hợp lệ (VD: +84901234567 hoặc 0901234567)";
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = "Địa chỉ là bắt buộc";
    } else if (formData.address.length > 255) {
      errors.address = "Địa chỉ không được vượt quá 255 ký tự";
    }

    // User ID validation
    if (!formData.userId) {
      errors.userId = "User ID là bắt buộc";
    } else if (isNaN(formData.userId) || formData.userId <= 0) {
      errors.userId = "User ID phải là số nguyên dương";
    }

    return errors;
  };

  // ================================
  // ✏️ ENDPOINT 3: TẠO/CẬP NHẬT KHÁCH HÀNG
  // POST /api/customers (tạo mới)
  // PUT /api/customers/{id} (cập nhật)
  // Permissions: ADMIN, SC_STAFF, EVM_STAFF
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Token không tìm thấy. Vui lòng đăng nhập lại.");
        setSubmitting(false);
        return;
      }

      const url = editingCustomer
        ? `${API_BASE_URL}/api/customers/${editingCustomer.customerId}`
        : `${API_BASE_URL}/api/customers`;

      const method = editingCustomer ? "PUT" : "POST";

      console.log(
        `🔑 ${editingCustomer ? "Updating" : "Creating"} customer:`,
        formData
      );

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(formData),
      });

      console.log("📊 Customer API Response Status:", response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.log("⚠️ API returned non-JSON error response");
          // Use default error message for non-JSON responses
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Customer operation successful:", result);

      // Update customers list
      if (editingCustomer) {
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.customerId === editingCustomer.customerId
              ? result
              : customer
          )
        );
        alert("Cập nhật khách hàng thành công!");
      } else {
        setCustomers((prev) => [result, ...prev]);
        setTotalElements((prev) => prev + 1);
        alert("Tạo khách hàng thành công!");
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        userId: "",
      });
      setShowCreateForm(false);
      setShowEditForm(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("❌ Customer operation error:", error);

      // Check if it's a 403 Forbidden error (no permission)
      if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        console.log(
          "🔒 API returned 403 Forbidden - falling back to demo mode"
        );
        alert("API không có quyền tạo customer. Đang chuyển sang chế độ demo.");

        // Create demo customer
        const demoCustomer = {
          customerId: Date.now(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          userId: formData.userId,
          createdAt: new Date().toISOString(),
        };

        // Save to localStorage for persistence
        const locals = loadLocalCustomers();
        const updatedLocals = [demoCustomer, ...locals];
        saveLocalCustomers(updatedLocals);

        setCustomers((prev) => [demoCustomer, ...prev]);
        setTotalElements((prev) => prev + 1);
        alert("Tạo khách hàng thành công! (Demo mode)");

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          userId: "",
        });
        setShowCreateForm(false);
        setShowEditForm(false);
        setEditingCustomer(null);
        return;
      }

      alert(`Lỗi: ${error.message}`);

      // Fallback to demo mode for development
      if (
        error.message.includes("fetch") ||
        error.message.includes("NetworkError")
      ) {
        console.log("🔄 Network error - falling back to demo mode");

        const newCustomer = {
          customerId: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          createdAt: new Date().toISOString(),
          userId: parseInt(formData.userId),
          username: formData.email.split("@")[0],
        };

        // Save to localStorage for persistence
        const locals = loadLocalCustomers();
        const updatedLocals = [newCustomer, ...locals];
        saveLocalCustomers(updatedLocals);

        if (editingCustomer) {
          setCustomers((prev) =>
            prev.map((customer) =>
              customer.customerId === editingCustomer.customerId
                ? { ...editingCustomer, ...formData }
                : customer
            )
          );
          alert("Cập nhật khách hàng thành công! (Demo mode)");
        } else {
          setCustomers((prev) => [newCustomer, ...prev]);
          setTotalElements((prev) => prev + 1);
          alert("Tạo khách hàng thành công! (Demo mode)");
        }

        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          userId: "",
        });
        setShowCreateForm(false);
        setShowEditForm(false);
        setEditingCustomer(null);
      }
    }

    setSubmitting(false);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      userId: customer.userId.toString(),
    });
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  // ================================
  // 🗑️ ENDPOINT 4: XÓA KHÁCH HÀNG
  // DELETE /api/customers/{id}
  // Permissions: ADMIN ONLY
  // ================================
  const handleDelete = async (customer) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer.name}"?`)) {
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Token không tìm thấy. Vui lòng đăng nhập lại.");
        return;
      }

      console.log("🗑️ Deleting customer:", customer.customerId);

      const response = await fetch(
        `${API_BASE_URL}/api/customers/${customer.customerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log("📊 Delete Customer Response Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Remove from list
      setCustomers((prev) =>
        prev.filter((c) => c.customerId !== customer.customerId)
      );
      setTotalElements((prev) => prev - 1);
      alert("Xóa khách hàng thành công!");
    } catch (error) {
      console.error("❌ Delete customer error:", error);
      alert(`Lỗi khi xóa: ${error.message}`);

      // Fallback to demo mode
      if (
        error.message.includes("fetch") ||
        error.message.includes("NetworkError")
      ) {
        setCustomers((prev) =>
          prev.filter((c) => c.customerId !== customer.customerId)
        );
        setTotalElements((prev) => prev - 1);
        alert("Xóa khách hàng thành công! (Demo mode)");
      }
    }
  };

  // ================================
  // 🔍 HELPER: TÌM KIẾM KHÁCH HÀNG
  // Gọi lại fetchCustomers() với search term
  // ================================
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchCustomers();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhone = (phone) => {
    if (phone.startsWith("+84")) {
      return phone.replace("+84", "0");
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="customer-management">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách khách hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-management">
      <div className="page-header">
        <div className="header-left">
          <button
            className="btn btn-back"
            onClick={() => navigate("/admin")}
            title="Quay lại Admin Dashboard"
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại Dashboard
          </button>
          <div className="header-title">
            <h2>Quản lý Khách hàng</h2>
            <p className="header-subtitle">
              Quản lý thông tin khách hàng và hồ sơ
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={fetchCustomers}
            disabled={loading}
            title="Làm mới danh sách"
          >
            <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
            Làm mới
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowEditForm(false);
              setEditingCustomer(null);
              setFormData({
                name: "",
                email: "",
                phone: "",
                address: "",
                userId: "",
              });
            }}
          >
            <i className="fas fa-plus"></i>
            {showCreateForm ? "Hủy" : "Thêm Khách hàng"}
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <i className="fas fa-search"></i>
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || showEditForm) && (
        <div className="form-section">
          <div className="form-card">
            <div className="card-header">
              <div className="header-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3>
                {editingCustomer
                  ? "Cập nhật Khách hàng"
                  : "Thêm Khách hàng Mới"}
              </h3>
              <p>Điền thông tin khách hàng theo API guide</p>
            </div>

            <form onSubmit={handleSubmit} className="customer-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="fas fa-user"></i>
                    Họ và Tên
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={formErrors.name ? "error" : ""}
                      placeholder="VD: Nguyễn Văn An"
                    />
                    {formErrors.name && (
                      <span className="error-message">{formErrors.name}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Địa chỉ Email
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? "error" : ""}
                      placeholder="user@example.com"
                    />
                    {formErrors.email && (
                      <span className="error-message">{formErrors.email}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fas fa-phone"></i>
                    Số điện thoại
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? "error" : ""}
                      placeholder="+84901234567 hoặc 0901234567"
                    />
                    {formErrors.phone && (
                      <span className="error-message">{formErrors.phone}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="userId">
                    <i className="fas fa-id-card"></i>
                    User ID
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      className={formErrors.userId ? "error" : ""}
                      placeholder="ID tài khoản người dùng"
                      min="1"
                    />
                    {formErrors.userId && (
                      <span className="error-message">{formErrors.userId}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">
                  <i className="fas fa-map-marker-alt"></i>
                  Địa chỉ đầy đủ
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? "error" : ""}
                    placeholder="Nhập địa chỉ đầy đủ bao gồm quận, huyện, thành phố"
                    rows="3"
                  />
                  {formErrors.address && (
                    <span className="error-message">{formErrors.address}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowEditForm(false);
                    setEditingCustomer(null);
                  }}
                  disabled={submitting}
                >
                  <i className="fas fa-times"></i>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {editingCustomer ? "Đang cập nhật..." : "Đang tạo..."}
                    </>
                  ) : (
                    <>
                      <i
                        className={`fas ${
                          editingCustomer ? "fa-save" : "fa-user-plus"
                        }`}
                      ></i>
                      {editingCustomer
                        ? "Cập nhật Khách hàng"
                        : "Tạo Khách hàng"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {showViewModal && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3>Chi tiết Khách hàng</h3>
              <button
                className="modal-close"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {loadingDetails ? (
                <div className="details-loading">
                  <div className="loading-spinner"></div>
                  <p>Đang tải chi tiết khách hàng...</p>
                </div>
              ) : viewingCustomer ? (
                <div className="customer-details">
                  <div className="details-grid">
                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-id-card"></i>
                        Customer ID
                      </div>
                      <div className="detail-value customer-id">
                        {viewingCustomer.customerId}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-user"></i>
                        Họ và Tên
                      </div>
                      <div className="detail-value name">
                        {viewingCustomer.name}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-envelope"></i>
                        Email
                      </div>
                      <div className="detail-value email">
                        <a href={`mailto:${viewingCustomer.email}`}>
                          {viewingCustomer.email}
                        </a>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-phone"></i>
                        Số điện thoại
                      </div>
                      <div className="detail-value phone">
                        <a href={`tel:${viewingCustomer.phone}`}>
                          {formatPhone(viewingCustomer.phone)}
                        </a>
                      </div>
                    </div>

                    <div className="detail-item full-width">
                      <div className="detail-label">
                        <i className="fas fa-map-marker-alt"></i>
                        Địa chỉ
                      </div>
                      <div className="detail-value address">
                        {viewingCustomer.address}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-user-tag"></i>
                        Tài khoản
                      </div>
                      <div className="detail-value user-info">
                        <div className="username">
                          {viewingCustomer.username}
                        </div>
                        <div className="user-id">
                          User ID: {viewingCustomer.userId}
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-calendar-alt"></i>
                        Ngày đăng ký
                      </div>
                      <div className="detail-value created-date">
                        {formatDate(viewingCustomer.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons in modal */}
                  <div className="modal-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(viewingCustomer);
                      }}
                    >
                      <i className="fas fa-edit"></i>
                      Chỉnh sửa
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => {
                        setShowViewModal(false);
                        handleDelete(viewingCustomer);
                      }}
                    >
                      <i className="fas fa-trash"></i>
                      Xóa khách hàng
                    </button>
                  </div>
                </div>
              ) : (
                <div className="error-state">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>Không thể tải chi tiết khách hàng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="customers-table-section">
        <div className="table-header">
          <h3>
            <i className="fas fa-users"></i>
            Danh sách Khách hàng ({totalElements})
          </h3>
          {customers.length === 0 && !loading && (
            <div className="empty-state">
              <i className="fas fa-users"></i>
              <p>Không tìm thấy khách hàng</p>
              <small>Thử làm mới hoặc kiểm tra kết nối</small>
            </div>
          )}
        </div>

        {customers.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Tên khách hàng</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Tài khoản</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.customerId}>
                      <td className="customer-name">{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{formatPhone(customer.phone)}</td>
                      <td className="address" title={customer.address}>
                        {customer.address}
                      </td>
                      <td>
                        <div className="user-info">
                          <span className="username">{customer.username}</span>
                          <small className="user-id">
                            ID: {customer.userId}
                          </small>
                        </div>
                      </td>
                      <td>{formatDate(customer.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action view"
                            title="Xem chi tiết"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn-action edit"
                            title="Chỉnh sửa"
                            onClick={() => handleEdit(customer)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn-action delete"
                            title="Xóa khách hàng"
                            onClick={() => handleDelete(customer)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                  Trước
                </button>

                <div className="pagination-info">
                  Trang {currentPage + 1} / {totalPages}
                  <small>({totalElements} khách hàng)</small>
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Sau
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .customer-management {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-title h2 {
          color: #333;
          margin: 0 0 5px 0;
        }

        .header-subtitle {
          color: #666;
          margin: 0;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .header-actions .btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .search-form {
          width: 100%;
        }

        .search-input-group {
          display: flex;
          gap: 10px;
          max-width: 600px;
        }

        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e8ecef;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .search-btn {
          padding: 12px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search-btn:hover {
          background: #0056b3;
        }

        .form-section {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 16px;
          padding: 0;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .form-card {
          background: white;
          margin: 3px;
          border-radius: 13px;
          overflow: hidden;
        }

        .card-header {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }

        .header-icon {
          font-size: 3em;
          margin-bottom: 15px;
          opacity: 0.9;
        }

        .card-header h3 {
          font-size: 1.8em;
          margin: 0 0 10px 0;
          font-weight: 600;
        }

        .card-header p {
          margin: 0;
          opacity: 0.8;
          font-size: 1em;
        }

        .customer-form {
          padding: 40px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 25px;
        }

        .form-group.full-width {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }

        .form-group label i {
          margin-right: 8px;
          color: #28a745;
          width: 16px;
          text-align: center;
        }

        .required {
          color: #e74c3c;
          margin-left: 4px;
        }

        .input-wrapper {
          position: relative;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e8ecef;
          border-radius: 10px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #fafbfc;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #28a745;
          background: white;
          box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
          transform: translateY(-2px);
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #e74c3c;
          background: #fff5f5;
        }

        .error-message {
          color: #e74c3c;
          font-size: 13px;
          margin-top: 6px;
          display: block;
          font-weight: 500;
        }

        .form-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #eee;
        }

        .btn-cancel {
          padding: 12px 30px;
          border: 2px solid #6c757d;
          background: white;
          color: #6c757d;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-cancel:hover {
          background: #6c757d;
          color: white;
          transform: translateY(-2px);
        }

        .btn-submit {
          padding: 12px 30px;
          border: none;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* ================================
           👁️ VIEW MODAL STYLES
           ================================ */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 25px 30px;
          border-radius: 16px 16px 0 0;
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
        }

        .modal-icon {
          font-size: 2.5em;
          opacity: 0.9;
        }

        .modal-header h3 {
          flex: 1;
          margin: 0;
          font-size: 1.5em;
          font-weight: 600;
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .modal-body {
          padding: 30px;
        }

        .details-loading {
          text-align: center;
          padding: 40px 20px;
        }

        .details-loading .loading-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        .customer-details {
          width: 100%;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 30px;
        }

        .detail-item {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          border-left: 4px solid #007bff;
          transition: all 0.3s ease;
        }

        .detail-item:hover {
          background: #e9ecef;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #495057;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .detail-label i {
          color: #007bff;
          width: 16px;
          text-align: center;
        }

        .detail-value {
          font-size: 16px;
          color: #212529;
          line-height: 1.4;
        }

        .detail-value.customer-id {
          font-family: monospace;
          font-size: 14px;
          background: #e3f2fd;
          padding: 8px 12px;
          border-radius: 6px;
          word-break: break-all;
        }

        .detail-value.name {
          font-weight: 600;
          color: #28a745;
          font-size: 18px;
        }

        .detail-value.email a,
        .detail-value.phone a {
          color: #007bff;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .detail-value.email a:hover,
        .detail-value.phone a:hover {
          color: #0056b3;
          text-decoration: underline;
        }

        .detail-value.address {
          line-height: 1.6;
        }

        .detail-value.user-info .username {
          font-weight: 600;
          color: #007bff;
          display: block;
          margin-bottom: 4px;
        }

        .detail-value.user-info .user-id {
          font-size: 12px;
          color: #6c757d;
          font-family: monospace;
        }

        .detail-value.created-date {
          font-weight: 500;
          color: #28a745;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }

        .btn-edit {
          background: #ffc107;
          color: #212529;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-edit:hover {
          background: #e0a800;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3);
        }

        .btn-delete {
          background: #dc3545;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-delete:hover {
          background: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
        }

        .error-state {
          text-align: center;
          padding: 40px;
          color: #dc3545;
        }

        .error-state i {
          font-size: 3em;
          margin-bottom: 15px;
        }

        .table-header h3 {
          color: #333;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-state i {
          font-size: 3em;
          margin-bottom: 15px;
          color: #ddd;
        }

        .empty-state p {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 500;
        }

        .empty-state small {
          color: #999;
        }

        .table-responsive {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .customers-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1100px;
        }

        .customers-table th,
        .customers-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        .customers-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        .customers-table tr:hover {
          background-color: #f8f9fa;
        }

        .customer-name {
          font-weight: 600;
          color: #28a745;
        }

        .address {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .username {
          font-weight: 600;
          color: #007bff;
        }

        .user-id {
          color: #666;
          font-size: 12px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-action {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .btn-action.view { 
          color: #007bff; 
        }
        .btn-action.view:hover { 
          background: #e3f2fd;
          transform: scale(1.1);
        }

        .btn-action.edit { 
          color: #ffc107; 
        }
        .btn-action.edit:hover { 
          background: #fff3cd;
          transform: scale(1.1);
        }

        .btn-action.delete { 
          color: #dc3545; 
        }
        .btn-action.delete:hover { 
          background: #ffebee;
          transform: scale(1.1);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .pagination-btn {
          padding: 10px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-2px);
        }

        .pagination-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }

        .pagination-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #333;
          font-weight: 500;
        }

        .pagination-info small {
          color: #666;
          font-size: 12px;
        }

        .loading {
          text-align: center;
          padding: 50px;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #28a745;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-back {
          background: #17a2b8;
          color: white;
        }

        .btn-back:hover {
          background: #138496;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
            width: 100%;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .header-actions .btn {
            width: 100%;
            justify-content: center;
          }
          
          .form-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .customer-form {
            padding: 25px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-cancel, .btn-submit {
            width: 100%;
            justify-content: center;
          }
          
          .address {
            max-width: 150px;
          }
          
          .action-buttons {
            flex-direction: column;
            gap: 4px;
          }

          .search-input-group {
            flex-direction: column;
            max-width: 100%;
          }

          .pagination {
            flex-direction: column;
            gap: 10px;
          }

          .pagination-info {
            order: -1;
          }

          .modal-content {
            margin: 10px;
            max-height: 95vh;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-body {
            padding: 20px;
          }

          .details-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .detail-item.full-width {
            grid-column: 1;
          }

          .modal-actions {
            flex-direction: column;
            gap: 10px;
          }

          .btn-edit, .btn-delete {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminCustomerManagement;
