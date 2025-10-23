import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaCar,
  FaClipboardList,
  FaHistory,
  FaArrowRight,
  FaUserCog,
  FaTachometerAlt,
  FaUserPlus,
  FaBars,
  FaHome,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";

export default function SCStaff() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    customers: 156,
    vehicles: 89,
    submittedClaims: 23,
    completedServices: 342,
    newAccounts: 47,
    loading: true
  });

  // Load live stats from API when possible
  React.useEffect(() => {
    const loadStats = async () => {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      if (!token || !API_BASE_URL) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // We'll call a few endpoints in parallel
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const customersP = fetch(`${API_BASE_URL}/api/customers?size=1`, { headers });
        const vehiclesP = fetch(`${API_BASE_URL}/api/vehicles?size=1`, { headers });
        const submittedClaimsP = fetch(`${API_BASE_URL}/api/warranty-claims/by-status/SUBMITTED?page=0&size=1`, { headers });
        const completedServicesP = fetch(`${API_BASE_URL}/api/service-histories?status=COMPLETED&page=0&size=1`, { headers }).catch(() => null);
        const newAccountsP = fetch(`${API_BASE_URL}/api/admin/users/statistics`, { headers }).catch(() => null);

        const [customersR, vehiclesR, submittedR, servicesR, accountsR] = await Promise.all([customersP, vehiclesP, submittedClaimsP, completedServicesP, newAccountsP]);

        const safeCount = async (res) => {
          if (!res || !res.ok) return null;
          try {
            const j = await res.json();
            // Try common shapes: { totalElements, total } or { content: [], totalElements }
            return j.totalElements || j.total || (Array.isArray(j) ? j.length : null) || null;
          } catch (e) {
            return null;
          }
        };

        const [customersCount, vehiclesCount, submittedCount, servicesCount, accountsStats] = await Promise.all([
          safeCount(customersR),
          safeCount(vehiclesR),
          safeCount(submittedR),
          safeCount(servicesR),
          accountsR && accountsR.ok ? accountsR.json() : null
        ]);

        setStats(prev => ({
          customers: customersCount ?? prev.customers,
          vehicles: vehiclesCount ?? prev.vehicles,
          submittedClaims: submittedCount ?? prev.submittedClaims,
          completedServices: servicesCount ?? prev.completedServices,
          newAccounts: (accountsStats && (accountsStats.newUsers || accountsStats.totalNew || accountsStats.count)) ?? prev.newAccounts,
          loading: false
        }));
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadStats();
  }, []);

  const managementCards = [
    {
      id: 1,
      title: "Quản lý profile khách hàng",
      description: "Xem, tạo mới và cập nhật thông tin khách hàng",
      icon: <FaUserCog size={24} />,
      color: "#3b82f6",
      bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
      path: "/scstaff/customers",
      features: ["Xem", "Tạo", "Cập nhật"]
    },
    {
      id: 2,
      title: "Quản lý thông tin xe",
      description: "Danh sách xe, thêm mới, cập nhật",
      icon: <FaCar size={24} />,
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
      path: "/scstaff/vehicles",
      features: ["Danh sách", "Thêm", "Sửa"]
    },
    {
      id: 3,
      title: "Yêu cầu bảo hành",
      description: "Tiếp nhận và xử lý yêu cầu từ khách hàng",
      icon: <FaClipboardList size={24} />,
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      path: "/scstaff/warranty-claims",
      features: ["Tiếp nhận", "Xử lý", "Theo dõi"]
    },
    {
      id: 4,
      title: "Lịch sử dịch vụ",
      description: "Theo dõi dịch vụ & lịch sử sửa chữa",
      icon: <FaHistory size={24} />,
      color: "#8b5cf6",
      bgGradient: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
      path: "/scstaff/service-history",
      features: ["Xem", "Tạo", "Cập nhật"]
    },
    {
      id: 5,
      title: "Tạo tài khoản khách hàng",
      description: "Tạo và quản lý tài khoản khách hàng",
      icon: <FaUserPlus size={24} />,
      color: "#ef4444",
      bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      path: "/scstaff/create-customer-account",
      features: ["Tạo", "Xác thực"]
    }
  ];

  const sidebarItems = [
    { icon: <FaHome size={18} />, label: "Dashboard", active: true },
    { icon: <FaUserCog size={18} />, label: "Khách hàng", path: "/scstaff/customers" },
    { icon: <FaCar size={18} />, label: "Xe", path: "/scstaff/vehicles" },
    { icon: <FaClipboardList size={18} />, label: "Bảo hành", path: "/scstaff/warranty-claims" },
    { icon: <FaHistory size={18} />, label: "Lịch sử", path: "/scstaff/service-history" },
    { icon: <FaUserPlus size={18} />, label: "Tạo TK", path: "/scstaff/create-customer-account" }
  ];

  function handleCardClick(path) {
    if (path) navigate(path);
  }

  function handleSidebarClick(path) {
    if (path) navigate(path);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: sidebarCollapsed ? 70 : 260, 
        background: "linear-gradient(180deg, #1e293b 0%, #334155 100%)", 
        borderRight: "1px solid #475569", 
        display: "flex", 
        flexDirection: "column",
        transition: "width 0.3s ease",
        boxShadow: "2px 0 20px rgba(0,0,0,0.15)"
      }}>
        
        {/* Sidebar Header */}
        <div style={{ padding: sidebarCollapsed ? 16 : 20, borderBottom: "1px solid #475569" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ 
                background: "rgba(255,255,255,0.1)", 
                border: "1px solid rgba(255,255,255,0.2)", 
                cursor: "pointer", 
                padding: 8, 
                borderRadius: 8, 
                color: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
            >
              <FaBars size={16} />
            </button>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>SC Staff</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Dashboard</div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div style={{ flex: 1, padding: sidebarCollapsed ? 8 : 16 }}>
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSidebarClick(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: sidebarCollapsed ? 12 : "12px 16px",
                marginBottom: 4,
                borderRadius: 8,
                background: item.active ? "rgba(59, 130, 246, 0.15)" : "transparent",
                color: item.active ? "#60a5fa" : "#cbd5e1",
                cursor: "pointer",
                transition: "all 0.2s ease",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                border: item.active ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent"
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#f1f5f9";
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#cbd5e1";
                  e.currentTarget.style.border = "1px solid transparent";
                }
              }}
            >
              {item.icon}
              {!sidebarCollapsed && <span style={{ fontSize: 14, fontWeight: item.active ? 500 : 400 }}>{item.label}</span>}
            </div>
          ))}
        </div>


      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
        
        {/* Header */}
        <div style={{ 
          display: "flex", 
          gap: 24, 
          alignItems: "center", 
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", 
          padding: 28, 
          borderRadius: 16, 
          boxShadow: "0 10px 40px rgba(16,24,40,0.1)", 
          border: "1px solid #e2e8f0", 
          marginBottom: 28,
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Background decoration */}
          <div style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)",
            borderRadius: "50%",
            zIndex: 0
          }}></div>
          <div style={{ flex: 1, zIndex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 32, color: "#1e293b", letterSpacing: "-0.3px", fontWeight: 700 }}>Service Center Staff</h1>
            <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 15 }}>Bảng điều khiển chuyên nghiệp — quản lý khách hàng, xe, yêu cầu bảo hành và lịch sử dịch vụ.</p>
          </div>
          <div style={{ width: 200, height: 120, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
            {/* Colorful SVG illustration */}
            <svg width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <defs>
                <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <rect x="2" y="10" width="120" height="56" rx="8" fill="url(#carGradient)" opacity="0.9" />
              <rect x="8" y="16" width="108" height="44" rx="4" fill="#ffffff" opacity="0.9" />
              <circle cx="36" cy="70" r="8" fill="#1e293b" />
              <circle cx="96" cy="70" r="8" fill="#1e293b" />
              <circle cx="36" cy="70" r="5" fill="#60a5fa" />
              <circle cx="96" cy="70" r="5" fill="#60a5fa" />
              <path d="M120 34 L150 34 L160 46 L160 56 L120 56" stroke="#f59e0b" strokeWidth="3" fill="#fef3c7" />
              <path d="M12 22 L108 22" stroke="#8b5cf6" strokeWidth="3" />
              <circle cx="140" cy="20" r="3" fill="#ef4444" />
              <circle cx="150" cy="15" r="2" fill="#f59e0b" />
              <circle cx="160" cy="25" r="2.5" fill="#10b981" />
            </svg>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 32 }}>
          {managementCards.map((card) => (
            <div 
              key={card.id} 
              onClick={() => handleCardClick(card.path)} 
              onMouseEnter={() => setHoveredCard(card.id)} 
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: card.bgGradient,
                borderRadius: 16,
                border: hoveredCard === card.id ? `2px solid ${card.color}` : "2px solid transparent",
                padding: 24,
                boxShadow: hoveredCard === card.id ? `0 20px 40px ${card.color}20` : "0 8px 24px rgba(16,24,40,0.08)",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hoveredCard === card.id ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Card background decoration */}
              <div style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: `${card.color}15`,
                borderRadius: "50%",
                zIndex: 0
              }}></div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, position: "relative", zIndex: 1 }}>
                <div style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 14, 
                  background: "#ffffff", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: card.color,
                  boxShadow: `0 8px 16px ${card.color}20`,
                  border: `2px solid ${card.color}20`
                }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.4 }}>{card.description}</div>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, position: "relative", zIndex: 1 }}>
                {card.features.map((f, i) => (
                  <span key={i} style={{ 
                    fontSize: 12, 
                    color: card.color, 
                    background: "#ffffff", 
                    padding: "6px 12px", 
                    borderRadius: 16, 
                    border: `1px solid ${card.color}30`,
                    fontWeight: 500,
                    boxShadow: `0 2px 4px ${card.color}10`
                  }}>
                    {f}
                  </span>
                ))}
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Truy cập ngay</div>
                <div style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 10, 
                  background: hoveredCard === card.id ? card.color : "#ffffff", 
                  color: hoveredCard === card.id ? "#ffffff" : card.color, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  boxShadow: hoveredCard === card.id ? `0 4px 12px ${card.color}40` : "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                  <FaArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div style={{ 
          background: "#fff", 
          padding: 24, 
          borderRadius: 12, 
          border: "1px solid #e5e7eb", 
          boxShadow: "0 6px 24px rgba(16,24,40,0.04)" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 10, 
              background: "#111827", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#fff" 
            }}>
              <FaTachometerAlt size={18} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Thống kê hoạt động</div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>Tổng quan các số liệu quan trọng</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { value: stats.customers, label: 'Khách hàng', icon: <FaUsers size={18} />, color: '#3b82f6', bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' },
              { value: stats.vehicles, label: 'Xe đăng ký', icon: <FaCar size={18} />, color: '#10b981', bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' },
              { value: stats.submittedClaims, label: 'Yêu cầu chờ', icon: <FaClipboardList size={18} />, color: '#f59e0b', bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
              { value: stats.completedServices, label: 'Dịch vụ hoàn thành', icon: <FaHistory size={18} />, color: '#8b5cf6', bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' },
              { value: stats.newAccounts, label: 'Tài khoản mới', icon: <FaUserPlus size={18} />, color: '#ef4444', bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }
            ].map((s, idx) => (
              <div key={idx} style={{
                background: s.bgGradient,
                padding: 20,
                borderRadius: 12,
                border: `2px solid ${s.color}20`,
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                  e.currentTarget.style.boxShadow = `0 12px 24px ${s.color}25`;
                  e.currentTarget.style.border = `2px solid ${s.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.border = `2px solid ${s.color}20`;
                }}
              >
                {/* Background decoration */}
                <div style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  width: 40,
                  height: 40,
                  background: `${s.color}15`,
                  borderRadius: "50%",
                  zIndex: 0
                }}></div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.color,
                    boxShadow: `0 4px 8px ${s.color}20`
                  }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 600, position: "relative", zIndex: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
