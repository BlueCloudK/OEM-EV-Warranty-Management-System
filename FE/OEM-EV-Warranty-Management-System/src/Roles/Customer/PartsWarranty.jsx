import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function PartsWarranty() {
  const navigate = useNavigate();
  const [partsData, setPartsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPartsWarranty();
  }, []);

  const fetchPartsWarranty = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      console.log("Fetching parts from:", `${API_BASE_URL}/parts`);
      
      const response = await fetch(`${API_BASE_URL}/api/parts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Parts data received:", data);
        
        // Handle both array and object responses
        const partsArray = Array.isArray(data) ? data : (data.data || data.parts || []);
        setPartsData(partsArray);
        setError("");
      } else {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        setError(`Không thể tải dữ liệu bảo hành phụ tùng (${response.status})`);
      }
    } catch (err) {
      console.error("Parts warranty fetch error:", err);
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getWarrantyStatus = (expirationDate) => {
    if (!expirationDate) return "Không xác định";
    
    const expiry = new Date(expirationDate);
    const now = new Date();
    
    if (expiry > now) {
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      return daysLeft > 30 ? "Còn hiệu lực" : `Còn ${daysLeft} ngày`;
    } else {
      return "Hết hạn";
    }
  };

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
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
            <p>{error}</p>
            <button onClick={fetchPartsWarranty} style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}>
              Thử lại
            </button>
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRow}>
                  <th style={thStyle}>Mã phụ tùng</th>
                  <th style={thStyle}>Tên phụ tùng</th>
                  <th style={thStyle}>Số hiệu</th>
                  <th style={thStyle}>Nhà sản xuất</th>
                  <th style={thStyle}>Giá</th>
                  <th style={thStyle}>Ngày lắp đặt</th>
                  <th style={thStyle}>Hạn bảo hành</th>
                  <th style={thStyle}>Xe</th>
                  <th style={thStyle}>Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {partsData.length > 0 ? (
                  partsData.map((part, index) => (
                    <tr key={part.partId || index} style={index % 2 === 0 ? evenRow : oddRow}>
                      <td style={tdStyle}>{part.partId || "N/A"}</td>
                      <td style={tdStyle}>{part.partName || "N/A"}</td>
                      <td style={tdStyle}>{part.partNumber || "N/A"}</td>
                      <td style={tdStyle}>{part.manufacturer || "N/A"}</td>
                      <td style={tdStyle}>{part.price ? `${part.price.toLocaleString()} VND` : "N/A"}</td>
                      <td style={tdStyle}>{formatDate(part.installationDate)}</td>
                      <td style={tdStyle}>{formatDate(part.warrantyExpirationDate)}</td>
                      <td style={tdStyle}>
                        {part.vehicleName || part.vehicleVin || `ID: ${part.vehicleId}`}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: getWarrantyStatus(part.warrantyExpirationDate) === "Hết hạn" ? "#fee" : 
                                    getWarrantyStatus(part.warrantyExpirationDate).includes("ngày") ? "#fff3cd" : "#d4edda",
                          color: getWarrantyStatus(part.warrantyExpirationDate) === "Hết hạn" ? "#dc3545" :
                                getWarrantyStatus(part.warrantyExpirationDate).includes("ngày") ? "#856404" : "#155724"
                        }}>
                          {getWarrantyStatus(part.warrantyExpirationDate)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={emptyRow}>
                      Chưa có dữ liệu phụ tùng bảo hành
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
  overflowX: "auto",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};
const theadRow = {
  background: "#f8f9fa",
};
const thStyle = {
  padding: "12px 8px",
  textAlign: "left",
  fontWeight: "600",
  color: "#495057",
  borderBottom: "2px solid #dee2e6",
  whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #dee2e6",
  fontSize: "13px",
};
const evenRow = {
  background: "#f8f9fa",
};
const oddRow = {
  background: "#fff",
};
const emptyRow = {
  padding: "40px",
  textAlign: "center",
  color: "#6c757d",
  fontStyle: "italic",
};
