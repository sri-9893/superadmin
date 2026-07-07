/**
 * School Service - Wrapper Module
 * 
 * This module acts as the main export interface for all school-related services.
 * It imports and re-exports all functionality from schoolService.local.js
 * 
 * Future backend integration: Simply replace imports here with API calls
 * without needing to update all page imports.
 */

export {
  // Schools
  getSchools,
  createSchool,
  updateSchool,
  deleteSchool,

  // Classes
  getClasses,
  addClass,
  updateClass,
  deleteClass,

  // Sections
  getSections,
  addSection,
  updateSection,
  deleteSection,
  getSectionsByClass,

  // Subjects
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByClass,

  // Students
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass,

  // Teachers
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachersBySubject,

  // Attendance
  getAttendance,
  markAttendance,
  getAttendanceByStudent,
  deleteAttendance,

  // Timetable
  getTimetable,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getTimetableByClass,

  // Fees
  getFees,
  addFeeRecord,
  updateFeeRecord,
  deleteFeeRecord,
  getFeesByStudent,

  // Notices
  getNotices,
  addNotice,
  updateNotice,
  deleteNotice,

  // Calendar Events
  getCalendarEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,

  // Exam Marks
  getExamMarks,
  addExamMarks,
  updateExamMarks,
  deleteExamMarks,
  getExamMarksByStudent,

  // User Credentials
  saveParentCredentials,
  saveCashierCredentials,
  saveInchargeCredentials,
  getParentCredentials,
  getCashierCredentials,
  getInchargeCredentials,
} from "./schoolService.local";