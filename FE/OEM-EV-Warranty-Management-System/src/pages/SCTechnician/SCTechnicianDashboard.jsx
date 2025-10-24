import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './SCTechnicianDashboard.styles';
import {
  FaTachometerAlt, FaClipboardCheck, FaWrench, FaHistory, FaCar, FaCog, FaArrowRight
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

export default function SCTechnicianDashboard() {
  const navigate = useNavigate();

  const managementCards = [
    { id: 1, title: "Yêu cầu Bảo hành", description: "Xem và xử lý các yêu cầu bảo hành được giao", icon: <FaClipboardCheck size={24} />, color: "#f59e0b", bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", path: "/sctechnician/warranty-claims" },
    { id: 2, title: "Công việc của tôi", description: "Quản lý các công việc sửa chữa đang thực hiện", icon: <FaWrench size={24} />, color: "#10b981", bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", path: "/sctechnician/my-work" },
    { id: 3, title: "Lịch sử Sửa chữa", description: "Xem lịch sử các công việc đã hoàn thành", icon: <FaHistory size={24} />, color: "#3b82f6", bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", path: "/sctechnician/service-history" },
    { id: 4, title: "Tra cứu Xe", description: "Tìm kiếm thông tin xe và lịch sử bảo dưỡng", icon: <FaCar size={24} />, color: "#8b5cf6", bgGradient: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", path: "/sctechnician/vehicles" },
    { id: 5, title: "Phụ tùng lắp đặt", description: "Xem và cập nhật phụ tùng đã lắp đặt", icon: <FaCog size={24} />, color: "#ef4444", bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", path: "/sctechnician/installed-parts" },
  ];

  return (
    <S.DashboardContainer>
      <S.HeaderTitle><FaTachometerAlt /> Dashboard Kỹ thuật viên</S.HeaderTitle>
      <S.ManagementCardGrid>
        {managementCards.map((card) => <ManagementCard key={card.id} card={card} onNavigate={navigate} />)}
      </S.ManagementCardGrid>
    </S.DashboardContainer>
  );
}
