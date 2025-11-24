import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as S from "./SCTechnicianLayout.styles";
import {
  FaTachometerAlt, FaWrench, FaHistory,
  FaBars, FaCar, FaCog, FaCommentDots, FaTools
} from "react-icons/fa";

const sidebarItems = [
  { icon: <FaTachometerAlt />, label: "Tổng quan", path: "/sctechnician/dashboard" },
  { icon: <FaWrench />, label: "Công việc của tôi", path: "/sctechnician/my-work" },
  { icon: <FaTools />, label: "Yêu cầu Linh kiện", path: "/sctechnician/part-requests" },
  { icon: <FaCommentDots />, label: "Phản hồi", path: "/sctechnician/feedbacks" },
  { icon: <FaHistory />, label: "Lịch sử Sửa chữa", path: "/sctechnician/service-history" },
  { icon: <FaCog />, label: "Xem Phụ tùng", path: "/sctechnician/parts" },
  { icon: <FaTools />, label: "Lắp đặt Phụ tùng", path: "/sctechnician/install-part" },
];

export default function SCTechnicianLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentPath = location.pathname;

  return (
    <S.PageContainer>
      <S.Sidebar $isCollapsed={sidebarCollapsed}>
        <S.SidebarHeader $isCollapsed={sidebarCollapsed}>
          <S.SidebarToggleButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <FaBars />
          </S.SidebarToggleButton>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Kỹ thuật viên</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Cổng thông tin</div>
            </div>
          )}
        </S.SidebarHeader>
        <div style={{ flex: 1, padding: sidebarCollapsed ? 8 : 16 }}>
          {sidebarItems.map((item, index) => (
            <S.NavItem
              key={index}
              $active={currentPath === item.path}
              $isCollapsed={sidebarCollapsed}
              onClick={() => item.path && navigate(item.path)}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </S.NavItem>
          ))}
        </div>
      </S.Sidebar>

      <S.MainContent $isCollapsed={sidebarCollapsed}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="page-surface" style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", boxShadow: "0 24px 58px rgba(15,23,42,0.18)", border: "1px solid rgba(226,232,240,0.85)" }}>
            <Outlet />
          </div>
        </div>
      </S.MainContent>
    </S.PageContainer>
  );
}
