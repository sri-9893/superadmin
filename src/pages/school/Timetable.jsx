import React, { useState, useEffect, useMemo } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiPlus, FiX } from "react-icons/fi";
import ActionMenu from "../../components/ActionMenu";
import { useUI } from "../../components/UIContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Timetable() {
  const { showToast, confirm } = useUI();

  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingSlotId, setEditingSlotId] = useState(null);

  const [formDay, setFormDay] = useState("");
  const [formPeriod, setFormPeriod] = useState(1);
  const [formSubject, setFormSubject] = useState("");
  const [formTeacher, setFormTeacher] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formRoom, setFormRoom] = useState("");

  useEffect(() => {
    setTimetable(JSON.parse(localStorage.getItem("school_timetable") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("school_classes") || "[]"));
    setSections(JSON.parse(localStorage.getItem("school_sections") || "[]"));
    setTeachers(JSON.parse(localStorage.getItem("school_teachers") || "[]"));
    setSubjects(JSON.parse(localStorage.getItem("school_subjects") || "[]"));
  }, []);

  const saveTimetable = (newTimetable) => {
    setTimetable(newTimetable);
    localStorage.setItem("school_timetable", JSON.stringify(newTimetable));
  };

  const currentClass = classes.find((item) => item.name === selectedClass);
  const sectionOptions = currentClass
    ? sections.filter((section) => section.classId === currentClass.id)
    : [];
  const subjectOptions = currentClass
    ? subjects.filter((subject) => subject.classId === currentClass.id)
    : [];

  const filteredTeachers = teachers.filter((teacher) => {
    if (!formSubject) return true;
    const teacherName = teacher.name ? teacher.name.toLowerCase() : "";
    const teacherSubject = teacher.subject ? teacher.subject.toLowerCase() : "";
    const checkedSubjects = Array.isArray(teacher.subjectsChecked)
      ? teacher.subjectsChecked.map((item) => item.toLowerCase())
      : [];

    return (
      (teacherSubject && teacherSubject.includes(formSubject.toLowerCase())) ||
      checkedSubjects.includes(formSubject.toLowerCase()) ||
      teacherName.includes(formSubject.toLowerCase())
    );
  });

  const classTimetable = useMemo(
    () => timetable.filter(
      (slot) => slot.className === selectedClass && slot.section === selectedSection
    ),
    [timetable, selectedClass, selectedSection]
  );

  const gridData = useMemo(
    () => DAYS.map((dayName) => ({
      day: dayName,
      periods: PERIODS.map(
        (periodNumber) =>
          classTimetable.find(
            (slot) => slot.day === dayName && Number(slot.period) === periodNumber
          ) || null
      ),
    })),
    [classTimetable]
  );

  const resetForm = () => {
    setEditingSlotId(null);
    setFormDay("");
    setFormPeriod(1);
    setFormSubject("");
    setFormTeacher("");
    setFormStartTime("");
    setFormEndTime("");
    setFormRoom("");
    setErrorMsg("");
  };

  const openAddModal = () => {
    if (!selectedClass || !selectedSection) {
      showToast("error", "Please select class and section before adding timetable slots.");
      return;
    }
    resetForm();
    setFormDay(DAYS[0]);
    setFormPeriod(1);
    setShowModal(true);
  };

  const openSlotModal = (slot, dayName, periodNumber) => {
    if (!selectedClass || !selectedSection) {
      showToast("error", "Please select class and section to manage timetable slots.");
      return;
    }

    if (slot) {
      setEditingSlotId(slot.id);
      setFormDay(slot.day);
      setFormPeriod(Number(slot.period));
      setFormSubject(slot.subject);
      setFormTeacher(slot.teacher);
      setFormStartTime(slot.startTime);
      setFormEndTime(slot.endTime);
      setFormRoom(slot.room || "");
    } else {
      resetForm();
      setFormDay(dayName);
      setFormPeriod(periodNumber);
    }

    setShowModal(true);
  };

  const timeToMinutes = (value) => {
    const [h = 0, m = 0] = value.split(":").map(Number);
    return h * 60 + m;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMsg("");

    if (
      !selectedClass ||
      !selectedSection ||
      !formDay ||
      !formPeriod ||
      !formSubject ||
      !formTeacher ||
      !formStartTime ||
      !formEndTime
    ) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    const periodNumber = Number(formPeriod);
    if (!Number.isInteger(periodNumber) || periodNumber < 1 || periodNumber > 8) {
      setErrorMsg("Period must be a whole number between 1 and 8.");
      return;
    }

    if (timeToMinutes(formEndTime) <= timeToMinutes(formStartTime)) {
      setErrorMsg("End time must be greater than start time.");
      return;
    }

    const otherSlots = timetable.filter((slot) => slot.id !== editingSlotId);

    const duplicateSlot = otherSlots.find(
      (slot) =>
        slot.className === selectedClass &&
        slot.section === selectedSection &&
        slot.day === formDay &&
        Number(slot.period) === periodNumber
    );

    if (duplicateSlot) {
      setErrorMsg("A slot already exists for this class, section, day and period.");
      return;
    }

    const teacherConflict = otherSlots.find(
      (slot) =>
        slot.teacher === formTeacher &&
        slot.day === formDay &&
        Number(slot.period) === periodNumber &&
        (slot.className !== selectedClass || slot.section !== selectedSection)
    );

    if (teacherConflict) {
      setErrorMsg("This teacher is already assigned to another class at the same day and period.");
      return;
    }

    const roomConflict = otherSlots.find(
      (slot) =>
        formRoom &&
        slot.room === formRoom &&
        slot.day === formDay &&
        Number(slot.period) === periodNumber
    );

    if (roomConflict) {
      setErrorMsg("This room is already booked at the same day and period.");
      return;
    }

    const newSlot = {
      id: editingSlotId || `slot_${Date.now()}`,
      className: selectedClass,
      section: selectedSection,
      day: formDay,
      period: periodNumber,
      subject: formSubject,
      teacher: formTeacher,
      startTime: formStartTime,
      endTime: formEndTime,
      room: formRoom,
    };

    const updatedTimetable = editingSlotId
      ? timetable.map((slot) => (slot.id === editingSlotId ? newSlot : slot))
      : [...timetable, newSlot];

    saveTimetable(updatedTimetable);
    setShowModal(false);
    showToast("success", editingSlotId ? "Timetable slot updated successfully." : "Timetable slot added successfully.");
  };

  const handleDelete = async (slotId) => {
    const confirmed = await confirm({
      title: "Delete timetable slot",
      message: "Are you sure you want to delete this slot?",
    });
    if (!confirmed) return;

    const updatedTimetable = timetable.filter((slot) => slot.id !== slotId);
    saveTimetable(updatedTimetable);
    showToast("success", "Timetable slot deleted successfully.");
  };

  const displaySlots = selectedClass && selectedSection ? classTimetable : timetable;

  return (
    <div className="dashboard-layout timetable-page">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Weekly Timetable</h3>
            <p>Build the weekly schedule for your selected class and section.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddModal}>
            <FiPlus /> Add Slot
          </button>
        </header>

        <div className="page">
          <div className="card search-card grid-2">
            <div className="form-group">
              <label>Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection("");
                }}
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
              >
                <option value="">Select section</option>
                {sectionOptions.map((section) => (
                  <option key={section.id} value={section.name}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card mt-md">
            <div className="card-header">
              <h3>Weekly Grid</h3>
              <p className="text-muted">Days as rows, periods as columns.</p>
            </div>
            {!selectedClass || !selectedSection ? (
              <div className="empty-state">
                <p>Select a class and section to view the timetable grid.</p>
              </div>
            ) : (
              <div className="timetable-grid-wrapper">
                <table className="timetable-grid">
                  <thead>
                    <tr>
                      <th>Day</th>
                      {PERIODS.map((periodNumber) => (
                        <th key={periodNumber}>P{periodNumber}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gridData.map((row) => (
                      <tr key={row.day}>
                        <th>{row.day}</th>
                        {row.periods.map((slot, idx) => (
                          <td key={`${row.day}-${idx}`}>
                            <button
                              type="button"
                              className={`timetable-cell ${slot ? "timetable-cell-filled" : "timetable-cell-empty"}`}
                              onClick={() => openSlotModal(slot, row.day, PERIODS[idx])}
                            >
                              {slot ? (
                                <div className="timetable-slot">
                                  <span className="timetable-slot-title">{slot.subject}</span>
                                  <span className="timetable-slot-meta">{slot.teacher}</span>
                                  <span className="timetable-slot-meta">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <span className="timetable-slot-meta">Room {slot.room || "-"}</span>
                                </div>
                              ) : (
                                <span className="timetable-slot-empty">+ Add</span>
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card mt-md">
            <div className="card-header">
              <h3>Scheduled Entries</h3>
              <p className="text-muted">Review and manage individual timetable slots.</p>
            </div>
            {displaySlots.length === 0 ? (
              <div className="empty-state">
                <p>No timetable slots configured yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Day</th>
                      <th>Period</th>
                      <th>Subject</th>
                      <th>Teacher</th>
                      <th>Time</th>
                      <th>Room</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySlots.map((slot) => (
                      <tr key={slot.id}>
                        <td>{slot.className}</td>
                        <td><span className="badge badge-info">{slot.section}</span></td>
                        <td>{slot.day}</td>
                        <td>{slot.period}</td>
                        <td>{slot.subject}</td>
                        <td>{slot.teacher}</td>
                        <td>{slot.startTime} - {slot.endTime}</td>
                        <td>{slot.room || "-"}</td>
                        <td>
                          <div className="table-action">
                            <ActionMenu onEdit={() => openSlotModal(slot)} onDelete={() => handleDelete(slot.id)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-card">
                <div className="modal-header">
                  <h3>{editingSlotId ? "Edit Timetable Slot" : "Add Timetable Slot"}</h3>
                  <button className="icon-btn" type="button" onClick={() => setShowModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="dashboard-form">
                  {errorMsg && <p className="error-message">{errorMsg}</p>}

                  <div className="grid-3">
                    <div className="form-group">
                      <label>Class *</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          setSelectedSection("");
                        }}
                        required
                      >
                        <option value="">Select class</option>
                        {classes.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Section *</label>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        required
                      >
                        <option value="">Select section</option>
                        {sectionOptions.map((section) => (
                          <option key={section.id} value={section.name}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Day *</label>
                      <select value={formDay} onChange={(e) => setFormDay(e.target.value)} required>
                        <option value="">Select day</option>
                        {DAYS.map((dayName) => (
                          <option key={dayName} value={dayName}>
                            {dayName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>Period *</label>
                      <select value={formPeriod} onChange={(e) => setFormPeriod(Number(e.target.value))} required>
                        <option value="">Select period</option>
                        {PERIODS.map((periodValue) => (
                          <option key={periodValue} value={periodValue}>
                            {periodValue}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subject *</label>
                      <select
                        value={formSubject}
                        onChange={(e) => {
                          setFormSubject(e.target.value);
                          setFormTeacher("");
                        }}
                        required
                      >
                        <option value="">Select subject</option>
                        {subjectOptions.map((subjectItem) => (
                          <option key={subjectItem.id} value={subjectItem.name}>
                            {subjectItem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Teacher *</label>
                      <select
                        value={formTeacher}
                        onChange={(e) => setFormTeacher(e.target.value)}
                        required
                      >
                        <option value="">Select teacher</option>
                        {filteredTeachers.map((teacherItem) => (
                          <option key={teacherItem.id} value={teacherItem.name}>
                            {teacherItem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time *</label>
                      <input
                        type="time"
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Room</label>
                      <input
                        type="text"
                        value={formRoom}
                        placeholder="e.g. 104"
                        onChange={(e) => setFormRoom(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-actions mt-lg">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingSlotId ? "Update Slot" : "Save Slot"}
                    </button>
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
