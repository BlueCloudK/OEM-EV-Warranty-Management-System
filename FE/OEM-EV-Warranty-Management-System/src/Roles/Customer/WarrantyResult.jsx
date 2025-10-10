import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function WarrantyResult() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get warranty ID from URL params
  const [warrantyData, setWarrantyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchWarrantyResult(id);
    } else {
      fetchLatestWarrantyResult();
    }
  }, [id]);

  const fetchWarrantyResult = async (warrantyId) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/api/warranty/result/${warrantyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWarrantyData(data);
      } else {
        setError("Không thể tải kết quả bảo hành");
      }
    } catch (err) {
      console.error("Warranty result fetch error:", err);
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestWarrantyResult = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/api/warranty/result/latest`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWarrantyData(data);
      } else {
        setError("Không thể tải kết quả bảo hành mới nhất");
      }
    } catch (err) {
      console.error("Latest warranty result fetch error:", err);
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ecfdf5 0%, #e6f3ff 100%)",
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
          style={{
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
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#06694e")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#044835")}
        >
          <FaArrowLeft /> Quay về
        </button>

        {/* 🚗 Tiêu đề + hình ảnh */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "25px",
            marginBottom: "30px",
          }}
        >
          <img
            src="https://nextshark.b-cdn.net/wp-content/uploads/2022/12/VINFAST.jpg?width=1536&auto_optimize=medium&aspect_ratio=3:2"
            alt="Vehicle"
            style={{
              width: "250px",
              borderRadius: "12px",
              objectFit: "cover",
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            }}
          />
          <div>
            <h2 style={{ color: "#044835", marginBottom: "10px" }}>
              Kết quả bảo hành
            </h2>
            <p style={{ color: "#555", fontSize: "15px" }}>
              Dưới đây là danh sách kết quả các yêu cầu của bạn.
            </p>
          </div>
        </div>

        {/* 🧾 Bảng kết quả (chưa có dữ liệu) */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
              <th style={thStyle}>Mã bảo hành</th>
              <th style={thStyle}>Tên phụ tùng</th>
              <th style={thStyle}>Ngày yêu cầu</th>
              <th style={thStyle}>Trạng thái</th>
              <th style={thStyle}>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "#888",
                  fontSize: "15px",
                }}
              >
                Chưa có dữ liệu để hiển thị
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px 15px",
  fontWeight: "600",
  color: "#333",
  borderBottom: "2px solid #ddd",
};
