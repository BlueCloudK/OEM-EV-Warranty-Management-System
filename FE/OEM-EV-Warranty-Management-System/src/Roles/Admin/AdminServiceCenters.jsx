import React, { useEffect, useState } from "react";
import { serviceCentersApi } from "../../api/serviceCenters";

export default function AdminServiceCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    opening_hours: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const storageKey = "mock_service_centers";
  const readMock = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    // seed a few examples on first use
    const seed = [
      {
        id: 1,
        name: "Trung tâm dịch vụ Hà Nội",
        address: "123 Đường ABC, Hà Nội",
        phone: "024-123456",
        opening_hours: "08:00 - 17:00",
        latitude: 21.0278,
        longitude: 105.8342,
      },
      {
        id: 2,
        name: "Trung tâm dịch vụ TP.HCM",
        address: "456 Đường XYZ, TP.HCM",
        phone: "028-654321",
        opening_hours: "08:00 - 17:00",
        latitude: 10.8231,
        longitude: 106.6297,
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await serviceCentersApi.list();
      setCenters(data);
    } catch (e) {
      setError(
        "API Trung tâm dịch vụ chưa sẵn sàng, đang hiển thị dữ liệu tạm (mock)."
      );
      setCenters(readMock());
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      address: "",
      phone: "",
      opening_hours: "",
      latitude: "",
      longitude: "",
    });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || c.serviceCenterName || "",
      address: c.address || "",
      phone: c.phone || "",
      opening_hours: c.opening_hours || c.openingHours || "",
      latitude: c.latitude || "",
      longitude: c.longitude || "",
    });
    setShowModal(true);
  };

  const submit = async () => {
    try {
      setLoading(true);
      const payload = {
        ...form,
        latitude: Number(form.latitude || 0),
        longitude: Number(form.longitude || 0),
      };
      if (editing?.service_center_id || editing?.id) {
        const id = editing.service_center_id || editing.id;
        try {
          await serviceCentersApi.update(id, payload);
        } catch {
          // mock update
          const current = readMock();
          const updated = current.map((c) =>
            c.id === id ? { ...c, ...payload } : c
          );
          writeMock(updated);
        }
      } else {
        try {
          await serviceCentersApi.create(payload);
        } catch {
          // mock create
          const current = readMock();
          const nextId =
            Math.max(0, ...current.map((c) => Number(c.id) || 0)) + 1;
          const created = { id: nextId, ...payload };
          writeMock([created, ...current]);
        }
      }
      setShowModal(false);
      await fetchData();
    } catch (e) {
      alert("Không thể lưu trung tâm dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (c) => {
    if (!confirm("Xóa trung tâm dịch vụ này?")) return;
    try {
      setLoading(true);
      const id = c.service_center_id || c.id;
      try {
        await serviceCentersApi.remove(id);
      } catch {
        // mock delete
        const current = readMock();
        writeMock(current.filter((x) => x.id !== id));
      }
      await fetchData();
    } catch (e) {
      alert("Không thể xóa");
    } finally {
      setLoading(false);
    }
  };

  const filtered = centers.filter((c) => {
    const s = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(s) ||
      (c.address || "").toLowerCase().includes(s) ||
      (c.phone || "").toLowerCase().includes(s)
    );
  });

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
        <h2 style={{ margin: 0 }}>Quản lý Trung tâm dịch vụ</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
          <button className="btn btn-primary" onClick={openCreate}>
            Thêm
          </button>
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
              <th style={th}>Tên</th>
              <th style={th}>Địa chỉ</th>
              <th style={th}>SĐT</th>
              <th style={th}>Giờ mở cửa</th>
              <th style={th}>Tọa độ</th>
              <th style={{ ...th, width: 160, textAlign: "center" }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, idx) => (
              <tr key={c.service_center_id || c.id || idx}>
                <td style={td}>{c.name}</td>
                <td style={td}>{c.address}</td>
                <td style={td}>{c.phone}</td>
                <td style={td}>{c.opening_hours || c.openingHours}</td>
                <td style={tdMono}>
                  {(c.latitude ?? "-") + ", " + (c.longitude ?? "-")}
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    className="btn btn-info"
                    onClick={() => openEdit(c)}
                    style={{ marginRight: 6 }}
                  >
                    Sửa
                  </button>
                  <button className="btn btn-danger" onClick={() => remove(c)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
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
            <h3 style={{ marginTop: 0 }}>
              {editing ? "Sửa trung tâm" : "Thêm trung tâm"}
            </h3>
            {[
              { key: "name", label: "Tên trung tâm" },
              { key: "address", label: "Địa chỉ" },
              { key: "phone", label: "Số điện thoại" },
              { key: "opening_hours", label: "Giờ mở cửa" },
              { key: "latitude", label: "Vĩ độ" },
              { key: "longitude", label: "Kinh độ" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label
                  style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
                >
                  {f.label}
                </label>
                <input
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 6,
                  }}
                />
              </div>
            ))}
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button className="btn btn-primary" onClick={submit}>
                Lưu
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
