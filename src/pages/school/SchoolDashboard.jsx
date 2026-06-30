import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiBookOpen,
  FiGrid,
  FiCheckSquare,
  FiCreditCard,
  FiBell,
  FiCalendar,
  FiClock,
} from "react-icons/fi";

export default function SchoolDashboard() {
  const [stats, setStats] = useState({
    classes: 0,
    sections: 0,
    students: 0,
    teachers: 0,
    todayAttendance: "N/A",
    feesCollected: 0,
    pendingFees: 0,
    totalNotices: 0,
    upcomingEvents: 0,
    todayTimetable: 0
  });

  const [recentStudents, setRecentStudents] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [upcomingEventsList, setUpcomingEventsList] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);

  useEffect(() => {
    // Read from localStorage
    const classesList = JSON.parse(localStorage.getItem("school_classes") || "[]");
    const sectionsList = JSON.parse(localStorage.getItem("school_sections") || "[]");
    const studentsList = JSON.parse(localStorage.getItem("school_students") || "[]");
    const teachersList = JSON.parse(localStorage.getItem("school_teachers") || "[]");
    const attendanceList = JSON.parse(localStorage.getItem("school_attendance") || "[]");
    const feesList = JSON.parse(localStorage.getItem("school_fees") || "[]");
    const noticesList = JSON.parse(localStorage.getItem("school_notices") || "[]");
    const eventsList = JSON.parse(localStorage.getItem("school_calendar_events") || "[]");
    const timetableList = JSON.parse(localStorage.getItem("school_timetable") || "[]");

    const todayDateStr = new Date().toISOString().split("T")[0];
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDayName = weekdayNames[new Date().getDay()];

    // Calculate Stats
    // 1. Attendance percentage for today
    const todayAttendanceRecords = attendanceList.filter(a => a.date === todayDateStr);
    let attendanceDisplay = "N/A";
    if (todayAttendanceRecords.length > 0) {
      const present = todayAttendanceRecords.filter(a => a.status === "Present" || a.status === "Late" || a.status === "Half Day").length;
      const total = todayAttendanceRecords.length;
      attendanceDisplay = `${Math.round((present / total) * 100)}% (${present}/${total})`;
    }

    // 2. Fees Collected & Pending
    const collected = feesList.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
    const pending = feesList.reduce((sum, f) => sum + Number(f.pendingAmount || 0), 0);

    // 3. Today's Timetable count
    const activeTodayTimetable = timetableList.filter(t => t.day === todayDayName);

    setStats({
      classes: classesList.length,
      sections: sectionsList.length,
      students: studentsList.length,
      teachers: teachersList.length,
      todayAttendance: attendanceDisplay,
      feesCollected: collected,
      pendingFees: pending,
      totalNotices: noticesList.length,
      upcomingEvents: eventsList.length,
      todayTimetable: activeTodayTimetable.length
    });

    // Recent items lists (limit to 5)
    setRecentStudents(studentsList.slice(0, 5));
    setRecentNotices(noticesList.slice(0, 5));
    setUpcomingEventsList(eventsList.slice(0, 5));
    setTodayClasses(activeTodayTimetable.slice(0, 5));
  }, []);

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        {/* Top Navbar */}
        <header className="navbar">
          <div>
            <h3>School Management Dashboard</h3>
            <p>Welcome back, Administrator</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="page">
          <div className="grid-5 mb-lg">
            <div className="card stat-card stat-card--blue">
              <div className="stat-card-header">
                <FiGrid className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Total Classes</p>
              <h3 className="stat-card-value">{stats.classes}</h3>
              <p className="stat-card-trend">{stats.sections} Sections configured</p>
            </div>

            <div className="card stat-card stat-card--green">
              <div className="stat-card-header">
                <FiUsers className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Total Students</p>
              <h3 className="stat-card-value">{stats.students}</h3>
              <p className="stat-card-trend">Active enrollments</p>
            </div>

            <div className="card stat-card stat-card--violet">
              <div className="stat-card-header">
                <FiBookOpen className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Faculty Members</p>
              <h3 className="stat-card-value">{stats.teachers}</h3>
              <p className="stat-card-trend">Assigned subject experts</p>
            </div>

            <div className="card stat-card stat-card--amber">
              <div className="stat-card-header">
                <FiCheckSquare className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Today Attendance</p>
              <h3 className="stat-card-value">{stats.todayAttendance}</h3>
              <p className="stat-card-trend">Presence percentage today</p>
            </div>

            <div className="card stat-card stat-card--red">
              <div className="stat-card-header">
                <FiCreditCard className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Fees Ledger</p>
              <h3 className="stat-card-value" style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
                Col: ₹{stats.feesCollected.toLocaleString("en-IN")}
              </h3>
              <p className="stat-card-trend text-danger">
                Pen: ₹{stats.pendingFees.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid-3 mb-lg">
            <div className="card stat-card flex-row align-center p-md">
              <FiBell size={32} className="text-info mr-md" />
              <div>
                <p className="stat-card-label text-muted">Total Notices</p>
                <h4 style={{ margin: 0 }}>{stats.totalNotices} Active Bulletins</h4>
              </div>
            </div>

            <div className="card stat-card flex-row align-center p-md">
              <FiCalendar size={32} className="text-warning mr-md" />
              <div>
                <p className="stat-card-label text-muted">Upcoming Events</p>
                <h4 style={{ margin: 0 }}>{stats.upcomingEvents} Event entries</h4>
              </div>
            </div>

            <div className="card stat-card flex-row align-center p-md">
              <FiClock size={32} className="text-success mr-md" />
              <div>
                <p className="stat-card-label text-muted">Today's Lectures</p>
                <h4 style={{ margin: 0 }}>{stats.todayTimetable} Scheduled periods</h4>
              </div>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="grid-2">
            {/* Recent Admissions */}
            <div className="card">
              <div className="card-header flex-row">
                <h3>Recent Admissions</h3>
                <Link to="/school/students" className="btn btn-outline btn-sm">View All</Link>
              </div>
              {recentStudents.length === 0 ? (
                <div className="empty-state">
                  <p>No students admitted yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Admission No</th>
                        <th>Name</th>
                        <th>Class Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentStudents.map(student => (
                        <tr key={student.id}>
                          <td><strong>{student.admissionNo}</strong></td>
                          <td>{student.name}</td>
                          <td>{student.className} - {student.section}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Today's Timetable */}
            <div className="card">
              <div className="card-header flex-row">
                <h3>Today's Timetable Schedule</h3>
                <Link to="/school/timetable" className="btn btn-outline btn-sm">Manage</Link>
              </div>
              {todayClasses.length === 0 ? (
                <div className="empty-state">
                  <p>No lecture schedules defined for today.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Subject</th>
                        <th>Class</th>
                        <th>Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayClasses.map(slot => (
                        <tr key={slot.id}>
                          <td>{slot.startTime} - {slot.endTime}</td>
                          <td><strong>{slot.subject}</strong></td>
                          <td>{slot.className} - {slot.section}</td>
                          <td>{slot.teacher}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="grid-2 mt-lg">
            {/* Recent Notices */}
            <div className="card">
              <div className="card-header flex-row">
                <h3>Recent Notices</h3>
                <Link to="/school/notices" className="btn btn-outline btn-sm">Manage Board</Link>
              </div>
              {recentNotices.length === 0 ? (
                <div className="empty-state">
                  <p>No active notices published.</p>
                </div>
              ) : (
                <div className="events-list">
                  {recentNotices.map(notice => (
                    <div key={notice.id} style={{ padding: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>
                      <div className="flex-row">
                        <strong>{notice.title}</strong>
                        <span className="badge badge-info">{notice.audience}</span>
                      </div>
                      <small className="text-muted">{notice.date} {notice.time}</small>
                      <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.85rem" }}>{notice.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="card">
              <div className="card-header flex-row">
                <h3>Upcoming School Events</h3>
                <Link to="/school/calendar" className="btn btn-outline btn-sm">View Calendar</Link>
              </div>
              {upcomingEventsList.length === 0 ? (
                <div className="empty-state">
                  <p>No calendar events found.</p>
                </div>
              ) : (
                <div className="events-list">
                  {upcomingEventsList.map(event => (
                    <div key={event.id} className={`event-item-card event-item-card--${event.type.toLowerCase()}`}>
                      <div className="flex-row">
                        <strong>{event.title}</strong>
                        <span className="badge badge-outline">{event.date}</span>
                      </div>
                      <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem" }}>{event.description}</p>
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
