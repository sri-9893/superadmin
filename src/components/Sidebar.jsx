import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? "active" : "";

  const toggleSidebar = () => setIsOpen(!isOpen);

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("tempUser");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "active" : ""}`}>
        <div className="sidebar-header">🏫 SuperAdmin</div>

        <ul className="sidebar-menu">
          <li className="sidebar-menu-item">
            <Link
              to="/dashboard"
              className={`sidebar-menu-link ${isActive("/dashboard")}`}
              onClick={closeSidebar}
            >
              <FiHome /> Dashboard
            </Link>
          </li>

          {/* <li className="sidebar-menu-item">
            <Link
              to="/organization-registration"
              className={`sidebar-menu-link ${isActive("/organization-registration")}`}
              onClick={closeSidebar}
            >
              <FiBox /> New Organization
            </Link>
          </li> */}

          <li className="sidebar-menu-item">
            <Link
              to="/organization-details"
              className={`sidebar-menu-link ${isActive("/organization-details")}`}
              onClick={closeSidebar}
            >
              <FiBox /> Organizations
            </Link>
          </li>

          <li className="sidebar-menu-item">
            <Link
              to="/subscription"
              className={`sidebar-menu-link ${isActive("/subscription")}`}
              onClick={closeSidebar}
            >
              <FiCreditCard /> Subscriptions
            </Link>
          </li>

          <li className="sidebar-menu-item">
            <Link
              to="/settings"
              className={`sidebar-menu-link ${isActive("/settings")}`}
              onClick={closeSidebar}
            >
              <FiSettings /> Settings
            </Link>
          </li>

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