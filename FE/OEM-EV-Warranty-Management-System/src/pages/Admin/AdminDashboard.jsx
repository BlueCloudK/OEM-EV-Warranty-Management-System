import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import * as S from "./AdminDashboard.styles";
import {
  FaUsers, FaCar, FaCogs, FaClipboardList, FaHistory, 
  FaChartBar
} from "react-icons/fa";
import { Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const iconMap = {
  FaUsers: <FaUsers />,
  FaCar: <FaCar />,
  FaClipboardList: <FaClipboardList />,
};


// Main Component with new Authentication Flow
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { stats, chartData, loading: dataLoading, recentActivity } = useAdminDashboard();
  // Visual debug tag to verify new UI code is loaded
  console.debug("[AdminDashboard] UI v2 loaded");

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
    <S.DashboardWrapper>
      <S.StatsGrid>
        {statItems.map((stat, index) => (
          <S.StatCard key={index} $color={stat.color}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, boxShadow: `0 8px 18px ${stat.color}33`, fontSize: 22 }}>
                {stat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <S.StatCardTitle>{stat.title}</S.StatCardTitle>
                <S.StatCardValue $color={stat.color}>{dataLoading ? "..." : stat.value}</S.StatCardValue>
              </div>
            </div>
          </S.StatCard>
        ))}
      </S.StatsGrid>

      <S.ChartContainer>
        <S.SectionHeader>
          <S.SectionIntro>
            <h3>Tổng quan hệ thống</h3>
            <S.SectionSubtitle>Đếm dữ liệu theo tháng gần nhất</S.SectionSubtitle>
          </S.SectionIntro>
          <span style={{ padding: '6px 10px', background: '#ecfeff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>UI v2</span>
        </S.SectionHeader>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData.overviewChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name="Số lượng">
              {chartData.overviewChart.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </S.ChartContainer>

      <S.ChartContainer>
        <S.SectionHeader>
          <S.SectionIntro>
            <h3>Trạng thái yêu cầu bảo hành</h3>
            <S.SectionSubtitle>Theo tổng số yêu cầu hiện tại</S.SectionSubtitle>
          </S.SectionIntro>
          <S.SectionMeta>
            Tổng: {chartData.claimsStatusChart.reduce((sum, item) => sum + item.value, 0)} yêu cầu
          </S.SectionMeta>
        </S.SectionHeader>
        {(() => {
          const total = chartData.claimsStatusChart.reduce((sum, item) => sum + item.value, 0);
          return (
            <>
              <S.ProgressShell>
                {chartData.claimsStatusChart.map((item, idx) => {
                  const percent = total > 0 ? (item.value / total) * 100 : 0;
                  if (item.value === 0) return null;
                  return (
                    <S.ProgressSegment
                      key={idx}
                      $percent={percent}
                      $color={item.fill}
                      title={`${item.name}: ${item.value}`}
                    >
                      {percent > 8 && item.value}
                    </S.ProgressSegment>
                  );
                })}
              </S.ProgressShell>
              <S.LegendRow>
                {chartData.claimsStatusChart.map((item, idx) => {
                  const percent = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <S.LegendItem key={idx}>
                      <S.LegendSwatch $color={item.fill} />
                      <S.LegendText>
                        {item.name}: <strong>{item.value}</strong> ({percent.toFixed(1)}%)
                      </S.LegendText>
                    </S.LegendItem>
                  );
                })}
              </S.LegendRow>
            </>
          );
        })()}
      </S.ChartContainer>

      <S.RecentActivityContainer>
        <h3><FaHistory /> Hoạt động gần đây</h3>
        {dataLoading ? (
          <p>Đang tải hoạt động...</p>
        ) : recentActivity.length > 0 ? (
          <S.ActivityList>
            {recentActivity.map((activity) => (
              <S.ActivityItem key={activity.id}>
                <S.ActivityIcon>{iconMap[activity.icon]}</S.ActivityIcon>
                <S.ActivityContent>{activity.action}</S.ActivityContent>
                <S.ActivityTime>{activity.time}</S.ActivityTime>
              </S.ActivityItem>
            ))}
          </S.ActivityList>
        ) : (
          <p>Chưa có hoạt động nào</p>
        )}
      </S.RecentActivityContainer>
    </S.DashboardWrapper>
  );
}
