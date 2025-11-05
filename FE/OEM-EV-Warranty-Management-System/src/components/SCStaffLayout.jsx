import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as S from "../pages/SCStaff/SCStaffDashboard.styles"; // Tạm thời tái sử dụng styles
import {
  FaUserCog, FaCar, FaClipboardList, FaHistory, FaBars, FaHome, FaCommentDots, FaExclamationTriangle
} from "react-icons/fa";

const sidebarItems = [
  { icon: <FaHome size={18} />, label: "Dashboard", path: "/scstaff/dashboard" },
  { icon: <FaUserCog size={18} />, label: "Khách hàng", path: "/scstaff/customers" },
  { icon: <FaCar size={18} />, label: "Xe", path: "/scstaff/vehicles" },
  { icon: <FaClipboardList size={18} />, label: "Bảo hành", path: "/scstaff/warranty-claims" },
  { icon: <FaExclamationTriangle size={18} />, label: "Recall", path: "/scstaff/recalls" },
  { icon: <FaHistory size={18} />, label: "Lịch sử", path: "/scstaff/service-history" },
  { icon: <FaCommentDots size={18} />, label: "Feedback", path: "/scstaff/feedbacks" },
];

export default function SCStaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentPath = location.pathname;

  return (
    <S.PageContainer>
      <S.Sidebar $isCollapsed={sidebarCollapsed}>
        <S.SidebarHeader $isCollapsed={sidebarCollapsed}>
          <S.SidebarToggleButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}><FaBars size={16} /></S.SidebarToggleButton>
          {!sidebarCollapsed && <div><div style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>SC Staff</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Dashboard</div></div>}
        </S.SidebarHeader>
        <div style={{ flex: 1, padding: sidebarCollapsed ? 8 : 16 }}>
          {sidebarItems.map((item, index) => (
            <S.NavItem key={index} $active={currentPath === item.path} $isCollapsed={sidebarCollapsed} onClick={() => item.path && navigate(item.path)}>
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </S.NavItem>
          ))}
        </div>
      </S.Sidebar>

      <S.MainContent $isCollapsed={sidebarCollapsed}>
        <Outlet /> {/* Đây là nơi nội dung của các trang con sẽ được render */}
      </S.MainContent>
    </S.PageContainer>
  );
}
