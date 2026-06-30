import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiDollarSign,
} from "react-icons/fi";
import { getOrganizations } from "../../services/organizationService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    inactiveOrganizations: 0,
    pendingOrganizations: 0,
    holdsOrganizations: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const organizations = await getOrganizations();

        const activeOrgs = organizations.filter(org => org.status === "active");
        const inactiveOrgs = organizations.filter(org => org.status === "inactive");
        const pendingOrgs = organizations.filter(org => org.status === "pending");
        const holdOrgs = organizations.filter(org => org.status === "hold");
        const totalRevenue = organizations.reduce((sum, org) => sum + (org.subscriptionCost || 0), 0);

        setStats({
          totalOrganizations: organizations.length,
          activeOrganizations: activeOrgs.length,
          inactiveOrganizations: inactiveOrgs.length,
          holdsOrganizations: holdOrgs.length,
          totalRevenue,
          monthlyRevenue: Math.round(totalRevenue / 12),
        });

        setRecentActivity(
          organizations.slice(0, 5).map((org, idx) => ({
            id: org.id,
            org: org.name || org.organizationName,
            action: "Organization Registered",
            date: org.createdAt || org.joiningDate,
            status: org.status === "active" ? "success" : "warning",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch organizations", err);
      }
    };

    fetchOrganizations();
  }, []);

  const StatCard = ({ icon: Icon, label, value, subtitle, color }) => (
    <div className={`card stat-card stat-card--${color === "#10b981" ? "green" : color === "#ef4444" ? "red" : color === "#f59e0b" ? "amber" : color === "#7c3aed" ? "violet" : color === "#06b6d4" ? "cyan" : "blue"}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ backgroundColor: `${color}20`, color }}>
          <Icon />
        </div>
        <div>
          <p className="stat-card-label">{label}</p>
          <h3 className="stat-card-value">{value}</h3>
          <p className="stat-card-subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <div className="navbar">
          <h3 className="navbar-title">Dashboard</h3>
        </div>

        <div className="page">
          <div className="dashboard-hero">
            <div>
              <h2>Welcome back, Super Admin</h2>
              <p>Track organizations, subscriptions, and activity in one place.</p>
            </div>
            <button className="btn btn-primary"

              onClick={() => navigate("/organization-registration")}
            >
              + New Organization
            </button>
          </div>

          <div className="grid-3 mb-lg">
            <StatCard
              icon={FiUsers}
              label="Total Organizations"
              value={stats.totalOrganizations}
              subtitle="All registrations"
              color="#2563eb"
            />
            <StatCard
              icon={FiCheckCircle}
              label="Active Organizations"
              value={stats.activeOrganizations}
              subtitle="Currently active"
              color="#10b981"
            />
            <StatCard
              icon={FiXCircle}
              label="Inactive Organizations"
              value={stats.inactiveOrganizations}
              subtitle="Temporarily paused"
              color="#ef4444"
            />
          </div>

          <div className="grid-3 mb-lg">
            <StatCard
              icon={FiClock}
              label="Pending"
              value={stats.pendingOrganizations}
              subtitle="Awaiting activation"
              color="#f59e0b"
            />
             <StatCard
              icon={FiClock}
              label="On Hold"
              value={stats.holdsOrganizationsOrganizations}
              subtitle="Awaiting activation"
              color="#8b867c"
            />
            <StatCard
              icon={FiDollarSign}
              label="Total Revenue"
              value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
              subtitle="All subscriptions"
              color="#7c3aed"
            />
            <StatCard
              icon={FiTrendingUp}
              label="Monthly Revenue"
              value={`₹${(stats.monthlyRevenue / 100000).toFixed(1)}L`}
              subtitle="This month"
              color="#06b6d4"
            />
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">Recent Activity</div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Action</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id}>
                      <td>
                        <strong>{activity.org}</strong>
                      </td>
                      <td>{activity.action}</td>
                      <td>
                        {new Date(activity.date).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <span
                          className={`badge badge-${activity.status === "success"
                            ? "success"
                            : activity.status === "warning"
                              ? "warning"
                              : "info"
                            }`}
                        >
                          {activity.status === "success"
                            ? "✓ Success"
                            : activity.status === "warning"
                              ? "⚠ Attention"
                              : "ⓘ Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card mt-lg">
            <div className="card-header">Quick Actions</div>
            <div className="quick-actions">
              <button className="btn btn-primary"
                onClick={() => navigate("/organization-registration")}>
                + New Organization
              </button>
              <button className="btn btn-secondary"
                onClick={() => navigate("/organization-details")}>
                View All
              </button>
              <button className="btn btn-secondary"
                onClick={() => navigate("/subscription")}>Subscription</button>
              <button className="btn btn-secondary"
                onClick={() => navigate("/settings")}>Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}