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
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-100 via-white to-emerald-50">
      <header className="relative overflow-hidden rounded-2xl px-6 py-5 border border-slate-200 bg-white/80 backdrop-blur shadow-[0_10px_30px_-10px_rgba(2,6,23,0.25)]">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl" />
        <h1 className="relative text-xl m-0 flex items-center gap-3 font-semibold text-slate-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-indigo-600 to-emerald-500 text-white shadow">
            <FaUserShield />
          </span>
          Admin Panel
        </h1>
        <p className="relative opacity-80 text-sm m-0 text-slate-500">
          Full access to all system resources and management functions
        </p>
      </header>

      <div className="mt-5 flex gap-4">
        <aside
          className={`rounded-xl p-4 sticky top-4 self-start transition-all duration-300 border border-slate-200 bg-white/70 backdrop-blur shadow-[0_8px_24px_-12px_rgba(2,6,23,0.25)] ${
            isCollapsed ? "w-[76px] min-w-[76px]" : "w-64 min-w-[256px]"
          }`}
        >
          <button
            className="w-full mb-4 text-xs px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-sm"
            onClick={() => setIsCollapsed((v) => !v)}
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {isCollapsed ? "☰" : "✕"}
          </button>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <div
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    isCollapsed ? "justify-center" : "justify-start"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 to-emerald-50 text-slate-900 font-semibold ring-1 ring-indigo-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                  title={item.label}
                >
                  <span
                    className={`text-[18px] ${
                      isActive
                        ? "text-indigo-600"
                        : "text-slate-500 group-hover:text-slate-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="truncate text-sm">{item.label}</span>
                  )}
                  {isActive && (
                    <>
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded bg-indigo-500" />
                      <span className="absolute inset-0 rounded-lg ring-1 ring-indigo-200/60" />
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
