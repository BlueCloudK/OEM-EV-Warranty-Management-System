import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Logout from "./pages/Logout";
//
import Customer from "./Roles/Customer/Customer";
import CustomerProfile from "./Roles/Customer/CustomerProfile";
import VehicleInfo from "./Roles/Customer/VehicleInfo";
import WarrantyClaims from "./Roles/Customer/WarrantyClaims";
import ServiceHistories from "./Roles/Customer/ServiceHistories";
import CreateFeedback from "./Roles/Customer/CreateFeedback";
import InstalledParts from "./Roles/Customer/InstalledParts";
//
import SCStaff from "./Roles/SCStaff/SCStaff";
import CustomerManagement from "./Roles/SCStaff/Profile_Management/CustomerManagement";
import CreateCustomerAccount from "./Roles/SCStaff/Create_Customer_Account/CreateCustomerAccount";
import VehicleManagement from "./Roles/SCStaff/Vehicle_Information_Management/VehicleManagement";
import WarrantyClaimsManagement from "./Roles/SCStaff/Warranty_Claims_Management/WarrantyClaimsManagement";
import ServiceHistoryManagement from "./Roles/SCStaff/Service_History_Management/ServiceHistoryManagement";
//
import Admin from "./Roles/Admin/Admin";
import AdminUserManagement from "./Roles/Admin/AdminUserManagement";
import AdminCustomerManagement from "./Roles/Admin/AdminCustomerManagement";
import EVMStaff from "./Roles/EVMStaff";
import AdminPartsManagement from "./Roles/Admin/AdminPartsManagement";
import AdminVehicleManagement from "./Roles/Admin/AdminVehicleManagement";
import AdminWarrantyClaimsManagement from "./Roles/Admin/AdminWarrantyClaimsManagement";
import AdminServiceHistoriesManagement from "./Roles/Admin/AdminServiceHistoriesManagement";
import AdminServiceCenters from "./Roles/Admin/AdminServiceCenters";
import SCTechnician from "./Roles/SCTechnician";
import AdminFeedback from "./Roles/Admin/AdminFeedback";
import AdminPartRequests from "./Roles/Admin/AdminPartRequests";

export default function App() {
  // Hook để lấy thông tin về route hiện tại
  const location = useLocation();

  return (
    <>
      {/* ===== CONDITIONAL NAVBAR - HIỂN THỊ NAVBAR ĐIỀU KIỆN ===== */}
      {/* Hiển thị Navbar trên tất cả các trang (có thể điều chỉnh logic nếu cần) */}
      {location.pathname && <Navbar />}

      {/* ===== ROUTES CONFIGURATION - CẤU HÌNH CÁC ROUTE ===== */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />
        // Customer
        <Route path="/customer/dashboard" element={<Customer />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/vehicles" element={<VehicleInfo />} />
        <Route path="/customer/warranty-claims" element={<WarrantyClaims />} />
        <Route path="/customer/service-history" element={<ServiceHistories />} />
        <Route path="/customer/feedbacks" element={<CreateFeedback />} />
        <Route path="/customer/installed-parts" element={<InstalledParts />} />
        // SCStaff
        <Route path="/scstaff" element={<SCStaff />} />
        <Route path="/scstaff/dashboard" element={<SCStaff />} />
        <Route path="/scstaff/customers" element={<CustomerManagement />} />
        <Route path="/scstaff/create-customer-account" element={<CreateCustomerAccount />}
        />
        <Route path="/scstaff/vehicles" element={<VehicleManagement />} />
        <Route path="/scstaff/warranty-claims" element={<WarrantyClaimsManagement />} />
        <Route path="/scstaff/service-history" element={<ServiceHistoryManagement />} />
        // Admin
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/dashboard" element={<Admin />} />
        <Route path="/admin/customers" element={<AdminCustomerManagement />} />
        <Route path="/admin/vehicles" element={<AdminVehicleManagement />} />
        <Route path="/admin/parts" element={<AdminPartsManagement />} />
        <Route
          path="/admin/warranty-claims"
          element={<AdminWarrantyClaimsManagement />}
        />
        <Route
          path="/admin/service-histories"
          element={<AdminServiceHistoriesManagement />}
        />
        <Route
          path="/admin/service-centers"
          element={<AdminServiceCenters />}
        />
        <Route path="/admin/part-requests" element={<AdminPartRequests />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        // EVM Staff
        <Route path="/evmstaff" element={<EVMStaff />} />
        <Route path="/evmstaff/dashboard" element={<EVMStaff />} />
        // SC Technician
        <Route path="/sctechnician" element={<SCTechnician />} />
        <Route path="/sctechnician/dashboard" element={<SCTechnician />} />
        // Add fallback dashboard route
        <Route path="/dashboard" element={<Customer />} />
      </Routes>

      {/* ===== FOOTER - CHÂN TRANG ===== */}
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
