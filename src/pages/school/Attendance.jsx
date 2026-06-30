import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiSave, FiSearch, FiTrash2 } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

export default function Attendance() {
  const { showToast, confirm } = useUI();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Filter states
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Current marking statuses
  const [markingStatuses, setMarkingStatuses] = useState({});

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem("school_students") || "[]");
    const storedClasses = JSON.parse(localStorage.getItem("school_classes") || "[]");
    const storedSections = JSON.parse(localStorage.getItem("school_sections") || "[]");
    const storedAttendance = JSON.parse(localStorage.getItem("school_attendance") || "[]");

    setStudents(storedStudents);
    setClasses(storedClasses);
    setSections(storedSections);
    setAttendance(storedAttendance);

    // Pick first class/section by default if available
    if (storedClasses.length > 0) {
      setSelectedClass(storedClasses[0].name);
    }
  }, []);

  // Update default selected section when selectedClass changes
  useEffect(() => {
    const matchedClass = classes.find(c => c.name === selectedClass);
    if (matchedClass) {
      const classSections = sections.filter(s => s.classId === matchedClass.id);
      if (classSections.length > 0) {
        setSelectedSection(classSections[0].name);
      } else {
        setSelectedSection("");
      }
    } else {
      setSelectedSection("");
    }
  }, [selectedClass, classes, sections]);

  // Load existing marking statuses when date or class/section filters change
  useEffect(() => {
    const filteredStudents = students.filter(
      s => s.className === selectedClass && s.section === selectedSection
    );

    const initialStatuses = {};
    filteredStudents.forEach(student => {
      // Find saved attendance for this student + date
      const record = attendance.find(
        a => a.studentId === student.id && a.date === selectedDate
      );
      initialStatuses[student.id] = record ? record.status : "Present";
    });
    setMarkingStatuses(initialStatuses);
  }, [selectedClass, selectedSection, selectedDate, students, attendance]);

  const handleStatusChange = (studentId, status) => {
    setMarkingStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    const filteredStudents = students.filter(
      s => s.className === selectedClass && s.section === selectedSection
    );

    if (filteredStudents.length === 0) {
      showToast("error", "No students in this class/section to mark attendance.");
      return;
    }

    // Prepare updated attendance entries
    let updatedAttendance = [...attendance];

    filteredStudents.forEach(student => {
      const status = markingStatuses[student.id] || "Present";
      
      // Remove any existing record for this student + date
      updatedAttendance = updatedAttendance.filter(
        a => !(a.studentId === student.id && a.date === selectedDate)
      );

      // Add new record
      updatedAttendance.push({
        id: "att_" + student.id + "_" + selectedDate,
        studentId: student.id,
        studentName: student.name,
        admissionNo: student.admissionNo,
        className: selectedClass,
        section: selectedSection,
        date: selectedDate,
        status: status
      });
    });

    setAttendance(updatedAttendance);
    localStorage.setItem("school_attendance", JSON.stringify(updatedAttendance));
    showToast("success", "Attendance saved successfully!");
  };

  const handleDeleteRecord = async (id) => {
    const confirmed = await confirm({
      title: "Delete Attendance Log",
      message: "Are you sure you want to delete this attendance record?",
    });
    if (!confirmed) return;
    const updated = attendance.filter(a => a.id !== id);
    setAttendance(updated);
    localStorage.setItem("school_attendance", JSON.stringify(updated));
    showToast("success", "Attendance log deleted successfully!");
  };

  // Calculations for filtered class & section on the selected date
  const filteredStudents = students.filter(
    s => s.className === selectedClass && s.section === selectedSection
  );

  const totalStudentsCount = filteredStudents.length;

  const currentStats = {
    total: totalStudentsCount,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0
  };

  filteredStudents.forEach(student => {
    const status = markingStatuses[student.id];
    if (status === "Present") currentStats.present++;
    else if (status === "Absent") currentStats.absent++;
    else if (status === "Late") currentStats.late++;
    else if (status === "Half Day") currentStats.halfDay++;
  });

  // Historical records for displaying at the bottom
  const matchedHistoricalRecords = attendance.filter(
    a => a.className === selectedClass && a.section === selectedSection && a.date === selectedDate
  );

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Attendance Register</h3>
            <p>Track daily student attendance logs</p>
          </div>
        </header>

        <div className="page">
          {classes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <p>Please configure classes and sections first.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Select Filters */}
              <div className="card search-card grid-3">
                <div className="form-group">
                  <label>Class</label>
                  <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                    {classes.find(c => c.name === selectedClass) ? (
                      sections
                        .filter(s => s.classId === classes.find(c => c.name === selectedClass).id)
                        .map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                    ) : (
                      <option value="">-- No Sections --</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid-5 mb-lg mt-md">
                <div className="card stat-card stat-card--blue">
                  <p className="stat-card-label">Class Strength</p>
                  <h3 className="stat-card-value">{currentStats.total}</h3>
                </div>
                <div className="card stat-card stat-card--green">
                  <p className="stat-card-label">Present</p>
                  <h3 className="stat-card-value">{currentStats.present}</h3>
                </div>
                <div className="card stat-card stat-card--red">
                  <p className="stat-card-label">Absent</p>
                  <h3 className="stat-card-value">{currentStats.absent}</h3>
                </div>
                <div className="card stat-card stat-card--amber">
                  <p className="stat-card-label">Late</p>
                  <h3 className="stat-card-value">{currentStats.late}</h3>
                </div>
                <div className="card stat-card stat-card--violet">
                  <p className="stat-card-label">Half Day</p>
                  <h3 className="stat-card-value">{currentStats.halfDay}</h3>
                </div>
              </div>

              {/* Attendance Marker List */}
              <div className="card">
                <div className="card-header flex-row">
                  <h3>Mark Attendance: {selectedClass} - {selectedSection}</h3>
                  <button className="btn btn-primary" onClick={handleSaveAttendance}>
                    <FiSave /> Save Attendance
                  </button>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="empty-state">
                    <p>No students enrolled in {selectedClass} - Section {selectedSection || "None"}.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Admission No</th>
                          <th>Student Name</th>
                          <th>Status Marking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map(student => (
                          <tr key={student.id}>
                            <td data-label="Admission No"><strong>{student.admissionNo}</strong></td>
                            <td data-label="Student Name">{student.name}</td>
                            <td data-label="Status Marking">
                              <div className="attendance-options">
                                {["Present", "Absent", "Late", "Half Day"].map(opt => (
                                  <label key={opt} className={`attendance-btn ${markingStatuses[student.id] === opt ? "active" : ""}`}>
                                    <input
                                      type="radio"
                                      name={`status-${student.id}`}
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

              {/* Saved Records Log */}
              <div className="card mt-lg">
                <div className="card-header">
                  <h3>Saved Logs: {selectedClass} - {selectedSection} ({selectedDate})</h3>
                </div>

                {matchedHistoricalRecords.length === 0 ? (
                  <div className="empty-state">
                    <p>No attendance has been saved for this class and section on {selectedDate}.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Admission No</th>
                          <th>Class / Section</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchedHistoricalRecords.map(record => (
                          <tr key={record.id}>
                            <td data-label="Student Name">{record.studentName}</td>
                            <td data-label="Admission No"><strong>{record.admissionNo}</strong></td>
                            <td data-label="Class / Section">{record.className} - {record.section}</td>
                            <td data-label="Date">{record.date}</td>
                            <td data-label="Status">
                              <span className={`badge ${
                                record.status === "Present" ? "badge-success" : 
                                record.status === "Absent" ? "badge-danger" : 
                                record.status === "Late" ? "badge-warning" : "badge-info"
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td data-label="Actions">
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRecord(record.id)}>
                                <FiTrash2 /> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
