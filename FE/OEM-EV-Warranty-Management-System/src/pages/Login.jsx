import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCar, FaUser, FaLock } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Attempting login with:", { username, password: "***" });

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      // ✅ Kiểm tra thông báo login thành công
      if (data.message && data.message.toLowerCase().includes("success")) {
        // Lưu token
        localStorage.setItem("token", data.accessToken);

        // Lưu thông tin user
        const userRole = data.roleName || "CUSTOMER";
        localStorage.setItem("role", userRole);
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: data.username,
            userId: data.userId,
          })
        );

        // ✅ Điều hướng theo role
        const roleRedirects = {
          ADMIN: "/admin/dashboard",
          SC_STAFF: "/scstaff/dashboard",
          SC_TECHNICIAN: "/sctechnician/dashboard",
          EVM_STAFF: "/evmstaff/dashboard",
          CUSTOMER: "/customer/dashboard",
        };

        const redirectPath = roleRedirects[userRole] || "/customer/dashboard";

        alert(`Đăng nhập thành công! Role: ${userRole}`);
        navigate(redirectPath);
      } else {
        setErrorMessage(data.message || "Đăng nhập thất bại.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Lỗi khi đăng nhập. Vui lòng thử lại sau.");
    }

    setIsLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1615874959474-d609be9f0cda?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
        }}
      />

      <div
        style={{
          zIndex: 2,
          width: "880px",
          height: "520px",
          display: "flex",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
          background: "#fff",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "60px 45px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              color: "#044835",
              fontWeight: "700",
              fontSize: "32px",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaCar /> EV Warranty Portal
          </h1>
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <div style={inputWrapper}>
              <FaUser color="#044835" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={inputWrapper}>
              <FaLock color="#044835" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              style={loginBtn}
              disabled={isLoading}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#06694e")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "#044835")
              }
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {errorMessage && (
              <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
            )}

            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <Link 
                to="/forgot-password" 
                style={{
                  color: "#044835",
                  textDecoration: "none",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
                onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Quên mật khẩu?
              </Link>
            </div>
          </form>
        </div>

        <div
          style={{
            flex: 1,
            position: "relative",
            backgroundImage:
              "url('https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
    </div>
  );
}

// Styles
const inputWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 15px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  background: "#fafafa",
};
const inputStyle = {
  border: "none",
  outline: "none",
  fontSize: "15px",
  flex: 1,
  background: "transparent",
};
const loginBtn = {
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#044835",
  color: "#fff",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
  transition: "0.3s",
  marginTop: "10px",
};
