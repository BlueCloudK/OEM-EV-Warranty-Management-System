import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
// TailwindCSS styling – logic unchanged
import {
  FaUsers,
  FaCar,
  FaCogs,
  FaClipboardList,
  FaHistory,
  FaChartBar,
} from "react-icons/fa";

const iconMap = {
  FaUsers: <FaUsers />,
  FaCar: <FaCar />,
  FaClipboardList: <FaClipboardList />,
};

// Main Component with new Authentication Flow
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { stats, loading: dataLoading, recentActivity } = useAdminDashboard();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return <div>Đang kiểm tra xác thực...</div>;
  }

  const statItems = [
    {
      title: "Tổng Khách hàng",
      value: stats.totalCustomers,
      icon: <FaUsers />,
      color: "#3b82f6",
    },
    {
      title: "Tổng Xe điện",
      value: stats.totalVehicles,
      icon: <FaCar />,
      color: "#10b981",
    },
    {
      title: "Tổng Phụ tùng",
      value: stats.totalParts,
      icon: <FaCogs />,
      color: "#f59e0b",
    },
    {
      title: "Claims đang xử lý",
      value: stats.pendingClaims,
      icon: <FaClipboardList />,
      color: "#ef4444",
    },
    {
      title: "Claims hoàn tất",
      value: stats.completedClaims,
      icon: <FaClipboardList />,
      color: "#10b981",
    },
    {
      title: "Tổng Claims",
      value: stats.totalClaims,
      icon: <FaChartBar />,
      color: "#8b5cf6",
    },
  ];

  return (
    <>
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl mb-6 p-6 sm:p-7 bg-gradient-to-br from-indigo-600 via-emerald-600 to-emerald-400 text-white shadow-[0_16px_40px_-12px_rgba(2,6,23,0.35)]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
        <div className="relative">
          <h2 className="text-xl font-bold tracking-tight">
            Tổng quan hệ thống
          </h2>
          <p className="text-white/85 text-sm mt-1">
            Theo dõi số liệu chính và hoạt động gần đây của toàn bộ hệ thống.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/users")}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm ring-1 ring-white/30 transition"
            >
              Người dùng
            </button>
            <button
              onClick={() => navigate("/admin/warranty-claims")}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm ring-1 ring-white/30 transition"
            >
              Claims
            </button>
            <button
              onClick={() => navigate("/admin/service-histories")}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm ring-1 ring-white/30 transition"
            >
              Lịch sử dịch vụ
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {statItems.map((stat, index) => (
          <div
            key={index}
            className="p-[1px] rounded-2xl bg-gradient-to-br from-indigo-200 via-slate-100 to-emerald-200 shadow-md hover:shadow-lg transition-all"
          >
            <div className="relative overflow-hidden rounded-[15px] bg-white p-5 group">
              <div
                className="absolute right-0 top-0 h-24 w-24 -translate-y-1/3 translate-x-1/4 rounded-full opacity-10"
                style={{ background: stat.color }}
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    {stat.title}
                  </div>
                  <div
                    className="text-3xl font-bold group-hover:scale-[1.02] transition-transform"
                    style={{ color: stat.color }}
                  >
                    {dataLoading ? "…" : stat.value}
                  </div>
                </div>
                <div
                  className="text-4xl opacity-70 group-hover:opacity-90"
                  style={{ color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-100">
        <h3 className="text-base font-semibold mb-5 flex items-center gap-2 text-slate-800">
          <FaHistory /> Hoạt động Gần đây
        </h3>
        {dataLoading ? (
          <p className="text-slate-500">Đang tải hoạt động...</p>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 bg-slate-50/80 hover:bg-slate-50 rounded-lg border border-slate-100"
              >
                <div className="text-xl text-slate-500">
                  {iconMap[activity.icon]}
                </div>
                <div className="flex-1 text-slate-700">{activity.action}</div>
                <div className="text-xs text-slate-400">{activity.time}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Chưa có hoạt động nào</p>
        )}
      </div>
    </>
  );
}
