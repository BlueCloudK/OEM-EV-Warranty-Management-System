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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fb" }}>
        <p>Đang kiểm tra trạng thái đăng nhập...</p>
      </div>
    );
  }

  // Render login form only if not authenticated
  return (
    <div style={{ minHeight: "100vh", backgroundImage: "url('https://images.unsplash.com/photo-1615874959474-d609be9f0cda?auto=format&fit=crop&w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }} />
      <div style={{ zIndex: 2, width: "880px", height: "520px", display: "flex", borderRadius: "20px", overflow: "hidden", boxShadow: "0 12px 35px rgba(0,0,0,0.35)", background: "#fff" }}>
        <div style={{ flex: 1, padding: "60px 45px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ color: "#044835", fontWeight: "700", fontSize: "32px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaCar /> EV Warranty Portal
          </h1>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={inputWrapper}>
              <FaUser color="#044835" />
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
            </div>
            <div style={inputWrapper}>
              <FaLock color="#044835" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            </div>
            <button type="submit" style={loginBtn} disabled={isLoading} onMouseOver={(e) => (e.currentTarget.style.background = "#06694e")} onMouseOut={(e) => (e.currentTarget.style.background = "#044835")}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            {errorMessage && <p style={{ color: "red", marginTop: "10px", textAlign: 'center' }}>{errorMessage}</p>}
            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <Link to="/forgot-password" style={{ color: "#044835", textDecoration: "none", fontSize: "14px", cursor: "pointer" }} onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")} onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}>
                Quên mật khẩu?
              </Link>
            </div>
          </form>
        </div>
        <div style={{ flex: 1, position: "relative", backgroundImage: "url('https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
      </div>
    </div>
  );
}

const inputWrapper = { display: "flex", alignItems: "center", gap: "10px", padding: "12px 15px", borderRadius: "10px", border: "1px solid #ccc", background: "#fafafa" };
const inputStyle = { border: "none", outline: "none", fontSize: "15px", flex: 1, background: "transparent" };
const loginBtn = { padding: "12px", border: "none", borderRadius: "10px", background: "#044835", color: "#fff", fontWeight: "600", fontSize: "15px", cursor: "pointer", transition: "0.3s", marginTop: "10px" };
