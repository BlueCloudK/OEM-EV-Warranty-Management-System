import React from "react";

export default function Login() {
  return (
    <div className="form-container">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <a href="#" style={{ fontSize: '0.9em' }}>Forgot Password?</a>
          </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
