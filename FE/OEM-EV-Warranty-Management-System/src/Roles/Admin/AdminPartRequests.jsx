import React, { useEffect, useState } from "react";
import { partRequestsApi } from "../../api/partRequests";

export default function AdminPartRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const storageKey = "mock_part_requests";
  const readMock = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    const seed = [
      {
        id: 1,
        claimId: 101,
        partId: "BAT-001",
        partName: "Battery Pack",
        quantity: 1,
        status: "PENDING",
        requestedAt: new Date().toISOString(),
      },
      {
        id: 2,
        claimId: 102,
        partId: "MOT-002",
        partName: "Electric Motor",
        quantity: 2,
        status: "APPROVED",
        requestedAt: new Date().toISOString(),
      },
    ];
    try {
      localStorage.setItem(storageKey, JSON.stringify(seed));
    } catch {}
    return seed;
  };
  const writeMock = (list) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await partRequestsApi.list();
      setItems(data);
    } catch {
      setError("API Part Requests chưa sẵn sàng, hiển thị dữ liệu tạm (mock).");
      setItems(readMock());
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    return (
      String(i.claimId || "").includes(s) ||
      (i.partId || "").toLowerCase().includes(s) ||
      (i.partName || "").toLowerCase().includes(s) ||
      (i.status || "").toLowerCase().includes(s)
    );
  });

  const updateStatus = async (id, status) => {
    try {
      await partRequestsApi.updateStatus(id, status);
    } catch {
      const current = readMock();
      const updated = current.map((r) => (r.id === id ? { ...r, status } : r));
      writeMock(updated);
      setItems(updated);
    }
  };

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
        <h2 style={{ margin: 0 }}>Yêu cầu phụ tùng</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo Claim/Part/Trạng thái..."
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
          <button className="btn btn-secondary" onClick={fetchData}>
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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Claim</th>
              <th style={th}>Part</th>
              <th style={th}>Số lượng</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Ngày yêu cầu</th>
              <th style={{ ...th, width: 240, textAlign: "center" }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={td}>#{r.claimId}</td>
                <td style={td}>{r.partName || r.partId}</td>
                <td style={td}>{r.quantity}</td>
                <td style={td}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      background:
                        r.status === "APPROVED"
                          ? "#d4edda"
                          : r.status === "REJECTED"
                          ? "#f8d7da"
                          : "#fff3cd",
                      color:
                        r.status === "APPROVED"
                          ? "#155724"
                          : r.status === "REJECTED"
                          ? "#721c24"
                          : "#856404",
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td style={tdMono}>
                  {new Date(r.requestedAt || Date.now()).toLocaleString(
                    "vi-VN"
                  )}
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
                      onClick={() => setSelected(r)}
                    >
                      Xem
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => updateStatus(r.id, "APPROVED")}
                      disabled={r.status === "APPROVED"}
                    >
                      Duyệt
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => updateStatus(r.id, "REJECTED")}
                      disabled={r.status === "REJECTED"}
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

      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
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
              padding: 20,
              borderRadius: 8,
              width: "90%",
              maxWidth: 560,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Chi tiết yêu cầu</h3>
            <div
              style={{
                background: "#f8f9fa",
                padding: 12,
                borderRadius: 6,
                marginBottom: 12,
              }}
            >
              <div>
                <strong>Claim:</strong> #{selected.claimId}
              </div>
              <div>
                <strong>Part:</strong> {selected.partName || selected.partId}
              </div>
              <div>
                <strong>Số lượng:</strong> {selected.quantity}
              </div>
              <div>
                <strong>Trạng thái:</strong> {selected.status}
              </div>
              <div>
                <strong>Ngày yêu cầu:</strong>{" "}
                {new Date(selected.requestedAt || Date.now()).toLocaleString(
                  "vi-VN"
                )}
              </div>
            </div>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setSelected(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { background: "#f5f5f5", padding: "12px 15px", textAlign: "left" };
const td = { padding: "12px 15px", borderBottom: "1px solid #e0e0e0" };
const tdMono = { ...td, fontFamily: "monospace" };
