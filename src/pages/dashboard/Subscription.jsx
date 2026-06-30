import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import {
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiFilter,
} from "react-icons/fi";
import { getOrganizations } from "../../services/organizationService";

export default function Subscription() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingSubId, setEditingSubId] = useState(null);
  const [editedSub, setEditedSub] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const organizations = await getOrganizations();
        
        const subs = organizations.map((org) => ({
          id: org.id,
          orgName: org.name || org.organizationName || "Organization",
          plan: org.subscriptionPeriod || "Yearly",
          amount: org.subscriptionCost || 0,
          startDate: org.joiningDate || new Date().toISOString().split("T")[0],
          endDate: org.endDate || new Date().toISOString().split("T")[0],
          autoRenewal: org.status === "active",
          status: org.status === "active" ? "active" : "expiring",
        }));
        
        setSubscriptions(subs);
      } catch (err) {
        console.error("Failed to fetch subscriptions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const getPeriodMonths = (plan) => {
    switch (plan) {
      case "Monthly":
        return 1;
      case "3 Months":
        return 3;
      case "6 Months":
        return 6;
      case "2 Years":
        return 24;
      case "3 Years":
        return 36;
      default:
        return 12;
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  const renewSubscription = (sub) => {
    setSubscriptions((prev) =>
      prev.map((item) => {
        if (item.id !== sub.id) return item;
        const currentEnd = new Date(item.endDate);
        const newEnd = new Date(currentEnd);
        newEnd.setMonth(newEnd.getMonth() + getPeriodMonths(item.plan));

        return {
          ...item,
          autoRenewal: true,
          status: "active",
          endDate: newEnd.toISOString().split("T")[0],
        };
      })
    );
  };

  const startSubscriptionEdit = (sub) => {
    setEditingSubId(sub.id);
    setEditedSub({ ...sub });
  };

  const handleSubscriptionChange = (field, value) => {
    setEditedSub((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      if (field === "plan") {
        const endDate = new Date(updated.startDate);
        endDate.setMonth(endDate.getMonth() + getPeriodMonths(value));
        updated.endDate = endDate.toISOString().split("T")[0];
      }
      if (field === "autoRenewal") {
        updated.status = value ? "active" : "expiring";
      }
      return updated;
    });
  };

  const saveSubscription = () => {
    if (!editedSub) return;
    setSubscriptions((prev) =>
      prev.map((item) =>
        item.id === editingSubId ? editedSub : item
      )
    );
    setEditingSubId(null);
    setEditedSub(null);
  };

  const cancelSubscriptionEdit = () => {
    setEditingSubId(null);
    setEditedSub(null);
  };

  const filteredSubs =
    filterStatus === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.status === filterStatus);

  const stats = {
    totalRevenue: subscriptions.reduce((sum, s) => sum + s.amount, 0),
    activePlans: subscriptions.filter((s) => s.status === "active").length,
    expiringPlans: subscriptions.filter((s) => s.status === "expiring").length,
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: `${color}20`,
            color: color,
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon />
        </div>
        <div>
          <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#9ca3af" }}>
            {label}
          </p>
          <h3 style={{ margin: "0", fontSize: "24px", fontWeight: "700" }}>
            {value}
          </h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <div className="navbar">
          <h3 className="navbar-title">Subscription Management</h3>
        </div>

        <div className="page">
          {/* Stats */}
          <div className="grid-3 mb-lg">
            <StatCard
              icon={FiDollarSign}
              label="Total Revenue"
              value={`₹${(stats.totalRevenue / 100000).toFixed(2)}L`}
              color="#2563eb"
            />
            <StatCard
              icon={FiCheckCircle}
              label="Active Plans"
              value={stats.activePlans}
              color="#10b981"
            />
            <StatCard
              icon={FiAlertCircle}
              label="Expiring Soon"
              value={stats.expiringPlans}
              color="#f59e0b"
            />
          </div>

          {/* Filters and Subscriptions Table */}
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 className="card-header">All Subscriptions</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className={`btn btn-sm ${
                    filterStatus === "all" ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </button>
                <button
                  className={`btn btn-sm ${
                    filterStatus === "active" ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => setFilterStatus("active")}
                >
                  Active
                </button>
                <button
                  className={`btn btn-sm ${
                    filterStatus === "expiring" ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => setFilterStatus("expiring")}
                >
                  Expiring
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Plan Type</th>
                    <th>Amount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Auto Renewal</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                        <p style={{ color: "#9ca3af" }}>Loading subscriptions...</p>
                      </td>
                    </tr>
                  ) : filteredSubs.length > 0 ? (
                    filteredSubs.map((sub) => (
                      <tr key={sub.id}>
                        <td data-label="Organization">
                          <strong>{sub.orgName}</strong>
                        </td>
                        <td data-label="Plan Type">
                          {editingSubId === sub.id ? (
                            <select
                              className="table-input"
                              value={editedSub?.plan || "Yearly"}
                              onChange={(e) => handleSubscriptionChange("plan", e.target.value)}
                            >
                              <option value="Monthly">Monthly</option>
                              <option value="3 Months">3 Months</option>
                              <option value="6 Months">6 Months</option>
                              <option value="Yearly">Yearly</option>
                              <option value="2 Years">2 Years</option>
                              <option value="3 Years">3 Years</option>
                            </select>
                          ) : (
                            sub.plan
                          )}
                        </td>
                        <td data-label="Amount">
                          {editingSubId === sub.id ? (
                            <input
                              className="table-input"
                              type="number"
                              value={editedSub?.amount || 0}
                              onChange={(e) => handleSubscriptionChange("amount", Number(e.target.value))}
                            />
                          ) : (
                            <strong>₹{sub.amount.toLocaleString()}</strong>
                          )}
                        </td>
                        <td data-label="Start Date">
                          {editingSubId === sub.id ? (
                            <input
                              className="table-input"
                              type="date"
                              value={editedSub?.startDate || ""}
                              onChange={(e) => handleSubscriptionChange("startDate", e.target.value)}
                            />
                          ) : (
                            formatDate(sub.startDate)
                          )}
                        </td>
                        <td data-label="End Date">
                          {editingSubId === sub.id ? (
                            <input
                              className="table-input"
                              type="date"
                              value={editedSub?.endDate || ""}
                              onChange={(e) => handleSubscriptionChange("endDate", e.target.value)}
                            />
                          ) : (
                            formatDate(sub.endDate)
                          )}
                        </td>
                        <td data-label="Auto Renewal">
                          {editingSubId === sub.id ? (
                            <select
                              className="table-input"
                              value={editedSub?.autoRenewal ? "true" : "false"}
                              onChange={(e) => handleSubscriptionChange("autoRenewal", e.target.value === "true")}
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <span className="badge badge-success">
                              {sub.autoRenewal ? "✓ Yes" : "✗ No"}
                            </span>
                          )}
                        </td>
                        <td data-label="Status">
                          <span
                            className={`badge badge-${
                              sub.status === "active" ? "success" : "warning"
                            }`}
                          >
                            {sub.status === "active"
                              ? "✓ Active"
                              : "⚠ Expiring"}
                          </span>
                        </td>
                        <td>
                          <div className="table-action">
                            {editingSubId === sub.id ? (
                              <>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={saveSubscription}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={cancelSubscriptionEdit}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => renewSubscription(sub)}
                                >
                                  Renew
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => startSubscriptionEdit(sub)}
                                >
                                  Edit
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                        <p style={{ color: "#9ca3af" }}>
                          No subscriptions found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}