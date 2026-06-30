import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../services/authService";

function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [staticOtp, setStaticOtp] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    const pendingUser = sessionStorage.getItem("pendingUser");
    if (pendingUser) {
      try {
        const parsed = JSON.parse(pendingUser);
        setStaticOtp(parsed.otp || "");
      } catch {
        setStaticOtp("");
      }
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const previousOtp = [...otp];
      previousOtp[index - 1] = "";
      setOtp(previousOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length !== 6) {
      setSuccess("");
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await verifyOtp({ otp: fullOtp });

      if (!result.success) {
        throw new Error(result.message || "Invalid OTP. Please try again.");
      }

      const redirectMap = {
        SUPER_ADMIN: "/superadmin/dashboard",
        SCHOOL_ADMIN: "/school/dashboard",
        SCHOOL_TEACHER: "/school/teacher/dashboard",
        SCHOOL_PARENT: "/school/parent/dashboard",
        SCHOOL_CASHIER: "/school/cashier/dashboard",
        SCHOOL_CLASS_INCHARGE: "/school/incharge/dashboard",
      };

      const redirectPath = redirectMap[result.role] || result.redirect || "/login";
      const currentUser = {
        username: result.username,
        role: result.role,
        organizationType: result.organizationType,
        redirect: redirectPath,
      };

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", result.role);
      localStorage.setItem("username", result.username);
      localStorage.setItem("authToken", "dummy-token");
      localStorage.setItem("loginTime", Date.now().toString());
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userRole", result.role);
      sessionStorage.setItem("username", result.username);
      sessionStorage.setItem("authToken", "dummy-token");
      sessionStorage.setItem("loginTime", Date.now().toString());
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      sessionStorage.removeItem("pendingUser");

      setSuccess(result.message || "OTP verified successfully.");
      setTimeout(() => navigate(redirectPath, { replace: true }), 700);
    } catch (err) {
      setError(err.message || "Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    setSuccess("A new OTP has been sent.");
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>OTP Verification</h1>
          <p>OTP sent to your registered email or mobile.</p>
        </div>

        <form onSubmit={handleVerifyOtp}>
          <div className="otp-row">
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(element) => (inputRefs.current[index] = element)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={value}
                className="otp-input"
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>

          <div className="otp-meta">
            <span>{countdown > 0 ? `Resend available in 00:${String(countdown).padStart(2, "0")}` : "You can resend OTP now."}</span>
            <button type="button" className="text-btn" disabled={!canResend} onClick={handleResend}>
              Resend OTP
            </button>
          </div>

          {staticOtp && (
            <div className="success-message" style={{ marginBottom: "14px" }}>
              Static OTP for testing: <strong>{staticOtp}</strong>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Verifying…" : "Verify OTP"}
          </button>

          <button type="button" className="secondary-btn" onClick={() => navigate("/login")}>Back to Login</button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtp;
