import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Clean input function to prevent encoding issues
  const cleanInput = (value) => {
    if (!value) return "";
    // Remove control characters, trim, and normalize
    return value
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII
      .trim()
      .toLowerCase(); // Normalize email to lowercase
  };

  const handleEmailChange = (e) => {
    const rawValue = e.target.value;
    const cleanedValue = cleanInput(rawValue);
    
    console.log("Raw input:", rawValue);
    console.log("Cleaned input:", cleanedValue);
    console.log("Input bytes:", new TextEncoder().encode(cleanedValue));
    
    setEmail(cleanedValue);
    setErrorMessage(""); // Clear error when user types
  };

  const validateEmail = (email) => {
    // Simple but strict email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 255;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setMessage("");

    // Final clean and validate
    const finalEmail = cleanInput(email);
    
    console.log("Final email being sent:", finalEmail);
    console.log("Email length:", finalEmail.length);
    
    if (!finalEmail) {
      setErrorMessage("Vui lòng nhập email!");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(finalEmail)) {
      setErrorMessage("Email không hợp lệ! Vui lòng kiểm tra định dạng.");
      setIsLoading(false);
      return;
    }

    const requestBody = {
      email: finalEmail
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    try {
      // Use environment variable for API URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const apiUrl = `${API_BASE_URL}api/auth/forgot-password`;
      
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      let responseData;
      try {
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        if (responseText.trim()) {
          responseData = JSON.parse(responseText);
        } else {
          responseData = { message: "Empty response" };
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        responseData = { message: "Invalid response format" };
      }

      if (response.ok) {
        setMessage("Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.");
        setEmail(""); // Clear form
      } else {
        const errorText = responseData.message || "Có lỗi xảy ra";
        
        if (response.status === 404) {
          setErrorMessage("Email không tồn tại trong hệ thống!");
        } else if (response.status === 400) {
          setErrorMessage("Email không hợp lệ hoặc định dạng sai!");
        } else if (response.status === 500) {
          setErrorMessage("Lỗi server. Vui lòng thử lại sau!");
        } else {
          setErrorMessage(`Lỗi: ${errorText}`);
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrorMessage(`Lỗi kết nối: ${error.message}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h1>EV Warranty</h1>
          <h2>Quên mật khẩu</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Nhập email của bạn để nhận link khôi phục mật khẩu
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={handleEmailChange}
                required
                autoComplete="email"
                maxLength="255"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontFamily: "Arial, sans-serif" // Ensure consistent font
                }}
              />
              <small style={{ color: "#666", fontSize: "12px" }}>
                Ví dụ: user@example.com
              </small>
            </div>

            {errorMessage && (
              <div style={{ 
                color: "#dc3545", 
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
                padding: "10px",
                fontSize: "14px", 
                marginBottom: "15px" 
              }}>
                {errorMessage}
              </div>
            )}

            {message && (
              <div style={{ 
                color: "#155724", 
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb", 
                borderRadius: "4px",
                padding: "10px",
                fontSize: "14px", 
                marginBottom: "15px" 
              }}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: isLoading ? "#6c757d" : "#044835",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: isLoading ? "not-allowed" : "pointer",
                marginBottom: "20px"
              }}
            >
              {isLoading ? "Đang gửi..." : "Gửi email khôi phục"}
            </button>

            <div style={{ textAlign: "center" }}>
              <Link 
                to="/login" 
                style={{ 
                  color: "#044835", 
                  textDecoration: "none",
                  fontSize: "14px"
                }}
              >
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>

        <div className="auth-right">
          <img
            src="https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg"
            alt="EV"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        </div>
      </div>
    </div>
  );
}
