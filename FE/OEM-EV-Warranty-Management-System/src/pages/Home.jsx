import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import apiClient from "../api/apiClient";
import GoongMapReadOnly from "../components/GoongMapReadOnly";

export default function Home() {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const featureHighlights = [
    {
      title: "Đặt lịch dịch vụ trực tuyến",
      description: "Chọn trung tâm dịch vụ, đặt lịch hẹn và theo dõi tiến trình trong thời gian thực.",
      image: "https://tse1.mm.bing.net/th/id/OIP.iOjCE2-1ClgqVkhU-BR7KgHaE7?w=495&h=329&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      title: "Yêu cầu bảo hành",
      description: "Gửi và theo dõi yêu cầu bảo hành xe điện với quy trình minh bạch, phản hồi tức thì.",
      image: "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/3/30/1029145/Anh-Chup-Man-Hinh-20.jpg",
    },
    {
      title: "Phụ tùng & dịch vụ EV",
      description: "Quản lý phụ tùng, lịch sử bảo dưỡng và chiến dịch recall một cách đồng bộ.",
      image: "https://cdn.tgdd.vn/hoi-dap/1384009/xe-o-to-dien-la-gi-tim-hieu-ve-cau-tao-cach-thuc-hoat-dong-1-1-800x600.jpg",
    },
  ];

  useEffect(() => {
    fetchServiceCenters();
  }, []);

  const fetchServiceCenters = async () => {
    try {
      setLoading(true);
      // Gọi API public không cần authentication
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/public/service-centers?page=0&size=100`); // Fetch all centers

      if (!response.ok) {
        throw new Error('Failed to fetch service centers');
      }

      const data = await response.json();
      console.log('Service Centers Response:', data); // Debug log
      if (data.content) {
        setServiceCenters(data.content);
        if (data.content.length > 0) {
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
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(120deg, #0d6b61 0%, #134f5d 40%, #0b2b3a 100%)",
          color: "#f1f5f9",
          padding: "68px 0",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.45), transparent 55%)",
          }}
        />
        <div className="container hero-inner" style={{ position: "relative", gap: "3rem" }}>
          <div className="hero-text" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                fontSize: 12,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
              }}
            >
              Hệ Sinh Thái Bảo Hành Xe Điện Thông Minh
            </span>
            <h1 style={{ fontSize: "2.6rem", lineHeight: 1.25, fontWeight: 600, textShadow: "0 16px 32px rgba(0,0,0,0.35)" }}>
              Chào mừng tới nền tảng quản lý bảo hành xe điện OEM
            </h1>
            <p style={{ fontSize: 17, color: "rgba(248, 250, 252, 0.92)", maxWidth: 640 }}>
              Theo dõi bảo hành xe điện, quản lý phụ tùng và kết nối trung tâm dịch vụ trong một nền tảng duy nhất. Dữ liệu tập trung – trải nghiệm đồng bộ.
            </p>
            <div className="hero-buttons" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 26px",
                  borderRadius: 14,
                  background: "#fefefe",
                  color: "#0b6b61",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  boxShadow: "0 24px 46px rgba(8,52,47,0.45)",
                  textDecoration: "none",
                  transition: "transform .2s ease, box-shadow .25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 30px 60px rgba(8,52,47,0.48)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 24px 46px rgba(8,52,47,0.45)";
                }}
              >
                Đăng nhập hệ thống
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(241,245,249,0.75)" }}>
                <span style={{ display: "block", width: 42, height: 1, background: "rgba(255,255,255,0.6)" }} />
                Nền Tảng OEM Đáng Tin Cậy
              </div>
            </div>
          </div>
          <div className="hero-image" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 420,
                aspectRatio: "4 / 3",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.35)",
                boxShadow: "0 40px 85px rgba(0,0,0,0.45)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="https://static.wixstatic.com/media/e8a86a_3465bc67fe5e4e49be8f4c0be7ae6493~mv2.png/v1/fill/w_240,h_180,al_c/vinfast-logo.png"
                alt="Hệ Thống Bảo Hành Xe Điện OEM"
                style={{ height: 140, filter: "drop-shadow(0 16px 38px rgba(0,0,0,0.45))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-row" style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", width: "92%", margin: "64px auto 40px" }}>
        {featureHighlights.map((feature) => (
          <article
            key={feature.title}
            style={{
              padding: 22,
              background: "#ffffff",
              borderRadius: 14,
              boxShadow: "0 16px 45px rgba(15,23,42,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              border: "1px solid rgba(226,232,240,0.8)",
              transition: "transform .25s ease, box-shadow .25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 24px 60px rgba(15,23,42,0.14)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 16px 45px rgba(15,23,42,0.12)";
            }}
          >
            <div style={{ height: 180, borderRadius: 12, overflow: "hidden" }}>
              <img src={feature.image} alt={feature.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".16em" }}>
              {feature.title}
            </h3>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>{feature.description}</p>
            <span style={{ fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(11,107,97,0.65)" }}>
              Quy Trình Bảo Hành Xe Điện
            </span>
          </article>
        ))}
      </section>

      {/* Service Centers Section */}
      <section style={{ padding: "74px 0", backgroundColor: "#f0f4f8" }}>
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <h2 style={{ textAlign: "center", color: "#0f172a", fontSize: "2rem", marginBottom: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase" }}>
            <FaMapMarkerAlt style={{ marginRight: "12px", color: "#0b6b61" }} />
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
                      ? `📍 Vị trí trung tâm đang chọn: ${selectedCenter.serviceCenterName}`
                      : "💡 Click vào trung tâm bên dưới để xem vị trí trên bản đồ"}
                  </p>
                  <GoongMapReadOnly
                    locations={serviceCenters}
                    selectedLocation={selectedCenter}
                    height="500px"
                  />
                </div>
              ) : null}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
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

                  <div style={{
                    marginTop: "12px",
                    padding: "8px 12px",
                    backgroundColor: center.averageRating && center.averageRating > 0 ? "#f0fdf4" : "#f3f4f6",
                    borderRadius: "6px",
                    display: "inline-block"
                  }}>
                    <span style={{
                      color: center.averageRating && center.averageRating > 0 ? "#166534" : "#6b7280",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}>
                      {center.averageRating && center.averageRating > 0 ? (
                        <>⭐ {center.averageRating.toFixed(1)}</>
                      ) : (
                        "Chưa có đánh giá"
                      )}
                    </span>
                  </div>
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
      <div style={{ textAlign: "center", padding: "22px 0", backgroundColor: "#0f172a", color: "rgba(226,232,240,0.92)" }}>
        <h2 style={{ fontSize: "0.85rem", letterSpacing: ".32em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>Đội hỗ trợ OEM</h2>
        <p style={{ fontSize: "0.85rem", marginTop: 8 }}>Sẵn sàng hỗ trợ bạn 24/7 cho mọi nhu cầu bảo hành xe điện.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "48px", marginTop: 16, flexWrap: "wrap" }}>
          <a href="tel:1900232389" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 12, color: "#bfdbfe", textDecoration: "none" }}>
            <FaPhone style={{ color: "#38bdf8" }} />
            1900 23 23 89
          </a>
          <a href="mailto:support.vn@vinfastauto.com" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 12, color: "#bfdbfe", textDecoration: "none" }}>
            <FaEnvelope style={{ color: "#38bdf8" }} />
            support.vn@vinfastauto.com
          </a>
        </div>
      </div>
    </main>
  );
}