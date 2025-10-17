// ===========================================================================================
// PHẦN 1: IMPORT CÁC THƯ VIỆN VÀ COMPONENTS CẦN THIẾT
// ===========================================================================================

import React, { useState } from "react"; // React hook để quản lý state
import { useNavigate, Link } from "react-router-dom"; // Hook điều hướng và component Link
import { FaCar, FaUser, FaLock } from "react-icons/fa"; // Icons cho giao diện

// ===========================================================================================
// PHẦN 2: COMPONENT LOGIN CHÍNH VÀ KHAI BÁO CÁC STATE
// ===========================================================================================

export default function Login() {
  // Hook để điều hướng giữa các trang
  const navigate = useNavigate();

  // ===== CÁC STATE QUẢN LÝ FORM LOGIN =====
  const [username, setUsername] = useState(""); // Tên đăng nhập
  const [password, setPassword] = useState(""); // Mật khẩu
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading khi đăng nhập
  const [errorMessage, setErrorMessage] = useState(""); // Thông báo lỗi

  // ===========================================================================================
  // PHẦN 3: HÀM XỬ LÝ ĐĂNG NHẬP - GỬI REQUEST TỚI API
  // ===========================================================================================

  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn form reload trang
    setIsLoading(true); // Bật trạng thái loading
    setErrorMessage(""); // Reset thông báo lỗi

    try {
      console.log("Attempting login with:", { username, password: "***" });

      // ===== BƯỚC 1: GỬI REQUEST LOGIN =====
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }), // Gửi thông tin đăng nhập
      });

      const data = await res.json();
      console.log("Login response:", data);

      // ===== BƯỚC 2: XỬ LÝ RESPONSE THÀNH CÔNG =====
      if (data.message && data.message.toLowerCase().includes("success")) {
        // Lưu token vào localStorage để xác thực các request sau
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("accessToken", data.accessToken); // Backup token

        // Lưu thông tin user và role
        const userRole = data.roleName || "CUSTOMER";
        localStorage.setItem("role", userRole);
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: data.username,
            userId: data.userId,
          })
        );

        console.log("Login successful - Role:", userRole);
        console.log("Token saved:", data.accessToken ? "Yes" : "No");
        console.log("Full response data:", data);

        // ===== BƯỚC 3: ĐIỀU HƯỚNG THEO ROLE =====
        const roleRedirects = {
          ADMIN: "/admin/dashboard", // Admin -> Dashboard Admin
          SC_STAFF: "/scstaff/dashboard", // SC Staff -> Dashboard SC Staff
          SC_TECHNICIAN: "/sctechnician/dashboard", // SC Technician -> Dashboard SC Tech
          EVM_STAFF: "/evmstaff/dashboard", // EVM Staff -> Dashboard EVM
          CUSTOMER: "/customer/dashboard", // Customer -> Dashboard Customer
        };

        const redirectPath = roleRedirects[userRole] || "/customer/dashboard";
        console.log("Redirecting to:", redirectPath);

        // Delay navigation to ensure localStorage is saved
        setTimeout(() => {
          alert(`Đăng nhập thành công! Role: ${userRole}`);
          navigate(redirectPath); // Chuyển hướng đến trang tương ứng
        }, 100);
      } else {
        // ===== BƯỚC 4: XỬ LÝ LỖI TỪ API =====
        setErrorMessage(data.message || "Đăng nhập thất bại.");
      }
    } catch (error) {
      // ===== BƯỚC 5: XỬ LÝ LỖI NETWORK =====
      console.error("Login error:", error);
      setErrorMessage("Lỗi khi đăng nhập. Vui lòng thử lại sau.");
    }

    setIsLoading(false); // Tắt trạng thái loading
  };

  // ===========================================================================================
  // PHẦN 4: RENDER UI - HIỂN THỊ GIAO DIỆN ĐĂNG NHẬP
  // ===========================================================================================

  return (
    // Container chính với background image
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
      {/* Overlay tối để làm nổi bật nội dung */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
        }}
      />

      {/* ===== MAIN LOGIN CARD - THẺ ĐĂNG NHẬP CHÍNH ===== */}
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
        {/* ===== LEFT PANEL - PHẦN FORM ĐĂNG NHẬP ===== */}
        <div
          style={{
            flex: 1,
            padding: "60px 45px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Tiêu đề ứng dụng */}
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

          {/* ===== LOGIN FORM - FORM ĐĂNG NHẬP ===== */}
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            {/* Input Username */}
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

            {/* Input Password */}
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

            {/* Submit Button */}
            <button
              type="submit"
              style={loginBtn}
              disabled={isLoading}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#06694e")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#044835")}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Hiển thị thông báo lỗi (nếu có) */}
            {errorMessage && (
              <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
            )}

            {/* Link quên mật khẩu */}
            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <Link
                to="/forgot-password"
                style={{
                  color: "#044835",
                  textDecoration: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                Quên mật khẩu?
              </Link>
            </div>
          </form>
        </div>

        {/* ===== RIGHT PANEL - PHẦN HÌNH ẢNH ===== */}
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

// ===========================================================================================
// PHẦN 5: STYLES - CÁC STYLE OBJECTS CHO COMPONENTS
// ===========================================================================================

// Style cho container chứa input và icon
const inputWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "10px", // Khoảng cách giữa icon và input
  padding: "12px 15px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  background: "#fafafa", // Màu nền nhẹ
};

// Style cho input field
const inputStyle = {
  border: "none",
  outline: "none",
  fontSize: "15px",
  flex: 1, // Chiếm toàn bộ không gian còn lại
  background: "transparent", // Trong suốt để thấy background của wrapper
};

// Style cho nút đăng nhập
const loginBtn = {
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#044835", // Màu xanh đậm
  color: "#fff",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
  transition: "0.3s", // Hiệu ứng chuyển màu mượt
  marginTop: "10px",
};
