import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiToggleLeft,
  FiToggleRight,
  FiEdit2,
  FiTrash2,
  FiSearch,
} from "react-icons/fi";
import {
  getOrganizations,
  getOrganizationDetails,
  updateOrganization,
  deleteOrganization as deleteOrganizationApi,
  changeOrganizationStatus,
} from "../../services/organizationService";

export default function OrganizationDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formatOrganizationType = (type) => {
    const labels = {
      "e-school": "E-School",
      "e-college": "E-College",
      hospital: "Hospital",
    };

    return labels[type] || type;
  };
  const [confirmModal, setConfirmModal] = useState({
  show: false,
  title: "",
  message: "",
  action: null,
});
  const [organizations, setOrganizations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [editOrgId, setEditOrgId] = useState(null);
  const [editedOrg, setEditedOrg] = useState(null);

  useEffect(() => {
    if (location.state?.createdOrgId) {
      setSuccessMessage(
        `Organization created successfully. ID: ${location.state.createdOrgId}`
      );
    }
  }, [location.state]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getOrganizations();
        setOrganizations(data);
      } catch (err) {
        setError(err.message || "Unable to load organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(
    (org) =>
      (org.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (formatOrganizationType(org.organizationType) || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateEndDate = (joiningDate, subscriptionPeriod) => {
    if (!joiningDate) return "";

    const joining = new Date(joiningDate);
    const end = new Date(joining);

    const periodMap = {
      Monthly: { months: 1 },
      "3 Months": { months: 3 },
      "6 Months": { months: 6 },
      Yearly: { months: 12 },
      "2 Years": { months: 24 },
      "3 Years": { months: 36 },
      "Full Time": { months: 120 },
    };

    const { months = 0 } = periodMap[subscriptionPeriod] || {};
    end.setMonth(end.getMonth() + months);

    return end.toISOString().split("T")[0];
  };

  const startEditing = async (org) => {
    try {
      const details = await getOrganizationDetails(org.id);
      setEditOrgId(org.id);
      setEditedOrg({
        ...org,
        ...(details || {}),
        subscriptionCost: org.subscriptionCost,
        endDate: org.endDate,
      });
      setError("");
    } catch (err) {
      setEditOrgId(org.id);
      setEditedOrg({
        ...org,
        subscriptionCost: org.subscriptionCost,
        endDate: org.endDate,
      });
      setError(err.message || "Unable to load organization details");
    }
  };

  const handleEditChange = (field, value) => {
    setEditedOrg((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };

      if (field === "joiningDate" || field === "subscriptionPeriod") {
        updated.endDate = calculateEndDate(
          field === "joiningDate" ? value : prev.joiningDate,
          field === "subscriptionPeriod" ? value : prev.subscriptionPeriod
        );
      }

      return updated;   
    });
  };

  const saveOrganization = async () => {
    if (!editedOrg) return;

    try {
      const updated = await updateOrganization(editOrgId, editedOrg);
      setOrganizations((prev) => prev.map((item) => (item.id === editOrgId ? updated : item)));
      setEditOrgId(null);
      setEditedOrg(null);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to update organization");
    }
  };

  const cancelEdit = () => {
    setEditOrgId(null);
    setEditedOrg(null);
  };

  const toggleStatus = (org) => {
    setConfirmModal({
      show: true,
      title: org.status === "active" ? "Deactivate Organization?" : "Activate Organization?",
      message:
        org.status === "active"
          ? "All services will be stopped for this organization."
          : "All services will be activated for this organization.",
      action: async () => {
        try {
          const nextStatus = org.status === "active" ? "inactive" : "active";
          await changeOrganizationStatus(org.id, nextStatus);
          setOrganizations((prev) =>
            prev.map((item) =>
              item.id === org.id ? { ...item, status: nextStatus } : item
            )
          );
          setError("");
        } catch (err) {
          setError(err.message || "Unable to change organization status");
        }
      },
    });
  };

  const deleteOrganization = (org) => {
    setConfirmModal({
      show: true,
      title: "Delete Organization?",
      message: `Are you sure you want to delete ${org.name}? This action cannot be undone.`,
      action: async () => {
        try {
          await deleteOrganizationApi(org.id);
          setOrganizations((prev) => prev.filter((item) => item.id !== org.id));
          setError("");
        } catch (err) {
          setError(err.message || "Unable to delete organization");
        }
      },
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <div className="navbar flex-between">
          <h3 className="navbar-title">Organization Management</h3>
      
       <div> <button className="btn btn-primary"
              onClick={() => navigate("/organization-registration")}>
                + New Organization
              </button>
</div>
        </div>

        <div className="page">
          <div className="card mb-lg search-card">
            <div className="search-box">
              <FiSearch size={20} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search by organization name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              All Organizations ({filteredOrganizations.length})
            </div>

            {error && <div className="error-message" style={{ marginBottom: "12px" }}>{error}</div>}
            {successMessage && (
              <div
                className="success-message"
                style={{
                  marginBottom: "12px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#ecfdf3",
                  color: "#047857",
                  border: "1px solid #a7f3d0",
                }}
              >
                {successMessage}
              </div>
            )}

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Organization ID</th>
                    <th>Name</th>
                    <th>Organization Type</th>
                    <th>Admin</th>
                    <th>Joining Date</th>
                    <th>Subscription</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="empty-state">Loading organizations...</td>
                    </tr>
                  ) : filteredOrganizations.length > 0 ? (
                    filteredOrganizations.map((org) => (
                      <tr key={org.id}>
                        <td data-label="Organization ID"><strong>{org.id}</strong></td>

                        <td data-label="Name">
                          {editOrgId === org.id ? (
                            <>
                              <input
                                className="table-input"
                                type="text"
                                value={editedOrg?.name || ""}
                                onChange={(e) => handleEditChange("name", e.target.value)}
                                placeholder="Organization name"
                              />
                              <input
                                className="table-input"
                                type="text"
                                value={editedOrg?.registrationNo || ""}
                                onChange={(e) => handleEditChange("registrationNo", e.target.value)}
                                placeholder="Registration number"
                              />
                            </>
                          ) : (
                            <>
                              <p style={{ fontWeight: "600", margin: "0 0 4px 0" }}>{org.name}</p>
                              <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0" }}>{org.registrationNo}</p>
                            </>
                          )}
                        </td>

                        <td data-label="Organization Type">
                          {editOrgId === org.id ? (
                            <select
                              className="table-input"
                              value={editedOrg?.organizationType || "e-school"}
                              onChange={(e) => handleEditChange("organizationType", e.target.value)}
                            >
                              <option value="e-school">E-School</option>
                              <option value="e-college">E-College</option>
                              <option value="hospital">Hospital</option>
                            </select>
                          ) : (
                            formatOrganizationType(org.organizationType)
                          )}
                        </td>

                        <td data-label="Admin">
                          {editOrgId === org.id ? (
                            <>
                              <input
                                className="table-input"
                                type="text"
                                value={editedOrg?.admin || ""}
                                onChange={(e) => handleEditChange("admin", e.target.value)}
                                placeholder="Admin name"
                              />
                              <input
                                className="table-input"
                                type="email"
                                value={editedOrg?.email || ""}
                                onChange={(e) => handleEditChange("email", e.target.value)}
                                placeholder="Admin email"
                              />
                            </>
                          ) : (
                            <>
                              <p style={{ fontWeight: "600", margin: "0 0 4px 0" }}>{org.admin}</p>
                              <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0" }}>{org.email}</p>
                            </>
                          )}
                        </td>

                        <td data-label="Joining Date">
                          {editOrgId === org.id ? (
                            <input
                              className="table-input"
                              type="date"
                              value={editedOrg?.joiningDate || ""}
                              onChange={(e) => handleEditChange("joiningDate", e.target.value)}
                            />
                          ) : (
                            new Date(org.joiningDate).toLocaleDateString()
                          )}
                        </td>

                        <td data-label="Subscription">
                          {editOrgId === org.id ? (
                            <>
                              <input
                                className="table-input"
                                type="number"
                                value={editedOrg?.subscriptionCost || 0}
                                onChange={(e) => handleEditChange("subscriptionCost", Number(e.target.value))}
                                placeholder="Subscription cost"
                              />
                              <select
                                className="table-input"
                                value={editedOrg?.subscriptionPeriod || "Yearly"}
                                onChange={(e) => handleEditChange("subscriptionPeriod", e.target.value)}
                              >
                                <option value="Monthly">Monthly</option>
                                <option value="3 Months">3 Months</option>
                                <option value="6 Months">6 Months</option>
                                <option value="Yearly">Yearly</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="Full Time">Full Time</option>
                              </select>
                            </>
                          ) : (
                            <>
                              <p style={{ fontWeight: "600", margin: "0 0 4px 0" }}>
                                ₹{org.subscriptionCost.toLocaleString()}
                              </p>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#9ca3af",
                                  margin: "0",
                                }}
                              >
                                {org.subscriptionPeriod}
                              </p>
                            </>
                          )}
                        </td>

                        <td data-label="End Date">
                          {editOrgId === org.id ? (
                            <input
                              className="table-input"
                              type="date"
                              value={editedOrg?.endDate || ""}
                              onChange={(e) => handleEditChange("endDate", e.target.value)}
                            />
                          ) : (
                            new Date(org.endDate).toLocaleDateString()
                          )}
                        </td>

                        <td data-label="Status">
                          <span
                            className={`badge ${
                              org.status === "active"
                                ? "badge-success"
                                : "badge-danger"
                            }`}
                          >
                            {org.status === "active" ? "✓ Active" : "✗ Inactive"}
                          </span>
                        </td>

                        <td>
                          <div className="table-action">
                            {editOrgId === org.id ? (
                              <>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={saveOrganization}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => toggleStatus(org)}
                                >
                                  {org.status === "active" ? (
                                    <FiToggleRight />
                                  ) : (
                                    <FiToggleLeft />
                                  )}
                                  {org.status === "active"
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>

                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => startEditing(org)}
                                >
                                  <FiEdit2 /> Edit
                                </button>

                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => deleteOrganization(org)}
                                >
                                  <FiTrash2 /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="empty-state">No organizations found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid-3 mt-lg">
            <div className="card summary-card summary-card--blue">
              <p>Total Organizations</p>
              <h2>{organizations.length}</h2>
            </div>

            <div className="card summary-card summary-card--green">
              <p>Active</p>
              <h2>{organizations.filter((o) => o.status === "active").length}</h2>
            </div>

            <div className="card summary-card summary-card--red">
              <p>Inactive</p>
              <h2>{organizations.filter((o) => o.status === "inactive").length}</h2>
            </div>
          </div>
        </div>
      </div>
      {confirmModal.show && (
  <div className="custom-modal-overlay">
    <div className="custom-modal">
      <h3>{confirmModal.title}</h3>
      <p>{confirmModal.message}</p>

      <div className="modal-actions">
        <button
          className="btn btn-outline"
          onClick={() =>
            setConfirmModal({ show: false, title: "", message: "", action: null })
          }
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          onClick={() => {
            confirmModal.action();
            setConfirmModal({ show: false, title: "", message: "", action: null });
          }}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}