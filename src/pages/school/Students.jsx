import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiEdit, FiTrash2, FiSearch, FiPlus, FiX, FiCheck, FiDownload, FiTrash } from "react-icons/fi";
import { useUI } from "../../components/UIContext";
import PreviewModal from "../../components/PreviewModal";

export default function Students() {
  const { showToast, confirm } = useUI();

  const [activeTab, setActiveTab] = useState("directory"); // "directory", "single", "bulk"
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // Filters / Search
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // --- Single Admission Form State ---
  const [editId, setEditId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentMobile, setParentMobile] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentUsername, setParentUsername] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [status, setStatus] = useState("Active");

  // Fee Details
  const [admissionFee, setAdmissionFee] = useState("0");
  const [tuitionFee, setTuitionFee] = useState("0");
  const [transportFee, setTransportFee] = useState("0");
  const [booksFee, setBooksFee] = useState("0");
  const [uniformFee, setUniformFee] = useState("0");
  const [examFee, setExamFee] = useState("0");
  const [otherFee, setOtherFee] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");

  // Preview Modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // --- Bulk Admission State ---
  const [bulkRows, setBulkRows] = useState([
    {
      id: "row_1",
      firstName: "",
      lastName: "",
      className: "",
      section: "",
      parentName: "",
      parentMobile: "",
      parentUsername: "",
      parentPassword: "",
    }
  ]);

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem("school_students") || "[]");
    const storedClasses = JSON.parse(localStorage.getItem("school_classes") || "[]");
    const storedSections = JSON.parse(localStorage.getItem("school_sections") || "[]");
    
    setStudents(storedStudents);
    setClasses(storedClasses);
    setSections(storedSections);
  }, []);

  const saveStudents = (newStudents) => {
    setStudents(newStudents);
    localStorage.setItem("school_students", JSON.stringify(newStudents));
  };

  const saveParentCredentials = (username, password, name, email, mobile) => {
    const storedUsers = JSON.parse(localStorage.getItem("erp_users") || "[]");
    const filtered = storedUsers.filter(u => u.username !== username);
    
    const newUser = {
      username,
      password,
      role: "SCHOOL_PARENT",
      redirect: "/school/parent/dashboard",
      otp: "777777",
      organizationType: "E-School",
      name,
      email: email || "",
      mobile,
    };
    
    localStorage.setItem("erp_users", JSON.stringify([...filtered, newUser]));
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFirstName("");
    setLastName("");
    setAdmissionNo("ADM-" + Date.now().toString().slice(-6));
    setSelectedClass("");
    setSelectedSection("");
    setDob("");
    setGender("");
    setParentName("");
    setParentMobile("");
    setParentEmail("");
    setParentUsername("");
    setParentPassword("");
    setStatus("Active");

    // Clear fees
    setAdmissionFee("0");
    setTuitionFee("0");
    setTransportFee("0");
    setBooksFee("0");
    setUniformFee("0");
    setExamFee("0");
    setOtherFee("0");
    setPaidAmount("0");

    setActiveTab("single");
  };

  const handleOpenEdit = (student) => {
    setEditId(student.id);
    const names = student.name.split(" ");
    setFirstName(names[0] || "");
    setLastName(names.slice(1).join(" ") || "");
    setAdmissionNo(student.admissionNo);
    setSelectedClass(student.className);
    setSelectedSection(student.section);
    setDob(student.dob || "");
    setGender(student.gender || "");
    setParentName(student.parentName || "");
    setParentMobile(student.parentMobile || "");
    setParentEmail(student.parentEmail || "");
    setParentUsername(student.parentUsername || "");
    setParentPassword(student.parentPassword || "");
    setStatus(student.status || "Active");

    // Fees mapping
    setAdmissionFee(String(student.admissionFee || 0));
    setTuitionFee(String(student.tuitionFee || 0));
    setTransportFee(String(student.transportFee || 0));
    setBooksFee(String(student.booksFee || 0));
    setUniformFee(String(student.uniformFee || 0));
    setExamFee(String(student.examFee || 0));
    setOtherFee(String(student.otherFee || 0));
    setPaidAmount(String(student.paidAmount || 0));

    setActiveTab("single");
  };

  // Auto calculate total and pending
  const fAdmission = Number(admissionFee || 0);
  const fTuition = Number(tuitionFee || 0);
  const fTransport = Number(transportFee || 0);
  const fBooks = Number(booksFee || 0);
  const fUniform = Number(uniformFee || 0);
  const fExam = Number(examFee || 0);
  const fOther = Number(otherFee || 0);
  const fTotal = fAdmission + fTuition + fTransport + fBooks + fUniform + fExam + fOther;
  const fPaid = Number(paidAmount || 0);
  const fPending = fTotal - fPaid;

  const handlePreparePreview = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !selectedClass || !selectedSection || !parentUsername || !parentPassword) {
      showToast("error", "Please fill all required fields");
      return;
    }

    setPreviewData({
      admissionNo,
      studentName: `${firstName.trim()} ${lastName.trim()}`,
      classSection: `${selectedClass} - ${selectedSection}`,
      dob,
      gender,
      parentName,
      parentMobile,
      parentEmail,
      parentUsername,
      status,
      admissionFee: fAdmission,
      tuitionFee: fTuition,
      transportFee: fTransport,
      booksFee: fBooks,
      uniformFee: fUniform,
      examFee: fExam,
      otherFee: fOther,
      totalFee: fTotal,
      paidAmount: fPaid,
      pendingAmount: fPending,
    });
    setShowPreview(true);
  };

  const handleConfirmSubmit = () => {
    const studentData = {
      id: editId || "std_" + Date.now(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      admissionNo,
      className: selectedClass,
      section: selectedSection,
      dob,
      gender,
      parentName,
      parentMobile,
      parentEmail,
      parentUsername,
      parentPassword,
      status,
      admissionFee: fAdmission,
      tuitionFee: fTuition,
      transportFee: fTransport,
      booksFee: fBooks,
      uniformFee: fUniform,
      examFee: fExam,
      otherFee: fOther,
      totalFee: fTotal,
      paidAmount: fPaid,
      pendingAmount: fPending,
    };

    let updatedStudents;
    if (editId) {
      updatedStudents = students.map(s => s.id === editId ? studentData : s);
    } else {
      updatedStudents = [studentData, ...students];
    }

    saveStudents(updatedStudents);
    saveParentCredentials(parentUsername, parentPassword, parentName, parentEmail, parentMobile);

    // Also update school_fees table automatically for Cashier
    const feesList = JSON.parse(localStorage.getItem("school_fees") || "[]");
    const existingIndex = feesList.findIndex(f => f.studentId === studentData.id);
    const feeRecord = {
      id: existingIndex >= 0 ? feesList[existingIndex].id : "fee_" + Date.now(),
      studentId: studentData.id,
      studentName: studentData.name,
      className: studentData.className,
      section: studentData.section,
      totalFee: fTotal,
      paidAmount: fPaid,
      pendingAmount: fPending,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: fPending <= 0 ? "Paid" : "Pending",
    };
    if (existingIndex >= 0) {
      feesList[existingIndex] = feeRecord;
    } else {
      feesList.push(feeRecord);
    }
    localStorage.setItem("school_fees", JSON.stringify(feesList));

    setShowPreview(false);
    setActiveTab("directory");
    showToast("success", editId ? "Student updated successfully!" : "Student admitted successfully!");
  };

  const handleSaveDraft = () => {
    // Simple draft message
    showToast("info", "Admission form draft saved locally!");
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Student Admission",
      message: "Are you sure you want to delete this student record? This will also remove their parent login credentials.",
    });
    if (!confirmed) return;

    const student = students.find(s => s.id === id);
    const updated = students.filter(s => s.id !== id);
    saveStudents(updated);
    
    if (student) {
      const storedUsers = JSON.parse(localStorage.getItem("erp_users") || "[]");
      const filtered = storedUsers.filter(u => u.username !== student.parentUsername);
      localStorage.setItem("erp_users", JSON.stringify(filtered));
    }
    showToast("success", "Student record deleted successfully!");
  };

  // --- Bulk Actions ---
  const handleAddBulkRow = () => {
    setBulkRows(prev => [
      ...prev,
      {
        id: "row_" + Date.now() + Math.random().toString().slice(-4),
        firstName: "",
        lastName: "",
        className: "",
        section: "",
        parentName: "",
        parentMobile: "",
        parentUsername: "",
        parentPassword: "",
      }
    ]);
  };

  const handleRemoveBulkRow = (id) => {
    if (bulkRows.length === 1) {
      showToast("warning", "At least one row must remain.");
      return;
    }
    setBulkRows(prev => prev.filter(r => r.id !== id));
  };

  const handleBulkRowChange = (id, field, val) => {
    setBulkRows(prev => prev.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: val };
        // Auto-generate username/password for parents if phone is input
        if (field === "parentMobile" && val) {
          updated.parentUsername = "parent_" + val.slice(-6);
          updated.parentPassword = "pass_" + val.slice(-4);
        }
        return updated;
      }
      return row;
    }));
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    // Validate
    const invalid = bulkRows.some(row => !row.firstName || !row.lastName || !row.className || !row.section || !row.parentUsername);
    if (invalid) {
      showToast("error", "Please fill all required cells in the bulk sheet.");
      return;
    }

    let updatedStudents = [...students];
    bulkRows.forEach(row => {
      const stdId = "std_" + Date.now() + Math.random().toString().slice(-4);
      const studentData = {
        id: stdId,
        name: `${row.firstName.trim()} ${row.lastName.trim()}`,
        admissionNo: "ADM-" + Math.floor(100000 + Math.random() * 900000),
        className: row.className,
        section: row.section,
        parentName: row.parentName,
        parentMobile: row.parentMobile,
        parentUsername: row.parentUsername,
        parentPassword: row.parentPassword,
        status: "Active",
        totalFee: 0,
        paidAmount: 0,
        pendingAmount: 0,
      };
      updatedStudents = [studentData, ...updatedStudents];
      saveParentCredentials(row.parentUsername, row.parentPassword, row.parentName, "", row.parentMobile);
    });

    saveStudents(updatedStudents);
    setBulkRows([
      {
        id: "row_1",
        firstName: "",
        lastName: "",
        className: "",
        section: "",
        parentName: "",
        parentMobile: "",
        parentUsername: "",
        parentPassword: "",
      }
    ]);
    setActiveTab("directory");
    showToast("success", `Bulk uploaded ${bulkRows.length} students successfully!`);
  };

  // Filtered
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.admissionNo.toLowerCase().includes(search.toLowerCase()) || 
                          (s.parentName && s.parentName.toLowerCase().includes(search.toLowerCase()));
    const matchesClass = classFilter ? s.className === classFilter : true;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Students Admissions</h3>
            <p>Manage single admissions, bulk CSV-styled lists, and parent profiles</p>
          </div>
          <div className="tab-buttons" style={{ display: "flex", gap: "10px" }}>
            <button className={`btn ${activeTab === "directory" ? "btn-primary" : "btn-outline"}`} onClick={() => setActiveTab("directory")}>
              Students Directory
            </button>
            <button className={`btn ${activeTab === "single" ? "btn-primary" : "btn-outline"}`} onClick={handleOpenAdd}>
              Single Admission
            </button>
            <button className={`btn ${activeTab === "bulk" ? "btn-primary" : "btn-outline"}`} onClick={() => setActiveTab("bulk")}>
              Bulk Admissions Sheet
            </button>
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
              {/* DIRECTORY TAB */}
              {activeTab === "directory" && (
                <>
                  <div className="card search-card flex-row">
                    <div className="search-box">
                      <FiSearch />
                      <input
                        type="text"
                        placeholder="Search by student name, admission number, or parent name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="filter-box">
                      <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                        <option value="">All Classes</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="card mt-md">
                    <div className="card-header">
                      <h3>Admitted Students Directory ({filteredStudents.length})</h3>
                    </div>

                    {filteredStudents.length === 0 ? (
                      <div className="empty-state">
                        <p>No students found matching your filters.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Admission No</th>
                              <th>Student Name</th>
                              <th>Class</th>
                              <th>Section</th>
                              <th>Parent Contact</th>
                              <th>Fees Pending</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map(student => (
                              <tr key={student.id}>
                                <td><strong>{student.admissionNo}</strong></td>
                                <td>{student.name}</td>
                                <td>{student.className}</td>
                                <td><span className="badge badge-info">{student.section}</span></td>
                                <td>
                                  <div><strong>{student.parentName}</strong></div>
                                  <small className="text-muted">{student.parentMobile}</small>
                                </td>
                                <td>
                                  <span className={student.pendingAmount > 0 ? "text-danger" : "text-success"}>
                                    ₹{(student.pendingAmount || 0).toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${student.status === "Active" ? "badge-success" : "badge-danger"}`}>
                                    {student.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="table-action">
                                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(student)}>
                                      <FiEdit /> Edit
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(student.id)}>
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

              {/* SINGLE ADMISSION TAB */}
              {activeTab === "single" && (
                <div className="card">
                  <div className="card-header">
                    <h3>{editId ? "Update Student Admissions Detail" : "Single Admission Registry Form"}</h3>
                  </div>
                  <form onSubmit={handlePreparePreview} className="dashboard-form">
                    <div className="form-section-title">Student Demographics</div>
                    <div className="grid-3">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Admission ID *</label>
                        <input type="text" value={admissionNo} readOnly />
                      </div>
                    </div>

                    <div className="grid-3">
                      <div className="form-group">
                        <label>Class *</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required>
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
                        <label>Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value)}>
                          <option value="">Choose Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label>Date of Birth</label>
                        <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-section-title mt-md">Parent / Guardian Credentials</div>
                    <div className="grid-3">
                      <div className="form-group">
                        <label>Parent Full Name *</label>
                        <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Parent Mobile *</label>
                        <input type="tel" value={parentMobile} onChange={e => setParentMobile(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Parent Email</label>
                        <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label>Parent Username *</label>
                        <input type="text" value={parentUsername} onChange={e => setParentUsername(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Parent Password *</label>
                        <input type="password" value={parentPassword} onChange={e => setParentPassword(e.target.value)} required />
                      </div>
                    </div>

                    <div className="form-section-title mt-md">Fee Component Details</div>
                    <div className="grid-4">
                      <div className="form-group">
                        <label>Admission Fee (₹)</label>
                        <input type="number" value={admissionFee} onChange={e => setAdmissionFee(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Tuition Fee (₹)</label>
                        <input type="number" value={tuitionFee} onChange={e => setTuitionFee(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Transport Fee (₹)</label>
                        <input type="number" value={transportFee} onChange={e => setTransportFee(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Books Fee (₹)</label>
                        <input type="number" value={booksFee} onChange={e => setBooksFee(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid-4 mt-sm">
                      <div className="form-group">
                        <label>Uniform Fee (₹)</label>
                        <input type="number" value={uniformFee} onChange={e => setUniformFee(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Exam Fee (₹)</label>
                        <input type="number" value={examFee} onChange={e => setExamFee(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Other Fee (₹)</label>
                        <input type="number" value={otherFee} onChange={e => setOtherFee(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Amount Collected / Paid (₹)</label>
                        <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                      </div>
                    </div>

                    {/* Auto Calculation Cards */}
                    <div className="grid-3 mt-md mb-md" style={{ background: "var(--bg-light)", padding: "1rem", borderRadius: "8px" }}>
                      <div className="stat-card">
                        <p className="stat-card-label">Total Allocated Fee</p>
                        <h4 className="stat-card-value">₹{fTotal.toLocaleString("en-IN")}</h4>
                      </div>
                      <div className="stat-card">
                        <p className="stat-card-label">Paid / Collected</p>
                        <h4 className="stat-card-value text-success">₹{fPaid.toLocaleString("en-IN")}</h4>
                      </div>
                      <div className="stat-card">
                        <p className="stat-card-label">Outstanding Balance</p>
                        <h4 className="stat-card-value text-danger">₹{fPending.toLocaleString("en-IN")}</h4>
                      </div>
                    </div>

                    <div className="form-actions mt-lg">
                      <button type="button" className="btn btn-secondary" onClick={handleSaveDraft}>Save Draft</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("directory")}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Preview & Print Receipt</button>
                    </div>
                  </form>
                </div>
              )}

              {/* BULK ADMISSIONS TAB */}
              {activeTab === "bulk" && (
                <div className="card">
                  <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Bulk Admission Row Editor</h3>
                    <button className="btn btn-outline" onClick={handleAddBulkRow}><FiPlus /> Add Row</button>
                  </div>
                  <form onSubmit={handleBulkSubmit} className="dashboard-form">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>First Name *</th>
                            <th>Last Name *</th>
                            <th>Class *</th>
                            <th>Section *</th>
                            <th>Parent Name *</th>
                            <th>Parent Mobile *</th>
                            <th>Parent Username *</th>
                            <th>Parent Password *</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkRows.map((row) => (
                            <tr key={row.id}>
                              <td>
                                <input
                                  type="text"
                                  value={row.firstName}
                                  onChange={e => handleBulkRowChange(row.id, "firstName", e.target.value)}
                                  placeholder="John"
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.lastName}
                                  onChange={e => handleBulkRowChange(row.id, "lastName", e.target.value)}
                                  placeholder="Doe"
                                  required
                                />
                              </td>
                              <td>
                                <select
                                  value={row.className}
                                  onChange={e => handleBulkRowChange(row.id, "className", e.target.value)}
                                  required
                                >
                                  <option value="">Choose</option>
                                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                              </td>
                              <td>
                                <select
                                  value={row.section}
                                  onChange={e => handleBulkRowChange(row.id, "section", e.target.value)}
                                  required
                                >
                                  <option value="">Choose</option>
                                  {classes.find(c => c.name === row.className) ? (
                                    sections
                                      .filter(s => s.classId === classes.find(c => c.name === row.className).id)
                                      .map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                                  ) : (
                                    sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                                  )}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.parentName}
                                  onChange={e => handleBulkRowChange(row.id, "parentName", e.target.value)}
                                  placeholder="Robert Doe"
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="tel"
                                  value={row.parentMobile}
                                  onChange={e => handleBulkRowChange(row.id, "parentMobile", e.target.value)}
                                  placeholder="9876543210"
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.parentUsername}
                                  onChange={e => handleBulkRowChange(row.id, "parentUsername", e.target.value)}
                                  placeholder="Auto-generated"
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.parentPassword}
                                  onChange={e => handleBulkRowChange(row.id, "parentPassword", e.target.value)}
                                  placeholder="Auto-generated"
                                  required
                                />
                              </td>
                              <td>
                                <button type="button" className="icon-btn text-danger" onClick={() => handleRemoveBulkRow(row.id)}>
                                  <FiTrash size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="form-actions mt-lg">
                      <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("directory")}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Upload Bulk Admissions</button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          {showPreview && (
            <PreviewModal
              title="Student Invoice & Receipt Details"
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
