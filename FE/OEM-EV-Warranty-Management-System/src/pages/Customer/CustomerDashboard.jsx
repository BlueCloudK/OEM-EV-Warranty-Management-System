import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomerDashboard } from '../../hooks/useCustomerDashboard';
import * as S from './CustomerDashboard.styles';
import {
  FaCar, FaShieldAlt, FaClipboardList, FaHistory, FaExclamationTriangle,
  FaBell, FaArrowRight, FaSpinner, FaMapMarkerAlt, FaTools,
  FaCheckCircle, FaClock
} from 'react-icons/fa';

const StatCard = ({ icon, value, label, color, bgGradient, loading, onClick, clickable = false }) => (
  <S.StatCard $bgGradient={bgGradient} $clickable={clickable} onClick={onClick}>
    <S.StatHeader $color={color}>
      <div className="icon">{icon}</div>
    </S.StatHeader>
    <S.StatValue $color={color}>{loading ? '...' : value}</S.StatValue>
    <S.StatLabel>{label}</S.StatLabel>
  </S.StatCard>
);

const ActionCard = ({ icon, title, description, color, bgGradient, onClick }) => (
  <S.ActionCard $bgGradient={bgGradient} onClick={onClick}>
    <S.ActionHeader $color={color}>
      <div className="icon">{icon}</div>
      <div style={{ flex: 1 }}>
        <S.ActionTitle>{title}</S.ActionTitle>
        <S.ActionDescription>{description}</S.ActionDescription>
      </div>
    </S.ActionHeader>
    <S.ActionFooter $color={color}>
      <span>Truy cập ngay</span>
      <div className="arrow"><FaArrowRight size={14} /></div>
    </S.ActionFooter>
  </S.ActionCard>
);

const AlertCard = ({ alert }) => (
  <S.AlertCard $type={alert.type}>
    <div className="icon">
      {alert.type === 'danger' && <FaExclamationTriangle />}
      {alert.type === 'warning' && <FaClock />}
      {alert.type === 'info' && <FaBell />}
      {alert.type === 'success' && <FaCheckCircle />}
    </div>
    <div className="content">
      <div className="title">{alert.title}</div>
      <div className="message">{alert.message}</div>
    </div>
  </S.AlertCard>
);

const iconMap = {
  FaClipboardList: <FaClipboardList />,
  FaExclamationTriangle: <FaExclamationTriangle />,
  FaCar: <FaCar />,
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, alerts, recentActivity, loading, error } = useCustomerDashboard();

  if (loading) {
    return (
      <S.LoadingContainer>
        <FaSpinner className="spinner" />
        <p>Đang tải dữ liệu...</p>
      </S.LoadingContainer>
    );
  }

  if (error) {
    return (
      <S.DashboardContainer>
        <S.EmptyState>
          <FaExclamationTriangle />
          <p>Không thể tải dữ liệu dashboard</p>
          <p style={{ fontSize: '14px' }}>{error}</p>
        </S.EmptyState>
      </S.DashboardContainer>
    );
  }

  const statItems = [
    {
      icon: <FaCar size={24} />,
      value: stats.totalVehicles,
      label: 'Tổng số xe',
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      onClick: () => navigate('/customer/vehicles'),
      clickable: true
    },
    {
      icon: <FaShieldAlt size={24} />,
      value: stats.activeWarranties,
      label: 'Bảo hành còn hạn',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    },
    {
      icon: <FaClipboardList size={24} />,
      value: stats.totalClaims,
      label: 'Tổng yêu cầu bảo hành',
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
      onClick: () => navigate('/customer/warranty-history'),
      clickable: true
    },
    {
      icon: <FaClock size={24} />,
      value: stats.pendingClaims,
      label: 'Đang xử lý',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      onClick: () => navigate('/customer/warranty-history'),
      clickable: true
    },
    {
      icon: <FaCheckCircle size={24} />,
      value: stats.completedServices,
      label: 'Đã hoàn thành',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    },
    {
      icon: <FaExclamationTriangle size={24} />,
      value: stats.pendingRecalls,
      label: 'Recall cần xác nhận',
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      onClick: () => navigate('/customer/recalls'),
      clickable: true
    },
  ];

  const quickActions = [
    {
      icon: <FaCar size={24} />,
      title: 'Xe của tôi',
      description: 'Xem danh sách xe và thông tin bảo hành',
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      onClick: () => navigate('/customer/vehicles')
    },
    {
      icon: <FaClipboardList size={24} />,
      title: 'Lịch sử Bảo hành',
      description: 'Theo dõi các yêu cầu bảo hành của bạn',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      onClick: () => navigate('/customer/warranty-history')
    },
    {
      icon: <FaExclamationTriangle size={24} />,
      title: 'Thông báo Recall',
      description: 'Xem các thông báo thu hồi phụ tùng',
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      onClick: () => navigate('/customer/recalls')
    },
    {
      icon: <FaMapMarkerAlt size={24} />,
      title: 'Trung tâm Dịch vụ',
      description: 'Tìm trung tâm dịch vụ gần bạn',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      onClick: () => navigate('/customer/service-centers')
    },
    {
      icon: <FaTools size={24} />,
      title: 'Phản hồi Dịch vụ',
      description: 'Đánh giá và phản hồi về dịch vụ',
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
      onClick: () => navigate('/customer/feedback')
    },
  ];

  return (
    <S.DashboardContainer>
      <S.WelcomeSection>
        <h1>Xin chào, {user?.customer?.fullName || user?.username}!</h1>
        <p>Chào mừng bạn đến với hệ thống quản lý bảo hành xe điện</p>
      </S.WelcomeSection>

      {/* Alerts */}
      {alerts.length > 0 && (
        <S.AlertsContainer>
          <S.SectionTitle>
            <FaBell /> Thông báo quan trọng
          </S.SectionTitle>
          {alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
        </S.AlertsContainer>
      )}

      {/* Statistics */}
      <S.StatsGrid>
        {statItems.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} />
        ))}
      </S.StatsGrid>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <S.SectionTitle>
            <FaHistory /> Hoạt động Gần đây
          </S.SectionTitle>
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

      {/* Quick Actions */}
      <S.SectionTitle>
        <FaArrowRight /> Truy cập nhanh
      </S.SectionTitle>
      <S.QuickActionsGrid>
        {quickActions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </S.QuickActionsGrid>
    </S.DashboardContainer>
  );
}
