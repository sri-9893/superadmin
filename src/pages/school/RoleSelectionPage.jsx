import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolSidebar from "../../components/SchoolSidebar";

export default function RoleSelectionPage() {
    const navigate = useNavigate();

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("currentUser") || "{}") || {};
        } catch {
            return {};
        }
    }, []);

    const dashboards = useMemo(() => {
        const storedDashboards = JSON.parse(localStorage.getItem("userDashboards") || "[]");
        return Array.isArray(storedDashboards) && storedDashboards.length > 0
            ? storedDashboards
            : user.dashboards || [];
    }, [user]);

    const handleSelect = (dashboard) => {
        localStorage.setItem("userRole", dashboard.role || user.role || "SCHOOL_STAFF");
        localStorage.setItem("selectedDashboard", dashboard.path);
        navigate(dashboard.path, { replace: true });
    };

    return (
        <div className="dashboard-layout">
            <SchoolSidebar />
            <div className="main-content">
                <div className="page">
                    <div className="card role-selection-card">
                        <h2>Choose Dashboard</h2>
                        <p>Select the dashboard that best matches your current responsibility.</p>
                        <div className="role-selection-grid">
                            {dashboards.map((dashboard) => (
                                <button key={dashboard.path} type="button" className="role-selection-card-item" onClick={() => handleSelect(dashboard)}>
                                    <h3>{dashboard.label}</h3>
                                    <p>{dashboard.path}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
