import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Logout from "./pages/Logout";
import Customer from "./Roles/Customer/Customer";
import Booking from "./Roles/Customer/Booking";
import WarrantyResult from "./Roles/Customer/WarrantyResult";
import WarrantyHistory from "./Roles/Customer/WarrantyHistory";
import PartsWarranty from "./Roles/Customer/PartsWarranty";
//
import SCStaff from "./Roles/SCStaff/SCStaff";
import CustomerList from "./Roles/SCStaff/Profile_Management/CustomerList";
import CreateCustomer from "./Roles/SCStaff/Profile_Management/CreateCustomer";
import UpdateCustomers from "./Roles/SCStaff/Profile_Management/UpdateCustomers";
//
import Admin from "./Roles/Admin/Admin";
import AdminUserManagement from "./Roles/Admin/AdminUserManagement";
import AdminCustomerManagement from "./Roles/Admin/AdminCustomerManagement";
import AdminVehicleManagement from "./Roles/Admin/AdminVehicleManagement";
import AdminPartsManagement from "./Roles/Admin/AdminPartsManagement";
import AdminWarrantyClaimsManagement from "./Roles/Admin/AdminWarrantyClaimsManagement";
import AdminServiceHistoriesManagement from "./Roles/Admin/AdminServiceHistoriesManagement";

export default function App() {
  const location = useLocation();
  return (
    <>
      {location.pathname && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />
        // Customer
        <Route path="/customer/dashboard" element={<Customer />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/customer/warranty-result" element={<WarrantyResult />} />
        <Route
          path="/customer/warranty-history"
          element={<WarrantyHistory />}
        />
        <Route path="/customer/parts-warranty" element={<PartsWarranty />} />
        // SCStaff
        <Route path="/scstaff" element={<SCStaff />} />
        <Route path="/scstaff/dashboard" element={<SCStaff />} />
        <Route path="/scstaff/customers/list" element={<CustomerList />} />
        <Route path="/scstaff/customers/create" element={<CreateCustomer />} />
        <Route
          path="/scstaff/customers/edit/:id"
          element={<UpdateCustomers />}
        />
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
        <Route path="/admin/users" element={<AdminUserManagement />} />
        // Add fallback dashboard route
        <Route path="/dashboard" element={<Customer />} />
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
