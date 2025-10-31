import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaSignOutAlt, FaUser } from "react-icons/fa";

/**
 * ===========================================================================================
 *  Navbar (Dynamic Logo Link)
 * ===========================================================================================
 * - The logo link now intelligently navigates to the user's dashboard if logged in,
 *   or to the public home page if logged out.
 */

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout(); // Call the logout function from the context
    navigate("/login"); // Redirect to login page after logout
  };

  // Helper function to determine the correct dashboard path based on user role
  const getDashboardPath = () => {
    if (!user || !user.roleName) return "/"; // Fallback to home page

    const roleRedirects = {
      ADMIN: "/admin/dashboard",
      SC_STAFF: "/scstaff/dashboard",
      SC_TECHNICIAN: "/sctechnician/dashboard",
      EVM_STAFF: "/evmstaff/dashboard",
      CUSTOMER: "/customer/dashboard",
    };
    return roleRedirects[user.roleName] || "/";
  };

  // Determine the correct path for the logo link
  const logoPath = isAuthenticated ? getDashboardPath() : "/";

  const NavLink = ({ to, children }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? "text-slate-900 bg-slate-100"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        }`}
      >
        {children}
        {active && (
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-0.5 w-6 rounded bg-indigo-600" />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={logoPath}
            className="flex items-center gap-2 text-slate-900"
          >
            <span className="inline-block h-8 w-8 rounded bg-gradient-to-br from-indigo-600 to-emerald-500 text-white grid place-items-center text-[11px] font-bold shadow-md">
              EV
            </span>
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight">
                OEM EV Warranty
              </div>
              <div className="text-[11px] text-slate-500">
                Quản lý bảo hành xe điện
              </div>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {isAuthenticated && user ? (
            <>
              <NavLink to="/">Trang chủ</NavLink>
              <NavLink to={logoPath}>Bảng điều khiển</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/">Trang chủ</NavLink>
              <NavLink to="/login">Đăng nhập</NavLink>
            </>
          )}
        </nav>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-slate-200 shadow-sm">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-emerald-600 text-white text-xs shadow">
                <FaUser />
              </span>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-slate-800 leading-4">
                  {user.fullName || user.username}
                </div>
                <div className="text-[11px] text-slate-500 leading-3">
                  {user.roleName}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        ) : (
          <div className="md:hidden">
            <Link
              to="/login"
              className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
