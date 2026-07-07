import React, { useEffect, useState } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiBarChart2, FiTrendingUp, FiUsers, FiBookOpen, FiClipboard } from "react-icons/fi";

export default function SchoolReports() {
    const [reportSummary, setReportSummary] = useState({
        classes: 0,
        students: 0,
        teachers: 0,
        exams: 0,
        attendance: 0,
        results: 0,
    });

    useEffect(() => {
        const classes = JSON.parse(localStorage.getItem("school_classes") || "[]");
        const students = JSON.parse(localStorage.getItem("school_students") || "[]");
        const teachers = JSON.parse(localStorage.getItem("school_teachers") || "[]");
        const exams = JSON.parse(localStorage.getItem("school_exams") || "[]");
        const attendance = JSON.parse(localStorage.getItem("school_attendance") || "[]");
        const results = JSON.parse(localStorage.getItem("school_exam_results") || "[]");

        setReportSummary({
            classes: classes.length,
            students: students.length,
            teachers: teachers.length,
            exams: exams.length,
            attendance: attendance.length,
            results: results.length,
        });
    }, []);

    return (
        <div className="dashboard-layout">
            <SchoolSidebar />

            <div className="main-content">
                <header className="navbar">
                    <div>
                        <h3>School Reports</h3>
                        <p>Insights and summary data for your school operations.</p>
                    </div>
                </header>

                <div className="page">
                    <div className="grid-5 mb-lg">
                        <div className="stat-card stat-card--blue">
                            <div className="stat-card-header">
                                <FiUsers className="stat-card-icon" />
                            </div>
                            <p className="stat-card-label">Students</p>
                            <h3 className="stat-card-value">{reportSummary.students}</h3>
                            <p className="stat-card-trend">Total active students</p>
                        </div>
                        <div className="stat-card stat-card--green">
                            <div className="stat-card-header">
                                <FiBookOpen className="stat-card-icon" />
                            </div>
                            <p className="stat-card-label">Classes</p>
                            <h3 className="stat-card-value">{reportSummary.classes}</h3>
                            <p className="stat-card-trend">Classes registered</p>
                        </div>
                        <div className="stat-card stat-card--amber">
                            <div className="stat-card-header">
                                <FiTrendingUp className="stat-card-icon" />
                            </div>
                            <p className="stat-card-label">Teachers</p>
                            <h3 className="stat-card-value">{reportSummary.teachers}</h3>
                            <p className="stat-card-trend">Assigned instructors</p>
                        </div>
                        <div className="stat-card stat-card--red">
                            <div className="stat-card-header">
                                <FiClipboard className="stat-card-icon" />
                            </div>
                            <p className="stat-card-label">Exams</p>
                            <h3 className="stat-card-value">{reportSummary.exams}</h3>
                            <p className="stat-card-trend">Planned assessments</p>
                        </div>
                        <div className="stat-card stat-card--info">
                            <div className="stat-card-header">
                                <FiBarChart2 className="stat-card-icon" />
                            </div>
                            <p className="stat-card-label">Results Published</p>
                            <h3 className="stat-card-value">{reportSummary.results}</h3>
                            <p className="stat-card-trend">Reports generated</p>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="card">
                            <div className="card-header">
                                <h3>Attendance Overview</h3>
                            </div>
                            <p className="muted">
                                A total of {reportSummary.attendance} attendance entries are available for your review.
                            </p>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3>Reporting Notes</h3>
                            </div>
                            <p className="muted">
                                Reports are generated from your current school data. If counts appear low, add class, student, teacher or exam data in the corresponding sections.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
