import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as S from "./CustomerLayout.styles";
import {
  FaTachometerAlt, FaCar, FaHistory, FaClipboardList,
  FaBars, FaUser, FaCommentDots, FaExclamationTriangle
} from "react-icons/fa";

const sidebarItems = [
  { icon: <FaTachometerAlt />, label: "Tổng quan", path: "/customer/dashboard" },
  { icon: <FaCar />, label: "Xe của tôi", path: "/customer/my-vehicles" },
  { icon: <FaHistory />, label: "Lịch sử Bảo hành", path: "/customer/warranty-history" },
  // { icon: <FaClipboardList />, label: "Yêu cầu Bảo hành", path: "/customer/warranty-claims" },
  { icon: <FaExclamationTriangle />, label: "Thông báo Triệu hồi", path: "/customer/recalls" },
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
              <div style={{ fontSize: 16, fontWeight: 600 }}>Khách hàng</div>
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
