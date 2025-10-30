import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if token exists
    if (!resetToken) {
      setErrorMessage("Token không hợp lệ hoặc đã hết hạn!");
    }
  }, [resetToken]);

  // Clean input function to prevent encoding issues
  const cleanInput = (value) => {
    if (!value) return "";
    // Remove control characters but keep password special chars
    return value
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
  };

  const handlePasswordChange = (e, type) => {
    const rawValue = e.target.value;
    const cleanedValue = cleanInput(rawValue);
    
    if (type === 'new') {
      setNewPassword(cleanedValue);
    } else {
      setConfirmPassword(cleanedValue);
    }
    setErrorMessage(""); // Clear error when user types
  };

  const validatePassword = (password) => {
    // Password validation rules
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (password.length > 100) {
      return "Mật khẩu không được vượt quá 100 ký tự";
    }
    // Check for at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setMessage("");

    // Final clean passwords
    const finalNewPassword = cleanInput(newPassword);
    const finalConfirmPassword = cleanInput(confirmPassword);
    
    console.log("Reset password attempt:", {
      hasToken: !!resetToken,
      passwordLength: finalNewPassword.length,
      passwordsMatch: finalNewPassword === finalConfirmPassword
    });

    // Validation
    if (!resetToken) {
      setErrorMessage("Token reset password không hợp lệ!");
      setIsLoading(false);
      return;
    }

    if (!finalNewPassword || !finalConfirmPassword) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin!");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(finalNewPassword);
    if (passwordError) {
      setErrorMessage(passwordError);
      setIsLoading(false);
      return;
    }

    if (finalNewPassword !== finalConfirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      setIsLoading(false);
      return;
    }

    // Request body matching your format
    const requestBody = {
      resetToken: resetToken,
      newPassword: finalNewPassword,
      confirmPassword: finalConfirmPassword
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    try {
      // Use environment variable for API URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const apiUrl = `${API_BASE_URL}api/auth/reset-password`;
      
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
        setMessage("Mật khẩu đã được đặt lại thành công! Đang chuyển hướng đến trang đăng nhập...");
        
        // Clear form
        setNewPassword("");
        setConfirmPassword("");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        const errorText = responseData.message || "Có lỗi xảy ra";
        
        if (response.status === 400) {
          setErrorMessage("Token không hợp lệ hoặc mật khẩu không đúng định dạng!");
        } else if (response.status === 401) {
          setErrorMessage("Token đã hết hạn! Vui lòng yêu cầu reset password mới.");
        } else if (response.status === 404) {
          setErrorMessage("Token không tồn tại hoặc đã được sử dụng!");
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
          <h2>Đặt lại mật khẩu</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* New Password Input */}
            <div style={{ marginBottom: "15px", position: "relative" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#fff"
              }}>
                <FaLock style={{ color: "#666", marginRight: "10px" }} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e, 'new')}
                  required
                  autoComplete="new-password"
                  maxLength="100"
                  style={{
                    border: "none",
                    outline: "none",
                    flex: 1,
                    fontSize: "16px",
                    fontFamily: "Arial, sans-serif"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    padding: "0",
                    marginLeft: "10px"
                  }}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <small style={{ color: "#666", fontSize: "12px" }}>
                Ít nhất 6 ký tự, bao gồm chữ cái và số
              </small>
            </div>

            {/* Confirm Password Input */}
            <div style={{ marginBottom: "15px", position: "relative" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#fff"
              }}>
                <FaLock style={{ color: "#666", marginRight: "10px" }} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => handlePasswordChange(e, 'confirm')}
                  required
                  autoComplete="new-password"
                  maxLength="100"
                  style={{
                    border: "none",
                    outline: "none",
                    flex: 1,
                    fontSize: "16px",
                    fontFamily: "Arial, sans-serif"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    padding: "0",
                    marginLeft: "10px"
                  }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error Message */}
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

            {/* Success Message */}
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

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading || !resetToken}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: (isLoading || !resetToken) ? "#6c757d" : "#044835",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: (isLoading || !resetToken) ? "not-allowed" : "pointer",
                marginBottom: "20px"
              }}
            >
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>

            {/* Back to Login Link */}
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