import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiCalendar, FiUsers, FiClock, FiBell, FiSave } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Attendance marking states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [markingStatuses, setMarkingStatuses] = useState({});

  useEffect(() => {
    const username = localStorage.getItem("username") || sessionStorage.getItem("username");
    const teachersList = JSON.parse(localStorage.getItem("school_teachers") || "[]");
    const studentsList = JSON.parse(localStorage.getItem("school_students") || "[]");
    const timetableList = JSON.parse(localStorage.getItem("school_timetable") || "[]");
    const noticesList = JSON.parse(localStorage.getItem("school_notices") || "[]");
    const attendanceList = JSON.parse(localStorage.getItem("school_attendance") || "[]");

    // Find teacher
    const currentTeacher = teachersList.find(t => t.username === username);
    setTeacher(currentTeacher);
    setAttendance(attendanceList);

    if (currentTeacher) {
      // Students in assigned class/section
      const assignedStudents = studentsList.filter(
        s => s.className === currentTeacher.assignedClass && s.section === currentTeacher.assignedSection
      );
      setStudents(assignedStudents);

      // Timetable slots
      const teacherSlots = timetableList.filter(
        tt => tt.teacher === currentTeacher.name
      );
      setTimetable(teacherSlots);

      // Notices
      const relevantNotices = noticesList.filter(
        n => (n.audience === "Teachers" || n.audience === "All") && n.status === "Published"
      );
      setNotices(relevantNotices);

      // Initialize attendance marking states
      const initialStatuses = {};
      assignedStudents.forEach(student => {
        const record = attendanceList.find(
          a => a.studentId === student.id && a.date === selectedDate
        );
        initialStatuses[student.id] = record ? record.status : "Present";
      });
      setMarkingStatuses(initialStatuses);
    }
  }, [selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setMarkingStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    if (students.length === 0) return;

    let updatedAttendance = [...attendance];

    students.forEach(student => {
      const status = markingStatuses[student.id] || "Present";
      
      // Delete existing
      updatedAttendance = updatedAttendance.filter(
        a => !(a.studentId === student.id && a.date === selectedDate)
      );

      // Add new
      updatedAttendance.push({
        id: "att_" + student.id + "_" + selectedDate,
        studentId: student.id,
        studentName: student.name,
        admissionNo: student.admissionNo,
        className: teacher.assignedClass,
        section: teacher.assignedSection,
        date: selectedDate,
        status: status
      });
    });

    setAttendance(updatedAttendance);
    localStorage.setItem("school_attendance", JSON.stringify(updatedAttendance));
    showToast("success", "Attendance recorded successfully!");
  };

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

  if (!teacher) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Teacher Profile Not Configured</h2>
          <p>Please contact the school admin to assign a class and complete registration.</p>
          <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout teacher-portal">
      {/* Top Header */}
      <div className="teacher-topbar">
        <div className="teacher-profile-summary">
          <span className="teacher-avatar">👨‍🏫</span>
          <div>
            <h3>{teacher.name}</h3>
            <p>Subject: {teacher.subject} | ID: {teacher.employeeId}</p>
          </div>
        </div>
        <div className="flex-row">
          <span className="badge badge-info mr-md">Assigned: {teacher.assignedClass} - {teacher.assignedSection}</span>
          <button className="btn btn-outline" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="main-content" style={{ marginLeft: 0, width: "100%", padding: "1.5rem" }}>
        <div className="page">
          
          <div className="grid-2">
            {/* Quick Class Register & Attendance */}
            <div className="card">
              <div className="card-header flex-row">
                <div>
                  <h3>Class Register: {teacher.assignedClass} - {teacher.assignedSection}</h3>
                  <p>Total Enrolled: {students.length} Students</p>
                </div>
                <div className="flex-row">
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="mr-sm" style={{ padding: "0.4rem" }} />
                  <button className="btn btn-primary btn-sm" onClick={handleSaveAttendance}>
                    <FiSave /> Save
                  </button>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="empty-state">
                  <p>No students assigned to your class.</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: "350px", overflowY: "auto" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Admission No</th>
                        <th>Student Name</th>
                        <th>Mark Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.id}>
                          <td><strong>{student.admissionNo}</strong></td>
                          <td>{student.name}</td>
                          <td>
                            <div className="attendance-options">
                              {["Present", "Absent", "Late", "Half Day"].map(opt => (
                                <label key={opt} className={`attendance-btn mini ${markingStatuses[student.id] === opt ? "active" : ""}`}>
                                  <input
                                    type="radio"
                                    name={`teacher-status-${student.id}`}
                                    value={opt}
                                    checked={markingStatuses[student.id] === opt}
                                    onChange={() => handleStatusChange(student.id, opt)}
                                    style={{ display: "none" }}
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* My Teaching Timetable */}
            <div className="card">
              <div className="card-header">
                <h3>My Timetable Schedule</h3>
              </div>
              {timetable.length === 0 ? (
                <div className="empty-state">
                  <p>No periods scheduled in the timetable directory.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Period</th>
                        <th>Class Section</th>
                        <th>Time</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map(slot => (
                        <tr key={slot.id}>
                          <td><strong>{slot.day}</strong></td>
                          <td>{slot.period || "-"}</td>
                          <td>{slot.className} - {slot.section}</td>
                          <td>{slot.startTime} - {slot.endTime}</td>
                          <td>Room {slot.room || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Notices Feed */}
          <div className="card mt-lg">
            <div className="card-header">
              <h3><FiBell /> Circulars & Bulletin Feed</h3>
            </div>
            {notices.length === 0 ? (
              <div className="empty-state">
                <p>No active notices targeted for faculty.</p>
              </div>
            ) : (
              <div className="events-list">
                {notices.map(notice => (
                  <div key={notice.id} style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                    <div className="flex-row">
                      <strong style={{ fontSize: "1.05rem" }}>{notice.title}</strong>
                      <span className="badge badge-outline">{notice.date}</span>
                    </div>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", color: "var(--text-color)" }}>
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
  );
}
