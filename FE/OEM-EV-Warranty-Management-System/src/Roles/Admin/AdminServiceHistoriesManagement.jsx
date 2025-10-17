import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { serviceHistoriesApi } from "../../api/serviceHistories";

/**
 * ================================
 * 🛠️ ADMIN SERVICE HISTORIES MANAGEMENT
 * ================================
 * Endpoints:
 * - GET /api/service-histories
 * - GET /api/service-histories/{id}
 * - POST /api/service-histories
 * - PUT /api/service-histories/{id}
 * - DELETE /api/service-histories/{id}
 */

const AdminServiceHistoriesManagement = () => {
  const navigate = useNavigate();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CRUD Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Lookup sources
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    vehicleVin: "",
    partId: "",
    customerName: "",
    customerPhone: "",
    serviceType: "MAINTENANCE",
    description: "",
    serviceDate: "",
    serviceCenter: "",
    technician: "",
    partsUsed: "",
    laborHours: "",
    totalCost: "",
    status: "COMPLETED",
    notes: "",
    nextServiceDate: "",
    mileage: "",
    warrantyInfo: "",
  });

  // Form Validation
  const [formErrors, setFormErrors] = useState({});

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterServiceType, setFilterServiceType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCenter, setFilterCenter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const mockHistories = [
    {
      id: 1,
      vehicleVin: "VIN-123",
      description: "Bảo dưỡng định kỳ",
      serviceDate: "2024-03-20",
      center: "SC A",
    },
    {
      id: 2,
      vehicleVin: "VIN-456",
      description: "Thay thế pin",
      serviceDate: "2024-04-05",
      center: "SC B",
    },
  ];

  useEffect(() => {
    fetchHistories();
  }, []);

  // Prefetch lookup data for selection (first 100 items)
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");
        if (!API_BASE_URL || !token) return;
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        };
        const [vRes, pRes, cRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/vehicles?page=0&size=100`, { headers }),
          fetch(`${API_BASE_URL}/api/parts?page=0&size=100`, { headers }),
          fetch(`${API_BASE_URL}/api/customers?page=0&size=100`, { headers }),
        ]);
        if (
          vRes.ok &&
          (vRes.headers.get("Content-Type") || "").includes("application/json")
        ) {
          const vData = await vRes.json();
          const vList = Array.isArray(vData?.content)
            ? vData.content
            : Array.isArray(vData)
            ? vData
            : [];
          setVehicles(vList);
        }
        if (
          pRes.ok &&
          (pRes.headers.get("Content-Type") || "").includes("application/json")
        ) {
          const pData = await pRes.json();
          const pList = Array.isArray(pData?.content)
            ? pData.content
            : Array.isArray(pData)
            ? pData
            : [];
          setParts(pList);
        }
        if (
          cRes.ok &&
          (cRes.headers.get("Content-Type") || "").includes("application/json")
        ) {
          const cData = await cRes.json();
          const cList = Array.isArray(cData?.content)
            ? cData.content
            : Array.isArray(cData)
            ? cData
            : [];
          setCustomers(cList);
        }
      } catch (e) {
        // silent; lookups are optional
      }
    };
    fetchLookups();
  }, []);

  const fetchHistories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await serviceHistoriesApi.list();
      setHistories(
        Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (e) {
      console.error("Fetch service histories failed:", e);
      setError("Không tải được lịch sử bảo dưỡng. Hiển thị dữ liệu demo.");
      setHistories(mockHistories);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.vehicleVin.trim()) {
      errors.vehicleVin = "VIN xe là bắt buộc";
    } else if (formData.vehicleVin.length < 10) {
      errors.vehicleVin = "VIN phải có ít nhất 10 ký tự";
    }

    if (!formData.customerName.trim()) {
      errors.customerName = "Tên khách hàng là bắt buộc";
    }

    if (!formData.customerPhone.trim()) {
      errors.customerPhone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.customerPhone)) {
      errors.customerPhone = "Số điện thoại không hợp lệ";
    }

    if (!formData.serviceType.trim()) {
      errors.serviceType = "Loại dịch vụ là bắt buộc";
    }

    if (!formData.description.trim()) {
      errors.description = "Mô tả dịch vụ là bắt buộc";
    }

    if (!formData.serviceDate) {
      errors.serviceDate = "Ngày bảo dưỡng là bắt buộc";
    }

    if (!formData.partId.trim()) {
      errors.partId = "partId là bắt buộc";
    } else if (!/^[A-Z0-9-]+$/.test(formData.partId.trim())) {
      errors.partId = "partId chỉ gồm A-Z, 0-9, gạch ngang";
    }

    if (!formData.serviceCenter.trim()) {
      errors.serviceCenter = "Trung tâm dịch vụ là bắt buộc";
    }

    if (!formData.technician.trim()) {
      errors.technician = "Tên kỹ thuật viên là bắt buộc";
    }

    if (formData.laborHours && formData.laborHours < 0) {
      errors.laborHours = "Số giờ lao động không được âm";
    }

    if (formData.totalCost && formData.totalCost < 0) {
      errors.totalCost = "Tổng chi phí không được âm";
    }

    if (formData.mileage && formData.mileage < 0) {
      errors.mileage = "Số km không được âm";
    }

    return errors;
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      vehicleVin: "",
      partId: "",
      customerName: "",
      customerPhone: "",
      serviceType: "MAINTENANCE",
      description: "",
      serviceDate: "",
      serviceCenter: "",
      technician: "",
      partsUsed: "",
      laborHours: "",
      totalCost: "",
      status: "COMPLETED",
      notes: "",
      nextServiceDate: "",
      mileage: "",
      warrantyInfo: "",
    });
    setFormErrors({});
  };

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // When VIN changes, try to auto-fill customer & phone from lookups
    if (name === "vehicleVin") {
      const v = vehicles.find(
        (x) =>
          (x.vehicleVin || x.vin || "").toLowerCase() === value.toLowerCase()
      );
      if (v) {
        const customerName =
          v.customerName || (v.customer && v.customer.name) || "";
        const customerId =
          v.customerId || (v.customer && v.customer.customerId);
        let customerPhone = "";
        if (customerId) {
          const c = customers.find(
            (y) => (y.customerId || y.id) === customerId
          );
          if (c) customerPhone = c.phone || c.customerPhone || "";
        }
        setFormData((prev) => ({
          ...prev,
          customerName: customerName || prev.customerName,
          customerPhone: customerPhone || prev.customerPhone,
        }));
      }
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Create Service History
  const handleCreate = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      // resolve vehicleId from VIN
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      let vehicleId = null;
      if (API_BASE_URL && token && formData.vehicleVin) {
        const res = await fetch(
          `${API_BASE_URL}/api/vehicles/by-vin?vin=${encodeURIComponent(
            formData.vehicleVin.trim()
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (
          res.ok &&
          (res.headers.get("Content-Type") || "").includes("application/json")
        ) {
          const v = await res.json();
          vehicleId = v?.vehicleId || v?.id || null;
        }
      }

      const payload = {
        serviceDate: formData.serviceDate
          ? new Date(formData.serviceDate).toISOString()
          : new Date().toISOString(),
        serviceType: formData.serviceType,
        description: formData.description.trim(),
        partId: formData.partId.trim(),
        vehicleId,
      };

      const newHistory = await serviceHistoriesApi.create(payload);
      // refresh from server to stay in sync with paging/sorting
      await fetchHistories();
      alert("Tạo lịch sử bảo dưỡng thành công!");
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Create service history error:", error);
      alert("Lỗi khi tạo lịch sử bảo dưỡng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update Service History
  const handleUpdate = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const updatedHistory = await serviceHistoriesApi.update(
        selectedHistory.id,
        formData
      );
      await fetchHistories();
      alert("Cập nhật lịch sử bảo dưỡng thành công!");
      setShowEditModal(false);
      setSelectedHistory(null);
      resetForm();
    } catch (error) {
      console.error("Update service history error:", error);
      alert("Lỗi khi cập nhật lịch sử bảo dưỡng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Service History
  const handleDelete = async () => {
    if (!selectedHistory) return;

    setSubmitting(true);
    try {
      await serviceHistoriesApi.delete(selectedHistory.id);
      await fetchHistories();
      alert("Xóa lịch sử bảo dưỡng thành công!");
      setShowDeleteModal(false);
      setSelectedHistory(null);
    } catch (error) {
      console.error("Delete service history error:", error);
      alert("Lỗi khi xóa lịch sử bảo dưỡng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (history) => {
    setSelectedHistory(history);
    setFormData({
      vehicleVin: history.vehicleVin || "",
      partId: history.partId || "",
      customerName: history.customerName || "",
      customerPhone: history.customerPhone || "",
      serviceType: history.serviceType || "MAINTENANCE",
      description: history.description || "",
      serviceDate: history.serviceDate || "",
      serviceCenter: history.serviceCenter || "",
      technician: history.technician || "",
      partsUsed: history.partsUsed || "",
      laborHours: history.laborHours || "",
      totalCost: history.totalCost || "",
      status: history.status || "COMPLETED",
      notes: history.notes || "",
      nextServiceDate: history.nextServiceDate || "",
      mileage: history.mileage || "",
      warrantyInfo: history.warrantyInfo || "",
    });
    setShowEditModal(true);
  };

  // Open View Modal
  const openViewModal = (history) => {
    setSelectedHistory(history);
    setShowViewModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (history) => {
    setSelectedHistory(history);
    setShowDeleteModal(true);
  };

  // Filtered Histories
  const filteredHistories = histories.filter((history) => {
    const matchesSearch =
      !searchTerm ||
      history.vehicleVin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.serviceCenter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.technician?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesServiceType =
      !filterServiceType || history.serviceType === filterServiceType;
    const matchesStatus = !filterStatus || history.status === filterStatus;
    const matchesCenter =
      !filterCenter || history.serviceCenter === filterCenter;

    return (
      matchesSearch && matchesServiceType && matchesStatus && matchesCenter
    );
  });

  // Get Unique Service Types, Statuses, and Centers for filters
  const uniqueServiceTypes = [
    ...new Set(histories.map((h) => h.serviceType).filter(Boolean)),
  ];
  const uniqueStatuses = [
    ...new Set(histories.map((h) => h.status).filter(Boolean)),
  ];
  const uniqueCenters = [
    ...new Set(histories.map((h) => h.serviceCenter).filter(Boolean)),
  ];

  // Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "#17a2b8";
      case "IN_PROGRESS":
        return "#ffc107";
      case "COMPLETED":
        return "#28a745";
      case "CANCELLED":
        return "#dc3545";
      case "ON_HOLD":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  // Service Type Colors
  const getServiceTypeColor = (type) => {
    switch (type) {
      case "MAINTENANCE":
        return "#28a745";
      case "REPAIR":
        return "#dc3545";
      case "INSPECTION":
        return "#17a2b8";
      case "UPGRADE":
        return "#6f42c1";
      case "RECALL":
        return "#fd7e14";
      default:
        return "#6c757d";
    }
  };

  if (loading) {
    return (
      <div className="admin-histories-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải lịch sử bảo dưỡng...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-histories-page"
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
            <h2 style={{ margin: 0 }}>Quản lý Lịch sử Bảo dưỡng</h2>
            <p
              className="header-subtitle"
              style={{ margin: 0, color: "#666", fontSize: 14 }}
            >
              Toàn bộ lịch sử bảo dưỡng trong hệ thống
            </p>
          </div>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Thêm lịch sử bảo dưỡng mới
          </button>
          <button className="btn btn-secondary" onClick={fetchHistories}>
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
              placeholder="Tìm theo VIN, khách hàng, mô tả, trung tâm, kỹ thuật viên..."
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

          {/* Service Type Filter */}
          <div style={{ minWidth: 150 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: 600 }}
            >
              Loại dịch vụ
            </label>
            <select
              value={filterServiceType}
              onChange={(e) => setFilterServiceType(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14,
              }}
            >
              <option value="">Tất cả loại</option>
              {uniqueServiceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: 120 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: 600 }}
            >
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14,
              }}
            >
              <option value="">Tất cả</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Center Filter */}
          <div style={{ minWidth: 120 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: 600 }}
            >
              Trung tâm
            </label>
            <select
              value={filterCenter}
              onChange={(e) => setFilterCenter(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14,
              }}
            >
              <option value="">Tất cả</option>
              {uniqueCenters.map((center) => (
                <option key={center} value={center}>
                  {center}
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
                setFilterServiceType("");
                setFilterStatus("");
                setFilterCenter("");
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
          Hiển thị {filteredHistories.length} / {histories.length} lịch sử bảo
          dưỡng
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
          className="histories-table"
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
                Mô tả
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Loại
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Ngày dịch vụ
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Trung tâm
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
            {filteredHistories.map((h, index) => (
              <tr key={`history-${h.id || h.vehicleVin || index}`}>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                    fontFamily: "monospace",
                  }}
                >
                  {h.vehicleVin}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {h.description}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {h.serviceType}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {h.serviceDate ? formatDate(h.serviceDate) : "-"}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {h.center || "-"}
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
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => openViewModal(h)}
                      title="Xem chi tiết"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => openEditModal(h)}
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(h)}
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

      {/* Create Service History Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Thêm lịch sử bảo dưỡng mới</h3>
              <button
                className="btn-close"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-section">
                  <h4>Thông tin khách hàng</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên khách hàng *</label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="Họ và tên khách hàng"
                        className={formErrors.customerName ? "error" : ""}
                      />
                      {formErrors.customerName && (
                        <span className="error-text">
                          {formErrors.customerName}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        className={formErrors.customerPhone ? "error" : ""}
                      />
                      {formErrors.customerPhone && (
                        <span className="error-text">
                          {formErrors.customerPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin xe</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>VIN xe *</label>
                      <input
                        type="text"
                        name="vehicleVin"
                        value={formData.vehicleVin}
                        onChange={handleInputChange}
                        placeholder="VIN-1234567890"
                        className={formErrors.vehicleVin ? "error" : ""}
                        list="vinList"
                      />
                      <datalist id="vinList">
                        {vehicles.map((v) => (
                          <option
                            key={v.vehicleId || v.id || v.vehicleVin}
                            value={v.vehicleVin}
                          >
                            {(v.vehicleName || "") +
                              " / " +
                              (v.customerName || "")}
                          </option>
                        ))}
                      </datalist>
                      {formErrors.vehicleVin && (
                        <span className="error-text">
                          {formErrors.vehicleVin}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Số km</label>
                      <input
                        type="number"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        placeholder="50000"
                        min="0"
                        className={formErrors.mileage ? "error" : ""}
                      />
                      {formErrors.mileage && (
                        <span className="error-text">{formErrors.mileage}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin dịch vụ</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Part ID *</label>
                      <input
                        type="text"
                        name="partId"
                        value={formData.partId}
                        onChange={handleInputChange}
                        placeholder="PART-XXX-001"
                        className={formErrors.partId ? "error" : ""}
                        list="partIdList"
                      />
                      <datalist id="partIdList">
                        {parts.map((p) => (
                          <option key={p.partId} value={p.partId}>
                            {(p.partName || "") +
                              (p.partNumber ? ` (${p.partNumber})` : "")}
                          </option>
                        ))}
                      </datalist>
                      {formErrors.partId && (
                        <span className="error-text">{formErrors.partId}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Loại dịch vụ *</label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className={formErrors.serviceType ? "error" : ""}
                      >
                        <option value="">Chọn loại dịch vụ</option>
                        <option value="MAINTENANCE">Bảo dưỡng</option>
                        <option value="REPAIR">Sửa chữa</option>
                        <option value="INSPECTION">Kiểm tra</option>
                        <option value="UPGRADE">Nâng cấp</option>
                        <option value="RECALL">Thu hồi</option>
                      </select>
                      {formErrors.serviceType && (
                        <span className="error-text">
                          {formErrors.serviceType}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Ngày bảo dưỡng *</label>
                      <input
                        type="date"
                        name="serviceDate"
                        value={formData.serviceDate}
                        onChange={handleInputChange}
                        className={formErrors.serviceDate ? "error" : ""}
                      />
                      {formErrors.serviceDate && (
                        <span className="error-text">
                          {formErrors.serviceDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Mô tả dịch vụ *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết dịch vụ được thực hiện..."
                      rows="3"
                      className={formErrors.description ? "error" : ""}
                    />
                    {formErrors.description && (
                      <span className="error-text">
                        {formErrors.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin trung tâm dịch vụ</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Trung tâm dịch vụ *</label>
                      <input
                        type="text"
                        name="serviceCenter"
                        value={formData.serviceCenter}
                        onChange={handleInputChange}
                        placeholder="SC A, SC B, SC C..."
                        className={formErrors.serviceCenter ? "error" : ""}
                      />
                      {formErrors.serviceCenter && (
                        <span className="error-text">
                          {formErrors.serviceCenter}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Kỹ thuật viên *</label>
                      <input
                        type="text"
                        name="technician"
                        value={formData.technician}
                        onChange={handleInputChange}
                        placeholder="Tên kỹ thuật viên"
                        className={formErrors.technician ? "error" : ""}
                      />
                      {formErrors.technician && (
                        <span className="error-text">
                          {formErrors.technician}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Chi tiết kỹ thuật</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phụ tùng sử dụng</label>
                      <textarea
                        name="partsUsed"
                        value={formData.partsUsed}
                        onChange={handleInputChange}
                        placeholder="Danh sách phụ tùng đã thay thế..."
                        rows="2"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số giờ lao động</label>
                      <input
                        type="number"
                        name="laborHours"
                        value={formData.laborHours}
                        onChange={handleInputChange}
                        placeholder="2.5"
                        min="0"
                        step="0.5"
                        className={formErrors.laborHours ? "error" : ""}
                      />
                      {formErrors.laborHours && (
                        <span className="error-text">
                          {formErrors.laborHours}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tổng chi phí (VNĐ)</label>
                      <input
                        type="number"
                        name="totalCost"
                        value={formData.totalCost}
                        onChange={handleInputChange}
                        placeholder="1000000"
                        min="0"
                        step="1000"
                        className={formErrors.totalCost ? "error" : ""}
                      />
                      {formErrors.totalCost && (
                        <span className="error-text">
                          {formErrors.totalCost}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="SCHEDULED">Đã lên lịch</option>
                        <option value="IN_PROGRESS">Đang thực hiện</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                        <option value="ON_HOLD">Tạm dừng</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin bổ sung</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ngày bảo dưỡng tiếp theo</label>
                      <input
                        type="date"
                        name="nextServiceDate"
                        value={formData.nextServiceDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Thông tin bảo hành</label>
                      <input
                        type="text"
                        name="warrantyInfo"
                        value={formData.warrantyInfo}
                        onChange={handleInputChange}
                        placeholder="Thông tin bảo hành liên quan..."
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Ghi chú thêm về dịch vụ..."
                      rows="3"
                    />
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
                  {submitting ? "Đang tạo..." : "Tạo lịch sử"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service History Modal */}
      {showEditModal && selectedHistory && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chỉnh sửa lịch sử bảo dưỡng</h3>
              <button
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-section">
                  <h4>Thông tin khách hàng</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên khách hàng *</label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="Họ và tên khách hàng"
                        className={formErrors.customerName ? "error" : ""}
                      />
                      {formErrors.customerName && (
                        <span className="error-text">
                          {formErrors.customerName}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        className={formErrors.customerPhone ? "error" : ""}
                      />
                      {formErrors.customerPhone && (
                        <span className="error-text">
                          {formErrors.customerPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin xe</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>VIN xe *</label>
                      <input
                        type="text"
                        name="vehicleVin"
                        value={formData.vehicleVin}
                        onChange={handleInputChange}
                        placeholder="VIN-1234567890"
                        className={formErrors.vehicleVin ? "error" : ""}
                      />
                      {formErrors.vehicleVin && (
                        <span className="error-text">
                          {formErrors.vehicleVin}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Số km</label>
                      <input
                        type="number"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        placeholder="50000"
                        min="0"
                        className={formErrors.mileage ? "error" : ""}
                      />
                      {formErrors.mileage && (
                        <span className="error-text">{formErrors.mileage}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin dịch vụ</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Loại dịch vụ *</label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className={formErrors.serviceType ? "error" : ""}
                      >
                        <option value="">Chọn loại dịch vụ</option>
                        <option value="MAINTENANCE">Bảo dưỡng</option>
                        <option value="REPAIR">Sửa chữa</option>
                        <option value="INSPECTION">Kiểm tra</option>
                        <option value="UPGRADE">Nâng cấp</option>
                        <option value="RECALL">Thu hồi</option>
                      </select>
                      {formErrors.serviceType && (
                        <span className="error-text">
                          {formErrors.serviceType}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Ngày bảo dưỡng *</label>
                      <input
                        type="date"
                        name="serviceDate"
                        value={formData.serviceDate}
                        onChange={handleInputChange}
                        className={formErrors.serviceDate ? "error" : ""}
                      />
                      {formErrors.serviceDate && (
                        <span className="error-text">
                          {formErrors.serviceDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Mô tả dịch vụ *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết dịch vụ được thực hiện..."
                      rows="3"
                      className={formErrors.description ? "error" : ""}
                    />
                    {formErrors.description && (
                      <span className="error-text">
                        {formErrors.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin trung tâm dịch vụ</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Trung tâm dịch vụ *</label>
                      <input
                        type="text"
                        name="serviceCenter"
                        value={formData.serviceCenter}
                        onChange={handleInputChange}
                        placeholder="SC A, SC B, SC C..."
                        className={formErrors.serviceCenter ? "error" : ""}
                      />
                      {formErrors.serviceCenter && (
                        <span className="error-text">
                          {formErrors.serviceCenter}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Kỹ thuật viên *</label>
                      <input
                        type="text"
                        name="technician"
                        value={formData.technician}
                        onChange={handleInputChange}
                        placeholder="Tên kỹ thuật viên"
                        className={formErrors.technician ? "error" : ""}
                      />
                      {formErrors.technician && (
                        <span className="error-text">
                          {formErrors.technician}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Chi tiết kỹ thuật</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phụ tùng sử dụng</label>
                      <textarea
                        name="partsUsed"
                        value={formData.partsUsed}
                        onChange={handleInputChange}
                        placeholder="Danh sách phụ tùng đã thay thế..."
                        rows="2"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số giờ lao động</label>
                      <input
                        type="number"
                        name="laborHours"
                        value={formData.laborHours}
                        onChange={handleInputChange}
                        placeholder="2.5"
                        min="0"
                        step="0.5"
                        className={formErrors.laborHours ? "error" : ""}
                      />
                      {formErrors.laborHours && (
                        <span className="error-text">
                          {formErrors.laborHours}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tổng chi phí (VNĐ)</label>
                      <input
                        type="number"
                        name="totalCost"
                        value={formData.totalCost}
                        onChange={handleInputChange}
                        placeholder="1000000"
                        min="0"
                        step="1000"
                        className={formErrors.totalCost ? "error" : ""}
                      />
                      {formErrors.totalCost && (
                        <span className="error-text">
                          {formErrors.totalCost}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="SCHEDULED">Đã lên lịch</option>
                        <option value="IN_PROGRESS">Đang thực hiện</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                        <option value="ON_HOLD">Tạm dừng</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin bổ sung</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ngày bảo dưỡng tiếp theo</label>
                      <input
                        type="date"
                        name="nextServiceDate"
                        value={formData.nextServiceDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Thông tin bảo hành</label>
                      <input
                        type="text"
                        name="warrantyInfo"
                        value={formData.warrantyInfo}
                        onChange={handleInputChange}
                        placeholder="Thông tin bảo hành liên quan..."
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Ghi chú thêm về dịch vụ..."
                      rows="3"
                    />
                  </div>
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

      {/* View Service History Modal */}
      {showViewModal && selectedHistory && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chi tiết lịch sử bảo dưỡng - {selectedHistory.vehicleVin}</h3>
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
                  <h4>Thông tin khách hàng</h4>
                  <div className="detail-row">
                    <span className="detail-label">Tên:</span>
                    <span className="detail-value">
                      {selectedHistory.customerName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Số điện thoại:</span>
                    <span className="detail-value">
                      {selectedHistory.customerPhone}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin xe</h4>
                  <div className="detail-row">
                    <span className="detail-label">VIN:</span>
                    <span className="detail-value">
                      {selectedHistory.vehicleVin}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Số km:</span>
                    <span className="detail-value">
                      {selectedHistory.mileage || "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin dịch vụ</h4>
                  <div className="detail-row">
                    <span className="detail-label">Loại dịch vụ:</span>
                    <span className="detail-value">
                      <span
                        className="service-type-badge"
                        style={{
                          backgroundColor: getServiceTypeColor(
                            selectedHistory.serviceType
                          ),
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {selectedHistory.serviceType}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ngày bảo dưỡng:</span>
                    <span className="detail-value">
                      {selectedHistory.serviceDate
                        ? formatDate(selectedHistory.serviceDate)
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Trạng thái:</span>
                    <span className="detail-value">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(
                            selectedHistory.status
                          ),
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {selectedHistory.status}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin trung tâm</h4>
                  <div className="detail-row">
                    <span className="detail-label">Trung tâm:</span>
                    <span className="detail-value">
                      {selectedHistory.serviceCenter}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Kỹ thuật viên:</span>
                    <span className="detail-value">
                      {selectedHistory.technician}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Chi tiết kỹ thuật</h4>
                  <div className="detail-row">
                    <span className="detail-label">Số giờ lao động:</span>
                    <span className="detail-value">
                      {selectedHistory.laborHours || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tổng chi phí:</span>
                    <span className="detail-value">
                      {selectedHistory.totalCost
                        ? `${selectedHistory.totalCost.toLocaleString()} VNĐ`
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Mô tả dịch vụ</h4>
                  <div className="detail-row">
                    <span className="detail-value">
                      {selectedHistory.description}
                    </span>
                  </div>
                </div>

                {selectedHistory.partsUsed && (
                  <div className="detail-section full-width">
                    <h4>Phụ tùng sử dụng</h4>
                    <div className="detail-row">
                      <span className="detail-value">
                        {selectedHistory.partsUsed}
                      </span>
                    </div>
                  </div>
                )}

                {selectedHistory.nextServiceDate && (
                  <div className="detail-section">
                    <h4>Lịch bảo dưỡng tiếp theo</h4>
                    <div className="detail-row">
                      <span className="detail-label">Ngày:</span>
                      <span className="detail-value">
                        {formatDate(selectedHistory.nextServiceDate)}
                      </span>
                    </div>
                  </div>
                )}

                {selectedHistory.warrantyInfo && (
                  <div className="detail-section">
                    <h4>Thông tin bảo hành</h4>
                    <div className="detail-row">
                      <span className="detail-value">
                        {selectedHistory.warrantyInfo}
                      </span>
                    </div>
                  </div>
                )}

                {selectedHistory.notes && (
                  <div className="detail-section full-width">
                    <h4>Ghi chú</h4>
                    <div className="detail-row">
                      <span className="detail-value">
                        {selectedHistory.notes}
                      </span>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Thông tin hệ thống</h4>
                  <div className="detail-row">
                    <span className="detail-label">Ngày tạo:</span>
                    <span className="detail-value">
                      {selectedHistory.createdAt
                        ? formatDate(selectedHistory.createdAt)
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{selectedHistory.id}</span>
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
                  openEditModal(selectedHistory);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHistory && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Xác nhận xóa lịch sử bảo dưỡng</h3>
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
                <p>Bạn có chắc chắn muốn xóa lịch sử bảo dưỡng này?</p>
                <div className="history-info">
                  <strong>VIN xe:</strong> {selectedHistory.vehicleVin}
                  <br />
                  <strong>Khách hàng:</strong> {selectedHistory.customerName}
                  <br />
                  <strong>Loại dịch vụ:</strong> {selectedHistory.serviceType}
                  <br />
                  <strong>Ngày bảo dưỡng:</strong>{" "}
                  {selectedHistory.serviceDate
                    ? formatDate(selectedHistory.serviceDate)
                    : "-"}
                  <br />
                  <strong>Trung tâm:</strong> {selectedHistory.serviceCenter}
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
                {submitting ? "Đang xóa..." : "Xóa lịch sử"}
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
          max-width: 900px;
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
        .form-section {
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        .form-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .form-section h4 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }
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
        .history-info {
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

        /* Status and Service Type Badges */
        .status-badge, .service-type-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default AdminServiceHistoriesManagement;
