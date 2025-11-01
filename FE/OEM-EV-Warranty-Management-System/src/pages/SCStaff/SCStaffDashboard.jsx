import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSCStaffDashboard } from "../../hooks/useSCStaffDashboard";
import * as S from "./SCStaffDashboard.styles";
import {
  FaUsers, FaCar, FaClipboardList, FaHistory, FaArrowRight, 
  FaUserCog, FaTachometerAlt, FaUserPlus, FaSpinner
} from "react-icons/fa";

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

// Main Component with new Authentication Flow
export default function SCStaffDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const { stats, loading: dataLoading, error: dataError } = useSCStaffDashboard();

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
    { value: stats.customers, label: 'Khách hàng', icon: <FaUsers size={24} />, color: '#3b82f6', bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)' },
    { value: stats.vehicles, label: 'Xe đăng ký', icon: <FaCar size={24} />, color: '#10b981', bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)' },
    { value: stats.submittedClaims, label: 'Yêu cầu chờ', icon: <FaClipboardList size={24} />, color: '#f59e0b', bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)' },
    { value: stats.completedServices, label: 'Dịch vụ hoàn thành', icon: <FaHistory size={24} />, color: '#8b5cf6', bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)' },
  ];

  const managementCards = [
    { id: 1, title: "Quản lý khách hàng", description: "Xem, tạo mới và cập nhật thông tin khách hàng", icon: <FaUserCog size={28} />, color: "#3b82f6", bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)", path: "/scstaff/customers" },
    { id: 2, title: "Quản lý thông tin xe", description: "Danh sách xe, thêm mới, cập nhật", icon: <FaCar size={28} />, color: "#10b981", bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)", path: "/scstaff/vehicles" },
    { id: 3, title: "Yêu cầu bảo hành", description: "Tiếp nhận và xử lý yêu cầu từ khách hàng", icon: <FaClipboardList size={28} />, color: "#f59e0b", bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)", path: "/scstaff/warranty-claims" },
    { id: 4, title: "Lịch sử dịch vụ", description: "Theo dõi dịch vụ & lịch sử sửa chữa", icon: <FaHistory size={28} />, color: "#8b5cf6", bgGradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)", path: "/scstaff/service-history" },
    { id: 5, title: "Tạo tài khoản khách hàng", description: "Tạo và quản lý tài khoản cho khách hàng mới", icon: <FaUserPlus size={28} />, color: "#ef4444", bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)", path: "/scstaff/create-customer-account" }
  ];

  return (
    <S.DashboardContainer>
      <S.HeaderTitle>
        <FaTachometerAlt /> Service Center Staff
      </S.HeaderTitle>

      {dataError && (
        <S.ErrorMessage>
          Không thể tải dữ liệu: {dataError}
        </S.ErrorMessage>
      )}

      <S.DashboardHeader>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: 28, 
            fontWeight: 800,
            color: "#ffffff",
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
            letterSpacing: "-0.5px",
            marginBottom: 8
          }}>
            Bảng điều khiển
          </h2>
          <p style={{ 
            margin: 0, 
            color: "rgba(255, 255, 255, 0.85)", 
            fontSize: 16,
            textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)"
          }}>
            Bảng điều khiển chuyên nghiệp để quản lý hoạt động của trung tâm dịch vụ.
          </p>
        </div>
      </S.DashboardHeader>

      <S.HeaderTitle style={{ fontSize: '32px', marginTop: '24px', marginBottom: '32px' }}>
        Truy cập nhanh
      </S.HeaderTitle>
      <S.ManagementCardGrid>
        {managementCards.map((card) => <ManagementCard key={card.id} card={card} onNavigate={navigate} />)}
      </S.ManagementCardGrid>

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
          {statItems.map((s, idx) => <StatCard key={idx} {...s} loading={dataLoading} />)}
        </S.StatsGrid>
      </S.StatsContainer>
    </S.DashboardContainer>
  );
}
