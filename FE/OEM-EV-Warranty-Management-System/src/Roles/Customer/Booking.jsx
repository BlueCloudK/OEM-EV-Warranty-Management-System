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
    warrantyClaimId: 0,
    claimDate: new Date().toISOString(),
    description: "",
    requestDate: "",
    vehicleName: "",
    vehicleModel: "",
    vehicleYear: new Date().getFullYear(),
    vehicleVin: "",
    customerName: "",
    customerPhone: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.description.trim()) {
      alert("Vui lòng mô tả chi tiết vấn đề cần bảo hành!");
      return;
    }
    
    if (!formData.requestDate) {
      alert("Vui lòng chọn ngày yêu cầu bảo hành!");
      return;
    }
    
    if (!formData.vehicleName.trim() || !formData.vehicleModel.trim() || !formData.vehicleVin.trim()) {
      alert("Vui lòng điền đầy đủ thông tin xe!");
      return;
    }
    
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      alert("Vui lòng điền đầy đủ thông tin liên hệ!");
      return;
    }
    
    try {
      // Use environment variable for API URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const apiUrl = `${API_BASE_URL}/api/warranty-claims`;
      
      console.log("Sending booking request to:", apiUrl);
      console.log("Form data:", JSON.stringify(formData, null, 2));
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "ngrok-skip-browser-warning": "true",
          // Add authorization if user is logged in
          ...(localStorage.getItem('token') && {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("Booking created successfully:", result);
        alert("Đặt lịch bảo hành thành công!");
        
        // Reset form or navigate
        setFormData({
          warrantyClaimId: 0,
          claimDate: new Date().toISOString(),
          description: "",
          requestDate: "",
          vehicleName: "",
          vehicleModel: "",
          vehicleYear: new Date().getFullYear(),
          vehicleVin: "",
          customerName: "",
          customerPhone: "",
        });
      } else {
        const errorData = await response.text();
        console.error("Booking failed:", errorData);
        alert(`Lỗi đặt lịch: ${errorData}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert(`Lỗi kết nối: ${error.message}`);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Left: form */}
        <div style={leftStyle}>
          <button onClick={() => navigate(-1)} style={backBtn}>
            <FaArrowLeft /> Quay về
          </button>

          <h2 style={{ color: "#044835", marginTop: 10 }}>Tạo yêu cầu bảo hành</h2>
          <p style={{ color: "#666" }}>Điền thông tin chi tiết để tạo yêu cầu bảo hành</p>

          <form onSubmit={handleSubmit} style={formStyle}>
            {/* Warranty Claim Information */}
            <div style={sectionStyle}>
              <h4 style={sectionHeaderStyle}>Thông tin yêu cầu bảo hành</h4>
              <div style={fieldGroupStyle}>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Mô tả chi tiết về vấn đề cần bảo hành *" 
                  style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
                  rows={4}
                  required 
                />
                <div style={gridTwoStyle}>
                  <input 
                    name="requestDate" 
                    value={formData.requestDate} 
                    onChange={handleChange} 
                    placeholder="Ngày yêu cầu bảo hành" 
                    type="date"
                    style={inputStyle} 
                    min={new Date().toISOString().split('T')[0]}
                    required 
                  />
                  <div style={{ display: "flex", alignItems: "center", color: "#6b7280", fontSize: "14px", fontStyle: "italic" }}>
                    Chọn ngày mong muốn được xử lý
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div style={sectionStyle}>
              <h4 style={sectionHeaderStyle}>Thông tin xe</h4>
              <div style={fieldGroupStyle}>
                <div style={gridTwoStyle}>
                  <input 
                    name="vehicleName" 
                    value={formData.vehicleName} 
                    onChange={handleChange} 
                    placeholder="Tên xe *" 
                    style={inputStyle} 
                    required 
                  />
                  <input 
                    name="vehicleYear" 
                    value={formData.vehicleYear} 
                    onChange={handleChange} 
                    placeholder="Năm sản xuất *" 
                    type="number"
                    min="1900"
                    max="2030"
                    style={inputStyle} 
                    required 
                  />
                </div>
                <input 
                  name="vehicleModel" 
                  value={formData.vehicleModel} 
                  onChange={handleChange} 
                  placeholder="Model xe *" 
                  style={inputStyle} 
                  required 
                />
                <input 
                  name="vehicleVin" 
                  value={formData.vehicleVin} 
                  onChange={handleChange} 
                  placeholder="VIN (số khung xe) *" 
                  style={inputStyle} 
                  maxLength="17"
                  required 
                />
              </div>
            </div>

            {/* Customer Information */}
            <div style={sectionStyle}>
              <h4 style={sectionHeaderStyle}>Thông tin khách hàng</h4>
              <div style={fieldGroupStyle}>
                <div style={gridTwoStyle}>
                  <input 
                    name="customerName" 
                    value={formData.customerName} 
                    onChange={handleChange} 
                    placeholder="Tên khách hàng *" 
                    style={inputStyle} 
                    required 
                  />
                  <input 
                    name="customerPhone" 
                    value={formData.customerPhone} 
                    onChange={handleChange} 
                    placeholder="Số điện thoại *" 
                    style={inputStyle} 
                    pattern="[0-9+\-\s\(\)]+"
                    required 
                  />
                </div>
              </div>
            </div>

            <div style={buttonGroupStyle}>
              <button type="submit" style={btnPrimary}>
                <span style={buttonIconStyle}>✓</span>
                Tạo yêu cầu bảo hành
              </button>
              <button type="button" onClick={() => { 
                setFormData({
                  warrantyClaimId: 0,
                  claimDate: new Date().toISOString(),
                  description: "",
                  requestDate: "",
                  vehicleName: "",
                  vehicleModel: "",
                  vehicleYear: new Date().getFullYear(),
                  vehicleVin: "",
                  customerName: "",
                  customerPhone: "",
                }); 
              }} style={btnSecondary}>
                <span style={buttonIconStyle}>↻</span>
                Đặt lại
              </button>
            </div>
          </form>
        </div>

        {/* Right: ảnh */}
        <div style={rightStyle}>
          <div style={heroContainer}>
            <img src={selectedImage} alt="EV" style={heroImage} />
            <div style={heroOverlay}>
              <div>
                <h3 style={{ margin: 0 }}>Hệ thống bảo hành EV</h3>
                <p style={{ margin: 0 }}>Chuyên nghiệp — Tin cậy — Hiệu quả</p>
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
  background: "linear-gradient(135deg, #f0f7f4 0%, #e8f4f8 100%)",
  padding: 24,
  boxSizing: "border-box",
};

const cardStyle = {
  display: "flex",
  width: "100%",
  maxWidth: 1200,
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(2,12,8,0.15)",
  background: "#fff",
};

const leftStyle = { 
  flex: 1.2, 
  padding: 32, 
  background: "linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)",
  borderRight: "1px solid #f0f2f5"
};
const rightStyle = { flex: 1, position: "relative", background: "#f6f9fa", padding: 20, display: "flex", flexDirection: "column" };

const heroContainer = { position: "relative", height: 360, borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 25px rgba(2,12,8,0.06)" };
const heroImage = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const heroOverlay = { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,72,53,0.0), rgba(4,72,53,0.35))", color: "#fff", display: "flex", alignItems: "flex-end", padding: 18, boxSizing: "border-box" };

const thumbRow = { display: "flex", gap: 10, marginTop: 12 };
const thumbStyle = { width: 90, height: 64, objectFit: "cover", borderRadius: 8, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" };

const formStyle = { 
  marginTop: 12, 
  display: "flex", 
  flexDirection: "column", 
  gap: 24 
};

const inputStyle = { 
  padding: "12px 16px", 
  borderRadius: 10, 
  border: "1px solid #e1e5e9", 
  fontSize: 14, 
  outline: "none", 
  fontFamily: "inherit",
  transition: "all 0.2s ease",
  "&:focus": {
    borderColor: "#044835",
    boxShadow: "0 0 0 3px rgba(4,72,53,0.1)"
  }
};

const selectStyle = { 
  ...inputStyle,
  cursor: "pointer",
  backgroundColor: "#fff"
};

// New professional styles
const sectionStyle = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  border: "1px solid #f0f2f5",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
};

const sectionHeaderStyle = {
  margin: "0 0 16px 0",
  color: "#044835",
  fontSize: 16,
  fontWeight: 600,
  borderBottom: "2px solid #f0f2f5",
  paddingBottom: 8
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const gridTwoStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12
};

const buttonGroupStyle = {
  display: "flex",
  gap: 16,
  marginTop: 8,
  justifyContent: "flex-end"
};

const buttonIconStyle = {
  marginRight: 8,
  fontSize: 16
};

const btnPrimary = { 
  padding: "14px 24px", 
  borderRadius: 10, 
  border: "none", 
  background: "linear-gradient(135deg, #044835 0%, #065a42 100%)", 
  color: "#fff", 
  fontWeight: 600, 
  cursor: "pointer",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(4,72,53,0.2)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 6px 16px rgba(4,72,53,0.3)"
  }
};

const btnSecondary = { 
  padding: "14px 24px", 
  borderRadius: 10, 
  border: "1px solid #e1e5e9", 
  background: "#fff", 
  color: "#6b7280", 
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb"
  }
};

const backBtn = { background: "transparent", border: "none", color: "#044835", cursor: "pointer", fontWeight: 600, padding: 0, display: "inline-flex", alignItems: "center", gap: 8 };
