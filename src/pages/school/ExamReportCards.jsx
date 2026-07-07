import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolSidebar from "../../components/SchoolSidebar";
import ExamTabs from "../../components/ExamTabs";

export default function ExamReportCards() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setResults(JSON.parse(localStorage.getItem("school_exam_results") || "[]"));
    setStudents(JSON.parse(localStorage.getItem("school_students") || "[]"));
  }, []);

  useEffect(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const rows = results.filter((result) => {
      if (!normalizedSearch) {
        return true;
      }

      const student = students.find((s) => s.id === result.studentId) || {};
      const admissionNo = (student.admissionNo || "").toLowerCase();
      const studentName = (student.name || "").toLowerCase();
      const className = (result.className || "").toLowerCase();
      const sectionName = (result.section || "").toLowerCase();
      const examName = (result.examName || "").toLowerCase();
      const studentId = (result.studentId || "").toLowerCase();

      return (
        studentName.includes(normalizedSearch) ||
        admissionNo.includes(normalizedSearch) ||
        className.includes(normalizedSearch) ||
        sectionName.includes(normalizedSearch) ||
        studentId.includes(normalizedSearch) ||
        examName.includes(normalizedSearch)
      );
    });
    setFilteredRows(rows);
  }, [results, students, searchTerm]);

  const getStudent = (studentId) => students.find((s) => s.id === studentId) || {};

  const getImg = (result) => {
    return result.examName || "Report";
  };

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />
      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Report Cards</h3>
            <p>View generated report cards for published results.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/school/examinations/dashboard")}>Dashboard</button>
        </header>
        <ExamTabs />
        <div className="page">
          <div className="card">
            <div className="card-header">
              <h3>Search Report Cards</h3>
            </div>
            <div className="dashboard-form">
              <div className="form-group">
                <label>Search by student name, admission number, class, section, or ID</label>
                <input
                  id="report-search"
                  name="report-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student reports..."
                />
              </div>
            </div>
          </div>

          <div className="card mt-lg">
            <div className="card-header">
              <h3>Report Cards</h3>
            </div>
            {filteredRows.length === 0 ? (
              <div className="empty-state">
                <p>No report cards available for the selected filter.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Admission No</th>
                      <th>Exam</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const studentData = getStudent(row.studentId);
                      return (
                        <tr key={`${row.studentId}-${row.examId}`}>
                          <td>{studentData.name || "Unknown"}</td>
                          <td>{studentData.admissionNo || row.admissionNo}</td>
                          <td>{row.examName}</td>
                          <td>{row.className}</td>
                          <td>{row.section}</td>
                          <td>{row.percentage}%</td>
                          <td>{row.grade}</td>
                          <td>{row.resultStatus}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
