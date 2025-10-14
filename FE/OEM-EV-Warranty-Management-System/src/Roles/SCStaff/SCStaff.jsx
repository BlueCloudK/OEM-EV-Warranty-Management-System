import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaCar, 
  FaPlus, 
  FaEdit, 
  FaClipboardList, 
  FaHistory,
  FaArrowRight,
  FaUserCog,
  FaTools,
  FaUserPlus
} from "react-icons/fa";

export default function SCStaff() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const managementCards = [
    {
      id: 1,
      title: "Quản lý profile khách hàng",
      description: "Xem, tạo mới và cập nhật thông tin khách hàng",
      icon: <FaUserCog size={40} />,
      color: "#3b82f6",
      bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
      path: "/scstaff/customers"
    },
    {
      id: 2,
      title: "Quản lý thông tin xe",
      description: "Quản lý danh sách xe, tạo mới và cập nhật thông tin xe",
      icon: <FaCar size={40} />,
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
      path: "/scstaff/vehicles"
    },
    {
      id: 3,
      title: "Quản lý yêu cầu bảo hành",
      description: "Xử lý và theo dõi các yêu cầu bảo hành từ khách hàng",
      icon: <FaClipboardList size={40} />,
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      path: "/scstaff/warranty-claims"
    },
    {
      id: 4,
      title: "Quản lý lịch sử dịch vụ",
      description: "Theo dõi và quản lý lịch sử dịch vụ của khách hàng",
      icon: <FaHistory size={40} />,
      color: "#8b5cf6",
      bgGradient: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
      path: "/scstaff/service-history"
    },
    {
      id: 5,
      title: "Tạo tài khoản khách hàng",
      description: "Tạo tài khoản mới cho khách hàng với thông tin đầy đủ",
      icon: <FaUserPlus size={40} />,
      color: "#ef4444",
      bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      path: "/scstaff/create-customer-account"
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "50px",
            background: "#fff",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <FaTools size={32} color="#044835" />
            <h1
              style={{
                color: "#044835",
                fontSize: "28px",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              Service Center Staff Dashboard
            </h1>
          </div>
          <p
            style={{
              color: "#666",
              fontSize: "16px",
              margin: 0,
              lineHeight: "1.6",
            }}
          >
            Quản lý khách hàng, xe, yêu cầu bảo hành và lịch sử dịch vụ một cách hiệu quả
          </p>
        </div>

        {/* Management Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "30px",
            marginBottom: "40px",
          }}
        >
          {managementCards.map((card) => (
            <div
              key={card.id}
              style={{
                background: card.bgGradient,
                borderRadius: "16px",
                padding: "30px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                transform: hoveredCard === card.id ? "translateY(-5px)" : "translateY(0)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => card.path ? handleCardClick(card.path) : null}
            >
              {/* Card Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    color: card.color,
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "15px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <h3
                    style={{
                      color: "#1f2937",
                      fontSize: "18px",
                      fontWeight: "bold",
                      margin: 0,
                      marginBottom: "5px",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      margin: 0,
                      lineHeight: "1.4",
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>



             
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              color: "#044835",
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            📊 Thống kê nhanh
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
                156
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                Khách hàng đang quản lý
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                89
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                Xe đã đăng ký
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>
                23
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                Yêu cầu bảo hành chờ xử lý
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#8b5cf6" }}>
                342
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                Dịch vụ đã hoàn thành
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ef4444" }}>
                47
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                Tài khoản tạo trong tháng
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}