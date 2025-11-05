import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx"; // Corrected file extension
import App from "./App";
import "./index.css";
import "./utils/confirmOverride.js"; // Override window.confirm globally

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <AuthProvider>  {/* Wrap the entire App with AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
);
