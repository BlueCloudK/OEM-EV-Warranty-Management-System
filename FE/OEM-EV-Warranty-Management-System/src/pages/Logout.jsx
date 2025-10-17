import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSignOutAlt, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaHome,
  FaUser
} from "react-icons/fa";
import "./Auth.css";

export default function Logout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(true);

  useEffect(() => {
    // Auto logout if user came here without confirmation
    const urlParams = new URLSearchParams(window.location.search);
    const autoLogout = urlParams.get('auto');
    
    if (autoLogout === 'true') {
      setShowConfirmation(false);
      handleLogout();
    }
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setErrorMessage("");

      // Get user data from localStorage
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      console.log("Logout attempt:", {
        hasAccessToken: !!accessToken,
        userId: userId,
        timestamp: new Date().toISOString()
      });

      // Prepare request body according to your format
      const requestBody = {
        accessToken: accessToken || "",
        userId: userId ? parseInt(userId) : 0
      };

      console.log("Logout request body:", JSON.stringify(requestBody, null, 2));

      // Call logout API if we have valid data
      if (accessToken && userId) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const apiUrl = `${API_BASE_URL}api/auth/logout`;
        
        console.log("Calling logout API:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true"
          },
          body: JSON.stringify(requestBody),
        });

        console.log("Logout response status:", response.status);

        let responseData;
        try {
          const responseText = await response.text();
          console.log("Raw logout response:", responseText);
          
          if (responseText.trim()) {
            responseData = JSON.parse(responseText);
            console.log("Parsed logout response:", responseData);
          } else {
            responseData = { message: "Logout successful" };
          }
        } catch (parseError) {
          console.error("Parse error:", parseError);
          responseData = { message: "Logout completed" };
        }

        if (response.ok) {
          console.log("Logout API successful");
          setLogoutSuccess(true);
        } else {
          console.warn("Logout API failed but continuing:", response.status, responseData);
          // Don't show error for logout - just continue with local cleanup
        }
      } else {
        console.log("No valid token/userId found, skipping API call");
      }

      // Always clear localStorage regardless of API response
      console.log("Clearing localStorage...");
      localStorage.clear();
      
      // Clear all possible token keys
      const keysToRemove = [
        'accessToken', 'refreshToken', 'token', 
        'userId', 'username', 'role', 'customerId',
        'userRole', 'userInfo', 'loginTime'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      console.log("Logout completed successfully");
      setLogoutSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);

    } catch (error) {
      console.error("Logout error:", error);
      setErrorMessage(`Lỗi đăng xuất: ${error.message}`);
      
      // Even if API fails, clear local storage and redirect
      localStorage.clear();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  const handleForceLogout = () => {
    setShowConfirmation(false);
    handleLogout();
  };

  // Show confirmation dialog
  if (showConfirmation && !logoutSuccess) {
    return (
      <div style={containerStyle}>
        <div style={logoutCardStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <FaSignOutAlt style={{ color: "#dc3545", fontSize: "48px", marginBottom: "20px" }} />
            <h1 style={{ margin: 0, color: "#044835", marginBottom: "10px" }}>
              Xác nhận đăng xuất
            </h1>
            <p style={{ color: "#666", textAlign: "center", margin: 0 }}>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={errorMessageStyle}>
              <FaExclamationTriangle style={{ marginRight: "8px" }} />
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div style={actionButtonsStyle}>
            <button 
              onClick={handleCancel}
              style={cancelButtonStyle}
              disabled={isLoggingOut}
            >
              Hủy
            </button>
            <button 
              onClick={handleForceLogout}
              style={logoutButtonStyle}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <FaSpinner style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
                  Đang đăng xuất...
                </>
              ) : (
                <>
                  <FaSignOutAlt style={{ marginRight: "8px" }} />
                  Đăng xuất
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show logout progress/success
  return (
    <div style={containerStyle}>
      <div style={logoutCardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          {logoutSuccess ? (
            <>
              <FaCheckCircle style={{ color: "#28a745", fontSize: "48px", marginBottom: "20px" }} />
              <h1 style={{ margin: 0, color: "#28a745", marginBottom: "10px" }}>
                Đăng xuất thành công
              </h1>
              <p style={{ color: "#666", textAlign: "center", margin: 0 }}>
                Bạn đã đăng xuất khỏi hệ thống. Đang chuyển hướng đến trang đăng nhập...
              </p>
            </>
          ) : (
            <>
              <FaSpinner style={{ 
                color: "#044835", 
                fontSize: "48px", 
                marginBottom: "20px",
                animation: "spin 1s linear infinite" 
              }} />
              <h1 style={{ margin: 0, color: "#044835", marginBottom: "10px" }}>
                Đang đăng xuất
              </h1>
              <p style={{ color: "#666", textAlign: "center", margin: 0 }}>
                Vui lòng đợi trong khi hệ thống xử lý yêu cầu đăng xuất...
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={errorMessageStyle}>
            <FaExclamationTriangle style={{ marginRight: "8px" }} />
            {errorMessage}
            <div style={{ marginTop: "10px", fontSize: "12px" }}>
              Hệ thống sẽ tự động chuyển hướng trong giây lát...
            </div>
          </div>
        )}

        {/* Progress Info */}
        {isLoggingOut && (
          <div style={progressStyle}>
            <div style={{ marginBottom: "10px" }}>
              ✓ Đang xóa thông tin phiên đăng nhập...
            </div>
            <div style={{ marginBottom: "10px" }}>
              ✓ Đang gọi API đăng xuất...
            </div>
            <div style={{ marginBottom: "10px" }}>
              ✓ Đang xóa dữ liệu local...
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {logoutSuccess && (
          <div style={quickActionsStyle}>
            <button 
              onClick={() => navigate("/login")}
              style={loginButtonStyle}
            >
              <FaUser style={{ marginRight: "8px" }} />
              Đăng nhập lại
            </button>
            <button 
              onClick={() => navigate("/")}
              style={homeButtonStyle}
            >
              <FaHome style={{ marginRight: "8px" }} />
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#f8f9fa",
  padding: "20px"
};

const logoutCardStyle = {
  backgroundColor: "#fff",
  borderRadius: "16px",
  padding: "40px",
  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
  border: "1px solid #e3e6f0",
  maxWidth: "500px",
  width: "100%",
  textAlign: "center"
};

const headerStyle = {
  marginBottom: "30px"
};

const errorMessageStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "15px",
  backgroundColor: "#f8d7da",
  border: "1px solid #f5c6cb",
  borderRadius: "8px",
  color: "#721c24",
  marginBottom: "20px",
  fontSize: "14px",
  textAlign: "left"
};

const progressStyle = {
  backgroundColor: "#e7f3ff",
  border: "1px solid #b3d9ff",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
  fontSize: "14px",
  color: "#0066cc",
  textAlign: "left"
};

const actionButtonsStyle = {
  display: "flex",
  gap: "15px",
  justifyContent: "center",
  flexWrap: "wrap"
};

const cancelButtonStyle = {
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  transition: "background-color 0.3s",
  display: "flex",
  alignItems: "center"
};

const logoutButtonStyle = {
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  transition: "background-color 0.3s",
  display: "flex",
  alignItems: "center"
};

const quickActionsStyle = {
  display: "flex",
  gap: "15px",
  justifyContent: "center",
  marginTop: "20px",
  flexWrap: "wrap"
};

const loginButtonStyle = {
  backgroundColor: "#044835",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  transition: "background-color 0.3s",
  display: "flex",
  alignItems: "center"
};

const homeButtonStyle = {
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  transition: "background-color 0.3s",
  display: "flex",
  alignItems: "center"
};
