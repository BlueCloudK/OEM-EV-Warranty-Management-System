import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [roleId, setRoleId] = useState(5); // Default to CUSTOMER
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    
    // Validation cơ bản
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu không khớp!");
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setErrorMessage("Username chỉ chứa chữ cái, số và gạch dưới!");
      setIsLoading(false);
      return;
    }
    if (username.length < 3 || username.length > 50) {
      setErrorMessage("Username phải từ 3 đến 50 ký tự!");
      setIsLoading(false);
      return;
    }
    if (password.length < 6 || password.length > 255) {
      setErrorMessage("Mật khẩu phải từ 6 đến 255 ký tự!");
      setIsLoading(false);
      return;
    }
    if (address.length < 10 || address.length > 255) {
      setErrorMessage("Địa chỉ phải từ 10 đến 255 ký tự!");
      setIsLoading(false);
      return;
    }
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      setErrorMessage("Email không hợp lệ!");
      setIsLoading(false);
      return;
    }
    if (roleId < 1 || roleId > 5) {
      setErrorMessage("Role không hợp lệ!");
      setIsLoading(false);
      return;
    }

    const body = {
      username,
      email,
      password,
      address,
      roleId: roleId
    };

    console.log("Request body gửi đi:", JSON.stringify(body, null, 2));

    // Use environment variable for API URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const apiUrl = `${API_BASE_URL}api/auth/register`;
    
    console.log("API URL:", apiUrl);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      let responseData;
      try {
        responseData = await res.json();
      } catch (jsonError) {
        responseData = await res.text();
        console.log("Response is not JSON, got text:", responseData);
      }

      console.log(`Response from ${apiUrl}:`, {
        status: res.status,
        data: responseData,
      });

      if (res.ok) {
        setErrorMessage("");
        alert("Đăng ký thành công!");
        navigate("/login");
      } else {
        let errorMsg;
        const errorText = typeof responseData === 'object' 
          ? responseData.message || JSON.stringify(responseData)
          : responseData;
        
        // Provide user-friendly error messages for common backend issues
        if (res.status === 400) {
          if (errorText.includes("JPA EntityManager") || errorText.includes("transaction")) {
            errorMsg = "Lỗi hệ thống database. Vui lòng thử lại sau ít phút hoặc liên hệ admin.";
          } else if (errorText.includes("username") && errorText.includes("exist")) {
            errorMsg = "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
          } else if (errorText.includes("email") && errorText.includes("exist")) {
            errorMsg = "Email đã được sử dụng. Vui lòng dùng email khác.";
          } else if (errorText.includes("validation") || errorText.includes("invalid")) {
            errorMsg = "Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại.";
          } else {
            errorMsg = `Đăng ký thất bại: ${errorText}`;
          }
        } else if (res.status === 500) {
          errorMsg = "Lỗi server nội bộ. Vui lòng thử lại sau hoặc liên hệ admin.";
        } else {
          errorMsg = `Đăng ký thất bại (${res.status}): ${errorText}`;
        }
        
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error(`Network error:`, error);
      setErrorMessage(
        `Đăng ký thất bại do lỗi kết nối. Chi tiết: ${error.message}`
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h1>EV Warranty</h1>
          <h2>Tạo Tài Khoản</h2>
          <form className="auth-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Tên đăng nhập (chữ/số/_, 3-50 ký tự)"
              required
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_]+"
              title="Chỉ chứa chữ cái, số và gạch dưới"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email (ví dụ: test@example.com)"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu (6-255 ký tự)"
              required
              minLength={6}
              maxLength={255}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <input
              type="text"
              placeholder="Địa chỉ (10-255 ký tự)"
              required
              minLength={10}
              maxLength={255}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <select
              value={roleId}
              onChange={(e) => setRoleId(parseInt(e.target.value))}
            >
              <option value={1}>Admin</option>
              <option value={2}>SC Staff</option>
              <option value={3}>SC Technician</option>
              <option value={4}>EVM Staff</option>
              <option value={5}>Customer</option>
            </select>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="button-group">
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                disabled={isLoading}
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </div>
        <div className="auth-right">
          <img
            src="https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg"
            alt="EV"
          />
        </div>
      </div>
    </div>
  );
}

// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//   const navigate = useNavigate();

//   return (
//     <div
//       className="auth-page"
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(135deg, #325f65ff 0%, #e8f5e9 100%)",
//       }}
//     >
//       <div
//         className="auth-card"
//         style={{
//           display: "flex",
//           width: "950px",
//           height: "560px",
//           borderRadius: "16px",
//           overflow: "hidden",
//           boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
//           background: "#fff",
//         }}
//       >
//         {/* Left side (form) */}
//         <div
//           className="auth-left"
//           style={{ flex: 1, padding: "50px 40px", overflowY: "hidden" }}
//         >
//           <h1 style={{ marginBottom: "30px", color: "#044835", fontWeight: "700" }}>
//             EV Warranty
//           </h1>
//           <h2 style={{ margin: "0 0 10px 0", fontSize: "26px", color: "#333" }}>
//             Create Account
//           </h2>
          

//           <form
//             className="form"
//             style={{ display: "flex", flexDirection: "column", gap: "15px" }}
//           >
//             <input
//               type="text"
//               placeholder="Full Name"
//               required
//               style={inputStyle}
//             />
//             <input
//               type="number"
//               placeholder="Phone Number"
//               required
//               style={inputStyle}
//             />
//             <input type="email" placeholder="Email" required style={inputStyle} />
//             <input
//               type="password"
//               placeholder="Password"
//               required
//               style={inputStyle}
//             />
//             <input
//               type="password"
//               placeholder="Confirm Password"
//               required
//               style={inputStyle}
//             />

//             <div style={{ display: "flex", gap: 12, marginTop: "10px" }}>
//               <button
//                 type="submit"
//                 className="btn-primary"
//                 style={btnPrimary}
//                 onMouseOver={(e) => (e.target.style.background = "#06694e")}
//                 onMouseOut={(e) => (e.target.style.background = "#044835")}
//               >
//                 Create account
//               </button>
//               <button
//                 type="button"
//                 className="btn-outline"
//                 style={btnOutline}
//                 onClick={() => navigate("/login")}
//                 onMouseOver={(e) => {
//                   e.target.style.background = "#044835";
//                   e.target.style.color = "#fff";
//                 }}
//                 onMouseOut={(e) => {
//                   e.target.style.background = "#fff";
//                   e.target.style.color = "#044835";
//                 }}
//               >
//                 Login
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Right side (image) */}
//         <div className="auth-right" style={{ flex: 1, position: "relative" }}>
//           <img
//             style={{
//               width: "121%",
//               height: "122%",
//               objectFit: "cover",
//             }}
//             src="https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg"
//           />          
//         </div>
//       </div>
//     </div>
//   );
// }

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
