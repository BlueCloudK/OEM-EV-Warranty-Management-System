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
  const [roleName, setRoleName] = useState("USER");
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

    const now = new Date();
    const offset = "+07:00";
    const createdAt =
      new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -1) + offset;

    const body = {
      username,
      password,
      address,
      email,
      createdAt,
      role: { roleName },
    };

    console.log("Request body gửi đi:", JSON.stringify(body, null, 2));

    // Chỉ dùng Ngrok URL
    const apiUrl = "https://2062f77dd483.ngrok-free.app/api/auth/register";

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      console.log(`Response from ${apiUrl}:`, {
        status: res.status,
        body: text,
      });

      if (res.ok) {
        setErrorMessage("");
        alert("Đăng ký thành công!");
        navigate("/login");
      } else {
        setErrorMessage(`Đăng ký thất bại (Status: ${res.status}): ${text}`);
      }
    } catch (error) {
      console.error(`Error with ${apiUrl}:`, error.message);
      setErrorMessage(
        `Đăng ký thất bại do lỗi kết nối. Vui lòng kiểm tra server. Chi tiết: ${error.message}`
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
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            >
              <option value="USER">User</option>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
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
