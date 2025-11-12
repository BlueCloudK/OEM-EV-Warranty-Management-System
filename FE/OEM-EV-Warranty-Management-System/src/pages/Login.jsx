import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCar, FaUser, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth(); // Get isAuthenticated and user from context

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Effect to redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const roleRedirects = {
        ADMIN: "/admin/dashboard",
        SC_STAFF: "/scstaff/dashboard",
        SC_TECHNICIAN: "/sctechnician/dashboard",
        EVM_STAFF: "/evmstaff/dashboard",
        CUSTOMER: "/customer/dashboard",
      };
      const redirectPath = roleRedirects[user.roleName] || "/";
      navigate(redirectPath, { replace: true }); // Use replace to prevent going back to login
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const loggedInUser = await login(username, password);

      if (loggedInUser && loggedInUser.roleName) {
        const roleRedirects = {
          ADMIN: "/admin/dashboard",
          SC_STAFF: "/scstaff/dashboard",
          SC_TECHNICIAN: "/sctechnician/dashboard",
          EVM_STAFF: "/evmstaff/dashboard",
          CUSTOMER: "/customer/dashboard",
        };
        const redirectPath = roleRedirects[loggedInUser.roleName] || "/";
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error("Đăng nhập thành công nhưng không nhận được dữ liệu người dùng.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setErrorMessage(error.message || "Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth status
  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f2f4f8", color: "#475569" }}>
        <p style={{ letterSpacing: "0.35em", textTransform: "uppercase", fontSize: 12 }}>Đang kiểm tra trạng thái đăng nhập...</p>
      </div>
    );
  }

  // Render login form only if not authenticated
  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(8,47,73,0.85), rgba(13,110,97,0.82))" }} />
      <img
        src="https://images.unsplash.com/photo-1615874959474-d609be9f0cda?auto=format&fit=crop&w=1920&q=80"
        alt="EV Background"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "min(940px, 92vw)",
          display: "grid",
          gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: "0 46px 120px rgba(0,0,0,0.45)",
          backdropFilter: "blur(12px)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "64px 48px", display: "flex", flexDirection: "column", gap: 32, color: "#0f172a" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 12, letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(11,107,97,0.66)" }}>
              OEM EV Warranty
            </span>
            <h1 style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, fontWeight: 600, letterSpacing: "0.04em" }}>
              <FaCar style={{ color: "#0b6b61" }} />
              Portal đăng nhập
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569" }}>
              Truy cập hệ thống quản lý bảo hành xe điện chính hãng. Đăng nhập để tiếp tục giám sát quy trình bảo hành và khách hàng của bạn.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(11,107,97,0.7)" }}>
              Tên đăng nhập
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(11,107,97,0.2)", background: "rgba(255,255,255,0.96)", boxShadow: "0 16px 32px rgba(11,107,97,0.12)" }}>
                <FaUser style={{ color: "#0f766e" }} />
                <input
                  type="text"
                  placeholder="Nhập tài khoản"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, color: "#0f172a", outline: "none" }}
                />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(11,107,97,0.7)" }}>
              Mật khẩu
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(11,107,97,0.2)", background: "rgba(255,255,255,0.96)", boxShadow: "0 16px 32px rgba(11,107,97,0.12)" }}>
                <FaLock style={{ color: "#0f766e" }} />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, color: "#0f172a", outline: "none" }}
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 12,
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                background: "#0b6b61",
                color: "#f8fafc",
                fontWeight: 600,
                letterSpacing: ".24em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 26px 45px rgba(11,107,97,0.35)",
                transition: "transform .2s ease, box-shadow .2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 32px 60px rgba(11,107,97,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 26px 45px rgba(11,107,97,0.35)";
              }}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập hệ thống"}
            </button>

            {errorMessage && (
              <p style={{ textAlign: "center", color: "#e11d48", fontWeight: 600, fontSize: 14 }}>{errorMessage}</p>
            )}

            <div style={{ textAlign: "center", fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(11,107,97,0.7)" }}>
              <Link to="/forgot-password" style={{ color: "inherit", textDecoration: "none" }}>
                Quên mật khẩu?
              </Link>
            </div>
          </form>
        </div>

        <div style={{ display: "none" }} />
      </div>
    </div>
  );
}

const inputWrapper = { };
const inputStyle = { };
const loginBtn = { };
