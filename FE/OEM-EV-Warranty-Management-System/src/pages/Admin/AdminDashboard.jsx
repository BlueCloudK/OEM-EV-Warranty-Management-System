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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {statItems.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-soft p-5 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-500 mb-1">
                  {stat.title}
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: stat.color }}
                >
                  {dataLoading ? "..." : stat.value}
                </div>
              </div>
              <div
                className="text-4xl opacity-70"
                style={{ color: stat.color }}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
          <FaHistory /> Hoạt động Gần đây
        </h3>
        {dataLoading ? (
          <p>Đang tải hoạt động...</p>
        ) : recentActivity.length > 0 ? (
          recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg mb-2"
            >
              <div className="text-xl text-slate-500">
                {iconMap[activity.icon]}
              </div>
              <div className="flex-1">{activity.action}</div>
              <div className="text-xs text-slate-400">{activity.time}</div>
            </div>
          ))
        ) : (
          <p>Chưa có hoạt động nào</p>
        )}
      </div>
    </>
  );
}
