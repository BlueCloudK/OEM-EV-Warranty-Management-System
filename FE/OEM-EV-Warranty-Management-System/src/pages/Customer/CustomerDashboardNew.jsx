import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './CustomerDashboardNew.styles';
import {
  FaTachometerAlt, FaCar, FaHistory, FaClipboardList, FaUser, FaCommentDots, FaArrowRight
} from 'react-icons/fa';

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

export default function CustomerDashboardNew() {
  const navigate = useNavigate();

  const managementCards = [
    { id: 1, title: "Xe của tôi", description: "Xem danh sách xe và thông tin chi tiết", icon: <FaCar size={24} />, color: "#3b82f6", bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", path: "/customer/my-vehicles" },
    { id: 2, title: "Lịch sử Bảo hành", description: "Theo dõi lịch sử bảo dưỡng và sửa chữa", icon: <FaHistory size={24} />, color: "#10b981", bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", path: "/customer/warranty-history" },
    // { id: 3, title: "Yêu cầu Bảo hành", description: "Xem và theo dõi yêu cầu bảo hành của bạn", icon: <FaClipboardList size={24} />, color: "#f59e0b", bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", path: "/customer/warranty-claims" },
    { id: 4, title: "Phản hồi", description: "Gửi phản hồi về dịch vụ bảo hành", icon: <FaCommentDots size={24} />, color: "#8b5cf6", bgGradient: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", path: "/customer/feedback" },
    { id: 5, title: "Thông tin cá nhân", description: "Quản lý thông tin tài khoản của bạn", icon: <FaUser size={24} />, color: "#ef4444", bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", path: "/customer/profile" },
  ];

  return (
    <S.DashboardContainer>
      <S.HeaderTitle><FaTachometerAlt /> Dashboard Khách hàng</S.HeaderTitle>
      <S.ManagementCardGrid>
        {managementCards.map((card) => <ManagementCard key={card.id} card={card} onNavigate={navigate} />)}
      </S.ManagementCardGrid>
    </S.DashboardContainer>
  );
}
