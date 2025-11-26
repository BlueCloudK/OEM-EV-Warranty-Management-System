import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as S from "./AdminLayout.styles";
import {
  FaUsers, FaCar, FaCogs, FaClipboardList, FaHistory,
  FaUserShield, FaTachometerAlt, FaCommentDots, FaClipboard,
  FaMapMarkerAlt, FaExclamationTriangle, FaBars, FaLayerGroup
} from "react-icons/fa";

const sidebarItems = [
  { path: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Tổng quan" },
  { path: "/admin/users", icon: <FaUserShield />, label: "Người dùng & Vai trò" },
  { path: "/admin/customers", icon: <FaUsers />, label: "Khách hàng" },
  { path: "/admin/vehicles", icon: <FaCar />, label: "Xe điện" },
  { path: "/admin/part-categories", icon: <FaLayerGroup />, label: "Loại phụ tùng" },
  { path: "/admin/parts", icon: <FaCogs />, label: "Phụ tùng" },
  { path: "/admin/warranty-claims", icon: <FaClipboardList />, label: "Yêu cầu Bảo hành" },
  { path: "/admin/recalls", icon: <FaExclamationTriangle />, label: "Yêu cầu Triệu hồi" },
  { path: "/admin/service-histories", icon: <FaHistory />, label: "Lịch sử dịch vụ" },
  { path: "/admin/work-logs", icon: <FaClipboard />, label: "Nhật ký Công việc" },
  { path: "/admin/service-centers", icon: <FaMapMarkerAlt />, label: "Trung tâm Dịch vụ" },
  { path: "/admin/feedbacks", icon: <FaCommentDots />, label: "Phản hồi" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentPath = location.pathname;

  return (
    <S.PageContainer>
      <S.Sidebar $isCollapsed={sidebarCollapsed}>
        <S.SidebarHeader $isCollapsed={sidebarCollapsed}>
          <S.SidebarToggleButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}><FaBars /></S.SidebarToggleButton>
          {!sidebarCollapsed && <div><div style={{ fontSize: 16, fontWeight: 600 }}>Admin</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Bảng điều khiển</div></div>}
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
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="page-surface" style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", boxShadow: "0 24px 58px rgba(15,23,42,0.18)", border: "1px solid rgba(226,232,240,0.85)" }}>
            <Outlet />
          </div>
        </div>
      </S.MainContent>
    </S.PageContainer>
  );
}
