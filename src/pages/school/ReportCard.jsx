import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SchoolSidebar from "../../components/SchoolSidebar";
import ExamTabs from "../../components/ExamTabs";

const getGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "D";
  return "Fail";
};

export default function ReportCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [resultRecord, setResultRecord] = useState(null);
  const [student, setStudent] = useState(null);
  const [exam, setExam] = useState(null);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [subjectRows, setSubjectRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const examId = params.get("examId");
    const classNameParam = params.get("className");
    const sectionParam = params.get("section");
    const studentId = params.get("studentId");

    const students = JSON.parse(localStorage.getItem("school_students") || "[]");
    const exams = JSON.parse(localStorage.getItem("school_exams") || "[]");
    const results = JSON.parse(localStorage.getItem("school_exam_results") || "[]");
    const marks = JSON.parse(localStorage.getItem("school_exam_marks") || "[]");

    const studentProfile = students.find((s) => s.id === studentId);
    const selectedExam = exams.find((ex) => ex.id === examId);
    const resultRecord = results.find(
      (item) => item.examId === examId && item.className === classNameParam && item.section === sectionParam && item.studentId === studentId
    );
    const studentMarks = marks.filter(
      (item) => item.examId === examId && item.className === classNameParam && item.section === sectionParam && item.studentId === studentId
    );

    setStudent(studentProfile);
    setExam(selectedExam);
    setResultRecord(resultRecord);
    setClassName(classNameParam || "");
    setSection(sectionParam || "");

    const rows = studentMarks.map((item) => ({
      subject: item.subject,
      maxMarks: item.maxMarks,
      passMarks: item.passMarks,
      marksObtained: item.marksObtained,
      grade: item.grade,
      result: item.result,
      remarks: item.remarks || "",
    }));
    setSubjectRows(rows);

    if (studentProfile && selectedExam) {
      const totalMarks = rows.reduce((sum, subject) => sum + Number(subject.maxMarks), 0);
      const obtained = rows.reduce((sum, subject) => sum + Number(subject.marksObtained), 0);
      const percentage = totalMarks ? Number(((obtained / totalMarks) * 100).toFixed(2)) : 0;
      const finalStatus = rows.some((row) => row.result !== "Pass") ? "Fail" : "Pass";
      const overallGrade = getGrade(percentage);

      setReportData({
        totalMarks,
        obtained,
        percentage,
        overallGrade,
        finalStatus,
        rank: resultRecord?.rank || "-",
        teacherRemarks: "Good progress. Keep focusing on weak areas.",
      });
    }
    setLoading(false);
  }, [location.search]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return null;
  }

  if (!student || !exam || !reportData) {
    return (
      <div className="dashboard-layout">
        <SchoolSidebar />
        <div className="main-content">
          <header className="navbar">
            <div>
              <h3>Report Card</h3>
              <p>No report card data available for the selected student.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate("/school/examinations/results")}>Back</button>
          </header>
          <div className="page">
            <div className="card">
              <div className="empty-state">
                <p>Unable to load report card. Please return to the results page and select a valid student.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />
      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Report Card</h3>
            <p>Final report card for {student.name}</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/school/examinations/results")}>Back to Results</button>
            <button className="btn btn-outline" onClick={handlePrint}>Print Report Card</button>
          </div>
        </header>

        <div className="page">
          <div className="card print-area">
            <div className="card-header">
              <h2>{exam?.examName || "Examination Report Card"}</h2>
            </div>
            <div className="grid-2" style={{ gap: "28px" }}>
              <div className="card">
                <div className="card-header"><h3>Student Details</h3></div>
                <div className="profile-details-list">
                  <div className="profile-details-item"><span className="label">School Name</span><span className="value">Modern School ERP</span></div>
                  <div className="profile-details-item"><span className="label">Academic Year</span><span className="value">{exam.academicYear}</span></div>
                  <div className="profile-details-item"><span className="label">Exam Name</span><span className="value">{exam.examName}</span></div>
                  <div className="profile-details-item"><span className="label">Student Name</span><span className="value">{student.name}</span></div>
                  <div className="profile-details-item"><span className="label">Admission Number</span><span className="value">{student.admissionNo}</span></div>
                  <div className="profile-details-item"><span className="label">Class</span><span className="value">{student.className}</span></div>
                  <div className="profile-details-item"><span className="label">Section</span><span className="value">{student.section}</span></div>
                  <div className="profile-details-item"><span className="label">Roll Number</span><span className="value">{student.rollNo || student.admissionNo}</span></div>
                  <div className="profile-details-item"><span className="label">Parent Name</span><span className="value">{student.parentName || "-"}</span></div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><h3>Summary</h3></div>
                <div className="profile-details-list">
                  <div className="profile-details-item"><span className="label">Total Marks</span><span className="value">{reportData.totalMarks}</span></div>
                  <div className="profile-details-item"><span className="label">Marks Obtained</span><span className="value">{reportData.obtained}</span></div>
                  <div className="profile-details-item"><span className="label">Percentage</span><span className="value">{reportData.percentage}%</span></div>
                  <div className="profile-details-item"><span className="label">Overall Grade</span><span className="value">{reportData.overallGrade}</span></div>
                  <div className="profile-details-item"><span className="label">Final Result</span><span className="value">{reportData.finalStatus}</span></div>
                  <div className="profile-details-item"><span className="label">Rank</span><span className="value">{reportData.rank}</span></div>
                </div>
              </div>
            </div>

            <div className="card mt-lg">
              <div className="card-header"><h3>Subject-wise Performance</h3></div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Max Marks</th>
                      <th>Pass Marks</th>
                      <th>Marks Obtained</th>
                      <th>Grade</th>
                      <th>Result</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectRows.map((row) => (
                      <tr key={row.subject}>
                        <td>{row.subject}</td>
                        <td>{row.maxMarks}</td>
                        <td>{row.passMarks}</td>
                        <td>{row.marksObtained}</td>
                        <td>{row.grade}</td>
                        <td>{row.result}</td>
                        <td>{row.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid-2 mt-lg">
              <div className="card">
                <div className="card-header"><h3>Teacher Remarks</h3></div>
                <p>{reportData.teacherRemarks}</p>
              </div>
              <div className="card">
                <div className="card-header"><h3>Signatures</h3></div>
                <div className="profile-details-list">
                  <div className="profile-details-item"><span className="label">Class Teacher</span><span className="value">______________________</span></div>
                  <div className="profile-details-item"><span className="label">Principal</span><span className="value">______________________</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
