import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Customer from "./Roles/Customer/Customer";
import SCStaff from "./Roles/SCStaff/SCStaff";
import Booking from "./Roles/Customer/Booking"; 
import WarrantyResult from "./Roles/Customer/WarrantyResult";
import WarrantyHistory from "./Roles/Customer/WarrantyHistory";
import PartsWarranty from "./Roles/Customer/PartsWarranty";

export default function App() {
  const location = useLocation();
  return (
    <>
      {location.pathname && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        // Customer
        <Route path="/customer/dashboard" element={<Customer />} />
        <Route path="/booking" element={<Booking />} /> 
        <Route path="/customer/warranty-result" element={<WarrantyResult />} /> 
        <Route path="/customer/warranty-history" element={<WarrantyHistory />} />
        <Route path="/customer/parts-warranty" element={<PartsWarranty />} />
        // SCStaff
        <Route path="/scstaff/dashboard" element={<SCStaff />} />
      </Routes>
      <footer className="footer">
        <div className="container">
          <p style={{ color: "#0a0404ff" }}>
            {new Date().getFullYear()} EV Warranty — All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}