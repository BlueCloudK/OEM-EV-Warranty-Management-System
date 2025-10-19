import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaUser, FaHome, FaTachometerAlt } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  const checkLoginStatus = () => {
    // Check both possible token keys
    const accessToken =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    // Check username from different possible sources
    let username = localStorage.getItem("username");
    const userString = localStorage.getItem("user");
    if (!username && userString) {
      try {
        const userObj = JSON.parse(userString);
        username = userObj.username;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    const role = localStorage.getItem("role");

    if (accessToken && username) {
      setIsLoggedIn(true);
      setUserInfo({
        username: username,
        role: role || "User",
      });
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const getDashboardPath = () => {
    const role = localStorage.getItem("role");
    const roleMap = {
      1: "/admin/dashboard",
      2: "/scstaff/dashboard",
      3: "/sctechnician/dashboard",
      4: "/evmstaff/dashboard",
      5: "/customer/dashboard",
      ADMIN: "/admin/dashboard",
      SC_STAFF: "/scstaff/dashboard",
      SC_TECHNICIAN: "/sctechnician/dashboard",
      EVM_STAFF: "/evmstaff/dashboard",
      CUSTOMER: "/customer/dashboard",
    };
    return roleMap[role] || "/customer/dashboard";
  };

  const getRoleName = (role) => {
    const roleMap = {
      1: "Admin",
      2: "SC Staff",
      3: "SC Tech",
      4: "EVM Staff",
      5: "Customer",
      ADMIN: "Admin",
      SC_STAFF: "SC Staff",
      SC_TECHNICIAN: "SC Tech",
      EVM_STAFF: "EVM Staff",
      CUSTOMER: "Customer",
    };
    return roleMap[role] || "User";
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
          {isLoggedIn ? (
            // Logged in navigation
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
                <span style={{ fontWeight: "500" }}>{userInfo?.username}</span>
                <span
                  style={{
                    fontSize: "11px",
                    opacity: "0.8",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: "2px 6px",
                    borderRadius: "10px",
                  }}
                >
                  {getRoleName(userInfo?.role)}
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
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(220, 53, 69, 0.3)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#c82333";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(220, 53, 69, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc3545";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(220, 53, 69, 0.3)";
                }}
              >
                <FaSignOutAlt />
                Đăng xuất
              </button>
            </>
          ) : (
            // Not logged in navigation
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
