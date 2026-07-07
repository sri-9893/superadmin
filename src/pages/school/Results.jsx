import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolSidebar from "../../components/SchoolSidebar";
import ExamTabs from "../../components/ExamTabs";
import { useUI } from "../../components/UIContext";

const gradeFromPercentage = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "D";
  return "Fail";
};

const statusBadge = {
  Pass: "badge badge-success",
  Fail: "badge badge-danger",
  Absent: "badge badge-warning",
};

export default function Results() {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [results, setResults] = useState([]);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [computedResults, setComputedResults] = useState([]);

  useEffect(() => {
    setExams(JSON.parse(localStorage.getItem("school_exams") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("school_classes") || "[]"));
    setSections(JSON.parse(localStorage.getItem("school_sections") || "[]"));
    setStudents(JSON.parse(localStorage.getItem("school_students") || "[]"));
    setMarks(JSON.parse(localStorage.getItem("school_exam_marks") || "[]"));
    setResults(JSON.parse(localStorage.getItem("school_exam_results") || "[]"));
  }, []);

  const filteredMarks = useMemo(() => {
    return marks.filter((item) =>
      item.examId === selectedExam &&
      item.className === selectedClass &&
      item.section === selectedSection
    );
  }, [selectedExam, selectedClass, selectedSection, marks]);

  useEffect(() => {
    if (!selectedExam || !selectedClass || !selectedSection) {
      setComputedResults([]);
      return;
    }

    const grouped = {};
    filteredMarks.forEach((item) => {
      if (!grouped[item.studentId]) {
        grouped[item.studentId] = {
          studentId: item.studentId,
          studentName: item.studentName,
          admissionNo: item.admissionNo,
          className: item.className,
          section: item.section,
          totalMarks: 0,
          marksObtained: 0,
          subjects: [],
          hasFailed: false,
          isAbsent: false,
        };
      }
      grouped[item.studentId].totalMarks += Number(item.maxMarks || 0);
      grouped[item.studentId].marksObtained += Number(item.marksObtained || 0);
      grouped[item.studentId].subjects.push(item);
      if (item.result !== "Pass") grouped[item.studentId].hasFailed = true;
      if (item.status === "Absent") grouped[item.studentId].isAbsent = true;
    });

    const rows = Object.values(grouped).map((student) => {
      const percentage = student.totalMarks ? (student.marksObtained / student.totalMarks) * 100 : 0;
      const grade = gradeFromPercentage(percentage);
      const resultStatus = student.isAbsent ? "Absent" : student.hasFailed ? "Fail" : "Pass";
      return {
        ...student,
        percentage: Number(percentage.toFixed(2)),
        grade,
        resultStatus,
      };
    });

    const sorted = [...rows].sort((a, b) => b.percentage - a.percentage);
    const withRank = sorted.map((row, index) => ({ ...row, rank: index + 1 }));
    setComputedResults(withRank);
  }, [filteredMarks]);

  const handlePublishResults = () => {
    if (computedResults.length === 0) {
      showToast("error", "No result records available to publish.");
      return;
    }
    const existingResults = JSON.parse(localStorage.getItem("school_exam_results") || "[]");
    const resultRecords = computedResults.map((row) => ({
      ...row,
      examId: selectedExam,
      examName: exams.find((exam) => exam.id === selectedExam)?.examName || "",
      publishedAt: new Date().toISOString(),
      published: true,
    }));
    const cleaned = existingResults.filter((item) => !(item.examId === selectedExam && item.className === selectedClass && item.section === selectedSection));
    const merged = [...cleaned, ...resultRecords];
    localStorage.setItem("school_exam_results", JSON.stringify(merged));

    const updatedExams = exams.map((exam) =>
      exam.id === selectedExam ? { ...exam, status: "Results Published" } : exam
    );
    localStorage.setItem("school_exams", JSON.stringify(updatedExams));
    setResults(merged);
    setExams(updatedExams);
    showToast("success", "Results published successfully.");
  };

  const handleView = (row) => {
    navigate(`/school/examinations/report-card?examId=${selectedExam}&className=${selectedClass}&section=${selectedSection}&studentId=${row.studentId}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const publishedResultsCount = results.filter((item) => item.examId === selectedExam && item.className === selectedClass && item.section === selectedSection).length;

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Results</h3>
            <p>Review student performance and publish final exam summaries.</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/school/examinations/dashboard")}>Back</button>
            <button className="btn btn-outline" onClick={handlePrint}>Print Result</button>
            <button className="btn btn-primary" onClick={handlePublishResults}>Publish Result</button>
          </div>
        </header>
        <ExamTabs />
        <div className="page">
          <div className="card">
            <div className="card-header">
              <h3>Filter Results</h3>
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
              </div>
            </div>
          </div>

          <div className="card mt-lg">
            <div className="card-header">
              <h3>Result Summary</h3>
            </div>
            {computedResults.length === 0 ? (
              <div className="empty-state">
                <p>No result records found. Please enter marks for the selected exam and section first.</p>
              </div>
            ) : (
              <>
                <div className="summary-card summary-card--blue">
                  <p>Total Students</p>
                  <h2>{computedResults.length}</h2>
                </div>
                <div className="summary-card summary-card--green">
                  <p>Published Results</p>
                  <h2>{publishedResultsCount}</h2>
                </div>
                <div className="summary-card summary-card--amber">
                  <p>Exam Status</p>
                  <h2>{exams.find((exam) => exam.id === selectedExam)?.status || "N/A"}</h2>
                </div>
                <div className="table-responsive mt-lg">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Admission No</th>
                        <th>Student Name</th>
                        <th>Total Marks</th>
                        <th>Marks Obtained</th>
                        <th>Percentage</th>
                        <th>Grade</th>
                        <th>Result Status</th>
                        <th>Rank</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {computedResults.map((row) => (
                        <tr key={row.studentId}>
                          <td>{row.admissionNo}</td>
                          <td>{row.studentName}</td>
                          <td>{row.totalMarks}</td>
                          <td>{row.marksObtained}</td>
                          <td>{row.percentage}%</td>
                          <td>{row.grade}</td>
                          <td><span className={statusBadge[row.resultStatus] || "badge badge-outline"}>{row.resultStatus}</span></td>
                          <td>{row.rank}</td>
                          <td className="table-action">
                            <button className="btn btn-outline btn-sm" onClick={() => handleView(row)}>View</button>
                            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>Print</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
