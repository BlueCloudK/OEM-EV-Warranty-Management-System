import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ================================
 * 🧾 ADMIN WARRANTY CLAIMS MANAGEMENT
 * ================================
 * Endpoints:
 * - GET /api/warranty-claims
 * - GET /api/warranty-claims/{id}
 * - PUT /api/warranty-claims/{id}
 * - DELETE /api/warranty-claims/{id}
 */

const AdminWarrantyClaimsManagement = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CRUD Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    code: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    vehicleVin: "",
    vehicleBrand: "",
    vehicleModel: "",
    partName: "",
    partNumber: "",
    issueDescription: "",
    claimDate: "",
    purchaseDate: "",
    warrantyStartDate: "",
    status: "PENDING",
    priority: "MEDIUM",
    estimatedCost: "",
    notes: "",
  });

  // Form Validation
  const [formErrors, setFormErrors] = useState({});

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const mockClaims = [
    {
      id: 1,
      code: "CLM-0001",
      customerName: "Nguyễn Văn A",
      vehicleVin: "VIN-123",
      part: "Battery",
      status: "PENDING",
      createdAt: "2024-04-01T10:00:00Z",
    },
    {
      id: 2,
      code: "CLM-0002",
      customerName: "Trần Thị B",
      vehicleVin: "VIN-456",
      part: "Motor",
      status: "APPROVED",
      createdAt: "2024-04-05T14:00:00Z",
    },
  ];

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError("");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        setClaims(mockClaims);
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/warranty-claims`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get("Content-Type");
      if (!ct || !ct.includes("application/json"))
        throw new Error("Non-JSON response");
      const data = await res.json();
      setClaims(
        Array.isArray(data.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (e) {
      console.error("Fetch claims failed:", e);
      setError("Không tải được danh sách claims. Hiển thị dữ liệu demo.");
      setClaims(mockClaims);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString("vi-VN");

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.customerName.trim()) {
      errors.customerName = "Tên khách hàng là bắt buộc";
    }

    if (!formData.customerEmail.trim()) {
      errors.customerEmail = "Email khách hàng là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = "Email không hợp lệ";
    }

    if (!formData.customerPhone.trim()) {
      errors.customerPhone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.customerPhone)) {
      errors.customerPhone = "Số điện thoại không hợp lệ";
    }

    if (!formData.vehicleVin.trim()) {
      errors.vehicleVin = "VIN xe là bắt buộc";
    } else if (formData.vehicleVin.length < 10) {
      errors.vehicleVin = "VIN phải có ít nhất 10 ký tự";
    }

    if (!formData.vehicleBrand.trim()) {
      errors.vehicleBrand = "Hãng xe là bắt buộc";
    }

    if (!formData.vehicleModel.trim()) {
      errors.vehicleModel = "Mẫu xe là bắt buộc";
    }

    if (!formData.partName.trim()) {
      errors.partName = "Tên phụ tùng là bắt buộc";
    }

    if (!formData.issueDescription.trim()) {
      errors.issueDescription = "Mô tả vấn đề là bắt buộc";
    }

    if (!formData.claimDate) {
      errors.claimDate = "Ngày yêu cầu bảo hành là bắt buộc";
    }

    if (formData.estimatedCost && formData.estimatedCost < 0) {
      errors.estimatedCost = "Chi phí ước tính không được âm";
    }

    return errors;
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      code: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      vehicleVin: "",
      vehicleBrand: "",
      vehicleModel: "",
      partName: "",
      partNumber: "",
      issueDescription: "",
      claimDate: "",
      purchaseDate: "",
      warrantyStartDate: "",
      status: "PENDING",
      priority: "MEDIUM",
      estimatedCost: "",
      notes: "",
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

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Generate Claim Code
  const generateClaimCode = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `CLM-${year}${month}${day}-${random}`;
  };

  // Create Claim
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

      const claimData = {
        ...formData,
        code: formData.code || generateClaimCode(),
      };

      const response = await fetch(`${API_BASE_URL}/api/warranty-claims`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(claimData),
      });

      if (response.ok) {
        const newClaim = await response.json();
        setClaims((prev) => [newClaim, ...prev]);
        setTotalElements((prev) => prev + 1);
        alert("Tạo yêu cầu bảo hành thành công!");
        setShowCreateModal(false);
        resetForm();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Create claim error:", error);
      alert("Lỗi khi tạo yêu cầu bảo hành. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update Claim
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
        `${API_BASE_URL}/api/warranty-claims/${selectedClaim.id}`,
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
        const updatedClaim = await response.json();
        setClaims((prev) =>
          prev.map((c) => (c.id === selectedClaim.id ? updatedClaim : c))
        );
        alert("Cập nhật yêu cầu bảo hành thành công!");
        setShowEditModal(false);
        setSelectedClaim(null);
        resetForm();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Update claim error:", error);
      alert("Lỗi khi cập nhật yêu cầu bảo hành. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Claim
  const handleDelete = async () => {
    if (!selectedClaim) return;

    setSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/warranty-claims/${selectedClaim.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.ok) {
        setClaims((prev) => prev.filter((c) => c.id !== selectedClaim.id));
        setTotalElements((prev) => prev - 1);
        alert("Xóa yêu cầu bảo hành thành công!");
        setShowDeleteModal(false);
        setSelectedClaim(null);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Delete claim error:", error);
      alert("Lỗi khi xóa yêu cầu bảo hành. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update Status
  const handleStatusUpdate = async (claimId, newStatus) => {
    setSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/warranty-claims/${claimId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        const updatedClaim = await response.json();
        setClaims((prev) =>
          prev.map((c) => (c.id === claimId ? updatedClaim : c))
        );
        alert(`Cập nhật trạng thái thành ${newStatus} thành công!`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert("Lỗi khi cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (claim) => {
    setSelectedClaim(claim);
    setFormData({
      code: claim.code || "",
      customerName: claim.customerName || "",
      customerEmail: claim.customerEmail || "",
      customerPhone: claim.customerPhone || "",
      vehicleVin: claim.vehicleVin || "",
      vehicleBrand: claim.vehicleBrand || "",
      vehicleModel: claim.vehicleModel || "",
      partName: claim.partName || "",
      partNumber: claim.partNumber || "",
      issueDescription: claim.issueDescription || "",
      claimDate: claim.claimDate || "",
      purchaseDate: claim.purchaseDate || "",
      warrantyStartDate: claim.warrantyStartDate || "",
      status: claim.status || "PENDING",
      priority: claim.priority || "MEDIUM",
      estimatedCost: claim.estimatedCost || "",
      notes: claim.notes || "",
    });
    setShowEditModal(true);
  };

  // Open View Modal
  const openViewModal = (claim) => {
    setSelectedClaim(claim);
    setShowViewModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (claim) => {
    setSelectedClaim(claim);
    setShowDeleteModal(true);
  };

  // Filtered Claims
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      !searchTerm ||
      claim.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.vehicleVin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.partName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || claim.status === filterStatus;
    const matchesPriority =
      !filterPriority || claim.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get Unique Statuses and Priorities for filters
  const uniqueStatuses = [
    ...new Set(claims.map((c) => c.status).filter(Boolean)),
  ];
  const uniquePriorities = [
    ...new Set(claims.map((c) => c.priority).filter(Boolean)),
  ];

  // Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#ffc107";
      case "APPROVED":
        return "#28a745";
      case "REJECTED":
        return "#dc3545";
      case "IN_PROGRESS":
        return "#17a2b8";
      case "COMPLETED":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  // Priority Colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "#dc3545";
      case "MEDIUM":
        return "#ffc107";
      case "LOW":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  if (loading) {
    return (
      <div className="admin-claims-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách yêu cầu bảo hành...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-claims-page"
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
            <h2 style={{ margin: 0 }}>Quản lý Warranty Claims</h2>
            <p
              className="header-subtitle"
              style={{ margin: 0, color: "#666", fontSize: 14 }}
            >
              Giám sát và xử lý yêu cầu bảo hành
            </p>
          </div>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Thêm yêu cầu bảo hành mới
          </button>
          <button className="btn btn-secondary" onClick={fetchClaims}>
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
              placeholder="Tìm theo mã, khách hàng, VIN, phụ tùng..."
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

          {/* Status Filter */}
          <div style={{ minWidth: 150 }}>
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
              <option value="">Tất cả trạng thái</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ minWidth: 120 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: 600 }}
            >
              Độ ưu tiên
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14,
              }}
            >
              <option value="">Tất cả</option>
              {uniquePriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
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
                setFilterStatus("");
                setFilterPriority("");
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
          Hiển thị {filteredClaims.length} / {claims.length} yêu cầu bảo hành
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
          className="claims-table"
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}
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
                Mã yêu cầu
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Khách hàng
              </th>
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
                Phụ tùng
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Trạng thái
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
                  width: 250,
                }}
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map((c, index) => (
              <tr key={`claim-${c.id || c.code || index}`}>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                    fontFamily: "monospace",
                  }}
                >
                  {c.code || c.claimCode}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {c.customerName || "-"}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {c.vehicleVin || "-"}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {c.part || c.partName || "-"}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      background:
                        c.status === "APPROVED"
                          ? "#d4edda"
                          : c.status === "REJECTED"
                          ? "#f8d7da"
                          : "#e2e3e5",
                      color: "#212529",
                      fontWeight: 600,
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {c.createdAt ? formatDate(c.createdAt) : "-"}
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
                      onClick={() => openViewModal(c)}
                      title="Xem chi tiết"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => openEditModal(c)}
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(c)}
                      title="Xóa"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    {c.status === "PENDING" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleStatusUpdate(c.id, "APPROVED")}
                        title="Phê duyệt"
                        disabled={submitting}
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    {c.status === "PENDING" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleStatusUpdate(c.id, "REJECTED")}
                        title="Từ chối"
                        disabled={submitting}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Claim Modal */}
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
              <h3>Thêm yêu cầu bảo hành mới</h3>
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
                    <label>Mã yêu cầu</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="Tự động tạo nếu để trống"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày yêu cầu *</label>
                    <input
                      type="date"
                      name="claimDate"
                      value={formData.claimDate}
                      onChange={handleInputChange}
                      className={formErrors.claimDate ? "error" : ""}
                    />
                    {formErrors.claimDate && (
                      <span className="error-text">{formErrors.claimDate}</span>
                    )}
                  </div>
                </div>

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
                      <label>Email khách hàng *</label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className={formErrors.customerEmail ? "error" : ""}
                      />
                      {formErrors.customerEmail && (
                        <span className="error-text">
                          {formErrors.customerEmail}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
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
                    <div className="form-group">
                      <label>Ngày mua xe</label>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleInputChange}
                      />
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
                      <label>Hãng xe *</label>
                      <input
                        type="text"
                        name="vehicleBrand"
                        value={formData.vehicleBrand}
                        onChange={handleInputChange}
                        placeholder="Tesla, Hyundai, VinFast..."
                        className={formErrors.vehicleBrand ? "error" : ""}
                      />
                      {formErrors.vehicleBrand && (
                        <span className="error-text">
                          {formErrors.vehicleBrand}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Mẫu xe *</label>
                      <input
                        type="text"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        placeholder="Model S, Ioniq 5, VF8..."
                        className={formErrors.vehicleModel ? "error" : ""}
                      />
                      {formErrors.vehicleModel && (
                        <span className="error-text">
                          {formErrors.vehicleModel}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Ngày bắt đầu bảo hành</label>
                      <input
                        type="date"
                        name="warrantyStartDate"
                        value={formData.warrantyStartDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin phụ tùng</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên phụ tùng *</label>
                      <input
                        type="text"
                        name="partName"
                        value={formData.partName}
                        onChange={handleInputChange}
                        placeholder="Battery Pack, Motor Controller..."
                        className={formErrors.partName ? "error" : ""}
                      />
                      {formErrors.partName && (
                        <span className="error-text">
                          {formErrors.partName}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Mã phụ tùng</label>
                      <input
                        type="text"
                        name="partNumber"
                        value={formData.partNumber}
                        onChange={handleInputChange}
                        placeholder="BAT-001, MCU-010..."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Chi tiết yêu cầu</h4>
                  <div className="form-group">
                    <label>Mô tả vấn đề *</label>
                    <textarea
                      name="issueDescription"
                      value={formData.issueDescription}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết vấn đề gặp phải..."
                      rows="4"
                      className={formErrors.issueDescription ? "error" : ""}
                    />
                    {formErrors.issueDescription && (
                      <span className="error-text">
                        {formErrors.issueDescription}
                      </span>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="APPROVED">Đã phê duyệt</option>
                        <option value="REJECTED">Từ chối</option>
                        <option value="IN_PROGRESS">Đang xử lý</option>
                        <option value="COMPLETED">Hoàn thành</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Độ ưu tiên</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="LOW">Thấp</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HIGH">Cao</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Chi phí ước tính (VNĐ)</label>
                      <input
                        type="number"
                        name="estimatedCost"
                        value={formData.estimatedCost}
                        onChange={handleInputChange}
                        placeholder="1000000"
                        min="0"
                        step="1000"
                        className={formErrors.estimatedCost ? "error" : ""}
                      />
                      {formErrors.estimatedCost && (
                        <span className="error-text">
                          {formErrors.estimatedCost}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Ghi chú thêm về yêu cầu bảo hành..."
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
                  {submitting ? "Đang tạo..." : "Tạo yêu cầu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Claim Modal */}
      {showEditModal && selectedClaim && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chỉnh sửa yêu cầu bảo hành</h3>
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
                      <label>Email khách hàng *</label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className={formErrors.customerEmail ? "error" : ""}
                      />
                      {formErrors.customerEmail && (
                        <span className="error-text">
                          {formErrors.customerEmail}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
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
                    <div className="form-group">
                      <label>Địa chỉ</label>
                      <input
                        type="text"
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        placeholder="Địa chỉ khách hàng"
                      />
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
                      <label>Hãng xe *</label>
                      <input
                        type="text"
                        name="vehicleBrand"
                        value={formData.vehicleBrand}
                        onChange={handleInputChange}
                        placeholder="Tesla, Hyundai, VinFast..."
                        className={formErrors.vehicleBrand ? "error" : ""}
                      />
                      {formErrors.vehicleBrand && (
                        <span className="error-text">
                          {formErrors.vehicleBrand}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Mẫu xe *</label>
                      <input
                        type="text"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        placeholder="Model S, Ioniq 5, VF8..."
                        className={formErrors.vehicleModel ? "error" : ""}
                      />
                      {formErrors.vehicleModel && (
                        <span className="error-text">
                          {formErrors.vehicleModel}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Năm sản xuất</label>
                      <input
                        type="number"
                        name="vehicleYear"
                        value={formData.vehicleYear}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin sự cố</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Loại phụ tùng *</label>
                      <input
                        type="text"
                        name="partName"
                        value={formData.partName}
                        onChange={handleInputChange}
                        placeholder="Battery, Motor, Controller..."
                        className={formErrors.partName ? "error" : ""}
                      />
                      {formErrors.partName && (
                        <span className="error-text">
                          {formErrors.partName}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Mức độ ưu tiên</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="LOW">Thấp</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HIGH">Cao</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Mô tả sự cố *</label>
                    <textarea
                      name="issueDescription"
                      value={formData.issueDescription}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết sự cố gặp phải..."
                      rows="4"
                      className={formErrors.issueDescription ? "error" : ""}
                    />
                    {formErrors.issueDescription && (
                      <span className="error-text">
                        {formErrors.issueDescription}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông tin xử lý</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="IN_PROGRESS">Đang xử lý</option>
                        <option value="APPROVED">Đã duyệt</option>
                        <option value="REJECTED">Từ chối</option>
                        <option value="COMPLETED">Hoàn thành</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Chi phí ước tính (VNĐ)</label>
                      <input
                        type="number"
                        name="estimatedCost"
                        value={formData.estimatedCost}
                        onChange={handleInputChange}
                        min="0"
                        step="1000"
                        placeholder="1000000"
                        className={formErrors.estimatedCost ? "error" : ""}
                      />
                      {formErrors.estimatedCost && (
                        <span className="error-text">
                          {formErrors.estimatedCost}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Ghi chú xử lý</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Ghi chú về quá trình xử lý..."
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

      {/* View Claim Modal */}
      {showViewModal && selectedClaim && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chi tiết yêu cầu bảo hành - {selectedClaim.claimNumber}</h3>
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
                      {selectedClaim.customerName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      {selectedClaim.customerEmail}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Số điện thoại:</span>
                    <span className="detail-value">
                      {selectedClaim.customerPhone}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Địa chỉ:</span>
                    <span className="detail-value">
                      {selectedClaim.customerAddress || "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin xe</h4>
                  <div className="detail-row">
                    <span className="detail-label">VIN:</span>
                    <span className="detail-value">
                      {selectedClaim.vehicleVin}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Hãng:</span>
                    <span className="detail-value">
                      {selectedClaim.vehicleBrand}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mẫu:</span>
                    <span className="detail-value">
                      {selectedClaim.vehicleModel}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Năm:</span>
                    <span className="detail-value">
                      {selectedClaim.vehicleYear || "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin sự cố</h4>
                  <div className="detail-row">
                    <span className="detail-label">Phụ tùng:</span>
                    <span className="detail-value">
                      {selectedClaim.partName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mức độ:</span>
                    <span className="detail-value">
                      <span
                        className="priority-badge"
                        style={{
                          backgroundColor: getPriorityColor(
                            selectedClaim.priority
                          ),
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {selectedClaim.priority}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Trạng thái:</span>
                    <span className="detail-value">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(selectedClaim.status),
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {selectedClaim.status}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Chi phí ước tính:</span>
                    <span className="detail-value">
                      {selectedClaim.estimatedCost
                        ? `${selectedClaim.estimatedCost.toLocaleString()} VNĐ`
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h4>Mô tả sự cố</h4>
                  <div className="detail-row">
                    <span className="detail-value">
                      {selectedClaim.issueDescription}
                    </span>
                  </div>
                </div>

                {selectedClaim.notes && (
                  <div className="detail-section full-width">
                    <h4>Ghi chú xử lý</h4>
                    <div className="detail-row">
                      <span className="detail-value">
                        {selectedClaim.notes}
                      </span>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Thông tin hệ thống</h4>
                  <div className="detail-row">
                    <span className="detail-label">Mã yêu cầu:</span>
                    <span className="detail-value">
                      {selectedClaim.claimNumber}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ngày tạo:</span>
                    <span className="detail-value">
                      {selectedClaim.createdAt
                        ? formatDate(selectedClaim.createdAt)
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{selectedClaim.id}</span>
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
                  openEditModal(selectedClaim);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedClaim && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Xác nhận xóa yêu cầu bảo hành</h3>
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
                <p>Bạn có chắc chắn muốn xóa yêu cầu bảo hành này?</p>
                <div className="claim-info">
                  <strong>Mã yêu cầu:</strong> {selectedClaim.claimNumber}
                  <br />
                  <strong>Khách hàng:</strong> {selectedClaim.customerName}
                  <br />
                  <strong>VIN xe:</strong> {selectedClaim.vehicleVin}
                  <br />
                  <strong>Phụ tùng:</strong> {selectedClaim.partName}
                  <br />
                  <strong>Trạng thái:</strong> {selectedClaim.status}
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
                {submitting ? "Đang xóa..." : "Xóa yêu cầu"}
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
        .btn-success {
          background: #28a745;
          color: white;
        }
        .btn-success:hover:not(:disabled) {
          background: #218838;
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
        .form-group input:disabled {
          background: #f8f9fa;
          color: #6c757d;
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
        .claim-info {
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

        /* Status and Priority Badges */
        .status-badge, .priority-badge {
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

export default AdminWarrantyClaimsManagement;
