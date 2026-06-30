import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Unauthorized Access</h1>
          <p>Your current role does not have access to this dashboard.</p>
        </div>
        <Link to="/login" className="auth-btn" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          Return to Login
        </Link>
      </div>
    </div>
  );
}
