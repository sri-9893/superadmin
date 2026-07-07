const STATIC_USERS = [
  {
    username: "superadmin",
    password: "123456",
    role: "SUPER_ADMIN",
    redirect: "/superadmin/dashboard",
    otp: "111111",
    organizationType: "Super Admin",
  },
  {
    username: "schooladmin",
    password: "123456",
    role: "SCHOOL_ADMIN",
    redirect: "/school/dashboard",
    otp: "222222",
    organizationType: "E-School",
  },
  {
    username: "collegeadmin",
    password: "123456",
    role: "COLLEGE_ADMIN",
    redirect: "/college/dashboard",
    otp: "333333",
    organizationType: "E-College",
  },
  {
    username: "hospitaladmin",
    password: "123456",
    role: "HOSPITAL_ADMIN",
    redirect: "/hospital/dashboard",
    otp: "444444",
    organizationType: "Hospital",
  },
];

function getPendingUser() {
  const raw = sessionStorage.getItem("pendingUser") || localStorage.getItem("pendingUser");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getStoredUsers() {
  if (typeof window === "undefined") return [];

  let localUsers = [];
  let erpUsers = [];

  try {
    const rawLocal = window.localStorage.getItem("erp-local-users");
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed)) {
        localUsers = parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse erp-local-users", err);
  }

  try {
    const rawErp = window.localStorage.getItem("erp_users");
    if (rawErp) {
      const parsed = JSON.parse(rawErp);
      if (Array.isArray(parsed)) {
        erpUsers = parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse erp_users", err);
  }

  return [...localUsers, ...erpUsers];
}

function getAllUsers() {
  return [...STATIC_USERS, ...getStoredUsers()];
}

function normalizeUser(user) {
  const roles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : user.role
      ? [user.role]
      : [];
  const defaultRole = user.defaultRole || roles[0] || user.role;
  const dashboards = Array.isArray(user.dashboards) && user.dashboards.length > 0
    ? user.dashboards
    : user.redirect
      ? [{ label: "Dashboard", path: user.redirect, role: defaultRole }]
      : [];

  return { ...user, roles, defaultRole, dashboards };
}

export async function loginUser({ username, password }) {
  const matched = getAllUsers().find((item) => item.username === username && item.password === password);

  if (!matched) {
    return {
      success: false,
      message: "Invalid username or password. Please try again.",
    };
  }

  const normalized = normalizeUser(matched);
  const otp = normalized.otp || "777777";
  const pendingUser = {
    ...normalized,
    parentId: normalized.parentId || null,
    otp,
    organizationType: normalized.organizationType || "Organization",
  };

  sessionStorage.setItem("pendingUser", JSON.stringify(pendingUser));

  return {
    success: true,
    token: `static-${normalized.username}-token`,
    role: normalized.defaultRole,
    roles: normalized.roles,
    dashboards: normalized.dashboards,
    redirect: normalized.redirect || normalized.dashboards?.[0]?.path || "/school/dashboard",
    otp,
    username: normalized.username,
    parentId: normalized.parentId || null,
    organizationType: normalized.organizationType || "Organization",
    message: "Login successful. Please verify the OTP.",
  };
}

export async function verifyOtp({ otp }) {
  const pendingUser = getPendingUser();

  if (!pendingUser) {
    return {
      success: false,
      message: "Session expired. Please log in again.",
    };
  }

  if (otp !== pendingUser.otp) {
    return {
      success: false,
      message: "Incorrect OTP. Please try again.",
    };
  }

  return {
    success: true,
    message: "OTP verified successfully.",
    redirect: pendingUser.redirect,
    role: pendingUser.defaultRole || pendingUser.role,
    roles: pendingUser.roles || [pendingUser.role],
    dashboards: pendingUser.dashboards,
    username: pendingUser.username,
    parentId: pendingUser.parentId || null,
    organizationType: pendingUser.organizationType,
    defaultRole: pendingUser.defaultRole || pendingUser.role,
  };
}

