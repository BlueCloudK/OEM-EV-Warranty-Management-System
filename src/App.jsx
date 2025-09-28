// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom"; // bỏ BrowserRouter as Router
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";

function CustomerDashboard() {
  return <h2>Welcome, Customer!</h2>;
}
function SCStaffDashboard() {
  return <h2>Welcome, Service Center Staff!</h2>;
}
function TechnicianDashboard() {
  return <h2>Welcome, Technician!</h2>;
}
function EVMStaffDashboard() {
  return <h2>Welcome, EVM Staff!</h2>;
}
function AdminDashboard() {
  return <h2>Welcome, Admin!</h2>;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/sc-staff/dashboard" element={<SCStaffDashboard />} />
        <Route
          path="/sc-technician/dashboard"
          element={<TechnicianDashboard />}
        />
        <Route path="/evm/dashboard" element={<EVMStaffDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} EV Warranty — All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
