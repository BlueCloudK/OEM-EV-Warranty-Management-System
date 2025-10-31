import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCar, FaUser, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth(); // Get isAuthenticated and user from context

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Effect to redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const roleRedirects = {
        ADMIN: "/admin/dashboard",
        SC_STAFF: "/scstaff/dashboard",
        SC_TECHNICIAN: "/sctechnician/dashboard",
        EVM_STAFF: "/evmstaff/dashboard",
        CUSTOMER: "/customer/dashboard",
      };
      const redirectPath = roleRedirects[user.roleName] || "/";
      navigate(redirectPath, { replace: true }); // Use replace to prevent going back to login
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const loggedInUser = await login(username, password);

      if (loggedInUser && loggedInUser.roleName) {
        const roleRedirects = {
          ADMIN: "/admin/dashboard",
          SC_STAFF: "/scstaff/dashboard",
          SC_TECHNICIAN: "/sctechnician/dashboard",
          EVM_STAFF: "/evmstaff/dashboard",
          CUSTOMER: "/customer/dashboard",
        };
        const redirectPath = roleRedirects[loggedInUser.roleName] || "/";
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(
          "Đăng nhập thành công nhưng không nhận được dữ liệu người dùng."
        );
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setErrorMessage(
        error.message || "Lỗi kết nối máy chủ. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <p className="text-slate-600">Đang kiểm tra trạng thái đăng nhập...</p>
      </div>
    );
  }

  // Render login form only if not authenticated
  return (
    <div className="relative min-h-screen bg-slate-900">
      <img
        src="https://images.unsplash.com/photo-1615874959474-d609be9f0cda?auto=format&fit=crop&w=1920&q=80"
        alt="bg"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-emerald-900/60 to-emerald-700/40" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:h-[520px]">
          {/* Left - form */}
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-2 mb-6 text-emerald-700">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-gradient-to-br from-indigo-600 to-emerald-500 text-white shadow">
                <FaCar />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
                EV Warranty Portal
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50">
                <FaUser className="text-emerald-700" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50">
                <FaLock className="text-emerald-700" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-70"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              {errorMessage && (
                <p className="text-center text-rose-600 text-sm">
                  {errorMessage}
                </p>
              )}

              <div className="text-center pt-2">
                <Link
                  to="/forgot-password"
                  className="text-emerald-700 hover:underline text-sm"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </form>
          </div>

          {/* Right - visual */}
          <div className="relative hidden md:block">
            <img
              src="https://image.made-in-china.com/2f0j00DAwhVupLMJzd/Fast-Charging-Electric-Vehicle-M-Nv-Remote-Unlocking-New-Electric-Car-SUV.jpg"
              alt="car"
              className="absolute inset-0 h-full w-full object-cover object-bottom"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Tailwind version — no inline style helpers needed
