import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSCTechnicianDashboard } from '../../hooks/useSCTechnicianDashboard';
import * as S from './SCTechnicianDashboard.styles';
import {
  FaTachometerAlt, FaClipboardCheck, FaWrench, FaHistory, FaCar, FaCog,
  FaArrowRight, FaCheckCircle, FaSpinner as FaInProgress, FaSpinner
} from 'react-icons/fa';

const iconMap = {
  FaWrench: <FaWrench />,
  FaClipboardCheck: <FaClipboardCheck />,
};

const StatCard = ({ value, label, icon, color, bgGradient, loading }) => (
  <S.Card $bgGradient={bgGradient} $color={color}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
      <div style={{ 
        width: 48, 
        height: 48, 
        borderRadius: 14, 
        background: "rgba(255, 255, 255, 0.9)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        color: color, 
        boxShadow: `0 8px 16px rgba(0, 0, 0, 0.15)` 
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 900, color: color, lineHeight: 1 }}>
          {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : value}
        </div>
        <div style={{ fontSize: 14, color: "#1e293b", fontWeight: 600, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  </S.Card>
);

const ManagementCard = ({ card, onNavigate }) => (
  <S.Card $bgGradient={card.bgGradient} $color={card.color} onClick={() => onNavigate(card.path)}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
      <div style={{ 
        width: 64, 
        height: 64, 
        borderRadius: 16, 
        background: "rgba(255, 255, 255, 0.9)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        color: card.color, 
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.15)` 
      }}>
        {card.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>{card.title}</div>
        <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.5 }}>{card.description}</div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
      <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>Truy cập ngay</div>
      <div style={{ 
        width: 40, 
        height: 40, 
        borderRadius: 12, 
        background: card.color, 
        color: "#ffffff", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        boxShadow: `0 4px 12px ${card.color}40`
      }}>
        <FaArrowRight size={16} />
      </div>
    </div>
  </S.Card>
);

export default function SCTechnicianDashboard() {
  const navigate = useNavigate();
  const { stats, recentActivity, loading, error } = useSCTechnicianDashboard();

  const statItems = [
    { value: stats.assignedClaims, label: 'Công việc được giao', icon: <FaClipboardCheck size={20} />, color: '#f59e0b', bgGradient: 'linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(253, 230, 138, 0.9) 100%)' },
    { value: stats.inProgressClaims, label: 'Đang thực hiện', icon: <FaInProgress size={20} />, color: '#3b82f6', bgGradient: 'linear-gradient(135deg, rgba(219, 234, 254, 0.9) 0%, rgba(191, 219, 254, 0.9) 100%)' },
    { value: stats.completedClaims, label: 'Đã hoàn thành', icon: <FaCheckCircle size={20} />, color: '#10b981', bgGradient: 'linear-gradient(135deg, rgba(209, 250, 229, 0.9) 0%, rgba(167, 243, 208, 0.9) 100%)' },
    { value: stats.installedParts, label: 'Phụ tùng lắp đặt', icon: <FaCog size={20} />, color: '#8b5cf6', bgGradient: 'linear-gradient(135deg, rgba(237, 233, 254, 0.9) 0%, rgba(221, 214, 254, 0.9) 100%)' },
  ];

  const managementCards = [
    { id: 1, title: "Yêu cầu Bảo hành", description: "Xem và xử lý các yêu cầu bảo hành được giao", icon: <FaClipboardCheck size={28} />, color: "#f59e0b", bgGradient: "linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(253, 230, 138, 0.9) 100%)", path: "/sctechnician/warranty-claims" },
    { id: 2, title: "Công việc của tôi", description: "Quản lý các công việc sửa chữa đang thực hiện", icon: <FaWrench size={28} />, color: "#10b981", bgGradient: "linear-gradient(135deg, rgba(209, 250, 229, 0.9) 0%, rgba(167, 243, 208, 0.9) 100%)", path: "/sctechnician/my-work" },
    { id: 3, title: "Lịch sử Sửa chữa", description: "Xem lịch sử các công việc đã hoàn thành", icon: <FaHistory size={28} />, color: "#3b82f6", bgGradient: "linear-gradient(135deg, rgba(219, 234, 254, 0.9) 0%, rgba(191, 219, 254, 0.9) 100%)", path: "/sctechnician/service-history" },
    { id: 4, title: "Tra cứu Xe", description: "Tìm kiếm thông tin xe và lịch sử bảo dưỡng", icon: <FaCar size={28} />, color: "#8b5cf6", bgGradient: "linear-gradient(135deg, rgba(237, 233, 254, 0.9) 0%, rgba(221, 214, 254, 0.9) 100%)", path: "/sctechnician/vehicles" },
    { id: 5, title: "Yêu cầu Phụ tùng", description: "Xem và quản lý yêu cầu phụ tùng", icon: <FaCog size={28} />, color: "#ef4444", bgGradient: "linear-gradient(135deg, rgba(254, 226, 226, 0.9) 0%, rgba(254, 202, 202, 0.9) 100%)", path: "/sctechnician/part-requests" },
  ];

  if (loading) {
    return (
      <S.LoadingContainer>
        <FaSpinner />
        <div>Đang tải dữ liệu...</div>
      </S.LoadingContainer>
    );
  }

  if (error) {
    return (
      <S.ErrorMessage>
        {error}
      </S.ErrorMessage>
    );
  }

  return (
    <S.DashboardContainer>
      <S.HeaderTitle><FaTachometerAlt /> Dashboard Kỹ thuật viên</S.HeaderTitle>

      {/* Statistics Section */}
      <S.StatsContainer>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ 
            width: 52, 
            height: 52, 
            borderRadius: 14, 
            background: "rgba(255, 255, 255, 0.9)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#1e293b",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)"
          }}>
            <FaTachometerAlt size={24} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1e293b" }}>Thống kê công việc</div>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Tổng quan các nhiệm vụ của bạn</div>
          </div>
        </div>
        <S.StatsGrid>
          {statItems.map((s, idx) => <StatCard key={idx} {...s} loading={loading} />)}
        </S.StatsGrid>
      </S.StatsContainer>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <S.Card style={{ marginBottom: '32px', background: 'rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
            <FaHistory /> Công việc gần đây
          </h3>
          <div>
            {recentActivity.map((activity) => (
              <div key={activity.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px', 
                marginBottom: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '24px', color: '#ffffff' }}>{iconMap[activity.icon]}</div>
                <div style={{ flex: 1, color: '#ffffff', fontWeight: 500 }}>{activity.action}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>{activity.time}</div>
              </div>
            ))}
          </div>
        </S.Card>
      )}

      {/* Management Cards */}
      <S.ManagementCardGrid>
        {managementCards.map((card) => <ManagementCard key={card.id} card={card} onNavigate={navigate} />)}
      </S.ManagementCardGrid>
    </S.DashboardContainer>
  );
}
