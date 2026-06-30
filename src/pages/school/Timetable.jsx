import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

export default function Timetable() {
  const { showToast, confirm } = useUI();

  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  // Form states
  const [editId, setEditId] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [day, setDay] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [period, setPeriod] = useState("");

  useEffect(() => {
    const storedTimetable = JSON.parse(localStorage.getItem("school_timetable") || "[]");
    const storedClasses = JSON.parse(localStorage.getItem("school_classes") || "[]");
    const storedSections = JSON.parse(localStorage.getItem("school_sections") || "[]");
    const storedTeachers = JSON.parse(localStorage.getItem("school_teachers") || "[]");
    const storedSubjects = JSON.parse(localStorage.getItem("school_subjects") || "[]");

    setTimetable(storedTimetable);
    setClasses(storedClasses);
    setSections(storedSections);
    setTeachers(storedTeachers);
    setAllSubjects(storedSubjects);
  }, []);

  const saveTimetable = (newTimetable) => {
    setTimetable(newTimetable);
    localStorage.setItem("school_timetable", JSON.stringify(newTimetable));
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setSelectedClass("");
    setSelectedSection("");
    setDay("");
    setSubject("");
    setTeacher("");
    setStartTime("");
    setEndTime("");
    setRoom("");
    setPeriod("");
    setErrorMsg("");
    setShowModal(true);
  };

  const handleOpenEditModal = (entry) => {
    setEditId(entry.id);
    setSelectedClass(entry.className);
    setSelectedSection(entry.section);
    setDay(entry.day);
    setSubject(entry.subject);
    setTeacher(entry.teacher);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setRoom(entry.room);
    setPeriod(entry.period || "");
    setErrorMsg("");
    setShowModal(true);
  };

  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const hasOverlap = (s1, e1, s2, e2) => {
    const start1 = timeToMinutes(s1);
    const end1 = timeToMinutes(e1);
    const start2 = timeToMinutes(s2);
    const end2 = timeToMinutes(e2);
    return start1 < end2 && start2 < end1;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedClass || !selectedSection || !day || !subject || !teacher || !startTime || !endTime) {
      setErrorMsg("All marked fields are required.");
      return;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      setErrorMsg("End time must be greater than start time.");
      return;
    }

    // Check conflicts
    const otherEntries = timetable.filter(entry => entry.id !== editId);

    // 1. Same Class, Same Section, Same Day, Same Time -> Time slot already assigned.
    const classConflict = otherEntries.find(
      entry =>
        entry.className === selectedClass &&
        entry.section === selectedSection &&
        entry.day === day &&
        hasOverlap(entry.startTime, entry.endTime, startTime, endTime)
    );
    if (classConflict) {
      const errMsg = "Time slot already assigned.";
      setErrorMsg(errMsg);
      showToast("error", errMsg);
      return;
    }

    // 2. Teacher conflict -> Teacher already assigned during this period.
    const teacherConflict = otherEntries.find(
      entry =>
        entry.teacher === teacher &&
        entry.day === day &&
        hasOverlap(entry.startTime, entry.endTime, startTime, endTime)
    );
    if (teacherConflict) {
      const errMsg = "Teacher already assigned during this period.";
      setErrorMsg(errMsg);
      showToast("error", errMsg);
      return;
    }

    // 3. Room conflict -> Room already occupied.
    if (room) {
      const roomConflict = otherEntries.find(
        entry =>
          entry.room === room &&
          entry.day === day &&
          hasOverlap(entry.startTime, entry.endTime, startTime, endTime)
      );
      if (roomConflict) {
        const errMsg = "Room already occupied.";
        setErrorMsg(errMsg);
        showToast("error", errMsg);
        return;
      }
    }

    const newEntry = {
      id: editId || "tt_" + Date.now(),
      className: selectedClass,
      section: selectedSection,
      day,
      subject,
      teacher,
      startTime,
      endTime,
      room,
      period
    };

    let updated;
    if (editId) {
      updated = timetable.map(item => item.id === editId ? newEntry : item);
    } else {
      updated = [...timetable, newEntry];
    }

    saveTimetable(updated);
    setShowModal(false);
    showToast("success", editId ? "Timetable slot updated successfully!" : "Timetable slot saved successfully!");
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Slot",
      message: "Are you sure you want to delete this timetable slot?"
    });
    if (!confirmed) return;

    const updated = timetable.filter(item => item.id !== id);
    saveTimetable(updated);
    showToast("success", "Timetable slot deleted successfully!");
  };

  // Filter timetable
  const filteredTimetable = timetable.filter(item => {
    const matchesClass = classFilter ? item.className === classFilter : true;
    const matchesSection = sectionFilter ? item.section === sectionFilter : true;
    const matchesDay = dayFilter ? item.day === dayFilter : true;
    return matchesClass && matchesSection && matchesDay;
  });

  const hasConfig = classes.length > 0 && teachers.length > 0;

  // Filtered Subject Dropdown display logic
  const currentClassObj = classes.find(c => c.name === selectedClass);
  const classSubjects = currentClassObj ? allSubjects.filter(sub => sub.classId === currentClassObj.id) : [];

  // Filtered Teacher Dropdown display logic
  const subjectTeachers = teachers.filter(t => {
    if (!subject) return true;
    const teachesSubj = t.subject && t.subject.toLowerCase().includes(subject.toLowerCase());
    const checkedSubj = t.subjectsChecked && t.subjectsChecked.some(s => s.toLowerCase() === subject.toLowerCase());
    return teachesSubj || checkedSubj;
  });

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Timetable Management</h3>
            <p>Define weekly schedules and avoid scheduling conflicts</p>
          </div>
          {hasConfig && (
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <FiPlus /> Add Entry
            </button>
          )}
        </header>

        <div className="page">
          {!hasConfig ? (
            <div className="card">
              <div className="empty-state">
                <p>Please add classes, sections, and teachers first.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Filter Row */}
              <div className="card search-card grid-3">
                <div className="form-group">
                  <label>Filter by Class</label>
                  <select value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Filter by Section</label>
                  <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                    <option value="">All Sections</option>
                    {Array.from(new Set(sections.map(s => s.name))).map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Filter by Day</label>
                  <select value={dayFilter} onChange={e => setDayFilter(e.target.value)}>
                    <option value="">All Days</option>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timetable Table */}
              <div className="card mt-md">
                <div className="card-header">
                  <h3>Active Timetable Entries ({filteredTimetable.length})</h3>
                </div>

                {filteredTimetable.length === 0 ? (
                  <div className="empty-state">
                    <p>No timetable entries scheduled.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Section</th>
                          <th>Day</th>
                          <th>Period No</th>
                          <th>Subject</th>
                          <th>Teacher</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Room</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTimetable.map(item => (
                          <tr key={item.id}>
                            <td data-label="Class">{item.className}</td>
                            <td data-label="Section"><span className="badge badge-info">{item.section}</span></td>
                            <td data-label="Day"><strong>{item.day}</strong></td>
                            <td data-label="Period No">{item.period || "-"}</td>
                            <td data-label="Subject">{item.subject}</td>
                            <td data-label="Teacher">{item.teacher}</td>
                            <td data-label="Start Time">{item.startTime}</td>
                            <td data-label="End Time">{item.endTime}</td>
                            <td data-label="Room">{item.room || "-"}</td>
                            <td data-label="Actions">
                              <div className="table-action">
                                <button className="btn btn-outline btn-sm" onClick={() => handleOpenEditModal(item)}>
                                  <FiEdit /> Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
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
            </>
          )}

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-card">
                <div className="modal-header">
                  <h3>{editId ? "Edit Timetable Entry" : "Create Timetable Entry"}</h3>
                  <button className="icon-btn" onClick={() => setShowModal(false)}><FiX size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="dashboard-form">
                  {errorMsg && <p className="error-message mb-md" style={{ color: "var(--danger-text)" }}>{errorMsg}</p>}
                  
                  <div className="grid-3">
                    <div className="form-group">
                      <label>Class *</label>
                      <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSubject(""); }} required>
                        <option value="">Select Class</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Section *</label>
                      <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} required>
                        <option value="">Select Section</option>
                        {classes.find(c => c.name === selectedClass) ? (
                          sections
                            .filter(s => s.classId === classes.find(c => c.name === selectedClass).id)
                            .map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                        ) : (
                          sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Day *</label>
                      <select value={day} onChange={e => setDay(e.target.value)} required>
                        <option value="">Select Day</option>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>Subject *</label>
                      <select value={subject} onChange={e => { setSubject(e.target.value); setTeacher(""); }} required>
                        <option value="">Select Subject</option>
                        {classSubjects.map(sub => (
                          <option key={sub.id} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Teacher *</label>
                      <select value={teacher} onChange={e => setTeacher(e.target.value)} required>
                        <option value="">Select Teacher</option>
                        {subjectTeachers.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Period Number</label>
                      <input type="number" placeholder="e.g. 1" value={period} onChange={e => setPeriod(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>End Time *</label>
                      <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Room Number</label>
                      <input type="text" placeholder="e.g. 104" value={room} onChange={e => setRoom(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-actions mt-lg">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editId ? "Update Entry" : "Save Entry"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
