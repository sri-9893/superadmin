import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiCalendar, FiUsers, FiClock, FiBell, FiDollarSign, FiCheckSquare } from "react-icons/fi";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [parentName, setParentName] = useState("");
  const [attendanceSummary, setAttendanceSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    percentage: 0
  });
  const [feeRecord, setFeeRecord] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const username = localStorage.getItem("username") || sessionStorage.getItem("username");
    const studentsList = JSON.parse(localStorage.getItem("school_students") || "[]");
    const attendanceList = JSON.parse(localStorage.getItem("school_attendance") || "[]");
    const feesList = JSON.parse(localStorage.getItem("school_fees") || "[]");
    const timetableList = JSON.parse(localStorage.getItem("school_timetable") || "[]");
    const noticesList = JSON.parse(localStorage.getItem("school_notices") || "[]");

    // Find student linked to parent
    const child = studentsList.find(s => s.parentUsername === username);
    
    if (child) {
      setStudent(child);
      setParentName(child.parentName);

      // Child Attendance Summary
      const childAttendance = attendanceList.filter(a => a.studentId === child.id);
      const summary = {
        total: childAttendance.length,
        present: childAttendance.filter(a => a.status === "Present").length,
        absent: childAttendance.filter(a => a.status === "Absent").length,
        late: childAttendance.filter(a => a.status === "Late").length,
        halfDay: childAttendance.filter(a => a.status === "Half Day").length,
        percentage: 0
      };
      
      if (summary.total > 0) {
        const presentWeight = summary.present + summary.late * 0.9 + summary.halfDay * 0.5;
        summary.percentage = Math.round((presentWeight / summary.total) * 100);
      }
      setAttendanceSummary(summary);

      // Fee Record
      const record = feesList.find(f => f.studentId === child.id);
      setFeeRecord(record);

      // Timetable
      const childSlots = timetableList.filter(
        tt => tt.className === child.className && tt.section === child.section
      );
      setTimetable(childSlots);

      // Notices
      const relevantNotices = noticesList.filter(
        n => (n.audience === "Parents" || n.audience === "All") && n.status === "Published"
      );
      setNotices(relevantNotices);
    }
  }, []);

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
      <div className="auth-page">
        <div className="auth-card">
          <h2>Parent Account Not Configured</h2>
          <p>Please contact the school admin to link your parent profile with a student record.</p>
          <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout parent-portal">
      {/* Top Header */}
      <div className="teacher-topbar">
        <div className="teacher-profile-summary">
          <span className="teacher-avatar">👪</span>
          <div>
            <h3>Parent Portal: {parentName}</h3>
            <p>Linked Child: {student.name} | Class: {student.className} - {student.section}</p>
          </div>
        </div>
        <div>
          <button className="btn btn-outline" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="main-content" style={{ marginLeft: 0, width: "100%", padding: "1.5rem" }}>
        <div className="page">
          
          {/* Quick Metrics */}
          <div className="grid-3 mb-lg">
            <div className="card stat-card stat-card--blue">
              <div className="stat-card-header">
                <FiCheckSquare className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Child Attendance</p>
              <h3 className="stat-card-value">{attendanceSummary.percentage}%</h3>
              <p className="stat-card-trend">{attendanceSummary.present} Present / {attendanceSummary.total} marked</p>
            </div>

            <div className="card stat-card stat-card--green">
              <div className="stat-card-header">
                <FiDollarSign className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Fees Paid</p>
              <h3 className="stat-card-value">
                ₹{feeRecord ? feeRecord.paidAmount.toLocaleString("en-IN") : "0"}
              </h3>
              <p className="stat-card-trend">Total Invoice: ₹{feeRecord ? feeRecord.totalFee.toLocaleString("en-IN") : "0"}</p>
            </div>

            <div className="card stat-card stat-card--red">
              <div className="stat-card-header">
                <FiDollarSign className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Pending Fees</p>
              <h3 className="stat-card-value text-danger">
                ₹{feeRecord ? feeRecord.pendingAmount.toLocaleString("en-IN") : "0"}
              </h3>
              <p className="stat-card-trend text-muted">Due Date: {feeRecord ? feeRecord.dueDate : "N/A"}</p>
            </div>
          </div>

          <div className="grid-2">
            {/* Child Profile Information */}
            <div className="card">
              <div className="card-header">
                <h3>Child Profile Details</h3>
              </div>
              <div className="profile-details-list">
                <div className="profile-details-item">
                  <span className="label text-muted">Full Name</span>
                  <span className="value"><strong>{student.name}</strong></span>
                </div>
                <div className="profile-details-item">
                  <span className="label text-muted">Admission No</span>
                  <span className="value">{student.admissionNo}</span>
                </div>
                <div className="profile-details-item">
                  <span className="label text-muted">Grade / Section</span>
                  <span className="value"><span className="badge badge-info">{student.className} - {student.section}</span></span>
                </div>
                <div className="profile-details-item">
                  <span className="label text-muted">Gender</span>
                  <span className="value">{student.gender || "-"}</span>
                </div>
                <div className="profile-details-item">
                  <span className="label text-muted">Date of Birth</span>
                  <span className="value">{student.dob || "-"}</span>
                </div>
              </div>
            </div>

            {/* Child Attendance Logs breakdown */}
            <div className="card">
              <div className="card-header">
                <h3>Attendance Summary</h3>
              </div>
              <div className="attendance-breakdown">
                <div className="breakdown-row">
                  <span>Present Days</span>
                  <strong className="text-success">{attendanceSummary.present}</strong>
                </div>
                <div className="breakdown-row">
                  <span>Absent Days</span>
                  <strong className="text-danger">{attendanceSummary.absent}</strong>
                </div>
                <div className="breakdown-row">
                  <span>Late Days</span>
                  <strong className="text-warning">{attendanceSummary.late}</strong>
                </div>
                <div className="breakdown-row">
                  <span>Half Days</span>
                  <strong className="text-info">{attendanceSummary.halfDay}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2 mt-lg">
            {/* Child Class Timetable */}
            <div className="card">
              <div className="card-header">
                <h3>Class Timetable Schedule</h3>
              </div>
              {timetable.length === 0 ? (
                <div className="empty-state">
                  <p>No timetable periods defined for this class.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Period</th>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Time</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map(slot => (
                        <tr key={slot.id}>
                          <td><strong>{slot.day}</strong></td>
                          <td>{slot.period || "-"}</td>
                          <td>{slot.subject}</td>
                          <td>{slot.teacher}</td>
                          <td>{slot.startTime} - {slot.endTime}</td>
                          <td>Room {slot.room || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notice Board */}
            <div className="card">
              <div className="card-header">
                <h3><FiBell /> Parent Bulletins & Notices</h3>
              </div>
              {notices.length === 0 ? (
                <div className="empty-state">
                  <p>No active notices published for parents.</p>
                </div>
              ) : (
                <div className="events-list">
                  {notices.map(notice => (
                    <div key={notice.id} style={{ padding: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>
                      <div className="flex-row">
                        <strong>{notice.title}</strong>
                        <span className="badge badge-outline">{notice.date}</span>
                      </div>
                      <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.85rem", color: "var(--text-color)" }}>
                        {notice.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
