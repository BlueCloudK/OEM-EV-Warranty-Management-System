import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaCar,
  FaCogs,
  FaClipboardList,
  FaHistory,
  FaChartBar,
  FaUserShield,
  FaTachometerAlt,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaFilter,
  FaDownload,
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
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    totalParts: 0,
    totalClaims: 0,
    pendingClaims: 0,
    completedClaims: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  // ================================
  // 📊 ADMIN API ENDPOINTS
  // ================================
  const API_ENDPOINTS = {
    CUSTOMERS: "/api/customers",
    VEHICLES: "/api/vehicles",
    PARTS: "/api/parts",
    WARRANTY_CLAIMS: "/api/warranty-claims",
    SERVICE_HISTORY: "/api/service-histories",
    USERS: "/api/users", // Admin only
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "https://backend.bluecloudk.xyz";

      // Gọi parallel requests để lấy dữ liệu thực từ API
      const [customersRes, vehiclesRes, partsRes, claimsRes] =
        await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/customers?size=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/vehicles?size=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/parts?size=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/warranty-claims?size=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      // Xử lý kết quả từ API
      let totalCustomers = 0;
      let totalVehicles = 0;
      let totalParts = 0;
      let totalClaims = 0;
      let pendingClaims = 0;
      let completedClaims = 0;

      // Customers
      if (customersRes.status === "fulfilled" && customersRes.value.ok) {
        const customersData = await customersRes.value.json();
        console.log("📊 Customers API response:", customersData);
        totalCustomers = Array.isArray(customersData)
          ? customersData.length
          : customersData.content
          ? customersData.content.length
          : customersData.totalElements || 0;
        console.log("📊 Total customers calculated:", totalCustomers);
      } else {
        console.log("❌ Customers API failed:", customersRes);
      }

      // Vehicles
      if (vehiclesRes.status === "fulfilled" && vehiclesRes.value.ok) {
        const vehiclesData = await vehiclesRes.value.json();
        console.log("📊 Vehicles API response:", vehiclesData);
        totalVehicles = Array.isArray(vehiclesData)
          ? vehiclesData.length
          : vehiclesData.content
          ? vehiclesData.content.length
          : vehiclesData.totalElements || 0;
        console.log("📊 Total vehicles calculated:", totalVehicles);
      } else {
        console.log("❌ Vehicles API failed:", vehiclesRes);
      }

      // Parts
      if (partsRes.status === "fulfilled" && partsRes.value.ok) {
        const partsData = await partsRes.value.json();
        console.log("📊 Parts API response:", partsData);
        totalParts = Array.isArray(partsData)
          ? partsData.length
          : partsData.content
          ? partsData.content.length
          : partsData.totalElements || 0;
        console.log("📊 Total parts calculated:", totalParts);
      } else {
        console.log("❌ Parts API failed:", partsRes);
      }

      // Warranty Claims
      if (claimsRes.status === "fulfilled" && claimsRes.value.ok) {
        const claimsData = await claimsRes.value.json();
        console.log("📊 Claims API response:", claimsData);
        const claims = Array.isArray(claimsData)
          ? claimsData
          : claimsData.content
          ? claimsData.content
          : [];

        totalClaims = claims.length;
        pendingClaims = claims.filter(
          (claim) =>
            claim.status === "SUBMITTED" ||
            claim.status === "PENDING" ||
            claim.status === "IN_PROGRESS"
        ).length;
        completedClaims = claims.filter(
          (claim) => claim.status === "COMPLETED" || claim.status === "APPROVED"
        ).length;
        console.log("📊 Claims stats:", {
          totalClaims,
          pendingClaims,
          completedClaims,
        });
      } else {
        console.log("❌ Claims API failed:", claimsRes);
      }

      // Cập nhật stats với dữ liệu thực từ API
      setStats({
        totalCustomers,
        totalVehicles,
        totalParts,
        totalClaims,
        pendingClaims,
        completedClaims,
      });

      console.log("📊 Dashboard stats loaded from API:", {
        totalCustomers,
        totalVehicles,
        totalParts,
        totalClaims,
        pendingClaims,
        completedClaims,
      });
    } catch (err) {
      console.error("❌ Dashboard stats fetch error:", err);
      // Fallback to mock data nếu API lỗi
      setStats({
        totalCustomers: 156,
        totalVehicles: 89,
        totalParts: 342,
        totalClaims: 67,
        pendingClaims: 12,
        completedClaims: 45,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "https://backend.bluecloudk.xyz";

      // Lấy recent activity từ API
      const [customersRes, claimsRes, vehiclesRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/customers?sort=createdAt,desc&size=2`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${API_BASE_URL}/api/warranty-claims?sort=createdAt,desc&size=2`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(`${API_BASE_URL}/api/vehicles?sort=createdAt,desc&size=2`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const activities = [];

      // Recent customers
      if (customersRes.status === "fulfilled" && customersRes.value.ok) {
        const customersData = await customersRes.value.json();
        const customers = Array.isArray(customersData)
          ? customersData
          : customersData.content
          ? customersData.content
          : [];

        customers.forEach((customer, index) => {
          activities.push({
            id: `customer-${customer.id}`,
            type: "customer",
            action: `Khách hàng mới đăng ký: ${
              customer.username || customer.name || "Unknown"
            }`,
            time: formatTimeAgo(customer.createdAt),
            icon: <FaUsers />,
          });
        });
      }

      // Recent claims
      if (claimsRes.status === "fulfilled" && claimsRes.value.ok) {
        const claimsData = await claimsRes.value.json();
        const claims = Array.isArray(claimsData)
          ? claimsData
          : claimsData.content
          ? claimsData.content
          : [];

        claims.forEach((claim, index) => {
          activities.push({
            id: `claim-${claim.id}`,
            type: "claim",
            action: `Warranty claim mới: ${
              claim.description || claim.issue || "Unknown issue"
            }`,
            time: formatTimeAgo(claim.createdAt),
            icon: <FaClipboardList />,
          });
        });
      }

      // Recent vehicles
      if (vehiclesRes.status === "fulfilled" && vehiclesRes.value.ok) {
        const vehiclesData = await vehiclesRes.value.json();
        const vehicles = Array.isArray(vehiclesData)
          ? vehiclesData
          : vehiclesData.content
          ? vehiclesData.content
          : [];

        vehicles.forEach((vehicle, index) => {
          activities.push({
            id: `vehicle-${vehicle.id}`,
            type: "vehicle",
            action: `Xe điện mới đăng ký: ${vehicle.vin || "Unknown VIN"}`,
            time: formatTimeAgo(vehicle.createdAt),
            icon: <FaCar />,
          });
        });
      }

      // Sắp xếp theo thời gian và lấy 4 hoạt động gần nhất
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 4));

      console.log("📈 Recent activity loaded from API:", activities);
    } catch (err) {
      console.error("❌ Recent activity fetch error:", err);
      // Fallback to mock data
      setRecentActivity([
        {
          id: 1,
          type: "customer",
          action: "Khách hàng mới đăng ký: Nguyễn Văn A",
          time: "2 phút trước",
          icon: <FaUsers />,
        },
        {
          id: 2,
          type: "claim",
          action: "Warranty claim mới: Battery replacement",
          time: "15 phút trước",
          icon: <FaClipboardList />,
        },
        {
          id: 3,
          type: "vehicle",
          action: "Xe mới được đăng ký: Tesla Model Y",
          time: "1 giờ trước",
          icon: <FaCar />,
        },
        {
          id: 4,
          type: "service",
          action: "Service hoàn tất: Maintenance xe VIN-123",
          time: "2 giờ trước",
          icon: <FaHistory />,
        },
      ]);
    }
  };

  // Helper function để format thời gian
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Unknown time";

    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  // Styles
  const containerStyle = {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0b6b61 0%, #0f766e 40%, #1e293b 100%)",
    padding: "28px",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    color: "white",
    padding: "30px 40px",
    borderRadius: "16px",
    marginBottom: "24px",
    boxShadow: "0 14px 40px rgba(2,44,40,0.25)",
    border: "1px solid rgba(255,255,255,0.15)",
    backdropFilter: "blur(6px)",
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  };

  const statCardStyle = {
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 6px 24px rgba(2,44,40,0.08)",
    transition: "all 0.25s ease",
    border: "1px solid #e5e7eb",
  };

  const layoutStyle = {
    display: "flex",
    gap: "18px",
  };

  const sidebarStyle = {
    width: isCollapsed ? 72 : 260,
    minWidth: isCollapsed ? 72 : 240,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    padding: 16,
    height: "fit-content",
    position: "sticky",
    top: 16,
    alignSelf: "flex-start",
  };

  const navItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    color: "#1f2937",
    cursor: "pointer",
  };

  const contentStyle = { flex: 1 };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "10px",
          }}
        >
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
              transition: "all 0.3s",
            }}
          >
            <FaArrowLeft /> Trang chủ
          </button>
          <h1
            style={{
              fontSize: "32px",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <FaUserShield /> Admin Dashboard
          </h1>
        </div>
        <p style={{ opacity: 0.9, fontSize: "16px", margin: 0 }}>
          🔐 ADMIN - Full access to all system resources and management
          functions
        </p>
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "10px 15px",
            borderRadius: "6px",
            marginTop: "15px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          📡 API Access: All endpoints | 🎯 Permissions: CRUD on all resources |
          🛡️ Special: DELETE operations
        </div>
      </div>

      <div style={layoutStyle}>
        {/* Sidebar */}
        <aside style={sidebarStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "space-between",
              marginBottom: 12,
            }}
          >
            {!isCollapsed && (
              <h3 style={{ margin: 0, color: "#1f2937" }}>Điều hướng</h3>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => setIsCollapsed((v) => !v)}
              style={{ padding: "6px 10px" }}
              title={isCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isCollapsed ? ">>" : "<<"}
            </button>
          </div>
          <div
            onClick={() => navigate("/admin/dashboard")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/dashboard" ? "#eef2ff" : "#f8fafc",
              fontWeight: currentPath === "/admin/dashboard" ? 700 : 500,
            }}
          >
            <FaTachometerAlt />
            {!isCollapsed && <span>Dashboard</span>}
          </div>
          <div
            onClick={() => navigate("/admin/customers")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/customers" ? "#eef2ff" : undefined,
              fontWeight: currentPath === "/admin/customers" ? 700 : 500,
            }}
          >
            <FaUsers /> {!isCollapsed && <span>Khách hàng</span>}
          </div>
          <div
            onClick={() => navigate("/admin/vehicles")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/vehicles" ? "#eef2ff" : undefined,
              fontWeight: currentPath === "/admin/vehicles" ? 700 : 500,
            }}
          >
            <FaCar /> {!isCollapsed && <span>Xe điện</span>}
          </div>
          <div
            onClick={() => navigate("/admin/parts")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/parts" ? "#eef2ff" : undefined,
              fontWeight: currentPath === "/admin/parts" ? 700 : 500,
            }}
          >
            <FaCogs /> {!isCollapsed && <span>Phụ tùng</span>}
          </div>
          <div
            onClick={() => navigate("/admin/feedback")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/feedback" ? "#eef2ff" : undefined,
              fontWeight: currentPath === "/admin/feedback" ? 700 : 500,
            }}
          >
            <FaClipboardList /> {!isCollapsed && <span>Feedback</span>}
          </div>
          <div
            onClick={() => navigate("/admin/service-centers")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/service-centers"
                  ? "#eef2ff"
                  : undefined,
              fontWeight: currentPath === "/admin/service-centers" ? 700 : 500,
            }}
          >
            <FaCogs /> {!isCollapsed && <span>Trung tâm dịch vụ</span>}
          </div>
          <div
            onClick={() => navigate("/admin/warranty-claims")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/warranty-claims"
                  ? "#eef2ff"
                  : undefined,
              fontWeight: currentPath === "/admin/warranty-claims" ? 700 : 500,
            }}
          >
            <FaClipboardList /> {!isCollapsed && <span>Warranty Claims</span>}
          </div>
          <div
            onClick={() => navigate("/admin/part-requests")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/part-requests" ? "#eef2ff" : undefined,
              fontWeight: currentPath === "/admin/part-requests" ? 700 : 500,
            }}
          >
            <FaCogs /> {!isCollapsed && <span>Yêu cầu phụ tùng</span>}
          </div>
          <div
            onClick={() => navigate("/admin/service-histories")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/service-histories"
                  ? "#eef2ff"
                  : undefined,
              fontWeight:
                currentPath === "/admin/service-histories" ? 700 : 500,
            }}
          >
            <FaHistory /> {!isCollapsed && <span>Lịch sử dịch vụ</span>}
          </div>
          <div
            onClick={() => navigate("/admin/users")}
            style={{
              ...navItemStyle,
              background:
                currentPath === "/admin/users" ? "#eef2ff" : undefined,
              fontWeight: currentPath === "/admin/users" ? 700 : 500,
            }}
          >
            <FaUserShield /> {!isCollapsed && <span>Users & Roles</span>}
          </div>
          <div style={{ height: 1, background: "#e5e7eb", margin: "10px 0" }} />
          <h4 style={{ margin: "10px 0", color: "#334155", fontSize: 13 }}>
            Liên quan
          </h4>
          <div
            onClick={() => navigate("/evmstaff/dashboard")}
            style={navItemStyle}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: "#0ea5e9",
              }}
            />
            <span>EVM Staff</span>
          </div>
          <div
            onClick={() => navigate("/scstaff/dashboard")}
            style={navItemStyle}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: "#10b981",
              }}
            />
            <span>SC Staff</span>
          </div>
          <div
            onClick={() => navigate("/sctechnician/dashboard")}
            style={navItemStyle}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: "#22c55e",
              }}
            />
            <span>SC Technician</span>
          </div>
        </aside>

        {/* Main content */}
        <main style={contentStyle}>
          {/* Stats Cards */}
          <div style={statsGridStyle}>
            {[
              {
                title: "Tổng Khách hàng",
                value: stats.totalCustomers,
                icon: <FaUsers />,
                color: "#3b82f6",
              },
              {
                title: "Tổng Xe điện",
                value: stats.totalVehicles,
                icon: <FaCar />,
                color: "#10b981",
              },
              {
                title: "Tổng Phụ tùng",
                value: stats.totalParts,
                icon: <FaCogs />,
                color: "#f59e0b",
              },
              {
                title: "Claims đang xử lý",
                value: stats.pendingClaims,
                icon: <FaClipboardList />,
                color: "#ef4444",
              },
              {
                title: "Claims hoàn tất",
                value: stats.completedClaims,
                icon: <FaClipboardList />,
                color: "#10b981",
              },
              {
                title: "Tổng Claims",
                value: stats.totalClaims,
                icon: <FaChartBar />,
                color: "#8b5cf6",
              },
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  ...statCardStyle,
                  borderLeft: `4px solid ${stat.color}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: "0 0 5px 0",
                        color: "#374151",
                        fontSize: "14px",
                      }}
                    >
                      {stat.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: stat.color,
                      }}
                    >
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                  <div
                    style={{
                      fontSize: "40px",
                      color: stat.color,
                      opacity: 0.7,
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "25px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaHistory /> Hoạt động Gần đây
            </h3>

            {recentActivity.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      padding: "12px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      transition: "all 0.3s",
                    }}
                  >
                    <div style={{ fontSize: "20px", color: "#6b7280" }}>
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          color: "#374151",
                          fontSize: "14px",
                        }}
                      >
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
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                Chưa có hoạt động nào
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "25px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Tạo Customer mới", icon: <FaPlus />, color: "#3b82f6" },
              { label: "Xuất báo cáo", icon: <FaDownload />, color: "#10b981" },
              {
                label: "Xem Analytics",
                icon: <FaChartBar />,
                color: "#f59e0b",
              },
              { label: "Cài đặt System", icon: <FaCogs />, color: "#8b5cf6" },
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
                  transition: "all 0.3s",
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
        </main>
      </div>
    </div>
  );
}
