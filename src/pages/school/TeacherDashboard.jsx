import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiHome,
  FiUser,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiBell,
  FiSave,
  FiFileText,
} from "react-icons/fi";
import { useUI } from "../../components/UIContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const GRADE_OPTIONS = ["A+", "A", "B+", "B", "C", "D", "E", "F"];

const sidebarItems = [
  { key: "overview", label: "Dashboard", icon: FiHome },
  { key: "profile", label: "My Profile", icon: FiUser },
  { key: "classes", label: "Assigned Classes", icon: FiUsers },
  { key: "attendance", label: "Attendance", icon: FiCheckCircle },
  { key: "timetable", label: "Timetable", icon: FiClock },
  { key: "notices", label: "Notices", icon: FiBell },
  { key: "calendar", label: "Calendar", icon: FiCalendar },
  { key: "marks", label: "Marks", icon: FiFileText },
];

function getDayName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [activeSection, setActiveSection] = useState("overview");
  const [teacher, setTeacher] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [marksRecords, setMarksRecords] = useState([]);
  const [selectedAssignedIndex, setSelectedAssignedIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [markingStatuses, setMarkingStatuses] = useState({});
  const [markForm, setMarkForm] = useState({
    examName: "",
    studentId: "",
    subject: "",
    maxMarks: "",
    marksObtained: "",
    grade: "",
  });

  useEffect(() => {
    const username = localStorage.getItem("username") || sessionStorage.getItem("username");
    const teachersList = JSON.parse(localStorage.getItem("school_teachers") || "[]");
    const studentsList = JSON.parse(localStorage.getItem("school_students") || "[]");
    const timetableList = JSON.parse(localStorage.getItem("school_timetable") || "[]");
    const noticesList = JSON.parse(localStorage.getItem("school_notices") || "[]");
    const eventsList = JSON.parse(localStorage.getItem("school_calendar_events") || "[]");
    const marksList = JSON.parse(localStorage.getItem("school_exam_marks") || "[]");
    const attendanceList = JSON.parse(localStorage.getItem("school_attendance") || "[]");

    const currentTeacher = teachersList.find((t) => t.username === username);
    setTeacher(currentTeacher);
    setAllStudents(studentsList);
    setAttendance(attendanceList);
    setNotices(
      noticesList.filter(
        (notice) => (notice.audience === "Teachers" || notice.audience === "All") && notice.status === "Published"
      )
    );
    setEvents(eventsList.filter((event) => event.audience === "Teachers" || event.audience === "All"));
    setMarksRecords(marksList);

    if (currentTeacher) {
      const teacherSlots = timetableList.filter(
        (slot) => slot.teacher === currentTeacher.name || slot.teacher === currentTeacher.username
      );
      setTimetable(teacherSlots);
    }
  }, []);

  const assignedClasses = useMemo(() => {
    if (!teacher) return [];
    const assignments = [];

    if (teacher.assignedClass && teacher.assignedSection) {
      assignments.push({ className: teacher.assignedClass, section: teacher.assignedSection, type: "Primary" });
    }

    if (Array.isArray(teacher.inchargeAssignments)) {
      teacher.inchargeAssignments.forEach((item) => {
        if (item.className && item.sectionName) {
          assignments.push({ className: item.className, section: item.sectionName, type: "Incharge" });
        }
      });
    }

    timetable.forEach((slot) => {
      const exists = assignments.some((item) => item.className === slot.className && item.section === slot.section);
      if (!exists) {
        assignments.push({ className: slot.className, section: slot.section, type: "Timetable" });
      }
    });

    return assignments.reduce((unique, current) => {
      const already = unique.some((item) => item.className === current.className && item.section === current.section);
      if (!already) unique.push(current);
      return unique;
    }, []);
  }, [teacher, timetable]);

  useEffect(() => {
    if (assignedClasses.length > 0 && selectedAssignedIndex >= assignedClasses.length) {
      setSelectedAssignedIndex(0);
    }
  }, [assignedClasses, selectedAssignedIndex]);

  const assignedClassInfo = assignedClasses[selectedAssignedIndex] || null;

  const selectedClassStudents = useMemo(() => {
    if (!assignedClassInfo) return [];
    return allStudents.filter(
      (student) => student.className === assignedClassInfo.className && student.section === assignedClassInfo.section
    );
  }, [allStudents, assignedClassInfo]);

  const teacherSubjects = useMemo(() => {
    if (!teacher) return [];
    if (Array.isArray(teacher.subjectsChecked) && teacher.subjectsChecked.length) return teacher.subjectsChecked;
    if (teacher.subject) return [teacher.subject];
    return [];
  }, [teacher]);

  const todayName = useMemo(() => getDayName(new Date().toISOString().split("T")[0]), []);

  const todayPeriods = useMemo(
    () => timetable.filter((slot) => slot.day === todayName),
    [timetable, todayName]
  );

  const selectedClassTodayPeriods = useMemo(
    () =>
      todayPeriods.filter(
        (slot) =>
          assignedClassInfo &&
          slot.className === assignedClassInfo.className &&
          slot.section === assignedClassInfo.section
      ),
    [todayPeriods, assignedClassInfo]
  );

  const selectedSlot = useMemo(
    () =>
      selectedClassTodayPeriods.find((slot) => String(slot.period) === String(selectedPeriod)) || null,
    [selectedClassTodayPeriods, selectedPeriod]
  );

  useEffect(() => {
    if (!selectedSlot) {
      setMarkingStatuses({});
      return;
    }

    const statuses = {};
    selectedClassStudents.forEach((student) => {
      const record = attendance.find(
        (item) =>
          item.studentId === student.id &&
          item.date === selectedDate &&
          item.className === selectedSlot.className &&
          item.section === selectedSlot.section &&
          Number(item.period) === Number(selectedSlot.period) &&
          item.teacherUsername === teacher?.username
      );
      statuses[student.id] = record ? record.status : "Present";
    });
    setMarkingStatuses(statuses);
  }, [selectedClassStudents, attendance, selectedDate, selectedSlot, teacher]);

  const selectedAttendanceRecords = useMemo(() => {
    if (!selectedSlot || !teacher) return [];
    return attendance.filter(
      (record) =>
        record.teacherUsername === teacher.username &&
        record.date === selectedDate &&
        record.className === selectedSlot.className &&
        record.section === selectedSlot.section &&
        Number(record.period) === Number(selectedSlot.period)
    );
  }, [attendance, selectedDate, selectedSlot, teacher]);

  const selectedAttendanceStatus = selectedAttendanceRecords[0]?.approvalStatus || null;
  const canEditAttendance = !selectedAttendanceStatus || selectedAttendanceStatus === "Rejected";

  const assignedStudentCount = useMemo(() => {
    const ids = new Set();
    assignedClasses.forEach((assignment) => {
      allStudents
        .filter((student) => student.className === assignment.className && student.section === assignment.section)
        .forEach((student) => ids.add(student.id));
    });
    return ids.size;
  }, [assignedClasses, allStudents]);

  const pendingAttendanceCount = attendance.filter(
    (record) => record.teacherUsername === teacher?.username && record.approvalStatus === "Pending Approval"
  ).length;
  const submittedAttendanceCount = attendance.filter(
    (record) => record.teacherUsername === teacher?.username && record.approvalStatus && record.approvalStatus !== "Pending Approval"
  ).length;

  const noticeCount = notices.length;

  const handleSelectPeriod = (value) => {
    setSelectedPeriod(value);
  };

  const handleAttendanceChange = (studentId, status) => {
    setMarkingStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedSlot) {
      showToast("error", "Select an assigned period before saving attendance.");
      return;
    }
    if (selectedClassStudents.length === 0) {
      showToast("error", "No students are assigned to this class and section.");
      return;
    }
    if (!canEditAttendance) {
      showToast("info", "Attendance is already submitted and pending approval.");
      return;
    }

    const updatedAttendance = attendance.filter(
      (record) => !(
        record.teacherUsername === teacher?.username &&
        record.date === selectedDate &&
        record.className === selectedSlot.className &&
        record.section === selectedSlot.section &&
        Number(record.period) === Number(selectedSlot.period)
      )
    );

    selectedClassStudents.forEach((student) => {
      updatedAttendance.push({
        id: `att_${selectedDate}_${selectedSlot.className}_${selectedSlot.section}_${selectedSlot.period}_${student.id}`,
        studentId: student.id,
        studentName: student.name,
        admissionNo: student.admissionNo,
        className: selectedSlot.className,
        section: selectedSlot.section,
        date: selectedDate,
        period: selectedSlot.period,
        subject: selectedSlot.subject || teacherSubjects[0] || "General",
        teacher: teacher.name,
        teacherUsername: teacher.username,
        status: markingStatuses[student.id] || "Present",
        approvalStatus: "Pending Approval",
        updatedAt: new Date().toISOString(),
      });
    });

    setAttendance(updatedAttendance);
    localStorage.setItem("school_attendance", JSON.stringify(updatedAttendance));
    showToast("success", "Attendance submitted for approval.");
  };

  const marksForAssignedClass = useMemo(() => {
    if (!assignedClassInfo) return [];
    return marksRecords.filter(
      (mark) =>
        mark.className === assignedClassInfo.className &&
        mark.section === assignedClassInfo.section &&
        teacherSubjects.includes(mark.subject)
    );
  }, [marksRecords, assignedClassInfo, teacherSubjects]);

  const handleMarkFormChange = (field, value) => {
    setMarkForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveMark = () => {
    if (!assignedClassInfo) {
      showToast("error", "Please select an assigned class first.");
      return;
    }
    if (!markForm.examName || !markForm.studentId || !markForm.subject || !markForm.maxMarks) {
      showToast("error", "Please fill all required mark fields.");
      return;
    }

    const maxMarks = Number(markForm.maxMarks);
    const obtained = Number(markForm.marksObtained);
    const percent = maxMarks > 0 ? (obtained / maxMarks) * 100 : 0;
    const result = maxMarks > 0 ? (obtained >= maxMarks * 0.35 ? "Pass" : "Fail") : "Pending";
    const grade =
      markForm.grade ||
      (maxMarks > 0
        ? percent >= 90
          ? "A+"
          : percent >= 80
            ? "A"
            : percent >= 70
              ? "B+"
              : percent >= 60
                ? "B"
                : percent >= 50
                  ? "C"
                  : percent >= 40
                    ? "D"
                    : "E"
        : "N/A");

    const newMark = {
      id: `mark_${Date.now()}`,
      examName: markForm.examName,
      studentId: markForm.studentId,
      studentName: allStudents.find((student) => student.id === markForm.studentId)?.name || "",
      className: assignedClassInfo.className,
      section: assignedClassInfo.section,
      subject: markForm.subject,
      maxMarks,
      marksObtained: obtained,
      grade,
      result,
      enteredBy: teacher.username,
      enteredAt: new Date().toISOString(),
    };

    const updatedMarks = [...marksRecords, newMark];
    setMarksRecords(updatedMarks);
    localStorage.setItem("school_exam_marks", JSON.stringify(updatedMarks));
    showToast("success", "Marks saved successfully.");
    setMarkForm({ examName: "", studentId: "", subject: teacherSubjects[0] || "", maxMarks: "", marksObtained: "", grade: "" });
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
          <h2>No teacher profile linked to this account.</h2>
          <p>Please contact the school admin to link your teacher profile.</p>
          <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard-layout">
      <aside className="teacher-sidebar">
        <div className="teacher-sidebar-head">
          <div>
            <p className="sidebar-brand">Teacher Portal</p>
            <span className="sidebar-subtitle">{teacher.name}</span>
          </div>
          <button className="btn btn-ghost sidebar-logout" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>

        <nav className="teacher-sidebar-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`teacher-sidebar-link ${activeSection === item.key ? "active" : ""}`}
                onClick={() => setActiveSection(item.key)}
              >
                <Icon /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="teacher-main">
        <header className="teacher-mainbar">
          <div>
            <h1>Teacher Dashboard</h1>
            <p>Welcome back, {teacher.name.split(" ")[0]}.</p>
          </div>
        </header>

        <section className="teacher-page-content">
          <div className="teacher-summary-grid">
            <div className="teacher-stat-card">
              <p>Total Assigned Classes</p>
              <h3>{assignedClasses.length}</h3>
            </div>
            <div className="teacher-stat-card">
              <p>Total Students</p>
              <h3>{assignedStudentCount}</h3>
            </div>
            <div className="teacher-stat-card">
              <p>Today Periods</p>
              <h3>{todayPeriods.length}</h3>
            </div>
            <div className="teacher-stat-card">
              <p>Pending Attendance</p>
              <h3>{pendingAttendanceCount}</h3>
            </div>
            <div className="teacher-stat-card">
              <p>Submitted Attendance</p>
              <h3>{submittedAttendanceCount}</h3>
            </div>
            <div className="teacher-stat-card">
              <p>Notices</p>
              <h3>{noticeCount}</h3>
            </div>
          </div>

          {activeSection === "overview" && (
            <>
              <div className="teacher-content-card">
                <div className="teacher-card-header">
                  <div>
                    <h2>Profile Summary</h2>
                    <p>Quick view of your teacher profile.</p>
                  </div>
                </div>
                <div className="teacher-profile-card">
                  <div>
                    <span>Name</span>
                    <strong>{teacher.name}</strong>
                  </div>
                  <div>
                    <span>Employee ID</span>
                    <strong>{teacher.employeeId || "-"}</strong>
                  </div>
                  <div>
                    <span>Subjects</span>
                    <strong>{teacherSubjects.join(", ") || "-"}</strong>
                  </div>
                  <div>
                    <span>Mobile</span>
                    <strong>{teacher.mobile || "-"}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{teacher.email || "-"}</strong>
                  </div>
                  <div>
                    <span>Joining Date</span>
                    <strong>{teacher.joiningDate || "-"}</strong>
                  </div>
                  <div>
                    <span>Qualification</span>
                    <strong>{teacher.qualification || "-"}</strong>
                  </div>
                  <div>
                    <span>Experience</span>
                    <strong>{teacher.experience || "-"}</strong>
                  </div>
                </div>
              </div>

              <div className="teacher-content-card">
                <div className="teacher-card-header">
                  <div>
                    <h2>Today’s Timetable</h2>
                    <p>Your assigned periods for {todayName}.</p>
                  </div>
                </div>
                {todayPeriods.length === 0 ? (
                  <div className="section-empty">
                    <p>No timetable assigned yet for today.</p>
                  </div>
                ) : (
                  <div className="teacher-card-grid">
                    {todayPeriods.map((slot) => (
                      <div key={`${slot.day}-${slot.period}-${slot.className}-${slot.section}`} className="teacher-timetable-card">
                        <p className="label">Period {slot.period}</p>
                        <h3>{slot.subject}</h3>
                        <p>{slot.className} - {slot.section}</p>
                        <p>{slot.startTime} - {slot.endTime}</p>
                        <p>Room {slot.room || "-"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === "profile" && (
            <div className="teacher-content-card">
              <div className="teacher-card-header">
                <div>
                  <h2>My Profile</h2>
                  <p>All profile information linked to your teacher account.</p>
                </div>
              </div>
              <div className="teacher-profile-card">
                <div>
                  <span>Name</span>
                  <strong>{teacher.name}</strong>
                </div>
                <div>
                  <span>Employee ID</span>
                  <strong>{teacher.employeeId || "-"}</strong>
                </div>
                <div>
                  <span>Subjects</span>
                  <strong>{teacherSubjects.join(", ") || "-"}</strong>
                </div>
                <div>
                  <span>Mobile</span>
                  <strong>{teacher.mobile || "-"}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{teacher.email || "-"}</strong>
                </div>
                <div>
                  <span>Joining Date</span>
                  <strong>{teacher.joiningDate || "-"}</strong>
                </div>
                <div>
                  <span>Qualification</span>
                  <strong>{teacher.qualification || "-"}</strong>
                </div>
                <div>
                  <span>Experience</span>
                  <strong>{teacher.experience || "-"}</strong>
                </div>
              </div>
            </div>
          )}

          {activeSection === "classes" && (
            <div className="teacher-content-card">
              <div className="teacher-card-header">
                <div>
                  <h2>Assigned Classes</h2>
                  <p>Classes and sections assigned by admin and timetable.</p>
                </div>
              </div>
              {assignedClasses.length === 0 ? (
                <div className="section-empty">
                  <p>No class assigned by admin.</p>
                </div>
              ) : (
                <>
                  <div className="assigned-class-panel">
                    <label>Select Class</label>
                    <select
                      className="teacher-select"
                      value={selectedAssignedIndex}
                      onChange={(e) => setSelectedAssignedIndex(Number(e.target.value))}
                    >
                      {assignedClasses.map((assignment, index) => (
                        <option key={`${assignment.className}-${assignment.section}-${index}`} value={index}>
                          {assignment.className} - {assignment.section} [{assignment.type}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="teacher-card-grid">
                    <div className="teacher-summary-card">
                      <p>Class</p>
                      <h3>{assignedClassInfo?.className || "-"}</h3>
                    </div>
                    <div className="teacher-summary-card">
                      <p>Section</p>
                      <h3>{assignedClassInfo?.section || "-"}</h3>
                    </div>
                    <div className="teacher-summary-card">
                      <p>Assignment</p>
                      <h3>{assignedClassInfo?.type || "-"}</h3>
                    </div>
                    <div className="teacher-summary-card">
                      <p>Students</p>
                      <h3>{selectedClassStudents.length}</h3>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Admission No</th>
                          <th>Name</th>
                          <th>Class</th>
                          <th>Section</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClassStudents.map((student) => (
                          <tr key={student.id}>
                            <td>{student.admissionNo}</td>
                            <td>{student.name}</td>
                            <td>{student.className}</td>
                            <td>{student.section}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection === "attendance" && (
            <div className="teacher-content-card">
              <div className="teacher-card-header">
                <div>
                  <h2>Attendance</h2>
                  <p>Mark attendance only for assigned class sections.</p>
                </div>
              </div>
              {assignedClasses.length === 0 ? (
                <div className="section-empty">
                  <p>No class assigned by admin.</p>
                </div>
              ) : (
                <>
                  <div className="teacher-form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        className="teacher-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Class</label>
                      <select
                        className="teacher-select"
                        value={selectedAssignedIndex}
                        onChange={(e) => setSelectedAssignedIndex(Number(e.target.value))}
                      >
                        {assignedClasses.map((assignment, index) => (
                          <option key={`${assignment.className}-${assignment.section}-${index}`} value={index}>
                            {assignment.className} - {assignment.section}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Period</label>
                      <select
                        className="teacher-select"
                        value={selectedPeriod}
                        onChange={(e) => handleSelectPeriod(e.target.value)}
                      >
                        <option value="">Select period</option>
                        {selectedClassTodayPeriods.map((slot) => (
                          <option key={slot.id || `${slot.day}-${slot.period}`} value={slot.period}>
                            Period {slot.period} - {slot.subject}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedClassTodayPeriods.length === 0 ? (
                    <div className="section-empty">
                      <p>No assigned period available for the selected class today.</p>
                    </div>
                  ) : !selectedSlot ? (
                    <div className="section-empty">
                      <p>Select a period to load student attendance.</p>
                    </div>
                  ) : selectedClassStudents.length === 0 ? (
                    <div className="section-empty">
                      <p>No students found for this class and section.</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Admission No</th>
                              <th>Name</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedClassStudents.map((student) => (
                              <tr key={student.id}>
                                <td>{student.admissionNo}</td>
                                <td>{student.name}</td>
                                <td>
                                  <div className="attendance-options">
                                    {["Present", "Absent", "Late", "Half Day"].map((status) => (
                                      <label
                                        key={status}
                                        className={`attendance-btn ${markingStatuses[student.id] === status ? "active" : ""}`}
                                      >
                                        <input
                                          type="radio"
                                          name={`teacher-status-${student.id}`}
                                          value={status}
                                          checked={markingStatuses[student.id] === status}
                                          onChange={() => handleAttendanceChange(student.id, status)}
                                        />
                                        {status}
                                      </label>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="teacher-actions-row">
                        <button className="btn btn-primary" onClick={handleSaveAttendance} disabled={!canEditAttendance}>
                          <FiSave /> {selectedAttendanceStatus === "Rejected" ? "Resubmit Attendance" : "Submit Attendance"}
                        </button>
                        {selectedAttendanceStatus && selectedAttendanceStatus !== "Rejected" && (
                          <span className="info-text">Attendance already {selectedAttendanceStatus.toLowerCase()}.</span>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === "timetable" && (
            <div className="teacher-content-card">
              <div className="teacher-card-header">
                <div>
                  <h2>Full Timetable</h2>
                  <p>All assigned timetable entries for your account.</p>
                </div>
              </div>
              {timetable.length === 0 ? (
                <div className="section-empty">
                  <p>No timetable assigned yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Period</th>
                        <th>Class</th>
                        <th>Section</th>
                        <th>Subject</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable
                        .sort((a, b) => {
                          if (a.day !== b.day) return DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
                          return Number(a.period) - Number(b.period);
                        })
                        .map((slot) => (
                          <tr key={slot.id || `${slot.day}-${slot.period}-${slot.className}-${slot.section}`}>
                            <td>{slot.day}</td>
                            <td>{slot.period}</td>
                            <td>{slot.className}</td>
                            <td>{slot.section}</td>
                            <td>{slot.subject}</td>
                            <td>{slot.startTime}</td>
                            <td>{slot.endTime}</td>
                            <td>{slot.room || "-"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "notices" && (
            <div className="teacher-content-card">
              <div className="teacher-card-header">
                <div>
                  <h2>Notices</h2>
                  <p>Published notices for teachers and all staff.</p>
                </div>
              </div>
              {notices.length === 0 ? (
                <div className="section-empty">
                  <p>No notices available.</p>
                </div>
              ) : (
                <div className="notice-list">
                  {notices.map((notice) => (
                    <div key={notice.id} className="notice-card">
                      <div className="notice-card-header">
                        <strong>{notice.title}</strong>
                        <span>{notice.date} {notice.time || ""}</span>
                      </div>
                      <p className="notice-card-text">{notice.description}</p>
                      <div className="notice-card-footer">
                        <span className={`badge ${notice.status === "Published" ? "badge-success" : "badge-warning"}`}>
                          {notice.status}
                        </span>
                        <span>{notice.audience}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === "calendar" && (
            <div className="teacher-content-card">
              <div className="teacher-card-header">
                <div>
                  <h2>Calendar Events</h2>
                  <p>Events targeted for teachers and all staff members.</p>
                </div>
              </div>
              {events.length === 0 ? (
                <div className="section-empty">
                  <p>No events available.</p>
                </div>
              ) : (
                <div className="event-list">
                  {events.map((event) => (
                    <div key={event.id} className="event-card">
                      <div className="event-card-header">
                        <strong>{event.title}</strong>
                        <span>{event.date} {event.time || ""}</span>
                      </div>
                      <p className="event-card-text">{event.description}</p>
                      <div className="event-card-footer">
                        <span>{event.location || "No location"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === "marks" && (
            <div className="teacher-content-card">
              <div className="teacher-card-header">
                <div>
                  <h2>Marks Entry</h2>
                  <p>Record marks for your assigned class and subject.</p>
                </div>
              </div>
              {assignedClasses.length === 0 ? (
                <div className="section-empty">
                  <p>No class assigned by admin.</p>
                </div>
              ) : teacherSubjects.length === 0 ? (
                <div className="section-empty">
                  <p>No subject assigned to your profile.</p>
                </div>
              ) : (
                <>
                  <div className="teacher-form-grid">
                    <div className="form-group">
                      <label>Exam Name</label>
                      <input
                        type="text"
                        className="teacher-input"
                        value={markForm.examName}
                        onChange={(e) => handleMarkFormChange("examName", e.target.value)}
                        placeholder="Midterm / Final"
                      />
                    </div>
                    <div className="form-group">
                      <label>Student</label>
                      <select
                        className="teacher-select"
                        value={markForm.studentId}
                        onChange={(e) => handleMarkFormChange("studentId", e.target.value)}
                      >
                        <option value="">Select student</option>
                        {selectedClassStudents.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name} ({student.admissionNo})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <select
                        className="teacher-select"
                        value={markForm.subject}
                        onChange={(e) => handleMarkFormChange("subject", e.target.value)}
                      >
                        {teacherSubjects.map((subject) => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Max Marks</label>
                      <input
                        type="number"
                        className="teacher-input"
                        value={markForm.maxMarks}
                        onChange={(e) => handleMarkFormChange("maxMarks", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Marks Obtained</label>
                      <input
                        type="number"
                        className="teacher-input"
                        value={markForm.marksObtained}
                        onChange={(e) => handleMarkFormChange("marksObtained", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Grade</label>
                      <select
                        className="teacher-select"
                        value={markForm.grade}
                        onChange={(e) => handleMarkFormChange("grade", e.target.value)}
                      >
                        <option value="">Auto calculate</option>
                        {GRADE_OPTIONS.map((grade) => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="teacher-actions-row">
                    <button className="btn btn-primary" onClick={handleSaveMark}>
                      <FiSave /> Save Marks
                    </button>
                  </div>

                  {marksForAssignedClass.length === 0 ? (
                    <div className="section-empty">
                      <p>No mark entries available for this class and subject yet.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Exam</th>
                            <th>Student</th>
                            <th>Subject</th>
                            <th>Max</th>
                            <th>Obtained</th>
                            <th>Grade</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marksForAssignedClass.map((record) => (
                            <tr key={record.id}>
                              <td>{record.examName}</td>
                              <td>{record.studentName}</td>
                              <td>{record.subject}</td>
                              <td>{record.maxMarks}</td>
                              <td>{record.marksObtained}</td>
                              <td>{record.grade}</td>
                              <td>{record.result}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
