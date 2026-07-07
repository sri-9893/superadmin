import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolSidebar from "../../components/SchoolSidebar";
import ExamTabs from "../../components/ExamTabs";
import PreviewModal from "../../components/PreviewModal";
import ActionMenu from "../../components/ActionMenu";
import { useUI } from "../../components/UIContext";

const examTypes = ["Unit Test", "Quarterly", "Half Yearly", "Annual", "Final Exam"];
const statusOptions = ["Upcoming", "Ongoing", "Completed", "Results Published"];

export default function CreateExam() {
    const navigate = useNavigate();
    const { showToast, confirm } = useUI();
    const statusBadge = (status) => {
        if (status === "Completed") return "badge-success";
        if (status === "Scheduled") return "badge-info";
        if (status === "Draft") return "badge-warning";
        if (status === "Cancelled") return "badge-danger";
        return "badge-outline";
    };

    const [exams, setExams] = useState([]);
    const [examName, setExamName] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [examType, setExamType] = useState(examTypes[0]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState(statusOptions[0]);
    const [editId, setEditId] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [classesExist, setClassesExist] = useState(true);
    const [sectionsExist, setSectionsExist] = useState(true);
    const [studentsExist, setStudentsExist] = useState(true);

    useEffect(() => {
        const storedExams = JSON.parse(localStorage.getItem("school_exams") || "[]");
        setExams(storedExams);

        const classes = JSON.parse(localStorage.getItem("school_classes") || "[]");
        const sections = JSON.parse(localStorage.getItem("school_sections") || "[]");
        const students = JSON.parse(localStorage.getItem("school_students") || "[]");
        setClassesExist(classes.length > 0);
        setSectionsExist(sections.length > 0);
        setStudentsExist(students.length > 0);
    }, []);

    const saveExams = (items) => {
        setExams(items);
        localStorage.setItem("school_exams", JSON.stringify(items));
    };

    const resetForm = () => {
        setExamName("");
        setAcademicYear("");
        setExamType(examTypes[0]);
        setStartDate("");
        setEndDate("");
        setStatus(statusOptions[0]);
        setEditId(null);
    };

    const handlePreview = (e) => {
        e.preventDefault();
        if (!examName || !academicYear || !examType || !startDate || !endDate) {
            showToast("error", "Please fill all required exam fields.");
            return;
        }
        setPreviewData({ examName, academicYear, examType, startDate, endDate, status });
        setShowPreview(true);
    };

    const handleConfirmSubmit = async () => {
        if (!previewData) return;

        const entry = {
            id: editId || `exam_${Date.now()}`,
            examName: previewData.examName,
            academicYear: previewData.academicYear,
            examType: previewData.examType,
            startDate: previewData.startDate,
            endDate: previewData.endDate,
            status: previewData.status,
            createdAt: new Date().toISOString(),
        };

        const updated = editId
            ? exams.map((exam) => (exam.id === editId ? entry : exam))
            : [entry, ...exams];

        saveExams(updated);
        setShowPreview(false);
        resetForm();
        showToast("success", `Exam ${editId ? "updated" : "saved"} successfully.`);
    };

    const handleEdit = (exam) => {
        setEditId(exam.id);
        setExamName(exam.examName);
        setAcademicYear(exam.academicYear);
        setExamType(exam.examType);
        setStartDate(exam.startDate);
        setEndDate(exam.endDate);
        setStatus(exam.status);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: "Delete Exam",
            message: "Are you sure you want to delete this exam record?",
        });
        if (!confirmed) return;
        const filtered = exams.filter((exam) => exam.id !== id);
        saveExams(filtered);
        showToast("success", "Exam deleted successfully.");
    };

    const handleView = (exam) => {
        setPreviewData(exam);
        setShowPreview(true);
    };

    const canCreate = classesExist && sectionsExist && studentsExist;

    return (
        <div className="dashboard-layout">
            <SchoolSidebar />

            <div className="main-content">
                <header className="navbar">
                    <div>
                        <h3>Create Exam</h3>
                        <p>Design exam schedules and track status in the examination module.</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate("/school/examinations/dashboard")}>Back to Dashboard</button>
                </header>
                <ExamTabs />
                <div className="page">
                    {!canCreate ? (
                        <div className="card">
                            <div className="empty-state">
                                <p>Please add students, classes, and sections before creating examination records.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="card">
                                <div className="card-header">
                                    <h3>{editId ? "Edit Exam" : "New Exam"}</h3>
                                </div>
                                <form className="dashboard-form" onSubmit={handlePreview}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Exam Name</label>
                                            <input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Enter exam name" />
                                        </div>
                                        <div className="form-group">
                                            <label>Academic Year</label>
                                            <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="e.g. 2025-2026" />
                                        </div>
                                        <div className="form-group">
                                            <label>Exam Type</label>
                                            <select value={examType} onChange={(e) => setExamType(e.target.value)}>
                                                {examTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Start Date</label>
                                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>End Date</label>
                                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Status</label>
                                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                                {statusOptions.map((item) => (
                                                    <option key={item} value={item}>{item}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn btn-outline" onClick={() => { resetForm(); setShowPreview(false); }}>Reset</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => navigate("/school/dashboard")}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Preview</button>
                                    </div>
                                </form>
                            </div>

                            <div className="card mt-lg">
                                <div className="card-header">
                                    <h3>Saved Exams</h3>
                                </div>
                                {exams.length === 0 ? (
                                    <div className="empty-state">
                                        <p>No exams found. Create a new exam to begin your schedule.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Exam Name</th>
                                                    <th>Academic Year</th>
                                                    <th>Exam Type</th>
                                                    <th>Start Date</th>
                                                    <th>End Date</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exams.map((exam) => (
                                                    <tr key={exam.id}>
                                                        <td>{exam.examName}</td>
                                                        <td>{exam.academicYear}</td>
                                                        <td>{exam.examType}</td>
                                                        <td>{exam.startDate}</td>
                                                        <td>{exam.endDate}</td>
                                                        <td><span className={statusBadge[exam.status] || "badge badge-outline"}>{exam.status}</span></td>
                                                        <td className="table-action">
                                                            <ActionMenu onEdit={() => handleEdit(exam)} onDelete={() => handleDelete(exam.id)} />
                                                            <button className="btn btn-secondary btn-sm" onClick={() => handleView(exam)}>View</button>
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
                </div>
            </div>

            {showPreview && previewData && (
                <PreviewModal
                    title={editId ? "Preview Exam" : "Preview Exam"}
                    data={previewData}
                    onClose={() => setShowPreview(false)}
                    onSubmit={handleConfirmSubmit}
                />
            )}
        </div>
    );
}
