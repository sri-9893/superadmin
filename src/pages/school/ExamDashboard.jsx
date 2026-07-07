import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolSidebar from "../../components/SchoolSidebar";
import ExamTabs from "../../components/ExamTabs";
import { FiPlus, FiCalendar, FiBookOpen, FiTrendingUp, FiClock, FiCheckCircle } from "react-icons/fi";

const statusBadge = {
  Upcoming: "badge badge-info",
  Ongoing: "badge badge-warning",
  Completed: "badge badge-outline",
  "Results Published": "badge badge-success",
};

export default function ExamDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [results, setResults] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const storedExams = JSON.parse(localStorage.getItem("school_exams") || "[]");
    const storedSubjects = JSON.parse(localStorage.getItem("school_exam_subjects") || "[]");
    const storedMarks = JSON.parse(localStorage.getItem("school_exam_marks") || "[]");
    const storedResults = JSON.parse(localStorage.getItem("school_exam_results") || "[]");
    const classes = JSON.parse(localStorage.getItem("school_classes") || "[]");
    const sections = JSON.parse(localStorage.getItem("school_sections") || "[]");
    const students = JSON.parse(localStorage.getItem("school_students") || "[]");

    if (storedExams.length === 0 && classes.length && sections.length && students.length) {
      const sampleExams = [
        {
          id: "exam_quarterly_1",
          examName: "Quarterly Exam",
          academicYear: "2025-2026",
          examType: "Quarterly",
          startDate: "2025-10-15",
          endDate: "2025-10-20",
          status: "Upcoming",
          createdAt: "2025-09-12",
        },
        {
          id: "exam_halfyearly_1",
          examName: "Half Yearly Exam",
          academicYear: "2025-2026",
          examType: "Half Yearly",
          startDate: "2026-01-10",
          endDate: "2026-01-18",
          status: "Ongoing",
          createdAt: "2025-12-04",
        },
      ];
      localStorage.setItem("school_exams", JSON.stringify(sampleExams));
      setExams(sampleExams);
    } else {
      setExams(storedExams);
    }

    setSubjects(storedSubjects);
    setMarks(storedMarks);
    setResults(storedResults);
  }, []);

  useEffect(() => {
    const activityItems = [];

    exams.forEach((exam) => {
      activityItems.push({
        date: exam.createdAt || exam.startDate || new Date().toISOString(),
        title: `Exam created: ${exam.examName}`,
        type: "exam",
      });
    });

    subjects.forEach((item) => {
      activityItems.push({
        date: item.createdAt || item.examDate || new Date().toISOString(),
        title: `Timetable added: ${item.subject} for ${item.className} - ${item.section}`,
        type: "timetable",
      });
    });

    const marksGroups = {};
    marks.forEach((item) => {
      const key = `${item.examId}_${item.className}_${item.section}_${item.subject}`;
      marksGroups[key] = item;
    });
    Object.values(marksGroups).forEach((item) => {
      activityItems.push({
        date: item.updatedAt || new Date().toISOString(),
        title: `Marks entered: ${item.subject} for ${item.className} - ${item.section}`,
        type: "marks",
      });
    });

    results.forEach((item) => {
      activityItems.push({
        date: item.publishedAt || new Date().toISOString(),
        title: `Results published: ${item.examName} (${item.className} - ${item.section})`,
        type: "results",
      });
    });

    activityItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecentActivities(activityItems.slice(0, 6));
  }, [exams, subjects, marks, results]);

  const totalExams = exams.length;
  const upcomingExams = exams.filter((exam) => exam.status === "Upcoming").length;
  const completedExams = exams.filter((exam) => exam.status === "Completed").length;
  const publishedResults = exams.filter((exam) => exam.status === "Results Published").length;
  const passPercentage = results.length
    ? Math.round(
        results.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / results.length
      )
    : 0;

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Examination Dashboard</h3>
            <p>Overview of exam planning, schedules, marks and published results.</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => navigate("/school/examinations/create")}>Create Exam</button>
            <button className="btn btn-secondary" onClick={() => navigate("/school/examinations/timetable")}>Add Exam Timetable</button>
            <button className="btn btn-outline" onClick={() => navigate("/school/examinations/marks")}>Enter Marks</button>
            <button className="btn btn-outline" onClick={() => navigate("/school/examinations/results")}>View Results</button>
          </div>
        </header>
        <ExamTabs />
        <div className="page">
          <div className="grid-5 mb-lg">
            <div className="stat-card stat-card--blue">
              <div className="stat-card-header">
                <FiBookOpen className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Total Exams</p>
              <h3 className="stat-card-value">{totalExams}</h3>
              <p className="stat-card-trend">All planned exams</p>
            </div>

            <div className="stat-card stat-card--info">
              <div className="stat-card-header">
                <FiClock className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Upcoming Exams</p>
              <h3 className="stat-card-value">{upcomingExams}</h3>
              <p className="stat-card-trend">Scheduled for next sessions</p>
            </div>

            <div className="stat-card stat-card--amber">
              <div className="stat-card-header">
                <FiCalendar className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Completed Exams</p>
              <h3 className="stat-card-value">{completedExams}</h3>
              <p className="stat-card-trend">Finalized assessments</p>
            </div>

            <div className="stat-card stat-card--green">
              <div className="stat-card-header">
                <FiCheckCircle className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Results Published</p>
              <h3 className="stat-card-value">{publishedResults}</h3>
              <p className="stat-card-trend">Reports available to parents</p>
            </div>

            <div className="stat-card stat-card--red">
              <div className="stat-card-header">
                <FiTrendingUp className="stat-card-icon" />
              </div>
              <p className="stat-card-label">Pass Percentage</p>
              <h3 className="stat-card-value">{passPercentage}%</h3>
              <p className="stat-card-trend">Average published result</p>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h3>Recent Examination Activity</h3>
              </div>
              {recentActivities.length === 0 ? (
                <div className="empty-state">
                  <p>No examination activity has been recorded yet.</p>
                </div>
              ) : (
                <ul className="activity-list">
                  {recentActivities.map((item, index) => (
                    <li key={`${item.title}-${index}`}>
                      <div>
                        <strong>{item.title}</strong>
                        <small>{new Date(item.date).toLocaleDateString()}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Exam Planning</h3>
              </div>
              <p className="muted">Use the quick actions on the top bar to create exams, draft timetables, record marks, and publish results for parents.</p>
              <div className="quick-actions" style={{ marginTop: "18px" }}>
                <button className="btn btn-outline" onClick={() => navigate("/school/examinations/create")}>New Exam</button>
                <button className="btn btn-outline" onClick={() => navigate("/school/examinations/timetable")}>Exam Timetable</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
