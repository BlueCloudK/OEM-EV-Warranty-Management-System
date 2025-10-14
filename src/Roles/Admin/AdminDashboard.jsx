import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaCar, 
  FaCogs,
  FaClipboardList,
  FaHistory,
  FaChartBar,
  FaUserShield,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaFilter,
  FaDownload
} from "react-icons/fa";

/**
 * ================================
 * 🔐 ADMIN DASHBOARD
 * ================================
 * Based on API Guides:
 * - ADMIN có quyền cao nhất truy cập tất cả endpoints
 * - Quản lý: Customers, Vehicles, Parts, Warranty Claims, Service History
 * - Dashboard với statistics và quick actions
 */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    totalParts: 0,
    totalClaims: 0,
    pendingClaims: 0,
    completedClaims: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  // ================================
  // 📊 ADMIN API ENDPOINTS
  // ================================
  const API_ENDPOINTS = {
    CUSTOMERS: '/api/customers',
    VEHICLES: '/api/vehicles', 
    PARTS: '/api/parts',
    WARRANTY_CLAIMS: '/api/warranty-claims',
    SERVICE_HISTORY: '/api/service-histories',
    USERS: '/api/users' // Admin only
  };

  const ADMIN_FEATURES = [
    {
      title: "Quản lý Khách hàng",
      description: "Xem, thêm, sửa, xóa khách hàng - FULL CRUD",
      icon: <FaUsers />,
      path: "/admin/customers",
      color: "#3b82f6",
      endpoints: ["GET /customers", "POST /customers", "PUT /customers/{id}", "DELETE /customers/{id}"]
    },
    {
      title: "Quản lý Xe điện",
      description: "Quản lý danh sách xe điện và thông tin VIN",
      icon: <FaCar />,
      path: "/admin/vehicles", 
      color: "#10b981",
      endpoints: ["GET /vehicles", "POST /vehicles", "PUT /vehicles/{id}", "DELETE /vehicles/{id}"]
    },
    {
      title: "Quản lý Phụ tùng",
      description: "Quản lý kho phụ tùng và warranty information",
      icon: <FaCogs />,
      path: "/admin/parts",
      color: "#f59e0b",
      endpoints: ["GET /parts", "POST /parts", "PUT /parts/{id}", "DELETE /parts/{id}"]
    },
    {
      title: "Warranty Claims",
      description: "Xem tất cả yêu cầu bảo hành và workflow",
      icon: <FaClipboardList />,
      path: "/admin/warranty-claims",
      color: "#ef4444",
      endpoints: ["GET /warranty-claims", "PUT /warranty-claims/{id}", "DELETE /warranty-claims/{id}"]
    },
    {
      title: "Lịch sử Bảo dưỡng",
      description: "Xem toàn bộ service histories của hệ thống",
      icon: <FaHistory />,
      path: "/admin/service-histories",
      color: "#8b5cf6",
      endpoints: ["GET /service-histories", "POST /service-histories", "PUT /service-histories/{id}", "DELETE /service-histories/{id}"]
    },
    {
      title: "Quản lý Users & Roles",
      description: "Quản lý tài khoản và phân quyền - ADMIN ONLY",
      icon: <FaUserShield />,
      path: "/admin/users",
      color: "#dc2626",
      endpoints: ["POST /api/auth/register", "GET /api/admin/users", "PUT /api/admin/users/{id}", "DELETE /api/admin/users/{id}"]
    }
  ];

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      // Giả lập fetch stats từ các endpoints
      // Trong thực tế sẽ gọi parallel requests
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock stats data
      setStats({
        totalCustomers: 156,
        totalVehicles: 89,
        totalParts: 342,
        totalClaims: 67,
        pendingClaims: 12,
        completedClaims: 45
      });

    } catch (err) {
      console.error("Dashboard stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    // Mock recent activity
    setRecentActivity([
      { id: 1, type: 'customer', action: 'Khách hàng mới đăng ký: Nguyễn Văn A', time: '2 phút trước', icon: <FaUsers /> },
      { id: 2, type: 'claim', action: 'Warranty claim mới: Battery replacement', time: '15 phút trước', icon: <FaClipboardList /> },
      { id: 3, type: 'vehicle', action: 'Xe mới được đăng ký: Tesla Model Y', time: '1 giờ trước', icon: <FaCar /> },
      { id: 4, type: 'service', action: 'Service hoàn tất: Maintenance xe VIN-123', time: '2 giờ trước', icon: <FaHistory /> }
    ]);
  };

  // Styles
  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    padding: "20px",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    color: "white",
    padding: "30px 40px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  };

  const statCardStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    transition: "all 0.3s",
  };

  const featuresGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "25px",
    marginBottom: "30px",
  };

  const featureCardStyle = {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    transition: "all 0.3s",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "14px",
              transition: "all 0.3s"
            }}
          >
            <FaArrowLeft /> Trang chủ
          </button>
          <h1 style={{ fontSize: "32px", margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
            <FaUserShield /> Admin Dashboard
          </h1>
        </div>
        <p style={{ opacity: 0.9, fontSize: "16px", margin: 0 }}>
          🔐 ADMIN - Full access to all system resources and management functions
        </p>
        <div style={{
          background: "rgba(255,255,255,0.1)",
          padding: "10px 15px",
          borderRadius: "6px",
          marginTop: "15px",
          fontSize: "12px",
          fontFamily: "monospace"
        }}>
          📡 API Access: All endpoints | 🎯 Permissions: CRUD on all resources | 🛡️ Special: DELETE operations
        </div>
      </div>

      {/* Stats Cards */}
      <div style={statsGridStyle}>
        {[
          { title: "Tổng Khách hàng", value: stats.totalCustomers, icon: <FaUsers />, color: "#3b82f6" },
          { title: "Tổng Xe điện", value: stats.totalVehicles, icon: <FaCar />, color: "#10b981" },
          { title: "Tổng Phụ tùng", value: stats.totalParts, icon: <FaCogs />, color: "#f59e0b" },
          { title: "Claims đang xử lý", value: stats.pendingClaims, icon: <FaClipboardList />, color: "#ef4444" },
          { title: "Claims hoàn tất", value: stats.completedClaims, icon: <FaClipboardList />, color: "#10b981" },
          { title: "Tổng Claims", value: stats.totalClaims, icon: <FaChartBar />, color: "#8b5cf6" }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              ...statCardStyle,
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: "0 0 5px 0", color: "#374151", fontSize: "14px" }}>
                  {stat.title}
                </h3>
                <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: stat.color }}>
                  {loading ? "..." : stat.value}
                </p>
              </div>
              <div style={{ fontSize: "40px", color: stat.color, opacity: 0.7 }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Management Features */}
      <div style={featuresGridStyle}>
        {ADMIN_FEATURES.map((feature, index) => (
          <div
            key={index}
            style={{
              ...featureCardStyle,
              borderTop: `4px solid ${feature.color}`,
            }}
            onClick={() => feature.path && navigate(feature.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
              <div style={{ 
                fontSize: "40px", 
                color: feature.color,
                minWidth: "40px"
              }}>
                {feature.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: "0 0 8px 0", 
                  color: "#1f2937", 
                  fontSize: "18px",
                  fontWeight: "600"
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  margin: "0 0 15px 0", 
                  color: "#6b7280", 
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  {feature.description}
                </p>
                
                {/* API Endpoints */}
                <div style={{ marginTop: "10px" }}>
                  <div style={{ 
                    fontSize: "11px", 
                    color: "#9ca3af", 
                    fontWeight: "600",
                    marginBottom: "5px"
                  }}>
                    📡 API Endpoints:
                  </div>
                  {feature.endpoints.map((endpoint, i) => (
                    <div key={i} style={{
                      fontSize: "10px",
                      fontFamily: "monospace",
                      color: feature.color,
                      background: `${feature.color}15`,
                      padding: "2px 6px",
                      borderRadius: "3px",
                      display: "inline-block",
                      marginRight: "5px",
                      marginBottom: "3px"
                    }}>
                      {endpoint}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "25px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}>
        <h3 style={{ 
          margin: "0 0 20px 0", 
          color: "#1f2937",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <FaHistory /> Hoạt động Gần đây
        </h3>
        
        {recentActivity.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentActivity.map((activity) => (
              <div key={activity.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                transition: "all 0.3s"
              }}>
                <div style={{ fontSize: "20px", color: "#6b7280" }}>
                  {activity.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: "#374151", fontSize: "14px" }}>
                    {activity.action}
                  </p>
                </div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#6b7280", textAlign: "center", padding: "20px" }}>
            Chưa có hoạt động nào
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: "flex",
        gap: "15px",
        marginTop: "25px",
        flexWrap: "wrap"
      }}>
        {[
          { label: "Tạo Customer mới", icon: <FaPlus />, color: "#3b82f6" },
          { label: "Xuất báo cáo", icon: <FaDownload />, color: "#10b981" },
          { label: "Xem Analytics", icon: <FaChartBar />, color: "#f59e0b" },
          { label: "Cài đặt System", icon: <FaCogs />, color: "#8b5cf6" }
        ].map((action, index) => (
          <button
            key={index}
            onClick={() => console.log(`Quick action: ${action.label}`)}
            style={{
              background: action.color,
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            {action.icon} {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}