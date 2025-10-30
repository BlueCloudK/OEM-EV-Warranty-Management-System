import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEVMDashboard } from '../../hooks/useEVMDashboard';
import * as S from './EVMDashboard.styles';
import {
  FaTachometerAlt, FaClipboardCheck, FaCogs, FaCar, FaUsers, FaHistory,
  FaArrowRight, FaBoxes, FaExclamationTriangle, FaCheckCircle, FaClipboardList
} from 'react-icons/fa';

const iconMap = {
  FaClipboardList: <FaClipboardList />,
  FaBoxes: <FaBoxes />,
  FaCar: <FaCar />,
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
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: card.color, boxShadow: `0 8px 16px ${card.color}20` }}>{card.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{card.title}</div>
        <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.4 }}>{card.description}</div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Truy cập ngay</div>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: card.color, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}><FaArrowRight size={14} /></div>
    </div>
  </S.Card>
);

export default function EVMDashboard() {
  const navigate = useNavigate();
  const { stats, recentActivity, loading } = useEVMDashboard();

  const statItems = [
    { value: stats.totalVehicles, label: 'Tổng xe quản lý', icon: <FaCar size={18} />, color: '#3b82f6', bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' },
    { value: stats.totalParts, label: 'Tổng phụ tùng', icon: <FaCogs size={18} />, color: '#10b981', bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' },
    { value: stats.pendingClaims, label: 'Claims chờ duyệt', icon: <FaClipboardCheck size={18} />, color: '#f59e0b', bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
    { value: stats.approvedClaims, label: 'Claims đã duyệt', icon: <FaCheckCircle size={18} />, color: '#8b5cf6', bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' },
    { value: stats.pendingPartRequests, label: 'Yêu cầu phụ tùng', icon: <FaBoxes size={18} />, color: '#ef4444', bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' },
    { value: stats.pendingRecalls, label: 'Recall chờ duyệt', icon: <FaExclamationTriangle size={18} />, color: '#ec4899', bgGradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' },
  ];

  const managementCards = [
    { id: 1, title: "Duyệt Yêu cầu Bảo hành", description: "Xem và duyệt các yêu cầu bảo hành từ trung tâm dịch vụ", icon: <FaClipboardCheck size={24} />, color: "#f59e0b", bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", path: "/evmstaff/warranty-claims" },
    { id: 2, title: "Quản lý Phụ tùng", description: "Tạo, cập nhật và quản lý danh mục phụ tùng", icon: <FaCogs size={24} />, color: "#10b981", bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", path: "/evmstaff/parts" },
    { id: 3, title: "Quản lý Xe", description: "Xem, tạo, cập nhật và xóa thông tin xe", icon: <FaCar size={24} />, color: "#3b82f6", bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", path: "/evmstaff/vehicles" },
    { id: 4, title: "Yêu cầu Phụ tùng", description: "Xử lý yêu cầu phụ tùng từ kỹ thuật viên", icon: <FaBoxes size={24} />, color: "#ef4444", bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", path: "/evmstaff/part-requests" },
    { id: 5, title: "Quản lý Recall", description: "Tạo và quản lý các yêu cầu thu hồi phụ tùng", icon: <FaExclamationTriangle size={24} />, color: "#ec4899", bgGradient: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)", path: "/evmstaff/recalls" },
  ];

  return (
    <S.DashboardContainer>
      <S.HeaderTitle><FaTachometerAlt /> Dashboard EVM Staff</S.HeaderTitle>

      {/* Statistics Section */}
      <S.StatsContainer>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><FaTachometerAlt size={18} /></div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Thống kê hoạt động</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>Tổng quan các số liệu quan trọng</div>
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
            <FaHistory /> Hoạt động Gần đây
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
