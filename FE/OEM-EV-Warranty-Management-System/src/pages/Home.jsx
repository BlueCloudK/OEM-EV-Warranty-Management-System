import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";

import GoongMapReadOnly from "../components/GoongMapReadOnly";

export default function Home() {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);

  useEffect(() => {
    fetchServiceCenters();
  }, []);

  const fetchServiceCenters = async () => {
    try {
      setLoading(true);
      // Gọi API public không cần authentication
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const response = await fetch(
        `${API_URL}/api/public/service-centers?page=0&size=6`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch service centers");
      }

      const data = await response.json();
      console.log("Service Centers Response:", data); // Debug log
      if (data.content) {
        setServiceCenters(data.content);
        // Auto-select center đầu tiên để hiển thị marker
        if (data.content.length > 0) {
          console.log("Selected Center:", data.content[0]);
          setSelectedCenter(data.content[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching service centers:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-emerald-900 to-emerald-600">
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Chào mừng đến với hệ thống quản lý bảo hành xe điện
              </h1>
              <p className="mt-4 text-white/80 text-base sm:text-lg">
                Theo dõi bảo hành, đặt lịch dịch vụ và quản lý xe điện của bạn
                một cách dễ dàng.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-semibold shadow-md hover:shadow-lg transition"
                >
                  Đăng nhập
                </Link>
                <a
                  href="#service-centers"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold ring-1 ring-white/20 transition"
                >
                  Tìm trung tâm gần bạn
                </a>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -inset-2 rounded-xl bg-gradient-to-br from-indigo-500/40 to-emerald-500/40 blur-xl" />
                <img
                  className="relative h-28 w-auto opacity-95 drop-shadow"
                  src="https://static.wixstatic.com/media/e8a86a_3465bc67fe5e4e49be8f4c0be7ae6493~mv2.png/v1/fill/w_240,h_180,al_c/vinfast-logo.png"
                  alt="logo"
                />
              </div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-white/80 text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Bảo mật tiêu chuẩn doanh nghiệp
            </div>
            <div className="text-white/80 text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Hỗ trợ 24/7
            </div>
            <div className="text-white/80 text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Mạng lưới toàn quốc
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột 1 */}
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-5 transition-transform hover:-translate-y-0.5">
            <img
              className="w-full h-56 object-cover rounded-lg"
              src="https://tse1.mm.bing.net/th/id/OIP.iOjCE2-1ClgqVkhU-BR7KgHaE7?w=495&h=329&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="feature-1"
            />
            <h3 className="mt-4 text-emerald-800 font-semibold text-lg">
              Đặt lịch dịch vụ trực tuyến
            </h3>
            <p className="text-slate-600 text-center">
              Chọn trung tâm, đặt lịch hẹn và theo dõi tiến trình.
            </p>
          </div>

          {/* Cột 2 */}
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-5 transition-transform hover:-translate-y-0.5">
            <img
              className="w-full h-56 object-cover rounded-lg"
              src="https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/3/30/1029145/Anh-Chup-Man-Hinh-20.jpg"
              alt="feature-2"
            />
            <h3 className="mt-4 text-emerald-800 font-semibold text-lg">
              Yêu cầu bảo hành
            </h3>
            <p className="text-slate-600 text-center">
              Gửi và theo dõi yêu cầu bảo hành nhanh chóng.
            </p>
          </div>

          {/* Cột 3 */}
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-5 transition-transform hover:-translate-y-0.5">
            <img
              className="w-full h-56 object-cover rounded-lg"
              src="https://cdn.tgdd.vn/hoi-dap/1384009/xe-o-to-dien-la-gi-tim-hieu-ve-cau-tao-cach-thuc-hoat-dong-1-1-800x600.jpg"
              alt="feature-3"
            />
            <h3 className="mt-4 text-emerald-800 font-semibold text-lg">
              Phụ tùng & dịch vụ EV
            </h3>
            <p className="text-slate-600 text-center">
              Quản lý phụ tùng và bảo trì hiệu quả.
            </p>
          </div>
        </div>
      </section>

      {/* Service Centers Section */}
      <section id="service-centers" className="py-12 bg-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-emerald-800 mb-2">
            <span className="inline-flex items-center gap-2 justify-center">
              <FaMapMarkerAlt className="text-emerald-500" /> Trung tâm dịch vụ
            </span>
          </h2>
          <p className="text-center text-slate-600 mb-8">
            Tìm trung tâm dịch vụ gần bạn nhất
          </p>

          {loading ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Đang tải...</p>
          ) : (
            <>
              {/* Debug info */}
              {console.log(
                "Render - serviceCenters.length:",
                serviceCenters.length
              )}
              {console.log("Render - selectedCenter:", selectedCenter)}

              {/* Map showing selected service center */}
              {serviceCenters.length > 0 ? (
                <div className="mb-8">
                  <p className="text-center text-slate-700 font-semibold mb-3">
                    {selectedCenter
                      ? "📍 Vị trí trung tâm đang chọn"
                      : "💡 Chọn trung tâm bên dưới để xem bản đồ"}
                  </p>
                  <GoongMapReadOnly
                    latitude={
                      selectedCenter
                        ? parseFloat(selectedCenter.latitude)
                        : 21.0285
                    }
                    longitude={
                      selectedCenter
                        ? parseFloat(selectedCenter.longitude)
                        : 105.8542
                    }
                    height="400px"
                    showMarker={!!selectedCenter}
                  />
                  {selectedCenter && (
                    <div className="text-center mt-2">
                      <p className="text-emerald-600 font-semibold">
                        📍 {selectedCenter.serviceCenterName}
                      </p>
                      <p className="text-slate-600 text-sm">
                        {selectedCenter.address}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {serviceCenters.map((center) => (
                  <div
                    key={center.serviceCenterId}
                    onClick={() => setSelectedCenter(center)}
                    className={`bg-white p-6 rounded-xl border-l-4 transition-all cursor-pointer ${
                      selectedCenter?.serviceCenterId === center.serviceCenterId
                        ? "shadow-lg border-emerald-600 -translate-y-1"
                        : "shadow-sm hover:shadow-md border-emerald-500"
                    }`}
                  >
                    <h3 className="text-slate-800 text-lg mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-emerald-500" />
                      {center.serviceCenterName}
                    </h3>

                    <div className="mb-3 text-slate-600 text-sm">
                      📍 {center.address}
                    </div>

                    <div className="mb-3 text-slate-600 text-sm flex items-center gap-2">
                      <FaPhone className="text-emerald-500" /> {center.phone}
                    </div>

                    <div className="mb-3 text-slate-600 text-sm flex items-center gap-2">
                      <FaClock className="text-emerald-500" />{" "}
                      {center.openingHours}
                    </div>

                    {center.averageRating && (
                      <div className="mt-3 inline-block px-3 py-1 rounded bg-emerald-50">
                        <span className="text-emerald-700 text-sm font-semibold">
                          ⭐ {center.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {serviceCenters.length === 0 && !loading && (
            <p className="text-center text-slate-600 mt-5">
              Hiện chưa có trung tâm dịch vụ nào
            </p>
          )}
        </div>
      </section>

      {/* Support Section */}
      <div className="text-center py-6 bg-slate-700">
        <h2 className="text-white text-sm">Cần hỗ trợ</h2>
        <p className="text-white text-sm">
          Đội ngũ của chúng tôi sẵn sàng hỗ trợ bạn 24/7 cho mọi nhu cầu bảo
          hành.
        </p>
        <div className="flex justify-center gap-10 mt-3">
          <a
            href="tel:1900232389"
            className="text-slate-100 text-sm inline-flex items-center gap-2"
          >
            <FaPhone className="text-slate-100" /> 1900 23 23 89
          </a>
          <a
            href="mailto:support.vn@vinfastauto.com"
            className="text-slate-100 text-sm inline-flex items-center gap-2"
          >
            <FaEnvelope className="text-slate-100" /> support.vn@vinfastauto.com
          </a>
        </div>
      </div>
    </main>
  );
}

// import React from "react";
// import { Link } from "react-router-dom";
// import { FaPhone, FaEnvelope } from "react-icons/fa";

// export default function Home() {
//   return (
//     <main>
//       {/* Hero Section */}
//       <section style={{ className: "hero-mint", background: "linear-gradient(135deg, #325f65ff 0%, #e8f5e9 100%)", padding: "56px 0", color: "black", marginTop: "-20px" }}>
//         <div className="container hero-inner">
//           <div className="hero-text">
//             <h1>
//               Welcome to <br /> OEM EV Warranty Management System
//             </h1>
//             <p className="lead">
//               Track your car warranty, book services, and manage your EV easily.
//             </p>
//             <div className="hero-buttons">
//               <Link to="/register" className="btn-primary large">
//                 Register
//               </Link>
//               <Link to="/login" className="btn-primary large" >
//                 Login
//               </Link>
//             </div>
//           </div>
//           <div className="hero-image">
//             <img
//               src="https://static.wixstatic.com/media/e8a86a_3465bc67fe5e4e49be8f4c0be7ae6493~mv2.png/v1/fill/w_240,h_180,al_c/vinfast-logo.png"
//               alt="logo"
//             />
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section
//         className="features-row"
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "stretch", // tất cả cột cao bằng nhau
//           gap: "20px",
//           width: "90%",
//           margin: "50px auto",
//           marginTop: "0px"
//         }}
//       >
//         {/* Cột 1 */}
//         <div
//           style={{
//             flex: 1,
//             padding: "20px",
//             backgroundColor: "#fff",
//             borderRadius: "10px",
//             boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <img
//             style={{
//               width: "100%",
//               height: "250px",
//               objectFit: "cover",
//               borderRadius: "10px",
//             }}
//             src="https://tse1.mm.bing.net/th/id/OIP.iOjCE2-1ClgqVkhU-BR7KgHaE7?w=495&h=329&rs=1&pid=ImgDetMain&o=7&rm=3"
//             alt="logo"
//           />
//           <h3 style={{ color: "#044835ff", marginTop: "15px" }}>Book Service Online</h3>
//           <p style={{ color: "#053e2eff", textAlign: "center" }}>
//             Choose a service center, book appointments, and track progress.
//           </p>
//         </div>

//         {/* Cột 2 */}
//         <div
//           style={{
//             flex: 1,
//             padding: "20px",
//             backgroundColor: "#fff",
//             borderRadius: "10px",
//             boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <img
//             style={{
//               width: "100%",
//               height: "250px",
//               objectFit: "cover",
//               borderRadius: "10px",
//             }}
//             src="https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/3/30/1029145/Anh-Chup-Man-Hinh-20.jpg"
//             alt="logo"
//           />
//           <h3 style={{ color: "#044835ff", marginTop: "15px" }}>Warranty Claims</h3>
//           <p style={{ color: "#053e2eff", textAlign: "center" }}>
//             Submit and track your EV warranty claims easily and quickly.
//           </p>
//         </div>

//         {/* Cột 3 */}
//         <div
//           style={{
//             flex: 1,
//             padding: "20px",
//             backgroundColor: "#fff",
//             borderRadius: "10px",
//             boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <img
//             style={{
//               width: "100%",
//               height: "250px",
//               objectFit: "cover",
//               borderRadius: "10px",
//             }}
//             src="https://cdn.tgdd.vn/hoi-dap/1384009/xe-o-to-dien-la-gi-tim-hieu-ve-cau-tao-cach-thuc-hoat-dong-1-1-800x600.jpg"
//             alt="logo"
//           />
//           <h3 style={{ color: "#044835ff", marginTop: "15px" }}>EV Parts & Service</h3>
//           <p style={{ color: "#053e2eff", textAlign: "center" }}>
//             Manage EV parts, recalls, and maintenance campaigns effectively.
//           </p>
//         </div>
//       </section>

//       {/* Support Section */}
//       <div
//         style={{
//           textAlign: "center",
//           padding: "10px",
//           backgroundColor: "#465551ff",
//           marginTop: "-40px"
//         }}
//       >
//         <h2 style={{ color: "white", fontSize: "14px" }}>Need Support</h2>
//         <p style={{ color: "white", fontSize: "14px" }}>Our team is here to help you 24/7 for all your EV warranty needs.</p>

//         {/* Thêm liên hệ */}
//         <div style={{ display: "flex", justifyContent: "center", gap: "50px" }}>
//           <a href="tel:1900232389" style={{ fontSize: "15px", display: "flex", alignItems: "center",color: "#deeae6ff" }}>
//             <FaPhone style={{ marginRight: "10px", color: "#e8efecff" }} />
//             1900 23 23 89
//           </a>
//           <a href="mailto:support.vn@vinfastauto.com" style={{ fontSize: "15px", display: "flex", alignItems: "center",color: "#deeae6ff" }}>
//             <FaEnvelope style={{ marginRight: "10px", color: "#deeae6ff" }} />
//             support.vn@vinfastauto.com
//           </a>
//         </div>
//       </div>

//     </main>
//   );
// }
