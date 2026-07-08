import React, { useEffect, useMemo, useState } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiSearch, FiPrinter, FiPlus, FiX } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

const paymentModes = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];

export default function Fees() {
  const { showToast, confirm } = useUI();

  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [feeAssignments, setFeeAssignments] = useState([]);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const [selectedFee, setSelectedFee] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  const [structureName, setStructureName] = useState("");
  const [structureClass, setStructureClass] = useState("");
  const [structureYear, setStructureYear] = useState("2026-2027");
  const [admissionAmount, setAdmissionAmount] = useState("");
  const [tuitionAmount, setTuitionAmount] = useState("");
  const [transportAmount, setTransportAmount] = useState("");
  const [examAmount, setExamAmount] = useState("");
  const [otherAmount, setOtherAmount] = useState("");

  const [selectedStructureId, setSelectedStructureId] = useState("");
  const [assignTo, setAssignTo] = useState("class");
  const [assignClass, setAssignClass] = useState("");
  const [assignSection, setAssignSection] = useState("");
  const [assignStudentId, setAssignStudentId] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");

  const [payAmount, setPayAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [transactionNo, setTransactionNo] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("school_students") || "[]"));
    setFees(JSON.parse(localStorage.getItem("school_fees") || "[]"));
    setReceipts(JSON.parse(localStorage.getItem("school_fee_receipts") || "[]"));
    setFeeAssignments(
      JSON.parse(localStorage.getItem("school_fee_assignments") || "[]")
    );
  }, []);

  const saveFees = (data) => {
    setFees(data);
    localStorage.setItem("school_fees", JSON.stringify(data));
  };

  const saveReceipts = (data) => {
    setReceipts(data);
    localStorage.setItem("school_fee_receipts", JSON.stringify(data));
  };

  const saveAssignments = (data) => {
    setFeeAssignments(data);
    localStorage.setItem("school_fee_assignments", JSON.stringify(data));
  };

  const classes = [...new Set(students.map((s) => s.className).filter(Boolean))];

  const sectionsByClass = [
    ...new Set(
      students
        .filter((s) => s.className === assignClass)
        .map((s) => s.section)
        .filter(Boolean)
    ),
  ];

  const filteredFees = fees.filter((fee) => {
    const text = search.toLowerCase();

    const matchesSearch =
      (fee.studentName || "").toLowerCase().includes(text) ||
      (fee.admissionNo || "").toLowerCase().includes(text) ||
      (fee.parentName || "").toLowerCase().includes(text) ||
      (fee.parentMobile || "").toLowerCase().includes(text);

    const matchesClass = classFilter ? fee.className === classFilter : true;
    const matchesStatus =
      statusFilter === "All" ? true : fee.status === statusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const stats = useMemo(() => {
    const totalFee = fees.reduce((sum, f) => sum + Number(f.totalFee || 0), 0);
    const collected = fees.reduce(
      (sum, f) => sum + Number(f.paidAmount || 0),
      0
    );
    const pending = fees.reduce(
      (sum, f) => sum + Number(f.pendingAmount || 0),
      0
    );

    const today = new Date().toISOString().split("T")[0];
    const todayCollection = receipts
      .filter((r) => r.paymentDate === today)
      .reduce((sum, r) => sum + Number(r.amountPaid || 0), 0);

    return {
      totalFee,
      collected,
      pending,
      todayCollection,
      paidStudents: fees.filter((f) => f.status === "Paid").length,
      pendingStudents: fees.filter((f) => f.status === "Pending").length,
      partialStudents: fees.filter((f) => f.status === "Partial").length,
    };
  }, [fees, receipts]);

  const handleSaveFeeStructure = () => {
    if (!structureName || !structureClass) {
      showToast("error", "Please fill structure name and class.");
      return;
    }

    const structures = JSON.parse(
      localStorage.getItem("school_fee_structures") || "[]"
    );

    const total =
      Number(admissionAmount || 0) +
      Number(tuitionAmount || 0) +
      Number(transportAmount || 0) +
      Number(examAmount || 0) +
      Number(otherAmount || 0);

    const newStructure = {
      id: "fs_" + Date.now(),
      structureName,
      className: structureClass,
      academicYear: structureYear,
      admissionAmount: Number(admissionAmount || 0),
      tuitionAmount: Number(tuitionAmount || 0),
      transportAmount: Number(transportAmount || 0),
      examAmount: Number(examAmount || 0),
      otherAmount: Number(otherAmount || 0),
      totalAmount: total,
    };

    localStorage.setItem(
      "school_fee_structures",
      JSON.stringify([newStructure, ...structures])
    );

    setStructureName("");
    setStructureClass("");
    setAdmissionAmount("");
    setTuitionAmount("");
    setTransportAmount("");
    setExamAmount("");
    setOtherAmount("");
    setShowStructureModal(false);

    showToast("success", "Fee structure saved successfully.");
  };

  const handleAssignFee = () => {
    const structures = JSON.parse(
      localStorage.getItem("school_fee_structures") || "[]"
    );

    const selectedStructure = structures.find(
      (item) => item.id === selectedStructureId
    );

    if (!selectedStructure) {
      showToast("error", "Please select a fee structure.");
      return;
    }

    if (!assignDueDate) {
      showToast("error", "Please select due date.");
      return;
    }

    let targetStudents = [];

    if (assignTo === "class") {
      if (!assignClass) {
        showToast("error", "Please select class.");
        return;
      }

      targetStudents = students.filter((student) => {
        const matchClass = student.className === assignClass;
        const matchSection = assignSection
          ? student.section === assignSection
          : true;

        return matchClass && matchSection;
      });
    }

    if (assignTo === "student") {
      if (!assignStudentId) {
        showToast("error", "Please select student.");
        return;
      }

      targetStudents = students.filter(
        (student) => student.id === assignStudentId
      );
    }

    if (targetStudents.length === 0) {
      showToast("error", "No students found for selected assignment.");
      return;
    }

    const updatedFees = [...fees];

    targetStudents.forEach((student) => {
      const existingIndex = updatedFees.findIndex(
        (fee) =>
          fee.studentId === student.id &&
          fee.academicYear === selectedStructure.academicYear
      );

      const totalFee = Number(selectedStructure.totalAmount || 0);
      const alreadyPaid =
        existingIndex >= 0 ? Number(updatedFees[existingIndex].paidAmount || 0) : 0;

      const feeRecord = {
        id:
          existingIndex >= 0
            ? updatedFees[existingIndex].id
            : "fee_" + student.id + "_" + Date.now(),
        studentId: student.id,
        admissionNo: student.admissionNo,
        studentName: student.name,
        parentName: student.parentName,
        parentMobile: student.parentMobile,
        className: student.className,
        section: student.section,
        academicYear: selectedStructure.academicYear,
        structureId: selectedStructure.id,
        structureName: selectedStructure.structureName,
        admissionFee: Number(selectedStructure.admissionAmount || 0),
        tuitionFee: Number(selectedStructure.tuitionAmount || 0),
        transportFee: Number(selectedStructure.transportAmount || 0),
        examFee: Number(selectedStructure.examAmount || 0),
        otherFee: Number(selectedStructure.otherAmount || 0),
        totalFee,
        paidAmount: alreadyPaid,
        pendingAmount: Math.max(totalFee - alreadyPaid, 0),
        dueDate: assignDueDate,
        status:
          totalFee - alreadyPaid <= 0
            ? "Paid"
            : alreadyPaid > 0
              ? "Partial"
              : "Pending",
        lastPaymentDate:
          existingIndex >= 0 ? updatedFees[existingIndex].lastPaymentDate || "" : "",
      };

      if (existingIndex >= 0) {
        updatedFees[existingIndex] = feeRecord;
      } else {
        updatedFees.push(feeRecord);
      }
    });

    const assignmentRecord = {
      id: "assign_" + Date.now(),
      structureId: selectedStructure.id,
      structureName: selectedStructure.structureName,
      academicYear: selectedStructure.academicYear,
      assignTo,
      className: assignTo === "class" ? assignClass : "",
      section: assignTo === "class" ? assignSection || "All" : "",
      studentId: assignTo === "student" ? assignStudentId : "",
      studentName: assignTo === "student" ? targetStudents[0]?.name : "",
      dueDate: assignDueDate,
      assignedStudents: targetStudents.length,
      assignedBy: localStorage.getItem("username") || "Admin",
      assignedOn: new Date().toISOString().split("T")[0],
    };

    saveFees(updatedFees);
    saveAssignments([assignmentRecord, ...feeAssignments]);

    setShowAssignModal(false);
    setSelectedStructureId("");
    setAssignTo("class");
    setAssignClass("");
    setAssignSection("");
    setAssignStudentId("");
    setAssignDueDate("");

    showToast(
      "success",
      `Fee assigned successfully to ${targetStudents.length} student(s).`
    );
  };

  const openCollectModal = (fee) => {
    setSelectedFee(fee);
    setPayAmount("");
    setPaymentMode("Cash");
    setTransactionNo("");
    setRemarks("");
    setShowCollectModal(true);
  };

  const handleCollectFee = () => {
    const amount = Number(payAmount || 0);

    if (!amount || amount <= 0) {
      showToast("error", "Please enter a valid payment amount.");
      return;
    }

    if (amount > selectedFee.pendingAmount) {
      showToast("error", "Payment amount cannot be greater than pending amount.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const receiptNo = "REC-" + Date.now().toString().slice(-8);

    const newPaidAmount = Number(selectedFee.paidAmount || 0) + amount;
    const newPendingAmount = Number(selectedFee.totalFee || 0) - newPaidAmount;

    const updatedFee = {
      ...selectedFee,
      paidAmount: newPaidAmount,
      pendingAmount: newPendingAmount,
      status: newPendingAmount <= 0 ? "Paid" : "Partial",
      lastPaymentDate: today,
    };

    const updatedFees = fees.map((f) =>
      f.id === selectedFee.id ? updatedFee : f
    );

    saveFees(updatedFees);

    const receipt = {
      id: "receipt_" + Date.now(),
      receiptNo,
      studentId: selectedFee.studentId,
      admissionNo: selectedFee.admissionNo,
      studentName: selectedFee.studentName,
      parentName: selectedFee.parentName,
      className: selectedFee.className,
      section: selectedFee.section,
      totalFee: selectedFee.totalFee,
      previousPaid: selectedFee.paidAmount,
      amountPaid: amount,
      paidAmount: newPaidAmount,
      pendingAmount: newPendingAmount,
      paymentMode,
      transactionNo,
      remarks,
      paymentDate: today,
      cashierName: localStorage.getItem("username") || "School Admin",
    };

    saveReceipts([receipt, ...receipts]);
    setReceiptData(receipt);
    setShowCollectModal(false);
    setShowReceipt(true);

    showToast("success", "Fee collected successfully.");
  };

  const handleDeleteReceipt = async (receiptId) => {
    const ok = await confirm({
      title: "Delete Receipt",
      message: "Are you sure you want to delete this receipt?",
    });

    if (!ok) return;

    const updated = receipts.filter((r) => r.id !== receiptId);
    saveReceipts(updated);
    showToast("success", "Receipt deleted successfully.");
  };

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Fees Management</h3>
            <p>Fee structures, assignments, collection, receipts and dues.</p>
          </div>

          <div className="fee-action-toolbar">
            <button
              className="btn btn-primary"
              onClick={() => setShowStructureModal(true)}
            >
              <FiPlus /> Fee Structure
            </button>

            <button
              className="btn btn-outline"
              onClick={() => setShowAssignModal(true)}
            >
              Assign Fee
            </button>

            <button className="btn btn-outline" onClick={() => window.print()}>
              <FiPrinter /> Reports
            </button>
          </div>
        </header>

        <div className="page">
          <div className="fee-summary-grid">
            <button className="fee-summary-card" onClick={() => setStatusFilter("All")}>
              <span>Total Fee</span>
              <strong>₹{stats.totalFee.toLocaleString("en-IN")}</strong>
            </button>

            <button className="fee-summary-card fee-success" onClick={() => setStatusFilter("Paid")}>
              <span>Collected</span>
              <strong>₹{stats.collected.toLocaleString("en-IN")}</strong>
            </button>

            <button className="fee-summary-card fee-danger" onClick={() => setStatusFilter("Pending")}>
              <span>Pending</span>
              <strong>₹{stats.pending.toLocaleString("en-IN")}</strong>
            </button>

            <button className="fee-summary-card fee-info">
              <span>Today Collection</span>
              <strong>₹{stats.todayCollection.toLocaleString("en-IN")}</strong>
            </button>

            <button className="fee-summary-card">
              <span>Paid Students</span>
              <strong>{stats.paidStudents}</strong>
            </button>

            <button className="fee-summary-card">
              <span>Partial Students</span>
              <strong>{stats.partialStudents}</strong>
            </button>
          </div>

          <div className="card fee-filter-card">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search admission no, student, parent, mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="card mt-md">
            <div className="card-header">
              <h3>Fee Structure Assignments</h3>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Structure</th>
                    <th>Academic Year</th>
                    <th>Assigned To</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Students</th>
                    <th>Due Date</th>
                    <th>Assigned By</th>
                    <th>Assigned On</th>
                  </tr>
                </thead>

                <tbody>
                  {feeAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-muted">
                        No fee assignments yet.
                      </td>
                    </tr>
                  ) : (
                    feeAssignments.map((item) => (
                      <tr key={item.id}>
                        <td>{item.structureName}</td>
                        <td>{item.academicYear}</td>
                        <td>{item.assignTo}</td>
                        <td>{item.className || "-"}</td>
                        <td>{item.section || "-"}</td>
                        <td>{item.assignedStudents}</td>
                        <td>{item.dueDate}</td>
                        <td>{item.assignedBy}</td>
                        <td>{item.assignedOn}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card mt-md">
            <div className="card-header">
              <h3>Student Fee Records ({filteredFees.length})</h3>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Admission No</th>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Parent</th>
                    <th>Total Fee</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-muted">
                        No fee records found.
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((fee) => (
                      <tr key={fee.id}>
                        <td>
                          <strong>{fee.admissionNo}</strong>
                        </td>
                        <td>{fee.studentName}</td>
                        <td>
                          {fee.className} - {fee.section}
                        </td>
                        <td>
                          <strong>{fee.parentName}</strong>
                          <br />
                          <small>{fee.parentMobile}</small>
                        </td>
                        <td>₹{Number(fee.totalFee || 0).toLocaleString("en-IN")}</td>
                        <td className="text-success">
                          ₹{Number(fee.paidAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="text-danger">
                          ₹{Number(fee.pendingAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td>{fee.dueDate}</td>
                        <td>
                          <span
                            className={`badge ${fee.status === "Paid"
                                ? "badge-success"
                                : fee.status === "Partial"
                                  ? "badge-warning"
                                  : "badge-danger"
                              }`}
                          >
                            {fee.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openCollectModal(fee)}
                            disabled={fee.pendingAmount <= 0}
                          >
                            <FiPlus /> Collect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid-2 mt-md">
            <div className="card">
              <div className="card-header">
                <h3>Pending Fee Reminders</h3>
              </div>

              {fees.filter((f) => f.pendingAmount > 0).length === 0 ? (
                <p className="text-muted">No pending dues.</p>
              ) : (
                fees
                  .filter((f) => f.pendingAmount > 0)
                  .slice(0, 6)
                  .map((fee) => (
                    <div className="fee-reminder-row" key={fee.id}>
                      <div>
                        <strong>{fee.studentName}</strong>
                        <p>
                          {fee.className} - {fee.section} | {fee.parentMobile}
                        </p>
                      </div>
                      <span>
                        ₹{Number(fee.pendingAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Recent Receipts</h3>
              </div>

              {receipts.length === 0 ? (
                <p className="text-muted">No receipts generated yet.</p>
              ) : (
                receipts.slice(0, 6).map((receipt) => (
                  <div className="fee-reminder-row" key={receipt.id}>
                    <div>
                      <strong>{receipt.receiptNo}</strong>
                      <p>
                        {receipt.studentName} | {receipt.paymentMode}
                      </p>
                    </div>
                    <div className="receipt-actions">
                      <span>
                        ₹{Number(receipt.amountPaid).toLocaleString("en-IN")}
                      </span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteReceipt(receipt.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {showStructureModal && (
            <div className="modal-overlay">
              <div className="modal-card fee-modal">
                <div className="modal-header">
                  <h3>Add Fee Structure</h3>
                  <button
                    className="icon-btn"
                    onClick={() => setShowStructureModal(false)}
                  >
                    <FiX />
                  </button>
                </div>

                <div className="dashboard-form">
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Structure Name</label>
                      <input
                        value={structureName}
                        onChange={(e) => setStructureName(e.target.value)}
                        placeholder="Class 1 Fee Structure"
                      />
                    </div>

                    <div className="form-group">
                      <label>Academic Year</label>
                      <input
                        value={structureYear}
                        onChange={(e) => setStructureYear(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Class</label>
                      <select
                        value={structureClass}
                        onChange={(e) => setStructureClass(e.target.value)}
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Admission Fee</label>
                      <input
                        type="number"
                        value={admissionAmount}
                        onChange={(e) => setAdmissionAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Tuition Fee</label>
                      <input
                        type="number"
                        value={tuitionAmount}
                        onChange={(e) => setTuitionAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Transport Fee</label>
                      <input
                        type="number"
                        value={transportAmount}
                        onChange={(e) => setTransportAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Exam Fee</label>
                      <input
                        type="number"
                        value={examAmount}
                        onChange={(e) => setExamAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Other Fee</label>
                      <input
                        type="number"
                        value={otherAmount}
                        onChange={(e) => setOtherAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="fee-total-preview">
                    Total Fee: ₹
                    {(
                      Number(admissionAmount || 0) +
                      Number(tuitionAmount || 0) +
                      Number(transportAmount || 0) +
                      Number(examAmount || 0) +
                      Number(otherAmount || 0)
                    ).toLocaleString("en-IN")}
                  </div>

                  <div className="form-actions mt-lg">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowStructureModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveFeeStructure}
                    >
                      Save Structure
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAssignModal && (
            <div className="modal-overlay">
              <div className="modal-card fee-modal">
                <div className="modal-header">
                  <h3>Assign Fee Structure</h3>
                  <button
                    className="icon-btn"
                    onClick={() => setShowAssignModal(false)}
                  >
                    <FiX />
                  </button>
                </div>

                <div className="dashboard-form">
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Select Fee Structure</label>
                      <select
                        value={selectedStructureId}
                        onChange={(e) => setSelectedStructureId(e.target.value)}
                      >
                        <option value="">Select Structure</option>
                        {JSON.parse(
                          localStorage.getItem("school_fee_structures") || "[]"
                        ).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.structureName} - {item.className} - ₹
                            {Number(item.totalAmount || 0).toLocaleString("en-IN")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Assign To</label>
                      <select
                        value={assignTo}
                        onChange={(e) => {
                          setAssignTo(e.target.value);
                          setAssignClass("");
                          setAssignSection("");
                          setAssignStudentId("");
                        }}
                      >
                        <option value="class">Class / Section</option>
                        <option value="student">Individual Student</option>
                      </select>
                    </div>

                    {assignTo === "class" && (
                      <>
                        <div className="form-group">
                          <label>Class</label>
                          <select
                            value={assignClass}
                            onChange={(e) => {
                              setAssignClass(e.target.value);
                              setAssignSection("");
                            }}
                          >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                              <option key={cls} value={cls}>
                                {cls}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Section Optional</label>
                          <select
                            value={assignSection}
                            onChange={(e) => setAssignSection(e.target.value)}
                          >
                            <option value="">All Sections</option>
                            {sectionsByClass.map((sec) => (
                              <option key={sec} value={sec}>
                                {sec}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {assignTo === "student" && (
                      <div className="form-group">
                        <label>Select Student</label>
                        <select
                          value={assignStudentId}
                          onChange={(e) => setAssignStudentId(e.target.value)}
                        >
                          <option value="">Select Student</option>
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.name} - {student.className} {student.section}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={assignDueDate}
                        onChange={(e) => setAssignDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-actions mt-lg">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowAssignModal(false)}
                    >
                      Cancel
                    </button>

                    <button className="btn btn-primary" onClick={handleAssignFee}>
                      Assign Fee
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCollectModal && selectedFee && (
            <div className="modal-overlay">
              <div className="modal-card fee-modal">
                <div className="modal-header">
                  <h3>Collect Fee</h3>
                  <button
                    className="icon-btn"
                    onClick={() => setShowCollectModal(false)}
                  >
                    <FiX />
                  </button>
                </div>

                <div className="fee-student-box">
                  <h4>{selectedFee.studentName}</h4>
                  <p>
                    {selectedFee.admissionNo} | {selectedFee.className} -{" "}
                    {selectedFee.section}
                  </p>
                </div>

                <div className="grid-3">
                  <div className="fee-mini-card">
                    <span>Total</span>
                    <strong>
                      ₹{Number(selectedFee.totalFee || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="fee-mini-card">
                    <span>Paid</span>
                    <strong>
                      ₹{Number(selectedFee.paidAmount || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="fee-mini-card">
                    <span>Pending</span>
                    <strong>
                      ₹
                      {Number(selectedFee.pendingAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>

                <div className="dashboard-form mt-md">
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Payment Amount</label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Mode</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        {paymentModes.map((mode) => (
                          <option key={mode} value={mode}>
                            {mode}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Transaction No</label>
                      <input
                        value={transactionNo}
                        onChange={(e) => setTransactionNo(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Remarks</label>
                      <input
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions mt-lg">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCollectModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleCollectFee}>
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {showReceipt && receiptData && (
            <div className="modal-overlay">
              <div className="modal-card fee-modal">
                <div className="modal-header">
                  <h3>Fee Receipt</h3>
                  <button
                    className="icon-btn"
                    onClick={() => setShowReceipt(false)}
                  >
                    <FiX />
                  </button>
                </div>

                <div id="fee-receipt" className="fee-receipt">
                  <h2>School Fee Receipt</h2>
                  <p>
                    Receipt No: <strong>{receiptData.receiptNo}</strong>
                  </p>
                  <p>Date: {receiptData.paymentDate}</p>

                  <hr />

                  <p>
                    <strong>Student:</strong> {receiptData.studentName}
                  </p>
                  <p>
                    <strong>Admission No:</strong> {receiptData.admissionNo}
                  </p>
                  <p>
                    <strong>Class:</strong> {receiptData.className} -{" "}
                    {receiptData.section}
                  </p>
                  <p>
                    <strong>Payment Mode:</strong> {receiptData.paymentMode}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> ₹
                    {Number(receiptData.amountPaid).toLocaleString("en-IN")}
                  </p>
                  <p>
                    <strong>Pending Amount:</strong> ₹
                    {Number(receiptData.pendingAmount).toLocaleString("en-IN")}
                  </p>

                  <div className="receipt-sign">
                    <span>Cashier Signature</span>
                    <span>School Seal</span>
                  </div>
                </div>

                <div className="form-actions mt-lg">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowReceipt(false)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.print()}
                  >
                    <FiPrinter /> Print / Save PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}