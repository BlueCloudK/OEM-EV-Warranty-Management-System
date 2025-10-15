// ===========================================================================================
// PHẦN 1: IMPORT CÁC THƯ VIỆN VÀ COMPONENTS CẦN THIẾT
// ===========================================================================================

import React from "react";                                    // React core library
import { Routes, Route, useLocation } from "react-router-dom"; // Router components để quản lý navigation

// ===== IMPORT SHARED COMPONENTS =====
import Navbar from "./components/Navbar";                      // Navigation bar component

// ===== IMPORT PAGES CHUNG =====
import Home from "./pages/Home";                               // Trang chủ
import Login from "./pages/Login";                             // Trang đăng nhập  
import ForgotPassword from "./pages/ForgotPassword";           // Trang quên mật khẩu
import ResetPassword from "./pages/ResetPassword";             // Trang đặt lại mật khẩu
import Logout from "./pages/Logout";                           // Trang đăng xuất

// ===== IMPORT CUSTOMER ROLE COMPONENTS =====
import Customer from "./Roles/Customer/Customer";              // Dashboard khách hàng
import CustomerProfile from "./Roles/Customer/CustomerProfile"; // Profile khách hàng
import Booking from "./Roles/Customer/Booking";                // Đặt lịch bảo hành
import WarrantyResult from "./Roles/Customer/WarrantyResult";   // Kết quả bảo hành
import WarrantyHistory from "./Roles/Customer/WarrantyHistory"; // Lịch sử bảo hành
import PartsWarranty from "./Roles/Customer/PartsWarranty";     // Bảo hành phụ kiện

// ===== IMPORT SC STAFF ROLE COMPONENTS =====
import SCStaff from "./Roles/SCStaff/SCStaff";                                         // Dashboard SC Staff
import CustomerManagement from "./Roles/SCStaff/Profile_Management/CustomerManagement"; // Quản lý khách hàng
import CreateCustomerAccount from "./Roles/SCStaff/Create_Customer_Account/CreateCustomerAccount"; // Tạo tài khoản KH
import VehicleManagement from "./Roles/SCStaff/Vehicle_Information_Management/VehicleManagement";   // Quản lý xe

// ===== IMPORT ADMIN ROLE COMPONENTS =====
import Admin from "./Roles/Admin/Admin";                                    // Dashboard Admin
import AdminUserManagement from "./Roles/Admin/AdminUserManagement";        // Quản lý người dùng (Admin)
import AdminCustomerManagement from "./Roles/Admin/AdminCustomerManagement"; // Quản lý khách hàng (Admin)


// ===========================================================================================
// PHẦN 2: MAIN APP COMPONENT - COMPONENT CHÍNH CỦA ỨNG DỤNG
// ===========================================================================================

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
        {/* ===== PUBLIC ROUTES - CÁC ROUTE CÔNG KHAI ===== */}
        <Route path="/" element={<Home />} />                    {/* Trang chủ */}
        <Route path="/login" element={<Login />} />              {/* Đăng nhập */}
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Quên mật khẩu */}
        <Route path="/reset-password" element={<ResetPassword />} />   {/* Đặt lại mật khẩu */}
        <Route path="/logout" element={<Logout />} />            {/* Đăng xuất */}
        
        {/* ===== CUSTOMER ROUTES - CÁC ROUTE CHO KHÁCH HÀNG ===== */}
        <Route path="/customer/dashboard" element={<Customer />} />           {/* Dashboard KH */}
        <Route path="/customer/profile" element={<CustomerProfile />} />      {/* Profile KH */}
        <Route path="/booking" element={<Booking />} />                       {/* Đặt lịch bảo hành */}
        <Route path="/customer/warranty-result" element={<WarrantyResult />} /> {/* Kết quả bảo hành */}
        <Route path="/customer/warranty-history" element={<WarrantyHistory />} /> {/* Lịch sử bảo hành */}
        <Route path="/customer/parts-warranty" element={<PartsWarranty />} />  {/* Bảo hành phụ kiện */}
        
        {/* ===== SC STAFF ROUTES - CÁC ROUTE CHO NHÂN VIÊN TRUNG TÂM DỊCH VỤ ===== */}
        <Route path="/scstaff" element={<SCStaff />} />                       {/* Dashboard SC Staff */}
        <Route path="/scstaff/dashboard" element={<SCStaff />} />             {/* Dashboard SC Staff (alias) */}
        <Route path="/scstaff/customers" element={<CustomerManagement />} />  {/* Quản lý khách hàng */}
        <Route path="/scstaff/create-customer-account" element={<CreateCustomerAccount />} /> {/* Tạo tài khoản KH */}
        <Route path="/scstaff/vehicles" element={<VehicleManagement />} />    {/* Quản lý thông tin xe */}
        
        {/* ===== ADMIN ROUTES - CÁC ROUTE CHO QUẢN TRỊ VIÊN ===== */}
        <Route path="/admin" element={<Admin />} />                          {/* Dashboard Admin */}
        <Route path="/admin/dashboard" element={<Admin />} />                {/* Dashboard Admin (alias) */}
        <Route path="/admin/customers" element={<AdminCustomerManagement />} /> {/* Quản lý KH (Admin) */}
        <Route path="/admin/users" element={<AdminUserManagement />} />      {/* Quản lý người dùng */}
        
        {/* ===== ADMIN ROUTES - COMING SOON (CÁC TÍNH NĂNG ĐANG PHÁT TRIỂN) ===== */}
        <Route path="/admin/vehicles" element={<div>Admin Vehicle Management - Coming Soon</div>} />     {/* Quản lý xe */}
        <Route path="/admin/parts" element={<div>Admin Parts Management - Coming Soon</div>} />         {/* Quản lý phụ kiện */}
        <Route path="/admin/warranty-claims" element={<div>Admin Warranty Claims Management - Coming Soon</div>} /> {/* Quản lý yêu cầu bảo hành */}
        <Route path="/admin/service-histories" element={<div>Admin Service History Management - Coming Soon</div>} /> {/* Quản lý lịch sử dịch vụ */}

        {/* ===== FALLBACK ROUTES - CÁC ROUTE DỰ PHÒNG ===== */}
        <Route path="/dashboard" element={<Customer />} />                   {/* Fallback dashboard -> Customer */}
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