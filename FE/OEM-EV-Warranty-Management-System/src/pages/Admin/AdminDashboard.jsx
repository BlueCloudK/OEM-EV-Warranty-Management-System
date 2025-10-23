import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import * as S from "./AdminDashboard.styles";
import {
  FaUsers, FaCar, FaCogs, FaClipboardList, FaHistory, 
  FaUserShield, FaTachometerAlt, FaArrowLeft, FaChartBar
} from "react-icons/fa";

const iconMap = {
  FaUsers: <FaUsers />,
  FaCar: <FaCar />,
  FaClipboardList: <FaClipboardList />,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { stats, loading, recentActivity } = useAdminDashboard();

  const statItems = [
    { title: "Tổng Khách hàng", value: stats.totalCustomers, icon: <FaUsers />, color: "#3b82f6" },
    { title: "Tổng Xe điện", value: stats.totalVehicles, icon: <FaCar />, color: "#10b981" },
    { title: "Tổng Phụ tùng", value: stats.totalParts, icon: <FaCogs />, color: "#f59e0b" },
    { title: "Claims đang xử lý", value: stats.pendingClaims, icon: <FaClipboardList />, color: "#ef4444" },
    { title: "Claims hoàn tất", value: stats.completedClaims, icon: <FaClipboardList />, color: "#10b981" },
    { title: "Tổng Claims", value: stats.totalClaims, icon: <FaChartBar />, color: "#8b5cf6" },
  ];

  const navItems = [
    { path: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/admin/customers", icon: <FaUsers />, label: "Khách hàng" },
    { path: "/admin/vehicles", icon: <FaCar />, label: "Xe điện" },
    { path: "/admin/parts", icon: <FaCogs />, label: "Phụ tùng" },
    { path: "/admin/warranty-claims", icon: <FaClipboardList />, label: "Warranty Claims" },
    { path: "/admin/service-histories", icon: <FaHistory />, label: "Lịch sử dịch vụ" },
    { path: "/admin/users", icon: <FaUserShield />, label: "Users & Roles" },
  ];

  return (
    <S.Container>
      <S.Header>
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
          <S.BackButton onClick={() => navigate("/")}><FaArrowLeft /> Trang chủ</S.BackButton>
          <S.HeaderTitle><FaUserShield /> Admin Dashboard</S.HeaderTitle>
        </div>
        <S.HeaderSubtitle>Full access to all system resources and management functions</S.HeaderSubtitle>
      </S.Header>

      <S.Layout>
        <S.Sidebar $isCollapsed={isCollapsed}>
          <button onClick={() => setIsCollapsed(v => !v)}>{isCollapsed ? ">>" : "<<"}</button>
          {navItems.map(item => (
            <S.NavItem key={item.path} $active={currentPath === item.path} onClick={() => navigate(item.path)}>
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </S.NavItem>
          ))}
        </S.Sidebar>

        <S.MainContent>
          <S.StatsGrid>
            {statItems.map((stat, index) => (
              <S.StatCard key={index} $color={stat.color}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <S.StatCardTitle>{stat.title}</S.StatCardTitle>
                    <S.StatCardValue $color={stat.color}>{loading ? "..." : stat.value}</S.StatCardValue>
                  </div>
                  <div style={{ fontSize: "40px", color: stat.color, opacity: 0.7 }}>{stat.icon}</div>
                </div>
              </S.StatCard>
            ))}
          </S.StatsGrid>

          <S.RecentActivityContainer>
            <h3 style={{ margin: "0 0 20px 0" }}><FaHistory /> Hoạt động Gần đây</h3>
            {loading ? <p>Đang tải hoạt động...</p> : (
              recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} style={{ display: "flex", alignItems: "center", gap: "15px", padding: "12px", background: "#f9fafb", borderRadius: "8px", marginBottom: '10px' }}>
                    <div style={{ fontSize: "20px", color: "#6b7280" }}>{iconMap[activity.icon]}</div>
                    <div style={{ flex: 1 }}>{activity.action}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{activity.time}</div>
                  </div>
                ))
              ) : <p>Chưa có hoạt động nào</p>
            )}
          </S.RecentActivityContainer>
        </S.MainContent>
      </S.Layout>
    </S.Container>
  );
}
