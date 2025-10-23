import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Logout from "./pages/Logout";

// --- Refactored Pages ---
// Admin
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUserManagement from "./pages/Admin/AdminUserManagement";
import AdminCustomerManagement from "./pages/Admin/AdminCustomerManagement";
import AdminVehicleManagement from "./pages/Admin/AdminVehicleManagement";
import AdminPartsManagement from "./pages/Admin/AdminPartsManagement";
import AdminWarrantyClaimsManagement from "./pages/Admin/AdminWarrantyClaimsManagement";
import AdminServiceHistoriesManagement from "./pages/Admin/AdminServiceHistoriesManagement"; // New import

// SCStaff
import SCStaffDashboard from "./pages/SCStaff/SCStaffDashboard";
import CustomerManagement from "./pages/SCStaff/CustomerManagement";
import CreateCustomerAccount from "./pages/SCStaff/CreateCustomerAccount";
import VehicleManagement from "./pages/SCStaff/VehicleManagement";
import WarrantyClaimsManagement from "./pages/SCStaff/WarrantyClaimsManagement";
import ServiceHistoryManagement from "./pages/SCStaff/ServiceHistoryManagement";

export default function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname && <Navbar />}

      <Routes>
        {/* Core Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />

        {/* === SCSTAFF ROUTES (Fully Refactored) === */}
        <Route path="/scstaff" element={<SCStaffDashboard />} />
        <Route path="/scstaff/dashboard" element={<SCStaffDashboard />} />
        <Route path="/scstaff/customers" element={<CustomerManagement />} />
        <Route path="/scstaff/create-customer-account" element={<CreateCustomerAccount />} />
        <Route path="/scstaff/vehicles" element={<VehicleManagement />} />
        <Route path="/scstaff/warranty-claims" element={<WarrantyClaimsManagement />} />
        <Route path="/scstaff/service-history" element={<ServiceHistoryManagement />} />

        {/* === ADMIN ROUTES (Rebuilding...) === */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/customers" element={<AdminCustomerManagement />} />
        <Route path="/admin/vehicles" element={<AdminVehicleManagement />} />
        <Route path="/admin/parts" element={<AdminPartsManagement />} />
        <Route path="/admin/warranty-claims" element={<AdminWarrantyClaimsManagement />} />
        <Route path="/admin/service-histories" element={<AdminServiceHistoriesManagement />} />

        {/* 
          TODO: Rebuild the remaining Admin pages and all pages for other roles.
        */}

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
