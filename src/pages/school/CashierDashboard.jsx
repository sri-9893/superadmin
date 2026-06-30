import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiDollarSign, FiSearch, FiPrinter, FiPlus } from "react-icons/fi";
import { useUI } from "../../components/UIContext";
import PreviewModal from "../../components/PreviewModal";

export default function CashierDashboard() {
  const navigate = useNavigate();
  const { showToast, confirm } = useUI();
  const [username, setUsername] = useState("");
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Fee collection form states
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [totalFee, setTotalFee] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  // Preview Modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("username") || sessionStorage.getItem("username");
    setUsername(user || "Cashier");

    const studentsList = JSON.parse(localStorage.getItem("school_students") || "[]");
    const feesList = JSON.parse(localStorage.getItem("school_fees") || "[]");
    setStudents(studentsList);
    setFees(feesList);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("tempUser");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleOpenCollect = (student) => {
    // Check if student already has a fee record
    const existing = fees.find((f) => f.studentId === student.id);
    setSelectedStudent(student);
    if (existing) {
      setTotalFee(existing.totalFee);
      setPaidAmount(existing.paidAmount);
      setDueDate(existing.dueDate);
      setPaymentStatus(existing.status);
    } else {
      setTotalFee("");
      setPaidAmount("");
      setDueDate(new Date().toISOString().split("T")[0]);
      setPaymentStatus("Pending");
    }
    setShowCollectModal(true);
  };

  const handlePreparePreview = (e) => {
    e.preventDefault();
    if (!totalFee || !dueDate) {
      showToast("error", "Please fill all required fields");
      return;
    }

    const total = Number(totalFee);
    const paid = Number(paidAmount || 0);
    const pending = total - paid;

    setPreviewData({
      studentName: selectedStudent.name,
      admissionNo: selectedStudent.admissionNo,
      className: selectedStudent.className,
      section: selectedStudent.section,
      totalFee: total,
      paidAmount: paid,
      pendingAmount: pending,
      dueDate: dueDate,
      status: paymentStatus,
    });
    setShowPreview(true);
  };

  const handleConfirmSubmit = () => {
    const total = Number(totalFee);
    const paid = Number(paidAmount || 0);
    const pending = total - paid;

    const existingIndex = fees.findIndex((f) => f.studentId === selectedStudent.id);
    let updatedFees = [...fees];

    const record = {
      id: existingIndex >= 0 ? fees[existingIndex].id : "fee_" + Date.now(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      className: selectedStudent.className,
      section: selectedStudent.section,
      totalFee: total,
      paidAmount: paid,
      pendingAmount: pending,
      dueDate,
      status: paymentStatus,
    };

    if (existingIndex >= 0) {
      updatedFees[existingIndex] = record;
    } else {
      updatedFees = [record, ...updatedFees];
    }

    setFees(updatedFees);
    localStorage.setItem("school_fees", JSON.stringify(updatedFees));
    
    // Increment daily collection log if this was a new payment
    const dailyCollection = JSON.parse(localStorage.getItem("daily_collections") || "[]");
    dailyCollection.push({
      date: new Date().toISOString().split("T")[0],
      amount: paid,
      studentName: selectedStudent.name,
      admissionNo: selectedStudent.admissionNo
    });
    localStorage.setItem("daily_collections", JSON.stringify(dailyCollection));

    setShowPreview(false);
    setShowCollectModal(false);
    showToast("success", "Fee collected successfully!");
  };

  // Metrics
  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce((sum, f) => sum + f.pendingAmount, 0);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = JSON.parse(localStorage.getItem("daily_collections") || "[]")
    .filter((log) => log.date === todayStr);
  const todayCollection = todayLogs.reduce((sum, log) => sum + log.amount, 0);

  // Search filter
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout parent-portal">
      <div className="teacher-topbar">
        <div className="teacher-profile-summary">
          <span className="teacher-avatar">💰</span>
          <div>
            <h3>Cashier Workspace: {username}</h3>
            <p>School Accounts & Fee Management</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="main-content" style={{ marginLeft: 0, width: "100%", padding: "1.5rem" }}>
        <div className="page">
          {/* Metrics */}
          <div className="grid-3 mb-lg">
            <div className="card stat-card stat-card--green">
              <p className="stat-card-label">Daily Collection (Today)</p>
              <h3 className="stat-card-value">₹{todayCollection.toLocaleString("en-IN")}</h3>
            </div>
            <div className="card stat-card stat-card--blue">
              <p className="stat-card-label">Total Fees Collected</p>
              <h3 className="stat-card-value">₹{totalCollected.toLocaleString("en-IN")}</h3>
            </div>
            <div className="card stat-card stat-card--red">
              <p className="stat-card-label">Total Outstanding Dues</p>
              <h3 className="stat-card-value text-danger">₹{totalPending.toLocaleString("en-IN")}</h3>
            </div>
          </div>

          <div className="grid-2">
            {/* Student Search & Fee Collection */}
            <div className="card">
              <div className="card-header">
                <h3>Search Student & Record Fee</h3>
              </div>
              <div className="search-box mb-md">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search by student name or admission number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {searchQuery && (
                <div className="table-responsive" style={{ maxHeight: "300px" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Admission No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.slice(0, 5).map((s) => (
                        <tr key={s.id}>
                          <td>{s.admissionNo}</td>
                          <td>{s.name}</td>
                          <td>{s.className} - {s.section}</td>
                          <td>
                            <button className="btn btn-primary btn-sm" onClick={() => handleOpenCollect(s)}>
                              Collect Fee
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan="4" className="empty-state">No students found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Daily Collections Logs */}
            <div className="card">
              <div className="card-header">
                <h3>Recent Fees Collected Today ({todayLogs.length})</h3>
              </div>
              {todayLogs.length === 0 ? (
                <div className="empty-state">
                  <p>No fee payments received today yet.</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: "300px" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Admission No</th>
                        <th>Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td>{log.studentName}</td>
                          <td>{log.admissionNo}</td>
                          <td className="text-success">₹{log.amount.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Master Dues Directory */}
          <div className="card mt-lg">
            <div className="card-header">
              <h3>Outstanding Student Dues Directory</h3>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Admission No</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Total Invoice</th>
                    <th>Amount Paid</th>
                    <th>Pending Dues</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees
                    .filter((f) => f.pendingAmount > 0)
                    .map((f) => (
                      <tr key={f.id}>
                        <td><strong>{f.admissionNo || "N/A"}</strong></td>
                        <td>{f.studentName}</td>
                        <td>{f.className} - {f.section}</td>
                        <td>₹{f.totalFee.toLocaleString("en-IN")}</td>
                        <td className="text-success">₹{f.paidAmount.toLocaleString("en-IN")}</td>
                        <td className="text-danger">₹{f.pendingAmount.toLocaleString("en-IN")}</td>
                        <td>
                          <span className={`badge ${f.status === "Overdue" ? "badge-danger" : "badge-warning"}`}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {fees.filter((f) => f.pendingAmount > 0).length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-state">No pending dues across the institution!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Collect Fee Modal */}
      {showCollectModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Record Fee Payment: {selectedStudent?.name}</h3>
              <button className="icon-btn" onClick={() => setShowCollectModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handlePreparePreview} className="dashboard-form">
              <div className="form-group">
                <label>Total Fee Amount (₹) *</label>
                <input
                  type="number"
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount Paid (₹)</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="form-actions mt-lg">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCollectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Preview Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal before save */}
      {showPreview && (
        <PreviewModal
          title="Fee Payment Receipt Preview"
          data={previewData}
          onClose={() => setShowPreview(false)}
          onSubmit={handleConfirmSubmit}
        />
      )}
    </div>
  );
}
