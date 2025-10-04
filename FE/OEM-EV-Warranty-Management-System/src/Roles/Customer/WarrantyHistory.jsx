import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaClipboardList } from "react-icons/fa";

export default function WarrantyHistory() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e6f3ff 0%, #ecfdf5 100%)",
        padding: "40px",
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
        {/* 🔙 Nút quay về */}
        <button
          onClick={() => navigate(-1)}
          style={backBtnStyle}
          onMouseOver={(e) => (e.currentTarget.style.background = "#06694e")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#044835")}
        >
          <FaArrowLeft /> Quay về
        </button>

        {/* 🔧 Tiêu đề + mô tả */}
        <div style={headerStyle}>
          <div style={iconBox}>
            <FaClipboardList size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: "#044835", marginBottom: "6px" }}>
              Lịch sử bảo hành
            </h2>
            <p style={{ color: "#555", fontSize: "15px" }}>
              Danh sách các yêu cầu bảo hành đã xử lý.
            </p>
          </div>
        </div>

        {/* 🧾 Bảng lịch sử */}
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRow}>
                <th style={thStyle}>Mã yêu cầu</th>
                <th style={thStyle}>Tên phụ tùng</th>
                <th style={thStyle}>Ngày bảo hành</th>
                <th style={thStyle}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" style={emptyRow}>
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

// 🎨 Styles
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
  marginBottom: "25px",
  fontWeight: "500",
  boxShadow: "0 3px 10px rgba(4,72,53,0.2)",
  transition: "0.3s",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "25px",
};

const iconBox = {
  background: "#044835",
  padding: "10px",
  borderRadius: "12px",
  boxShadow: "0 3px 10px rgba(4,72,53,0.2)",
};

const tableWrapper = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadRow = {
  background: "#f7fafc",
  textAlign: "left",
};

const thStyle = {
  padding: "12px 15px",
  fontWeight: "600",
  color: "#333",
  borderBottom: "2px solid #ddd",
};

const emptyRow = {
  textAlign: "center",
  padding: "25px",
  color: "#888",
  fontSize: "15px",
};
