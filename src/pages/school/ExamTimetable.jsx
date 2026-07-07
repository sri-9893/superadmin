import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolSidebar from "../../components/SchoolSidebar";
import ExamTabs from "../../components/ExamTabs";
import PreviewModal from "../../components/PreviewModal";
import ActionMenu from "../../components/ActionMenu";
import { useUI } from "../../components/UIContext";

const SUBJECT_OPTIONS = ["Telugu", "Hindi", "English", "Maths", "Science", "Social", "Computer", "Physics", "Chemistry", "Biology"];

export default function ExamTimetable() {
  const navigate = useNavigate();
  const { showToast, confirm } = useUI();

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [timetable, setTimetable] = useState([]);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);
  const [passMarks, setPassMarks] = useState(35);
  const [roomNumber, setRoomNumber] = useState("");
  const [editId, setEditId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setExams(JSON.parse(localStorage.getItem("school_exams") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("school_classes") || "[]"));
    setSections(JSON.parse(localStorage.getItem("school_sections") || "[]"));
    setTimetable(JSON.parse(localStorage.getItem("school_exam_subjects") || "[]"));
  }, []);

  const saveTimetable = (items) => {
    setTimetable(items);
    localStorage.setItem("school_exam_subjects", JSON.stringify(items));
  };

  const resetForm = () => {
    setSelectedExam("");
    setSelectedClass("");
    setSelectedSection("");
    setSubject("");
    setExamDate("");
    setStartTime("");
    setEndTime("");
    setMaxMarks(100);
    setPassMarks(35);
    setRoomNumber("");
    setEditId(null);
    setErrorMessage("");
    setPreviewData(null);
    setShowPreview(false);
  };

  const getSectionsForClass = () => {
    const current = classes.find((cls) => cls.name === selectedClass);
    if (!current) return [];
    return sections.filter((section) => section.classId === current.id);
  };

  const parseMinutes = (value) => {
    if (!value) return 0;
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const validateEntry = () => {
    setErrorMessage("");
    if (!selectedExam || !selectedClass || !selectedSection || !subject || !examDate || !startTime || !endTime) {
      setErrorMessage("Please fill all required fields.");
      return false;
    }
    if (parseMinutes(endTime) <= parseMinutes(startTime)) {
      setErrorMessage("End time should be after start time.");
      return false;
    }
    if (Number(passMarks) > Number(maxMarks)) {
      setErrorMessage("Pass marks cannot exceed maximum marks.");
      return false;
    }

    const duplicate = timetable.find((item) => {
      if (editId && item.id === editId) return false;
      return (
        item.examId === selectedExam &&
        item.className === selectedClass &&
        item.section === selectedSection &&
        item.subject === subject
      );
    });
    if (duplicate) {
      setErrorMessage("This exam subject schedule already exists for the selected class and section.");
      return false;
    }
    return true;
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!validateEntry()) return;

    setPreviewData({
      examName: exams.find((exam) => exam.id === selectedExam)?.examName || "",
      className: selectedClass,
      section: selectedSection,
      subject,
      examDate,
      startTime,
      endTime,
      maxMarks,
      passMarks,
      roomNumber,
    });
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!validateEntry()) return;
    const examEntry = exams.find((exam) => exam.id === selectedExam);
    const newItem = {
      id: editId || `exam_subject_${Date.now()}`,
      examId: selectedExam,
      examName: examEntry?.examName || "",
      className: selectedClass,
      section: selectedSection,
      subject,
      examDate,
      startTime,
      endTime,
      maxMarks: Number(maxMarks),
      passMarks: Number(passMarks),
      roomNumber,
      createdAt: new Date().toISOString(),
    };
    const updated = editId
      ? timetable.map((item) => (item.id === editId ? newItem : item))
      : [newItem, ...timetable];
    saveTimetable(updated);
    setShowPreview(false);
    resetForm();
    showToast("success", editId ? "Schedule updated" : "Schedule added");
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setSelectedExam(item.examId);
    setSelectedClass(item.className);
    setSelectedSection(item.section);
    setSubject(item.subject);
    setExamDate(item.examDate);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setMaxMarks(item.maxMarks);
    setPassMarks(item.passMarks);
    setRoomNumber(item.roomNumber);
    setErrorMessage("");
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({ title: "Delete schedule", message: "Delete this exam timetable entry?" });
    if (!confirmed) return;
    const filtered = timetable.filter((item) => item.id !== id);
    saveTimetable(filtered);
    showToast("success", "Schedule deleted successfully.");
  };

  const handlePrint = () => {
    window.print();
  };

  const canCreate = exams.length > 0 && classes.length > 0 && sections.length > 0;

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Exam Timetable</h3>
            <p>Schedule subject-wise exam sessions and manage the exam calendar.</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/school/examinations/dashboard")}>Back</button>
            <button className="btn btn-outline" onClick={handlePrint}>Print Timetable</button>
          </div>
        </header>
        <ExamTabs />
        <div className="page">
          {!canCreate ? (
            <div className="card">
              <div className="empty-state">
                <p>Please add exams, classes, and sections before creating exam schedules.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="card-header">
                  <h3>{editId ? "Edit Timetable Entry" : "Add Exam Timetable"}</h3>
                </div>
                <form className="dashboard-form" onSubmit={handlePreview}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Select Exam</label>
                      <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                        <option value="">Choose exam</option>
                        {exams.map((exam) => (
                          <option key={exam.id} value={exam.id}>{exam.examName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Select Class</label>
                      <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                        <option value="">Choose class</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.name}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Select Section</label>
                      <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                        <option value="">Choose section</option>
                        {getSectionsForClass().map((section) => (
                          <option key={section.id} value={section.name}>{section.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                        <option value="">Choose subject</option>
                        {SUBJECT_OPTIONS.map((subjectItem) => (
                          <option key={subjectItem} value={subjectItem}>{subjectItem}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Exam Date</label>
                      <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Start Time</label>
                      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Max Marks</label>
                      <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Pass Marks</label>
                      <input type="number" min="0" value={passMarks} onChange={(e) => setPassMarks(e.target.value)} />
                    </div>
                    <div className="form-group full-width">
                      <label>Room Number</label>
                      <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="Room or hall number" />
                    </div>
                  </div>
                  {errorMessage && <div className="error-message">{errorMessage}</div>}
                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={resetForm}>Reset</button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/school/examinations/dashboard")}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Preview</button>
                  </div>
                </form>
              </div>

              <div className="card mt-lg">
                <div className="card-header">
                  <h3>Exam Timetable Entries</h3>
                </div>
                {timetable.length === 0 ? (
                  <div className="empty-state">
                    <p>No exam timetable entries created yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Exam Name</th>
                          <th>Class</th>
                          <th>Section</th>
                          <th>Subject</th>
                          <th>Exam Date</th>
                          <th>Time</th>
                          <th>Max Marks</th>
                          <th>Pass Marks</th>
                          <th>Room Number</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timetable.map((item) => (
                          <tr key={item.id}>
                            <td>{item.examName}</td>
                            <td>{item.className}</td>
                            <td>{item.section}</td>
                            <td>{item.subject}</td>
                            <td>{item.examDate}</td>
                            <td>{item.startTime} - {item.endTime}</td>
                            <td>{item.maxMarks}</td>
                            <td>{item.passMarks}</td>
                            <td>{item.roomNumber}</td>
                            <td className="table-action">
                              <ActionMenu onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
                              <button className="btn btn-secondary btn-sm" onClick={handlePrint}>Print</button>
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
          title={editId ? "Preview Timetable" : "Preview Timetable"}
          data={previewData}
          onClose={() => setShowPreview(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
