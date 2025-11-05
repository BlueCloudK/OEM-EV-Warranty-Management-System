import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import the master auth hook
import { useSCStaffDashboard } from "../../hooks/useSCStaffDashboard";
import * as S from "./SCStaffDashboard.styles";
import {
  FaUsers, FaCar, FaClipboardList, FaHistory, FaArrowRight, 
  FaUserCog, FaTachometerAlt, FaUserPlus, FaExclamationTriangle, FaCommentDots
} from "react-icons/fa";

// Child components remain the same...
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

// Main Component with new Authentication Flow
export default function SCStaffDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Data-fetching hook is now separate from auth logic
  const { stats, loading: dataLoading } = useSCStaffDashboard();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Render a loading screen while the AuthContext is verifying the user.
  if (authLoading) {
    return <div>Đang kiểm tra xác thực...</div>; 
  }

  // Data for cards
  const managementCards = [
    { id: 1, title: "Quản lý khách hàng", description: "Xem, tạo mới và cập nhật thông tin khách hàng", icon: <FaUserCog size={24} />, color: "#3b82f6", bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", path: "/scstaff/customers" },
    { id: 2, title: "Quản lý thông tin xe", description: "Danh sách xe, thêm mới, cập nhật", icon: <FaCar size={24} />, color: "#10b981", bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", path: "/scstaff/vehicles" },
    { id: 3, title: "Yêu cầu bảo hành", description: "Tiếp nhận và xử lý yêu cầu từ khách hàng", icon: <FaClipboardList size={24} />, color: "#f59e0b", bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", path: "/scstaff/warranty-claims" },
    { id: 4, title: "Lịch sử dịch vụ", description: "Theo dõi dịch vụ & lịch sử sửa chữa", icon: <FaHistory size={24} />, color: "#8b5cf6", bgGradient: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", path: "/scstaff/service-history" },
    { id: 5, title: "Recall", description: "Quản lý thông báo thu hồi sản phẩm", icon: <FaExclamationTriangle size={24} />, color: "#ef4444", bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", path: "/scstaff/recalls" },
    { id: 6, title: "Feedback", description: "Xem và quản lý phản hồi từ khách hàng", icon: <FaCommentDots size={24} />, color: "#06b6d4", bgGradient: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)", path: "/scstaff/feedbacks" }
  ];

  const statItems = [
    { value: stats.customers, label: 'Khách hàng', icon: <FaUsers size={18} />, color: '#3b82f6', bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' },
    { value: stats.vehicles, label: 'Xe đăng ký', icon: <FaCar size={18} />, color: '#10b981', bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' },
    { value: stats.submittedClaims, label: 'Yêu cầu chờ', icon: <FaClipboardList size={18} />, color: '#f59e0b', bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
    { value: stats.completedServices, label: 'Dịch vụ hoàn thành', icon: <FaHistory size={18} />, color: '#8b5cf6', bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' },
  ];

  return (
    <>
      <S.DashboardHeader>
        <div style={{ flex: 1, zIndex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 32, color: "#1e293b" }}>Service Center Staff</h1>
          <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 15 }}>Bảng điều khiển chuyên nghiệp để quản lý hoạt động của trung tâm dịch vụ.</p>
        </div>
      </S.DashboardHeader>

      <S.ManagementCardGrid>
        {managementCards.map((card) => <ManagementCard key={card.id} card={card} onNavigate={navigate} />)}
      </S.ManagementCardGrid>

      <S.StatsContainer>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><FaTachometerAlt size={18} /></div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Thống kê hoạt động</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>Tổng quan các số liệu quan trọng</div>
          </div>
        </div>
        <S.StatsGrid>
          {statItems.map((s, idx) => <StatCard key={idx} {...s} loading={dataLoading} />)}
        </S.StatsGrid>
      </S.StatsContainer>
    </>
  );
}
