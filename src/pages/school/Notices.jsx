import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

export default function Notices() {
  const { showToast, confirm } = useUI();
  const [notices, setNotices] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("All");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Published");

  useEffect(() => {
    const storedNotices = JSON.parse(localStorage.getItem("school_notices") || "[]");
    setNotices(storedNotices);
  }, []);

  const saveNotices = (newNotices) => {
    setNotices(newNotices);
    localStorage.setItem("school_notices", JSON.stringify(newNotices));
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setTitle("");
    setAudience("All");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("09:00");
    setDescription("");
    setStatus("Published");
    setShowModal(true);
  };

  const handleOpenEditModal = (notice) => {
    setEditId(notice.id);
    setTitle(notice.title);
    setAudience(notice.audience);
    setDate(notice.date);
    setTime(notice.time);
    setDescription(notice.description);
    setStatus(notice.status || "Published");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !audience || !status) {
      showToast("error", "Please fill all required fields");
      return;
    }

    const newNotice = {
      id: editId || "ntc_" + Date.now(),
      title,
      audience,
      date,
      time,
      description,
      status
    };

    let updated;
    if (editId) {
      updated = notices.map(n => n.id === editId ? newNotice : n);
    } else {
      updated = [newNotice, ...notices];
    }

    saveNotices(updated);
    setShowModal(false);
    showToast("success", editId ? "Notice updated successfully!" : "Notice published successfully!");
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Notice",
      message: "Are you sure you want to delete this notice?",
    });
    if (!confirmed) return;
    const updated = notices.filter(n => n.id !== id);
    saveNotices(updated);
    showToast("success", "Notice deleted successfully!");
  };

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>School Notices</h3>
            <p>Broadcast updates and publish circulars to students, parents, or staff</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <FiPlus /> New Notice
          </button>
        </header>

        <div className="page">
          {/* Notice Board List */}
          <div className="card">
            <div className="card-header">
              <h3>Notice Feed ({notices.length})</h3>
            </div>

            {notices.length === 0 ? (
              <div className="empty-state">
                <p>No notices published yet. Click the button above to broadcast.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date / Time</th>
                      <th>Notice Title</th>
                      <th>Audience</th>
                      <th>Status</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map(notice => (
                      <tr key={notice.id}>
                        <td data-label="Date / Time">
                          <div><strong>{notice.date}</strong></div>
                          <small className="text-muted">{notice.time}</small>
                        </td>
                        <td data-label="Notice Title"><strong>{notice.title}</strong></td>
                        <td data-label="Audience">
                          <span className="badge badge-info">{notice.audience}</span>
                        </td>
                        <td data-label="Status">
                          <span className={`badge ${
                            notice.status === "Published" ? "badge-success" : 
                            notice.status === "Scheduled" ? "badge-warning" : "badge-outline"
                          }`}>
                            {notice.status}
                          </span>
                        </td>
                        <td data-label="Description" style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {notice.description || "-"}
                        </td>
                        <td data-label="Actions">
                          <div className="table-action">
                            <button className="btn btn-outline btn-sm" onClick={() => handleOpenEditModal(notice)}>
                              <FiEdit /> Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(notice.id)}>
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

      {/* Notice Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editId ? "Edit Notice details" : "Create Notice Announcement"}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="dashboard-form">
              <div className="form-group">
                <label>Notice Title *</label>
                <input type="text" placeholder="e.g. Science Laboratory Maintenance" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Audience Segment *</label>
                  <select value={audience} onChange={e => setAudience(e.target.value)} required>
                    <option value="All">All</option>
                    <option value="Students">Students</option>
                    <option value="Teachers">Teachers</option>
                    <option value="Parents">Parents</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} required>
                    <option value="Published">Published</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Draft">Draft</option>
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
                <label>Description / Notice Body</label>
                <textarea rows="5" placeholder="Detailed update details..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? "Update Notice" : "Publish Notice"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
