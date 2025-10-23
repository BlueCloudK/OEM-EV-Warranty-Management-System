import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook
import { FaSignOutAlt, FaUser } from "react-icons/fa";

/**
 * ===========================================================================================
 *  Navbar (Context Refactored)
 * ===========================================================================================
 * - Now consumes AuthContext to get the real-time authentication state.
 * - Automatically updates when the user logs in or out from anywhere in the app.
 * - No longer uses its own state or reads from localStorage.
 */

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth(); // Consume the global auth state

  const handleLogout = () => {
    logout(); // Call the logout function from the context
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <header className="topbar">
      <div className="container nav-inner">
        <div className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <span>OEM EV Warranty</span>
            <span className="sub">
              Phần mềm quản lý bảo hành xe điện từ hãng
            </span>
          </Link>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {isAuthenticated && user ? (
            // --- LOGGED IN VIEW ---
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 15px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: "25px",
                  fontSize: "14px",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <FaUser style={{ fontSize: "12px" }} />
                <span style={{ fontWeight: "500" }}>{user.fullName || user.username}</span>
                <span
                  style={{
                    fontSize: "11px",
                    opacity: "0.8",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: "2px 6px",
                    borderRadius: "10px",
                  }}
                >
                  {user.roleName}
                </span>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                <FaSignOutAlt />
                Đăng xuất
              </button>
            </>
          ) : (
            // --- LOGGED OUT VIEW ---
            <>
              <Link to="/" className="nav-link">
                Trang chủ
              </Link>
              <Link to="/login" className="nav-link">
                Đăng nhập
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
