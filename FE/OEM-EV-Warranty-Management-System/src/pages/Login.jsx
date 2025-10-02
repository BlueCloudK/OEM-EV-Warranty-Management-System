import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      className="auth-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #325f65ff 0%, #e8f5e9 100%)",
      }}
    >
      <div
        className="auth-card"
        style={{
          display: "flex",
          width: "950px",
          height: "560px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          background: "#fff",
        }}
      >
        <div
          className="auth-left"
          style={{ flex: 1, padding: "50px 40px", overflowY: "hidden" }}
        >
          <h1
            style={{
              marginBottom: "30px",
              color: "#044835",
              fontWeight: "700",
            }}
          >
            EV Warranty
          </h1>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "26px", color: "#333" }}>
            Login
          </h2>

          <form
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            onSubmit={handleLogin}
          >
            <input
              type="text"
              placeholder="Username"
              required
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errorMessage && (
              <p style={{ color: "red", fontSize: 14, margin: 0 }}>
                {errorMessage}
              </p>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: "10px" }}>
              <button type="submit" style={btnPrimary} disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Login"}
              </button>
              <button
                type="button"
                style={btnOutline}
                onClick={() => navigate("/register")}
                disabled={isLoading}
              >
                Register
              </button>
            </div>
          </form>
        </div>

        <div className="auth-right" style={{ flex: 1, position: "relative" }}>
          <img
            style={{ width: "121%", height: "122%", objectFit: "cover" }}
            src="https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg"
            alt="EV"
          />
        </div>
      </div>
    </div>
  );
}

// 🔹 Styles
const inputStyle = {
  padding: "12px 15px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  outline: "none",
  fontSize: "14px",
  transition: "0.2s",
};
const btnPrimary = {
  flex: 1,
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#044835",
  color: "#fff",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
  transition: "0.3s",
};
const btnOutline = {
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  border: "2px solid #044835",
  background: "#fff",
  color: "#044835",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s",
};
