import React, { useEffect, useState } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { useUI } from "../../components/UIContext";
import {
    FiSettings,
    FiImage,
    FiBell,
    FiLock,
    FiDatabase,
    FiRefreshCw,
    FiEye,
} from "react-icons/fi";

const defaultSettings = {
    schoolName: "My School",
    schoolCode: "SCH001",
    principalName: "",
    registrationNo: "",
    affiliationNo: "",
    supportEmail: "support@schooladmin.com",
    phone: "",
    website: "",
    address: "",
    city: "",
    stateName: "",
    pinCode: "",

    logo: "",
    loginLogo: "",
    theme: "light",
    primaryColor: "#2563eb",
    sidebarColor: "#111827",
    navbarColor: "#ffffff",

    academicYear: "2026-2027",
    startDate: "",
    endDate: "",
    schoolStartTime: "09:00",
    schoolEndTime: "16:00",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false,
    feeReminderAlerts: true,
    otpLogin: true,
    sessionTimeout: "8",
    maintenanceMode: false,
    backupSchedule: "Daily",
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchoolSettings() {
    const { setTheme, showToast } = useUI();
    const [settings, setSettings] = useState(defaultSettings);
    const [activeTab, setActiveTab] = useState("profile");
    const [saved, setSaved] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("school_settings") || "null");
        const finalSettings = stored ? { ...defaultSettings, ...stored } : defaultSettings;
        setSettings(finalSettings);
        applyTheme(finalSettings);
    }, []);

    const applyTheme = (data) => {
        document.documentElement.setAttribute("data-theme", data.theme);
        document.documentElement.style.setProperty("--primary", data.primaryColor);
        document.documentElement.style.setProperty("--sidebar-bg", data.sidebarColor);
        document.documentElement.style.setProperty("--navbar-bg", data.navbarColor);
        setTheme?.(data.theme);
    };

    const handleChange = (field, value) => {
        const next = { ...settings, [field]: value };
        setSettings(next);
        localStorage.setItem("school_settings", JSON.stringify(next));

        if (["theme", "primaryColor", "sidebarColor", "navbarColor"].includes(field)) {
            applyTheme(next);
        }
    };

    const handleImageUpload = (field, file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => handleChange(field, reader.result);
        reader.readAsDataURL(file);
    };

    const toggleWorkingDay = (day) => {
        const exists = settings.workingDays.includes(day);
        const updatedDays = exists
            ? settings.workingDays.filter((d) => d !== day)
            : [...settings.workingDays, day];

        handleChange("workingDays", updatedDays);
    };

    const handleSave = () => {
        localStorage.setItem("school_settings", JSON.stringify(settings));
        applyTheme(settings);
        setSaved(true);
        showToast?.("success", "School settings saved successfully");
        setTimeout(() => setSaved(false), 2500);
    };

    const handleReset = () => {
        setSettings(defaultSettings);
        localStorage.setItem("school_settings", JSON.stringify(defaultSettings));
        applyTheme(defaultSettings);
        showToast?.("info", "Settings reset to default");
    };

    const exportSettings = () => {
        const blob = new Blob([JSON.stringify(settings, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "school-settings.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    const importSettings = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const imported = JSON.parse(reader.result);
                const next = { ...defaultSettings, ...imported };
                setSettings(next);
                localStorage.setItem("school_settings", JSON.stringify(next));
                applyTheme(next);
                showToast?.("success", "Settings imported successfully");
            } catch {
                showToast?.("error", "Invalid settings file");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="dashboard-layout">
            <SchoolSidebar />

            <div className="main-content">
                <header className="navbar school-settings-navbar">
                    <div>
                        <h3>School Settings</h3>
                        <p>Manage school profile, branding, theme, security, and preferences.</p>
                    </div>

                    <div className="settings-header-actions">
                        <button className="btn btn-outline" onClick={() => setShowPreview(true)}>
                            <FiEye /> Preview
                        </button>
                        <button className="btn btn-secondary" onClick={handleReset}>
                            <FiRefreshCw /> Reset
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            Save Settings
                        </button>
                    </div>
                </header>

                <div className="page">
                    <div className="settings-shell">
                        <div className="settings-tabs-vertical">
                            <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
                                <FiSettings /> Profile
                            </button>
                            <button className={activeTab === "branding" ? "active" : ""} onClick={() => setActiveTab("branding")}>
                                <FiImage /> Branding
                            </button>
                            <button className={activeTab === "academic" ? "active" : ""} onClick={() => setActiveTab("academic")}>
                                <FiSettings /> Academic
                            </button>
                            <button className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
                                <FiBell /> Notifications
                            </button>
                            <button className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>
                                <FiLock /> Security
                            </button>
                            <button className={activeTab === "backup" ? "active" : ""} onClick={() => setActiveTab("backup")}>
                                <FiDatabase /> Backup
                            </button>
                        </div>

                        <div className="settings-content">
                            {activeTab === "profile" && (
                                <div className="card settings-card">
                                    <div className="card-header">
                                        <h3>School Profile</h3>
                                        <p>Basic school identity and contact details.</p>
                                    </div>

                                    <div className="grid-3">
                                        <div className="form-group">
                                            <label>School Name</label>
                                            <input value={settings.schoolName} onChange={(e) => handleChange("schoolName", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>School Code</label>
                                            <input value={settings.schoolCode} onChange={(e) => handleChange("schoolCode", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>Principal Name</label>
                                            <input value={settings.principalName} onChange={(e) => handleChange("principalName", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>Registration No</label>
                                            <input value={settings.registrationNo} onChange={(e) => handleChange("registrationNo", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>Affiliation No</label>
                                            <input value={settings.affiliationNo} onChange={(e) => handleChange("affiliationNo", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>Support Email</label>
                                            <input type="email" value={settings.supportEmail} onChange={(e) => handleChange("supportEmail", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input value={settings.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>Website</label>
                                            <input value={settings.website} onChange={(e) => handleChange("website", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>PIN Code</label>
                                            <input value={settings.pinCode} onChange={(e) => handleChange("pinCode", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid-3 mt-md">
                                        <div className="form-group grid-span-3">
                                            <label>Address</label>
                                            <input value={settings.address} onChange={(e) => handleChange("address", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>City</label>
                                            <input value={settings.city} onChange={(e) => handleChange("city", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>State</label>
                                            <input value={settings.stateName} onChange={(e) => handleChange("stateName", e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "branding" && (
                                <div className="card settings-card">
                                    <div className="card-header">
                                        <h3>Logo & Theme Branding</h3>
                                        <p>Change logo, sidebar, navbar, theme, and primary color.</p>
                                    </div>

                                    <div className="settings-upload-grid">
                                        <div className="upload-box">
                                            <h4>School Logo</h4>
                                            {settings.logo ? <img src={settings.logo} alt="Logo" /> : <div className="logo-placeholder">No Logo</div>}
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("logo", e.target.files[0])} />
                                            {settings.logo && <button className="btn btn-danger btn-sm" onClick={() => handleChange("logo", "")}>Remove</button>}
                                        </div>

                                        <div className="upload-box">
                                            <h4>Login Logo</h4>
                                            {settings.loginLogo ? <img src={settings.loginLogo} alt="Login Logo" /> : <div className="logo-placeholder">No Logo</div>}
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("loginLogo", e.target.files[0])} />
                                            {settings.loginLogo && <button className="btn btn-danger btn-sm" onClick={() => handleChange("loginLogo", "")}>Remove</button>}
                                        </div>
                                    </div>

                                    <div className="grid-4 mt-lg">
                                        <div className="form-group">
                                            <label>Theme</label>
                                            <select value={settings.theme} onChange={(e) => handleChange("theme", e.target.value)}>
                                                <option value="light">Light</option>
                                                <option value="dark">Dark</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Primary Color</label>
                                            <input type="color" value={settings.primaryColor} onChange={(e) => handleChange("primaryColor", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>Sidebar Color</label>
                                            <input type="color" value={settings.sidebarColor} onChange={(e) => handleChange("sidebarColor", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>Navbar Color</label>
                                            <input type="color" value={settings.navbarColor} onChange={(e) => handleChange("navbarColor", e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "academic" && (
                                <div className="card settings-card">
                                    <div className="card-header">
                                        <h3>Academic Settings</h3>
                                        <p>Academic year, working days, and school timings.</p>
                                    </div>

                                    <div className="grid-3">
                                        <div className="form-group">
                                            <label>Academic Year</label>
                                            <input value={settings.academicYear} onChange={(e) => handleChange("academicYear", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>Start Date</label>
                                            <input type="date" value={settings.startDate} onChange={(e) => handleChange("startDate", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>End Date</label>
                                            <input type="date" value={settings.endDate} onChange={(e) => handleChange("endDate", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>School Start Time</label>
                                            <input type="time" value={settings.schoolStartTime} onChange={(e) => handleChange("schoolStartTime", e.target.value)} />
                                        </div>

                                        <div className="form-group">
                                            <label>School End Time</label>
                                            <input type="time" value={settings.schoolEndTime} onChange={(e) => handleChange("schoolEndTime", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="form-group mt-md">
                                        <label>Working Days</label>
                                        <div className="checkbox-chip-grid">
                                            {days.map((day) => (
                                                <label key={day} className="checkbox-chip">
                                                    <input type="checkbox" checked={settings.workingDays.includes(day)} onChange={() => toggleWorkingDay(day)} />
                                                    {day}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "notifications" && (
                                <div className="card settings-card">
                                    <div className="card-header">
                                        <h3>Notification Settings</h3>
                                        <p>Control communication preferences.</p>
                                    </div>

                                    <ToggleRow title="Email Notifications" checked={settings.emailNotifications} onChange={(e) => handleChange("emailNotifications", e.target.checked)} />
                                    <ToggleRow title="SMS Notifications" checked={settings.smsNotifications} onChange={(e) => handleChange("smsNotifications", e.target.checked)} />
                                    <ToggleRow title="WhatsApp Notifications" checked={settings.whatsappNotifications} onChange={(e) => handleChange("whatsappNotifications", e.target.checked)} />
                                    <ToggleRow title="Fee Reminder Alerts" checked={settings.feeReminderAlerts} onChange={(e) => handleChange("feeReminderAlerts", e.target.checked)} />
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div className="card settings-card">
                                    <div className="card-header">
                                        <h3>Login & Security</h3>
                                        <p>Manage OTP, session timeout, and maintenance mode.</p>
                                    </div>

                                    <ToggleRow title="Enable OTP Login" checked={settings.otpLogin} onChange={(e) => handleChange("otpLogin", e.target.checked)} />
                                    <ToggleRow title="Maintenance Mode" checked={settings.maintenanceMode} onChange={(e) => handleChange("maintenanceMode", e.target.checked)} />

                                    <div className="form-group mt-md">
                                        <label>Session Timeout Hours</label>
                                        <input type="number" value={settings.sessionTimeout} onChange={(e) => handleChange("sessionTimeout", e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {activeTab === "backup" && (
                                <div className="card settings-card">
                                    <div className="card-header">
                                        <h3>Backup & Restore</h3>
                                        <p>Export and import frontend settings data.</p>
                                    </div>

                                    <div className="form-group">
                                        <label>Backup Schedule</label>
                                        <select value={settings.backupSchedule} onChange={(e) => handleChange("backupSchedule", e.target.value)}>
                                            <option value="Hourly">Hourly</option>
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="Monthly">Monthly</option>
                                        </select>
                                    </div>

                                    <div className="backup-actions mt-md">
                                        <button className="btn btn-primary" onClick={exportSettings}>Export Settings</button>

                                        <label className="btn btn-outline">
                                            Import Settings
                                            <input type="file" accept=".json" hidden onChange={(e) => importSettings(e.target.files[0])} />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {saved && <div className="settings-floating-success">Settings saved successfully</div>}

                    {showPreview && (
                        <div className="modal-overlay">
                            <div className="modal-card settings-preview-card">
                                <div className="modal-header">
                                    <h3>School Settings Preview</h3>
                                    <button className="icon-btn" onClick={() => setShowPreview(false)}>×</button>
                                </div>

                                <div className="preview-grid">
                                    <p><strong>School:</strong> {settings.schoolName}</p>
                                    <p><strong>Code:</strong> {settings.schoolCode}</p>
                                    <p><strong>Principal:</strong> {settings.principalName || "-"}</p>
                                    <p><strong>Email:</strong> {settings.supportEmail}</p>
                                    <p><strong>Academic Year:</strong> {settings.academicYear}</p>
                                    <p><strong>Theme:</strong> {settings.theme}</p>
                                </div>

                                <div className="form-actions mt-lg">
                                    <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>Close</button>
                                    <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ToggleRow({ title, checked, onChange }) {
    return (
        <div className="settings-row">
            <div>
                <h4 className="settings-title">{title}</h4>
                <p className="settings-description">Enable or disable this option.</p>
            </div>

            <label className="switch">
                <input type="checkbox" checked={checked} onChange={onChange} />
                <span className="slider"></span>
            </label>
        </div>
    );
}