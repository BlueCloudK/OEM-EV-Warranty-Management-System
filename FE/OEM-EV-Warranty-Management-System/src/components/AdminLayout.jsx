import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as S from "./AdminLayout.styles";
import {
  FaUsers, FaCar, FaCogs, FaClipboardList, FaHistory,
  FaUserShield, FaTachometerAlt, FaArrowLeft
} from "react-icons/fa";

const navItems = [
  { path: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
  { path: "/admin/users", icon: <FaUserShield />, label: "Users & Roles" },
  { path: "/admin/customers", icon: <FaUsers />, label: "Khách hàng" },
  { path: "/admin/vehicles", icon: <FaCar />, label: "Xe điện" },
  { path: "/admin/parts", icon: <FaCogs />, label: "Phụ tùng" },
  { path: "/admin/warranty-claims", icon: <FaClipboardList />, label: "Warranty Claims" },
  { path: "/admin/service-histories", icon: <FaHistory />, label: "Lịch sử dịch vụ" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentPath = location.pathname;

  return (
    <S.Container>
      <S.Header>
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
          <S.BackButton onClick={() => navigate("/")}><FaArrowLeft /> Trang chủ</S.BackButton>
          <S.HeaderTitle><FaUserShield /> Admin Panel</S.HeaderTitle>
        </div>
        <S.HeaderSubtitle>Full access to all system resources and management functions</S.HeaderSubtitle>
      </S.Header>

      <S.Layout>
        <S.Sidebar $isCollapsed={isCollapsed}>
          <button onClick={() => setIsCollapsed(v => !v)}>{isCollapsed ? ">>" : "<<"}</button>
          {navItems.map(item => (
            <S.NavItem 
              key={item.path} 
              $active={currentPath === item.path} 
              $isCollapsed={isCollapsed} 
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </S.NavItem>
          ))}
        </S.Sidebar>

        <S.MainContent>
          <Outlet />
        </S.MainContent>
      </S.Layout>
    </S.Container>
  );
}
