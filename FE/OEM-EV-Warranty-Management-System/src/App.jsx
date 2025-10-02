import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Customer from "./Roles/Customer/Customer";

export default function App() {
  const location = useLocation();
  return (
    <>
      {location.pathname && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/customer/dashboard" element={<Customer />} />
      </Routes>
      <footer className="footer">
        <div className="container">
          <p style={{ color: "#0a0404ff" }}> {new Date().getFullYear()} EV Warranty — All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}


