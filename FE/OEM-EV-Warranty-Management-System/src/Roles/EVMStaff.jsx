import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { warrantyClaimsApi } from "../api/warrantyClaims";
import { serviceHistoriesApi } from "../api/serviceHistories";
import { http } from "../api/httpClient";

export default function EVMStaff() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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

  useEffect(() => {
    fetchClaims();
    fetchLookupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await warrantyClaimsApi.list({ page: 0, size: 50 });
      const list = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];
      const filtered = list.filter((c) =>
        filterStatus ? c.status === filterStatus : true
      );
      const enriched = await Promise.all(filtered.map((c) => enrichClaim(c)));
      setClaims(enriched);
    } catch (e) {
      console.error("EVM fetch claims failed:", e);
      setError("Không tải được danh sách yêu cầu bảo hành.");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const enrichClaim = async (claim) => {
    // If already has fields, keep them; otherwise fetch
    let customerName = claim.customerName;
    let vehicleVin = claim.vehicleVin;
    let partName = claim.partName || claim.part;

    try {
      // Vehicle enrichment
      if ((!vehicleVin || !customerName) && claim.vehicleId) {
        const { data: vehicle } = await http.get(
          `/api/vehicles/${claim.vehicleId}`
        );
        vehicleVin = vehicleVin || vehicle?.vehicleVin || vehicle?.vin;
        customerName =
          customerName || vehicle?.customerName || vehicle?.customer?.name;
      }
    } catch (e) {
      // ignore enrichment errors
    }

    try {
      // Part enrichment
      const partId = claim.partId || claim.part?.partId;
      if (!partName && partId) {
        const { data: part } = await http.get(`/api/parts/${partId}`);
        partName = part?.partName || part?.name;
      }
    } catch (e) {
      // ignore enrichment errors
    }

    return { ...claim, customerName, vehicleVin, partName };
  };

  const fetchLookupData = async () => {
    try {
      // Mock data for service centers and technicians
      // In real implementation, these would be API calls
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

      // Fetch parts data
      const API_BASE = "https://backend.bluecloudk.xyz";
      const partsResponse = await fetch(
        `${API_BASE}/api/parts?page=0&size=100`,
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("token") ||
              localStorage.getItem("accessToken")
            }`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      if (partsResponse.ok) {
        const partsData = await partsResponse.json();
        setParts(Array.isArray(partsData?.content) ? partsData.content : []);
      } else {
        console.warn("Parts API not available, using mock data");
        // Mock parts data for development
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
      }
    } catch (e) {
      console.error("Failed to fetch lookup data:", e);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setLoading(true);

      // Debug: Check token and role
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      console.log("Token:", token ? "Present" : "Missing");

      // Check current user role
      try {
        const response = await fetch("/api/auth/validate", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (response.ok) {
          const userData = await response.json();
          console.log("Current user role:", userData.roleName);
        }
      } catch (e) {
        console.error("Failed to validate user:", e);
      }

      console.log(`Updating claim ${id} to status: ${newStatus}`);

      // Try using specific EVM endpoints first
      let updated;
      if (newStatus === "APPROVED") {
        // Use EVM accept endpoint
        const response = await fetch(
          `https://backend.bluecloudk.xyz/api/warranty-claims/${id}/evm-accept`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify("Approved by EVM Staff"),
          }
        );

        if (response.ok) {
          updated = await response.json();
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else if (newStatus === "REJECTED") {
        // Use EVM reject endpoint
        const response = await fetch(
          `https://backend.bluecloudk.xyz/api/warranty-claims/${id}/evm-reject?reason=Rejected by EVM Staff`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (response.ok) {
          updated = await response.json();
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        // Fallback to generic status update
        updated = await warrantyClaimsApi.updateStatus(id, newStatus);
      }

      setClaims((prev) => prev.map((c) => (c.id === id ? updated : c)));
      alert(`Đã cập nhật trạng thái thành ${newStatus}!`);
    } catch (e) {
      console.error("EVM update status failed:", e);
      console.error("Error details:", e.message, e.status);

      let errorMessage = "Không cập nhật được trạng thái. Vui lòng thử lại.";
      if (e.status === 403) {
        errorMessage =
          "Không có quyền thực hiện thao tác này. Vui lòng kiểm tra lại quyền truy cập.";
      } else if (e.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      }

      alert(errorMessage);
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
      serviceCenterId: "",
      technicianId: "",
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

      await serviceHistoriesApi.create(payload);

      // Update claim status to IN_PROGRESS after creating service history
      if (selectedClaim) {
        await warrantyClaimsApi.updateStatus(selectedClaim.id, "IN_PROGRESS");
        setClaims((prev) =>
          prev.map((c) =>
            c.id === selectedClaim.id ? { ...c, status: "IN_PROGRESS" } : c
          )
        );
      }

      setShowServiceHistoryModal(false);
      setSelectedClaim(null);
      alert("Tạo lịch sử bảo dưỡng thành công!");
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
          <h2 style={{ margin: 0 }}>EVM Staff - Duyệt yêu cầu bảo hành</h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="SUBMITTED">Đã gửi</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>
          <input
            type="text"
            placeholder="Tìm theo mã, khách hàng, VIN, phụ tùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 320,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 6,
            }}
          />
          <button className="btn btn-secondary" onClick={fetchClaims}>
            Làm mới
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
              <th style={th}>Mã</th>
              <th style={th}>Khách hàng</th>
              <th style={th}>VIN</th>
              <th style={th}>Phụ tùng</th>
              <th style={th}>Trạng thái</th>
              <th style={{ ...th, textAlign: "center", width: 240 }}>
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
                        c.status === "SUBMITTED"
                          ? "#e3f2fd"
                          : c.status === "PENDING"
                          ? "#fff3cd"
                          : c.status === "APPROVED"
                          ? "#d4edda"
                          : c.status === "IN_PROGRESS"
                          ? "#cce5ff"
                          : c.status === "REJECTED"
                          ? "#f8d7da"
                          : c.status === "COMPLETED"
                          ? "#d1ecf1"
                          : "#f8f9fa",
                      color:
                        c.status === "SUBMITTED"
                          ? "#1565c0"
                          : c.status === "PENDING"
                          ? "#856404"
                          : c.status === "APPROVED"
                          ? "#155724"
                          : c.status === "IN_PROGRESS"
                          ? "#004085"
                          : c.status === "REJECTED"
                          ? "#721c24"
                          : c.status === "COMPLETED"
                          ? "#0c5460"
                          : "#495057",
                    }}
                  >
                    {c.status === "SUBMITTED"
                      ? "Đã gửi"
                      : c.status === "PENDING"
                      ? "Chờ xử lý"
                      : c.status === "APPROVED"
                      ? "Đã duyệt"
                      : c.status === "IN_PROGRESS"
                      ? "Đang xử lý"
                      : c.status === "REJECTED"
                      ? "Từ chối"
                      : c.status === "COMPLETED"
                      ? "Hoàn thành"
                      : c.status}
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
                    >
                      Xem
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleStatusUpdate(c.id, "IN_PROGRESS")}
                      disabled={
                        !(c.status === "SUBMITTED" || c.status === "PENDING")
                      }
                    >
                      Đang xử lý
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusUpdate(c.id, "APPROVED")}
                      disabled={
                        !(
                          c.status === "SUBMITTED" ||
                          c.status === "PENDING" ||
                          c.status === "IN_PROGRESS"
                        )
                      }
                    >
                      Duyệt
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCreateServiceHistory(c)}
                      disabled={c.status !== "APPROVED"}
                      style={{ fontSize: "12px", padding: "6px 8px" }}
                    >
                      Tạo lịch sử
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleStatusUpdate(c.id, "REJECTED")}
                      disabled={
                        c.status === "REJECTED" || c.status === "COMPLETED"
                      }
                    >
                      Từ chối
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              Tạo lịch sử bảo dưỡng từ yêu cầu bảo hành
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

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Trung tâm dịch vụ
              </label>
              <select
                value={serviceHistoryForm.serviceCenterId}
                onChange={(e) =>
                  setServiceHistoryForm((prev) => ({
                    ...prev,
                    serviceCenterId: e.target.value,
                    technicianId: "", // Reset technician when service center changes
                  }))
                }
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              >
                <option value="">Chọn trung tâm dịch vụ</option>
                {serviceCenters.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
              >
                Kỹ thuật viên
              </label>
              <select
                value={serviceHistoryForm.technicianId}
                onChange={(e) =>
                  setServiceHistoryForm((prev) => ({
                    ...prev,
                    technicianId: e.target.value,
                  }))
                }
                disabled={!serviceHistoryForm.serviceCenterId}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  opacity: serviceHistoryForm.serviceCenterId ? 1 : 0.6,
                }}
              >
                <option value="">Chọn kỹ thuật viên</option>
                {technicians
                  .filter(
                    (t) =>
                      t.serviceCenterId == serviceHistoryForm.serviceCenterId
                  )
                  .map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
              </select>
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
                Tạo lịch sử
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
        .loading-spinner { border:4px solid #f3f3f3; border-top:4px solid #007bff; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite; margin:0 auto 12px; }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const th = { background: "#f5f5f5", padding: "12px 15px", textAlign: "left" };
const td = { padding: "12px 15px", borderBottom: "1px solid #e0e0e0" };
const tdMono = { ...td, fontFamily: "monospace" };
