import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ================================
 * 🚗 ADMIN VEHICLE MANAGEMENT
 * ================================
 * Endpoints (from API guides):
 * - GET /api/vehicles
 * - GET /api/vehicles/{id}
 * - POST /api/vehicles
 * - PUT /api/vehicles/{id}
 * - DELETE /api/vehicles/{id}
 */

const AdminVehicleManagement = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CRUD Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    // Required fields for Vehicle API
    vehicleName: "",
    vehicleModel: "",
    vehicleVin: "",
    vehicleYear: new Date().getFullYear(),
    vehicleColor: "",
    vehicleEngine: "",
    customerId: "",
  });

  // Customer list for dropdown
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState(null);

  // Form Validation
  const [formErrors, setFormErrors] = useState({});

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const mockVehicles = [
    {
      id: 1,
      vin: "VIN-1234567890",
      model: "Model S",
      brand: "Tesla",
      year: 2023,
      ownerName: "Nguyễn Văn A",
      createdAt: "2024-03-01T10:00:00Z",
    },
    {
      id: 2,
      vin: "VIN-0987654321",
      model: "Ioniq 5",
      brand: "Hyundai",
      year: 2022,
      ownerName: "Trần Thị B",
      createdAt: "2024-03-12T11:30:00Z",
    },
  ];

  useEffect(() => {
    fetchVehicles();
    fetchCustomers(); // Load customers for dropdown
  }, []);

  // Fetch Customers for dropdown
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/customers?page=0&size=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("📋 Fetched customers:", data);
      setCustomers(Array.isArray(data.content) ? data.content : []);
    } catch (e) {
      console.error("Fetch customers failed:", e);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      if (!token) {
        setVehicles(mockVehicles);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Non-JSON response");
      }

      const data = await response.json();
      setVehicles(
        Array.isArray(data.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (e) {
      console.error("Fetch vehicles failed:", e);
      setError("Không tải được danh sách xe. Hiển thị dữ liệu demo.");
      setVehicles(mockVehicles);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString("vi-VN");

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.vehicleVin.trim()) {
      errors.vehicleVin = "vehicleVin là bắt buộc";
    } else if (!/^\d{2}-MĐ-\d{3}\.\d{2}$/.test(formData.vehicleVin)) {
      errors.vehicleVin =
        "VIN phải đúng định dạng XX-MĐ-YYY.ZZ (ví dụ: 12-MĐ-345.67)";
    }

    if (!formData.vehicleName.trim()) {
      errors.vehicleName = "vehicleName là bắt buộc";
    }

    if (!formData.vehicleModel.trim()) {
      errors.vehicleModel = "vehicleModel là bắt buộc";
    }

    if (!formData.vehicleColor.trim()) {
      errors.vehicleColor = "vehicleColor là bắt buộc";
    }

    if (!formData.vehicleEngine.trim()) {
      errors.vehicleEngine = "vehicleEngine là bắt buộc";
    }

    if (
      !formData.vehicleYear ||
      formData.vehicleYear < 1900 ||
      formData.vehicleYear > new Date().getFullYear() + 1
    ) {
      errors.vehicleYear = "vehicleYear không hợp lệ";
    }

    if (!formData.customerId.trim()) {
      errors.customerId = "customerId là bắt buộc";
    }

    return errors;
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      vehicleName: "",
      vehicleModel: "",
      vehicleVin: "",
      vehicleYear: new Date().getFullYear(),
      customerId: "",
      vehicleColor: "",
      vehicleEngine: "",
    });
    setFormErrors({});
    setSelectedCustomerInfo(null);
  };

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    console.log("🔄 Input change:", { name, value });

    // Auto-fill customer info when customerId changes
    if (name === "customerId" && value) {
      console.log("👤 Customer selected:", value);
      console.log("👤 All customers:", customers);

      // Try different ID field names
      let selectedCustomer = customers.find(
        (customer) => customer.customerId === value
      );
      if (!selectedCustomer) {
        selectedCustomer = customers.find((customer) => customer.id === value);
      }
      if (!selectedCustomer) {
        selectedCustomer = customers.find(
          (customer) => customer.uuid === value
        );
      }
      if (!selectedCustomer) {
        // Fallback: use index
        const index = parseInt(value);
        if (!isNaN(index)) {
          selectedCustomer = customers[index];
        }
      }

      console.log("👤 Selected customer data:", selectedCustomer);
      if (selectedCustomer) {
        setFormData((prev) => ({
          ...prev,
          [name]: selectedCustomer.customerId,
        }));
        // Set selected customer info for display
        setSelectedCustomerInfo(selectedCustomer);
      } else {
        setSelectedCustomerInfo(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Create Vehicle
  const handleCreate = async (e) => {
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

      // Debug payload
      const payload = {
        vehicleName: formData.vehicleName,
        vehicleModel: formData.vehicleModel,
        vehicleVin: formData.vehicleVin,
        vehicleYear: Number(formData.vehicleYear),
        vehicleColor: formData.vehicleColor,
        vehicleEngine: formData.vehicleEngine,
        customerId: formData.customerId,
      };

      console.log("🚗 Creating vehicle with payload:", payload);
      console.log("🔗 API URL:", `${API_BASE_URL}/api/vehicles`);
      console.log("🔑 Token:", token ? "Present" : "Missing");

      // 1) Pre-check VIN trùng để báo lỗi thân thiện (BE trả 400 không body)
      try {
        const vinCheckRes = await fetch(
          `${API_BASE_URL}/api/vehicles/by-vin?vin=${encodeURIComponent(
            payload.vehicleVin
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (vinCheckRes.ok) {
          // Đã tồn tại VIN
          const existed = await vinCheckRes.json().catch(() => null);
          alert(
            `VIN đã tồn tại trong hệ thống${
              existed?.vehicleId ? ` (ID: ${existed.vehicleId})` : ""
            }. Vui lòng nhập VIN khác hoặc chỉnh sửa bản ghi hiện có.`
          );
          return;
        }
        // 404 => không tồn tại -> tiếp tục tạo
      } catch (vinErr) {
        console.warn("VIN pre-check failed, continue create:", vinErr);
      }

      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      console.log("📊 Response status:", response.status);
      console.log(
        "📊 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const newVehicle = await response.json();
        console.log("✅ Vehicle created successfully:", newVehicle);
        setVehicles((prev) => [newVehicle, ...prev]);
        setTotalElements((prev) => prev + 1);
        alert("Tạo xe thành công!");
        setShowCreateModal(false);
        resetForm();
      } else {
        // Log detailed error response
        const errorText = await response.text().catch(() => "");
        console.error("❌ Server error response:", errorText);
        console.error("❌ Response status:", response.status);
        console.error("❌ Response statusText:", response.statusText);

        // Thông điệp thân thiện hơn cho 400 khi body rỗng (thường do trùng VIN hoặc dữ liệu không hợp lệ)
        if (response.status === 400) {
          const friendly = errorText?.trim()?.length
            ? errorText
            : "Yêu cầu không hợp lệ (HTTP 400). Kiểm tra: VIN không trùng, vehicleYear hợp lệ, customerId đúng.";
          throw new Error(friendly);
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("💥 Create vehicle error:", error);
      console.error("💥 Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      alert(`Lỗi khi tạo xe: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Update Vehicle
  const handleUpdate = async (e) => {
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

      const response = await fetch(
        `${API_BASE_URL}/api/vehicles/${
          selectedVehicle.vehicleId || selectedVehicle.id
        }`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const updatedVehicle = await response.json();
        setVehicles((prev) =>
          prev.map((v) =>
            (v.vehicleId || v.id) ===
            (selectedVehicle.vehicleId || selectedVehicle.id)
              ? updatedVehicle
              : v
          )
        );
        alert("Cập nhật xe thành công!");
        setShowEditModal(false);
        setSelectedVehicle(null);
        resetForm();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Update vehicle error:", error);
      alert("Lỗi khi cập nhật xe. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Vehicle
  const handleDelete = async () => {
    if (!selectedVehicle) return;

    setSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/vehicles/${
          selectedVehicle.vehicleId || selectedVehicle.id
        }`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.ok) {
        setVehicles((prev) =>
          prev.filter(
            (v) =>
              (v.vehicleId || v.id) !==
              (selectedVehicle.vehicleId || selectedVehicle.id)
          )
        );
        setTotalElements((prev) => prev - 1);
        alert("Xóa xe thành công!");
        setShowDeleteModal(false);
        setSelectedVehicle(null);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Delete vehicle error:", error);
      alert("Lỗi khi xóa xe. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicleName: vehicle.vehicleName || vehicle.name || "",
      vehicleModel: vehicle.vehicleModel || vehicle.model || "",
      vehicleVin: vehicle.vehicleVin || vehicle.vin || "",
      vehicleYear:
        vehicle.vehicleYear || vehicle.year || new Date().getFullYear(),
      customerId: vehicle.customerId || "",
      vehicleColor: vehicle.vehicleColor || vehicle.color || "",
      vehicleEngine: vehicle.vehicleEngine || "",
    });

    // Find and set customer info for edit modal
    if (vehicle.customerId) {
      const customer = customers.find(
        (c) => c.customerId === vehicle.customerId
      );
      setSelectedCustomerInfo(customer || null);
    } else {
      setSelectedCustomerInfo(null);
    }

    setShowEditModal(true);
  };

  // Open View Modal
  const openViewModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowViewModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteModal(true);
  };

  // Filtered Vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      !searchTerm ||
      (vehicle.vehicleVin || vehicle.vin)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (vehicle.vehicleName || vehicle.brand)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (vehicle.vehicleModel || vehicle.model)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (vehicle.customerName || vehicle.ownerName)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesBrand =
      !filterBrand || (vehicle.vehicleName || vehicle.brand) === filterBrand;
    const matchesYear =
      !filterYear ||
      (vehicle.vehicleYear || vehicle.year)?.toString() === filterYear;

    return matchesSearch && matchesBrand && matchesYear;
  });

  // Get Unique Brands and Years for filters
  const uniqueBrands = [
    ...new Set(vehicles.map((v) => v.vehicleName || v.brand).filter(Boolean)),
  ];
  const uniqueYears = [
    ...new Set(vehicles.map((v) => v.vehicleYear || v.year).filter(Boolean)),
  ].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="admin-vehicle-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-vehicle-page"
      style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}
    >
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 30,
          paddingBottom: 15,
          borderBottom: "2px solid #e0e0e0",
        }}
      >
        <div
          className="header-left"
          style={{ display: "flex", alignItems: "center", gap: 20 }}
        >
          <button className="btn btn-back" onClick={() => navigate("/admin")}>
            <i className="fas fa-arrow-left"></i>
            Quay lại Dashboard
          </button>
          <div className="header-title">
            <h2 style={{ margin: 0 }}>Quản lý Xe điện</h2>
            <p
              className="header-subtitle"
              style={{ margin: 0, color: "#666", fontSize: 14 }}
            >
              Danh sách phương tiện và thông tin VIN
            </p>
          </div>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Thêm xe mới
          </button>
          <button className="btn btn-secondary" onClick={fetchVehicles}>
            <i className="fas fa-sync-alt"></i>
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fff3cd",
            color: "#856404",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Search and Filter Section */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 15,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: 250 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: 600 }}
            >
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo VIN, hãng, mẫu xe, chủ sở hữu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14,
              }}
            />
          </div>

          {/* Brand Filter */}
          <div style={{ minWidth: 150 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: 600 }}
            >
              Hãng xe
            </label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14,
              }}
            >
              <option value="">Tất cả hãng</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div style={{ minWidth: 120 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: 600 }}
            >
              Năm
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14,
              }}
            >
              <option value="">Tất cả năm</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div style={{ alignSelf: "flex-end" }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearchTerm("");
                setFilterBrand("");
                setFilterYear("");
              }}
              style={{ marginTop: 25 }}
            >
              <i className="fas fa-times"></i>
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginTop: 15, color: "#666", fontSize: 14 }}>
          Hiển thị {filteredVehicles.length} / {vehicles.length} xe
        </div>
      </div>

      <div
        className="table-responsive"
        style={{
          overflowX: "auto",
          background: "white",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <table
          className="vehicles-table"
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                VIN
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Hãng
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Mẫu xe
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Năm
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Chủ sở hữu
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Ngày tạo
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "center",
                  width: 200,
                }}
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v, index) => (
              <tr key={v.vehicleId || v.id || v.vehicleVin || v.vin || index}>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                    fontFamily: "monospace",
                  }}
                >
                  {v.vehicleVin || v.vin}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {v.vehicleName || v.brand}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {v.vehicleModel || v.model}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {v.vehicleYear || v.year}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {v.customerName || v.ownerName || "-"}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {v.createdAt ? formatDate(v.createdAt) : "-"}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      justifyContent: "center",
                    }}
                  >
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => openViewModal(v)}
                      title="Xem chi tiết"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => openEditModal(v)}
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(v)}
                      title="Xóa"
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

      {/* Create Vehicle Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm xe mới</h3>
              <button
                className="btn-close"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>vehicleVin *</label>
                    <input
                      type="text"
                      name="vehicleVin"
                      value={formData.vehicleVin}
                      onChange={handleInputChange}
                      placeholder="VIN"
                      className={formErrors.vehicleVin ? "error" : ""}
                    />
                    {formErrors.vehicleVin && (
                      <span className="error-text">
                        {formErrors.vehicleVin}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>vehicleName *</label>
                    <input
                      type="text"
                      name="vehicleName"
                      value={formData.vehicleName}
                      onChange={handleInputChange}
                      placeholder="Tesla Model Y"
                      className={formErrors.vehicleName ? "error" : ""}
                    />
                    {formErrors.vehicleName && (
                      <span className="error-text">
                        {formErrors.vehicleName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>vehicleModel *</label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      placeholder="Model Y Long Range"
                      className={formErrors.vehicleModel ? "error" : ""}
                    />
                    {formErrors.vehicleModel && (
                      <span className="error-text">
                        {formErrors.vehicleModel}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>vehicleYear *</label>
                    <input
                      type="number"
                      name="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className={formErrors.vehicleYear ? "error" : ""}
                    />
                    {formErrors.vehicleYear && (
                      <span className="error-text">
                        {formErrors.vehicleYear}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Khách hàng *</label>
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={(e) => {
                        console.log("🎯 Select changed:", e.target.value);
                        handleInputChange(e);
                      }}
                      className={formErrors.customerId ? "error" : ""}
                      disabled={loadingCustomers}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">
                        {loadingCustomers ? "Đang tải..." : "Chọn khách hàng"}
                      </option>
                      {customers.length > 0 ? (
                        customers.map((customer, index) => (
                          <option
                            key={customer.customerId || `customer-${index}`}
                            value={customer.customerId}
                          >
                            {customer.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Không có khách hàng nào
                        </option>
                      )}
                    </select>
                    {formErrors.customerId && (
                      <span className="error-text">
                        {formErrors.customerId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Information Display */}
                {selectedCustomerInfo && (
                  <div className="customer-info-section">
                    <h4
                      style={{
                        margin: "20px 0 15px 0",
                        color: "#333",
                        borderBottom: "2px solid #007bff",
                        paddingBottom: "5px",
                      }}
                    >
                      <i className="fas fa-user"></i> Thông tin khách hàng đã
                      chọn
                    </h4>
                    <div className="customer-info-grid">
                      <div className="customer-info-item">
                        <span className="info-label">Tên:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.name || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.email || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">Số điện thoại:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.phone || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">Địa chỉ:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.address || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">ID khách hàng:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.customerId || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">Ngày tạo:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.createdAt
                            ? formatDate(selectedCustomerInfo.createdAt)
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>vehicleColor *</label>
                    <input
                      type="text"
                      name="vehicleColor"
                      value={formData.vehicleColor}
                      onChange={handleInputChange}
                      placeholder="Màu xe (ví dụ: Xanh, Đỏ, Trắng)"
                      className={formErrors.vehicleColor ? "error" : ""}
                    />
                    {formErrors.vehicleColor && (
                      <span className="error-text">
                        {formErrors.vehicleColor}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>vehicleEngine *</label>
                    <input
                      type="text"
                      name="vehicleEngine"
                      value={formData.vehicleEngine}
                      onChange={handleInputChange}
                      placeholder="Động cơ (ví dụ: Electric Motor, Dual Motor AWD)"
                      className={formErrors.vehicleEngine ? "error" : ""}
                    />
                    {formErrors.vehicleEngine && (
                      <span className="error-text">
                        {formErrors.vehicleEngine}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Đang tạo..." : "Tạo xe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa thông tin xe</h3>
              <button
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>VIN *</label>
                    <input
                      type="text"
                      name="vehicleVin"
                      value={formData.vehicleVin}
                      onChange={handleInputChange}
                      placeholder="Nhập VIN xe (định dạng: 12-MĐ-345.67)"
                      className={formErrors.vehicleVin ? "error" : ""}
                    />
                    {formErrors.vehicleVin && (
                      <span className="error-text">
                        {formErrors.vehicleVin}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Hãng xe *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Tesla, Hyundai, VinFast..."
                      className={formErrors.brand ? "error" : ""}
                    />
                    {formErrors.brand && (
                      <span className="error-text">{formErrors.brand}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mẫu xe *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="Model S, Ioniq 5, VF8..."
                      className={formErrors.model ? "error" : ""}
                    />
                    {formErrors.model && (
                      <span className="error-text">{formErrors.model}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Năm sản xuất *</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className={formErrors.year ? "error" : ""}
                    />
                    {formErrors.year && (
                      <span className="error-text">{formErrors.year}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Khách hàng *</label>
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={(e) => {
                        console.log("🎯 Edit Select changed:", e.target.value);
                        handleInputChange(e);
                      }}
                      className={formErrors.customerId ? "error" : ""}
                      disabled={loadingCustomers}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">
                        {loadingCustomers ? "Đang tải..." : "Chọn khách hàng"}
                      </option>
                      {customers.length > 0 ? (
                        customers.map((customer, index) => (
                          <option
                            key={customer.customerId || `customer-${index}`}
                            value={customer.customerId}
                          >
                            {customer.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Không có khách hàng nào
                        </option>
                      )}
                    </select>
                    {formErrors.customerId && (
                      <span className="error-text">
                        {formErrors.customerId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Information Display in Edit Modal */}
                {selectedCustomerInfo && (
                  <div className="customer-info-section">
                    <h4
                      style={{
                        margin: "20px 0 15px 0",
                        color: "#333",
                        borderBottom: "2px solid #007bff",
                        paddingBottom: "5px",
                      }}
                    >
                      <i className="fas fa-user"></i> Thông tin khách hàng đã
                      chọn
                    </h4>
                    <div className="customer-info-grid">
                      <div className="customer-info-item">
                        <span className="info-label">Tên:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.name || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.email || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">Số điện thoại:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.phone || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">Địa chỉ:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.address || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">ID khách hàng:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.customerId || "-"}
                        </span>
                      </div>
                      <div className="customer-info-item">
                        <span className="info-label">Ngày tạo:</span>
                        <span className="info-value">
                          {selectedCustomerInfo.createdAt
                            ? formatDate(selectedCustomerInfo.createdAt)
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Tên chủ sở hữu *</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Họ và tên chủ sở hữu"
                      className={formErrors.ownerName ? "error" : ""}
                    />
                    {formErrors.ownerName && (
                      <span className="error-text">{formErrors.ownerName}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Email chủ sở hữu</label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className={formErrors.ownerEmail ? "error" : ""}
                    />
                    {formErrors.ownerEmail && (
                      <span className="error-text">
                        {formErrors.ownerEmail}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                      placeholder="0123456789"
                      className={formErrors.ownerPhone ? "error" : ""}
                    />
                    {formErrors.ownerPhone && (
                      <span className="error-text">
                        {formErrors.ownerPhone}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Ngày mua</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày bắt đầu bảo hành</label>
                    <input
                      type="date"
                      name="warrantyStartDate"
                      value={formData.warrantyStartDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dung lượng pin (kWh)</label>
                    <input
                      type="number"
                      name="batteryCapacity"
                      value={formData.batteryCapacity}
                      onChange={handleInputChange}
                      placeholder="75"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tầm hoạt động (km)</label>
                    <input
                      type="number"
                      name="range"
                      value={formData.range}
                      onChange={handleInputChange}
                      placeholder="500"
                    />
                  </div>
                  <div className="form-group">
                    <label>Màu sắc</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="Đỏ, Xanh, Trắng..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm về xe..."
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Vehicle Modal */}
      {showViewModal && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chi tiết xe - {selectedVehicle.vin}</h3>
              <button
                className="btn-close"
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Thông tin cơ bản</h4>
                  <div className="detail-row">
                    <span className="detail-label">VIN:</span>
                    <span className="detail-value">{selectedVehicle.vin}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Hãng xe:</span>
                    <span className="detail-value">
                      {selectedVehicle.brand}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mẫu xe:</span>
                    <span className="detail-value">
                      {selectedVehicle.model}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Năm sản xuất:</span>
                    <span className="detail-value">{selectedVehicle.year}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Màu sắc:</span>
                    <span className="detail-value">
                      {selectedVehicle.color || "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin chủ sở hữu</h4>
                  <div className="detail-row">
                    <span className="detail-label">Tên:</span>
                    <span className="detail-value">
                      {selectedVehicle.ownerName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      {selectedVehicle.ownerEmail || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Số điện thoại:</span>
                    <span className="detail-value">
                      {selectedVehicle.ownerPhone || "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin kỹ thuật</h4>
                  <div className="detail-row">
                    <span className="detail-label">Dung lượng pin:</span>
                    <span className="detail-value">
                      {selectedVehicle.batteryCapacity
                        ? `${selectedVehicle.batteryCapacity} kWh`
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tầm hoạt động:</span>
                    <span className="detail-value">
                      {selectedVehicle.range
                        ? `${selectedVehicle.range} km`
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ngày mua:</span>
                    <span className="detail-value">
                      {selectedVehicle.purchaseDate
                        ? formatDate(selectedVehicle.purchaseDate)
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ngày bắt đầu bảo hành:</span>
                    <span className="detail-value">
                      {selectedVehicle.warrantyStartDate
                        ? formatDate(selectedVehicle.warrantyStartDate)
                        : "-"}
                    </span>
                  </div>
                </div>

                {selectedVehicle.notes && (
                  <div className="detail-section full-width">
                    <h4>Ghi chú</h4>
                    <div className="detail-row">
                      <span className="detail-value">
                        {selectedVehicle.notes}
                      </span>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Thông tin hệ thống</h4>
                  <div className="detail-row">
                    <span className="detail-label">Ngày tạo:</span>
                    <span className="detail-value">
                      {selectedVehicle.createdAt
                        ? formatDate(selectedVehicle.createdAt)
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{selectedVehicle.id}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedVehicle);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVehicle && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Xác nhận xóa xe</h3>
              <button
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="warning-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <p>Bạn có chắc chắn muốn xóa xe này?</p>
                <div className="vehicle-info">
                  <strong>VIN:</strong> {selectedVehicle.vin}
                  <br />
                  <strong>Hãng:</strong> {selectedVehicle.brand}
                  <br />
                  <strong>Mẫu:</strong> {selectedVehicle.model}
                  <br />
                  <strong>Chủ sở hữu:</strong> {selectedVehicle.ownerName}
                </div>
                <p className="warning-text">
                  <i className="fas fa-warning"></i>
                  Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? "Đang xóa..." : "Xóa xe"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }
        .btn-back {
          background: #17a2b8;
          color: white;
        }
        .btn-back:hover:not(:disabled) {
          background: #138496;
        }
        .btn-info {
          background: #17a2b8;
          color: white;
        }
        .btn-info:hover:not(:disabled) {
          background: #138496;
        }
        .btn-warning {
          background: #ffc107;
          color: #212529;
        }
        .btn-warning:hover:not(:disabled) {
          background: #e0a800;
        }
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        .btn-danger:hover:not(:disabled) {
          background: #c82333;
        }
        .btn-outline {
          background: transparent;
          color: #6c757d;
          border: 1px solid #6c757d;
        }
        .btn-outline:hover:not(:disabled) {
          background: #6c757d;
          color: white;
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

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-large {
          max-width: 800px;
        }
        .modal-small {
          max-width: 400px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          border-bottom: 1px solid #e0e0e0;
        }
        .modal-header h3 {
          margin: 0;
          color: #333;
        }
        .btn-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
          padding: 5px;
        }
        .btn-close:hover {
          color: #333;
        }
        .modal-body {
          padding: 25px;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px 25px;
          border-top: 1px solid #e0e0e0;
        }

        /* Form Styles */
        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        .form-group {
          flex: 1;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
          border-color: #dc3545;
        }
        .error-text {
          color: #dc3545;
          font-size: 12px;
          margin-top: 5px;
          display: block;
        }

        /* Detail View Styles */
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .detail-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .detail-section.full-width {
          grid-column: 1 / -1;
        }
        .detail-section h4 {
          margin: 0 0 15px 0;
          color: #333;
          border-bottom: 2px solid #007bff;
          padding-bottom: 5px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
          align-items: flex-start;
        }
        .detail-label {
          font-weight: 600;
          color: #666;
          min-width: 120px;
          margin-right: 10px;
        }
        .detail-value {
          color: #333;
          flex: 1;
        }

        /* Delete Confirmation Styles */
        .delete-confirmation {
          text-align: center;
          padding: 20px;
        }
        .warning-icon {
          font-size: 48px;
          color: #ffc107;
          margin-bottom: 15px;
        }
        .vehicle-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          text-align: left;
        }
        .warning-text {
          color: #dc3545;
          font-weight: 600;
          margin-top: 15px;
        }

        /* Customer Information Display Styles */
        .customer-info-section {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .customer-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        .customer-info-item {
          display: flex;
          align-items: center;
          padding: 8px 0;
        }
        .info-label {
          font-weight: 600;
          color: #495057;
          min-width: 120px;
          margin-right: 10px;
        }
        .info-value {
          color: #212529;
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default AdminVehicleManagement;
