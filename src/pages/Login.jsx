// import React from "react";

// export default function Login() {
   
  

//   return (
//     <div className="form-container">
//       <h2>Login</h2>
//       <form>
//         <input type="email" placeholder="Email" required />
//         <input type="password" placeholder="Password" required />
//           <div style={{ textAlign: 'right', marginBottom: '10px' }}>
//             <a href="#" style={{ fontSize: '0.9em' }}>Forgot Password?</a>
//           </div>
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Giả lập phân quyền theo username
    switch (username.toLowerCase()) {
      case "customer":
        navigate("/customer/dashboard");
        break;
      case "scstaff":
        navigate("/sc-staff/dashboard");
        break;
      case "technician":
        navigate("/sc-technician/dashboard");
        break;
      case "evmstaff":
        navigate("/evm/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        alert(
          "Sai username!\nHãy nhập một trong các user: customer, scstaff, technician, evmstaff, admin"
        );
        break;
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <a href="#" style={{ fontSize: "0.9em" }}>Forgot Password?</a>
        </div>
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Login
        </button>
      </form>
    </div>
  );
}
