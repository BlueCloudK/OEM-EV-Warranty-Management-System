import React from "react";
import { useNavigate } from "react-router-dom";

export default function SCStaff() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Service Center Staff Dashboard</h1>
      <p>Manage customer requests, handle service bookings, update records...</p>
    </div>
  );
}
