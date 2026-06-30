import { Navigate } from "react-router-dom";

const dashboardByRole = {
  SUPER_ADMIN: "/superadmin/dashboard",
  SCHOOL_ADMIN: "/school/dashboard",
  SCHOOL_TEACHER: "/school/teacher/dashboard",
  SCHOOL_PARENT: "/school/parent/dashboard",
  SCHOOL_CASHIER: "/school/cashier/dashboard",
  SCHOOL_CLASS_INCHARGE: "/school/incharge/dashboard",
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!isLoggedIn || !token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={dashboardByRole[role] || "/login"} replace />;
  }

  return children;
}

