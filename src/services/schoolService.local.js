/**
 * School Service - Local Storage Implementation
 * Handles all school-related data persistence using localStorage
 * This service manages: classes, sections, subjects, students, teachers,
 * attendance, timetable, fees, notices, calendar events, exam marks, and user credentials
 */

// Storage Keys
const STORAGE_KEYS = {
    SCHOOLS: "school_schools",
    CLASSES: "school_classes",
    SECTIONS: "school_sections",
    SUBJECTS: "school_subjects",
    STUDENTS: "school_students",
    TEACHERS: "school_teachers",
    ATTENDANCE: "school_attendance",
    ATTENDANCE_APPROVALS: "school_attendance_approvals",
    TIMETABLE: "school_timetable",
    FEES: "school_fees",
    NOTICES: "school_notices",
    CALENDAR: "school_calendar",
    EXAM_MARKS: "school_exam_marks",
    PARENT_USERS: "school_parent_users",
    CASHIER_USERS: "school_cashier_users",
    INCHARGE_USERS: "school_incharge_users",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Read a list from localStorage
 * @param {string} key - Storage key
 * @param {array} fallback - Default value if key doesn't exist
 * @returns {array} Parsed data or fallback
 */
function readStoredList(key, fallback = []) {
    if (typeof window === "undefined") return fallback;

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

/**
 * Write a list to localStorage
 * @param {string} key - Storage key
 * @param {array} value - Data to store
 */
function writeStoredList(key, value) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Generate a unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Generated ID
 */
function generateId(prefix = "item") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// SCHOOLS
// ============================================================================

/**
 * Initialize default schools if none exist
 */
function initializeDefaultSchools() {
    const schools = readStoredList(STORAGE_KEYS.SCHOOLS, []);
    if (schools.length === 0) {
        const defaultSchools = [
            {
                schoolId: "SCH001",
                schoolName: "High School",
                registrationNumber: "REG12345",
                joiningDate: "2026-06-24",
                subscriptionPeriod: "1 Year",
                price: "Rs. 25,000",
                endDate: "2027-06-24",
                status: "Active",
            },
        ];
        writeStoredList(STORAGE_KEYS.SCHOOLS, defaultSchools);
    }
}

export function getSchools() {
    initializeDefaultSchools();
    return readStoredList(STORAGE_KEYS.SCHOOLS, []);
}

export async function createSchool(data) {
    const schools = readStoredList(STORAGE_KEYS.SCHOOLS, []);
    const newSchool = {
        schoolId: data.schoolId || generateId("SCH"),
        schoolName: data.schoolName || "",
        registrationNumber: data.registrationNumber || "",
        joiningDate: data.joiningDate || new Date().toISOString().split("T")[0],
        subscriptionPeriod: data.subscriptionPeriod || "",
        price: data.price || "",
        endDate: data.endDate || "",
        status: data.status || "Active",
    };

    schools.push(newSchool);
    writeStoredList(STORAGE_KEYS.SCHOOLS, schools);

    return {
        success: true,
        data: newSchool,
    };
}

export async function updateSchool(schoolId, data) {
    const schools = readStoredList(STORAGE_KEYS.SCHOOLS, []);
    const index = schools.findIndex((s) => s.schoolId === schoolId);

    if (index === -1) {
        throw new Error("School not found");
    }

    schools[index] = {
        ...schools[index],
        ...data,
        schoolId,
    };

    writeStoredList(STORAGE_KEYS.SCHOOLS, schools);
    return schools[index];
}

export async function deleteSchool(schoolId) {
    const schools = readStoredList(STORAGE_KEYS.SCHOOLS, []);
    const filtered = schools.filter((s) => s.schoolId !== schoolId);
    writeStoredList(STORAGE_KEYS.SCHOOLS, filtered);
    return true;
}

// ============================================================================
// CLASSES
// ============================================================================

export function getClasses() {
    return readStoredList(STORAGE_KEYS.CLASSES, []);
}

export function addClass(className) {
    const classes = readStoredList(STORAGE_KEYS.CLASSES, []);
    const newClass = {
        id: generateId("class"),
        name: className,
    };
    classes.push(newClass);
    writeStoredList(STORAGE_KEYS.CLASSES, classes);
    return newClass;
}

export function updateClass(classId, className) {
    const classes = readStoredList(STORAGE_KEYS.CLASSES, []);
    const index = classes.findIndex((c) => c.id === classId);
    if (index === -1) throw new Error("Class not found");
    classes[index].name = className;
    writeStoredList(STORAGE_KEYS.CLASSES, classes);
    return classes[index];
}

export function deleteClass(classId) {
    const classes = readStoredList(STORAGE_KEYS.CLASSES, []).filter(
        (c) => c.id !== classId
    );
    writeStoredList(STORAGE_KEYS.CLASSES, classes);
    return true;
}

// ============================================================================
// SECTIONS
// ============================================================================

export function getSections() {
    return readStoredList(STORAGE_KEYS.SECTIONS, []);
}

export function addSection(classId, sectionName) {
    const sections = readStoredList(STORAGE_KEYS.SECTIONS, []);
    const newSection = {
        id: generateId("section"),
        classId,
        name: sectionName,
    };
    sections.push(newSection);
    writeStoredList(STORAGE_KEYS.SECTIONS, sections);
    return newSection;
}

export function updateSection(sectionId, classId, sectionName) {
    const sections = readStoredList(STORAGE_KEYS.SECTIONS, []);
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index === -1) throw new Error("Section not found");
    sections[index] = { ...sections[index], classId, name: sectionName };
    writeStoredList(STORAGE_KEYS.SECTIONS, sections);
    return sections[index];
}

export function deleteSection(sectionId) {
    const sections = readStoredList(STORAGE_KEYS.SECTIONS, []).filter(
        (s) => s.id !== sectionId
    );
    writeStoredList(STORAGE_KEYS.SECTIONS, sections);
    return true;
}

export function getSectionsByClass(classId) {
    return readStoredList(STORAGE_KEYS.SECTIONS, []).filter(
        (s) => s.classId === classId
    );
}

// ============================================================================
// SUBJECTS
// ============================================================================

export function getSubjects() {
    return readStoredList(STORAGE_KEYS.SUBJECTS, []);
}

export function addSubject(classId, subjectName) {
    const subjects = readStoredList(STORAGE_KEYS.SUBJECTS, []);
    const newSubject = {
        id: generateId("subject"),
        classId,
        name: subjectName,
    };
    subjects.push(newSubject);
    writeStoredList(STORAGE_KEYS.SUBJECTS, subjects);
    return newSubject;
}

export function updateSubject(subjectId, classId, subjectName) {
    const subjects = readStoredList(STORAGE_KEYS.SUBJECTS, []);
    const index = subjects.findIndex((s) => s.id === subjectId);
    if (index === -1) throw new Error("Subject not found");
    subjects[index] = { ...subjects[index], classId, name: subjectName };
    writeStoredList(STORAGE_KEYS.SUBJECTS, subjects);
    return subjects[index];
}

export function deleteSubject(subjectId) {
    const subjects = readStoredList(STORAGE_KEYS.SUBJECTS, []).filter(
        (s) => s.id !== subjectId
    );
    writeStoredList(STORAGE_KEYS.SUBJECTS, subjects);
    return true;
}

export function getSubjectsByClass(classId) {
    return readStoredList(STORAGE_KEYS.SUBJECTS, []).filter(
        (s) => s.classId === classId
    );
}

// ============================================================================
// STUDENTS
// ============================================================================

export function getStudents() {
    return readStoredList(STORAGE_KEYS.STUDENTS, []);
}

export function addStudent(studentData) {
    const students = readStoredList(STORAGE_KEYS.STUDENTS, []);
    const newStudent = {
        id: generateId("student"),
        ...studentData,
        createdAt: new Date().toISOString(),
    };
    students.push(newStudent);
    writeStoredList(STORAGE_KEYS.STUDENTS, students);
    return newStudent;
}

export function updateStudent(studentId, studentData) {
    const students = readStoredList(STORAGE_KEYS.STUDENTS, []);
    const index = students.findIndex((s) => s.id === studentId);
    if (index === -1) throw new Error("Student not found");
    students[index] = {
        ...students[index],
        ...studentData,
        id: studentId,
    };
    writeStoredList(STORAGE_KEYS.STUDENTS, students);
    return students[index];
}

export function deleteStudent(studentId) {
    const students = readStoredList(STORAGE_KEYS.STUDENTS, []).filter(
        (s) => s.id !== studentId
    );
    writeStoredList(STORAGE_KEYS.STUDENTS, students);
    return true;
}

export function getStudentsByClass(classId) {
    return readStoredList(STORAGE_KEYS.STUDENTS, []).filter(
        (s) => s.selectedClass === classId
    );
}

// ============================================================================
// TEACHERS
// ============================================================================

export function getTeachers() {
    return readStoredList(STORAGE_KEYS.TEACHERS, []);
}

export function addTeacher(teacherData) {
    const teachers = readStoredList(STORAGE_KEYS.TEACHERS, []);
    const newTeacher = {
        id: generateId("teacher"),
        ...teacherData,
        createdAt: new Date().toISOString(),
    };
    teachers.push(newTeacher);
    writeStoredList(STORAGE_KEYS.TEACHERS, teachers);
    return newTeacher;
}

export function updateTeacher(teacherId, teacherData) {
    const teachers = readStoredList(STORAGE_KEYS.TEACHERS, []);
    const index = teachers.findIndex((t) => t.id === teacherId);
    if (index === -1) throw new Error("Teacher not found");
    teachers[index] = {
        ...teachers[index],
        ...teacherData,
        id: teacherId,
    };
    writeStoredList(STORAGE_KEYS.TEACHERS, teachers);
    return teachers[index];
}

export function deleteTeacher(teacherId) {
    const teachers = readStoredList(STORAGE_KEYS.TEACHERS, []).filter(
        (t) => t.id !== teacherId
    );
    writeStoredList(STORAGE_KEYS.TEACHERS, teachers);
    return true;
}

export function getTeachersBySubject(subjectId) {
    return readStoredList(STORAGE_KEYS.TEACHERS, []).filter(
        (t) => t.subjectId === subjectId
    );
}

// ============================================================================
// ATTENDANCE
// ============================================================================

export function getAttendance() {
    return readStoredList(STORAGE_KEYS.ATTENDANCE, []);
}

export function getAttendanceRecords(filter = {}) {
    const attendance = getAttendance();
    return attendance.filter((record) => {
        if (filter.date && record.date !== filter.date) return false;
        if (filter.className && record.className !== filter.className) return false;
        if (filter.section && record.section !== filter.section) return false;
        if (filter.period && Number(record.period) !== Number(filter.period)) return false;
        if (filter.teacher && record.teacher !== filter.teacher) return false;
        if (filter.teacherUsername && record.teacherUsername !== filter.teacherUsername) return false;
        if (filter.approvalStatus && record.approvalStatus !== filter.approvalStatus) return false;
        if (filter.studentId && record.studentId !== filter.studentId) return false;
        return true;
    });
}

export function saveAttendanceRecord(recordData) {
    const attendance = getAttendance();
    const record = {
        ...recordData,
        period: Number(recordData.period) || 0,
        approvalStatus: recordData.approvalStatus || "Pending Approval",
        updatedAt: new Date().toISOString(),
    };

    const index = attendance.findIndex(
        (a) =>
            a.id === recordData.id || (
                a.studentId === recordData.studentId &&
                a.date === recordData.date &&
                a.className === recordData.className &&
                a.section === recordData.section &&
                Number(a.period) === Number(recordData.period)
            )
    );

    if (index !== -1) {
        attendance[index] = {
            ...attendance[index],
            ...record,
        };
    } else {
        attendance.push({
            ...record,
            id: recordData.id || generateId("attendance"),
            createdAt: new Date().toISOString(),
        });
    }

    writeStoredList(STORAGE_KEYS.ATTENDANCE, attendance);
    return attendance;
}

export function getAttendanceApprovals() {
    return readStoredList(STORAGE_KEYS.ATTENDANCE_APPROVALS, []);
}

export function saveAttendanceApproval(approvalData) {
    const approvals = getAttendanceApprovals();
    const record = {
        id: approvalData.id || generateId("attendanceApproval"),
        attendanceId: approvalData.attendanceId,
        action: approvalData.action,
        performedBy: approvalData.performedBy,
        performedRole: approvalData.performedRole,
        comments: approvalData.comments || "",
        timestamp: approvalData.timestamp || new Date().toISOString(),
    };
    approvals.push(record);
    writeStoredList(STORAGE_KEYS.ATTENDANCE_APPROVALS, approvals);
    return record;
}

export function getAttendanceByStudent(studentId) {
    return getAttendanceRecords({ studentId });
}

export function deleteAttendance(attendanceId) {
    const attendance = getAttendance().filter((a) => a.id !== attendanceId);
    writeStoredList(STORAGE_KEYS.ATTENDANCE, attendance);
    return true;
}

// ============================================================================
// TIMETABLE
// ============================================================================

export function getTimetable() {
    return readStoredList(STORAGE_KEYS.TIMETABLE, []);
}

export function addTimetableEntry(entryData) {
    const timetable = readStoredList(STORAGE_KEYS.TIMETABLE, []);
    const newEntry = {
        id: generateId("timetable"),
        ...entryData,
        createdAt: new Date().toISOString(),
    };
    timetable.push(newEntry);
    writeStoredList(STORAGE_KEYS.TIMETABLE, timetable);
    return newEntry;
}

export function updateTimetableEntry(entryId, entryData) {
    const timetable = readStoredList(STORAGE_KEYS.TIMETABLE, []);
    const index = timetable.findIndex((t) => t.id === entryId);
    if (index === -1) throw new Error("Timetable entry not found");
    timetable[index] = {
        ...timetable[index],
        ...entryData,
        id: entryId,
    };
    writeStoredList(STORAGE_KEYS.TIMETABLE, timetable);
    return timetable[index];
}

export function deleteTimetableEntry(entryId) {
    const timetable = readStoredList(STORAGE_KEYS.TIMETABLE, []).filter(
        (t) => t.id !== entryId
    );
    writeStoredList(STORAGE_KEYS.TIMETABLE, timetable);
    return true;
}

export function getTimetableByClass(classId) {
    return readStoredList(STORAGE_KEYS.TIMETABLE, []).filter(
        (t) => t.classId === classId
    );
}

// ============================================================================
// FEES
// ============================================================================

export function getFees() {
    return readStoredList(STORAGE_KEYS.FEES, []);
}

export function addFeeRecord(feeData) {
    const fees = readStoredList(STORAGE_KEYS.FEES, []);
    const newFee = {
        id: generateId("fee"),
        ...feeData,
        createdAt: new Date().toISOString(),
    };
    fees.push(newFee);
    writeStoredList(STORAGE_KEYS.FEES, fees);
    return newFee;
}

export function updateFeeRecord(feeId, feeData) {
    const fees = readStoredList(STORAGE_KEYS.FEES, []);
    const index = fees.findIndex((f) => f.id === feeId);
    if (index === -1) throw new Error("Fee record not found");
    fees[index] = {
        ...fees[index],
        ...feeData,
        id: feeId,
    };
    writeStoredList(STORAGE_KEYS.FEES, fees);
    return fees[index];
}

export function deleteFeeRecord(feeId) {
    const fees = readStoredList(STORAGE_KEYS.FEES, []).filter(
        (f) => f.id !== feeId
    );
    writeStoredList(STORAGE_KEYS.FEES, fees);
    return true;
}

export function getFeesByStudent(studentId) {
    return readStoredList(STORAGE_KEYS.FEES, []).filter(
        (f) => f.studentId === studentId
    );
}

// ============================================================================
// NOTICES
// ============================================================================

export function getNotices() {
    return readStoredList(STORAGE_KEYS.NOTICES, []);
}

export function addNotice(noticeData) {
    const notices = readStoredList(STORAGE_KEYS.NOTICES, []);
    const newNotice = {
        id: generateId("notice"),
        ...noticeData,
        createdAt: new Date().toISOString(),
    };
    notices.push(newNotice);
    writeStoredList(STORAGE_KEYS.NOTICES, notices);
    return newNotice;
}

export function updateNotice(noticeId, noticeData) {
    const notices = readStoredList(STORAGE_KEYS.NOTICES, []);
    const index = notices.findIndex((n) => n.id === noticeId);
    if (index === -1) throw new Error("Notice not found");
    notices[index] = {
        ...notices[index],
        ...noticeData,
        id: noticeId,
    };
    writeStoredList(STORAGE_KEYS.NOTICES, notices);
    return notices[index];
}

export function deleteNotice(noticeId) {
    const notices = readStoredList(STORAGE_KEYS.NOTICES, []).filter(
        (n) => n.id !== noticeId
    );
    writeStoredList(STORAGE_KEYS.NOTICES, notices);
    return true;
}

// ============================================================================
// CALENDAR EVENTS
// ============================================================================

export function getCalendarEvents() {
    return readStoredList(STORAGE_KEYS.CALENDAR, []);
}

export function addCalendarEvent(eventData) {
    const events = readStoredList(STORAGE_KEYS.CALENDAR, []);
    const newEvent = {
        id: generateId("event"),
        ...eventData,
        createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    writeStoredList(STORAGE_KEYS.CALENDAR, events);
    return newEvent;
}

export function updateCalendarEvent(eventId, eventData) {
    const events = readStoredList(STORAGE_KEYS.CALENDAR, []);
    const index = events.findIndex((e) => e.id === eventId);
    if (index === -1) throw new Error("Event not found");
    events[index] = {
        ...events[index],
        ...eventData,
        id: eventId,
    };
    writeStoredList(STORAGE_KEYS.CALENDAR, events);
    return events[index];
}

export function deleteCalendarEvent(eventId) {
    const events = readStoredList(STORAGE_KEYS.CALENDAR, []).filter(
        (e) => e.id !== eventId
    );
    writeStoredList(STORAGE_KEYS.CALENDAR, events);
    return true;
}

// ============================================================================
// EXAM MARKS
// ============================================================================

export function getExamMarks() {
    return readStoredList(STORAGE_KEYS.EXAM_MARKS, []);
}

export function addExamMarks(marksData) {
    const marks = readStoredList(STORAGE_KEYS.EXAM_MARKS, []);
    const newRecord = {
        id: generateId("marks"),
        ...marksData,
        createdAt: new Date().toISOString(),
    };
    marks.push(newRecord);
    writeStoredList(STORAGE_KEYS.EXAM_MARKS, marks);
    return newRecord;
}

export function updateExamMarks(marksId, marksData) {
    const marks = readStoredList(STORAGE_KEYS.EXAM_MARKS, []);
    const index = marks.findIndex((m) => m.id === marksId);
    if (index === -1) throw new Error("Marks record not found");
    marks[index] = {
        ...marks[index],
        ...marksData,
        id: marksId,
    };
    writeStoredList(STORAGE_KEYS.EXAM_MARKS, marks);
    return marks[index];
}

export function deleteExamMarks(marksId) {
    const marks = readStoredList(STORAGE_KEYS.EXAM_MARKS, []).filter(
        (m) => m.id !== marksId
    );
    writeStoredList(STORAGE_KEYS.EXAM_MARKS, marks);
    return true;
}

export function getExamMarksByStudent(studentId) {
    return readStoredList(STORAGE_KEYS.EXAM_MARKS, []).filter(
        (m) => m.studentId === studentId
    );
}

// ============================================================================
// USER CREDENTIALS (Parent, Cashier, Incharge)
// ============================================================================

export function saveParentCredentials(username, password, name, email, mobile) {
    if (!username) return;

    const storedUsers = readStoredList("erp_users", []);
    const filtered = storedUsers.filter((user) => user.username !== username);

    const newUser = {
        username,
        password,
        role: "PARENT",
        name,
        email,
        mobile,
        createdAt: new Date().toISOString(),
    };

    filtered.push(newUser);
    writeStoredList("erp_users", filtered);
    return newUser;
}

export function saveCashierCredentials(username, password, name, email) {
    if (!username) return;

    const storedUsers = readStoredList("erp_users", []);
    const filtered = storedUsers.filter((user) => user.username !== username);

    const newUser = {
        username,
        password,
        role: "CASHIER",
        name,
        email,
        createdAt: new Date().toISOString(),
    };

    filtered.push(newUser);
    writeStoredList("erp_users", filtered);
    return newUser;
}

export function saveInchargeCredentials(username, password, name, email) {
    if (!username) return;

    const storedUsers = readStoredList("erp_users", []);
    const filtered = storedUsers.filter((user) => user.username !== username);

    const newUser = {
        username,
        password,
        role: "INCHARGE",
        name,
        email,
        createdAt: new Date().toISOString(),
    };

    filtered.push(newUser);
    writeStoredList("erp_users", filtered);
    return newUser;
}

export function getParentCredentials(parentUsername) {
    const users = readStoredList("erp_users", []);
    return users.find(
        (u) => u.username === parentUsername && u.role === "PARENT"
    ) || null;
}

export function getCashierCredentials(cashierUsername) {
    const users = readStoredList("erp_users", []);
    return users.find(
        (u) => u.username === cashierUsername && u.role === "CASHIER"
    ) || null;
}

export function getInchargeCredentials(inchargeUsername) {
    const users = readStoredList("erp_users", []);
    return users.find(
        (u) => u.username === inchargeUsername && u.role === "INCHARGE"
    ) || null;
}
