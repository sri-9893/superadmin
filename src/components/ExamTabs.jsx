import React from "react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { label: "Dashboard", path: "/school/examinations/dashboard" },
  { label: "Create Exam", path: "/school/examinations/create" },
  { label: "Exam Timetable", path: "/school/examinations/timetable" },
  { label: "Marks Entry", path: "/school/examinations/marks" },
  { label: "Results", path: "/school/examinations/results" },
  { label: "Report Cards", path: "/school/examinations/report-cards" },
];

export default function ExamTabs() {
  const location = useLocation();

  return (
    <div className="exam-tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`exam-tab ${location.pathname === tab.path ? "active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
