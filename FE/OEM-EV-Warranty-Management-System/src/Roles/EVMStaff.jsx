import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { warrantyClaimsApi } from "../api/warrantyClaims";

export default function EVMStaff() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClaims();
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
      setClaims(filtered);
    } catch (e) {
      console.error("EVM fetch claims failed:", e);
      setError("Không tải được danh sách yêu cầu bảo hành.");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setLoading(true);
      const updated = await warrantyClaimsApi.updateStatus(id, newStatus);
      setClaims((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      console.error("EVM update status failed:", e);
      alert("Không cập nhật được trạng thái. Vui lòng thử lại.");
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
                <td style={td}>{c.status}</td>
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
                      disabled={c.status !== "PENDING"}
                    >
                      Đang xử lý
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusUpdate(c.id, "APPROVED")}
                      disabled={
                        !(c.status === "PENDING" || c.status === "IN_PROGRESS")
                      }
                    >
                      Duyệt
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleStatusUpdate(c.id, "REJECTED")}
                      disabled={c.status === "REJECTED"}
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

      <style>{`
        .btn { padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .btn-secondary { background:#6c757d; color:#fff; }
        .btn-info { background:#17a2b8; color:#fff; }
        .btn-warning { background:#ffc107; color:#212529; }
        .btn-success { background:#28a745; color:#fff; }
        .btn-danger { background:#dc3545; color:#fff; }
        .btn-back { background:#17a2b8; color:#fff; }
        .loading-spinner { border:4px solid #f3f3f3; border-top:4px solid #007bff; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite; margin:0 auto 12px; }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const th = { background: "#f5f5f5", padding: "12px 15px", textAlign: "left" };
const td = { padding: "12px 15px", borderBottom: "1px solid #e0e0e0" };
const tdMono = { ...td, fontFamily: "monospace" };
