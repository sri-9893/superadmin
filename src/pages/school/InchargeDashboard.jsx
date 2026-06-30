import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUsers, FiCheckSquare, FiAlertCircle, FiClock, FiDownload } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

export default function InchargeDashboard() {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [username, setUsername] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  
  // Today's Date
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const user = localStorage.getItem("username") || sessionStorage.getItem("username");
    setUsername(user || "Incharge");

    const teachersList = JSON.parse(localStorage.getItem("school_teachers") || "[]");
    const activeTeacher = teachersList.find(
      (t) => t.username === user && t.isClassIncharge === true
    );
    setTeacher(activeTeacher);

    if (activeTeacher) {
      const studentsList = JSON.parse(localStorage.getItem("school_students") || "[]");
      const classStudents = studentsList.filter(
        (s) => s.className === activeTeacher.inchargeClass && s.section === activeTeacher.inchargeSection
      );
      setStudents(classStudents);

      const attendanceList = JSON.parse(localStorage.getItem("school_attendance") || "[]");
      setAttendance(attendanceList);
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

  const handleRecordAttendance = (studentId, status) => {
    let updated = [...attendance];
    const existingIndex = updated.findIndex(
      (a) => a.studentId === studentId && a.date === todayStr
    );

    const record = {
      id: existingIndex >= 0 ? updated[existingIndex].id : "att_" + Date.now() + Math.random().toString(),
      studentId,
      studentName: students.find((s) => s.id === studentId)?.name || "",
      className: teacher.inchargeClass,
      section: teacher.inchargeSection,
      date: todayStr,
      status,
    };

    if (existingIndex >= 0) {
      updated[existingIndex] = record;
    } else {
      updated.push(record);
    }

    setAttendance(updated);
    localStorage.setItem("school_attendance", JSON.stringify(updated));
    showToast("success", `Attendance status updated to ${status}`);
  };

  // Export class student list
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Class_${teacher?.inchargeClass}_Section_${teacher?.inchargeSection}_Students.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("success", "Student list exported successfully!");
  };

  if (!teacher) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Incharge Account Not Configured</h2>
          <p>Please contact the school admin to assign you as a Class Incharge with a valid class & section.</p>
          <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  // Today's attendance details
  const todayClassAttendance = attendance.filter(
    (a) => a.className === teacher.inchargeClass && a.section === teacher.inchargeSection && a.date === todayStr
  );

  const presentCount = todayClassAttendance.filter((a) => a.status === "Present").length;
  const absentCount = todayClassAttendance.filter((a) => a.status === "Absent").length;
  const lateCount = todayClassAttendance.filter((a) => a.status === "Late").length;
  const unmarkedCount = students.length - todayClassAttendance.length;

  const lateStudents = students.filter((s) => {
    const att = todayClassAttendance.find((a) => a.studentId === s.id);
    return att && att.status === "Late";
  });

  const absentStudents = students.filter((s) => {
    const att = todayClassAttendance.find((a) => a.studentId === s.id);
    return att && att.status === "Absent";
  });

  return (
    <div className="dashboard-layout parent-portal">
      <div className="teacher-topbar">
        <div className="teacher-profile-summary">
          <span className="teacher-avatar">👨‍🏫</span>
          <div>
            <h3>Class Incharge Workspace: {teacher.name}</h3>
            <p>Assigned: Class {teacher.inchargeClass} - {teacher.inchargeSection}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-outline" onClick={handleExport}>
            <FiDownload /> Export Roster
          </button>
          <button className="btn btn-outline" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="main-content" style={{ marginLeft: 0, width: "100%", padding: "1.5rem" }}>
        <div className="page">
          {/* Metrics */}
          <div className="grid-3 mb-lg">
            <div className="card stat-card stat-card--blue">
              <p className="stat-card-label">Total Class Strength</p>
              <h3 className="stat-card-value">{students.length} Students</h3>
            </div>
            <div className="card stat-card stat-card--green">
              <p className="stat-card-label">Today's Present / Late</p>
              <h3 className="stat-card-value text-success">{presentCount} Present / {lateCount} Late</h3>
            </div>
            <div className="card stat-card stat-card--red">
              <p className="stat-card-label">Absent / Unmarked</p>
              <h3 className="stat-card-value text-danger">{absentCount} Absent / {unmarkedCount} Pending</h3>
            </div>
          </div>

          <div className="grid-2">
            {/* Student list & Attendance trigger */}
            <div className="card">
              <div className="card-header">
                <h3>Today's Attendance Roster ({todayStr})</h3>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll No</th>
                      <th>Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const record = todayClassAttendance.find((a) => a.studentId === s.id);
                      const currentStatus = record ? record.status : "Unmarked";
                      return (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td>{s.rollNo || s.admissionNo}</td>
                          <td>
                            <div className="table-action">
                              <button
                                className={`btn btn-sm ${currentStatus === "Present" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => handleRecordAttendance(s.id, "Present")}
                              >
                                Present
                              </button>
                              <button
                                className={`btn btn-sm ${currentStatus === "Absent" ? "btn-danger" : "btn-secondary"}`}
                                onClick={() => handleRecordAttendance(s.id, "Absent")}
                              >
                                Absent
                              </button>
                              <button
                                className={`btn btn-sm ${currentStatus === "Late" ? "btn-info" : "btn-secondary"}`}
                                onClick={() => handleRecordAttendance(s.id, "Late")}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="3" className="empty-state">No students found in your class.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Defaulter and Late Student reports */}
            <div className="card">
              <div className="card-header">
                <h3>Defaulters & Late Arrivals Today</h3>
              </div>
              
              <div className="mb-lg">
                <h4><FiAlertCircle className="text-danger" /> Absent Defaulters ({absentStudents.length})</h4>
                <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                  {absentStudents.map((s) => (
                    <li key={s.id} style={{ marginBottom: "6px" }}>
                      <strong>{s.name}</strong> - Contact parent: {s.parentPhone || "N/A"}
                    </li>
                  ))}
                  {absentStudents.length === 0 && <span className="text-muted">No absent students today.</span>}
                </ul>
              </div>

              <div>
                <h4><FiClock className="text-info" /> Late Arrival Logs ({lateStudents.length})</h4>
                <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                  {lateStudents.map((s) => (
                    <li key={s.id} style={{ marginBottom: "6px" }}>
                      <strong>{s.name}</strong> - Needs verification.
                    </li>
                  ))}
                  {lateStudents.length === 0 && <span className="text-muted">No late arrivals today.</span>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
