import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSCTechnicianDashboard } from '../../hooks/useSCTechnicianDashboard';
import * as S from './SCTechnicianDashboard.styles';
import {
  FaTachometerAlt, FaClipboardCheck, FaWrench, FaHistory, FaCog,
  FaArrowRight, FaCheckCircle, FaSpinner as FaInProgress, FaCommentDots, FaTools
} from 'react-icons/fa';

const iconMap = {
  FaWrench: <FaWrench />,
  FaClipboardCheck: <FaClipboardCheck />,
};

const StatCard = ({ value, label, icon, color, bgGradient, loading }) => (
  <S.Card $bgGradient={bgGradient} $color={color}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: color, boxShadow: `0 4px 8px ${color}20` }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color }}>{loading ? '...' : value}</div>
    </div>
    <div style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{label}</div>
  </S.Card>
);

const ManagementCard = ({ card, onNavigate }) => (
  <S.Card $bgGradient={card.bgGradient} $color={card.color} onClick={() => onNavigate(card.path)}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: card.color, boxShadow: `0 8px 16px ${card.color}20` }}>
        {card.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{card.title}</div>
        <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.4 }}>{card.description}</div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Truy cập ngay</div>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: card.color, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FaArrowRight size={14} />
      </div>
    </div>
  </S.Card>
);

export default function SCTechnicianDashboard() {
  const navigate = useNavigate();
  const { stats, recentActivity, loading } = useSCTechnicianDashboard();

  const statItems = [
    { value: stats.assignedClaims, label: 'Công việc được giao', icon: <FaClipboardCheck size={18} />, color: '#f59e0b', bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
    { value: stats.inProgressClaims, label: 'Đang thực hiện', icon: <FaInProgress size={18} />, color: '#3b82f6', bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' },
    { value: stats.completedClaims, label: 'Đã hoàn thành', icon: <FaCheckCircle size={18} />, color: '#10b981', bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' },
    { value: stats.installedParts, label: 'Phụ tùng lắp đặt', icon: <FaCog size={18} />, color: '#8b5cf6', bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' },
  ];

  const managementCards = [
    { id: 1, title: "Công việc của tôi", description: "Quản lý các công việc sửa chữa đang thực hiện", icon: <FaWrench size={24} />, color: "#10b981", bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", path: "/sctechnician/my-work" },
    { id: 2, title: "Yêu cầu Linh kiện", description: "Gửi yêu cầu phụ tùng cần thiết cho công việc", icon: <FaTools size={24} />, color: "#ef4444", bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", path: "/sctechnician/part-requests" },
    { id: 3, title: "Feedback", description: "Xem và quản lý phản hồi từ khách hàng", icon: <FaCommentDots size={24} />, color: "#06b6d4", bgGradient: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)", path: "/sctechnician/feedbacks" },
    { id: 4, title: "Lịch sử Sửa chữa", description: "Xem lịch sử các công việc đã hoàn thành", icon: <FaHistory size={24} />, color: "#3b82f6", bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", path: "/sctechnician/service-history" },
    { id: 5, title: "Danh sách Phụ tùng", description: "Xem và tra cứu thông tin phụ tùng trong hệ thống", icon: <FaCog size={24} />, color: "#f59e0b", bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", path: "/sctechnician/parts" },
  ];

  return (
    <S.DashboardContainer>
      <S.HeaderTitle><FaTachometerAlt /> Dashboard Kỹ thuật viên</S.HeaderTitle>

      {/* Statistics Section */}
      <S.StatsContainer>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><FaTachometerAlt size={18} /></div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Thống kê công việc</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>Tổng quan các nhiệm vụ của bạn</div>
          </div>
        </div>
        <S.StatsGrid>
          {statItems.map((s, idx) => <StatCard key={idx} {...s} loading={loading} />)}
        </S.StatsGrid>
      </S.StatsContainer>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaHistory /> Công việc gần đây
          </h3>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
            {recentActivity.map((activity) => (
              <div key={activity.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: '#f9fafb', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ fontSize: '20px', color: '#6b7280' }}>{iconMap[activity.icon]}</div>
                <div style={{ flex: 1 }}>{activity.action}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Management Cards */}
      <S.ManagementCardGrid>
        {managementCards.map((card) => <ManagementCard key={card.id} card={card} onNavigate={navigate} />)}
      </S.ManagementCardGrid>
    </S.DashboardContainer>
  );
}
