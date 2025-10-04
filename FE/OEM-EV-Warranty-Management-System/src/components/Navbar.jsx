import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="topbar">
      <div className="container nav-inner">
        <div className="logo">EV Warranty</div>
        <nav>
          <Link to="/" className="nav-link">Trang chủ</Link>
          <Link to="/login" className="nav-link">Đăng nhập</Link>
          <Link to="/register" className="nav-cta">Đăng Ký</Link>
        </nav>
      </div>
    </header>
  );
}
