import React, { useEffect, useState } from "react";
import { feedbackApi } from "../../api/feedback";

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");

  // Local mock store
  const storageKey = "mock_feedback";
  const readMock = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    const seed = [
      {
        id: 1,
        customerName: "Nguyễn Văn A",
        email: "a@example.com",
        createdAt: new Date().toISOString(),
        message: "Dịch vụ rất tốt!",
        status: "NEW",
      },
      {
        id: 2,
        customerName: "Trần Thị B",
        email: "b@example.com",
        createdAt: new Date().toISOString(),
        message: "Cần hỗ trợ tra cứu claim.",
        status: "NEW",
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
      const data = await feedbackApi.list();
      setItems(data);
    } catch {
      setError("API Feedback chưa sẵn sàng, đang hiển thị dữ liệu tạm (mock).");
      setItems(readMock());
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    return (
      (i.customerName || "").toLowerCase().includes(s) ||
      (i.email || "").toLowerCase().includes(s) ||
      (i.message || "").toLowerCase().includes(s)
    );
  });

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    try {
      await feedbackApi.reply(selected.id, { reply });
    } catch {
      const current = readMock();
      const updated = current.map((f) =>
        f.id === selected.id
          ? {
              ...f,
              status: "REPLIED",
              lastReply: reply,
              repliedAt: new Date().toISOString(),
            }
          : f
      );
      writeMock(updated);
      setItems(updated);
    }
    setReply("");
    setSelected(null);
  };

  const updateStatus = async (id, status) => {
    try {
      await feedbackApi.updateStatus(id, status);
    } catch {
      const current = readMock();
      const updated = current.map((f) => (f.id === id ? { ...f, status } : f));
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
        <h2 style={{ margin: 0 }}>Quản lý Feedback</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
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
              <th style={th}>Khách hàng</th>
              <th style={th}>Email</th>
              <th style={th}>Nội dung</th>
              <th style={th}>Ngày</th>
              <th style={th}>Trạng thái</th>
              <th style={{ ...th, width: 220, textAlign: "center" }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id}>
                <td style={td}>{f.customerName}</td>
                <td style={td}>{f.email}</td>
                <td style={td}>{f.message}</td>
                <td style={tdMono}>
                  {new Date(f.createdAt || Date.now()).toLocaleString("vi-VN")}
                </td>
                <td style={td}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      background:
                        f.status === "REPLIED" ? "#d4edda" : "#fff3cd",
                      color: f.status === "REPLIED" ? "#155724" : "#856404",
                    }}
                  >
                    {f.status || "NEW"}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    className="btn btn-info"
                    onClick={() => setSelected(f)}
                    style={{ marginRight: 6 }}
                  >
                    Trả lời
                  </button>
                  {f.status !== "CLOSED" && (
                    <button
                      className="btn btn-danger"
                      onClick={() => updateStatus(f.id, "CLOSED")}
                    >
                      Đóng
                    </button>
                  )}
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
            <h3 style={{ marginTop: 0 }}>Trả lời Feedback</h3>
            <div
              style={{
                background: "#f8f9fa",
                padding: 12,
                borderRadius: 6,
                marginBottom: 12,
              }}
            >
              <div>
                <strong>Khách:</strong> {selected.customerName} (
                {selected.email})
              </div>
              <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                {selected.message}
              </div>
            </div>
            <textarea
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 6,
              }}
              placeholder="Nhập nội dung trả lời..."
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 12,
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setSelected(null)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={sendReply}
                disabled={!reply.trim()}
              >
                Gửi
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
