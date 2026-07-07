import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiSearch, FiDownload, FiUpload } from "react-icons/fi";
import ActionMenu from "../../components/ActionMenu";
import { useUI } from "../../components/UIContext";
import PreviewModal from "../../components/PreviewModal";

export default function Students() {
  const { showToast, confirm } = useUI();
  const [actionRow, setActionRow] = useState(null);

  const [activeTab, setActiveTab] = useState("directory");
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

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

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [addressLine3, setAddressLine3] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [zipcode, setZipcode] = useState("");

  const [admissionFee, setAdmissionFee] = useState("0");
  const [tuitionFee, setTuitionFee] = useState("0");
  const [transportFee, setTransportFee] = useState("0");
  const [booksFee, setBooksFee] = useState("0");
  const [uniformFee, setUniformFee] = useState("0");
  const [examFee, setExamFee] = useState("0");
  const [otherFee, setOtherFee] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [csvRows, setCsvRows] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("school_students") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("school_classes") || "[]"));
    setSections(JSON.parse(localStorage.getItem("school_sections") || "[]"));
  }, []);

  const saveStudents = (newStudents) => {
    setStudents(newStudents);
    localStorage.setItem("school_students", JSON.stringify(newStudents));
  };

  const normalizeContactKey = (value) =>
    String(value || "").trim().toLowerCase();

  const getStoredParents = () =>
    (JSON.parse(localStorage.getItem("erp_users") || "[]") || []).filter(
      (user) => user.role === "SCHOOL_PARENT" || user.role === "PARENT"
    );

  const findParentRecord = ({ mobile, email, username }) => {
    const mobileKey = normalizeContactKey(mobile);
    const emailKey = normalizeContactKey(email);
    const usernameKey = String(username || "").trim();

    return getStoredParents().find((user) => {
      const matchesMobile = mobileKey && normalizeContactKey(user.mobile) === mobileKey;
      const matchesEmail = emailKey && normalizeContactKey(user.email) === emailKey;
      const matchesUsername = usernameKey && user.username === usernameKey;
      return matchesMobile || matchesEmail || matchesUsername;
    }) || null;
  };

  const generateParentId = (parentUsers) => {
    const ids = parentUsers
      .map((user) => String(user.parentId || "").trim())
      .map((id) => {
        const match = id.match(/PAR0*(\d+)$/i);
        return match ? Number(match[1]) : null;
      })
      .filter((num) => Number.isFinite(num));

    const nextIndex = ids.length ? Math.max(...ids) + 1 : 1;
    return `PAR${String(nextIndex).padStart(3, "0")}`;
  };

  const saveParentCredentials = ({ parentName, parentMobile, parentEmail, parentUsername, parentPassword }) => {
    const contactParent = findParentRecord({
      mobile: parentMobile,
      email: parentEmail,
      username: parentUsername,
    });

    const storedUsers = JSON.parse(localStorage.getItem("erp_users") || "[]") || [];

    if (contactParent) {
      const parentRecord = {
        ...contactParent,
        parentId: contactParent.parentId || contactParent.parentId || generateParentId(storedUsers),
        username: contactParent.username || parentUsername,
        password: contactParent.password || parentPassword,
        name: contactParent.name || parentName,
        email: contactParent.email || parentEmail || "",
        mobile: contactParent.mobile || parentMobile || "",
        redirect: contactParent.redirect || "/school/parent/dashboard",
        otp: contactParent.otp || "777777",
        organizationType: contactParent.organizationType || "E-School",
        role: "SCHOOL_PARENT",
      };

      const updatedUsers = storedUsers.filter((user) => user.username !== parentRecord.username);
      updatedUsers.push(parentRecord);
      localStorage.setItem("erp_users", JSON.stringify(updatedUsers));
      return parentRecord;
    }

    const parentId = generateParentId(storedUsers);
    let username = String(parentUsername || "").trim();

    if (!username) {
      const fallback = normalizeContactKey(parentMobile || parentEmail || parentName).replace(/[^a-z0-9]/g, "") || "parent";
      let suffix = 1;
      username = `${fallback}_${suffix}`;
      while (storedUsers.some((user) => user.username === username)) {
        suffix += 1;
        username = `${fallback}_${suffix}`;
      }
    } else if (storedUsers.some((user) => user.username === username)) {
      const existingUser = storedUsers.find((user) => user.username === username);
      if (existingUser && normalizeContactKey(existingUser.mobile) !== normalizeContactKey(parentMobile) && normalizeContactKey(existingUser.email) !== normalizeContactKey(parentEmail)) {
        username = `${username}_${Date.now().toString().slice(-4)}`;
      }
    }

    const newUser = {
      parentId,
      username,
      password: parentPassword,
      role: "SCHOOL_PARENT",
      redirect: "/school/parent/dashboard",
      otp: "777777",
      organizationType: "E-School",
      name: parentName,
      email: parentEmail || "",
      mobile: parentMobile || "",
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = storedUsers.filter((user) => user.username !== username);
    updatedUsers.push(newUser);
    localStorage.setItem("erp_users", JSON.stringify(updatedUsers));
    return newUser;
  };

  const resetForm = () => {
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
    setAddressLine1("");
    setAddressLine2("");
    setAddressLine3("");
    setCity("");
    setStateName("");
    setZipcode("");
    setAdmissionFee("0");
    setTuitionFee("0");
    setTransportFee("0");
    setBooksFee("0");
    setUniformFee("0");
    setExamFee("0");
    setOtherFee("0");
    setPaidAmount("0");
  };

  const handleOpenAdd = () => {
    resetForm();
    setActiveTab("single");
  };

  const handleOpenEdit = (student) => {
    setEditId(student.id);

    const names = String(student.name || "").split(" ");
    setFirstName(names[0] || "");
    setLastName(names.slice(1).join(" ") || "");

    setAdmissionNo(student.admissionNo || "");
    setSelectedClass(student.className || "");
    setSelectedSection(student.section || "");
    setDob(student.dob || "");
    setGender(student.gender || "");
    setParentName(student.parentName || "");
    setParentMobile(student.parentMobile || "");
    setParentEmail(student.parentEmail || "");
    setParentUsername(student.parentUsername || "");
    setParentPassword(student.parentPassword || "");
    setStatus(student.status || "Active");

    setAddressLine1(student.addressLine1 || "");
    setAddressLine2(student.addressLine2 || "");
    setAddressLine3(student.addressLine3 || "");
    setCity(student.city || "");
    setStateName(student.stateName || "");
    setZipcode(student.zipcode || "");

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

  const getSectionsByClassName = (className) => {
    const selectedCls = classes.find((item) => item.name === className);
    if (!selectedCls) return [];
    return sections.filter((section) => section.classId === selectedCls.id);
  };

  const numberValue = (value) => Number(value || 0);

  const fAdmission = numberValue(admissionFee);
  const fTuition = numberValue(tuitionFee);
  const fTransport = numberValue(transportFee);
  const fBooks = numberValue(booksFee);
  const fUniform = numberValue(uniformFee);
  const fExam = numberValue(examFee);
  const fOther = numberValue(otherFee);
  const fTotal =
    fAdmission + fTuition + fTransport + fBooks + fUniform + fExam + fOther;
  const fPaid = numberValue(paidAmount);
  const fPending = Math.max(fTotal - fPaid, 0);

  const handlePreparePreview = (e) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !selectedClass ||
      !selectedSection ||
      !parentName ||
      !parentMobile ||
      !parentUsername ||
      !parentPassword
    ) {
      showToast("error", "Please fill all required fields.");
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
      address: `${addressLine1} ${addressLine2} ${addressLine3}, ${city}, ${stateName} - ${zipcode}`,
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
      addressLine1,
      addressLine2,
      addressLine3,
      city,
      stateName,
      zipcode,
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

    const parentRecord = saveParentCredentials({
      parentName,
      parentMobile,
      parentEmail,
      parentUsername,
      parentPassword,
    });

    if (parentRecord) {
      studentData.parentId = parentRecord.parentId;
      studentData.parentUsername = parentRecord.username;
      studentData.parentPassword = parentRecord.password;
      studentData.parentName = parentRecord.name;
      studentData.parentEmail = parentRecord.email;
      studentData.parentMobile = parentRecord.mobile;
    }

    const updatedStudents = editId
      ? students.map((student) =>
        student.id === editId ? { ...student, ...studentData } : student
      )
      : [studentData, ...students];

    saveStudents(updatedStudents);

    const feesList = JSON.parse(localStorage.getItem("school_fees") || "[]");
    const existingIndex = feesList.findIndex(
      (fee) => fee.studentId === studentData.id
    );

    const feeRecord = {
      id: existingIndex >= 0 ? feesList[existingIndex].id : "fee_" + Date.now(),
      studentId: studentData.id,
      studentName: studentData.name,
      className: studentData.className,
      section: studentData.section,
      totalFee: fTotal,
      paidAmount: fPaid,
      pendingAmount: fPending,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: fPending <= 0 ? "Paid" : fPaid > 0 ? "Partial" : "Pending",
    };

    if (existingIndex >= 0) {
      feesList[existingIndex] = feeRecord;
    } else {
      feesList.push(feeRecord);
    }

    localStorage.setItem("school_fees", JSON.stringify(feesList));

    setShowPreview(false);
    setActiveTab("directory");
    showToast(
      "success",
      editId ? "Student updated successfully!" : "Student admitted successfully!"
    );
  };

  const handleSaveDraft = () => {
    showToast("info", "Admission form draft saved locally.");
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Student Admission",
      message:
        "Are you sure you want to delete this student record? This will also remove their parent login credentials.",
    });

    if (!confirmed) return;

    const student = students.find((item) => item.id === id);
    const updatedStudents = students.filter((item) => item.id !== id);
    saveStudents(updatedStudents);

    if (student) {
      const siblingCount = updatedStudents.filter(
        (item) => item.parentId && item.parentId === student.parentId
      ).length;

      if (siblingCount === 0) {
        const storedUsers = JSON.parse(localStorage.getItem("erp_users") || "[]");
        const filteredUsers = storedUsers.filter(
          (user) => user.username !== student.parentUsername
        );
        localStorage.setItem("erp_users", JSON.stringify(filteredUsers));
      }
    }

    showToast("success", "Student record deleted successfully.");
  };

  const csvEscape = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const downloadCsvFile = (fileName, headers, rows) => {
    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const parseCsv = (text) => {
    const rows = [];
    let current = "";
    let row = [];
    let insideQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"' && insideQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        row.push(current.trim());
        current = "";
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
        if (current || row.length) {
          row.push(current.trim());
          rows.push(row);
          row = [];
          current = "";
        }
        if (char === "\r" && nextChar === "\n") i += 1;
      } else {
        current += char;
      }
    }

    if (current || row.length) {
      row.push(current.trim());
      rows.push(row);
    }

    return rows;
  };

  const normalizeHeader = (header) =>
    String(header || "").toLowerCase().replace(/\s+/g, "").trim();

  const handleImportCsvFile = (e) => {
    const file = e.target.files?.[0];

    setCsvError("");
    setCsvRows([]);
    setCsvFileName("");

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload only a CSV file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsedRows = parseCsv(text);

        if (parsedRows.length < 2) {
          setCsvError("CSV file must contain headers and at least one row.");
          return;
        }

        const headers = parsedRows[0].map(normalizeHeader);
        const dataRows = parsedRows.slice(1);

        const getValue = (row, possibleHeaders) => {
          const index = possibleHeaders
            .map(normalizeHeader)
            .map((header) => headers.indexOf(header))
            .find((item) => item >= 0);

          return index >= 0 ? row[index] || "" : "";
        };

        const mappedRows = dataRows
          .filter((row) => row.some((value) => value))
          .map((row, index) => ({
            __rowIndex: index,
            admissionNo: getValue(row, ["Admission No", "AdmissionNo"]),
            firstName: getValue(row, ["First Name", "FirstName"]),
            lastName: getValue(row, ["Last Name", "LastName"]),
            className: getValue(row, ["Class"]),
            section: getValue(row, ["Section"]),
            dob: getValue(row, ["DOB", "Date of Birth"]),
            gender: getValue(row, ["Gender"]),
            parentName: getValue(row, ["Parent Full Name", "Parent Name"]),
            parentMobile: getValue(row, ["Parent Mobile"]),
            parentEmail: getValue(row, ["Parent Email"]),
            parentUsername: getValue(row, ["Parent Username"]),
            parentPassword: getValue(row, ["Parent Password"]),
            status: getValue(row, ["Status"]) || "Active",
          }));

        setCsvRows(mappedRows);
        setCsvFileName(file.name);
      } catch (error) {
        console.error(error);
        setCsvError("Failed to read CSV file.");
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearCsv = () => {
    setCsvRows([]);
    setCsvFileName("");
    setCsvError("");
  };

  const handleApplyCsvImport = (e) => {
    e.preventDefault();

    if (csvRows.length === 0) {
      showToast("warning", "No rows to import.");
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem("erp_users") || "[]") || [];
    const importedParentKeys = new Set();

    for (const row of csvRows) {
      if (
        !row.firstName ||
        !row.lastName ||
        !row.className ||
        !row.section ||
        !row.parentName ||
        !row.parentMobile ||
        !row.parentPassword
      ) {
        showToast("error", "Some rows are missing required fields.");
        return;
      }

      const parentKey = normalizeContactKey(row.parentMobile) || normalizeContactKey(row.parentEmail);
      if (!parentKey) {
        showToast("error", "Parent mobile or email is required for each row.");
        return;
      }

      importedParentKeys.add(parentKey);
    }

    let updatedStudents = [...students];

    csvRows.forEach((row) => {
      const parentRecord = saveParentCredentials({
        parentName: row.parentName,
        parentMobile: row.parentMobile,
        parentEmail: row.parentEmail || "",
        parentUsername: row.parentUsername,
        parentPassword: row.parentPassword,
      });

      const studentData = {
        id: "std_" + Date.now() + Math.random().toString().slice(-4),
        name: `${row.firstName.trim()} ${row.lastName.trim()}`,
        admissionNo:
          row.admissionNo || "ADM-" + Math.floor(100000 + Math.random() * 900000),
        className: row.className,
        section: row.section,
        dob: row.dob || "",
        gender: row.gender || "",
        parentName: row.parentName,
        parentMobile: row.parentMobile,
        parentEmail: row.parentEmail || "",
        parentUsername: parentRecord ? parentRecord.username : row.parentUsername,
        parentPassword: parentRecord ? parentRecord.password : row.parentPassword,
        parentId: parentRecord ? parentRecord.parentId : undefined,
        status: row.status || "Active",
        totalFee: 0,
        paidAmount: 0,
        pendingAmount: 0,
      };

      updatedStudents = [studentData, ...updatedStudents];
    });

    saveStudents(updatedStudents);
    handleClearCsv();
    setActiveTab("directory");

    showToast("success", `Imported ${csvRows.length} students successfully.`);
  };

  const handleExportCsv = () => {
    if (students.length === 0) {
      showToast("warning", "No student records to export.");
      return;
    }

    const headers = [
      "Admission No",
      "First Name",
      "Last Name",
      "Class",
      "Section",
      "DOB",
      "Gender",
      "Parent Full Name",
      "Parent Mobile",
      "Parent Email",
      "Parent Username",
      "Parent Password",
      "Admission Fee",
      "Tuition Fee",
      "Transport Fee",
      "Books Fee",
      "Uniform Fee",
      "Exam Fee",
      "Other Fee",
      "Total Fee",
      "Paid Amount",
      "Pending Amount",
      "Status",
    ];

    const rows = students.map((student) => {
      const names = String(student.name || "").split(" ");

      return [
        student.admissionNo || "",
        names[0] || "",
        names.slice(1).join(" ") || "",
        student.className || "",
        student.section || "",
        student.dob || "",
        student.gender || "",
        student.parentName || "",
        student.parentMobile || "",
        student.parentEmail || "",
        student.parentUsername || "",
        student.parentPassword || "",
        student.admissionFee || 0,
        student.tuitionFee || 0,
        student.transportFee || 0,
        student.booksFee || 0,
        student.uniformFee || 0,
        student.examFee || 0,
        student.otherFee || 0,
        student.totalFee || 0,
        student.paidAmount || 0,
        student.pendingAmount || 0,
        student.status || "Active",
      ];
    });

    downloadCsvFile("students-directory.csv", headers, rows);
  };

  const handleDownloadSampleCsv = () => {
    const headers = [
      "Admission No",
      "First Name",
      "Last Name",
      "Class",
      "Section",
      "DOB",
      "Gender",
      "Parent Full Name",
      "Parent Mobile",
      "Parent Email",
      "Parent Username",
      "Parent Password",
      "Status",
    ];

    const rows = [
      [
        "ADM-100001",
        "Ravi",
        "Kumar",
        "Class 1",
        "A",
        "2018-04-12",
        "Male",
        "Suresh Kumar",
        "9876543210",
        "parent1@example.com",
        "parent_3210",
        "Pass@123",
        "Active",
      ],
      [
        "ADM-100002",
        "Sita",
        "Rani",
        "Class 2",
        "B",
        "2017-06-20",
        "Female",
        "Lakshmi Devi",
        "9876543211",
        "parent2@example.com",
        "parent_3211",
        "Pass@123",
        "Active",
      ],
    ];

    downloadCsvFile("students-sample.csv", headers, rows);
  };

  const filteredStudents = students.filter((student) => {
    const text = search.toLowerCase();

    const matchesSearch =
      (student.name || "").toLowerCase().includes(text) ||
      (student.admissionNo || "").toLowerCase().includes(text) ||
      (student.parentName || "").toLowerCase().includes(text);

    const matchesClass = classFilter ? student.className === classFilter : true;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Students Admissions</h3>
            <p>Manage admissions, CSV import/export, fees, and parent profiles</p>
          </div>

          <div className="tab-buttons flex-row">
            <button
              className={`btn ${activeTab === "directory" ? "btn-primary" : "btn-outline"
                }`}
              onClick={() => setActiveTab("directory")}
            >
              Students Directory
            </button>

            <button
              className={`btn ${activeTab === "single" ? "btn-primary" : "btn-outline"
                }`}
              onClick={handleOpenAdd}
            >
              + Add Admission
            </button>

            <button
              className={`btn ${activeTab === "bulk" ? "btn-primary" : "btn-outline"
                }`}
              onClick={() => setActiveTab("bulk")}
            >
              Import / Export CSV
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
                      <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                      >
                        <option value="">All Classes</option>
                        {classes.map((classItem) => (
                          <option key={classItem.id} value={classItem.name}>
                            {classItem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="card mt-md">
                    <div className="card-header">
                      <h3>
                        Admitted Students Directory ({filteredStudents.length})
                      </h3>
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
                            {filteredStudents.map((student) => (
                              <tr key={student.id}>
                                <td>
                                  <strong>{student.admissionNo}</strong>
                                </td>
                                <td>{student.name}</td>
                                <td>{student.className}</td>
                                <td>
                                  <span className="badge badge-info">
                                    {student.section}
                                  </span>
                                </td>
                                <td>
                                  <div>
                                    <strong>{student.parentName}</strong>
                                  </div>
                                  <small className="text-muted">
                                    {student.parentMobile}
                                  </small>
                                </td>
                                <td>
                                  <span
                                    className={
                                      student.pendingAmount > 0
                                        ? "text-danger"
                                        : "text-success"
                                    }
                                  >
                                    ₹
                                    {(student.pendingAmount || 0).toLocaleString(
                                      "en-IN"
                                    )}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${student.status === "Active"
                                      ? "badge-success"
                                      : "badge-danger"
                                      }`}
                                  >
                                    {student.status}
                                  </span>
                                </td>
                                <td>
                                  <ActionMenu
                                    onEdit={() => handleOpenEdit(student)}
                                    onDelete={() => handleDelete(student.id)}
                                  />
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

              {activeTab === "single" && (
                <div className="card">
                  <div className="card-header">
                    <h3>
                      {editId
                        ? "Update Student Admission Details"
                        : "Single Admission Registry Form"}
                    </h3>
                  </div>

                  <form onSubmit={handlePreparePreview} className="dashboard-form">
                    <div className="form-section-title">Student Demographics</div>

                    <div className="grid-3">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Admission ID *</label>
                        <input type="text" value={admissionNo} readOnly />
                      </div>
                    </div>

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
                          <option value="">Select Class</option>
                          {classes.map((classItem) => (
                            <option key={classItem.id} value={classItem.name}>
                              {classItem.name}
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
                          <option value="">Select Section</option>
                          {getSectionsByClassName(selectedClass).map((section) => (
                            <option key={section.id} value={section.name}>
                              {section.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
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
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-section-title mt-md">
                      Parent / Guardian Credentials
                    </div>

                    <div className="grid-3">
                      <div className="form-group">
                        <label>Parent Full Name *</label>
                        <input
                          type="text"
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Parent Mobile *</label>
                        <input
                          type="tel"
                          value={parentMobile}
                          onChange={(e) => setParentMobile(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Parent Email</label>
                        <input
                          type="email"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label>Parent Username *</label>
                        <input
                          type="text"
                          value={parentUsername}
                          onChange={(e) => setParentUsername(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Parent Password *</label>
                        <input
                          type="password"
                          value={parentPassword}
                          onChange={(e) => setParentPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-section-title mt-md">Address Details</div>

                    <div className="grid-3">
                      <div className="form-group">
                        <label>Address Line 1</label>
                        <input
                          type="text"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Address Line 2</label>
                        <input
                          type="text"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Address Line 3</label>
                        <input
                          type="text"
                          value={addressLine3}
                          onChange={(e) => setAddressLine3(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Zipcode</label>
                        <input
                          type="text"
                          value={zipcode}
                          onChange={(e) => setZipcode(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-section-title mt-md">
                      Fee Component Details
                    </div>

                    <div className="grid-4">
                      <div className="form-group">
                        <label>Admission Fee ₹</label>
                        <input
                          type="number"
                          value={admissionFee}
                          onChange={(e) => setAdmissionFee(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Tuition Fee ₹</label>
                        <input
                          type="number"
                          value={tuitionFee}
                          onChange={(e) => setTuitionFee(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Transport Fee ₹</label>
                        <input
                          type="number"
                          value={transportFee}
                          onChange={(e) => setTransportFee(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Books Fee ₹</label>
                        <input
                          type="number"
                          value={booksFee}
                          onChange={(e) => setBooksFee(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid-4 mt-sm">
                      <div className="form-group">
                        <label>Uniform Fee ₹</label>
                        <input
                          type="number"
                          value={uniformFee}
                          onChange={(e) => setUniformFee(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Exam Fee ₹</label>
                        <input
                          type="number"
                          value={examFee}
                          onChange={(e) => setExamFee(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Other Fee ₹</label>
                        <input
                          type="number"
                          value={otherFee}
                          onChange={(e) => setOtherFee(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Amount Paid ₹</label>
                        <input
                          type="number"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="fee-summary-grid mt-md mb-md">
                      <div className="stat-card">
                        <p className="stat-card-label">Total Allocated Fee</p>
                        <h4 className="stat-card-value">
                          ₹{fTotal.toLocaleString("en-IN")}
                        </h4>
                      </div>

                      <div className="stat-card">
                        <p className="stat-card-label">Paid / Collected</p>
                        <h4 className="stat-card-value text-success">
                          ₹{fPaid.toLocaleString("en-IN")}
                        </h4>
                      </div>

                      <div className="stat-card">
                        <p className="stat-card-label">Outstanding Balance</p>
                        <h4 className="stat-card-value text-danger">
                          ₹{fPending.toLocaleString("en-IN")}
                        </h4>
                      </div>
                    </div>

                    <div className="form-actions mt-lg">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleSaveDraft}
                      >
                        Save Draft
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setActiveTab("directory")}
                      >
                        Cancel
                      </button>

                      <button type="submit" className="btn btn-primary">
                        Preview & Submit
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "bulk" && (
                <div className="card">
                  <div className="card-header import-header">
                    <div>
                      <h3>Import / Export Students CSV</h3>
                      <p className="text-muted">
                        Upload CSV, preview records, and import students safely.
                      </p>
                    </div>

                    <div className="import-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleDownloadSampleCsv}
                      >
                        <FiDownload /> Sample CSV
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleExportCsv}
                      >
                        <FiDownload /> Export CSV
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleApplyCsvImport} className="dashboard-form">
                    <div className="csv-upload-card">
                      <label className="csv-upload-label">
                        <FiUpload />
                        <span>Select CSV File</span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleImportCsvFile}
                        />
                      </label>

                      <div>
                        {csvFileName ? (
                          <strong>{csvFileName}</strong>
                        ) : (
                          <span className="text-muted">No CSV file selected</span>
                        )}

                        {csvError && <div className="text-danger">{csvError}</div>}
                      </div>
                    </div>

                    <div className="table-responsive mt-md">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Admission No</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Class</th>
                            <th>Section</th>
                            <th>Parent Name</th>
                            <th>Parent Mobile</th>
                            <th>Parent Username</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {csvRows.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="text-muted">
                                No rows loaded. Select a CSV file to preview
                                imported students.
                              </td>
                            </tr>
                          ) : (
                            csvRows.map((row, index) => (
                              <tr key={row.__rowIndex || index}>
                                <td>{row.admissionNo}</td>
                                <td>{row.firstName}</td>
                                <td>{row.lastName}</td>
                                <td>{row.className}</td>
                                <td>{row.section}</td>
                                <td>{row.parentName}</td>
                                <td>{row.parentMobile}</td>
                                <td>{row.parentUsername}</td>
                                <td>{row.status}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="form-actions mt-lg">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setActiveTab("directory")}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleClearCsv}
                      >
                        Clear
                      </button>

                      <button type="submit" className="btn btn-primary">
                        Import Students from CSV
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          {showPreview && (
            <PreviewModal
              title="Student Admission & Fee Details"
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