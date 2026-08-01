import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    // Replace with Cognito later
    if (email === "admin@test.com" && password === "1234") {
      localStorage.setItem("adminToken", "true");
      window.location.href = "/admin";
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="scb-main scb-page-section">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Login</h1>
      <section className="scb-panel mb-8 max-w-3xl mx-auto">
        <div className="scb-page-header">
          <div>
            <p className="scb-page-meta">Secure cloud admin access</p>
            <h1 className="scb-page-title">Sign in to your admin dashboard</h1>
          </div>
        </div>
        <p className="mb-4">
          Enter your admin credentials to manage projects, review contact messages, and monitor site activity.
        </p>
      </section>

      <section className="scb-panel max-w-3xl mx-auto">
        <div className="scb-page-header">
          <h2 className="scb-page-title">Enter user credentials</h2>
        </div>

        <form className="scb-form" onSubmit={(e) => { e.preventDefault(); login(); }}>
          <input
            placeholder="Email"
            type="email"
            className="scb-input"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="scb-input"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn w-full" type="submit">
            Login
          </button>
        </form>
      </section>
    </div>
  );
}