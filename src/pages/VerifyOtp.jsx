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
        SCHOOL_CLASS_TEACHER: "/school/class-teacher/dashboard",
        SCHOOL_PARENT: "/school/parent/dashboard",
        SCHOOL_CASHIER: "/school/cashier/dashboard",
        SCHOOL_ACCOUNTANT: "/school/accountant/dashboard",
        SCHOOL_DRIVER: "/school/driver/dashboard",
        SCHOOL_CLASS_INCHARGE: "/school/incharge/dashboard",
      };

      const roleList = Array.isArray(result.roles) && result.roles.length > 0
        ? result.roles
        : [result.role || result.defaultRole].filter(Boolean);
      const effectiveRole = result.role || result.defaultRole || roleList[0] || "";
      const dashboardList = Array.isArray(result.dashboards) && result.dashboards.length > 0
        ? result.dashboards
        : [{ label: "Dashboard", path: redirectMap[effectiveRole] || result.redirect || "/school/dashboard", role: effectiveRole }];
      const redirectPath = (dashboardList && dashboardList[0]?.path) || redirectMap[effectiveRole] || result.redirect || "/school/dashboard";
      const currentUser = {
        username: result.username,
        role: effectiveRole,
        roles: roleList,
        dashboards: dashboardList,
        defaultRole: effectiveRole,
        organizationType: result.organizationType,
        parentId: result.parentId || null,
        redirect: redirectPath,
      };

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", effectiveRole);
      localStorage.setItem("userRoles", JSON.stringify(roleList));
      localStorage.setItem("userDashboards", JSON.stringify(dashboardList));
      localStorage.setItem("username", result.username);
      localStorage.setItem("parentId", result.parentId || "");
      localStorage.setItem("authToken", "dummy-token");
      localStorage.setItem("loginTime", Date.now().toString());
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userRole", effectiveRole);
      sessionStorage.setItem("userRoles", JSON.stringify(roleList));
      sessionStorage.setItem("userDashboards", JSON.stringify(dashboardList));
      sessionStorage.setItem("username", result.username);
      sessionStorage.setItem("parentId", result.parentId || "");
      sessionStorage.setItem("authToken", "dummy-token");
      sessionStorage.setItem("loginTime", Date.now().toString());
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      sessionStorage.removeItem("pendingUser");

      // Debug logging
      console.log("OTP Verification Success:", {
        effectiveRole,
        roleList,
        redirectPath,
        dashboardList,
        username: result.username,
        organizationType: result.organizationType,
        parentId: result.parentId,
        allResultData: result,
      });
      console.log("LocalStorage set:", {
        isLoggedIn: localStorage.getItem("isLoggedIn"),
        userRole: localStorage.getItem("userRole"),
        userRoles: localStorage.getItem("userRoles"),
        authToken: localStorage.getItem("authToken"),
        parentId: localStorage.getItem("parentId"),
        currentUser: localStorage.getItem("currentUser"),
      });

      // Verify parentId is set for parent users
      if (effectiveRole === "SCHOOL_PARENT" && !result.parentId) {
        console.warn("WARNING: SCHOOL_PARENT user verified but parentId is missing. This may cause dashboard issues.");
      }

      setSuccess(result.message || "OTP verified successfully.");
      if (roleList.length > 1) {
        setTimeout(() => navigate("/school/role-selection", { replace: true }), 700);
      } else {
        setTimeout(() => {
          if (effectiveRole === "SCHOOL_PARENT") {
            console.log("Navigating SCHOOL_PARENT to:", redirectPath);
          }
          navigate(redirectPath, { replace: true });
        }, 700);
      }
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
