import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { warrantyClaimsApi } from "../api/warrantyClaims";
import { serviceHistoriesApi } from "../api/serviceHistories";
import { http } from "../api/httpClient";
import { getServiceCenters, getTechnicians, getParts } from "../api/mockLookup";

export default function EVMStaff() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showServiceHistoryModal, setShowServiceHistoryModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [showPartRequestModal, setShowPartRequestModal] = useState(false);
  const [claimIdToWorkLogs, setClaimIdToWorkLogs] = useState({});
  const [claimIdToPartRequests, setClaimIdToPartRequests] = useState({});
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
  const [workLogForm, setWorkLogForm] = useState({
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
    notes: "",
  });
  const [partRequestForm, setPartRequestForm] = useState({
    partId: "",
    quantity: 1,
    note: "",
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
      const [centers, techs, partsList] = await Promise.all([
        getServiceCenters(),
        getTechnicians(),
        getParts(),
      ]);
      setServiceCenters(centers);
      setTechnicians(techs);
      setParts(partsList);
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

  const openWorkLogModal = (claim) => {
    setSelectedClaim(claim);
    setWorkLogForm({
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date().toISOString().slice(0, 16),
      notes: claim.description || "",
    });
    setShowWorkLogModal(true);
  };

  const submitWorkLog = () => {
    if (!selectedClaim) return;
    const newLog = {
      id: Date.now(),
      claimId: selectedClaim.id,
      startTime: new Date(workLogForm.startTime).toISOString(),
      endTime: new Date(workLogForm.endTime).toISOString(),
      notes: workLogForm.notes,
    };
    setClaimIdToWorkLogs((prev) => ({
      ...prev,
      [selectedClaim.id]: [newLog, ...(prev[selectedClaim.id] || [])],
    }));
    setShowWorkLogModal(false);
    alert("Đã ghi nhận Work Log (mock)");
  };

  const openPartRequestModal = (claim) => {
    setSelectedClaim(claim);
    setPartRequestForm({ partId: claim.partId || "", quantity: 1, note: "" });
    setShowPartRequestModal(true);
  };

  const submitPartRequest = () => {
    if (!selectedClaim || !partRequestForm.partId) return;
    const req = {
      id: Date.now(),
      claimId: selectedClaim.id,
      partId: partRequestForm.partId,
      quantity: Number(partRequestForm.quantity || 1),
      note: partRequestForm.note,
      requestedAt: new Date().toISOString(),
    };
    setClaimIdToPartRequests((prev) => ({
      ...prev,
      [selectedClaim.id]: [req, ...(prev[selectedClaim.id] || [])],
    }));
    setShowPartRequestModal(false);
    alert("Đã gửi yêu cầu phụ tùng (mock)");
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
                      onClick={() => {
                        setSelectedClaim(c);
                        setShowDetailModal(true);
                      }}
                    >
                      Xem
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openWorkLogModal(c)}
                    >
                      Ghi Work Log
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openPartRequestModal(c)}
                    >
                      Yêu cầu phụ tùng
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

      {/* Claim Detail Modal */}
      {showDetailModal && selectedClaim && (
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
              width: "95%",
              maxWidth: 800,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Chi tiết yêu cầu bảo hành</h3>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Info
                label="Mã"
                value={selectedClaim.code || selectedClaim.claimCode || "-"}
              />
              <Info label="Trạng thái" value={selectedClaim.status || "-"} />
              <Info
                label="Khách hàng"
                value={selectedClaim.customerName || "-"}
              />
              <Info label="VIN" value={selectedClaim.vehicleVin || "-"} mono />
              <Info label="Phụ tùng" value={selectedClaim.partName || "-"} />
              <Info
                label="Mô tả"
                value={
                  selectedClaim.description ||
                  selectedClaim.issueDescription ||
                  "-"
                }
                full
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{ background: "#f8f9fa", padding: 12, borderRadius: 6 }}
              >
                <h4 style={{ marginTop: 0 }}>Work Logs</h4>
                {(claimIdToWorkLogs[selectedClaim.id] || []).length === 0 ? (
                  <p style={{ color: "#777" }}>Chưa có work log</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {(claimIdToWorkLogs[selectedClaim.id] || []).map((w) => (
                      <li key={w.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 12 }}>
                          {new Date(w.startTime).toLocaleString("vi-VN")} →{" "}
                          {new Date(w.endTime).toLocaleString("vi-VN")}
                        </div>
                        <div>{w.notes}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div
                style={{ background: "#f8f9fa", padding: 12, borderRadius: 6 }}
              >
                <h4 style={{ marginTop: 0 }}>Yêu cầu phụ tùng</h4>
                {(claimIdToPartRequests[selectedClaim.id] || []).length ===
                0 ? (
                  <p style={{ color: "#777" }}>Chưa có yêu cầu</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {(claimIdToPartRequests[selectedClaim.id] || []).map(
                      (r) => (
                        <li key={r.id} style={{ marginBottom: 8 }}>
                          <div>
                            <strong>Part:</strong> {r.partId} —{" "}
                            <strong>SL:</strong> {r.quantity}
                          </div>
                          <div style={{ fontSize: 12, color: "#555" }}>
                            {new Date(r.requestedAt).toLocaleString("vi-VN")} |{" "}
                            {r.note || "-"}
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Log Modal */}
      {showWorkLogModal && (
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
              maxWidth: 520,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Ghi Work Log</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                Bắt đầu
              </label>
              <input
                type="datetime-local"
                value={workLogForm.startTime}
                onChange={(e) =>
                  setWorkLogForm((p) => ({ ...p, startTime: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                Kết thúc
              </label>
              <input
                type="datetime-local"
                value={workLogForm.endTime}
                onChange={(e) =>
                  setWorkLogForm((p) => ({ ...p, endTime: e.target.value }))
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
              <label style={{ display: "block", fontWeight: 600 }}>
                Ghi chú
              </label>
              <textarea
                rows={4}
                value={workLogForm.notes}
                onChange={(e) =>
                  setWorkLogForm((p) => ({ ...p, notes: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowWorkLogModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={submitWorkLog}
                disabled={!workLogForm.startTime || !workLogForm.endTime}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Part Request Modal */}
      {showPartRequestModal && (
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
              maxWidth: 520,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Yêu cầu phụ tùng</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                Phụ tùng
              </label>
              <select
                value={partRequestForm.partId}
                onChange={(e) =>
                  setPartRequestForm((p) => ({ ...p, partId: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              >
                <option value="">Chọn phụ tùng</option>
                {parts.map((p) => (
                  <option key={p.partId || p.id} value={p.partId || p.id}>
                    {(p.partName || p.name) +
                      " (" +
                      (p.partNumber || p.partId) +
                      ")"}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                Số lượng
              </label>
              <input
                type="number"
                min={1}
                value={partRequestForm.quantity}
                onChange={(e) =>
                  setPartRequestForm((p) => ({
                    ...p,
                    quantity: e.target.value,
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
              <label style={{ display: "block", fontWeight: 600 }}>
                Ghi chú
              </label>
              <textarea
                rows={3}
                value={partRequestForm.note}
                onChange={(e) =>
                  setPartRequestForm((p) => ({ ...p, note: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowPartRequestModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={submitPartRequest}
                disabled={!partRequestForm.partId || !partRequestForm.quantity}
              >
                Gửi yêu cầu
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

function Info({ label, value, full, mono }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          background: "white",
          border: "1px solid #eee",
          borderRadius: 6,
          padding: 8,
          fontFamily: mono ? "monospace" : undefined,
          whiteSpace: "pre-wrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}
