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

        <S.ChartContainer>
            <h3>Tổng quan Hệ thống</h3>
            <ResponsiveContainer width="100%" height={250}>
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
        <h3>Trạng thái Yêu cầu Bảo hành</h3>
        <div style={{ padding: '20px' }}>
          {(() => {
            const total = chartData.claimsStatusChart.reduce((sum, item) => sum + item.value, 0);

            return (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Tổng quan trạng thái</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    Tổng: {total} yêu cầu
                  </div>
                </div>

                <div style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                }}>
                  {chartData.claimsStatusChart.map((item, idx) => {
                    const percent = total > 0 ? (item.value / total) * 100 : 0;
                    return item.value > 0 ? (
                      <div
                        key={idx}
                        style={{
                          width: `${percent}%`,
                          backgroundColor: item.fill,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'width 0.3s ease'
                        }}
                        title={`${item.name}: ${item.value}`}
                      >
                        {percent > 8 && `${item.value}`}
                      </div>
                    ) : null;
                  })}
                </div>

                <div style={{ display: 'flex', gap: '24px', marginTop: '14px', fontSize: '14px', flexWrap: 'wrap' }}>
                  {chartData.claimsStatusChart.map((item, idx) => {
                    const percent = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', backgroundColor: item.fill, borderRadius: '3px' }}></div>
                        <span style={{ color: '#6b7280' }}>{item.name}: <strong style={{ color: '#1f2937' }}>{item.value}</strong> ({percent.toFixed(1)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </S.ChartContainer>

      <S.ChartContainer>
        <h3>Tiến độ Chiến dịch Recall</h3>
        <div style={{ padding: '20px' }}>
          {chartData.recallProgressChart && chartData.recallProgressChart.length > 0 ? (
            chartData.recallProgressChart.map((campaign, index) => {
              const total = campaign.total || 0;
              const completedPercent = total > 0 ? (campaign.completed / total) * 100 : 0;
              const notifiedPercent = total > 0 ? (campaign.notified / total) * 100 : 0;
              const pendingPercent = total > 0 ? (campaign.pending / total) * 100 : 0;

              return (
                <div key={index} style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{campaign.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      Tổng: {total} xe bị ảnh hưởng
                    </div>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '32px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                  }}>
                    {campaign.completed > 0 && (
                      <div
                        style={{
                          width: `${completedPercent}%`,
                          backgroundColor: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'width 0.3s ease'
                        }}
                        title={`Đã xác nhận: ${campaign.completed}`}
                      >
                        {completedPercent > 10 && `${campaign.completed}`}
                      </div>
                    )}
                    {campaign.notified > 0 && (
                      <div
                        style={{
                          width: `${notifiedPercent}%`,
                          backgroundColor: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'width 0.3s ease'
                        }}
                        title={`Đã thông báo: ${campaign.notified}`}
                      >
                        {notifiedPercent > 10 && `${campaign.notified}`}
                      </div>
                    )}
                    {campaign.pending > 0 && (
                      <div
                        style={{
                          width: `${pendingPercent}%`,
                          backgroundColor: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'width 0.3s ease'
                        }}
                        title={`Chưa xử lý: ${campaign.pending}`}
                      >
                        {pendingPercent > 10 && `${campaign.pending}`}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px' }}></div>
                      <span style={{ color: '#6b7280' }}>Đã xác nhận: <strong style={{ color: '#1f2937' }}>{campaign.completed}</strong> ({completedPercent.toFixed(1)}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '3px' }}></div>
                      <span style={{ color: '#6b7280' }}>Đã thông báo: <strong style={{ color: '#1f2937' }}>{campaign.notified}</strong> ({notifiedPercent.toFixed(1)}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '3px' }}></div>
                      <span style={{ color: '#6b7280' }}>Chưa xử lý: <strong style={{ color: '#1f2937' }}>{campaign.pending}</strong> ({pendingPercent.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p>Chưa có chiến dịch recall nào</p>
            </div>
          )}
        </div>
      </S.ChartContainer>

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
