import { useState } from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    // If Cognito configuration is present in environment variables
    if (userPoolId && clientId) {
      const poolData = {
        UserPoolId: userPoolId,
        ClientId: clientId,
      };
      const userPool = new CognitoUserPool(poolData);
      const user = new CognitoUser({ Username: email.trim(), Pool: userPool });
      const authDetails = new AuthenticationDetails({
        Username: email.trim(),
        Password: password,
      });

      user.authenticateUser(authDetails, {
        onSuccess: (result) => {
          const idToken = result.getIdToken().getJwtToken();
          const accessToken = result.getAccessToken().getJwtToken();

          // Store tokens securely in localStorage
          localStorage.setItem("idToken", idToken);
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("adminToken", idToken);

          setLoading(false);
          window.location.href = "/admin";
        },
        onFailure: (err) => {
          console.error("Cognito login error:", err);
          setError(err.message || "Failed to authenticate with Amazon Cognito.");
          setLoading(false);
        },
      });
    } else {
      // Local development message when Cognito IDs are pending
      setError(
        "Cognito User Pool ID or Client ID is not configured in VITE_COGNITO_USER_POOL_ID / VITE_COGNITO_CLIENT_ID. Please update your environment variables."
      );
      setLoading(false);
    }
  };

  return (
    <div className="scb-main scb-page-section">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Login</h1>
      <section className="scb-panel mb-8 max-w-3xl mx-auto">
        <div className="scb-page-header">
          <div>
            <p className="scb-page-meta">Secure Amazon Cognito authentication</p>
            <h1 className="scb-page-title">Sign in to your admin dashboard</h1>
          </div>
        </div>
        <p className="mb-4">
          Authenticate using your verified Amazon Cognito admin credentials. Session tokens are verified via backend JWT authorizers.
        </p>
      </section>

      <section className="scb-panel max-w-3xl mx-auto">
        <div className="scb-page-header">
          <h2 className="scb-page-title">Enter administrator credentials</h2>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded bg-red-900/50 border border-red-500 text-sm text-red-200">
            {error}
          </div>
        )}

        <form className="scb-form" onSubmit={handleLogin}>
          <input
            placeholder="Admin Email"
            type="email"
            value={email}
            required
            className="scb-input"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            className="scb-input"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login with Cognito"}
          </button>
        </form>
      </section>
    </div>
  );
}