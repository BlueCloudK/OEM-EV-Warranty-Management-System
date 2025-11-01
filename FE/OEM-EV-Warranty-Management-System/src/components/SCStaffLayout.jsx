import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as S from "./SCStaffLayout.styles";
import {
  FaUserCog, FaCar, FaClipboardList, FaHistory, FaBars, FaHome, FaCommentDots, FaExclamationTriangle
} from "react-icons/fa";

const sidebarItems = [
  { icon: <FaHome size={20} />, label: "Dashboard", path: "/scstaff/dashboard" },
  { icon: <FaUserCog size={20} />, label: "Khách hàng", path: "/scstaff/customers" },
  { icon: <FaCar size={20} />, label: "Xe", path: "/scstaff/vehicles" },
  { icon: <FaClipboardList size={20} />, label: "Bảo hành", path: "/scstaff/warranty-claims" },
  { icon: <FaExclamationTriangle size={20} />, label: "Recall", path: "/scstaff/recalls" },
  { icon: <FaHistory size={20} />, label: "Lịch sử", path: "/scstaff/service-history" },
  { icon: <FaCommentDots size={20} />, label: "Feedback", path: "/scstaff/feedbacks" },
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
          <S.SidebarToggleButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <FaBars size={16} />
          </S.SidebarToggleButton>
          {!sidebarCollapsed && (
            <div>
              <div style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                textShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
                marginBottom: 2,
                color: "#ffffff"
              }}>
                SC Staff
              </div>
              <div style={{
                fontSize: 13,
                color: "rgba(255, 255, 255, 0.7)",
                fontWeight: 500,
                letterSpacing: "2px",
                textTransform: "uppercase"
              }}>
                Portal
              </div>
            </div>
          )}
        </S.SidebarHeader>
        <div style={{ flex: 1, padding: sidebarCollapsed ? '12px' : '16px', overflowY: 'auto' }}>
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
