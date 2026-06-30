import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiPlus, FiEdit, FiTrash2, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

export default function Calendar() {
  const { showToast, confirm } = useUI();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Meeting");
  const [audience, setAudience] = useState("All");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Published");

  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("school_calendar_events") || "[]");
    setEvents(storedEvents);
  }, []);

  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem("school_calendar_events", JSON.stringify(newEvents));
  };

  const handleOpenAddModal = (initialDate = "") => {
    setEditId(null);
    setTitle("");
    setType("Meeting");
    setAudience("All");
    setDate(initialDate || selectedDateStr);
    setTime("09:00");
    setDescription("");
    setStatus("Published");
    setShowModal(true);
  };

  const handleOpenEditModal = (event) => {
    setEditId(event.id);
    setTitle(event.title);
    setType(event.type);
    setAudience(event.audience);
    setDate(event.date);
    setTime(event.time);
    setDescription(event.description || "");
    setStatus(event.status || "Published");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !type || !audience) {
      showToast("error", "Please fill all required fields");
      return;
    }

    const newEvent = {
      id: editId || "ev_" + Date.now(),
      title,
      type,
      audience,
      date,
      time,
      description,
      status
    };

    let updated;
    if (editId) {
      updated = events.map(ev => ev.id === editId ? newEvent : ev);
    } else {
      updated = [...events, newEvent];
    }

    saveEvents(updated);
    setShowModal(false);
    showToast("success", editId ? "Event updated successfully!" : "Event created successfully!");
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Event",
      message: "Are you sure you want to delete this event?",
    });
    if (!confirmed) return;
    const updated = events.filter(ev => ev.id !== id);
    saveEvents(updated);
    showToast("success", "Event deleted successfully!");
  };

  // Calendar Helper Functions
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month); // 0 = Sunday, 1 = Monday...

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Render Calendar Grid Cells
  const calendarCells = [];
  
  // Empty slots for previous month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
  }

  // Days in current month
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const isSelected = dStr === selectedDateStr;
    const dayEvents = events.filter(ev => ev.date === dStr);

    calendarCells.push(
      <div
        key={`day-${dayNum}`}
        className={`calendar-cell ${isSelected ? "selected" : ""}`}
        onClick={() => setSelectedDateStr(dStr)}
      >
        <span className="day-number">{dayNum}</span>
        {dayEvents.length > 0 && (
          <div className="event-dots">
            {dayEvents.slice(0, 3).map(ev => (
              <span key={ev.id} className={`event-dot event-dot--${ev.type.toLowerCase()}`} title={ev.title} />
            ))}
            {dayEvents.length > 3 && <span className="event-dot-more">+{dayEvents.length - 3}</span>}
          </div>
        )}
      </div>
    );
  }

  const selectedDateEvents = events.filter(ev => ev.date === selectedDateStr);

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Academic Calendar</h3>
            <p>Onboard notice announcements, exam schedules, and holiday planning</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenAddModal()}>
            <FiPlus /> Add Event
          </button>
        </header>

        <div className="page">
          <div className="grid-2 mb-lg">
            {/* Monthly Grid Card */}
            <div className="card">
              <div className="calendar-header-controls">
                <button className="icon-btn" onClick={handlePrevMonth}><FiChevronLeft size={20} /></button>
                <h3>{monthsList[month]} {year}</h3>
                <button className="icon-btn" onClick={handleNextMonth}><FiChevronRight size={20} /></button>
              </div>

              <div className="calendar-weekday-header">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(w => (
                  <div key={w} className="weekday-label">{w}</div>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarCells}
              </div>
            </div>

            {/* Selected Date Events Card */}
            <div className="card">
              <div className="card-header flex-row">
                <h3>Events on {new Date(selectedDateStr).toLocaleDateString("en-IN", { dateStyle: "long" })}</h3>
                <button className="btn btn-outline btn-sm" onClick={() => handleOpenAddModal(selectedDateStr)}>
                  + Add Event
                </button>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="empty-state">
                  <p>No events scheduled for this day.</p>
                </div>
              ) : (
                <div className="events-list">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className={`event-item-card event-item-card--${event.type.toLowerCase()}`}>
                      <div className="event-item-header">
                        <div>
                          <span className={`badge badge-type badge-type--${event.type.toLowerCase()}`}>
                            {event.type}
                          </span>
                          <span className="badge badge-audience ml-sm">
                            To: {event.audience}
                          </span>
                        </div>
                        <div className="event-item-actions">
                          <button className="icon-mini-btn" onClick={() => handleOpenEditModal(event)}>✏️</button>
                          <button className="icon-mini-btn delete" onClick={() => handleDelete(event.id)}>🗑️</button>
                        </div>
                      </div>
                      <h4 className="event-item-title">{event.title}</h4>
                      <p className="event-item-meta">{event.time || "All Day"}</p>
                      {event.description && <p className="event-item-desc">{event.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editId ? "Edit Event Details" : "Create Calendar Event"}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="dashboard-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input type="text" placeholder="e.g. Science Fair 2026" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Event Type *</label>
                  <select value={type} onChange={e => setType(e.target.value)} required>
                    <option value="Notice">Notice</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Exam">Exam</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Audience *</label>
                  <select value={audience} onChange={e => setAudience(e.target.value)} required>
                    <option value="All">All</option>
                    <option value="Students">Students</option>
                    <option value="Teachers">Teachers</option>
                    <option value="Parents">Parents</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea rows="4" placeholder="Brief event itinerary..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? "Update Event" : "Create Event"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
