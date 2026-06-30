import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  FiSettings,
  FiBell,
  FiLock,
  FiUser,
  FiGlobe,
  FiHardDrive,
  FiLogOut,
} from "react-icons/fi";

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: "School Administration System",
    supportEmail: "support@schooladmin.com",
    timeZone: "IST",
    language: "English",
    emailNotifications: true,
    twoFactorAuth: false,
    maintenanceMode: false,
    backupSchedule: "Daily",
  });

  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    console.log("Settings saved:", settings);
  };

  const SettingsGroup = ({ title, description, children }) => (
    <div className="card mb-lg">
      <div className="page-intro">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <div className="navbar">
          <h3 className="navbar-title">Settings & Configuration</h3>
        </div>

        <div className="page">
          {/* Tab Navigation */}
          <div className="card mb-lg settings-tabs">
            <button
              className={`btn btn-sm settings-tab ${activeTab === "general" ? "active" : "btn-secondary"}`}
              onClick={() => setActiveTab("general")}
            >
              <FiSettings size={16} /> General
            </button>
            <button
              className={`btn btn-sm settings-tab ${activeTab === "notifications" ? "active" : "btn-secondary"}`}
              onClick={() => setActiveTab("notifications")}
            >
              <FiBell size={16} /> Notifications
            </button>
            <button
              className={`btn btn-sm settings-tab ${activeTab === "security" ? "active" : "btn-secondary"}`}
              onClick={() => setActiveTab("security")}
            >
              <FiLock size={16} /> Security
            </button>
            <button
              className={`btn btn-sm settings-tab ${activeTab === "backup" ? "active" : "btn-secondary"}`}
              onClick={() => setActiveTab("backup")}
            >
              <FiHardDrive size={16} /> Backup
            </button>
          </div>

          {/* General Settings */}
          {activeTab === "general" && (
            <>
              <SettingsGroup
                title="System Configuration"
                description="Basic system settings and preferences"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>System Name</label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      placeholder="Enter system name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Support Email</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleChange("supportEmail", e.target.value)}
                      placeholder="support@example.com"
                    />
                  </div>
                </div>
              </SettingsGroup>

              <SettingsGroup
                title="Regional Settings"
                description="Configure timezone and language"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={settings.timeZone}
                      onChange={(e) => handleChange("timeZone", e.target.value)}
                    >
                      <option value="IST">Indian Standard Time (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="PST">Pacific Time (PST)</option>
                      <option value="EST">Eastern Time (EST)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleChange("language", e.target.value)}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                    </select>
                  </div>
                </div>
              </SettingsGroup>
            </>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <SettingsGroup
              title="Email Notifications"
              description="Control how and when you receive notifications"
            >
              <div className="settings-row">
                <div>
                  <h4 className="settings-title">Organization Registration</h4>
                  <p className="settings-description">
                    Receive alerts when new organizations register
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    handleChange("emailNotifications", e.target.checked)
                  }
                  style={{ cursor: "pointer", width: "20px", height: "20px" }}
                />
              </div>

              <div className="settings-row">
                <div>
                  <h4 className="settings-title">Subscription Expiring</h4>
                  <p className="settings-description">
                    Get notified before subscriptions expire
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{ cursor: "pointer", width: "20px", height: "20px" }}
                />
              </div>
            </SettingsGroup>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <>
              <SettingsGroup
                title="Authentication Security"
                description="Protect your account with advanced security options"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h4 className="settings-title">Two-Factor Authentication</h4>
                    <p className="settings-description">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) =>
                      handleChange("twoFactorAuth", e.target.checked)
                    }
                    style={{ cursor: "pointer", width: "20px", height: "20px" }}
                  />
                </div>
              </SettingsGroup>

              <SettingsGroup
                title="System Maintenance"
                description="Control system availability and maintenance mode"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h4 className="settings-title">Maintenance Mode</h4>
                    <p className="settings-description">
                      {settings.maintenanceMode
                        ? "System is currently in maintenance"
                        : "System is operating normally"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      handleChange("maintenanceMode", e.target.checked)
                    }
                    style={{ cursor: "pointer", width: "20px", height: "20px" }}
                  />
                </div>
              </SettingsGroup>
            </>
          )}

          {/* Backup Settings */}
          {activeTab === "backup" && (
            <SettingsGroup
              title="Data Backup"
              description="Configure automatic backup schedules"
            >
              <div className="form-row">
                <div className="form-group">
                  <label>Backup Schedule</label>
                  <select
                    value={settings.backupSchedule}
                    onChange={(e) => handleChange("backupSchedule", e.target.value)}
                  >
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="card" style={{ marginTop: "16px", background: "var(--surface-soft)" }}>
                <p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>
                  Last Backup: 2026-06-25 at 02:30 AM
                </p>
                <p className="settings-description" style={{ marginTop: "8px" }}>
                  Size: 2.5 GB | Status: ✓ Successful
                </p>
              </div>

              <button className="btn btn-primary" style={{ marginTop: "16px" }}>
                Backup Now
              </button>
            </SettingsGroup>
          )}

          {/* Save Button */}
          <div className="settings-footer">
            {saved && (
              <span className="settings-success">
                ✓ Settings saved successfully
              </span>
            )}
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}