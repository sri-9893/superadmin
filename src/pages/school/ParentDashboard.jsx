import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiHome,
  FiUser,
  FiCheckSquare,
  FiDollarSign,
  FiClock,
  FiBook,
  FiBell,
  FiCalendar,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [parentName, setParentName] = useState("");
  const [parentContact, setParentContact] = useState("");

  // Data states
  const [attendanceSummary, setAttendanceSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    percentage: 0,
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [feeRecord, setFeeRecord] = useState(null);
  const [feeViewMode, setFeeViewMode] = useState("individual"); // 'individual' | 'combined'
  const [combinedValues, setCombinedValues] = useState({ collected: 0, total: 0, pending: 0, details: [] });
  const [timetable, setTimetable] = useState([]);
  const [examMarks, setExamMarks] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

  const timetableGrid = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        periods: PERIODS.map((period) =>
          timetable.find((slot) => slot.day === day && Number(slot.period) === period) || null
        ),
      })),
    [timetable]
  );

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser") || "{}") || {};
    const username = currentUser.username || localStorage.getItem("username") || sessionStorage.getItem("username");
    const parentId = currentUser.parentId || localStorage.getItem("parentId") || sessionStorage.getItem("parentId");

    // Debug: Log parent identification
    console.log("ParentDashboard - Parent Identification:", {
      currentUser,
      username,
      parentId,
      localStorageParentId: localStorage.getItem("parentId"),
      sessionStorageParentId: sessionStorage.getItem("parentId"),
    });

    const studentsList = JSON.parse(localStorage.getItem("school_students") || "[]");
    const attendanceList = JSON.parse(localStorage.getItem("school_attendance") || "[]");
    const feesList = JSON.parse(localStorage.getItem("school_fees") || "[]");
    const timetableList = JSON.parse(localStorage.getItem("school_timetable") || "[]");
    const noticesList = JSON.parse(localStorage.getItem("school_notices") || "[]");
    const eventsList = JSON.parse(localStorage.getItem("school_calendar_events") || "[]");
    const marksList = JSON.parse(localStorage.getItem("school_exam_marks") || "[]");

    let parentChildren = [];
    if (parentId) {
      parentChildren = studentsList.filter((s) => s.parentId === parentId);
    }

    if (parentChildren.length === 0 && username) {
      parentChildren = studentsList.filter((s) => s.parentUsername === username);
    }

    // Debug: Log student matching
    console.log("ParentDashboard - Student Matching:", {
      parentId,
      username,
      matchedByParentId: parentId ? studentsList.filter((s) => s.parentId === parentId).length : 0,
      matchedByUsername: username ? studentsList.filter((s) => s.parentUsername === username).length : 0,
      totalChildren: parentChildren.length,
      allStudents: studentsList.length,
    });

    setChildren(parentChildren);

    const selectedChild =
      parentChildren.find((s) => s.id === selectedChildId) || parentChildren[0] || null;

    if (!selectedChild) {
      setStudent(null);
      setParentName("Parent");
      setParentContact("");
      setAttendanceSummary({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        percentage: 0,
      });
      setAttendanceRecords([]);
      setFeeRecord(null);
      setTimetable([]);
      setExamMarks([]);
      setNotices([]);
      setEvents([]);
      return;
    }

    if (!selectedChildId || selectedChild.id !== selectedChildId) {
      setSelectedChildId(selectedChild.id);
    }

    setStudent(selectedChild);
    setParentName(selectedChild.parentName || "Parent");
    setParentContact(
      selectedChild.parentContact || selectedChild.parentMobile || selectedChild.parentEmail || ""
    );

    const childAttendance = attendanceList.filter((a) => a.studentId === selectedChild.id);
    const summary = {
      total: childAttendance.length,
      present: childAttendance.filter((a) => a.status === "Present").length,
      absent: childAttendance.filter((a) => a.status === "Absent").length,
      late: childAttendance.filter((a) => a.status === "Late").length,
      halfDay: childAttendance.filter((a) => a.status === "Half Day").length,
      percentage: 0,
    };

    if (summary.total > 0) {
      const presentWeight = summary.present + summary.late * 0.9 + summary.halfDay * 0.5;
      summary.percentage = Math.round((presentWeight / summary.total) * 100);
    }

    setAttendanceSummary(summary);
    setAttendanceRecords(
      childAttendance.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
    );

    const record = feesList.find((f) => f.studentId === selectedChild.id);
    setFeeRecord(record);

    // compute combined fees for all children of this parent
    const childIds = parentChildren.map((c) => c.id);
    const childrenFees = feesList.filter((f) => childIds.includes(f.studentId));
    const combinedCollected = childrenFees.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
    const combinedTotal = childrenFees.reduce((sum, item) => sum + Number(item.totalFee || 0), 0);
    const combinedPending = childrenFees.reduce((sum, item) => sum + Number(item.pendingAmount || 0), 0);
    setCombinedValues({ collected: combinedCollected, total: combinedTotal, pending: combinedPending, details: childrenFees });

    const childSlots = timetableList.filter(
      (tt) => tt.className === selectedChild.className && tt.section === selectedChild.section
    );
    setTimetable(childSlots);

    const childMarks = marksList.filter((m) => m.studentId === selectedChild.id);
    setExamMarks(childMarks.sort((a, b) => new Date(b.date) - new Date(a.date)));

    const relevantNotices = noticesList.filter(
      (n) =>
        (n.audience === "Parents" || n.audience === "All") &&
        n.status === "Published"
    );
    setNotices(relevantNotices.sort((a, b) => new Date(b.date) - new Date(a.date)));

    const relevantEvents = eventsList.filter(
      (e) =>
        (e.audience === "Parents" || e.audience === "Students" || e.audience === "All") &&
        e.status === "Active"
    );
    setEvents(relevantEvents.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [selectedChildId]);

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

  if (!student) {
    return (
      <div className="parent-no-child">
        <div className="parent-no-child-card">
          <div className="parent-no-child-icon">👤</div>
          <h2>No Child Profile Linked</h2>
          <p>No child profile linked to this parent account.</p>
          <p className="parent-no-child-subtext">
            Please contact the school administration to link your profile with a student record.
          </p>
          <button className="btn btn-primary" onClick={handleLogout}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-dashboard-layout">
      {/* Mobile Sidebar Toggle */}
      <button
        className="parent-mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="parent-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`parent-sidebar ${sidebarOpen ? "active" : ""}`}>
        <div className="parent-sidebar-header">
          <div className="parent-sidebar-logo">
            <span className="parent-logo-icon">📚</span>
            <h2>Parent Portal</h2>
          </div>
        </div>

        <div className="parent-sidebar-user">
          <div className="parent-user-avatar">👨‍👩‍👧</div>
          <div className="parent-user-info">
            <p className="parent-user-name">{parentName}</p>
            <p className="parent-user-role">Parent</p>
          </div>
        </div>

        <nav className="parent-sidebar-nav">
          <button
            className={`parent-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
          >
            <FiHome /> Dashboard
          </button>
          <button
            className={`parent-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("profile");
              setSidebarOpen(false);
            }}
          >
            <FiUser /> Child Profile
          </button>
          <button
            className={`parent-nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("attendance");
              setSidebarOpen(false);
            }}
          >
            <FiCheckSquare /> Attendance
          </button>
          <button
            className={`parent-nav-item ${activeTab === "fees" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("fees");
              setSidebarOpen(false);
            }}
          >
            <FiDollarSign /> Fees
          </button>
          <button
            className={`parent-nav-item ${activeTab === "timetable" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("timetable");
              setSidebarOpen(false);
            }}
          >
            <FiClock /> Timetable
          </button>
          <button
            className={`parent-nav-item ${activeTab === "marks" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("marks");
              setSidebarOpen(false);
            }}
          >
            <FiBook /> Marks
          </button>
          <button
            className={`parent-nav-item ${activeTab === "notices" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("notices");
              setSidebarOpen(false);
            }}
          >
            <FiBell /> Notices
          </button>
          <button
            className={`parent-nav-item ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("calendar");
              setSidebarOpen(false);
            }}
          >
            <FiCalendar /> Calendar
          </button>
        </nav>

        <button className="parent-logout-btn" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="parent-main-content">
        {/* Top Bar */}
        <div className="parent-topbar">
          <div className="parent-topbar-left">
            <h1>Parent Portal</h1>
            <p>
              {student.name} • Class {student.className} - {student.section}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="parent-content">
          {children.length > 1 && (
            <div className="parent-child-tabs">
              {children.map((child) => (
                <button
                  key={child.id}
                  className={`parent-child-tab ${child.id === selectedChildId ? "active" : ""}`}
                  onClick={() => setSelectedChildId(child.id)}
                >
                  <div className="parent-child-title">{child.name}</div>
                  <div className="parent-child-meta">
                    <span>{child.admissionNo}</span>
                    <span>{child.className} - {child.section}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {children.length > 1 && (
            <div style={{ margin: "12px 0", display: "flex", gap: 8 }}>
              <button
                className={"btn btn-sm " + (feeViewMode === "individual" ? "btn-primary" : "btn-outline")}
                onClick={() => setFeeViewMode("individual")}
              >
                Per Child
              </button>
              <button
                className={"btn btn-sm " + (feeViewMode === "combined" ? "btn-primary" : "btn-outline")}
                onClick={() => setFeeViewMode("combined")}
              >
                Combined
              </button>
            </div>
          )}
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="parent-section">
              <h2 className="parent-section-title">Dashboard Overview</h2>

              {/* Quick Stats */}
              <div className="parent-stats-grid">
                <div className="parent-stat-card parent-stat-blue">
                  <div className="parent-stat-icon">
                    <FiCheckSquare />
                  </div>
                  <div className="parent-stat-content">
                    <p className="parent-stat-label">Attendance</p>
                    <h3 className="parent-stat-value">
                      {attendanceSummary.percentage}%
                    </h3>
                    <p className="parent-stat-desc">
                      {attendanceSummary.present} of {attendanceSummary.total} days
                    </p>
                  </div>
                </div>

                <div className="parent-stat-card parent-stat-green">
                  <div className="parent-stat-icon">
                    <FiDollarSign />
                  </div>
                  <div className="parent-stat-content">
                    <p className="parent-stat-label">Fees Paid</p>
                    <h3 className="parent-stat-value">
                      ₹{children.length > 1 && feeViewMode === "combined"
                        ? combinedValues.collected.toLocaleString("en-IN")
                        : feeRecord
                          ? Number(feeRecord.paidAmount || 0).toLocaleString("en-IN")
                          : "0"}
                    </h3>
                    <p className="parent-stat-desc">
                      of ₹{children.length > 1 && feeViewMode === "combined"
                        ? combinedValues.total.toLocaleString("en-IN")
                        : feeRecord
                          ? Number(feeRecord.totalFee || 0).toLocaleString("en-IN")
                          : "0"}
                    </p>
                  </div>
                </div>

                <div className={`parent-stat-card ${(children.length > 1 && feeViewMode === "combined" ? (combinedValues.pending > 0 ? "parent-stat-red" : "parent-stat-green") : (feeRecord && feeRecord.pendingAmount > 0 ? "parent-stat-red" : "parent-stat-green"))
                  }`}>
                  <div className="parent-stat-icon">
                    <FiDollarSign />
                  </div>
                  <div className="parent-stat-content">
                    <p className="parent-stat-label">Pending Fees</p>
                    <h3 className="parent-stat-value">
                      ₹{children.length > 1 && feeViewMode === "combined"
                        ? combinedValues.pending.toLocaleString("en-IN")
                        : feeRecord
                          ? Number(feeRecord.pendingAmount || 0).toLocaleString("en-IN")
                          : "0"}
                    </h3>
                    <p className="parent-stat-desc">
                      {children.length > 1 && feeViewMode === "combined"
                        ? `Combined across ${children.length} children`
                        : feeRecord && feeRecord.pendingAmount > 0
                          ? `Due: ${feeRecord.dueDate}`
                          : "All paid"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fee Alert */}
              {((children.length > 1 && feeViewMode === "combined" && combinedValues.pending > 0) || (feeRecord && feeRecord.pendingAmount > 0)) && (
                <div className="parent-alert parent-alert-warning">
                  <strong>Fee Reminder:</strong> You have pending fees of ₹
                  {children.length > 1 && feeViewMode === "combined"
                    ? combinedValues.pending.toLocaleString("en-IN")
                    : feeRecord
                      ? Number(feeRecord.pendingAmount || 0).toLocaleString("en-IN")
                      : "0"}
                  {children.length > 1 && feeViewMode === "combined" ? "." : ` due by ${feeRecord.dueDate}.`}
                </div>
              )}

              {/* Recent Attendance & Upcoming Events */}
              <div className="parent-grid-2">
                <div className="parent-card">
                  <div className="parent-card-header">
                    <h3>Recent Attendance</h3>
                  </div>
                  {attendanceRecords.length === 0 ? (
                    <div className="parent-empty-state">
                      <p>No attendance records available</p>
                    </div>
                  ) : (
                    <div className="parent-attendance-list">
                      {attendanceRecords.map((record) => (
                        <div key={record.id} className="parent-attendance-item">
                          <span className="parent-attendance-date">
                            {record.date}
                          </span>
                          <span
                            className={`parent-attendance-badge parent-attendance-${record.status.toLowerCase()}`}
                          >
                            {record.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="parent-card">
                  <div className="parent-card-header">
                    <h3>Upcoming Events</h3>
                  </div>
                  {events.length === 0 ? (
                    <div className="parent-empty-state">
                      <p>No upcoming events</p>
                    </div>
                  ) : (
                    <div className="parent-events-list">
                      {events.slice(0, 5).map((event) => (
                        <div key={event.id} className="parent-event-item">
                          <p className="parent-event-title">{event.title}</p>
                          <p className="parent-event-date">{event.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Child Profile Tab */}
          {activeTab === "profile" && (
            <div className="parent-section">
              <h2 className="parent-section-title">Child Profile</h2>
              <div className="parent-card">
                <div className="parent-profile-container">
                  <div className="parent-profile-avatar">👦</div>
                  <div className="parent-profile-info">
                    <div className="parent-info-group">
                      <label>Full Name</label>
                      <p>{student.name}</p>
                    </div>
                    <div className="parent-info-group">
                      <label>Admission Number</label>
                      <p>{student.admissionNo}</p>
                    </div>
                    <div className="parent-info-group">
                      <label>Class / Section</label>
                      <p>
                        {student.className} - {student.section}
                      </p>
                    </div>
                    <div className="parent-info-group">
                      <label>Gender</label>
                      <p>{student.gender || "-"}</p>
                    </div>
                    <div className="parent-info-group">
                      <label>Date of Birth</label>
                      <p>{student.dob || "-"}</p>
                    </div>
                    <div className="parent-info-group">
                      <label>Parent Contact</label>
                      <p>{parentContact || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <div className="parent-section">
              <h2 className="parent-section-title">Attendance Details</h2>

              {/* Attendance Summary Cards */}
              <div className="parent-stats-grid">
                <div className="parent-stat-card parent-stat-blue">
                  <div className="parent-stat-content">
                    <p className="parent-stat-label">Total Days</p>
                    <h3 className="parent-stat-value">
                      {attendanceSummary.total}
                    </h3>
                  </div>
                </div>
                <div className="parent-stat-card parent-stat-green">
                  <div className="parent-stat-content">
                    <p className="parent-stat-label">Present</p>
                    <h3 className="parent-stat-value">
                      {attendanceSummary.present}
                    </h3>
                  </div>
                </div>
                <div className="parent-stat-card parent-stat-red">
                  <div className="parent-stat-content">
                    <p className="parent-stat-label">Absent</p>
                    <h3 className="parent-stat-value">
                      {attendanceSummary.absent}
                    </h3>
                  </div>
                </div>
                <div className="parent-stat-card parent-stat-yellow">
                  <div className="parent-stat-content">
                    <p className="parent-stat-label">Late</p>
                    <h3 className="parent-stat-value">
                      {attendanceSummary.late}
                    </h3>
                  </div>
                </div>
                <div className="parent-stat-card parent-stat-info">
                  <div className="parent-stat-content">
                    <p className="parent-stat-label">Half Day</p>
                    <h3 className="parent-stat-value">
                      {attendanceSummary.halfDay}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="parent-card">
                <div className="parent-card-header">
                  <h3>Recent Attendance Records</h3>
                </div>
                {attendanceRecords.length === 0 ? (
                  <div className="parent-empty-state">
                    <p>No attendance records available</p>
                  </div>
                ) : (
                  <div className="parent-table-responsive">
                    <table className="parent-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((record) => (
                          <tr key={record.id}>
                            <td>{record.date}</td>
                            <td>
                              <span
                                className={`parent-badge parent-badge-${record.status.toLowerCase()}`}
                              >
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fees Tab */}
          {activeTab === "fees" && (
            <div className="parent-section">
              <h2 className="parent-section-title">Fees Information</h2>

              {feeRecord ? (
                <>
                  <div className="parent-stats-grid">
                    <div className="parent-stat-card parent-stat-blue">
                      <div className="parent-stat-content">
                        <p className="parent-stat-label">Total Fee</p>
                        <h3 className="parent-stat-value">
                          ₹{feeRecord.totalFee.toLocaleString("en-IN")}
                        </h3>
                      </div>
                    </div>
                    <div className="parent-stat-card parent-stat-green">
                      <div className="parent-stat-content">
                        <p className="parent-stat-label">Paid Amount</p>
                        <h3 className="parent-stat-value">
                          ₹{feeRecord.paidAmount.toLocaleString("en-IN")}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={`parent-stat-card ${feeRecord.pendingAmount > 0 ? "parent-stat-red" : "parent-stat-green"
                        }`}
                    >
                      <div className="parent-stat-content">
                        <p className="parent-stat-label">Pending Amount</p>
                        <h3 className="parent-stat-value">
                          ₹{feeRecord.pendingAmount.toLocaleString("en-IN")}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="parent-card">
                    <div className="parent-card-header">
                      <h3>Fee Details</h3>
                    </div>
                    <div className="parent-fee-details">
                      <div className="parent-fee-row">
                        <span>Due Date</span>
                        <strong>{feeRecord.dueDate}</strong>
                      </div>
                      <div className="parent-fee-row">
                        <span>Status</span>
                        <span
                          className={`parent-badge ${feeRecord.status === "Pending"
                            ? "parent-badge-warning"
                            : "parent-badge-success"
                            }`}
                        >
                          {feeRecord.status}
                        </span>
                      </div>
                      {feeRecord.pendingAmount > 0 && (
                        <div className="parent-alert parent-alert-warning">
                          <strong>Reminder:</strong> Please pay ₹
                          {feeRecord.pendingAmount.toLocaleString("en-IN")} by{" "}
                          {feeRecord.dueDate}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="parent-empty-state">
                  <p>No fee information available</p>
                </div>
              )}
            </div>
          )}

          {/* Timetable Tab */}
          {activeTab === "timetable" && (
            <div className="parent-section">
              <h2 className="parent-section-title">Class Timetable</h2>
              <div className="parent-card">
                {timetable.length === 0 ? (
                  <div className="parent-empty-state">
                    <p>No timetable schedule available</p>
                  </div>
                ) : (
                  <div className="parent-timetable-grid-wrapper">
                    <table className="timetable-grid parent-timetable-grid">
                      <thead>
                        <tr>
                          <th>Day</th>
                          {PERIODS.map((period) => (
                            <th key={period}>P{period}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timetableGrid.map((row) => (
                          <tr key={row.day}>
                            <th>{row.day}</th>
                            {row.periods.map((slot, idx) => (
                              <td
                                key={`${row.day}-${idx}`}
                                className={slot ? "timetable-cell-filled" : "timetable-cell-empty"}
                              >
                                {slot ? (
                                  <>
                                    <div className="timetable-slot-title">{slot.subject}</div>
                                    <div className="timetable-slot-meta">{slot.teacher}</div>
                                    <div className="timetable-slot-meta">{slot.startTime} - {slot.endTime}</div>
                                    <div className="timetable-slot-meta">Room {slot.room || "-"}</div>
                                  </>
                                ) : (
                                  <span className="timetable-slot-empty">Empty</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Marks Tab */}
          {activeTab === "marks" && (
            <div className="parent-section">
              <h2 className="parent-section-title">Examination Marks</h2>
              <div className="parent-card">
                {examMarks.length === 0 ? (
                  <div className="parent-empty-state">
                    <p>No examination marks available yet</p>
                  </div>
                ) : (
                  <div className="parent-table-responsive">
                    <table className="parent-table">
                      <thead>
                        <tr>
                          <th>Exam Name</th>
                          <th>Subject</th>
                          <th>Max Marks</th>
                          <th>Marks Obtained</th>
                          <th>Percentage</th>
                          <th>Grade</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examMarks.map((mark) => (
                          <tr key={mark.id}>
                            <td>{mark.examName}</td>
                            <td>{mark.subject}</td>
                            <td>{mark.maxMarks}</td>
                            <td>
                              <strong>{mark.marksObtained}</strong>
                            </td>
                            <td>
                              <strong>
                                {Math.round(
                                  (mark.marksObtained / mark.maxMarks) * 100
                                )}
                                %
                              </strong>
                            </td>
                            <td>{mark.grade || "-"}</td>
                            <td>
                              <span
                                className={`parent-badge ${mark.result === "Pass"
                                  ? "parent-badge-success"
                                  : "parent-badge-danger"
                                  }`}
                              >
                                {mark.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notices Tab */}
          {activeTab === "notices" && (
            <div className="parent-section">
              <h2 className="parent-section-title">School Notices</h2>
              <div className="parent-card">
                {notices.length === 0 ? (
                  <div className="parent-empty-state">
                    <p>No notices available</p>
                  </div>
                ) : (
                  <div className="parent-notices-list">
                    {notices.map((notice) => (
                      <div key={notice.id} className="parent-notice-item">
                        <div className="parent-notice-header">
                          <h4>{notice.title}</h4>
                          <span className="parent-notice-date">
                            {notice.date}
                          </span>
                        </div>
                        <p className="parent-notice-desc">
                          {notice.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <div className="parent-section">
              <h2 className="parent-section-title">Calendar Events</h2>
              <div className="parent-card">
                {events.length === 0 ? (
                  <div className="parent-empty-state">
                    <p>No calendar events available</p>
                  </div>
                ) : (
                  <div className="parent-events-list-full">
                    {events.map((event) => (
                      <div key={event.id} className="parent-event-card">
                        <div className="parent-event-date-badge">
                          {event.date}
                        </div>
                        <div className="parent-event-details">
                          <h4>{event.title}</h4>
                          <p>{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
