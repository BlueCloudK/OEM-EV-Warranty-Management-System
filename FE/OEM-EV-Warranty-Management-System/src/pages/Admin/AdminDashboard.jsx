import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import * as S from "./AdminDashboard.styles";
import {
  FaUsers, FaCar, FaCogs, FaClipboardList, FaHistory, 
  FaChartBar
} from "react-icons/fa";

const iconMap = {
  FaUsers: <FaUsers />,
  FaCar: <FaCar />,
  FaClipboardList: <FaClipboardList />,
};

// Main Component with new Authentication Flow
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { stats, loading: dataLoading, recentActivity } = useAdminDashboard();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return <div>Đang kiểm tra xác thực...</div>;
  }

  const statItems = [
    { title: "Tổng Khách hàng", value: stats.totalCustomers, icon: <FaUsers />, color: "#3b82f6" },
    { title: "Tổng Xe điện", value: stats.totalVehicles, icon: <FaCar />, color: "#10b981" },
    { title: "Tổng Phụ tùng", value: stats.totalParts, icon: <FaCogs />, color: "#f59e0b" },
    { title: "Claims đang xử lý", value: stats.pendingClaims, icon: <FaClipboardList />, color: "#ef4444" },
    { title: "Claims hoàn tất", value: stats.completedClaims, icon: <FaClipboardList />, color: "#10b981" },
    { title: "Tổng Claims", value: stats.totalClaims, icon: <FaChartBar />, color: "#8b5cf6" },
  ];

  return (
    <>
      <S.StatsGrid>
        {statItems.map((stat, index) => (
          <S.StatCard key={index} $color={stat.color}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <S.StatCardTitle>{stat.title}</S.StatCardTitle>
                <S.StatCardValue $color={stat.color}>{dataLoading ? "..." : stat.value}</S.StatCardValue>
              </div>
              <div style={{ fontSize: "40px", color: stat.color, opacity: 0.7 }}>{stat.icon}</div>
            </div>
          </S.StatCard>
        ))}
      </S.StatsGrid>

      <S.RecentActivityContainer>
        <h3 style={{ margin: "0 0 20px 0" }}><FaHistory /> Hoạt động Gần đây</h3>
        {dataLoading ? <p>Đang tải hoạt động...</p> : (
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
    </>
  );
}
