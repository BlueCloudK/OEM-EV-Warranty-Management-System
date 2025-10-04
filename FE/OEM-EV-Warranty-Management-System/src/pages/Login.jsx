import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(
        "https://2062f77dd483.ngrok-free.app/api/auth/login",
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json(); // backend trả { token: "..." }
        console.log("JWT:", data.token);

        localStorage.setItem("token", data.token); // lưu JWT
        alert("Login thành công!");
        navigate("/dashboard");
      } else {
        const err = await res.text();
        setErrorMessage("Login thất bại: " + err);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Login thất bại. Kiểm tra console để biết chi tiết.");
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
      {/* Overlay làm mờ nền */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
        }}
      />

      {/* Khung đăng nhập */}
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
        {/* Left side */}
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
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#06694e")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "#044835")
              }
            >
              Đăng nhập
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              style={registerBtn}
              onMouseOver={(e) => {
                e.target.style.background = "#044835";
                e.target.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#fff";
                e.target.style.color = "#044835";
              }}
            >
              Đăng ký
            </button>

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: "#044835",
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </a>
            </div>
          </form>
        </div>

        {/* Right side (ảnh xe đẹp, overlay gradient) */}
        <div
          style={{
            flex: 1,
            position: "relative",
            backgroundImage:
              "url('https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
        </div>
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
const registerBtn = {
  padding: "12px",
  border: "2px solid #044835",
  borderRadius: "10px",
  background: "#fff",
  color: "#044835",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
  transition: "0.3s",
};

