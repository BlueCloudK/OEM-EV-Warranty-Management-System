import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  FaUsers,
  FaCar,
  FaCogs,
  FaClipboardList,
  FaHistory,
  FaUserShield,
  FaTachometerAlt,
  FaCommentDots,
  FaClipboard,
  FaMapMarkerAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import * as S from "./AdminLayout.styles";

const navItems = [
  { path: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
  { path: "/admin/users", icon: <FaUserShield />, label: "Users & Roles" },
  { path: "/admin/customers", icon: <FaUsers />, label: "Khách hàng" },
  { path: "/admin/vehicles", icon: <FaCar />, label: "Xe điện" },
  { path: "/admin/parts", icon: <FaCogs />, label: "Phụ tùng" },
  {
    path: "/admin/warranty-claims",
    icon: <FaClipboardList />,
    label: "Warranty Claims",
  },
  {
    path: "/admin/recalls",
    icon: <FaExclamationTriangle />,
    label: "Recall Requests",
  },
  {
    path: "/admin/service-histories",
    icon: <FaHistory />,
    label: "Lịch sử dịch vụ",
  },
  { path: "/admin/work-logs", icon: <FaClipboard />, label: "Work Logs" },
  {
    path: "/admin/service-centers",
    icon: <FaMapMarkerAlt />,
    label: "Service Centers",
  },
  { path: "/admin/feedbacks", icon: <FaCommentDots />, label: "Feedback" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentPath = location.pathname;

  return (
    <S.PageContainer>
      <S.Header>
        <S.HeaderTitle>
          <FaUserShield /> Admin Panel
        </S.HeaderTitle>
        <S.HeaderSubtitle>
          Full access to all system resources and management functions
        </S.HeaderSubtitle>
      </S.Header>

      <S.Layout>
        <S.Sidebar $isCollapsed={isCollapsed}>
          <S.SidebarToggleButton
            onClick={() => setIsCollapsed((v) => !v)}
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {isCollapsed ? "☰" : "✕"}
          </S.SidebarToggleButton>
          
          {!isCollapsed && (
            <S.SidebarHeader>
              <div style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                textShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
                marginBottom: 2,
                color: "#ffffff"
              }}>
                Admin
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
            </S.SidebarHeader>
          )}

          <nav>
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <S.NavItem
                  key={item.path}
                  $active={isActive}
                  $isCollapsed={isCollapsed}
                  onClick={() => navigate(item.path)}
                  title={item.label}
                  >
                    {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </S.NavItem>
              );
            })}
          </nav>
        </S.Sidebar>

        <S.MainContent>
          <Outlet />
        </S.MainContent>
      </S.Layout>
    </S.PageContainer>
  );
}
