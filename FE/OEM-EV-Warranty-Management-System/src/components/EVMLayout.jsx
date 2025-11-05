import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as S from "./EVMLayout.styles";
import {
  FaTachometerAlt, FaCogs,
  FaHistory, FaBars, FaCommentDots, FaTasks, FaTools, FaExclamationTriangle
} from "react-icons/fa";

const sidebarItems = [
  { icon: <FaTachometerAlt />, label: "Dashboard", path: "/evmstaff/dashboard" },
  { icon: <FaCogs />, label: "Quản lý Phụ tùng", path: "/evmstaff/parts" },
  { icon: <FaTools />, label: "Yêu cầu Linh kiện", path: "/evmstaff/part-requests" },
  { icon: <FaExclamationTriangle />, label: "Yêu cầu Recall", path: "/evmstaff/recalls" },
  { icon: <FaHistory />, label: "Lịch sử Dịch vụ", path: "/evmstaff/service-histories" },
  { icon: <FaTasks />, label: "Work Logs", path: "/evmstaff/work-logs" },
  { icon: <FaCommentDots />, label: "Phản hồi", path: "/evmstaff/feedbacks" },
];

export default function EVMLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentPath = location.pathname;

  return (
    <S.PageContainer>
      <S.Sidebar $isCollapsed={sidebarCollapsed}>
        <S.SidebarHeader $isCollapsed={sidebarCollapsed}>
          <S.SidebarToggleButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}><FaBars /></S.SidebarToggleButton>
          {!sidebarCollapsed && <div><div style={{ fontSize: 16, fontWeight: 600 }}>EVM Staff</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Portal</div></div>}
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
        <Outlet />
      </S.MainContent>
    </S.PageContainer>
  );
}
