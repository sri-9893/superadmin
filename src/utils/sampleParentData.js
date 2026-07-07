/**
 * Sample Data Utility for Parent Dashboard Testing
 * Run this in your browser console or import it to populate localStorage
 * Usage in console: import('./utils/sampleParentData.js').then(m => m.populateParentTestData())
 */

export const populateParentTestData = () => {
    // Sample student with parent
    const students = [
        {
            id: "S001",
            name: "Rahul Kumar",
            admissionNo: "ADM-2024-001",
            className: "10th",
            section: "A",
            gender: "Male",
            dob: "2010-05-15",
            parentName: "Rajesh Kumar",
            parentUsername: "parent_rajesh",
            parentContact: "+91-9876543210",
        },
    ];

    // Sample attendance
    const attendance = [
        { id: "ATT001", studentId: "S001", date: "2024-01-15", status: "Present" },
        { id: "ATT002", studentId: "S001", date: "2024-01-16", status: "Present" },
        { id: "ATT003", studentId: "S001", date: "2024-01-17", status: "Absent" },
        { id: "ATT004", studentId: "S001", date: "2024-01-18", status: "Late" },
        { id: "ATT005", studentId: "S001", date: "2024-01-19", status: "Present" },
        { id: "ATT006", studentId: "S001", date: "2024-01-22", status: "Present" },
        { id: "ATT007", studentId: "S001", date: "2024-01-23", status: "Half Day" },
        { id: "ATT008", studentId: "S001", date: "2024-01-24", status: "Present" },
        { id: "ATT009", studentId: "S001", date: "2024-01-25", status: "Present" },
        { id: "ATT010", studentId: "S001", date: "2024-01-26", status: "Late" },
    ];

    // Sample fees
    const fees = [
        {
            id: "FEE001",
            studentId: "S001",
            totalFee: 50000,
            paidAmount: 35000,
            pendingAmount: 15000,
            dueDate: "2024-02-15",
            status: "Pending",
        },
    ];

    // Sample timetable
    const timetable = [
        {
            id: "TT001",
            className: "10th",
            section: "A",
            day: "Monday",
            period: "1",
            subject: "English",
            teacher: "Mrs. Sarah",
            startTime: "09:00 AM",
            endTime: "10:00 AM",
            room: "101",
        },
        {
            id: "TT002",
            className: "10th",
            section: "A",
            day: "Monday",
            period: "2",
            subject: "Mathematics",
            teacher: "Mr. Singh",
            startTime: "10:00 AM",
            endTime: "11:00 AM",
            room: "102",
        },
        {
            id: "TT003",
            className: "10th",
            section: "A",
            day: "Monday",
            period: "3",
            subject: "Science",
            teacher: "Dr. Sharma",
            startTime: "11:15 AM",
            endTime: "12:15 PM",
            room: "103",
        },
        {
            id: "TT004",
            className: "10th",
            section: "A",
            day: "Tuesday",
            period: "1",
            subject: "History",
            teacher: "Mr. Kumar",
            startTime: "09:00 AM",
            endTime: "10:00 AM",
            room: "104",
        },
        {
            id: "TT005",
            className: "10th",
            section: "A",
            day: "Tuesday",
            period: "2",
            subject: "Geography",
            teacher: "Mrs. Patel",
            startTime: "10:00 AM",
            endTime: "11:00 AM",
            room: "105",
        },
    ];

    // Sample exam marks
    const examMarks = [
        {
            id: "MARK001",
            studentId: "S001",
            examName: "Mid-Term Exam",
            subject: "English",
            maxMarks: 100,
            marksObtained: 85,
            grade: "A",
            result: "Pass",
            date: "2024-01-20",
        },
        {
            id: "MARK002",
            studentId: "S001",
            examName: "Mid-Term Exam",
            subject: "Mathematics",
            maxMarks: 100,
            marksObtained: 92,
            grade: "A+",
            result: "Pass",
            date: "2024-01-20",
        },
        {
            id: "MARK003",
            studentId: "S001",
            examName: "Mid-Term Exam",
            subject: "Science",
            maxMarks: 100,
            marksObtained: 78,
            grade: "B+",
            result: "Pass",
            date: "2024-01-20",
        },
        {
            id: "MARK004",
            studentId: "S001",
            examName: "Unit Test-1",
            subject: "English",
            maxMarks: 50,
            marksObtained: 42,
            grade: "A",
            result: "Pass",
            date: "2024-01-10",
        },
    ];

    // Sample notices
    const notices = [
        {
            id: "NOT001",
            title: "Annual Function Announcement",
            description: "The Annual Function will be held on March 15, 2024. Parents are invited to attend.",
            date: "2024-01-25",
            audience: "All",
            status: "Published",
        },
        {
            id: "NOT002",
            title: "Fee Payment Reminder",
            description: "Please note that school fees for this term are due by February 15, 2024.",
            date: "2024-01-24",
            audience: "Parents",
            status: "Published",
        },
        {
            id: "NOT003",
            title: "Exam Schedule Released",
            description: "Final exams will commence from March 1, 2024. Check the notice board for detailed schedule.",
            date: "2024-01-23",
            audience: "All",
            status: "Published",
        },
    ];

    // Sample calendar events
    const calendarEvents = [
        {
            id: "EVT001",
            title: "School Reopens",
            description: "School reopens after winter break",
            date: "2024-02-01",
            audience: "All",
            status: "Active",
        },
        {
            id: "EVT002",
            title: "Science Fair",
            description: "Annual Science Fair - Students showcase their projects",
            date: "2024-02-15",
            audience: "All",
            status: "Active",
        },
        {
            id: "EVT003",
            title: "Sports Day",
            description: "Annual Sports Day - Various sporting events for all classes",
            date: "2024-02-25",
            audience: "Students",
            status: "Active",
        },
        {
            id: "EVT004",
            title: "Parent-Teacher Meeting",
            description: "Schedule your slot to meet the teachers",
            date: "2024-03-05",
            audience: "Parents",
            status: "Active",
        },
        {
            id: "EVT005",
            title: "Annual Function",
            description: "Annual cultural function - A celebration of talent and creativity",
            date: "2024-03-15",
            audience: "All",
            status: "Active",
        },
    ];

    // Store in localStorage
    localStorage.setItem("school_students", JSON.stringify(students));
    localStorage.setItem("school_attendance", JSON.stringify(attendance));
    localStorage.setItem("school_fees", JSON.stringify(fees));
    localStorage.setItem("school_timetable", JSON.stringify(timetable));
    localStorage.setItem("school_exam_marks", JSON.stringify(examMarks));
    localStorage.setItem("school_notices", JSON.stringify(notices));
    localStorage.setItem("school_calendar_events", JSON.stringify(calendarEvents));

    // Set login data for parent
    localStorage.setItem("username", "parent_rajesh");
    localStorage.setItem("userRole", "SCHOOL_PARENT");
    localStorage.setItem("isLoggedIn", "true");

    console.log("✓ Parent test data populated successfully!");
    console.log("Login with username: parent_rajesh");
    console.log("Navigate to: /school/parent/dashboard");
};

// Also export for use as a helper
export default populateParentTestData;
