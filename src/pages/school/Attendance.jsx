import React, { useState, useEffect, useMemo } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiSave, FiSearch, FiTrash2, FiEdit, FiFilter } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Half Day"];
const APPROVAL_OPTIONS = ["Pending Approval", "Approved", "Rejected"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getDayName(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return DAY_NAMES[date.getDay()];
}

function getFinalDayStatus(studentRecords) {
  const firstRecord = studentRecords.find((item) => Number(item.period) === 1);
  const fifthRecord = studentRecords.find((item) => Number(item.period) === 5);

  if (firstRecord && fifthRecord) {
    if (firstRecord.status === "Present" && fifthRecord.status === "Present") return "Present";
    if (firstRecord.status === "Absent" && fifthRecord.status === "Absent") return "Absent";
    return "Half Day";
  }

  if (firstRecord && !fifthRecord) return "Half Day Pending";
  if (!firstRecord && fifthRecord) {
    return fifthRecord.status === "Absent" ? "Absent" : "Present";
  }

  return "Not Submitted";
}

function getBadgeClass(status) {
  if (status === "Approved") return "badge-success";
  if (status === "Rejected") return "badge-danger";
  if (status === "Pending Approval") return "badge-warning";
  return "badge-info";
}

export default function Attendance() {
  const { showToast, confirm } = useUI();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("");

  const [markingStatuses, setMarkingStatuses] = useState({});
  const [showMarkPanel, setShowMarkPanel] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [editStatuses, setEditStatuses] = useState({});
  const [editApprovalStatus, setEditApprovalStatus] = useState("Approved");

  useEffect(() => {
    const storedClasses = JSON.parse(localStorage.getItem("school_classes") || "[]");
    const storedSections = JSON.parse(localStorage.getItem("school_sections") || "[]");
    const storedTeachers = JSON.parse(localStorage.getItem("school_teachers") || "[]");
    const storedStudents = JSON.parse(localStorage.getItem("school_students") || "[]");
    const storedTimetable = JSON.parse(localStorage.getItem("school_timetable") || "[]");
    const storedAttendance = JSON.parse(localStorage.getItem("school_attendance") || "[]");

    setClasses(storedClasses);
    setSections(storedSections);
    setTeachers(storedTeachers);
    setStudents(storedStudents);
    setTimetable(storedTimetable);
    setAttendance(storedAttendance);

    if (storedClasses.length > 0) {
      setSelectedClass(storedClasses[0].name);
    }
  }, []);

  useEffect(() => {
    const matchedClass = classes.find((item) => item.name === selectedClass);
    if (matchedClass) {
      const classSections = sections.filter((section) => section.classId === matchedClass.id);
      setSelectedSection(classSections[0]?.name || "");
    } else {
      setSelectedSection("");
    }
  }, [selectedClass, classes, sections]);

  const currentStudents = useMemo(
    () => students.filter((student) => student.className === selectedClass && student.section === selectedSection),
    [students, selectedClass, selectedSection]
  );

  const currentPeriodSlot = useMemo(
    () => timetable.find(
      (slot) =>
        slot.className === selectedClass &&
        slot.section === selectedSection &&
        Number(slot.period) === Number(selectedPeriod) &&
        slot.day === getDayName(selectedDate)
    ),
    [timetable, selectedClass, selectedSection, selectedPeriod, selectedDate]
  );

  const filteredAttendance = useMemo(
    () => attendance.filter((record) => {
      if (selectedDate && record.date !== selectedDate) return false;
      if (selectedClass && record.className !== selectedClass) return false;
      if (selectedSection && record.section !== selectedSection) return false;
      if (selectedTeacher && record.teacher !== selectedTeacher) return false;
      if (selectedApprovalStatus && record.approvalStatus !== selectedApprovalStatus) return false;
      if (selectedPeriod && Number(record.period) !== Number(selectedPeriod)) return false;
      return true;
    }),
    [attendance, selectedClass, selectedSection, selectedDate, selectedTeacher, selectedApprovalStatus, selectedPeriod]
  );

  const periodOptions = useMemo(
    () => timetable
      .filter((slot) => slot.className === selectedClass && slot.section === selectedSection)
      .sort((a, b) => Number(a.period) - Number(b.period)),
    [timetable, selectedClass, selectedSection]
  );

  const teacherOptions = useMemo(
    () => [...new Set(periodOptions.map((slot) => slot.teacher || ""))].filter(Boolean),
    [periodOptions]
  );

  useEffect(() => {
    if (!periodOptions.find((slot) => Number(slot.period) === Number(selectedPeriod))) {
      setSelectedPeriod(periodOptions[0]?.period || 1);
    }
    if (teacherOptions.length > 0 && !teacherOptions.includes(selectedTeacher)) {
      setSelectedTeacher(teacherOptions[0]);
    }
  }, [periodOptions, selectedTeacher, teacherOptions, selectedPeriod]);

  useEffect(() => {
    const currentPeriodAttendance = attendance.filter(
      (record) =>
        record.date === selectedDate &&
        record.className === selectedClass &&
        record.section === selectedSection &&
        Number(record.period) === Number(selectedPeriod)
    );

    const initial = {};
    currentStudents.forEach((student) => {
      const record = currentPeriodAttendance.find((item) => item.studentId === student.id);
      initial[student.id] = record?.status || "Present";
    });
    setMarkingStatuses(initial);
  }, [attendance, currentStudents, selectedClass, selectedSection, selectedDate, selectedPeriod]);

  const attendanceGroups = useMemo(() => {
    const groups = {};
    filteredAttendance.forEach((record) => {
      const key = `${record.date}|${record.className}|${record.section}|${record.period}|${record.teacher}|${record.subject}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          date: record.date,
          className: record.className,
          section: record.section,
          period: Number(record.period),
          subject: record.subject || "-",
          teacher: record.teacher || "-",
          approvalStatus: record.approvalStatus || "Pending Approval",
          records: [],
        };
      }
      groups[key].records.push(record);
    });

    return Object.values(groups).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.period - b.period;
    });
  }, [filteredAttendance]);

  const groupedAttendanceRows = attendanceGroups.map((group) => {
    const studentsById = {};
    group.records.forEach((record) => {
      studentsById[record.studentId] = [...(studentsById[record.studentId] || []), record];
    });
    const finalStatuses = Object.values(studentsById).map(getFinalDayStatus);
    const uniqueFinalStatuses = [...new Set(finalStatuses)];
    const finalSummary = uniqueFinalStatuses.length === 1 ? uniqueFinalStatuses[0] : uniqueFinalStatuses.join(" / ");

    const counts = group.records.reduce(
      (acc, record) => {
        if (record.status === "Present") acc.present += 1;
        else if (record.status === "Absent") acc.absent += 1;
        else if (record.status === "Late") acc.late += 1;
        else if (record.status === "Half Day") acc.halfDay += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, halfDay: 0 }
    );

    return {
      ...group,
      totalStudents: group.records.length,
      present: counts.present,
      absent: counts.absent,
      late: counts.late,
      halfDay: counts.halfDay,
      finalStatus: finalSummary || (group.period === 1 ? "Half Day Pending" : "Period Attendance"),
    };
  });

  const handleStatusChange = (studentId, status) => {
    setMarkingStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = () => {
    if (!selectedClass || !selectedSection) {
      showToast("error", "Please select a class and section.");
      return;
    }

    if (currentStudents.length === 0) {
      showToast("error", "No students found for the selected class and section.");
      return;
    }

    const subject = currentPeriodSlot?.subject || "Manual Attendance";
    const teacher = currentPeriodSlot?.teacher || selectedTeacher || "Administrator";
    const dayName = getDayName(selectedDate);

    let updated = attendance.filter(
      (record) => !(
        record.date === selectedDate &&
        record.className === selectedClass &&
        record.section === selectedSection &&
        Number(record.period) === Number(selectedPeriod)
      )
    );

    currentStudents.forEach((student) => {
      updated.push({
        id: `att_${selectedDate}_${selectedClass}_${selectedSection}_${selectedPeriod}_${student.id}`,
        studentId: student.id,
        studentName: student.name,
        admissionNo: student.admissionNo,
        className: selectedClass,
        section: selectedSection,
        date: selectedDate,
        period: selectedPeriod,
        subject,
        teacher,
        teacherUsername: "ADMIN",
        dayName,
        status: markingStatuses[student.id] || "Present",
        approvalStatus: "Approved",
        updatedAt: new Date().toISOString(),
      });
    });

    setAttendance(updated);
    localStorage.setItem("school_attendance", JSON.stringify(updated));
    showToast("success", "Attendance saved successfully.");
  };

  const openEditModal = (group) => {
    setEditGroup(group);
    setEditApprovalStatus(group.approvalStatus || "Approved");
    const initialStatuses = {};
    group.records.forEach((record) => {
      initialStatuses[record.studentId] = record.status;
    });
    setEditStatuses(initialStatuses);
    setShowEditModal(true);
  };

  const handleEditChange = (studentId, status) => {
    setEditStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveEdit = () => {
    if (!editGroup) return;

    const updated = attendance.map((record) => {
      if (
        record.date === editGroup.date &&
        record.className === editGroup.className &&
        record.section === editGroup.section &&
        Number(record.period) === Number(editGroup.period) &&
        record.teacher === editGroup.teacher &&
        record.subject === editGroup.subject
      ) {
        return {
          ...record,
          status: editStatuses[record.studentId] || record.status,
          approvalStatus: editApprovalStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return record;
    });

    setAttendance(updated);
    localStorage.setItem("school_attendance", JSON.stringify(updated));
    setShowEditModal(false);
    showToast("success", "Attendance record updated successfully.");
  };

  const handleDeleteGroup = async (group) => {
    const confirmed = await confirm({
      title: "Delete Attendance Group",
      message: "Delete all attendance records for this period?",
    });
    if (!confirmed) return;

    const updated = attendance.filter((record) => !(
      record.date === group.date &&
      record.className === group.className &&
      record.section === group.section &&
      Number(record.period) === Number(group.period) &&
      record.teacher === group.teacher &&
      record.subject === group.subject
    ));

    setAttendance(updated);
    localStorage.setItem("school_attendance", JSON.stringify(updated));
    showToast("success", "Attendance group deleted successfully.");
  };

  const attendanceSummary = attendance.filter((record) => record.date === selectedDate);
  const pendingApprovalsCount = attendanceSummary.filter((record) => record.approvalStatus === "Pending Approval").length;
  const missedPeriodsCount = timetable.filter(
    (slot) =>
      slot.day === getDayName(selectedDate) &&
      !attendance.some(
        (record) =>
          record.date === selectedDate &&
          record.className === slot.className &&
          record.section === slot.section &&
          Number(record.period) === Number(slot.period)
      )
  ).length;

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Attendance Management</h3>
            <p>Manage period-wise attendance, approvals, and manual corrections.</p>
          </div>
        </header>

        <div className="page">
          <div className="grid-3 mb-lg attendance-summary-grid">
            <div className="card stat-card stat-card--blue">
              <p className="stat-card-label">Attendance Records</p>
              <h3 className="stat-card-value">{attendance.length}</h3>
              <p className="stat-card-trend">All stored period attendance</p>
            </div>
            <div className="card stat-card stat-card--amber">
              <p className="stat-card-label">Pending Approvals</p>
              <h3 className="stat-card-value">{pendingApprovalsCount}</h3>
              <p className="stat-card-trend">Waiting for manager action</p>
            </div>
            <div className="card stat-card stat-card--red">
              <p className="stat-card-label">Missed Periods</p>
              <h3 className="stat-card-value">{missedPeriodsCount}</h3>
              <p className="stat-card-trend">Today’s unsubmitted slots</p>
            </div>
          </div>

          <div className="card attendance-panel">
            <div className="card-header flex-row">
              <div>
                <h3>Mark Period Attendance</h3>
                <p>Open this panel only when you need to mark or update period attendance.</p>
              </div>
              <button className="btn btn-outline" onClick={() => setShowMarkPanel((value) => !value)}>
                {showMarkPanel ? "Hide" : "Open"} Attendance Panel
              </button>
            </div>

            {showMarkPanel && (
              <>
                <div className="attendance-filter-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Class</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {classes.map((item) => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      {sections
                        .filter((section) => section.classId === classes.find((item) => item.name === selectedClass)?.id)
                        .map((section) => (
                          <option key={section.id} value={section.name}>{section.name}</option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Period</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    >
                      {PERIODS.map((period) => (
                        <option key={period} value={period}>Period {period}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Teacher</label>
                    <select
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                    >
                      <option value="">Any</option>
                      {teacherOptions.map((teacher) => (
                        <option key={teacher} value={teacher}>{teacher}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Approval Status</label>
                    <select
                      value={selectedApprovalStatus}
                      onChange={(e) => setSelectedApprovalStatus(e.target.value)}
                    >
                      <option value="">All</option>
                      {APPROVAL_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="attendance-action-row">
                  <button className="btn btn-primary" onClick={saveAttendance}>
                    <FiSave /> Save Attendance
                  </button>
                </div>

                <div className="card mt-lg">
                  <div className="card-header flex-row">
                    <div>
                      <h4>Student Attendance List</h4>
                      <p>{selectedClass} - {selectedSection} / Period {selectedPeriod} / {selectedDate}</p>
                    </div>
                  </div>

                  {currentStudents.length === 0 ? (
                    <div className="empty-state">
                      <p>Select a valid class and section to mark attendance.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Admission No</th>
                            <th>Student Name</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentStudents.map((student) => (
                            <tr key={student.id}>
                              <td><strong>{student.admissionNo}</strong></td>
                              <td>{student.name}</td>
                              <td>
                                <div className="attendance-options">
                                  {STATUS_OPTIONS.map((status) => (
                                    <label
                                      key={status}
                                      className={`attendance-btn ${markingStatuses[student.id] === status ? "active" : ""}`}>
                                      <input
                                        type="radio"
                                        name={`admin-status-${student.id}`}
                                        value={status}
                                        checked={markingStatuses[student.id] === status}
                                        onChange={() => handleStatusChange(student.id, status)}
                                        className="visually-hidden"
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
                  )}
                </div>
              </>
            )}
          </div>
          <div className="card mt-lg">
            <div className="card-header flex-row">
              <div>
                <h3>Attendance Records</h3>
                <p>Review existing period attendance records by filter.</p>
              </div>
              <button className="btn btn-outline btn-sm">
                <FiFilter /> Filter
              </button>
            </div>

            {groupedAttendanceRows.length === 0 ? (
              <div className="empty-state">
                <p>No attendance records match the current filters.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Period</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Subject</th>
                      <th>Teacher</th>
                      <th>Total Students</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Late</th>
                      <th>Half Day</th>
                      <th>Final Day Status</th>
                      <th>Approval Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedAttendanceRows.map((group) => (
                      <tr key={`${group.date}-${group.className}-${group.section}-${group.period}-${group.teacher}`}>
                        <td>{group.date}</td>
                        <td>{group.period}</td>
                        <td>{group.className}</td>
                        <td>{group.section}</td>
                        <td>{group.subject}</td>
                        <td>{group.teacher}</td>
                        <td>{group.totalStudents}</td>
                        <td>{group.present}</td>
                        <td>{group.absent}</td>
                        <td>{group.late}</td>
                        <td>{group.halfDay}</td>
                        <td>{group.finalStatus}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(group.approvalStatus)}`}>
                            {group.approvalStatus}
                          </span>
                        </td>
                        <td>
                          <div className="table-action">
                            <button className="btn btn-sm btn-icon" onClick={() => openEditModal(group)}>
                              <FiEdit /> Edit
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteGroup(group)}>
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && editGroup && (
        <div className="modal-overlay">
          <div className="modal-card attendance-edit-modal">
            <div className="modal-header">
              <h3>Edit Attendance - Period {editGroup.period}</h3>
              <button className="modal-close-button" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <p className="modal-description">
              {editGroup.className} - {editGroup.section} / {editGroup.date} / {editGroup.subject} / {editGroup.teacher}
            </p>

            <div className="modal-form">
              <div className="form-group">
                <label>Approval Status</label>
                <select value={editApprovalStatus} onChange={(e) => setEditApprovalStatus(e.target.value)}>
                  {APPROVAL_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Admission No</th>
                      <th>Student Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editGroup.records.map((record) => (
                      <tr key={record.id}>
                        <td><strong>{record.admissionNo}</strong></td>
                        <td>{record.studentName}</td>
                        <td>
                          <div className="attendance-options">
                            {STATUS_OPTIONS.map((status) => (
                              <label
                                key={status}
                                className={`attendance-btn ${editStatuses[record.studentId] === status ? "active" : ""}`}>
                                <input
                                  type="radio"
                                  name={`edit-status-${record.studentId}`}
                                  value={status}
                                  checked={editStatuses[record.studentId] === status}
                                  onChange={() => handleEditChange(record.studentId, status)}
                                  style={{ display: "none" }}
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
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
