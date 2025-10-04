import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function PartsWarranty() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e6f3ff 0%, #ecfdf5 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
          background: "#fff",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        }}
      >
        {/* 🔙 Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          style={backBtnStyle}
          onMouseOver={(e) => (e.currentTarget.style.background = "#06694e")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#044835")}
        >
          <FaArrowLeft /> Quay lại
        </button>

        {/* 🧾 Tiêu đề */}
        <h2 style={{ color: "#044835", marginBottom: "25px" }}>
          Thời hạn bảo hành phụ tùng
        </h2>

        {/* 📋 Bảng dữ liệu */}
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRow}>
                <th style={thStyle}>Mã phụ tùng</th>
                <th style={thStyle}>Tên phụ tùng</th>
                <th style={thStyle}>Ngày lắp đặt</th>
                <th style={thStyle}>Hạn bảo hành</th>
                <th style={thStyle}>Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {/* Khi có dữ liệu backend, bạn chỉ cần map vào đây */}
              <tr>
                <td colSpan="5" style={emptyRow}>
                  Chưa có dữ liệu để hiển thị
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 🔹 Styles
const backBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "#044835",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "8px 14px",
  cursor: "pointer",
  marginBottom: "20px",
  fontWeight: "500",
  boxShadow: "0 3px 10px rgba(4,72,53,0.2)",
  transition: "0.3s",
};
const tableWrapper = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadRow = {
  background: "#f0f8f6",
  textAlign: "left",
  color: "#044835",
};
const thStyle = {
  padding: "14px 15px",
  fontWeight: "700",
  fontSize: "15px",
  borderBottom: "2px solid #d9e3e0",
};
const emptyRow = {
  textAlign: "center",
  padding: "25px",
  color: "#888",
  fontStyle: "italic",
  fontSize: "15px",
};
