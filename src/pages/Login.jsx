import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const clearError = () => {
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser({ username, password });

      if (!result.success || !result.token) {
        throw new Error(result.message || "Invalid username or password. Please try again.");
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("authToken", result.token);
      storage.setItem("userRole", result.role);
      storage.setItem("username", result.username);
      storage.setItem("organizationType", result.organizationType);
      storage.setItem("otpVerified", "false");
      storage.setItem("currentUser", JSON.stringify({
        username: result.username,
        role: result.role,
        organizationType: result.organizationType,
        redirect: result.redirect,
      }));
      sessionStorage.setItem("pendingUser", JSON.stringify({
        otp: result.otp,
        role: result.role,
        username: result.username,
        redirect: result.redirect,
        organizationType: result.organizationType,
      }));

      navigate("/verify-otp", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Organization</h1>
          <p>Sign in to your institution workspace with a shared login experience.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username / User ID</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError();
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                required
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="remember-row">
            <label className="remember-label">
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              Remember me
            </label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        {/* <div className="test-info">
          <strong>Test credentials:</strong><br />
          superadmin / 123456<br />
          schooladmin / 123456<br />
          collegeadmin / 123456<br />
          hospitaladmin / 123456
        </div> */}
      </div>
    </div>
  );
}

export default Login;
