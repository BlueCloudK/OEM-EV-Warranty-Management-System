import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import * as S from "./AdminDashboard.styles";
import {
  FaUsers,
  FaCar,
  FaCogs,
  FaClipboardList,
  FaHistory,
  FaChartBar,
  FaTachometerAlt,
  FaSpinner,
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

  const { stats, loading: dataLoading, error: dataError, recentActivity } = useAdminDashboard();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <S.DashboardContainer>
        <S.LoadingContainer>
          <FaSpinner className="spinner" />
          <p>Đang kiểm tra xác thực...</p>
        </S.LoadingContainer>
      </S.DashboardContainer>
    );
  }

  const statItems = [
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
  ];

  return (
    <S.DashboardContainer>
      <S.HeaderTitle>
        <FaTachometerAlt /> Admin Dashboard
      </S.HeaderTitle>

      {dataError && (
        <S.ErrorMessage>
          Không thể tải dữ liệu: {dataError}
        </S.ErrorMessage>
      )}

      {/* Banner */}
      <S.Banner>
        <S.BannerTitle>Tổng quan hệ thống</S.BannerTitle>
        <S.BannerSubtitle>
            Theo dõi số liệu chính và hoạt động gần đây của toàn bộ hệ thống.
        </S.BannerSubtitle>
        <S.BannerButtons>
          <S.BannerButton onClick={() => navigate("/admin/users")}>
              Người dùng
          </S.BannerButton>
          <S.BannerButton onClick={() => navigate("/admin/warranty-claims")}>
              Claims
          </S.BannerButton>
          <S.BannerButton onClick={() => navigate("/admin/service-histories")}>
              Lịch sử dịch vụ
          </S.BannerButton>
        </S.BannerButtons>
      </S.Banner>

      {/* Statistics */}
      <S.StatsGrid>
        {statItems.map((stat, index) => (
          <S.StatCard key={index}>
            <S.StatCardIcon $color={stat.color}>{stat.icon}</S.StatCardIcon>
            <S.StatCardTitle>{stat.title}</S.StatCardTitle>
            <S.StatCardValue>
                    {dataLoading ? "…" : stat.value}
            </S.StatCardValue>
          </S.StatCard>
        ))}
      </S.StatsGrid>

      {/* Recent Activity */}
      <S.RecentActivityContainer>
        <S.RecentActivityTitle>
          <FaHistory /> Hoạt động Gần đây
        </S.RecentActivityTitle>
        {dataLoading ? (
          <S.EmptyState>Đang tải hoạt động...</S.EmptyState>
        ) : recentActivity.length > 0 ? (
          <S.ActivityList>
            {recentActivity.map((activity) => (
              <S.ActivityItem key={activity.id}>
                <S.ActivityIcon>{iconMap[activity.icon]}</S.ActivityIcon>
                <S.ActivityText>{activity.action}</S.ActivityText>
                <S.ActivityTime>{activity.time}</S.ActivityTime>
              </S.ActivityItem>
            ))}
          </S.ActivityList>
        ) : (
          <S.EmptyState>Chưa có hoạt động nào</S.EmptyState>
        )}
      </S.RecentActivityContainer>
    </S.DashboardContainer>
  );
}
