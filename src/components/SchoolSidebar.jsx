import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiGrid,
  FiUsers,
  FiBookOpen,
  FiUserCheck,
  FiClock,
  FiCalendar,
  FiBell,
  FiCreditCard,
  FiTrendingUp,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function SchoolSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("school_settings") || "{}");
    setSchoolSettings(stored);
  }, []);

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("tempUser");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { label: "Dashboard", path: "/school/dashboard", icon: FiHome },
    { label: "Classes", path: "/school/classes", icon: FiGrid },
    { label: "Students", path: "/school/students", icon: FiUsers },
    { label: "Staff Management", path: "/school/staff", icon: FiBookOpen },
    { label: "Attendance", path: "/school/attendance", icon: FiUserCheck },
    { label: "Timetable", path: "/school/timetable", icon: FiClock },
    { label: "Calendar", path: "/school/calendar", icon: FiCalendar },
    { label: "Notices", path: "/school/notices", icon: FiBell },
    { label: "Fees", path: "/school/fees", icon: FiCreditCard },
    { label: "Examinations", path: "/school/examinations/dashboard", icon: FiBookOpen },
    { label: "Parents", path: "/school/parents", icon: FiUsers },
    { label: "Reports", path: "/school/reports", icon: FiTrendingUp },
    { label: "Settings", path: "/school/settings", icon: FiSettings },
  ];

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`sidebar ${isOpen ? "active" : ""}`}>
        <div className="sidebar-brand">
          {schoolSettings.logo ? (
            <img
              src={schoolSettings.logo}
              alt="School Logo"
              className="sidebar-school-logo"
            />
          ) : (
            <div className="sidebar-logo-fallback">🏫</div>
          )}

          <div className="sidebar-header">
            {schoolSettings.schoolName || "Administation"}
          </div>

          <div className="sidebar-subtitle">Portal Management</div>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li className="sidebar-menu-item" key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-menu-link ${isActive(item.path)}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon /> {item.label}
                </Link>
              </li>
            );
          })}
          <li className="sidebar-menu-item">
            <button
              className="sidebar-menu-link sidebar-logout"
              onClick={handleLogout}
            >
              <FiLogOut /> Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
