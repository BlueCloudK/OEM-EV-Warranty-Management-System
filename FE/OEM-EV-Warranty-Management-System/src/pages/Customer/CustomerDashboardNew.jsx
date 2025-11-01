import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomerDashboard } from '../../hooks/useCustomerDashboard';
import * as S from './CustomerDashboardNew.styles';
import {
  FaTachometerAlt, FaCar, FaHistory, FaClipboardList, FaUser, FaCommentDots, FaArrowRight,
  FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaClock, FaSpinner
} from 'react-icons/fa';

const ManagementCard = ({ card, onNavigate }) => (
  <S.Card $bgGradient={card.bgGradient} $color={card.color} onClick={() => onNavigate(card.path)}>
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: 20, 
      marginBottom: 24,
      position: "relative",
      zIndex: 2
    }}>
      <div style={{ 
        width: 72, 
        height: 72, 
        borderRadius: 20, 
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)`,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        color: "#ffffff",
        boxShadow: `
          0 8px 24px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset,
          0 0 40px ${card.color}40
        `,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${card.color}40 0%, transparent 100%)`,
          opacity: 0.6
        }} />
        <div style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))" }}>
        {card.icon}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: 22, 
          fontWeight: 700, 
          color: "#ffffff", 
          marginBottom: 8,
          textShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
          letterSpacing: "-0.3px"
        }}>
          {card.title}
        </div>
        <div style={{ 
          fontSize: 15, 
          color: "rgba(255, 255, 255, 0.85)", 
          lineHeight: 1.5,
          textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)"
        }}>
          {card.description}
        </div>
      </div>
    </div>
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      paddingTop: 20,
      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
      position: "relative",
      zIndex: 2
    }}>
      <div style={{ 
        fontSize: 15, 
        color: "rgba(255, 255, 255, 0.9)", 
        fontWeight: 600,
        textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
        letterSpacing: "0.3px"
      }}>
        Truy cập ngay →
      </div>
      <div style={{ 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
        color: "#ffffff", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        boxShadow: `
          0 4px 16px ${card.color}60,
          0 0 0 1px rgba(255, 255, 255, 0.2) inset
        `,
        transition: "all 0.3s ease",
        cursor: "pointer"
      }}>
        <FaArrowRight size={16} style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))" }} />
      </div>
    </div>
  </S.Card>
);

const StatCard = ({ icon, value, label, color, bgGradient, loading, onClick, clickable = false }) => (
  <S.StatCard 
    $bgGradient={bgGradient} 
    $clickable={clickable} 
    onClick={onClick}
  >
    <S.StatIcon $color={color}>
      {icon}
    </S.StatIcon>
    <S.StatValue>{loading ? '...' : value}</S.StatValue>
    <S.StatLabel>{label}</S.StatLabel>
  </S.StatCard>
);

export default function CustomerDashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading, error } = useCustomerDashboard();

  const statItems = [
    {
      icon: <FaCar size={24} />,
      value: stats.totalVehicles,
      label: 'Tổng số xe',
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
      onClick: () => navigate('/customer/my-vehicles'),
      clickable: true
    },
    {
      icon: <FaShieldAlt size={24} />,
      value: stats.activeWarranties,
      label: 'Bảo hành còn hạn',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
    },
    {
      icon: <FaClipboardList size={24} />,
      value: stats.totalClaims,
      label: 'Tổng yêu cầu bảo hành',
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
      onClick: () => navigate('/customer/warranty-history'),
      clickable: true
    },
    {
      icon: <FaCheckCircle size={24} />,
      value: stats.completedServices,
      label: 'Đã hoàn thành',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
    },
    {
      icon: <FaExclamationTriangle size={24} />,
      value: stats.pendingRecalls,
      label: 'Recall cần xác nhận',
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
      onClick: () => navigate('/customer/recalls'),
      clickable: true
    },
    {
      icon: <FaClock size={24} />,
      value: stats.pendingClaims,
      label: 'Đang xử lý',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
      onClick: () => navigate('/customer/warranty-history'),
      clickable: true
    },
  ];

  const managementCards = [
    { id: 1, title: "Xe của tôi", description: "Xem danh sách xe và thông tin chi tiết", icon: <FaCar size={28} />, color: "#3b82f6", bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)", path: "/customer/my-vehicles" },
    { id: 2, title: "Lịch sử Bảo hành", description: "Theo dõi lịch sử bảo dưỡng và sửa chữa", icon: <FaHistory size={28} />, color: "#10b981", bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)", path: "/customer/warranty-history" },
    // { id: 3, title: "Yêu cầu Bảo hành", description: "Xem và theo dõi yêu cầu bảo hành của bạn", icon: <FaClipboardList size={28} />, color: "#f59e0b", bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)", path: "/customer/warranty-claims" },
    { id: 4, title: "Phản hồi", description: "Gửi phản hồi về dịch vụ bảo hành", icon: <FaCommentDots size={28} />, color: "#8b5cf6", bgGradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)", path: "/customer/feedback" },
    { id: 5, title: "Thông tin cá nhân", description: "Quản lý thông tin tài khoản của bạn", icon: <FaUser size={28} />, color: "#ef4444", bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)", path: "/customer/profile" },
  ];

  if (loading) {
    return (
      <S.DashboardContainer>
        <S.LoadingContainer>
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </S.LoadingContainer>
      </S.DashboardContainer>
    );
  }

  return (
    <S.DashboardContainer>
      <S.HeaderTitle><FaTachometerAlt /> Dashboard Khách hàng</S.HeaderTitle>

      {error && (
        <S.ErrorMessage>
          Không thể tải dữ liệu: {error}
        </S.ErrorMessage>
      )}

      <S.WelcomeSection>
        <h1>Xin chào, {user?.customer?.fullName || user?.username || 'Khách hàng'}!</h1>
        <p>Chào mừng bạn đến với hệ thống quản lý bảo hành xe điện</p>
      </S.WelcomeSection>

      <S.StatsGrid>
        {statItems.map((stat, index) => (
          <StatCard 
            key={index} 
            {...stat} 
            loading={loading}
          />
        ))}
      </S.StatsGrid>

      <S.HeaderTitle style={{ fontSize: '32px', marginTop: '24px', marginBottom: '32px' }}>
        Truy cập nhanh
      </S.HeaderTitle>
      <S.ManagementCardGrid>
        {managementCards.map((card) => <ManagementCard key={card.id} card={card} onNavigate={navigate} />)}
      </S.ManagementCardGrid>
    </S.DashboardContainer>
  );
}
