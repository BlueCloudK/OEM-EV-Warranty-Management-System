import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/customer/dashboard"); // demo
  };

  return (
    <div className="auth-page" style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(135deg, #0a413fff 0%, #f1f8e9 100%)" 
    }}>
      <div className="auth-card" style={{
        display: "flex",
        width: "900px",
        height: "520px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        background: "#fff"
      }}>
        
        {/* Left side (form) */}
        <div className="auth-left" style={{ flex: 1, padding: "50px 40px" }}>
          <h1 style={{ marginBottom: "30px", color: "#044835", fontWeight: "700" }}>
            EV Warranty
          </h1>
          <form className="form" onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                padding: "12px 15px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "14px",
                transition: "0.2s",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid #044835")}
              onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "12px 15px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "14px",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid #044835")}
              onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
            />

            <div style={{ display: "flex", gap: 12, marginTop: "10px" }}>
              <button
                className="btn-primary"
                type="submit"
                style={{
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
                }}
                onMouseOver={(e) => (e.target.style.background = "#06694e")}
                onMouseOut={(e) => (e.target.style.background = "#044835")}
              >
                Sign in
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => navigate("/register")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "2px solid #044835",
                  background: "#fff",
                  color: "#044835",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#044835";
                  e.target.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "#fff";
                  e.target.style.color = "#044835";
                }}
              >
                Register
              </button>
            </div>

            <div style={{ marginTop: 12, textAlign: "right" }}>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ color: "#120707ff", fontSize: 13, textDecoration: "none" }}
              >
                Forgot password?
              </a>
            </div>
          </form>
        </div>

        {/* Right side (image) */}
        <div className="auth-right" style={{ flex: 1, position: "relative" }}>
          <img
            style={{
              width: "121%",
              height: "123%",
              objectFit: "cover",
            }}
            src="https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg"
          />          
        </div>
      </div>
    </div>
  );
}
