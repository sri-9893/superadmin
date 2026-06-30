import React, { useState, useEffect } from "react";
import SchoolSidebar from "../../components/SchoolSidebar";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { useUI } from "../../components/UIContext";

export default function Classes() {
  const { showToast, confirm } = useUI();

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Form states
  const [classNameInput, setClassNameInput] = useState("");
  const [editClassId, setEditClassId] = useState(null);
  const [editClassName, setEditClassName] = useState("");

  const [sectionNameInput, setSectionNameInput] = useState("");
  const [selectedClassIdForSection, setSelectedClassIdForSection] = useState("");
  const [editSectionId, setEditSectionId] = useState(null);
  const [editSectionName, setEditSectionName] = useState("");
  const [editSectionClassId, setEditSectionClassId] = useState("");

  const [subjectNameInput, setSubjectNameInput] = useState("");
  const [selectedClassIdForSubject, setSelectedClassIdForSubject] = useState("");
  const [editSubjectId, setEditSubjectId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectClassId, setEditSubjectClassId] = useState("");

  // Load from localStorage
  useEffect(() => {
    const storedClasses = JSON.parse(localStorage.getItem("school_classes") || "[]");
    const storedSections = JSON.parse(localStorage.getItem("school_sections") || "[]");
    const storedSubjects = JSON.parse(localStorage.getItem("school_subjects") || "[]");
    
    // Default mock data if empty
    if (storedClasses.length === 0) {
      const defaultClasses = [
        { id: "c1", name: "Class 1" },
        { id: "c2", name: "Class 2" }
      ];
      const defaultSections = [
        { id: "s1", classId: "c1", name: "A" },
        { id: "s2", classId: "c1", name: "B" },
        { id: "s3", classId: "c2", name: "A" },
        { id: "s4", classId: "c2", name: "B" }
      ];
      const defaultSubjects = [
        { id: "sub1", classId: "c1", name: "English" },
        { id: "sub2", classId: "c1", name: "Maths" },
        { id: "sub3", classId: "c2", name: "Physics" },
        { id: "sub4", classId: "c2", name: "Chemistry" }
      ];
      localStorage.setItem("school_classes", JSON.stringify(defaultClasses));
      localStorage.setItem("school_sections", JSON.stringify(defaultSections));
      localStorage.setItem("school_subjects", JSON.stringify(defaultSubjects));
      setClasses(defaultClasses);
      setSections(defaultSections);
      setSubjects(defaultSubjects);
    } else {
      setClasses(storedClasses);
      setSections(storedSections);
      setSubjects(storedSubjects);
    }
  }, []);

  // Sync to localStorage
  const saveClasses = (newClasses) => {
    setClasses(newClasses);
    localStorage.setItem("school_classes", JSON.stringify(newClasses));
  };

  const saveSections = (newSections) => {
    setSections(newSections);
    localStorage.setItem("school_sections", JSON.stringify(newSections));
  };

  const saveSubjects = (newSubjects) => {
    setSubjects(newSubjects);
    localStorage.setItem("school_subjects", JSON.stringify(newSubjects));
  };

  // Class Actions
  const handleAddClass = (e) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    const newClass = {
      id: "class_" + Date.now(),
      name: classNameInput.trim()
    };

    const updated = [...classes, newClass];
    saveClasses(updated);
    setClassNameInput("");
    showToast("success", "Class added successfully!");
  };

  const handleUpdateClass = (e) => {
    e.preventDefault();
    if (!editClassName.trim() || !editClassId) return;

    const updated = classes.map(c => c.id === editClassId ? { ...c, name: editClassName.trim() } : c);
    saveClasses(updated);
    setEditClassId(null);
    setEditClassName("");
    showToast("success", "Class updated successfully!");
  };

  const handleDeleteClass = async (id) => {
    const confirmed = await confirm({
      title: "Delete Class",
      message: "Are you sure you want to delete this class? This will also remove sections and subjects under it."
    });
    if (!confirmed) return;
    
    const updatedClasses = classes.filter(c => c.id !== id);
    const updatedSections = sections.filter(s => s.classId !== id);
    const updatedSubjects = subjects.filter(sub => sub.classId !== id);
    
    saveClasses(updatedClasses);
    saveSections(updatedSections);
    saveSubjects(updatedSubjects);
    showToast("success", "Class deleted successfully!");
  };

  // Section Actions
  const handleAddSection = (e) => {
    e.preventDefault();
    if (!sectionNameInput.trim() || !selectedClassIdForSection) return;

    const newSection = {
      id: "section_" + Date.now(),
      classId: selectedClassIdForSection,
      name: sectionNameInput.trim()
    };

    const updated = [...sections, newSection];
    saveSections(updated);
    setSectionNameInput("");
    showToast("success", "Section added successfully!");
  };

  const handleUpdateSection = (e) => {
    e.preventDefault();
    if (!editSectionName.trim() || !editSectionId || !editSectionClassId) return;

    const updated = sections.map(s => s.id === editSectionId ? { ...s, name: editSectionName.trim(), classId: editSectionClassId } : s);
    saveSections(updated);
    setEditSectionId(null);
    setEditSectionName("");
    setEditSectionClassId("");
    showToast("success", "Section updated successfully!");
  };

  const handleDeleteSection = async (id) => {
    const confirmed = await confirm({
      title: "Delete Section",
      message: "Are you sure you want to delete this section?"
    });
    if (!confirmed) return;
    const updated = sections.filter(s => s.id !== id);
    saveSections(updated);
    showToast("success", "Section deleted successfully!");
  };

  // Subject Actions
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!subjectNameInput.trim() || !selectedClassIdForSubject) return;

    const newSubject = {
      id: "subject_" + Date.now(),
      classId: selectedClassIdForSubject,
      name: subjectNameInput.trim()
    };

    const updated = [...subjects, newSubject];
    saveSubjects(updated);
    setSubjectNameInput("");
    showToast("success", "Subject added successfully!");
  };

  const handleUpdateSubject = (e) => {
    e.preventDefault();
    if (!editSubjectName.trim() || !editSubjectId || !editSubjectClassId) return;

    const updated = subjects.map(sub => sub.id === editSubjectId ? { ...sub, name: editSubjectName.trim(), classId: editSubjectClassId } : sub);
    saveSubjects(updated);
    setEditSubjectId(null);
    setEditSubjectName("");
    setEditSubjectClassId("");
    showToast("success", "Subject updated successfully!");
  };

  const handleDeleteSubject = async (id) => {
    const confirmed = await confirm({
      title: "Delete Subject",
      message: "Are you sure you want to delete this subject?"
    });
    if (!confirmed) return;
    const updated = subjects.filter(sub => sub.id !== id);
    saveSubjects(updated);
    showToast("success", "Subject deleted successfully!");
  };

  return (
    <div className="dashboard-layout">
      <SchoolSidebar />

      <div className="main-content">
        <header className="navbar">
          <div>
            <h3>Classes, Sections & Subjects</h3>
            <p>Configure grade structures, sections, and assigned syllabus subjects</p>
          </div>
        </header>

        <div className="page">
          <div className="grid-3 mb-lg">
            {/* Class Operations */}
            <div className="card">
              <div className="card-header">
                <h3>{editClassId ? "Edit Class" : "Add Class"}</h3>
              </div>
              <form onSubmit={editClassId ? handleUpdateClass : handleAddClass} className="dashboard-form">
                <div className="form-group">
                  <label htmlFor="className">Class Name *</label>
                  <input
                    id="className"
                    type="text"
                    placeholder="e.g. Class 1 or Grade 10"
                    value={editClassId ? editClassName : classNameInput}
                    onChange={(e) => editClassId ? setEditClassName(e.target.value) : setClassNameInput(e.target.value)}
                    required
                  />
                </div>
                <div className="form-actions">
                  {editClassId && (
                    <button type="button" className="btn btn-secondary" onClick={() => setEditClassId(null)}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editClassId ? "Update" : "Add Class"}
                  </button>
                </div>
              </form>
            </div>

            {/* Section Operations */}
            <div className="card">
              <div className="card-header">
                <h3>{editSectionId ? "Edit Section" : "Add Section"}</h3>
              </div>
              <form onSubmit={editSectionId ? handleUpdateSection : handleAddSection} className="dashboard-form">
                <div className="form-group">
                  <label htmlFor="selectClass">Select Class *</label>
                  <select
                    id="selectClass"
                    value={editSectionId ? editSectionClassId : selectedClassIdForSection}
                    onChange={(e) => editSectionId ? setEditSectionClassId(e.target.value) : setSelectedClassIdForSection(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sectionName">Section Name *</label>
                  <input
                    id="sectionName"
                    type="text"
                    placeholder="e.g. A, B, or C"
                    value={editSectionId ? editSectionName : sectionNameInput}
                    onChange={(e) => editSectionId ? setEditSectionName(e.target.value) : setSectionNameInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  {editSectionId && (
                    <button type="button" className="btn btn-secondary" onClick={() => setEditSectionId(null)}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editSectionId ? "Update" : "Add Section"}
                  </button>
                </div>
              </form>
            </div>

            {/* Subject Operations */}
            <div className="card">
              <div className="card-header">
                <h3>{editSubjectId ? "Edit Subject" : "Add Subject"}</h3>
              </div>
              <form onSubmit={editSubjectId ? handleUpdateSubject : handleAddSubject} className="dashboard-form">
                <div className="form-group">
                  <label htmlFor="selectClassSub">Select Class *</label>
                  <select
                    id="selectClassSub"
                    value={editSubjectId ? editSubjectClassId : selectedClassIdForSubject}
                    onChange={(e) => editSubjectId ? setEditSubjectClassId(e.target.value) : setSelectedClassIdForSubject(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subjectName">Subject Name *</label>
                  <input
                    id="subjectName"
                    type="text"
                    placeholder="e.g. English or Physics"
                    value={editSubjectId ? editSubjectName : subjectNameInput}
                    onChange={(e) => editSubjectId ? setEditSubjectName(e.target.value) : setSubjectNameInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  {editSubjectId && (
                    <button type="button" className="btn btn-secondary" onClick={() => setEditSubjectId(null)}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editSubjectId ? "Update" : "Add Subject"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Classes, Sections & Subjects Directory */}
          <div className="card">
            <div className="card-header">
              <h3>Class-wise Configuration Directory</h3>
            </div>
            
            {classes.length === 0 ? (
              <div className="empty-state">
                <p>No classes, sections, or subjects configured yet. Please configure them above.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: "20%" }}>Class Name</th>
                      <th style={{ width: "30%" }}>Sections</th>
                      <th style={{ width: "35%" }}>Syllabus Subjects</th>
                      <th style={{ width: "15%" }}>Class Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(c => {
                      const classSections = sections.filter(s => s.classId === c.id);
                      const classSubjects = subjects.filter(sub => sub.classId === c.id);
                      return (
                        <tr key={c.id}>
                          <td><strong>{c.name}</strong></td>
                          <td>
                            <div className="sections-pill-container" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {classSections.length === 0 ? (
                                <span className="text-muted">No sections assigned</span>
                              ) : (
                                classSections.map(s => (
                                  <span key={s.id} className="badge badge-info mr-sm section-pill-edit" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    {s.name}
                                    <button 
                                      className="section-mini-btn" 
                                      title="Edit Section" 
                                      onClick={() => {
                                        setEditSectionId(s.id);
                                        setEditSectionName(s.name);
                                        setEditSectionClassId(s.classId);
                                      }}
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      className="section-mini-btn delete" 
                                      title="Delete Section" 
                                      onClick={() => handleDeleteSection(s.id)}
                                    >
                                      🗑️
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="sections-pill-container" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {classSubjects.length === 0 ? (
                                <span className="text-muted">No subjects assigned</span>
                              ) : (
                                classSubjects.map(sub => (
                                  <span key={sub.id} className="badge badge-warning mr-sm section-pill-edit" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    {sub.name}
                                    <button 
                                      className="section-mini-btn" 
                                      title="Edit Subject" 
                                      onClick={() => {
                                        setEditSubjectId(sub.id);
                                        setEditSubjectName(sub.name);
                                        setEditSubjectClassId(sub.classId);
                                      }}
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      className="section-mini-btn delete" 
                                      title="Delete Subject" 
                                      onClick={() => handleDeleteSubject(sub.id)}
                                    >
                                      🗑️
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="table-action">
                              <button 
                                className="btn btn-outline btn-sm" 
                                onClick={() => {
                                  setEditClassId(c.id);
                                  setEditClassName(c.name);
                                }}
                              >
                                <FiEdit /> Edit
                              </button>
                              <button 
                                className="btn btn-danger btn-sm" 
                                onClick={() => handleDeleteClass(c.id)}
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          </td>
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
