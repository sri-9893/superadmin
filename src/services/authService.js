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

const LOCAL_USERS_STORAGE_KEY = "erp-local-users";

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

export async function loginUser({ username, password }) {
  const matched = getAllUsers().find((item) => item.username === username && item.password === password);

  if (!matched) {
    return {
      success: false,
      message: "Invalid username or password. Please try again.",
    };
  }

  const otp = matched.otp || "777777";
  const pendingUser = {
    ...matched,
    otp,
    organizationType: matched.organizationType || "Organization",
  };

  sessionStorage.setItem("pendingUser", JSON.stringify(pendingUser));

  return {
    success: true,
    token: `static-${matched.username}-token`,
    role: matched.role,
    redirect: matched.redirect,
    otp,
    username: matched.username,
    organizationType: matched.organizationType || "Organization",
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
    role: pendingUser.role,
    username: pendingUser.username,
    organizationType: pendingUser.organizationType,
  };
}

