import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolSidebar from "../../components/SchoolSidebar";
import ExamTabs from "../../components/ExamTabs";
import { useUI } from "../../components/UIContext";

const STATUS_OPTIONS = ["Present", "Absent", "Leave"];

const getGrade = (marks, total) => {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B+";
  if (marks >= 60) return "B";
  if (marks >= 50) return "C";
  if (marks >= 35) return "D";
  return "Fail";
};

const getResult = (marks, passMarks, status) => {
  if (status === "Absent") return "Absent";
  if (marks >= passMarks) return "Pass";
  return "Fail";
};

export default function MarksEntry() {
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [marksRecords, setMarksRecords] = useState([]);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [rows, setRows] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setExams(JSON.parse(localStorage.getItem("school_exams") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("school_classes") || "[]"));
    setSections(JSON.parse(localStorage.getItem("school_sections") || "[]"));
    setStudents(JSON.parse(localStorage.getItem("school_students") || "[]"));
    setSchedules(JSON.parse(localStorage.getItem("school_exam_subjects") || "[]"));
    setMarksRecords(JSON.parse(localStorage.getItem("school_exam_marks") || "[]"));
  }, []);

  const selectedSchedule = useMemo(() => {
    return schedules.find((item) =>
      item.examId === selectedExam &&
      item.className === selectedClass &&
      item.section === selectedSection &&
      item.subject === selectedSubject
    );
  }, [selectedExam, selectedClass, selectedSection, selectedSubject, schedules]);

  useEffect(() => {
    if (!selectedExam || !selectedClass || !selectedSection || !selectedSubject) {
      setRows([]);
      return;
    }

    const examMarks = marksRecords.filter((item) =>
      item.examId === selectedExam &&
      item.className === selectedClass &&
      item.section === selectedSection &&
      item.subject === selectedSubject
    );

    const studentRows = students
      .filter((student) => student.className === selectedClass && student.section === selectedSection)
      .map((student) => {
        const existing = examMarks.find((item) => item.studentId === student.id);
        const status = existing?.status || "Present";
        const marksObtained = status === "Absent" ? 0 : Number(existing?.marksObtained || 0);
        const maxMarks = selectedSchedule?.maxMarks || 100;
        const passMarks = selectedSchedule?.passMarks || 35;
        const grade = getGrade(marksObtained, maxMarks);
        const result = getResult(marksObtained, passMarks, status);
        return {
          studentId: student.id,
          admissionNo: student.admissionNo,
          studentName: student.name,
          className: student.className,
          section: student.section,
          subject: selectedSubject,
          maxMarks,
          passMarks,
          marksObtained,
          status,
          grade,
          result,
          remarks: existing?.remarks || "",
        };
      });

    setRows(studentRows);
  }, [selectedExam, selectedClass, selectedSection, selectedSubject, students, marksRecords, selectedSchedule]);

  const handleRowChange = (studentId, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        const updated = { ...row, [field]: field === "marksObtained" ? Number(value) : value };
        if (field === "status") {
          updated.marksObtained = value === "Absent" ? 0 : updated.marksObtained;
        }
        updated.grade = getGrade(updated.marksObtained, updated.maxMarks);
        updated.result = getResult(updated.marksObtained, updated.passMarks, updated.status);
        return updated;
      })
    );
  };

  const handleSaveMarks = () => {
    if (!selectedSchedule) {
      setErrorMessage("Select exam, class, section, and subject with an existing timetable entry.");
      return;
    }
    if (rows.length === 0) {
      setErrorMessage("No students found for the selected class and section.");
      return;
    }

    const updatedRecords = marksRecords.filter((item) => !(
      item.examId === selectedExam &&
      item.className === selectedClass &&
      item.section === selectedSection &&
      item.subject === selectedSubject
    ));

    const newRecords = rows.map((row) => ({
      ...row,
      examId: selectedExam,
      examName: exams.find((exam) => exam.id === selectedExam)?.examName || "",
      updatedAt: new Date().toISOString(),
    }));
    const merged = [...updatedRecords, ...newRecords];
    setMarksRecords(merged);
    localStorage.setItem("school_exam_marks", JSON.stringify(merged));
    setErrorMessage("");
    showToast("success", "Marks saved successfully.");
  };

  const handleReset = () => {
    setSelectedExam("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedSubject("");
    setRows([]);
    setErrorMessage("");
  };

  const handlePrint = () => {
    window.print();
  };

  const scheduleSubjects = useMemo(() => {
    return schedules
      .filter((item) =>
        item.examId === selectedExam &&
        item.className === selectedClass &&
        item.section === selectedSection
      )
      .map((item) => item.subject);
  }, [selectedExam, selectedClass, selectedSection, schedules]);

  const canEnterMarks = classes.length > 0 && sections.length > 0 && students.length > 0 && exams.length > 0 && schedules.length > 0;

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Marks Entry</h3>
            <p>Record subject marks for students and generate result summaries.</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/school/examinations/dashboard")}>Back</button>
            <button className="btn btn-outline" onClick={handlePrint}>Print Marks Sheet</button>
          </div>
        </header>
        <ExamTabs />
        <div className="page">
          {!canEnterMarks ? (
            <div className="card">
              <div className="empty-state">
                <p>Please add classes, sections, students, exams, and timetable entries before entering marks.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="card-header">
                  <h3>Filter by Exam, Class, Section and Subject</h3>
                </div>
                <div className="dashboard-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Select Exam</label>
                      <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                        <option value="">Select exam</option>
                        {exams.map((exam) => (
                          <option key={exam.id} value={exam.id}>{exam.examName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Select Class</label>
                      <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                        <option value="">Select class</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.name}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Select Section</label>
                      <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                        <option value="">Select section</option>
                        {sections
                          .filter((section) => {
                            const classItem = classes.find((cls) => cls.name === selectedClass);
                            return classItem ? section.classId === classItem.id : true;
                          })
                          .map((section) => (
                            <option key={section.id} value={section.name}>{section.name}</option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Select Subject</label>
                      <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                        <option value="">Select subject</option>
                        {scheduleSubjects.map((subjectItem) => (
                          <option key={subjectItem} value={subjectItem}>{subjectItem}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {selectedSchedule ? (
                <div className="card mt-lg">
                  <div className="card-header">
                    <h3>Marks Entry Sheet</h3>
                  </div>
                  <div className="dashboard-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Max Marks</label>
                        <input readOnly value={selectedSchedule.maxMarks} />
                      </div>
                      <div className="form-group">
                        <label>Pass Marks</label>
                        <input readOnly value={selectedSchedule.passMarks} />
                      </div>
                      <div className="form-group full-width">
                        <label>Exam Date & Time</label>
                        <input readOnly value={`${selectedSchedule.examDate} ${selectedSchedule.startTime} - ${selectedSchedule.endTime}`} />
                      </div>
                    </div>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Admission No</th>
                            <th>Student Name</th>
                            <th>Class</th>
                            <th>Section</th>
                            <th>Subject</th>
                            <th>Max Marks</th>
                            <th>Pass Marks</th>
                            <th>Marks Obtained</th>
                            <th>Status</th>
                            <th>Grade</th>
                            <th>Result</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.length === 0 ? (
                            <tr>
                              <td colSpan="12">
                                <div className="empty-state">No students found for this class and section.</div>
                              </td>
                            </tr>
                          ) : (
                            rows.map((row) => (
                              <tr key={row.studentId}>
                                <td>{row.admissionNo}</td>
                                <td>{row.studentName}</td>
                                <td>{row.className}</td>
                                <td>{row.section}</td>
                                <td>{row.subject}</td>
                                <td>{row.maxMarks}</td>
                                <td>{row.passMarks}</td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="number"
                                    min="0"
                                    max={row.maxMarks}
                                    value={row.marksObtained}
                                    onChange={(e) => handleRowChange(row.studentId, "marksObtained", e.target.value)}
                                    disabled={row.status === "Absent"}
                                  />
                                </td>
                                <td>
                                  <select value={row.status} onChange={(e) => handleRowChange(row.studentId, "status", e.target.value)}>
                                    {STATUS_OPTIONS.map((statusItem) => (
                                      <option key={statusItem} value={statusItem}>{statusItem}</option>
                                    ))}
                                  </select>
                                </td>
                                <td>{row.grade}</td>
                                <td>{row.result}</td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={row.remarks}
                                    onChange={(e) => handleRowChange(row.studentId, "remarks", e.target.value)}
                                  />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-outline" onClick={handleReset}>Reset</button>
                      <button type="button" className="btn btn-primary" onClick={handleSaveMarks}>Save Marks</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card mt-lg">
                  <div className="empty-state">
                    <p>Select a valid exam, class, section, and subject to load the marks entry sheet.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
