import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import apiClient from "../api/apiClient";
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/public/service-centers?page=0&size=6`);

      if (!response.ok) {
        throw new Error('Failed to fetch service centers');
      }

      const data = await response.json();
      console.log('Service Centers Response:', data); // Debug log
      if (data.content) {
        setServiceCenters(data.content);
          // Auto-select center đầu tiên để hiển thị marker
          if (data.content.length > 0) {
              console.log('Selected Center:', data.content[0]);
              setSelectedCenter(data.content[0]);
          }
      }
    } catch (err) {
      console.error('Error fetching service centers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section style={{ className: "hero-mint", background: "linear-gradient(135deg, #325f65ff 0%, #e8f5e9 100%)", padding: "56px 0", color: "black", marginTop: "-20px" }}>
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>
              Chào Mừng <br /> Đến Với Hệ Thống Quản Lý Bảo Hành Xe Điện 
            </h1>
            <p className="lead">
              Theo dõi bảo hành xe của bạn, đặt lịch dịch vụ và quản lý xe điện của bạn một cách dễ dàng.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn-primary large" >
                Đăng nhập
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://static.wixstatic.com/media/e8a86a_3465bc67fe5e4e49be8f4c0be7ae6493~mv2.png/v1/fill/w_240,h_180,al_c/vinfast-logo.png"
              alt="logo"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="features-row"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch", // tất cả cột cao bằng nhau
          gap: "20px",
          width: "90%",
          margin: "50px auto",
          marginTop: "0px"
        }}
      >
        {/* Cột 1 */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            style={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
            src="https://tse1.mm.bing.net/th/id/OIP.iOjCE2-1ClgqVkhU-BR7KgHaE7?w=495&h=329&rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="logo"
          />
          <h3 style={{ color: "#044835ff", marginTop: "15px" }}>Đặt Lịch Dịch Vụ Trực Tuyến</h3>
          <p style={{ color: "#053e2eff", textAlign: "center" }}>
            Chọn trung tâm dịch vụ, đặt lịch hẹn và theo dõi tiến trình.
          </p>
        </div>

        {/* Cột 2 */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            style={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
            src="https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/3/30/1029145/Anh-Chup-Man-Hinh-20.jpg"
            alt="logo"
          />
          <h3 style={{ color: "#044835ff", marginTop: "15px" }}>Yêu Cầu Bảo Hành</h3>
          <p style={{ color: "#053e2eff", textAlign: "center" }}>
            Gửi và theo dõi yêu cầu bảo hành xe điện của bạn một cách dễ dàng và nhanh chóng.
          </p>
        </div>

        {/* Cột 3 */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            style={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
            src="https://cdn.tgdd.vn/hoi-dap/1384009/xe-o-to-dien-la-gi-tim-hieu-ve-cau-tao-cach-thuc-hoat-dong-1-1-800x600.jpg"
            alt="logo"
          />
          <h3 style={{ color: "#044835ff", marginTop: "15px" }}>Phụ Tùng & Dịch Vụ EV</h3>
          <p style={{ color: "#053e2eff", textAlign: "center" }}>
            Quản lý phụ tùng xe điện, các chiến dịch bảo trì một cách hiệu quả.
          </p>
        </div>
      </section>

      {/* Service Centers Section */}
      <section style={{
        padding: "50px 0",
        backgroundColor: "#f9fafb",
        marginTop: "20px"
      }}>
        <div className="container">
          <h2 style={{
            textAlign: "center",
            color: "#044835ff",
            fontSize: "32px",
            marginBottom: "10px"
          }}>
            <FaMapMarkerAlt style={{ marginRight: "10px" }} />
            Trung Tâm Dịch Vụ
          </h2>
          <p style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: "16px",
            marginBottom: "40px"
          }}>
            Tìm trung tâm dịch vụ gần bạn nhất
          </p>

          {loading ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Đang tải...</p>
          ) : (
            <>
              {/* Debug info */}
              {console.log('Render - serviceCenters.length:', serviceCenters.length)}
              {console.log('Render - selectedCenter:', selectedCenter)}

              {/* Map showing selected service center */}
              {serviceCenters.length > 0 ? (
                <div style={{ marginBottom: "30px" }}>
                  <p style={{
                    textAlign: "center",
                    marginBottom: "12px",
                    color: "#374151",
                    fontSize: "15px",
                    fontWeight: "600"
                  }}>
                    {selectedCenter
                      ? "📍 Vị trí trung tâm đang chọn"
                      : "💡 Click vào trung tâm bên dưới để xem vị trí trên bản đồ"}
                  </p>
                    <GoongMapReadOnly
                        latitude={selectedCenter ? parseFloat(selectedCenter.latitude) : 21.0285}
                        longitude={selectedCenter ? parseFloat(selectedCenter.longitude) : 105.8542}
                        height="400px"
                        showMarker={!!selectedCenter}
                    />
                  {selectedCenter && (
                    <>
                      <p style={{
                        textAlign: "center",
                        marginTop: "10px",
                        color: "#10b981",
                        fontSize: "16px",
                        fontWeight: "600"
                      }}>
                        📍 {selectedCenter.serviceCenterName}
                      </p>
                      <p style={{
                        textAlign: "center",
                        marginTop: "4px",
                        color: "#6b7280",
                        fontSize: "14px"
                      }}>
                        {selectedCenter.address}
                      </p>
                    </>
                  )}
                </div>
              ) : null}

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px",
                maxWidth: "1200px",
                margin: "0 auto"
              }}>
                {serviceCenters.map((center) => (
                  <div
                    key={center.serviceCenterId}
                    onClick={() => setSelectedCenter(center)}
                    style={{
                      backgroundColor: "white",
                      padding: "24px",
                      borderRadius: "12px",
                      boxShadow: selectedCenter?.serviceCenterId === center.serviceCenterId
                        ? "0 8px 16px rgba(16, 185, 129, 0.3)"
                        : "0 4px 6px rgba(0, 0, 0, 0.1)",
                      borderLeft: selectedCenter?.serviceCenterId === center.serviceCenterId
                        ? "4px solid #059669"
                        : "4px solid #10b981",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      transform: selectedCenter?.serviceCenterId === center.serviceCenterId
                        ? "translateY(-4px)"
                        : "none"
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCenter?.serviceCenterId !== center.serviceCenterId) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCenter?.serviceCenterId !== center.serviceCenterId) {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                      }
                    }}
                  >
                  <h3 style={{
                    color: "#1f2937",
                    fontSize: "20px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <FaMapMarkerAlt style={{ color: "#10b981" }} />
                    {center.serviceCenterName}
                  </h3>

                  <div style={{ marginBottom: "12px" }}>
                    <p style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginBottom: "4px"
                    }}>
                      📍 {center.address}
                    </p>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <p style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <FaPhone style={{ color: "#10b981" }} />
                      {center.phone}
                    </p>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <p style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <FaClock style={{ color: "#10b981" }} />
                      {center.openingHours}
                    </p>
                  </div>

                  {center.averageRating && (
                    <div style={{
                      marginTop: "12px",
                      padding: "8px 12px",
                      backgroundColor: "#f0fdf4",
                      borderRadius: "6px",
                      display: "inline-block"
                    }}>
                      <span style={{
                        color: "#166534",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}>
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
            <p style={{
              textAlign: "center",
              color: "#6b7280",
              marginTop: "20px"
            }}>
              Hiện chưa có trung tâm dịch vụ nào
            </p>
          )}
        </div>
      </section>

      {/* Support Section */}
      <div
        style={{
          textAlign: "center",
          padding: "10px",
          backgroundColor: "#465551ff",
          marginTop: "-40px"
        }}
      >
        <h2 style={{ color: "white", fontSize: "14px" }}>Cần Hỗ Trợ</h2>
        <p style={{ color: "white", fontSize: "14px" }}>Đội ngũ của chúng tôi sẵn sàng hỗ trợ bạn 24/7 cho tất cả các nhu cầu bảo hành xe điện của bạn.</p>

        {/* Thêm liên hệ */}
        <div style={{ display: "flex", justifyContent: "center", gap: "50px" }}>
          <a href="tel:1900232389" style={{ fontSize: "15px", display: "flex", alignItems: "center",color: "#deeae6ff" }}>
            <FaPhone style={{ marginRight: "10px", color: "#e8efecff" }} />
            1900 23 23 89
          </a>
          <a href="mailto:support.vn@vinfastauto.com" style={{ fontSize: "15px", display: "flex", alignItems: "center",color: "#deeae6ff" }}>
            <FaEnvelope style={{ marginRight: "10px", color: "#deeae6ff" }} />
            support.vn@vinfastauto.com
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