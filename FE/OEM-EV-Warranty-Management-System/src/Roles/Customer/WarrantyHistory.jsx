import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaClipboardList } from "react-icons/fa";

export default function WarrantyHistory() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWarrantyHistory();
  }, []);

  const fetchWarrantyHistory = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      console.log("Fetching warranty history from:", `${API_BASE_URL}/service-histories`);
      
      const response = await fetch(`${API_BASE_URL}/api/service-histories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Warranty history data received:", data);
        
        // Handle both array and object responses
        const historyArray = Array.isArray(data) ? data : (data.data || data.histories || []);
        setHistoryData(historyArray);
        setError("");
      } else {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        setError(`Không thể tải lịch sử bảo hành (${response.status})`);
      }
    } catch (err) {
      console.error("Warranty history fetch error:", err);
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có dữ liệu";
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getServiceTypeDisplay = (serviceType) => {
    const types = {
      'maintenance': 'Bảo dưỡng',
      'warranty': 'Bảo hành',
      'repair': 'Sửa chữa',
      'inspection': 'Kiểm tra',
      'replacement': 'Thay thế'
    };
    return types[serviceType] || serviceType || "Không có dữ liệu";
  };

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
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
            <p>{error}</p>
            <button onClick={fetchWarrantyHistory} style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}>
              Thử lại
            </button>
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRow}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Ngày dịch vụ</th>
                  <th style={thStyle}>Loại dịch vụ</th>
                  <th style={thStyle}>Mô tả</th>
                  <th style={thStyle}>Phụ tùng</th>
                  <th style={thStyle}>Xe</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length > 0 ? (
                  historyData.map((history, index) => (
                    <tr key={history.serviceHistoryId || index} style={index % 2 === 0 ? evenRow : oddRow}>
                      <td style={tdStyle}>{history.serviceHistoryId || "Không có"}</td>
                      <td style={tdStyle}>{formatDate(history.serviceDate)}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: history.serviceType === 'warranty' ? "#d4edda" : 
                                    history.serviceType === 'maintenance' ? "#d1ecf1" : "#fff3cd",
                          color: history.serviceType === 'warranty' ? "#155724" :
                                history.serviceType === 'maintenance' ? "#0c5460" : "#856404"
                        }}>
                          {getServiceTypeDisplay(history.serviceType)}
                        </span>
                      </td>
                      <td style={tdStyle} title={history.description}>
                        {history.description && history.description.length > 50 
                          ? `${history.description.substring(0, 50)}...`
                          : history.description || "Không có mô tả"}
                      </td>
                      <td style={tdStyle}>
                        {history.partName || history.partId || "Không có"}
                      </td>
                      <td style={tdStyle}>
                        {history.vehicleName || history.vehicleVin || `ID: ${history.vehicleId}` || "Không có"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={emptyRow}>
                      Chưa có lịch sử dịch vụ bảo hành
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

const tdStyle = {
  padding: "12px 15px",
  borderBottom: "1px solid #eee",
  verticalAlign: "middle",
};

const evenRow = {
  backgroundColor: "#f9f9f9",
};

const oddRow = {
  backgroundColor: "#ffffff",
};

const emptyRow = {
  textAlign: "center",
  padding: "25px",
  color: "#888",
  fontSize: "15px",
};
