import React, { useEffect, useMemo, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiX,
    FiChevronDown,
    FiEye,
    FiCheckCircle,
    FiToggleLeft,
} from "react-icons/fi";
import ActionMenu from "../../components/ActionMenu";
import SchoolSidebar from "../../components/SchoolSidebar";
import { useUI } from "../../components/UIContext";
import PreviewModal from "../../components/PreviewModal";

const DEFAULT_SUBJECTS = [
    "Telugu",
    "Hindi",
    "English",
    "Maths",
    "Science",
    "Social",
    "Computer",
    "Physics",
    "Chemistry",
    "Biology",
];

const DEFAULT_DEPARTMENTS = [
    "Primary",
    "High School",
    "Administration",
    "Accounts",
    "Transport",
    "Library",
    "Other",
];

const CATEGORY_ROLE_OPTIONS = {
    Teaching: ["Teacher", "Class Teacher", "Class Incharge", "Subject Teacher"],
    "Non-Teaching": [
        "Accountant",
        "Cashier",
        "Receptionist",
        "Librarian",
        "Office Staff",
    ],
    Driver: ["Driver"],
    Other: ["Security", "Helper", "Other Faculty"],
};

const ROLE_TO_CODE = {
    Teacher: "SCHOOL_TEACHER",
    "Class Teacher": "SCHOOL_CLASS_TEACHER",
    "Class Incharge": "SCHOOL_CLASS_INCHARGE",
    Accountant: "SCHOOL_ACCOUNTANT",
    Cashier: "SCHOOL_CASHIER",
    Driver: "SCHOOL_DRIVER",
};

const roleDashboards = {
    Teacher: { label: "Teacher Dashboard", path: "/school/teacher/dashboard" },
    "Class Teacher": {
        label: "Class Teacher Dashboard",
        path: "/school/class-teacher/dashboard",
    },
    "Class Incharge": {
        label: "Incharge Dashboard",
        path: "/school/incharge/dashboard",
    },
    Cashier: { label: "Cashier Dashboard", path: "/school/cashier/dashboard" },
    Accountant: {
        label: "Accounts Dashboard",
        path: "/school/accountant/dashboard",
    },
    Driver: { label: "Driver Dashboard", path: "/school/driver/dashboard" },
};

const createAssignment = () => ({ className: "", sectionName: "" });

const buildStaffId = () => `STF-${Date.now().toString().slice(-6)}`;

export default function StaffManagement() {
    const { showToast, confirm } = useUI();

    const [staffMembers, setStaffMembers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
    const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);

    const [showModal, setShowModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [previewMode, setPreviewMode] = useState("create");
    const [showSubjectMenu, setShowSubjectMenu] = useState(false);
    const [showDepartmentInput, setShowDepartmentInput] = useState(false);

    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterDepartment, setFilterDepartment] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");

    const [staffId, setStaffId] = useState(buildStaffId());
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [qualification, setQualification] = useState("");
    const [experience, setExperience] = useState("");
    const [joiningDate, setJoiningDate] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("Active");
    const [category, setCategory] = useState("Teaching");
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [customRole, setCustomRole] = useState("");
    const [department, setDepartment] = useState("Primary");
    const [newDepartment, setNewDepartment] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [assignments, setAssignments] = useState([createAssignment()]);
    const [isClassTeacher, setIsClassTeacher] = useState(false);
    const [classTeacherAssignments, setClassTeacherAssignments] = useState([
        createAssignment(),
    ]);
    const [isClassIncharge, setIsClassIncharge] = useState(false);
    const [classInchargeAssignments, setClassInchargeAssignments] = useState([
        createAssignment(),
    ]);

    useEffect(() => {
        const storedStaff = JSON.parse(localStorage.getItem("school_staff") || "[]");
        const legacyTeachers = JSON.parse(localStorage.getItem("school_teachers") || "[]");
        const storedClasses = JSON.parse(localStorage.getItem("school_classes") || "[]");
        const storedSections = JSON.parse(localStorage.getItem("school_sections") || "[]");
        const storedSubjects = JSON.parse(localStorage.getItem("school_subjects") || "[]");
        const storedDepartments = JSON.parse(localStorage.getItem("school_departments") || "[]");

        if (storedStaff.length > 0) {
            setStaffMembers(storedStaff);
        } else if (legacyTeachers.length > 0) {
            const migrated = legacyTeachers.map((teacher, index) => ({
                id: teacher.id || `staff_${index + 1}`,
                staffId: teacher.employeeId || buildStaffId(),
                firstName: teacher.firstName || teacher.name?.split(" ")[0] || "",
                lastName: teacher.lastName || teacher.name?.split(" ").slice(1).join(" ") || "",
                name: teacher.name || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim(),
                gender: teacher.gender || "",
                qualification: teacher.qualification || "",
                experience: teacher.experience || "",
                joiningDate: teacher.joiningDate || "",
                mobile: teacher.mobile || "",
                email: teacher.email || "",
                address: teacher.address || [teacher.addressLine1, teacher.addressLine2, teacher.addressLine3].filter(Boolean).join(", "),
                status: teacher.status || "Active",
                category: "Teaching",
                roles: teacher.isClassIncharge ? ["Class Incharge"] : ["Teacher"],
                department: teacher.department || "Primary",
                subjects: teacher.subjectsChecked || (teacher.subject ? teacher.subject.split(",") : []),
                classAssignments: teacher.classAssignments || [
                    { className: teacher.assignedClass || "", sectionName: teacher.assignedSection || "" },
                ],
                classTeacherAssignments: teacher.classTeacherAssignments || [],
                classInchargeAssignments: teacher.classInchargeAssignments || [],
                isClassTeacher: Boolean(teacher.isClassTeacher),
                isClassIncharge: Boolean(teacher.isClassIncharge),
                username: teacher.username || "",
                password: teacher.password || "",
            }));
            setStaffMembers(migrated);
            localStorage.setItem("school_staff", JSON.stringify(migrated));
        }

        setClasses(storedClasses);
        setSections(storedSections);
        setSubjects(storedSubjects.length > 0 ? storedSubjects.map((item) => item.name || item) : DEFAULT_SUBJECTS);
        setDepartments(storedDepartments.length > 0 ? storedDepartments : DEFAULT_DEPARTMENTS);
    }, []);

    const availableRoles = CATEGORY_ROLE_OPTIONS[category] || [];

    const filteredStaff = useMemo(() => {
        const searchText = search.toLowerCase();

        return staffMembers.filter((staff) => {
            const matchesSearch =
                (staff.name || "").toLowerCase().includes(searchText) ||
                (staff.staffId || "").toLowerCase().includes(searchText) ||
                (staff.mobile || "").toLowerCase().includes(searchText) ||
                (staff.department || "").toLowerCase().includes(searchText) ||
                (staff.category || "").toLowerCase().includes(searchText);

            const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "teaching" && staff.category === "Teaching") ||
                (activeFilter === "non-teaching" && staff.category === "Non-Teaching") ||
                (activeFilter === "driver" && staff.category === "Driver") ||
                (activeFilter === "other" && staff.category === "Other") ||
                (activeFilter === "class-teacher" && (staff.roles || []).includes("Class Teacher")) ||
                (activeFilter === "class-incharge" && (staff.roles || []).includes("Class Incharge")) ||
                (activeFilter === "active" && staff.status === "Active") ||
                (activeFilter === "inactive" && staff.status !== "Active");

            const matchesCategory = filterCategory === "All" || staff.category === filterCategory;
            const matchesDepartment = filterDepartment === "All" || staff.department === filterDepartment;
            const matchesStatus = filterStatus === "All" || staff.status === filterStatus;

            return matchesSearch && matchesFilter && matchesCategory && matchesDepartment && matchesStatus;
        });
    }, [activeFilter, department, filterCategory, filterDepartment, filterStatus, search, staffMembers]);

    const summaryCards = useMemo(() => {
        const teachingCount = staffMembers.filter((item) => item.category === "Teaching").length;
        const nonTeachingCount = staffMembers.filter((item) => item.category === "Non-Teaching").length;
        const driverCount = staffMembers.filter((item) => item.category === "Driver").length;
        const otherCount = staffMembers.filter((item) => item.category === "Other").length;
        const classTeacherCount = staffMembers.filter((item) => (item.roles || []).includes("Class Teacher")).length;
        const classInchargeCount = staffMembers.filter((item) => (item.roles || []).includes("Class Incharge")).length;
        const activeCount = staffMembers.filter((item) => item.status === "Active").length;
        const inactiveCount = staffMembers.filter((item) => item.status !== "Active").length;

        return [
            { key: "all", label: "Total Staff", value: staffMembers.length, tone: "primary" },
            { key: "teaching", label: "Teaching Staff", value: teachingCount, tone: "info" },
            { key: "non-teaching", label: "Non-Teaching Staff", value: nonTeachingCount, tone: "purple" },
            { key: "driver", label: "Drivers / Other Faculty", value: driverCount + otherCount, tone: "warning" },
            { key: "class-teacher", label: "Class Teachers", value: classTeacherCount, tone: "success" },
            { key: "class-incharge", label: "Class Incharges", value: classInchargeCount, tone: "danger" },
            { key: "active", label: "Active Staff", value: activeCount, tone: "primary" },
            { key: "inactive", label: "Inactive Staff", value: inactiveCount, tone: "muted" },
        ];
    }, [staffMembers]);

    const fullName = `${firstName} ${lastName}`.trim();

    const saveStaffMembers = (updatedStaff) => {
        setStaffMembers(updatedStaff);
        localStorage.setItem("school_staff", JSON.stringify(updatedStaff));
    };

    const saveTeacherCompatibility = (staffData) => {
        const legacyTeachers = JSON.parse(localStorage.getItem("school_teachers") || "[]");
        const filteredTeachers = legacyTeachers.filter((item) => item.id !== staffData.id);

        if (staffData.category === "Teaching") {
            const compatibilityRecord = {
                id: staffData.id,
                employeeId: staffData.staffId,
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                name: staffData.name,
                gender: staffData.gender,
                qualification: staffData.qualification,
                experience: staffData.experience,
                joiningDate: staffData.joiningDate,
                subject: staffData.subjects.join(", "),
                subjectsChecked: staffData.subjects,
                assignedClass: staffData.classAssignments?.[0]?.className || "",
                assignedSection: staffData.classAssignments?.[0]?.sectionName || "",
                classAssignments: staffData.classAssignments,
                classTeacherAssignments: staffData.classTeacherAssignments,
                classInchargeAssignments: staffData.classInchargeAssignments,
                isClassTeacher: staffData.isClassTeacher,
                isClassIncharge: staffData.isClassIncharge,
                mobile: staffData.mobile,
                email: staffData.email,
                addressLine1: staffData.address,
                addressLine2: "",
                addressLine3: "",
                city: "",
                stateName: "",
                zipcode: "",
                username: staffData.username,
                password: staffData.password,
                status: staffData.status,
                department: staffData.department,
            };
            localStorage.setItem("school_teachers", JSON.stringify([compatibilityRecord, ...filteredTeachers]));
        } else {
            localStorage.setItem("school_teachers", JSON.stringify(filteredTeachers));
        }
    };

    const saveUserCredentials = (staffData) => {
        const storedUsers = JSON.parse(localStorage.getItem("erp_users") || "[]");
        const filtered = storedUsers.filter((user) => user.username !== staffData.username);

        const roleCodes = (staffData.roles || []).map((role) => ROLE_TO_CODE[role] || "SCHOOL_STAFF");
        const dashboards = roleCodes
            .map((roleCode) => {
                if (roleCode === "SCHOOL_TEACHER") return roleDashboards.Teacher;
                if (roleCode === "SCHOOL_CLASS_TEACHER") return roleDashboards["Class Teacher"];
                if (roleCode === "SCHOOL_CLASS_INCHARGE") return roleDashboards["Class Incharge"];
                if (roleCode === "SCHOOL_CASHIER") return roleDashboards.Cashier;
                if (roleCode === "SCHOOL_ACCOUNTANT") return roleDashboards.Accountant;
                if (roleCode === "SCHOOL_DRIVER") return roleDashboards.Driver;
                return { label: "Staff Dashboard", path: "/school/dashboard" };
            })
            .filter(Boolean);

        const newUser = {
            username: staffData.username,
            password: staffData.password,
            roles: roleCodes,
            defaultRole: roleCodes[0] || "SCHOOL_STAFF",
            dashboards,
            otp: "777777",
            name: staffData.name,
            email: staffData.email,
            mobile: staffData.mobile,
            organizationType: "E-School",
        };

        localStorage.setItem("erp_users", JSON.stringify([...filtered, newUser]));
    };

    const resetForm = () => {
        setEditId(null);
        setStaffId(buildStaffId());
        setFirstName("");
        setLastName("");
        setGender("");
        setQualification("");
        setExperience("");
        setJoiningDate("");
        setMobile("");
        setEmail("");
        setAddress("");
        setStatus("Active");
        setCategory("Teaching");
        setSelectedRoles([]);
        setDepartment("Primary");
        setNewDepartment("");
        setSelectedSubjects([]);
        setUsername("");
        setPassword("");
        setAssignments([createAssignment()]);
        setIsClassTeacher(false);
        setClassTeacherAssignments([createAssignment()]);
        setIsClassIncharge(false);
        setClassInchargeAssignments([createAssignment()]);
        setShowSubjectMenu(false);
        setShowDepartmentInput(false);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleOpenEditModal = (staff) => {
        setEditId(staff.id);
        setStaffId(staff.staffId || "");
        setFirstName(staff.firstName || "");
        setLastName(staff.lastName || "");
        setGender(staff.gender || "");
        setQualification(staff.qualification || "");
        setExperience(staff.experience || "");
        setJoiningDate(staff.joiningDate || "");
        setMobile(staff.mobile || "");
        setEmail(staff.email || "");
        setAddress(staff.address || "");
        setStatus(staff.status || "Active");
        setCategory(staff.category || "Teaching");
        setSelectedRoles(staff.roles || []);
        setDepartment(staff.department || "Primary");
        setNewDepartment("");
        setCustomRole("");
        setSelectedSubjects(staff.subjects || []);
        setUsername(staff.username || "");
        setPassword(staff.password || "");
        setAssignments(Array.isArray(staff.classAssignments) && staff.classAssignments.length > 0 ? staff.classAssignments : [createAssignment()]);
        setIsClassTeacher(Boolean(staff.isClassTeacher));
        setClassTeacherAssignments(Array.isArray(staff.classTeacherAssignments) && staff.classTeacherAssignments.length > 0 ? staff.classTeacherAssignments : [createAssignment()]);
        setIsClassIncharge(Boolean(staff.isClassIncharge));
        setClassInchargeAssignments(Array.isArray(staff.classInchargeAssignments) && staff.classInchargeAssignments.length > 0 ? staff.classInchargeAssignments : [createAssignment()]);
        setShowSubjectMenu(false);
        setShowDepartmentInput(false);
        setShowModal(true);
    };

    const handleRoleToggle = (role) => {
        setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]));
    };

    const handleSubjectToggle = (subject) => {
        setSelectedSubjects((prev) => (prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject]));
    };

    const handleAddCustomRole = () => {
        const normalizedRole = customRole.trim();
        if (!normalizedRole) {
            showToast("error", "Please enter a role name.");
            return;
        }

        setSelectedRoles((prev) => (prev.includes(normalizedRole) ? prev : [...prev, normalizedRole]));
        setCustomRole("");
        showToast("success", "Custom role added.");
    };

    const getSectionsByClassName = (className) => {
        const selectedCls = classes.find((item) => item.name === className);
        if (!selectedCls) return [];
        return sections.filter((item) => item.classId === selectedCls.id);
    };

    const updateAssignments = (list, setList, index, field, value) => {
        const updated = [...list];
        if (field === "className") {
            updated[index] = { className: value, sectionName: "" };
        } else {
            const duplicate = updated.some(
                (item, itemIndex) => itemIndex !== index && item.className === updated[index].className && item.sectionName === value
            );
            if (duplicate) {
                showToast("error", "This class and section is already assigned.");
                return;
            }
            updated[index][field] = value;
        }
        setList(updated);
    };

    const addAssignmentRow = (list, setList) => {
        const hasEmptyRow = list.some((item) => !item.className || !item.sectionName);
        if (hasEmptyRow) {
            showToast("error", "Please complete the current class and section before adding another row.");
            return;
        }
        setList((current) => [...current, createAssignment()]);
    };

    const removeAssignmentRow = (setList, index, list) => {
        const updated = [...list];
        updated.splice(index, 1);
        setList(updated.length > 0 ? updated : [createAssignment()]);
    };

    const handleAddDepartment = () => {
        const normalized = newDepartment.trim();
        if (!normalized) {
            showToast("error", "Please enter a new department name.");
            return;
        }
        const nextDepartments = [...new Set([...departments, normalized])];
        setDepartments(nextDepartments);
        localStorage.setItem("school_departments", JSON.stringify(nextDepartments));
        setDepartment(normalized);
        setNewDepartment("");
        setShowDepartmentInput(false);
        showToast("success", "Department added successfully.");
    };

    const handlePreparePreview = (event) => {
        event.preventDefault();

        if (!firstName.trim() || !lastName.trim()) {
            showToast("error", "Please enter first name and last name.");
            return;
        }
        if (!category) {
            showToast("error", "Please select a staff category.");
            return;
        }
        if (selectedRoles.length === 0) {
            showToast("error", "Please select at least one role.");
            return;
        }
        if (!username.trim() || !password.trim()) {
            showToast("error", "Please enter a username and password.");
            return;
        }
        if (category === "Teaching" && selectedSubjects.length === 0) {
            showToast("error", "Teaching staff must have at least one subject.");
            return;
        }

        if (category === "Teaching") {
            const hasIncompleteAssignment = assignments.some((item) => !item.className || !item.sectionName);
            if (hasIncompleteAssignment) {
                showToast("error", "Please complete all assigned class and section rows.");
                return;
            }
            const seenAssignments = new Set();
            const duplicateAssignment = assignments.some((item) => {
                const key = `${item.className}::${item.sectionName}`;
                if (seenAssignments.has(key)) return true;
                seenAssignments.add(key);
                return false;
            });
            if (duplicateAssignment) {
                showToast("error", "Please remove duplicate class and section assignments.");
                return;
            }
        }

        if (isClassTeacher) {
            const incompleteClassTeacher = classTeacherAssignments.some((item) => !item.className || !item.sectionName);
            if (incompleteClassTeacher) {
                showToast("error", "Please complete all class teacher assignments.");
                return;
            }
        }

        if (isClassIncharge) {
            const incompleteIncharge = classInchargeAssignments.some((item) => !item.className || !item.sectionName);
            if (incompleteIncharge) {
                showToast("error", "Please complete all class incharge assignments.");
                return;
            }
        }

        const duplicateUser = staffMembers.some((item) => item.id !== editId && item.username?.toLowerCase() === username.trim().toLowerCase());
        if (duplicateUser) {
            showToast("error", "A staff member with that username already exists.");
            return;
        }

        const previewObj = {
            StaffID: staffId,
            Name: fullName,
            Category: category,
            Roles: selectedRoles.join(", "),
            Department: department,
            Subjects: selectedSubjects.join(", "),
            AssignedClasses: assignments.map((item) => `${item.className} - ${item.sectionName}`).join(", "),
            ClassTeacher: isClassTeacher ? "Yes" : "No",
            ClassIncharge: isClassIncharge ? "Yes" : "No",
            Mobile: mobile,
            Email: email,
            Address: address,
            Status: status,
            Username: username,
        };

        setPreviewData(previewObj);
        setPreviewMode(editId ? "edit" : "create");
        setShowPreview(true);
    };

    const handleConfirmSubmit = () => {
        const staffData = {
            id: editId || `staff_${Date.now()}`,
            staffId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            name: fullName,
            gender,
            qualification,
            experience,
            joiningDate,
            mobile,
            email,
            address,
            status,
            category,
            roles: selectedRoles,
            department,
            subjects: selectedSubjects,
            classAssignments: category === "Teaching" ? assignments : [],
            classTeacherAssignments: isClassTeacher ? classTeacherAssignments : [],
            classInchargeAssignments: isClassIncharge ? classInchargeAssignments : [],
            isClassTeacher,
            isClassIncharge,
            username: username.trim(),
            password,
            createdAt: new Date().toISOString(),
        };

        const updatedStaff = editId
            ? staffMembers.map((member) => (member.id === editId ? staffData : member))
            : [staffData, ...staffMembers];

        saveStaffMembers(updatedStaff);
        saveTeacherCompatibility(staffData);
        saveUserCredentials(staffData);

        setShowPreview(false);
        setShowModal(false);
        showToast("success", editId ? "Staff record updated successfully." : "Staff record saved successfully.");
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: "Delete Staff",
            message: "Are you sure you want to delete this staff record?",
        });

        if (!confirmed) return;

        const target = staffMembers.find((member) => member.id === id);
        const nextStaff = staffMembers.filter((member) => member.id !== id);
        saveStaffMembers(nextStaff);

        if (target) {
            const storedUsers = JSON.parse(localStorage.getItem("erp_users") || "[]");
            const filteredUsers = storedUsers.filter((user) => user.username !== target.username);
            localStorage.setItem("erp_users", JSON.stringify(filteredUsers));

            const legacyTeachers = JSON.parse(localStorage.getItem("school_teachers") || "[]");
            const filteredTeachers = legacyTeachers.filter((item) => item.id !== target.id);
            localStorage.setItem("school_teachers", JSON.stringify(filteredTeachers));
        }

        showToast("success", "Staff record removed.");
    };

    const handleToggleStatus = (staff) => {
        const nextStatus = staff.status === "Active" ? "Inactive" : "Active";
        const updated = staffMembers.map((member) => (member.id === staff.id ? { ...member, status: nextStatus } : member));
        saveStaffMembers(updated);
        showToast("success", `Staff marked ${nextStatus.toLowerCase()}.`);
    };

    return (
        <div className="dashboard-layout">
            <SchoolSidebar />

            <div className="main-content">
                <header className="navbar">
                    <div>
                        <h3>Staff Management</h3>
                        <p>Manage the full staff lifecycle with roles, departments, class links, and secure access.</p>
                    </div>

                    <button className="btn btn-primary" onClick={handleOpenAddModal}>
                        <FiPlus /> Add Staff
                    </button>
                </header>

                <div className="page">
                    <div className="staff-shell">
                        <div className="staff-summary-grid">
                            {summaryCards.map((card) => (
                                <button
                                    key={card.key}
                                    type="button"
                                    className={`staff-summary-card staff-summary-card--${card.tone} ${activeFilter === card.key ? "active" : ""}`}
                                    onClick={() => setActiveFilter(card.key)}
                                >
                                    <span className="staff-summary-label">{card.label}</span>
                                    <strong className="staff-summary-value">{card.value}</strong>
                                </button>
                            ))}
                        </div>

                        <div className="staff-toolbar card">
                            <div className="staff-toolbar-search">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Search by name, staff ID, mobile, or department"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>

                            <div className="staff-toolbar-filters">
                                <div className="staff-filter-group">
                                    <label>Category</label>
                                    <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
                                        <option value="All">All</option>
                                        <option value="Teaching">Teaching</option>
                                        <option value="Non-Teaching">Non-Teaching</option>
                                        <option value="Driver">Driver</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="staff-filter-group">
                                    <label>Department</label>
                                    <select value={filterDepartment} onChange={(event) => setFilterDepartment(event.target.value)}>
                                        <option value="All">All</option>
                                        {departments.map((departmentName) => (
                                            <option key={departmentName} value={departmentName}>
                                                {departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="staff-filter-group">
                                    <label>Status</label>
                                    <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                                        <option value="All">All</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card staff-table-card">
                            <div className="staff-tabs" role="tablist" aria-label="Staff categories">
                                {[
                                    { key: "all", label: "All" },
                                    { key: "teaching", label: "Teaching" },
                                    { key: "non-teaching", label: "Non-Teaching" },
                                    { key: "driver", label: "Driver" },
                                    { key: "other", label: "Other" },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        className={`staff-tab ${activeFilter === tab.key ? "active" : ""}`}
                                        onClick={() => setActiveFilter(tab.key)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {filteredStaff.length === 0 ? (
                                <div className="staff-empty">
                                    <FiCheckCircle />
                                    <p>No staff records match the selected filters yet.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Staff ID</th>
                                                <th>Name</th>
                                                <th>Category</th>
                                                <th>Roles</th>
                                                <th>Department</th>
                                                <th>Subjects</th>
                                                <th>Assigned Classes</th>
                                                <th>Class Teacher</th>
                                                <th>Incharge</th>
                                                <th>Mobile</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStaff.map((staff) => (
                                                <tr key={staff.id}>
                                                    <td data-label="Staff ID">
                                                        <strong>{staff.staffId || "-"}</strong>
                                                    </td>
                                                    <td data-label="Name">{staff.name || "-"}</td>
                                                    <td data-label="Category">
                                                        <span className="staff-chip">{staff.category || "-"}</span>
                                                    </td>
                                                    <td data-label="Roles">
                                                        <div className="staff-chip-list">
                                                            {(staff.roles || []).map((role) => (
                                                                <span key={role} className="staff-chip staff-chip--primary">
                                                                    {role}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td data-label="Department">{staff.department || "-"}</td>
                                                    <td data-label="Subjects">
                                                        <div className="staff-chip-list">
                                                            {(staff.subjects || []).map((subject) => (
                                                                <span key={subject} className="staff-chip staff-chip--muted">
                                                                    {subject}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td data-label="Assigned Classes">
                                                        {staff.classAssignments?.length > 0
                                                            ? staff.classAssignments
                                                                .filter((item) => item.className)
                                                                .map((item, index) => (
                                                                    <span className="staff-chip" key={`${item.className}-${index}`}>
                                                                        {item.className} / {item.sectionName}
                                                                    </span>
                                                                ))
                                                            : "-"}
                                                    </td>
                                                    <td data-label="Class Teacher">{staff.isClassTeacher ? <FiCheckCircle /> : "-"}</td>
                                                    <td data-label="Incharge">{staff.isClassIncharge ? <FiCheckCircle /> : "-"}</td>
                                                    <td data-label="Mobile">{staff.mobile || "-"}</td>
                                                    <td data-label="Status">
                                                        <span className={`badge ${staff.status === "Active" ? "badge-success" : "badge-danger"}`}>
                                                            {staff.status || "Active"}
                                                        </span>
                                                    </td>
                                                    <td data-label="Actions">
                                                        <ActionMenu
                                                            onView={() => {
                                                                setPreviewData({
                                                                    StaffID: staff.staffId,
                                                                    Name: staff.name,
                                                                    Category: staff.category,
                                                                    Roles: (staff.roles || []).join(", "),
                                                                    Department: staff.department,
                                                                    Subjects: (staff.subjects || []).join(", "),
                                                                    AssignedClasses: (staff.classAssignments || []).map((assignment) => `${assignment.className} - ${assignment.sectionName}`).join(", "),
                                                                    Mobile: staff.mobile,
                                                                    Status: staff.status,
                                                                    Username: staff.username,
                                                                });
                                                                setPreviewMode("view");
                                                                setShowPreview(true);
                                                            }}
                                                            onEdit={() => handleOpenEditModal(staff)}
                                                            onDelete={() => handleDelete(staff.id)}
                                                            onToggleStatus={() => handleToggleStatus(staff)}
                                                            statusLabel={staff.status === "Active" ? "Deactivate" : "Activate"}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal-card modal-card-lg staff-form-modal">
                                <div className="modal-header">
                                    <h3>{editId ? "Edit Staff Profile" : "Add New Staff"}</h3>
                                    <button className="icon-btn" type="button" onClick={() => setShowModal(false)}>
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handlePreparePreview} className="dashboard-form">
                                    <div className="staff-form-section">
                                        <h4>Basic Details</h4>
                                        <div className="staff-form-grid">
                                            <div className="form-group">
                                                <label>Staff ID / Employee ID</label>
                                                <input type="text" value={staffId} onChange={(event) => setStaffId(event.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>First Name *</label>
                                                <input type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Last Name *</label>
                                                <input type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Gender</label>
                                                <select value={gender} onChange={(event) => setGender(event.target.value)}>
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Qualification</label>
                                                <input type="text" value={qualification} onChange={(event) => setQualification(event.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Experience</label>
                                                <input type="text" value={experience} onChange={(event) => setExperience(event.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Joining Date</label>
                                                <input type="date" value={joiningDate} onChange={(event) => setJoiningDate(event.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Mobile</label>
                                                <input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Address</label>
                                                <input type="text" value={address} onChange={(event) => setAddress(event.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Status</label>
                                                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="staff-form-section">
                                        <h4>Staff Category</h4>
                                        <div className="form-group">
                                            <label>Category *</label>
                                            <select value={category} onChange={(event) => setCategory(event.target.value)}>
                                                <option value="Teaching">Teaching</option>
                                                <option value="Non-Teaching">Non-Teaching</option>
                                                <option value="Driver">Driver</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Role / Designation *</label>
                                            <div className="staff-role-grid">
                                                {availableRoles.map((role) => (
                                                    <label key={role} className={`staff-role-pill ${selectedRoles.includes(role) ? "active" : ""}`}>
                                                        <input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => handleRoleToggle(role)} />
                                                        <span>{role}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="staff-inline-input">
                                                <input type="text" value={customRole} onChange={(event) => setCustomRole(event.target.value)} placeholder="Add custom role" />
                                                <button type="button" className="btn btn-outline" onClick={handleAddCustomRole}>
                                                    Add Role
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="staff-form-section">
                                        <h4>Department</h4>
                                        <div className="form-group">
                                            <label>Department</label>
                                            <select value={department} onChange={(event) => {
                                                const nextValue = event.target.value;
                                                if (nextValue === "__add_new__") {
                                                    setShowDepartmentInput(true);
                                                    setDepartment("Primary");
                                                } else {
                                                    setDepartment(nextValue);
                                                    setShowDepartmentInput(false);
                                                }
                                            }}>
                                                {departments.map((departmentName) => (
                                                    <option key={departmentName} value={departmentName}>
                                                        {departmentName}
                                                    </option>
                                                ))}
                                                <option value="__add_new__">Add New Department</option>
                                            </select>
                                        </div>
                                        {showDepartmentInput && (
                                            <div className="staff-inline-input">
                                                <input type="text" value={newDepartment} onChange={(event) => setNewDepartment(event.target.value)} placeholder="New department name" />
                                                <button type="button" className="btn btn-outline" onClick={handleAddDepartment}>
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="staff-form-section">
                                        <h4>Login Credentials</h4>
                                        <div className="staff-form-grid">
                                            <div className="form-group">
                                                <label>Username *</label>
                                                <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Password *</label>
                                                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                                            </div>
                                        </div>
                                    </div>

                                    {category === "Teaching" && (
                                        <div className="staff-form-section">
                                            <h4>Subjects</h4>
                                            <div className="form-group subject-dropdown-wrapper">
                                                <label>Subjects *</label>
                                                <button type="button" className="subject-dropdown-btn" onClick={() => setShowSubjectMenu((prev) => !prev)}>
                                                    {selectedSubjects.length > 0 ? `${selectedSubjects.length} subject(s) selected` : "Select subjects"}
                                                    <FiChevronDown />
                                                </button>
                                                {showSubjectMenu && (
                                                    <div className="subject-dropdown-menu">
                                                        {subjects.map((subject) => (
                                                            <label key={subject} className="subject-dropdown-item">
                                                                <input type="checkbox" checked={selectedSubjects.includes(subject)} onChange={() => handleSubjectToggle(subject)} />
                                                                <span>{subject}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                                {selectedSubjects.length > 0 && (
                                                    <div className="staff-chip-list">
                                                        {selectedSubjects.map((subject) => (
                                                            <span key={subject} className="staff-chip staff-chip--primary">
                                                                {subject}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="staff-form-section-subheader">
                                                <h5>Assigned Classes & Sections</h5>
                                            </div>
                                            {assignments.map((assignment, index) => (
                                                <div className="staff-assignment-row" key={`${assignment.className}-${index}`}>
                                                    <div className="form-group">
                                                        <label>Class</label>
                                                        <select value={assignment.className} onChange={(event) => updateAssignments(assignments, setAssignments, index, "className", event.target.value)}>
                                                            <option value="">Select Class</option>
                                                            {classes.map((classItem) => (
                                                                <option key={classItem.id} value={classItem.name}>
                                                                    {classItem.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Section</label>
                                                        <select value={assignment.sectionName} onChange={(event) => updateAssignments(assignments, setAssignments, index, "sectionName", event.target.value)}>
                                                            <option value="">Select Section</option>
                                                            {getSectionsByClassName(assignment.className).map((section) => (
                                                                <option key={section.id} value={section.name}>
                                                                    {section.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button type="button" className="icon-btn" onClick={() => removeAssignmentRow(setAssignments, index, assignments)}>
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ))}
                                            <button type="button" className="btn btn-outline mt-md" onClick={() => addAssignmentRow(assignments, setAssignments)}>
                                                <FiPlus /> Add Class & Section
                                            </button>
                                        </div>
                                    )}

                                    <div className="staff-form-section">
                                        <h4>Role Assignment</h4>
                                        <div className="staff-checkbox-row">
                                            <label className="checkbox-pill">
                                                <input type="checkbox" checked={isClassTeacher} onChange={(event) => setIsClassTeacher(event.target.checked)} />
                                                <span>Make Class Teacher</span>
                                            </label>
                                            <label className="checkbox-pill">
                                                <input type="checkbox" checked={isClassIncharge} onChange={(event) => setIsClassIncharge(event.target.checked)} />
                                                <span>Make Class Incharge</span>
                                            </label>
                                        </div>

                                        {isClassTeacher && (
                                            <div className="staff-form-section-subsection">
                                                <h5>Class Teacher Assignments</h5>
                                                {classTeacherAssignments.map((assignment, index) => (
                                                    <div className="staff-assignment-row" key={`teacher-${index}`}>
                                                        <div className="form-group">
                                                            <label>Class</label>
                                                            <select value={assignment.className} onChange={(event) => updateAssignments(classTeacherAssignments, setClassTeacherAssignments, index, "className", event.target.value)}>
                                                                <option value="">Select Class</option>
                                                                {classes.map((classItem) => (
                                                                    <option key={classItem.id} value={classItem.name}>
                                                                        {classItem.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Section</label>
                                                            <select value={assignment.sectionName} onChange={(event) => updateAssignments(classTeacherAssignments, setClassTeacherAssignments, index, "sectionName", event.target.value)}>
                                                                <option value="">Select Section</option>
                                                                {getSectionsByClassName(assignment.className).map((section) => (
                                                                    <option key={section.id} value={section.name}>
                                                                        {section.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <button type="button" className="icon-btn" onClick={() => removeAssignmentRow(setClassTeacherAssignments, index, classTeacherAssignments)}>
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button type="button" className="btn btn-outline mt-md" onClick={() => addAssignmentRow(classTeacherAssignments, setClassTeacherAssignments)}>
                                                    <FiPlus /> Add Class & Section
                                                </button>
                                            </div>
                                        )}

                                        {isClassIncharge && (
                                            <div className="staff-form-section-subsection">
                                                <h5>Class Incharge Assignments</h5>
                                                {classInchargeAssignments.map((assignment, index) => (
                                                    <div className="staff-assignment-row" key={`incharge-${index}`}>
                                                        <div className="form-group">
                                                            <label>Class</label>
                                                            <select value={assignment.className} onChange={(event) => updateAssignments(classInchargeAssignments, setClassInchargeAssignments, index, "className", event.target.value)}>
                                                                <option value="">Select Class</option>
                                                                {classes.map((classItem) => (
                                                                    <option key={classItem.id} value={classItem.name}>
                                                                        {classItem.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Section</label>
                                                            <select value={assignment.sectionName} onChange={(event) => updateAssignments(classInchargeAssignments, setClassInchargeAssignments, index, "sectionName", event.target.value)}>
                                                                <option value="">Select Section</option>
                                                                {getSectionsByClassName(assignment.className).map((section) => (
                                                                    <option key={section.id} value={section.name}>
                                                                        {section.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <button type="button" className="icon-btn" onClick={() => removeAssignmentRow(setClassInchargeAssignments, index, classInchargeAssignments)}>
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button type="button" className="btn btn-outline mt-md" onClick={() => addAssignmentRow(classInchargeAssignments, setClassInchargeAssignments)}>
                                                    <FiPlus /> Add Class & Section
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="staff-modal-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Preview & Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showPreview && previewData && (
                        <PreviewModal
                            title={previewMode === "view" ? "Staff Preview" : "Staff Preview"}
                            data={previewData}
                            onClose={() => setShowPreview(false)}
                            onSubmit={previewMode === "view" ? () => setShowPreview(false) : handleConfirmSubmit}
                            showSubmitButton={previewMode !== "view"}
                            submitLabel="Submit"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
