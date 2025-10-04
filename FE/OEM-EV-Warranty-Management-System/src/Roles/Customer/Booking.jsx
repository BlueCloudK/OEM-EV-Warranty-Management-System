import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function Booking() {
  const navigate = useNavigate();

  
  const images = [
    "https://voltronicvietnam.com/wp-content/uploads/2023/08/bao-duong-xe-o-to-c.jpg",
    "https://www.ethozgroup.com/wp-content/uploads/2023/03/merc-7-scaled-1-1024x660.jpg",
    "https://www.trl-chiba.co.jp/images/guide/safety-efforts03.jpg",
  ];

  const [selectedImage, setSelectedImage] = useState(images[0]);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    vin: "",
    date: "",
    time: "",
    serviceType: "maintenance",
    note: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: gọi API backend (ví dụ fetch/axios)
    alert("Đặt lịch (demo): " + JSON.stringify(formData, null, 2));
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Left: form */}
        <div style={leftStyle}>
          <button onClick={() => navigate(-1)} style={backBtn}>
            <FaArrowLeft /> Quay về
          </button>

          <h2 style={{ color: "#044835", marginTop: 10 }}>Đặt lịch bảo dưỡng / bảo hành</h2>
          <p style={{ color: "#666" }}></p>

          <form onSubmit={handleSubmit} style={formStyle}>
            <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ và tên" style={inputStyle} required />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" style={inputStyle} required />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" style={inputStyle} />
            <input name="vin" value={formData.vin} onChange={handleChange} placeholder="VIN (số khung)" style={inputStyle} />
            <div style={{ display: "flex", gap: 10 }}>
              <input name="date" value={formData.date} onChange={handleChange} type="date" style={{ ...inputStyle, flex: 1 }} required />
              <input name="time" value={formData.time} onChange={handleChange} type="time" style={{ ...inputStyle, flex: 1 }} required />
            </div>

            <select name="serviceType" value={formData.serviceType} onChange={handleChange} style={inputStyle}>
              <option value="maintenance">Bảo dưỡng định kỳ</option>
              <option value="warranty">Bảo hành</option>
              <option value="repair">Sửa chữa</option>
            </select>

            <textarea name="note" value={formData.note} onChange={handleChange} rows={4} placeholder="Ghi chú thêm..." style={{ ...inputStyle, resize: "vertical" }} />

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" style={btnPrimary}>Xác nhận đặt lịch</button>
              <button type="button" onClick={() => { setFormData({ fullName: "", phone: "", email: "", vin: "", date: "", time: "", serviceType: "maintenance", note: "" }); }} style={btnOutline}>Xóa</button>
            </div>
          </form>
        </div>

        {/* Right: ảnh */}
        <div style={rightStyle}>
          <div style={heroContainer}>
            <img src={selectedImage} alt="EV" style={heroImage} />
            <div style={heroOverlay}>
              <div>
                <h3 style={{ margin: 0 }}>Dịch vụ bảo hành</h3>
                <p style={{ margin: 0 }}>An toàn — Nhanh chóng — Chính xác</p>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div style={thumbRow}>
            {images.map((src) => (
              <img
                key={src}
                src={src}
                alt="thumb"
                style={{ ...thumbStyle, border: src === selectedImage ? "3px solid #044835" : "2px solid #eee", opacity: src === selectedImage ? 1 : 0.85 }}
                onClick={() => setSelectedImage(src)}
              />
            ))}
          </div>

          
        </div>
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg,#f0f7f4 0%, #eef7fb 100%)",
  padding: 24,
  boxSizing: "border-box",
};

const cardStyle = {
  display: "flex",
  width: "100%",
  maxWidth: 1100,
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(2,12,8,0.12)",
  background: "#fff",
};

const leftStyle = { flex: 1.1, padding: 28, background: "#fff" };
const rightStyle = { flex: 1, position: "relative", background: "#f6f9fa", padding: 20, display: "flex", flexDirection: "column" };

const heroContainer = { position: "relative", height: 360, borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 25px rgba(2,12,8,0.06)" };
const heroImage = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const heroOverlay = { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,72,53,0.0), rgba(4,72,53,0.35))", color: "#fff", display: "flex", alignItems: "flex-end", padding: 18, boxSizing: "border-box" };

const thumbRow = { display: "flex", gap: 10, marginTop: 12 };
const thumbStyle = { width: 90, height: 64, objectFit: "cover", borderRadius: 8, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" };

const formStyle = { marginTop: 12, display: "flex", flexDirection: "column", gap: 12 };
const inputStyle = { padding: "10px 12px", borderRadius: 8, border: "1px solid #d7dfe0", fontSize: 14, outline: "none" };

const btnPrimary = { padding: "12px 16px", borderRadius: 8, border: "none", background: "#044835", color: "#fff", fontWeight: 600, cursor: "pointer" };
const btnOutline = { padding: "12px 16px", borderRadius: 8, border: "1px solid #ccd6d6", background: "#fff", color: "#333", cursor: "pointer" };

const backBtn = { background: "transparent", border: "none", color: "#044835", cursor: "pointer", fontWeight: 600, padding: 0, display: "inline-flex", alignItems: "center", gap: 8 };
