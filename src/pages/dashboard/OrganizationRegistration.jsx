import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { FiAlertCircle } from "react-icons/fi";
import { createOrganization } from "../../services/organizationService";

export default function OrganizationRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationId: "",
    organizationType: "e-school",
    registrationNumber: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phoneNo: "",
    joiningDate: "",
    subscriptionPeriod: "Yearly",
    subscriptionCost: "",
    address: "",
    comments: "",
  });

  const [errors, setErrors] = useState({});
  const [endDate, setEndDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const generateRegistrationNumber = () => {
    const timestamp = Date.now().toString();
    return `REG-${timestamp.slice(-8)}`;
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];

      if (field === "password" || field === "confirmPassword") {
        delete next.password;
        delete next.confirmPassword;
      }

      return next;
    });
  };

  const calculateEndDate = (joiningDate, period) => {
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

    const { months = 0 } = periodMap[period] || {};
    end.setMonth(end.getMonth() + months);

    return end.toISOString().split("T")[0];
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setFormData((prev) => ({ ...prev, joiningDate: date }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.joiningDate;
      return next;
    });
    setEndDate(calculateEndDate(date, formData.subscriptionPeriod));
  };

  const handlePeriodChange = (e) => {
    const period = e.target.value;
    setFormData((prev) => ({ ...prev, subscriptionPeriod: period }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.subscriptionPeriod;
      return next;
    });
    setEndDate(calculateEndDate(formData.joiningDate, period));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organizationName.trim()) newErrors.organizationName = "Organization name is required";
    if (!formData.organizationType.trim()) newErrors.organizationType = "Organization type is required";
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password && formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Valid email is required";
    if (!formData.phoneNo.match(/^\d{10}$/)) newErrors.phoneNo = "Valid 10-digit phone number is required";
    if (!formData.joiningDate) newErrors.joiningDate = "Joining date is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitted(true);
      setSubmitError("");

      const generatedRegistrationNumber = (formData.registrationNumber || "").trim() || generateRegistrationNumber();

      setFormData((prev) => ({
        ...prev,
        registrationNumber: generatedRegistrationNumber,
      }));

   const createdOrg = await createOrganization({
  orgName: formData.organizationName,
  orgAddress: formData.address,
  registrationNo: generatedRegistrationNumber,
  orgType: formData.organizationType,
  username: formData.username,
  password: formData.password,
  email: formData.email,
  mobileNumber: formData.phoneNo,
  comments: formData.comments,
  joiningDate: formData.joiningDate,
  subscriptionPeriod:
    formData.subscriptionPeriod === "Yearly"
      ? 12
      : parseInt(formData.subscriptionPeriod),
  subscriptionCost: Number(formData.subscriptionCost),
  endDate,
  status: "ACTIVE",
});
      const generatedId = createdOrg?.id || createdOrg?.orgId || createdOrg?.org_id || "";

      if (generatedId) {
        setFormData((prev) => ({ ...prev, organizationId: generatedId }));
      }

      setFormData({
        organizationName: "",
        organizationId: "",
        organizationType: "e-school",
        registrationNumber: "",
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phoneNo: "",
        joiningDate: "",
        subscriptionPeriod: "Yearly",
        subscriptionCost: "",
        address: "",
        comments: "",
      });
      setEndDate("");
      setErrors({});
      navigate("/organization-details", {
        state: {
          createdOrgId: generatedId,
          createdOrgName: formData.organizationName,
        },
      });
    } catch (error) {
      setSubmitError(error?.message || "Unable to create organization. Please try again.");
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <div className="navbar">
          <h3 className="navbar-title">Register New Organization</h3>
        </div>

        <div className="page">
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-header">Organization Information</div>

              <div className="form-row">
                <div className="form-group">
                  <label>Organization Name *</label>
                  <input
                    type="text"
                    placeholder="Enter organization name"
                    value={formData.organizationName}
                    onChange={(e) => updateField("organizationName", e.target.value)}
                  />
                  {errors.organizationName && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.organizationName}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Organization ID (Auto-generated)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated by the backend"
                    value={formData.organizationId || "Auto-generated"}
                    disabled
                    readOnly
                  />
                  <small style={{ color: "#6b7280", display: "block", marginTop: "4px" }}>
                    The system will generate this automatically when the organization is saved.
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Registration Number *</label>
                  <input
                    type="text"
                    placeholder="Enter registration number"
                    value={formData.registrationNumber}
                    onChange={(e) => updateField("registrationNumber", e.target.value)}
                  />
                  {errors.registrationNumber && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.registrationNumber}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    placeholder="Organization address"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                  {errors.address && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.address}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Organization Type *</label>
                  <select
                    value={formData.organizationType}
                    onChange={(e) => updateField("organizationType", e.target.value)}
                  >
                    <option value="e-school">E-School</option>
                    <option value="e-college">E-College</option>
                    <option value="hospital">Hospital</option>
                  </select>
                  {errors.organizationType && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.organizationType}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card mt-lg">
              <div className="card-header">Admin Account Credentials</div>

              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    placeholder="Create username"
                    value={formData.username}
                    onChange={(e) => updateField("username", e.target.value)}
                  />
                  {errors.username && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.username}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="Admin email address"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                  {errors.email && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    placeholder="Create strong password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                  />
                  {errors.password && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.password}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit phone number"
                    value={formData.phoneNo}
                    onChange={(e) => updateField("phoneNo", e.target.value)}
                  />
                  {errors.phoneNo && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.phoneNo}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Subscription Cost *</label>
                  <input
                    type="number"
                    placeholder="Enter subscription cost"
                    value={formData.subscriptionCost}
                    onChange={(e) => updateField("subscriptionCost", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card mt-lg">
              <div className="card-header">Subscription Details</div>

              <div className="form-row">
                <div className="form-group">
                  <label>Joining Date *</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleDateChange}
                  />
                  {errors.joiningDate && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.joiningDate}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Subscription Period *</label>
                  <select
                    value={formData.subscriptionPeriod}
                    onChange={handlePeriodChange}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="Yearly">Yearly</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3 Years">3 Years</option>
                    <option value="Full Time">Full Time (Permanent)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>End Date (Auto-calculated)</label>
                  <input
                    type="date"
                    value={endDate}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="form-group">
                  <label>Additional Comments (Optional)</label>
                  <textarea
                    placeholder="Any additional notes"
                    value={formData.comments}
                    onChange={(e) => updateField("comments", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {submitError && <div className="error-message" style={{ marginTop: "16px" }}>{submitError}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitted}
              >
                {submitted ? "Creating Organization..." : "Create Organization"}
              </button>
              <button
                type="reset"
                className="btn btn-outline"
                onClick={() => {
                  setErrors({});
                  setEndDate("");
                }}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}