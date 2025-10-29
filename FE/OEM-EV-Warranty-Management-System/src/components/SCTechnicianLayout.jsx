import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as S from "./SCTechnicianLayout.styles";
import {
  FaTachometerAlt, FaClipboardCheck, FaWrench, FaHistory,
  FaBars, FaCar, FaCog, FaCommentDots, FaTools
} from "react-icons/fa";

const sidebarItems = [
  { icon: <FaTachometerAlt />, label: "Dashboard", path: "/sctechnician/dashboard" },
  { icon: <FaWrench />, label: "Công việc của tôi", path: "/sctechnician/my-work" },
  { icon: <FaTools />, label: "Yêu cầu Linh kiện", path: "/sctechnician/part-requests" },
  { icon: <FaCommentDots />, label: "Feedback", path: "/sctechnician/feedbacks" },
  { icon: <FaHistory />, label: "Lịch sử Sửa chữa", path: "/sctechnician/service-history" },
  { icon: <FaCar />, label: "Tra cứu Xe", path: "/sctechnician/vehicles" },
  { icon: <FaCog />, label: "Xem Phụ tùng", path: "/sctechnician/parts" },
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
              <div style={{ fontSize: 16, fontWeight: 600 }}>SC Technician</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Portal</div>
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

      <S.MainContent>
        <Outlet />
      </S.MainContent>
    </S.PageContainer>
  );
}
