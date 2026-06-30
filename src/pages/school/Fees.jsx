import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

export default function Fees() {
  const { showToast, confirm } = useUI();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  // Form states
  const [editId, setEditId] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    const storedFees = JSON.parse(localStorage.getItem("school_fees") || "[]");
    const storedStudents = JSON.parse(localStorage.getItem("school_students") || "[]");
    const storedClasses = JSON.parse(localStorage.getItem("school_classes") || "[]");
    const storedSections = JSON.parse(localStorage.getItem("school_sections") || "[]");

    setFees(storedFees);
    setStudents(storedStudents);
    setClasses(storedClasses);
    setSections(storedSections);

    if (storedClasses.length > 0) {
      setClassFilter(storedClasses[0].name);
    }
  }, []);

  useEffect(() => {
    const matchedClass = classes.find(c => c.name === classFilter);
    if (matchedClass) {
      const classSections = sections.filter(s => s.classId === matchedClass.id);
      if (classSections.length > 0) {
        setSectionFilter(classSections[0].name);
      } else {
        setSectionFilter("");
      }
    } else {
      setSectionFilter("");
    }
  }, [classFilter, classes, sections]);

  const saveFees = (newFees) => {
    setFees(newFees);
    localStorage.setItem("school_fees", JSON.stringify(newFees));
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setStudentId("");
    setTotalFee("");
    setPaidAmount("");
    setDueDate(new Date().toISOString().split("T")[0]);
    setStatus("Pending");
    setShowModal(true);
  };

  const handleOpenEditModal = (feeRecord) => {
    setEditId(feeRecord.id);
    setStudentId(feeRecord.studentId);
    setTotalFee(String(feeRecord.totalFee));
    setPaidAmount(String(feeRecord.paidAmount || 0));
    setDueDate(feeRecord.dueDate);
    setStatus(feeRecord.status);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId || !totalFee || !dueDate || !status) {
      showToast("error", "Please fill all required fields");
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const total = Number(totalFee);
    const paid = Number(paidAmount || 0);
    const pending = total - paid;

    const feeRecord = {
      id: editId || "fee_" + Date.now(),
      studentId,
      studentName: student.name,
      className: student.className,
      section: student.section,
      totalFee: total,
      paidAmount: paid,
      pendingAmount: pending,
      dueDate,
      status
    };

    let updated;
    if (editId) {
      updated = fees.map(f => f.id === editId ? feeRecord : f);
    } else {
      updated = [feeRecord, ...fees];
    }

    saveFees(updated);
    setShowModal(false);
    showToast("success", editId ? "Fee record updated successfully!" : "Fee record created successfully!");
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Fee Entry",
      message: "Are you sure you want to delete this fee record?",
    });
    if (!confirmed) return;
    const updated = fees.filter(f => f.id !== id);
    saveFees(updated);
    showToast("success", "Fee record deleted successfully!");
  };

  // Filter students based on class & section
  const classStudents = students.filter(
    s => s.className === classFilter && s.section === sectionFilter
  );

  // Filter fee logs
  const filteredFees = fees.filter(
    f => f.className === classFilter && f.section === sectionFilter
  );

  // Calculate quick metrics for this class/section
  const collected = filteredFees.reduce((sum, item) => sum + item.paidAmount, 0);
  const pending = filteredFees.reduce((sum, item) => sum + item.pendingAmount, 0);
  const overdueCount = filteredFees.filter(f => f.status === "Overdue").length;

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Fees Management</h3>
            <p>Administer student fee records, invoices, and payments</p>
          </div>
          {classStudents.length > 0 && (
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <FiPlus /> Record Payment
            </button>
          )}
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
              <div className="card search-card grid-2">
                <div className="form-group">
                  <label>Class Filter</label>
                  <select value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section Filter</label>
                  <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                    {classes.find(c => c.name === classFilter) ? (
                      sections
                        .filter(s => s.classId === classes.find(c => c.name === classFilter).id)
                        .map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                    ) : (
                      <option value="">-- No Sections --</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Class Dues Metrics */}
              <div className="grid-3 mb-lg mt-md">
                <div className="card stat-card stat-card--green">
                  <p className="stat-card-label">Fees Collected (Current Filter)</p>
                  <h3 className="stat-card-value">₹{collected.toLocaleString("en-IN")}</h3>
                </div>
                <div className="card stat-card stat-card--red">
                  <p className="stat-card-label">Pending Dues (Current Filter)</p>
                  <h3 className="stat-card-value">₹{pending.toLocaleString("en-IN")}</h3>
                </div>
                <div className="card stat-card stat-card--amber">
                  <p className="stat-card-label">Overdue Records (Current Filter)</p>
                  <h3 className="stat-card-value">{overdueCount}</h3>
                </div>
              </div>

              {/* Fees Directory List */}
              <div className="card">
                <div className="card-header">
                  <h3>Fees Status: {classFilter} - {sectionFilter}</h3>
                </div>

                {filteredFees.length === 0 ? (
                  <div className="empty-state">
                    <p>No fee records entered for this class and section. Click "Record Payment" to get started.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Total Fee</th>
                          <th>Paid Amount</th>
                          <th>Pending Dues</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFees.map(fee => (
                          <tr key={fee.id}>
                            <td data-label="Student Name">{fee.studentName}</td>
                            <td data-label="Total Fee">₹{fee.totalFee.toLocaleString("en-IN")}</td>
                            <td data-label="Paid Amount" className="text-success">₹{fee.paidAmount.toLocaleString("en-IN")}</td>
                            <td data-label="Pending Dues" className="text-danger">₹{fee.pendingAmount.toLocaleString("en-IN")}</td>
                            <td data-label="Due Date">{fee.dueDate}</td>
                            <td data-label="Status">
                              <span className={`badge ${
                                fee.status === "Paid" ? "badge-success" : 
                                fee.status === "Pending" ? "badge-warning" : "badge-danger"
                              }`}>
                                {fee.status}
                              </span>
                            </td>
                            <td data-label="Actions">
                              <div className="table-action">
                                <button className="btn btn-outline btn-sm" onClick={() => handleOpenEditModal(fee)}>
                                  <FiEdit /> Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(fee.id)}>
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
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editId ? "Edit Fee Record" : "Add Fee Record"}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="dashboard-form">
              <div className="form-group">
                <label>Select Student *</label>
                <select value={studentId} onChange={e => setStudentId(e.target.value)} required disabled={!!editId}>
                  <option value="">-- Choose Student --</option>
                  {classStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Total Fee Amount (₹) *</label>
                  <input type="number" value={totalFee} onChange={e => setTotalFee(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Paid Amount (₹)</label>
                  <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Due Date *</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} required>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="form-actions mt-lg">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? "Update Record" : "Record Payment"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
