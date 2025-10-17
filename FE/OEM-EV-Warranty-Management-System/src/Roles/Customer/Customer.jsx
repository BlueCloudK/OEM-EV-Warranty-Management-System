import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Customer() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("Khách hàng");

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Get user info from localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      if (userInfo.name) {
        setUserName(userInfo.name);
      }
    } catch (error) {
      console.log('Could not parse user info');
    }

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const features = [
    {
      title: "Thông tin cá nhân",
      description: "Quản lý và cập nhật thông tin tài khoản của bạn",
      icon: "👤",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      path: "/customer/profile",
      bgPattern: "🔧⚡🚗"
    },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        fontSize: "100px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-around",
        pointerEvents: "none",
        color: "#fff"
      }}>
        {"⚡🚗🔧⚙️🔋🛠️".repeat(20).split('').map((emoji, i) => (
          <span key={i} style={{ 
            animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }}>
            {emoji}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
        }
      `}</style>

      <div style={{ 
        padding: "40px",
        position: "relative",
        zIndex: 1
      }}>
        {/* Header Section */}
        <div style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "32px",
          marginBottom: "40px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          animation: "slideInUp 0.8s ease-out"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* Avatar */}
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "#fff",
                border: "4px solid rgba(255, 255, 255, 0.3)",
                animation: "pulse 2s infinite"
              }}>
                👨‍💼
              </div>
              
              {/* Welcome Text */}
              <div>
                <h1 style={{ 
                  color: "#fff", 
                  margin: "0 0 8px 0",
                  fontSize: "2.5rem",
                  fontWeight: "700",
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  {getGreeting()}, {userName}!
                </h1>
                <p style={{ 
                  margin: 0, 
                  color: "rgba(255, 255, 255, 0.9)", 
                  fontSize: "1.1rem",
                  fontWeight: "400"
                }}>
                  🚗 Trung tâm bảo dưỡng & bảo hành xe điện
                </p>
                <p style={{ 
                  margin: "4px 0 0 0", 
                  color: "rgba(255, 255, 255, 0.7)", 
                  fontSize: "0.95rem"
                }}>
                  📅 {currentTime.toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ 
              display: "flex", 
              gap: "20px",
              flexWrap: "wrap"
            }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "16px",
                padding: "16px 20px",
                textAlign: "center",
                minWidth: "100px"
              }}>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>⚡</div>
                <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: "600" }}>
                  Xe điện
                </div>
              </div>
              <div style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "16px",
                padding: "16px 20px",
                textAlign: "center",
                minWidth: "100px"
              }}>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>🛡️</div>
                <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: "600" }}>
                  Bảo hành
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px",
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          {features.map((item, index) => (
            <div
              key={index}
              className="card-hover"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "24px",
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(20px)",
                animation: `slideInUp 0.8s ease-out ${index * 0.1}s both`
              }}
              onClick={() => item.path && navigate(item.path)}
            >
              {/* Card Header with Gradient */}
              <div style={{
                background: item.gradient,
                padding: "32px 24px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Background Pattern */}
                <div style={{
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  right: "-50%",
                  bottom: "-50%",
                  fontSize: "60px",
                  opacity: 0.1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  transform: "rotate(12deg)"
                }}>
                  {item.bgPattern}
                </div>
                
                {/* Icon */}
                <div style={{
                  fontSize: "4rem",
                  marginBottom: "16px",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                  position: "relative",
                  zIndex: 1
                }}>
                  {item.icon}
                </div>
                
                <h3 style={{ 
                  margin: 0, 
                  color: "#fff",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  position: "relative",
                  zIndex: 1
                }}>
                  {item.title}
                </h3>
              </div>

              {/* Card Body */}
              <div style={{ 
                padding: "28px 24px", 
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <p style={{ 
                  margin: "0 0 20px 0", 
                  color: "#4a5568", 
                  fontSize: "1rem",
                  lineHeight: "1.6"
                }}>
                  {item.description}
                </p>
                
                {/* Call to Action */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "16px",
                  borderTop: "1px solid #e2e8f0"
                }}>
                  <span style={{
                    color: "#667eea",
                    fontWeight: "600",
                    fontSize: "0.95rem"
                  }}>
                    Xem chi tiết
                  </span>
                  <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "1.2rem",
                    transform: "rotate(-45deg)"
                  }}>
                    ↗
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "60px",
          padding: "20px",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "0.9rem"
        }}>
          <p style={{ margin: 0 }}>
            🌟 Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi
          </p>
        </div>
      </div>
    </div>
  );
}
