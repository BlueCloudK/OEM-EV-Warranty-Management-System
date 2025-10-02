import React from "react";
import { Link } from "react-router-dom";
import { FaPhone, FaEnvelope } from "react-icons/fa";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section style={{ className: "hero-mint", background: "linear-gradient(135deg, #325f65ff 0%, #e8f5e9 100%)", padding: "56px 0", color: "black", marginTop: "-20px" }}>
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>
              Welcome to <br /> OEM EV Warranty Management System
            </h1>
            <p className="lead">
              Track your car warranty, book services, and manage your EV easily.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn-primary large">
                Register
              </Link>
              <Link to="/login" className="btn-primary large" >
                Login
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
          <h3 style={{ color: "#044835ff", marginTop: "15px" }}>Book Service Online</h3>
          <p style={{ color: "#053e2eff", textAlign: "center" }}>
            Choose a service center, book appointments, and track progress.
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
          <h3 style={{ color: "#044835ff", marginTop: "15px" }}>Warranty Claims</h3>
          <p style={{ color: "#053e2eff", textAlign: "center" }}>
            Submit and track your EV warranty claims easily and quickly.
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
          <h3 style={{ color: "#044835ff", marginTop: "15px" }}>EV Parts & Service</h3>
          <p style={{ color: "#053e2eff", textAlign: "center" }}>
            Manage EV parts, recalls, and maintenance campaigns effectively.
          </p>
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
        <h2 style={{ color: "white", fontSize: "14px" }}>Need Support</h2>
        <p style={{ color: "white", fontSize: "14px" }}>Our team is here to help you 24/7 for all your EV warranty needs.</p>
        
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
