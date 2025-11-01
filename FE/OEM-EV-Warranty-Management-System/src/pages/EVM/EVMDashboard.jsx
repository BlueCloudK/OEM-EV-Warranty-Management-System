import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEVMDashboard } from '../../hooks/useEVMDashboard';
import * as S from './EVMDashboard.styles';
import {
  FaTachometerAlt, FaClipboardCheck, FaCogs, FaCar, FaUsers, FaHistory,
  FaArrowRight, FaBoxes, FaExclamationTriangle, FaCheckCircle, FaClipboardList, FaSpinner
} from 'react-icons/fa';

const iconMap = {
  FaClipboardList: <FaClipboardList />,
  FaBoxes: <FaBoxes />,
  FaCar: <FaCar />,
};

const StatCard = ({ value, label, icon, color, bgGradient, loading }) => (
  <S.Card $bgGradient={bgGradient} $color={color}>
    <div style={{ 
      position: "relative",
      zIndex: 2
    }}>
      <div style={{ 
        width: 56, 
        height: 56, 
        borderRadius: 16, 
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)`,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        color: "#ffffff",
        boxShadow: `
          0 4px 12px rgba(0, 0, 0, 0.1),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset,
          0 0 24px ${color}40
        `,
        position: "relative",
        overflow: "hidden",
        marginBottom: 20
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${color}40 0%, transparent 100%)`,
          opacity: 0.6
        }} />
        <div style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))" }}>
          {icon}
        </div>
      </div>
      <div style={{ 
        fontSize: 36, 
        fontWeight: 800, 
        color: "#ffffff",
        textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        letterSpacing: "-1px",
        marginBottom: 8
      }}>
        {loading ? '...' : value}
      </div>
      <div style={{ 
        fontSize: 15, 
        color: "rgba(255, 255, 255, 0.85)", 
        fontWeight: 500,
        textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)"
      }}>
        {label}
      </div>
    </div>
  </S.Card>
);

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

export default function EVMDashboard() {
  const navigate = useNavigate();
  const { stats, recentActivity, loading, error } = useEVMDashboard();

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

  const statItems = [
    { value: stats.totalVehicles, label: 'Tổng xe quản lý', icon: <FaCar size={24} />, color: '#3b82f6', bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)' },
    { value: stats.totalParts, label: 'Tổng phụ tùng', icon: <FaCogs size={24} />, color: '#10b981', bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)' },
    { value: stats.pendingClaims, label: 'Claims chờ duyệt', icon: <FaClipboardCheck size={24} />, color: '#f59e0b', bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)' },
    { value: stats.approvedClaims, label: 'Claims đã duyệt', icon: <FaCheckCircle size={24} />, color: '#8b5cf6', bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)' },
    { value: stats.pendingPartRequests, label: 'Yêu cầu phụ tùng', icon: <FaBoxes size={24} />, color: '#ef4444', bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)' },
    { value: stats.pendingRecalls, label: 'Recall chờ duyệt', icon: <FaExclamationTriangle size={24} />, color: '#ec4899', bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)' },
  ];

  const managementCards = [
    { id: 1, title: "Duyệt Yêu cầu Bảo hành", description: "Xem và duyệt các yêu cầu bảo hành từ trung tâm dịch vụ", icon: <FaClipboardCheck size={28} />, color: "#f59e0b", bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)", path: "/evmstaff/warranty-claims" },
    { id: 2, title: "Quản lý Phụ tùng", description: "Tạo, cập nhật và quản lý danh mục phụ tùng", icon: <FaCogs size={28} />, color: "#10b981", bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)", path: "/evmstaff/parts" },
    { id: 3, title: "Quản lý Xe", description: "Xem, tạo, cập nhật và xóa thông tin xe", icon: <FaCar size={28} />, color: "#3b82f6", bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)", path: "/evmstaff/vehicles" },
    { id: 4, title: "Yêu cầu Phụ tùng", description: "Xử lý yêu cầu phụ tùng từ kỹ thuật viên", icon: <FaBoxes size={28} />, color: "#ef4444", bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)", path: "/evmstaff/part-requests" },
    { id: 5, title: "Quản lý Recall", description: "Tạo và quản lý các yêu cầu thu hồi phụ tùng", icon: <FaExclamationTriangle size={28} />, color: "#ec4899", bgGradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)", path: "/evmstaff/recalls" },
  ];

  return (
    <S.DashboardContainer>
      <S.HeaderTitle><FaTachometerAlt /> Dashboard EVM Staff</S.HeaderTitle>

      {error && (
        <S.ErrorMessage>
          Không thể tải dữ liệu: {error}
        </S.ErrorMessage>
      )}

      {/* Statistics Section */}
      <S.StatsContainer>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 20, 
          marginBottom: 32 
        }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: 16, 
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)`,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1), 0 0 24px rgba(59, 130, 246, 0.3)"
          }}>
            <FaTachometerAlt size={24} style={{ filter: "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))" }} />
          </div>
          <div>
            <div style={{ 
              fontSize: 28, 
              fontWeight: 800, 
              color: "#ffffff",
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
              letterSpacing: "-0.5px",
              marginBottom: 4
            }}>
              Thống kê hoạt động
            </div>
            <div style={{ 
              fontSize: 16, 
              color: "rgba(255, 255, 255, 0.85)",
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)"
            }}>
              Tổng quan các số liệu quan trọng
            </div>
          </div>
        </div>
        <S.StatsGrid>
          {statItems.map((s, idx) => <StatCard key={idx} {...s} loading={loading} />)}
        </S.StatsGrid>
      </S.StatsContainer>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ 
            fontSize: '32px', 
            fontWeight: 800, 
            color: '#ffffff', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.3)"
          }}>
            <FaHistory /> Hoạt động Gần đây
          </h3>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px', 
            padding: '24px', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}>
            {recentActivity.map((activity) => (
              <div key={activity.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '14px', 
                marginBottom: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
                }}>
                  {iconMap[activity.icon]}
                </div>
                <div style={{ 
                  flex: 1,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '15px',
                  fontWeight: 500,
                  textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)"
                }}>
                  {activity.action}
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)"
                }}>
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Management Cards */}
      <S.HeaderTitle style={{ fontSize: '32px', marginTop: '24px', marginBottom: '32px' }}>
        Truy cập nhanh
      </S.HeaderTitle>
      <S.ManagementCardGrid>
        {managementCards.map((card) => <ManagementCard key={card.id} card={card} onNavigate={navigate} />)}
      </S.ManagementCardGrid>
    </S.DashboardContainer>
  );
}
