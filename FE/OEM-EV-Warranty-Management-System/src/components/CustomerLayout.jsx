import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as S from "./CustomerLayout.styles";
import {
  FaTachometerAlt, FaCar, FaHistory, FaClipboardList,
  FaBars, FaUser, FaCommentDots, FaExclamationTriangle
} from "react-icons/fa";

const sidebarItems = [
  { icon: <FaTachometerAlt />, label: "Dashboard", path: "/customer/dashboard" },
  { icon: <FaCar />, label: "Xe của tôi", path: "/customer/my-vehicles" },
  { icon: <FaHistory />, label: "Lịch sử Bảo hành", path: "/customer/warranty-history" },
  // { icon: <FaClipboardList />, label: "Yêu cầu Bảo hành", path: "/customer/warranty-claims" },
  { icon: <FaExclamationTriangle />, label: "Thông báo Recall", path: "/customer/recalls" },
  { icon: <FaClipboardList />, label: "Trung tâm Dịch vụ", path: "/customer/service-centers" },
  { icon: <FaCommentDots />, label: "Phản hồi", path: "/customer/feedback" },
  { icon: <FaUser />, label: "Thông tin cá nhân", path: "/customer/profile" },
];

export default function CustomerLayout() {
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
              <div style={{ 
                fontSize: 20, 
                fontWeight: 800, 
                letterSpacing: "-0.5px",
                textShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
                marginBottom: 2
              }}>
                Customer
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
