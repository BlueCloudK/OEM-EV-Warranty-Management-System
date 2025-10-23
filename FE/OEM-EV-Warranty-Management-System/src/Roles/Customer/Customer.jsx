import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from 'react-icons/fa';

export default function Customer() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("Khách hàng");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Get user info from localStorage
    try {
      // Prefer customer profile (created via CustomerProfile) if available
      const currentCustomer = JSON.parse(localStorage.getItem('currentCustomer') || 'null');
      if (currentCustomer && (currentCustomer.name || currentCustomer.customerName || currentCustomer.fullName)) {
        setUserName(currentCustomer.name || currentCustomer.customerName || currentCustomer.fullName);
      } else {
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        if (userInfo.name || userInfo.fullName || userInfo.username) {
          setUserName(userInfo.name || userInfo.fullName || userInfo.username);
        }
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
    {
      title: "Thông tin xe",
      description: "Xem và quản lý thông tin các phương tiện của bạn",
      icon: "🚗",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      path: "/customer/vehicles",
      bgPattern: "⚡🔋🚙"
    },
    {
      title: "Xem yêu cầu bảo hành",
      description: "Xem lịch sử yêu cầu bảo hành và tình trạng xử lý",
      icon: "🛡️",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      path: "/customer/warranty-claims",
      bgPattern: "🔧⚙️🛠️"
    },
    {
      title: "Xem Lịch sử dịch vụ",
      description: "Xem lịch sử dịch vụ đã thực hiện cho phương tiện của bạn",
      icon: "🧾",
      gradient: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
      path: "/customer/service-history",
      bgPattern: "🔧🧾🔩"
    },
    {
      title: "Tạo và quản lý feedbacks",
      description: "Gửi phản hồi và quản lý feedback đã gửi",
      icon: "💬",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      path: "/customer/feedbacks",
      bgPattern: "✉️⭐🔁"
    },
    {
      title: "Xem Các bộ phận được lắp đặt",
      description: "Xem danh sách các bộ phận đã được lắp đặt trên xe của bạn",
      icon: "🧩",
      gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
      path: "/customer/installed-parts",
      bgPattern: "🔩🛠️📦"
    },
    
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(180deg, #f5f7fb 0%, #eef2ff 100%)",
      position: "relative",
      overflow: "hidden",
      display: 'flex'
    }}>

      {/* Left Sidebar / Dashboard (collapsible like SCStaff) */}
      <aside style={{
        width: sidebarCollapsed ? 72 : 260,
        transition: 'width 0.28s ease',
        background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
        color: '#fff',
        padding: sidebarCollapsed ? '16px 10px' : '20px',
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '2px 0 18px rgba(2,6,23,0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <div style={{ fontSize: sidebarCollapsed ? '0.95rem' : '1.1rem', fontWeight: 800 }}>{sidebarCollapsed ? 'OE' : 'OEM EV'}</div>
          <button
            aria-label="Toggle sidebar"
            onClick={() => setSidebarCollapsed(s => !s)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#cbd5e1',
              padding: 8,
              borderRadius: 8,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FaBars />
          </button>
        </div>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <div style={{
            width: sidebarCollapsed ? 44 : 56,
            height: sidebarCollapsed ? 44 : 56,
            borderRadius: '50%',
            background: '#fff',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.2rem'
          }}>
            {userName ? userName.charAt(0).toUpperCase() : 'K'}
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{userName}</div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Khách hàng</div>
            </div>
          )}
        </div>

        <nav style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8, padding: sidebarCollapsed ? '8px 4px' : '0' }}>
          {features.map((f, i) => (
            <button key={i} onClick={() => navigate(f.path)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: sidebarCollapsed ? '10px 8px' : '10px 12px',
              borderRadius: 8,
              background: 'transparent',
              color: '#e6eef8',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 600,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            onMouseEnter={(e) => { if (!sidebarCollapsed) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={(e) => { if (!sidebarCollapsed) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
              {!sidebarCollapsed && <span>{f.title}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-hover {
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(16,24,40,0.08);
        }
      `}</style>

      <main style={{ 
        flex: 1,
        padding: "28px 40px",
        position: "relative",
        zIndex: 1
      }}>
        {/* Header Section */}
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "28px",
          border: "1px solid rgba(15, 23, 42, 0.04)",
          animation: "slideInUp 0.6s ease-out"
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
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                color: "#fff",
                border: "2px solid rgba(0,0,0,0.06)",
                animation: "pulse 2.4s infinite"
              }}>
                👨‍💼
              </div>
              
              {/* Welcome Text */}
              <div>
                <h1 style={{ 
                  color: "#0f172a", 
                  margin: "0 0 6px 0",
                  fontSize: "1.6rem",
                  fontWeight: "700"
                }}>
                  {getGreeting()}, {userName}
                </h1>
                <p style={{ 
                  margin: 0, 
                  color: "#475569", 
                  fontSize: "0.98rem",
                  fontWeight: "500"
                }}>
                  Trung tâm bảo dưỡng & bảo hành xe điện
                </p>
                <p style={{ 
                  margin: "6px 0 0 0", 
                  color: "#64748b", 
                  fontSize: "0.9rem"
                }}>
                  {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Quick Stats (subtle) */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 14px", textAlign: "center", minWidth: "96px" }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>⚡</div>
                <div style={{ color: "#0f172a", fontSize: "0.82rem", fontWeight: "600" }}>Xe</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 14px", textAlign: "center", minWidth: "96px" }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>🛡️</div>
                <div style={{ color: "#0f172a", fontSize: "0.82rem", fontWeight: "600" }}>Bảo hành</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "22px",
          maxWidth: "980px",
          margin: "0 auto"
        }}>
          {features.map((item, index) => (
            <div
              key={index}
              className="card-hover"
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                border: "1px solid rgba(15,23,42,0.04)",
                animation: `slideInUp 0.6s ease-out ${index * 0.06}s both`
              }}
              onClick={() => item.path && navigate(item.path)}
            >
              {/* Card Header with Gradient */}
              <div style={{
                background: item.gradient,
                padding: "22px 20px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Background Pattern */}
                {/* Icon */}
                <div style={{ fontSize: "2.4rem", marginBottom: "8px", position: "relative", zIndex: 1 }}>{item.icon}</div>
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.15rem", fontWeight: "700", position: "relative", zIndex: 1 }}>{item.title}</h3>
              </div>

              {/* Card Body */}
              <div style={{ 
                padding: "18px 20px", 
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <p style={{ 
                  margin: "0 0 14px 0", 
                  color: "#475569", 
                  fontSize: "0.98rem",
                  lineHeight: "1.5"
                }}>
                  {item.description}
                </p>
                
                {/* Call to Action */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(15,23,42,0.04)" }}>
                  <span style={{ color: "#667eea", fontWeight: "600", fontSize: "0.95rem" }}>Xem chi tiết</span>
                  <div style={{ background: "#eef2ff", borderRadius: "8px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155" }}>↗</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "40px", padding: "12px", color: "#64748b", fontSize: "0.9rem" }}>
          <p style={{ margin: 0 }}>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi</p>
        </div>
      </main>
    </div>
  );
}
