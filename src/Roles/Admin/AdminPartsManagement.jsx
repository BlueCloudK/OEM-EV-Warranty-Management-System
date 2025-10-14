import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ================================
 * ⚙️ ADMIN PARTS MANAGEMENT
 * ================================
 * Endpoints:
 * - GET /api/parts
 * - GET /api/parts/{id}
 * - POST /api/parts
 * - PUT /api/parts/{id}
 * - DELETE /api/parts/{id}
 */

const AdminPartsManagement = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CRUD Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    partNumber: "",
    name: "",
    description: "",
    category: "",
    warrantyMonths: 12,
    stock: 0,
    minStock: 5,
    maxStock: 100,
    unitPrice: "",
    supplier: "",
    supplierContact: "",
    notes: "",
  });

  // Form Validation
  const [formErrors, setFormErrors] = useState({});

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterWarranty, setFilterWarranty] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const mockParts = [
    {
      id: 1,
      partNumber: "BAT-001",
      name: "Battery Pack",
      warrantyMonths: 96,
      stock: 10,
      createdAt: "2024-04-01T08:00:00Z",
    },
    {
      id: 2,
      partNumber: "MCU-010",
      name: "Motor Controller",
      warrantyMonths: 36,
      stock: 25,
      createdAt: "2024-04-10T08:00:00Z",
    },
  ];

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      setLoading(true);
      setError("");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        setParts(mockParts);
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/parts`, {
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
      setParts(
        Array.isArray(data.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (e) {
      console.error("Fetch parts failed:", e);
      setError("Không tải được danh sách phụ tùng. Hiển thị dữ liệu demo.");
      setParts(mockParts);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString("vi-VN");

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.partNumber.trim()) {
      errors.partNumber = "Mã phụ tùng là bắt buộc";
    } else if (formData.partNumber.length < 3) {
      errors.partNumber = "Mã phụ tùng phải có ít nhất 3 ký tự";
    }

    if (!formData.name.trim()) {
      errors.name = "Tên phụ tùng là bắt buộc";
    }

    if (!formData.category.trim()) {
      errors.category = "Danh mục là bắt buộc";
    }

    if (!formData.warrantyMonths || formData.warrantyMonths < 0) {
      errors.warrantyMonths = "Thời gian bảo hành phải lớn hơn 0";
    }

    if (formData.stock < 0) {
      errors.stock = "Số lượng tồn kho không được âm";
    }

    if (formData.minStock < 0) {
      errors.minStock = "Số lượng tối thiểu không được âm";
    }

    if (formData.maxStock < formData.minStock) {
      errors.maxStock = "Số lượng tối đa phải lớn hơn số lượng tối thiểu";
    }

    if (formData.unitPrice && formData.unitPrice < 0) {
      errors.unitPrice = "Giá đơn vị không được âm";
    }

    if (
      formData.supplierContact &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supplierContact)
    ) {
      errors.supplierContact = "Email nhà cung cấp không hợp lệ";
    }

    return errors;
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      partNumber: "",
      name: "",
      description: "",
      category: "",
      warrantyMonths: 12,
      stock: 0,
      minStock: 5,
      maxStock: 100,
      unitPrice: "",
      supplier: "",
      supplierContact: "",
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

  // Create Part
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

      const response = await fetch(`${API_BASE_URL}/api/parts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newPart = await response.json();
        setParts((prev) => [newPart, ...prev]);
        setTotalElements((prev) => prev + 1);
        alert("Tạo phụ tùng thành công!");
        setShowCreateModal(false);
        resetForm();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Create part error:", error);
      alert("Lỗi khi tạo phụ tùng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update Part
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
        `${API_BASE_URL}/api/parts/${selectedPart.id}`,
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
        const updatedPart = await response.json();
        setParts((prev) =>
          prev.map((p) => (p.id === selectedPart.id ? updatedPart : p))
        );
        alert("Cập nhật phụ tùng thành công!");
        setShowEditModal(false);
        setSelectedPart(null);
        resetForm();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Update part error:", error);
      alert("Lỗi khi cập nhật phụ tùng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Part
  const handleDelete = async () => {
    if (!selectedPart) return;

    setSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/parts/${selectedPart.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.ok) {
        setParts((prev) => prev.filter((p) => p.id !== selectedPart.id));
        setTotalElements((prev) => prev - 1);
        alert("Xóa phụ tùng thành công!");
        setShowDeleteModal(false);
        setSelectedPart(null);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Delete part error:", error);
      alert("Lỗi khi xóa phụ tùng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (part) => {
    setSelectedPart(part);
    setFormData({
      partNumber: part.partNumber || "",
      name: part.name || "",
      description: part.description || "",
      category: part.category || "",
      warrantyMonths: part.warrantyMonths || 12,
      stock: part.stock || 0,
      minStock: part.minStock || 5,
      maxStock: part.maxStock || 100,
      unitPrice: part.unitPrice || "",
      supplier: part.supplier || "",
      supplierContact: part.supplierContact || "",
      notes: part.notes || "",
    });
    setShowEditModal(true);
  };

  // Open View Modal
  const openViewModal = (part) => {
    setSelectedPart(part);
    setShowViewModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (part) => {
    setSelectedPart(part);
    setShowDeleteModal(true);
  };

  // Filtered Parts
  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      !searchTerm ||
      part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filterCategory || part.category === filterCategory;
    const matchesWarranty =
      !filterWarranty || part.warrantyMonths?.toString() === filterWarranty;

    return matchesSearch && matchesCategory && matchesWarranty;
  });

  // Get Unique Categories and Warranty periods for filters
  const uniqueCategories = [
    ...new Set(parts.map((p) => p.category).filter(Boolean)),
  ];
  const uniqueWarrantyPeriods = [
    ...new Set(parts.map((p) => p.warrantyMonths).filter(Boolean)),
  ].sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="admin-parts-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách phụ tùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-parts-page"
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
            <h2 style={{ margin: 0 }}>Quản lý Phụ tùng</h2>
            <p
              className="header-subtitle"
              style={{ margin: 0, color: "#666", fontSize: 14 }}
            >
              Kho phụ tùng và thông tin bảo hành
            </p>
          </div>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Thêm phụ tùng mới
          </button>
          <button className="btn btn-secondary" onClick={fetchParts}>
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
              placeholder="Tìm theo mã, tên, danh mục, nhà cung cấp..."
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

          {/* Category Filter */}
          <div style={{ minWidth: 150 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: 600 }}
            >
              Danh mục
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14,
              }}
            >
              <option value="">Tất cả danh mục</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Warranty Filter */}
          <div style={{ minWidth: 120 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: 600 }}
            >
              Bảo hành (tháng)
            </label>
            <select
              value={filterWarranty}
              onChange={(e) => setFilterWarranty(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14,
              }}
            >
              <option value="">Tất cả</option>
              {uniqueWarrantyPeriods.map((period) => (
                <option key={period} value={period}>
                  {period} tháng
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
                setFilterCategory("");
                setFilterWarranty("");
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
          Hiển thị {filteredParts.length} / {parts.length} phụ tùng
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
          className="parts-table"
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
                Part No.
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Tên
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Bảo hành (tháng)
              </th>
              <th
                style={{
                  background: "#f5f5f5",
                  padding: "12px 15px",
                  textAlign: "left",
                }}
              >
                Tồn kho
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
            {filteredParts.map((p, index) => (
              <tr key={`part-${p.id || p.partNumber || index}`}>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                    fontFamily: "monospace",
                  }}
                >
                  {p.partNumber}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {p.name}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {p.warrantyMonths}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {p.stock ?? "-"}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {p.createdAt ? formatDate(p.createdAt) : "-"}
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
                      onClick={() => openViewModal(p)}
                      title="Xem chi tiết"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => openEditModal(p)}
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(p)}
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

      {/* Create Part Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm phụ tùng mới</h3>
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
                    <label>Mã phụ tùng *</label>
                    <input
                      type="text"
                      name="partNumber"
                      value={formData.partNumber}
                      onChange={handleInputChange}
                      placeholder="BAT-001, MCU-010..."
                      className={formErrors.partNumber ? "error" : ""}
                    />
                    {formErrors.partNumber && (
                      <span className="error-text">
                        {formErrors.partNumber}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Tên phụ tùng *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Battery Pack, Motor Controller..."
                      className={formErrors.name ? "error" : ""}
                    />
                    {formErrors.name && (
                      <span className="error-text">{formErrors.name}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={formErrors.category ? "error" : ""}
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="Battery">Pin</option>
                      <option value="Motor">Động cơ</option>
                      <option value="Controller">Bộ điều khiển</option>
                      <option value="Charger">Sạc</option>
                      <option value="Sensor">Cảm biến</option>
                      <option value="Other">Khác</option>
                    </select>
                    {formErrors.category && (
                      <span className="error-text">{formErrors.category}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Thời gian bảo hành (tháng) *</label>
                    <input
                      type="number"
                      name="warrantyMonths"
                      value={formData.warrantyMonths}
                      onChange={handleInputChange}
                      min="0"
                      max="120"
                      className={formErrors.warrantyMonths ? "error" : ""}
                    />
                    {formErrors.warrantyMonths && (
                      <span className="error-text">
                        {formErrors.warrantyMonths}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về phụ tùng..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số lượng tồn kho</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className={formErrors.stock ? "error" : ""}
                    />
                    {formErrors.stock && (
                      <span className="error-text">{formErrors.stock}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Số lượng tối thiểu</label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      min="0"
                      className={formErrors.minStock ? "error" : ""}
                    />
                    {formErrors.minStock && (
                      <span className="error-text">{formErrors.minStock}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số lượng tối đa</label>
                    <input
                      type="number"
                      name="maxStock"
                      value={formData.maxStock}
                      onChange={handleInputChange}
                      min="0"
                      className={formErrors.maxStock ? "error" : ""}
                    />
                    {formErrors.maxStock && (
                      <span className="error-text">{formErrors.maxStock}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Giá đơn vị (VNĐ)</label>
                    <input
                      type="number"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      placeholder="1000000"
                      className={formErrors.unitPrice ? "error" : ""}
                    />
                    {formErrors.unitPrice && (
                      <span className="error-text">{formErrors.unitPrice}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nhà cung cấp</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      placeholder="Tên nhà cung cấp"
                    />
                  </div>
                  <div className="form-group">
                    <label>Liên hệ nhà cung cấp</label>
                    <input
                      type="email"
                      name="supplierContact"
                      value={formData.supplierContact}
                      onChange={handleInputChange}
                      placeholder="email@supplier.com"
                      className={formErrors.supplierContact ? "error" : ""}
                    />
                    {formErrors.supplierContact && (
                      <span className="error-text">
                        {formErrors.supplierContact}
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
                    placeholder="Ghi chú thêm về phụ tùng..."
                    rows="3"
                  />
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
                  {submitting ? "Đang tạo..." : "Tạo phụ tùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Part Modal */}
      {showEditModal && selectedPart && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa phụ tùng</h3>
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
                    <label>Mã phụ tùng *</label>
                    <input
                      type="text"
                      name="partNumber"
                      value={formData.partNumber}
                      onChange={handleInputChange}
                      placeholder="BAT-001, MCU-010..."
                      className={formErrors.partNumber ? "error" : ""}
                    />
                    {formErrors.partNumber && (
                      <span className="error-text">
                        {formErrors.partNumber}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Tên phụ tùng *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Battery Pack, Motor Controller..."
                      className={formErrors.name ? "error" : ""}
                    />
                    {formErrors.name && (
                      <span className="error-text">{formErrors.name}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={formErrors.category ? "error" : ""}
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="Battery">Pin</option>
                      <option value="Motor">Động cơ</option>
                      <option value="Controller">Bộ điều khiển</option>
                      <option value="Charger">Sạc</option>
                      <option value="Sensor">Cảm biến</option>
                      <option value="Other">Khác</option>
                    </select>
                    {formErrors.category && (
                      <span className="error-text">{formErrors.category}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Thời gian bảo hành (tháng) *</label>
                    <input
                      type="number"
                      name="warrantyMonths"
                      value={formData.warrantyMonths}
                      onChange={handleInputChange}
                      min="0"
                      max="120"
                      className={formErrors.warrantyMonths ? "error" : ""}
                    />
                    {formErrors.warrantyMonths && (
                      <span className="error-text">
                        {formErrors.warrantyMonths}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về phụ tùng..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số lượng tồn kho</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className={formErrors.stock ? "error" : ""}
                    />
                    {formErrors.stock && (
                      <span className="error-text">{formErrors.stock}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Số lượng tối thiểu</label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      min="0"
                      className={formErrors.minStock ? "error" : ""}
                    />
                    {formErrors.minStock && (
                      <span className="error-text">{formErrors.minStock}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số lượng tối đa</label>
                    <input
                      type="number"
                      name="maxStock"
                      value={formData.maxStock}
                      onChange={handleInputChange}
                      min="0"
                      className={formErrors.maxStock ? "error" : ""}
                    />
                    {formErrors.maxStock && (
                      <span className="error-text">{formErrors.maxStock}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Giá đơn vị (VNĐ)</label>
                    <input
                      type="number"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      placeholder="1000000"
                      className={formErrors.unitPrice ? "error" : ""}
                    />
                    {formErrors.unitPrice && (
                      <span className="error-text">{formErrors.unitPrice}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nhà cung cấp</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      placeholder="Tên nhà cung cấp"
                    />
                  </div>
                  <div className="form-group">
                    <label>Liên hệ nhà cung cấp</label>
                    <input
                      type="email"
                      name="supplierContact"
                      value={formData.supplierContact}
                      onChange={handleInputChange}
                      placeholder="email@supplier.com"
                      className={formErrors.supplierContact ? "error" : ""}
                    />
                    {formErrors.supplierContact && (
                      <span className="error-text">
                        {formErrors.supplierContact}
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
                    placeholder="Ghi chú thêm về phụ tùng..."
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

      {/* View Part Modal */}
      {showViewModal && selectedPart && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chi tiết phụ tùng - {selectedPart.partNumber}</h3>
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
                    <span className="detail-label">Mã phụ tùng:</span>
                    <span className="detail-value">
                      {selectedPart.partNumber}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tên phụ tùng:</span>
                    <span className="detail-value">{selectedPart.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Danh mục:</span>
                    <span className="detail-value">
                      {selectedPart.category}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Thời gian bảo hành:</span>
                    <span className="detail-value">
                      {selectedPart.warrantyMonths} tháng
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin kho</h4>
                  <div className="detail-row">
                    <span className="detail-label">Tồn kho:</span>
                    <span className="detail-value">
                      {selectedPart.stock || 0}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tối thiểu:</span>
                    <span className="detail-value">
                      {selectedPart.minStock || 0}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tối đa:</span>
                    <span className="detail-value">
                      {selectedPart.maxStock || 0}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Giá đơn vị:</span>
                    <span className="detail-value">
                      {selectedPart.unitPrice
                        ? `${selectedPart.unitPrice.toLocaleString()} VNĐ`
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin nhà cung cấp</h4>
                  <div className="detail-row">
                    <span className="detail-label">Nhà cung cấp:</span>
                    <span className="detail-value">
                      {selectedPart.supplier || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Liên hệ:</span>
                    <span className="detail-value">
                      {selectedPart.supplierContact || "-"}
                    </span>
                  </div>
                </div>

                {selectedPart.description && (
                  <div className="detail-section full-width">
                    <h4>Mô tả</h4>
                    <div className="detail-row">
                      <span className="detail-value">
                        {selectedPart.description}
                      </span>
                    </div>
                  </div>
                )}

                {selectedPart.notes && (
                  <div className="detail-section full-width">
                    <h4>Ghi chú</h4>
                    <div className="detail-row">
                      <span className="detail-value">{selectedPart.notes}</span>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Thông tin hệ thống</h4>
                  <div className="detail-row">
                    <span className="detail-label">Ngày tạo:</span>
                    <span className="detail-value">
                      {selectedPart.createdAt
                        ? formatDate(selectedPart.createdAt)
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{selectedPart.id}</span>
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
                  openEditModal(selectedPart);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPart && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Xác nhận xóa phụ tùng</h3>
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
                <p>Bạn có chắc chắn muốn xóa phụ tùng này?</p>
                <div className="part-info">
                  <strong>Mã phụ tùng:</strong> {selectedPart.partNumber}
                  <br />
                  <strong>Tên:</strong> {selectedPart.name}
                  <br />
                  <strong>Danh mục:</strong> {selectedPart.category}
                  <br />
                  <strong>Tồn kho:</strong> {selectedPart.stock || 0}
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
                {submitting ? "Đang xóa..." : "Xóa phụ tùng"}
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
        .part-info {
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
      `}</style>
    </div>
  );
};

export default AdminPartsManagement;
