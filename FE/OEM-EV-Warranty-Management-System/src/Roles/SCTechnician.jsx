import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { warrantyClaimsApi } from "../api/warrantyClaims";
import { serviceHistoriesApi } from "../api/serviceHistories";

export default function SCTechnician() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [serviceHistories, setServiceHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("claims");
  const [search, setSearch] = useState("");
  const [showServiceHistoryModal, setShowServiceHistoryModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [serviceHistoryForm, setServiceHistoryForm] = useState({
    serviceDate: new Date().toISOString().slice(0, 16),
    serviceType: "REPAIR",
    description: "",
    partId: "",
    vehicleId: "",
    serviceCenterId: "",
    technicianId: "",
    partsUsed: [],
  });
  const [serviceCenters, setServiceCenters] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [parts, setParts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    console.log("=== SCTechnician component mounted ===");
    console.log(
      "Current token:",
      localStorage.getItem("token") || localStorage.getItem("accessToken")
    );
    console.log("Current role:", localStorage.getItem("role"));
    console.log("Current user:", localStorage.getItem("user"));

    // Check if user is authenticated
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");

    if (!token) {
      console.error("❌ No token found, redirecting to login");
      navigate("/login");
      return;
    }

    if (role !== "SC_TECHNICIAN") {
      console.error("❌ Invalid role for SCTechnician:", role);
      navigate("/login");
      return;
    }

    console.log("✅ Role check passed for SC_TECHNICIAN");

    console.log("✅ Authentication check passed, starting data fetch...");

    // Add error boundary for each function
    try {
      fetchData();
    } catch (e) {
      console.error("❌ fetchData error:", e);
    }

    try {
      fetchLookupData();
    } catch (e) {
      console.error("❌ fetchLookupData error:", e);
    }

    try {
      fetchCurrentUser();
    } catch (e) {
      console.error("❌ fetchCurrentUser error:", e);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token) {
        console.warn("No token found, skipping user validation");
        return;
      }

      console.log(
        "🔑 Fetching current user with token:",
        token.substring(0, 20) + "..."
      );
      console.log("🔑 Full token:", token);

      const response = await fetch(
        "https://backend.bluecloudk.xyz/api/auth/validate",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log(
        "📡 User validation response:",
        response.status,
        response.statusText
      );

      // Log response body for debugging
      try {
        const responseText = await response.text();
        console.log("📡 Response body:", responseText);

        if (response.ok) {
          const userData = JSON.parse(responseText);
          setCurrentUser(userData);
          console.log("✅ Current user fetched successfully:", userData);
        } else {
          console.warn(
            "⚠️ User validation failed:",
            response.status,
            response.statusText
          );
          console.log("🔄 Continuing without user validation...");
        }
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        console.log("🔄 Continuing without user validation...");
      }
    } catch (e) {
      console.error("❌ Failed to fetch current user:", e);
      alert(`fetchCurrentUser error: ${e.message}`);
      // Don't redirect on error, just log it
      console.log("🔄 Continuing without user validation...");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 SCTechnician: Fetching data...");

      // SC_TECHNICIAN doesn't have access to warranty claims API, use mock data
      console.log("🔍 SC_TECHNICIAN role detected, using mock claims data");
      setClaims([
        {
          id: 1,
          code: "CLM-001",
          customerName: "Nguyễn Văn A",
          vehicleVin: "VIN-123456",
          partName: "Battery Pack",
          status: "APPROVED",
          description: "Battery not charging properly",
        },
        {
          id: 2,
          code: "CLM-002",
          customerName: "Trần Thị B",
          vehicleVin: "VIN-789012",
          partName: "Electric Motor",
          status: "IN_PROGRESS",
          description: "Motor making strange noise",
        },
      ]);

      // SC_TECHNICIAN doesn't have access to service histories API, use mock data
      console.log(
        "🔍 SC_TECHNICIAN role detected, using mock service histories data"
      );
      setServiceHistories([
        {
          id: 1,
          serviceDate: "2024-01-15T10:00:00Z",
          serviceType: "REPAIR",
          customerName: "Nguyễn Văn A",
          vehicleVin: "VIN-123456",
          partName: "Battery Pack",
          description: "Replaced faulty battery pack",
        },
        {
          id: 2,
          serviceDate: "2024-01-20T14:30:00Z",
          serviceType: "MAINTENANCE",
          customerName: "Trần Thị B",
          vehicleVin: "VIN-789012",
          partName: "Electric Motor",
          description: "Regular maintenance check",
        },
      ]);

      console.log("✅ fetchData completed successfully");
    } catch (e) {
      console.error("❌ SCTechnician fetch data failed:", e);
      setError("Không tải được dữ liệu.");
    } finally {
      setLoading(false);
      console.log("🏁 fetchData finished, loading set to false");
    }
  };

  const fetchLookupData = async () => {
    try {
      // Mock data for service centers and technicians
      setServiceCenters([
        {
          id: 1,
          name: "Trung tâm dịch vụ Hà Nội",
          address: "123 Đường ABC, Hà Nội",
        },
        {
          id: 2,
          name: "Trung tâm dịch vụ TP.HCM",
          address: "456 Đường XYZ, TP.HCM",
        },
        {
          id: 3,
          name: "Trung tâm dịch vụ Đà Nẵng",
          address: "789 Đường DEF, Đà Nẵng",
        },
      ]);

      setTechnicians([
        {
          id: 1,
          name: "Nguyễn Văn A",
          email: "tech1@example.com",
          serviceCenterId: 1,
        },
        {
          id: 2,
          name: "Trần Thị B",
          email: "tech2@example.com",
          serviceCenterId: 1,
        },
        {
          id: 3,
          name: "Lê Văn C",
          email: "tech3@example.com",
          serviceCenterId: 2,
        },
        {
          id: 4,
          name: "Phạm Thị D",
          email: "tech4@example.com",
          serviceCenterId: 3,
        },
      ]);

      // SC_TECHNICIAN doesn't have access to parts API, use mock data directly
      console.log("SC_TECHNICIAN role detected, using mock parts data");
      setParts([
        {
          partId: "BAT-001",
          partName: "Battery Pack",
          partNumber: "BAT-001",
          price: 1000000,
        },
        {
          partId: "MOT-002",
          partName: "Electric Motor",
          partNumber: "MOT-002",
          price: 2500000,
        },
        {
          partId: "CHG-003",
          partName: "Charging Port",
          partNumber: "CHG-003",
          price: 500000,
        },
        {
          partId: "CTR-004",
          partName: "Controller Unit",
          partNumber: "CTR-004",
          price: 800000,
        },
        {
          partId: "BRK-005",
          partName: "Brake System",
          partNumber: "BRK-005",
          price: 1200000,
        },
      ]);
    } catch (e) {
      console.error("Failed to fetch lookup data:", e);
    }
  };

  const handleAcceptClaim = async (claimId) => {
    try {
      setLoading(true);
      // SC_TECHNICIAN doesn't have API access, just update local state
      console.log("Accepting claim (mock):", claimId);
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId ? { ...c, status: "IN_PROGRESS" } : c
        )
      );
      alert("Đã nhận yêu cầu bảo hành! (Mock update)");
    } catch (e) {
      console.error("Failed to accept claim:", e);
      alert("Không thể nhận yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateServiceHistory = (claim) => {
    setSelectedClaim(claim);
    setServiceHistoryForm({
      serviceDate: new Date().toISOString().slice(0, 16),
      serviceType: "REPAIR",
      description: claim.description || "",
      partId: claim.partId || "",
      vehicleId: claim.vehicleId || "",
      serviceCenterId: currentUser?.serviceCenterId || "",
      technicianId: currentUser?.userId || "",
      partsUsed: [],
    });
    setShowServiceHistoryModal(true);
  };

  const handleServiceHistorySubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        serviceDate: new Date(serviceHistoryForm.serviceDate).toISOString(),
        serviceType: serviceHistoryForm.serviceType,
        description: serviceHistoryForm.description,
        partId: serviceHistoryForm.partId,
        vehicleId: serviceHistoryForm.vehicleId,
      };

      // SC_TECHNICIAN doesn't have API access, just update local state
      console.log("Creating service history (mock):", payload);

      const newServiceHistory = {
        id: Date.now(), // Generate unique ID
        serviceDate: payload.serviceDate,
        serviceType: payload.serviceType,
        description: payload.description,
        customerName: selectedClaim?.customerName || "Unknown Customer",
        vehicleVin: selectedClaim?.vehicleVin || "Unknown VIN",
        partName: selectedClaim?.partName || "Unknown Part",
      };

      // Add to service histories
      setServiceHistories((prev) => [newServiceHistory, ...prev]);

      // Update claim status to COMPLETED after creating service history
      if (selectedClaim) {
        setClaims((prev) =>
          prev.map((c) =>
            c.id === selectedClaim.id ? { ...c, status: "COMPLETED" } : c
          )
        );
      }

      setShowServiceHistoryModal(false);
      setSelectedClaim(null);
      alert("Tạo lịch sử bảo dưỡng thành công! (Mock update)");
    } catch (e) {
      console.error("Failed to create service history:", e);
      alert("Không thể tạo lịch sử bảo dưỡng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.code?.toLowerCase().includes(s) ||
      c.customerName?.toLowerCase().includes(s) ||
      c.vehicleVin?.toLowerCase().includes(s) ||
      c.partName?.toLowerCase().includes(s)
    );
  });

  const filteredHistories = serviceHistories.filter((h) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      h.vehicleVin?.toLowerCase().includes(s) ||
      h.customerName?.toLowerCase().includes(s) ||
      h.partName?.toLowerCase().includes(s) ||
      h.serviceType?.toLowerCase().includes(s)
    );
  });

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <div className="loading">
          <div className="loading-spinner" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  // Debug info
  console.log(
    "SCTechnician render - claims:",
    claims.length,
    "histories:",
    serviceHistories.length
  );

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-back" onClick={() => navigate("/")}>
            Quay lại
          </button>
          <h2 style={{ margin: 0 }}>SC Technician - Thực hiện dịch vụ</h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 200,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 6,
            }}
          />
          <button className="btn btn-secondary" onClick={fetchData}>
            Làm mới
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{ display: "flex", gap: 0, borderBottom: "2px solid #e0e0e0" }}
        >
          <button
            className={`tab-button ${activeTab === "claims" ? "active" : ""}`}
            onClick={() => setActiveTab("claims")}
          >
            Yêu cầu bảo hành ({claims.length})
          </button>
          <button
            className={`tab-button ${
              activeTab === "histories" ? "active" : ""
            }`}
            onClick={() => setActiveTab("histories")}
          >
            Lịch sử dịch vụ ({serviceHistories.length})
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fff3cd",
            color: "#856404",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === "claims" && (
        <div
          className="table-responsive"
          style={{
            background: "white",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {filteredClaims.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <h3 style={{ color: "#666", marginBottom: 16 }}>
                Không có yêu cầu bảo hành
              </h3>
              <p style={{ color: "#999" }}>
                Hiện tại không có yêu cầu bảo hành nào cần xử lý.
              </p>
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
              }}
            >
              <thead>
                <tr>
                  <th style={th}>Mã</th>
                  <th style={th}>Khách hàng</th>
                  <th style={th}>VIN</th>
                  <th style={th}>Phụ tùng</th>
                  <th style={th}>Trạng thái</th>
                  <th style={{ ...th, textAlign: "center", width: 200 }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((c, idx) => (
                  <tr key={c.id || c.code || idx}>
                    <td style={tdMono}>{c.code || c.claimCode}</td>
                    <td style={td}>{c.customerName || "-"}</td>
                    <td style={td}>{c.vehicleVin || "-"}</td>
                    <td style={td}>{c.partName || c.part || "-"}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: "12px",
                          fontWeight: 600,
                          background:
                            c.status === "APPROVED" ? "#d4edda" : "#fff3cd",
                          color:
                            c.status === "APPROVED" ? "#155724" : "#856404",
                        }}
                      >
                        {c.status === "APPROVED" ? "Đã duyệt" : "Đang xử lý"}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-info"
                          onClick={() => alert(JSON.stringify(c, null, 2))}
                          style={{ fontSize: "12px", padding: "6px 8px" }}
                        >
                          Xem
                        </button>
                        {c.status === "APPROVED" && (
                          <button
                            className="btn btn-warning"
                            onClick={() => handleAcceptClaim(c.id)}
                            style={{ fontSize: "12px", padding: "6px 8px" }}
                          >
                            Nhận việc
                          </button>
                        )}
                        <button
                          className="btn btn-primary"
                          onClick={() => handleCreateServiceHistory(c)}
                          disabled={c.status === "COMPLETED"}
                          style={{ fontSize: "12px", padding: "6px 8px" }}
                        >
                          Tạo lịch sử
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Service Histories Tab */}
      {activeTab === "histories" && (
        <div
          className="table-responsive"
          style={{
            background: "white",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr>
                <th style={th}>Ngày</th>
                <th style={th}>Loại</th>
                <th style={th}>Khách hàng</th>
                <th style={th}>VIN</th>
                <th style={th}>Phụ tùng</th>
                <th style={th}>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistories.map((h, idx) => (
                <tr key={h.id || h.serviceHistoryId || idx}>
                  <td style={td}>
                    {h.serviceDate
                      ? new Date(h.serviceDate).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#e3f2fd",
                        color: "#1565c0",
                      }}
                    >
                      {h.serviceType || "REPAIR"}
                    </span>
                  </td>
                  <td style={td}>{h.customerName || "-"}</td>
                  <td style={tdMono}>{h.vehicleVin || "-"}</td>
                  <td style={td}>{h.partName || "-"}</td>
                  <td style={td}>{h.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Service History Creation Modal */}
      {showServiceHistoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 8,
              width: "90%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>
              Tạo lịch sử bảo dưỡng
            </h3>

            {selectedClaim && (
              <div
                style={{
                  background: "#f8f9fa",
                  padding: 12,
                  borderRadius: 6,
                  marginBottom: 20,
                  fontSize: "14px",
                }}
              >
                <strong>Thông tin yêu cầu:</strong>
                <br />
                Mã: {selectedClaim.code || selectedClaim.claimCode}
                <br />
                Khách hàng: {selectedClaim.customerName}
                <br />
                VIN: {selectedClaim.vehicleVin}
                <br />
                Phụ tùng: {selectedClaim.partName}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Ngày thực hiện dịch vụ *
              </label>
              <input
                type="datetime-local"
                value={serviceHistoryForm.serviceDate}
                onChange={(e) =>
                  setServiceHistoryForm((prev) => ({
                    ...prev,
                    serviceDate: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Loại dịch vụ *
              </label>
              <select
                value={serviceHistoryForm.serviceType}
                onChange={(e) =>
                  setServiceHistoryForm((prev) => ({
                    ...prev,
                    serviceType: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              >
                <option value="REPAIR">Sửa chữa</option>
                <option value="REPLACEMENT">Thay thế</option>
                <option value="MAINTENANCE">Bảo dưỡng</option>
                <option value="INSPECTION">Kiểm tra</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Mô tả chi tiết *
              </label>
              <textarea
                value={serviceHistoryForm.description}
                onChange={(e) =>
                  setServiceHistoryForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
                placeholder="Mô tả chi tiết về dịch vụ thực hiện..."
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Phụ tùng sử dụng bổ sung
              </label>
              <div
                style={{
                  maxHeight: 150,
                  overflow: "auto",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  padding: 8,
                }}
              >
                {parts.map((part) => (
                  <label
                    key={part.partId || part.id}
                    style={{ display: "block", marginBottom: 8 }}
                  >
                    <input
                      type="checkbox"
                      checked={serviceHistoryForm.partsUsed.includes(
                        part.partId || part.id
                      )}
                      onChange={(e) => {
                        const partId = part.partId || part.id;
                        setServiceHistoryForm((prev) => ({
                          ...prev,
                          partsUsed: e.target.checked
                            ? [...prev.partsUsed, partId]
                            : prev.partsUsed.filter((id) => id !== partId),
                        }));
                      }}
                      style={{ marginRight: 8 }}
                    />
                    {part.partName || part.name} -{" "}
                    {part.partNumber || part.partId}(
                    {new Intl.NumberFormat("vi-VN").format(
                      part.price || part.unitPrice || 0
                    )}{" "}
                    VNĐ)
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowServiceHistoryModal(false);
                  setSelectedClaim(null);
                }}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleServiceHistorySubmit}
                disabled={
                  !serviceHistoryForm.serviceDate ||
                  !serviceHistoryForm.serviceType ||
                  !serviceHistoryForm.description
                }
              >
                Hoàn thành dịch vụ
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn { padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .btn-secondary { background:#6c757d; color:#fff; }
        .btn-info { background:#17a2b8; color:#fff; }
        .btn-warning { background:#ffc107; color:#212529; }
        .btn-success { background:#28a745; color:#fff; }
        .btn-danger { background:#dc3545; color:#fff; }
        .btn-back { background:#17a2b8; color:#fff; }
        .btn-primary { background:#007bff; color:#fff; }
        .tab-button { padding: 12px 24px; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; font-weight: 600; }
        .tab-button.active { border-bottom-color: #007bff; color: #007bff; }
        .tab-button:hover { background: #f8f9fa; }
        .loading-spinner { border:4px solid #f3f3f3; border-top:4px solid #007bff; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite; margin:0 auto 12px; }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const th = { background: "#f5f5f5", padding: "12px 15px", textAlign: "left" };
const td = { padding: "12px 15px", borderBottom: "1px solid #e0e0e0" };
const tdMono = { ...td, fontFamily: "monospace" };
