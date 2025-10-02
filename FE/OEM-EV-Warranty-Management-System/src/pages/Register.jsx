import React from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

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
        {/* Left side (form) */}
        <div
          className="auth-left"
          style={{ flex: 1, padding: "50px 40px", overflowY: "hidden" }}
        >
          <h1 style={{ marginBottom: "30px", color: "#044835", fontWeight: "700" }}>
            EV Warranty
          </h1>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "26px", color: "#333" }}>
            Create Account
          </h2>
          

          <form
            className="form"
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="text"
              placeholder="Full Name"
              required
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Phone Number"
              required
              style={inputStyle}
            />
            <input type="email" placeholder="Email" required style={inputStyle} />
            <input
              type="password"
              placeholder="Password"
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              required
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: 12, marginTop: "10px" }}>
              <button
                type="submit"
                className="btn-primary"
                style={btnPrimary}
                onMouseOver={(e) => (e.target.style.background = "#06694e")}
                onMouseOut={(e) => (e.target.style.background = "#044835")}
              >
                Create account
              </button>
              <button
                type="button"
                className="btn-outline"
                style={btnOutline}
                onClick={() => navigate("/login")}
                onMouseOver={(e) => {
                  e.target.style.background = "#044835";
                  e.target.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "#fff";
                  e.target.style.color = "#044835";
                }}
              >
                Login
              </button>
            </div>
          </form>
        </div>

        {/* Right side (image) */}
        <div className="auth-right" style={{ flex: 1, position: "relative" }}>
          <img
            style={{
              width: "121%",
              height: "122%",
              objectFit: "cover",
            }}
            src="https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg"
          />          
        </div>
      </div>
    </div>
  );
}

// 🔹 Styles (tái sử dụng)
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
