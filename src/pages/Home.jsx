import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-text">
          <h1>Power Your EV Future</h1>
          <p>
            Manage warranties, service centers, and manufacturers with ease.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/login" className="btn-secondary">Login</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://imgs.vietnamnet.vn/Images/2017/03/17/09/20170317095205-chon-mau-xe-theo-menh.jpg" alt="EV Car" />
        </div>
      </div>
    </section>
  );
}
