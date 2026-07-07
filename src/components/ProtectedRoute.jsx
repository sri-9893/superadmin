import { Navigate } from "react-router-dom";

const dashboardByRole = {
  SUPER_ADMIN: "/superadmin/dashboard",
  SCHOOL_ADMIN: "/school/dashboard",
  SCHOOL_TEACHER: "/school/teacher/dashboard",
  SCHOOL_CLASS_TEACHER: "/school/class-teacher/dashboard",
  SCHOOL_PARENT: "/school/parent/dashboard",
  SCHOOL_CASHIER: "/school/cashier/dashboard",
  SCHOOL_ACCOUNTANT: "/school/accountant/dashboard",
  SCHOOL_DRIVER: "/school/driver/dashboard",
  SCHOOL_CLASS_INCHARGE: "/school/incharge/dashboard",
  SCHOOL_STAFF: "/school/dashboard",
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");
  const userRoles = JSON.parse(localStorage.getItem("userRoles") || "[]");
  const roles = [role, ...(Array.isArray(userRoles) ? userRoles : [])].filter(Boolean);

  // Debug: Log the current protection state
  if (process.env.NODE_ENV === "development") {
    console.log("ProtectedRoute Check:", { isLoggedIn, token, role, roles, allowedRoles });
  }

  if (!isLoggedIn || !token || roles.length === 0) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.some((item) => roles.includes(item))) {
    return <Navigate to={dashboardByRole[roles[0]] || "/login"} replace />;
  }

  return children;
}

