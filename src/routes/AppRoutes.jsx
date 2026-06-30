import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import VerifyOtp from "../pages/VerifyOtp";
import Unauthorized from "../pages/Unauthorized";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import OrganizationDetails from "../pages/superadmin//OrganizationDetails";
import OrganizationRegistration from "../pages/dashboard/OrganizationRegistration";

// New School ERP imports
import SchoolDashboard from "../pages/school/SchoolDashboard";
import Classes from "../pages/school/Classes";
import Students from "../pages/school/Students";
import Teachers from "../pages/school/Teachers";
import Attendance from "../pages/school/Attendance";
import Timetable from "../pages/school/Timetable";
import Calendar from "../pages/school/Calendar";
import Notices from "../pages/school/Notices";
import Fees from "../pages/school/Fees";
import Parents from "../pages/school/Parents";
import ParentDashboard from "../pages/school/ParentDashboard";
import TeacherDashboard from "../pages/school/TeacherDashboard";
import CashierDashboard from "../pages/school/CashierDashboard";
import InchargeDashboard from "../pages/school/InchargeDashboard";

function DashboardRedirect() {
  const role = localStorage.getItem("userRole");
  const dashboardMap = {
    SUPER_ADMIN: "/superadmin/dashboard",
    SCHOOL_ADMIN: "/school/dashboard",
    SCHOOL_TEACHER: "/school/teacher/dashboard",
    SCHOOL_PARENT: "/school/parent/dashboard",
    SCHOOL_CASHIER: "/school/cashier/dashboard",
    SCHOOL_CLASS_INCHARGE: "/school/incharge/dashboard",
  };
  return <Navigate to={dashboardMap[role] || "/login"} replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Superadmin routes */}
        <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><Dashboard /></ProtectedRoute>} />

        {/* School Admin routes */}
        <Route path="/school/dashboard" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><SchoolDashboard /></ProtectedRoute>} />
        <Route path="/school/classes" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><Classes /></ProtectedRoute>} />
        <Route path="/school/students" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><Students /></ProtectedRoute>} />
        <Route path="/school/teachers" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><Teachers /></ProtectedRoute>} />
        <Route path="/school/attendance" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><Attendance /></ProtectedRoute>} />
        <Route path="/school/timetable" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><Timetable /></ProtectedRoute>} />
        <Route path="/school/calendar" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><Calendar /></ProtectedRoute>} />
        <Route path="/school/notices" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><Notices /></ProtectedRoute>} />
        <Route path="/school/fees" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><Fees /></ProtectedRoute>} />
        <Route path="/school/parents" element={<ProtectedRoute allowedRoles={["SCHOOL_ADMIN"]}><Parents /></ProtectedRoute>} />

        {/* Teacher Dashboard routes */}
        <Route path="/school/teacher/dashboard" element={<ProtectedRoute allowedRoles={["SCHOOL_TEACHER"]}><TeacherDashboard /></ProtectedRoute>} />

        {/* Parent Dashboard routes */}
        <Route path="/school/parent/dashboard" element={<ProtectedRoute allowedRoles={["SCHOOL_PARENT"]}><ParentDashboard /></ProtectedRoute>} />

        {/* Cashier Dashboard routes */}
        <Route path="/school/cashier/dashboard" element={<ProtectedRoute allowedRoles={["SCHOOL_CASHIER"]}><CashierDashboard /></ProtectedRoute>} />

        {/* Class Incharge Dashboard routes */}
        <Route path="/school/incharge/dashboard" element={<ProtectedRoute allowedRoles={["SCHOOL_CLASS_INCHARGE"]}><InchargeDashboard /></ProtectedRoute>} />

        {/* Generic Dashboard Redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/organization-registration" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/organization-details" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><DashboardRedirect /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;