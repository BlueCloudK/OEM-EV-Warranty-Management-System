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
import AdminServiceHistoriesManagement from "./pages/Admin/AdminServiceHistoriesManagement";
import AdminLayout from "./components/AdminLayout";

// SCStaff
import SCStaffDashboard from "./pages/SCStaff/SCStaffDashboard";
import CustomerManagement from "./pages/SCStaff/CustomerManagement";
import CreateCustomerAccount from "./pages/SCStaff/CreateCustomerAccount";
import VehicleManagement from "./pages/SCStaff/VehicleManagement";
import WarrantyClaimsManagement from "./pages/SCStaff/WarrantyClaimsManagement";
import ServiceHistoryManagement from "./pages/SCStaff/ServiceHistoryManagement";
import InstalledPartManagement from "./pages/SCStaff/InstalledPartManagement";
import SCStaffLayout from "./components/SCStaffLayout";

// EVM
import EVMLayout from "./components/EVMLayout";
import EVMDashboard from "./pages/EVM/EVMDashboard";
import EVMWarrantyClaims from "./pages/EVM/EVMWarrantyClaims";
import EVMPartManagement from "./pages/EVM/EVMPartManagement";
import EVMVehicleManagement from "./pages/EVM/EVMVehicleManagement";
import EVMWorkLogs from "./pages/EVM/EVMWorkLogs";
import EVMServiceCenters from "./pages/EVM/EVMServiceCenters";
import EVMFeedbacks from "./pages/EVM/EVMFeedbacks";
import EVMInstalledParts from "./pages/EVM/EVMInstalledParts";
import EVMServiceHistories from "./pages/EVMStaff/EVMServiceHistories";

// SCTechnician
import SCTechnicianLayout from "./components/SCTechnicianLayout";
import SCTechnicianDashboard from "./pages/SCTechnician/SCTechnicianDashboard";
import TechWarrantyClaims from "./pages/SCTechnician/TechWarrantyClaims";
import MyWork from "./pages/SCTechnician/MyWork";

// Customer
import CustomerLayout from "./components/CustomerLayout";
import CustomerDashboardNew from "./pages/Customer/CustomerDashboardNew";
import CustomerProfile from "./pages/Customer/CustomerProfile";
import WarrantyHistory from "./pages/Customer/WarrantyHistory";
import MyVehicles from "./pages/Customer/MyVehicles";
import CustomerFeedback from "./pages/Customer/CustomerFeedback";

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

        {/* === SCSTAFF ROUTES === */}
        <Route path="/scstaff" element={<SCStaffLayout />}>
          <Route index element={<SCStaffDashboard />} />
          <Route path="dashboard" element={<SCStaffDashboard />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="create-customer-account" element={<CreateCustomerAccount />} />
          <Route path="vehicles" element={<VehicleManagement />} />
          <Route path="warranty-claims" element={<WarrantyClaimsManagement />} />
          <Route path="service-history" element={<ServiceHistoryManagement />} />
          <Route path="installed-parts" element={<InstalledPartManagement />} />
        </Route>

        {/* === ADMIN ROUTES === */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="customers" element={<AdminCustomerManagement />} />
          <Route path="vehicles" element={<AdminVehicleManagement />} />
          <Route path="parts" element={<AdminPartsManagement />} />
          <Route path="warranty-claims" element={<AdminWarrantyClaimsManagement />} />
          <Route path="service-histories" element={<AdminServiceHistoriesManagement />} />
        </Route>

        {/* === EVM STAFF ROUTES === */}
        <Route path="/evmstaff" element={<EVMLayout />}>
          <Route index element={<EVMDashboard />} />
          <Route path="dashboard" element={<EVMDashboard />} />
          <Route path="warranty-claims" element={<EVMWarrantyClaims />} />
          <Route path="parts" element={<EVMPartManagement />} />
          <Route path="vehicles" element={<EVMVehicleManagement />} />
          <Route path="customers" element={<div><h1>Quản lý Khách hàng (EVM)</h1><p>Chức năng đang được xây dựng.</p></div>} />
          <Route path="service-histories" element={<EVMServiceHistories />} />
          <Route path="work-logs" element={<EVMWorkLogs />} />
          <Route path="service-centers" element={<EVMServiceCenters />} />
          <Route path="feedbacks" element={<EVMFeedbacks />} />
          <Route path="installed-parts" element={<EVMInstalledParts />} />
        </Route>

        {/* === SC TECHNICIAN ROUTES === */}
        <Route path="/sctechnician" element={<SCTechnicianLayout />}>
          <Route index element={<SCTechnicianDashboard />} />
          <Route path="dashboard" element={<SCTechnicianDashboard />} />
          <Route path="warranty-claims" element={<MyWork />} />
          <Route path="my-work" element={<MyWork />} />
          <Route path="service-history" element={<div><h1>Lịch sử Sửa chữa</h1><p>Chức năng đang được xây dựng.</p></div>} />
          <Route path="vehicles" element={<div><h1>Tra cứu Xe</h1><p>Chức năng đang được xây dựng.</p></div>} />
          <Route path="parts" element={<div><h1>Xem Phụ tùng</h1><p>Chức năng đang được xây dựng.</p></div>} />
        </Route>

        {/* === CUSTOMER ROUTES === */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboardNew />} />
          <Route path="dashboard" element={<CustomerDashboardNew />} />
          <Route path="my-vehicles" element={<MyVehicles />} />
          <Route path="warranty-history" element={<WarrantyHistory />} />
          <Route path="warranty-claims" element={<div><h1>Yêu cầu Bảo hành</h1><p>Chức năng đang được xây dựng.</p></div>} />
          <Route path="feedback" element={<CustomerFeedback />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>

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
