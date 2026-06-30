import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import SchoolSidebar from "../../components/SchoolSidebar";
import { useUI } from "../../components/UIContext";
import PreviewModal from "../../components/PreviewModal";

const SUBJECTS_LIST = [
  "Telugu",
  "Hindi",
  "English",
  "Maths",
  "Science",
  "Social",
  "Computer",
  "Physics",
  "Chemistry",
  "Biology"
];

export default function Teachers() {
  const { showToast, confirm } = useUI();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  // Teacher Form State
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectsChecked, setSubjectsChecked] = useState([]);
  const [isClassIncharge, setIsClassIncharge] = useState(false);
  const [inchargeClass, setInchargeClass] = useState("");
  const [inchargeSection, setInchargeSection] = useState("");
  const [assignedClass, setAssignedClass] = useState("");
  const [assignedSection, setAssignedSection] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    const storedTeachers = JSON.parse(localStorage.getItem("school_teachers") || "[]");
    const storedClasses = JSON.parse(localStorage.getItem("school_classes") || "[]");
    const storedSections = JSON.parse(localStorage.getItem("school_sections") || "[]");
    
    setTeachers(storedTeachers);
    setClasses(storedClasses);
    setSections(storedSections);
  }, []);

  const saveTeachers = (newTeachers) => {
    setTeachers(newTeachers);
    localStorage.setItem("school_teachers", JSON.stringify(newTeachers));
  };

  const saveTeacherCredentials = (username, password, name, email, mobile, inchargeActive) => {
    const storedUsers = JSON.parse(localStorage.getItem("erp_users") || "[]");
    const filtered = storedUsers.filter(u => u.username !== username);
    
    const newUser = {
      username,
      password,
      role: inchargeActive ? "SCHOOL_CLASS_INCHARGE" : "SCHOOL_TEACHER",
      redirect: inchargeActive ? "/school/incharge/dashboard" : "/school/teacher/dashboard",
      otp: "777777",
      organizationType: "E-School",
      name,
      email,
      mobile
    };
    
    localStorage.setItem("erp_users", JSON.stringify([...filtered, newUser]));
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setEmployeeId("EMP-" + Date.now().toString().slice(-6));
    setName("");
    setSubject("");
    setSubjectsChecked([]);
    setIsClassIncharge(false);
    setInchargeClass("");
    setInchargeSection("");
    setAssignedClass("");
    setAssignedSection("");
    setMobile("");
    setEmail("");
    setUsername("");
    setPassword("");
    setStatus("Active");
    setShowModal(true);
  };

  const handleOpenEditModal = (teacher) => {
    setEditId(teacher.id);
    setEmployeeId(teacher.employeeId || "");
    setName(teacher.name || "");
    setSubject(teacher.subject || "");
    setSubjectsChecked(teacher.subjectsChecked || []);
    setIsClassIncharge(teacher.isClassIncharge || false);
    setInchargeClass(teacher.inchargeClass || "");
    setInchargeSection(teacher.inchargeSection || "");
    setAssignedClass(teacher.assignedClass || "");
    setAssignedSection(teacher.assignedSection || "");
    setMobile(teacher.mobile || "");
    setEmail(teacher.email || "");
    setUsername(teacher.username || "");
    setPassword(teacher.password || "");
    setStatus(teacher.status || "Active");
    setShowModal(true);
  };

  const handleSubjectCheckboxChange = (subj) => {
    if (subjectsChecked.includes(subj)) {
      setSubjectsChecked(prev => prev.filter(s => s !== subj));
    } else {
      setSubjectsChecked(prev => [...prev, subj]);
    }
  };

  const handlePreparePreview = (e) => {
    e.preventDefault();
    if (!name || !assignedClass || !assignedSection || !username || !password) {
      showToast("error", "Please fill all required fields");
      return;
    }

    const previewObj = {
      employeeId,
      name: name.trim(),
      subjects: subjectsChecked.join(", ") || subject,
      assignedClass,
      assignedSection,
      mobile,
      email,
      username,
      status,
      isClassIncharge: isClassIncharge ? "Yes" : "No",
      inchargeClass: isClassIncharge ? inchargeClass : "-",
      inchargeSection: isClassIncharge ? inchargeSection : "-"
    };

    setPreviewData(previewObj);
    setShowPreview(true);
  };

  const handleConfirmSubmit = () => {
    const teacherData = {
      id: editId || "tch_" + Date.now(),
      employeeId,
      name: name.trim(),
      subject: subjectsChecked.join(", ") || subject.trim(),
      subjectsChecked,
      isClassIncharge,
      inchargeClass: isClassIncharge ? inchargeClass : "",
      inchargeSection: isClassIncharge ? inchargeSection : "",
      assignedClass,
      assignedSection,
      mobile,
      email,
      username,
      password,
      status
    };

    let updatedTeachers;
    if (editId) {
      updatedTeachers = teachers.map(t => t.id === editId ? teacherData : t);
    } else {
      updatedTeachers = [teacherData, ...teachers];
    }

    saveTeachers(updatedTeachers);
    saveTeacherCredentials(username, password, name, email, mobile, isClassIncharge);
    setShowPreview(false);
    setShowModal(false);
    showToast("success", editId ? "Teacher updated successfully!" : "Teacher saved successfully!");
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Teacher",
      message: "Are you sure you want to delete this teacher record?",
    });
    if (!confirmed) return;

    const teacher = teachers.find(t => t.id === id);
    const updated = teachers.filter(t => t.id !== id);
    saveTeachers(updated);
    
    if (teacher) {
      const storedUsers = JSON.parse(localStorage.getItem("erp_users") || "[]");
      const filtered = storedUsers.filter(u => u.username !== teacher.username);
      localStorage.setItem("erp_users", JSON.stringify(filtered));
    }
    showToast("success", "Teacher record deleted successfully!");
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.subject.toLowerCase().includes(search.toLowerCase()) || 
                          (t.employeeId && t.employeeId.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Teachers Management</h3>
            <p>Onboard and manage teacher roles and department schedules</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <FiPlus /> Add Teacher
          </button>
        </header>

        <div className="page">
          {classes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <p>Please add classes and sections first before managing teachers.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="card search-card">
                <div className="search-box">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search teachers by name, subject, or employee ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Teachers Table */}
              <div className="card mt-md">
                <div className="card-header">
                  <h3>Active Faculty ({filteredTeachers.length})</h3>
                </div>

                {filteredTeachers.length === 0 ? (
                  <div className="empty-state">
                    <p>No teachers found.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Employee ID</th>
                          <th>Teacher Name</th>
                          <th>Subject</th>
                          <th>Class Section</th>
                          <th>Incharge Role</th>
                          <th>Mobile</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.map(teacher => (
                          <tr key={teacher.id}>
                            <td data-label="Employee ID"><strong>{teacher.employeeId}</strong></td>
                            <td data-label="Teacher Name">{teacher.name}</td>
                            <td data-label="Subject">{teacher.subject || "-"}</td>
                            <td data-label="Class Section">
                              <span className="badge badge-info">{teacher.assignedClass} - {teacher.assignedSection}</span>
                            </td>
                            <td data-label="Incharge Role">
                              {teacher.isClassIncharge ? (
                                <span className="badge badge-success">
                                  Incharge ({teacher.inchargeClass} - {teacher.inchargeSection})
                                </span>
                              ) : (
                                <span className="badge badge-outline">-</span>
                              )}
                            </td>
                            <td data-label="Mobile">{teacher.mobile || "-"}</td>
                            <td data-label="Status">
                              <span className={`badge ${teacher.status === "Active" ? "badge-success" : "badge-danger"}`}>
                                {teacher.status}
                              </span>
                            </td>
                            <td data-label="Actions">
                              <div className="table-action">
                                <button className="btn btn-outline btn-sm" onClick={() => handleOpenEditModal(teacher)}>
                                  <FiEdit /> Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(teacher.id)}>
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

          {/* Teacher Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-card" style={{ width: "650px" }}>
                <div className="modal-header">
                  <h3>{editId ? "Edit Staff Details" : "Add New Teacher"}</h3>
                  <button className="icon-btn" onClick={() => setShowModal(false)}><FiX size={20} /></button>
                </div>
                <form onSubmit={handlePreparePreview} className="dashboard-form">
                  <div className="form-section-title">Personal & Role Details</div>
                  <div className="grid-3">
                    <div className="form-group">
                      <label>Teacher Full Name *</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Employee ID *</label>
                      <input type="text" value={employeeId} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group mt-md">
                    <label>Subjects Taught</label>
                    <div className="subjects-checkbox-grid">
                      {SUBJECTS_LIST.map((subj) => (
                        <label key={subj} className="subject-checkbox-label">
                          <input
                            type="checkbox"
                            checked={subjectsChecked.includes(subj)}
                            onChange={() => handleSubjectCheckboxChange(subj)}
                          />
                          {subj}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid-2 mt-md">
                    <div className="form-group">
                      <label>Primary Assigned Class *</label>
                      <select value={assignedClass} onChange={e => setAssignedClass(e.target.value)} required>
                        <option value="">Select Class</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Primary Assigned Section *</label>
                      <select value={assignedSection} onChange={e => setAssignedSection(e.target.value)} required>
                        <option value="">Select Section</option>
                        {classes.find(c => c.name === assignedClass) ? (
                          sections
                            .filter(s => s.classId === classes.find(c => c.name === assignedClass).id)
                            .map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                        ) : (
                          sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="form-section-title mt-md">Class Incharge Settings</div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                    <input
                      type="checkbox"
                      id="isClassIncharge"
                      checked={isClassIncharge}
                      onChange={e => setIsClassIncharge(e.target.checked)}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                    <label htmlFor="isClassIncharge" style={{ fontWeight: "700", cursor: "pointer" }}>
                      Is Class Incharge (SCHOOL_CLASS_INCHARGE)
                    </label>
                  </div>

                  {isClassIncharge && (
                    <div className="grid-2">
                      <div className="form-group">
                        <label>Incharge Class *</label>
                        <select value={inchargeClass} onChange={e => setInchargeClass(e.target.value)} required>
                          <option value="">Select Class</option>
                          {classes.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Incharge Section *</label>
                        <select value={inchargeSection} onChange={e => setInchargeSection(e.target.value)} required>
                          <option value="">Select Section</option>
                          {classes.find(c => c.name === inchargeClass) ? (
                            sections
                              .filter(s => s.classId === classes.find(c => c.name === inchargeClass).id)
                              .map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                          ) : (
                            sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid-2 mt-md">
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-section-title mt-md">Login Credentials</div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Username *</label>
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Password *</label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-actions mt-lg">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editId ? "Update Teacher" : "Save Teacher"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showPreview && (
            <PreviewModal
              title="Teacher Details Preview"
              data={previewData}
              onClose={() => setShowPreview(false)}
              onSubmit={handleConfirmSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
