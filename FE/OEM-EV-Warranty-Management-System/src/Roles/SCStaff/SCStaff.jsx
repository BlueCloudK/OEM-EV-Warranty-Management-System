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
  FaTools
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
      actions: [
        { label: "Xem danh sách khách hàng", path: "/scstaff/customers/list" },
        { label: "Tạo khách hàng mới", path: "/scstaff/customers/create" },
        { label: "Cập nhật thông tin", path: "/scstaff/customers/list" }
      ]
    },
    {
      id: 2,
      title: "Quản lý thông tin xe",
      description: "Quản lý danh sách xe, tạo mới và cập nhật thông tin xe",
      icon: <FaCar size={40} />,
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
      actions: [
        { label: "Xem danh sách xe", path: "/scstaff/vehicles" },
        { label: "Tạo mới thông tin xe", path: "/scstaff/vehicles/create" },
        { label: "Cập nhật thông tin xe", path: "/scstaff/vehicles/edit" }
      ]
    },
    {
      id: 3,
      title: "Quản lý yêu cầu bảo hành",
      description: "Xử lý và theo dõi các yêu cầu bảo hành từ khách hàng",
      icon: <FaClipboardList size={40} />,
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      actions: [
        { label: "Xem yêu cầu bảo hành", path: "/scstaff/warranty-claims" },
        { label: "Xử lý yêu cầu mới", path: "/scstaff/warranty-claims/process" },
        { label: "Cập nhật trạng thái", path: "/scstaff/warranty-claims/update" }
      ]
    },
    {
      id: 4,
      title: "Quản lý lịch sử dịch vụ",
      description: "Theo dõi và quản lý lịch sử dịch vụ của khách hàng",
      icon: <FaHistory size={40} />,
      color: "#8b5cf6",
      bgGradient: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
      actions: [
        { label: "Xem lịch sử dịch vụ", path: "/scstaff/service-history" },
        { label: "Tạo bản ghi dịch vụ", path: "/scstaff/service-history/create" },
        { label: "Cập nhật lịch sử", path: "/scstaff/service-history/update" }
      ]
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

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {card.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleCardClick(action.path)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = card.color;
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.transform = "translateX(5px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#374151";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <span>{action.label}</span>
                    <FaArrowRight size={12} />
                  </button>
                ))}
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
          </div>
        </div>
      </div>
    </div>
  );
}
