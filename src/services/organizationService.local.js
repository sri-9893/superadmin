const ORGANIZATION_STORAGE_KEY = "erp-organizations";
const AUTH_USERS_STORAGE_KEY = "erp-local-users";

function toDisplayLabel(period) {
  const periodMap = {
    1: "Monthly",
    3: "3 Months",
    6: "6 Months",
    12: "Yearly",
    24: "2 Years",
    36: "3 Years",
    120: "Full Time",
  };

  return periodMap[period] || period || "Yearly";
}

function toBackendPeriod(period) {
  const periodMap = {
    Monthly: 1,
    "3 Months": 3,
    "6 Months": 6,
    Yearly: 12,
    "2 Years": 24,
    "3 Years": 36,
    "Full Time": 120,
  };

  if (typeof period === "number") return period;
  return periodMap[period] || 12;
}

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

function writeStoredList(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeOrganization(item) {
  if (!item || typeof item !== "object") return null;

  const orgId = item.orgId || item.id || item.organizationId || "";
  const normalizedType = item.organizationType || item.orgType || item.org_type || "e-school";
  const subscriptionPeriod = toDisplayLabel(item.subscriptionPeriod ?? item.subscription_period ?? 12);
  const status = (item.status ?? "active").toString().toLowerCase();

  return {
    id: orgId,
    orgId,
    name: item.name || item.organizationName || item.orgName || "",
    organizationName: item.organizationName || item.name || item.orgName || "",
    registrationNo: item.registrationNo || item.registration_number || "",
    joiningDate: item.joiningDate || item.joining_date || "",
    subscriptionCost: Number(item.subscriptionCost ?? item.subscription_cost ?? 0),
    subscriptionPeriod,
    endDate: item.endDate || item.end_date || "",
    status: status === "inactive" ? "inactive" : "active",
    admin: item.admin || item.adminName || item.username || "",
    email: item.email || item.adminEmail || "",
    address: item.address || item.orgAddress || item.org_address || "",
    comments: item.comments || "",
    organizationType: normalizedType,
    username: item.username || "",
    password: item.password || "",
    phoneNo: item.phoneNo || item.mobileNumber || "",
    createdAt: item.createdAt || "",
  };
}

function roleFromOrganizationType(type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized.includes("college")) return "COLLEGE_ADMIN";
  if (normalized.includes("hospital")) return "HOSPITAL_ADMIN";
  return "SCHOOL_ADMIN";
}

function redirectForRole(role) {
  const redirects = {
    SUPER_ADMIN: "/superadmin/dashboard",
    SCHOOL_ADMIN: "/school/dashboard",
    COLLEGE_ADMIN: "/college/dashboard",
    HOSPITAL_ADMIN: "/hospital/dashboard",
  };

  return redirects[role] || "/login";
}

function buildOrganizationRecord(orgData, generatedId) {
  return {
    id: generatedId,
    orgId: generatedId,
    name: orgData.organizationName || orgData.name || orgData.orgName || "",
    organizationName: orgData.organizationName || orgData.name || orgData.orgName || "",
    registrationNo: orgData.registrationNumber || orgData.registrationNo || "",
    joiningDate: orgData.joiningDate || "",
    subscriptionCost: Number(orgData.subscriptionCost || 0),
    subscriptionPeriod: toBackendPeriod(orgData.subscriptionPeriod || "Yearly"),
    endDate: orgData.endDate || "",
    status: (orgData.status || "ACTIVE").toString().toUpperCase() === "INACTIVE" ? "inactive" : "active",
    admin: orgData.username || orgData.admin || "",
    email: orgData.email || "",
    address: orgData.address || orgData.orgAddress || "",
    comments: orgData.comments || "",
    organizationType: orgData.organizationType || orgData.orgType || "e-school",
    username: orgData.username || "",
    password: orgData.password || "",
    phoneNo: orgData.phoneNo || orgData.mobileNumber || "",
    createdAt: new Date().toISOString(),
  };
}

function persistLocalAuthUser(orgRecord) {
  const users = readStoredList(AUTH_USERS_STORAGE_KEY, []);
  const existing = users.some((user) => user.username === orgRecord.username);

  if (!orgRecord.username || existing) {
    return;
  }

  const role = roleFromOrganizationType(orgRecord.organizationType);
  users.push({
    username: orgRecord.username,
    password: orgRecord.password,
    role,
    redirect: redirectForRole(role),
    otp: "777777",
    organizationType: orgRecord.organizationType,
    organizationId: orgRecord.id,
    email: orgRecord.email,
  });

  writeStoredList(AUTH_USERS_STORAGE_KEY, users);
}

export async function getNextOrganizationId() {
  const organizations = readStoredList(ORGANIZATION_STORAGE_KEY, []);
  const nextIndex = organizations.length + 1;
  return `ORG-${String(nextIndex).padStart(3, "0")}`;
}

export async function getOrganizations() {
  return readStoredList(ORGANIZATION_STORAGE_KEY, [])
    .map(normalizeOrganization)
    .filter(Boolean);
}

export async function getOrganizationDetails(orgId) {
  const organizations = await getOrganizations();
  return organizations.find((org) => org.id === orgId) || null;
}

export async function createOrganization(orgData) {
  const organizations = readStoredList(ORGANIZATION_STORAGE_KEY, []);
  const generatedId = String(orgData.id || orgData.orgId || orgData.organizationId || (await getNextOrganizationId()));
  const organizationRecord = buildOrganizationRecord(orgData, generatedId);
  const nextOrganizations = [organizationRecord, ...organizations];
  writeStoredList(ORGANIZATION_STORAGE_KEY, nextOrganizations);
  persistLocalAuthUser(organizationRecord);
  return normalizeOrganization(organizationRecord);
}

export async function updateOrganization(orgId, orgData) {
  const organizations = readStoredList(ORGANIZATION_STORAGE_KEY, []);
  const index = organizations.findIndex((org) => org.id === orgId);

  if (index === -1) {
    throw new Error("Organization not found");
  }

  const updated = {
    ...organizations[index],
    ...buildOrganizationRecord(orgData, orgId),
    id: orgId,
    orgId,
  };

  organizations[index] = updated;
  writeStoredList(ORGANIZATION_STORAGE_KEY, organizations);
  return normalizeOrganization(updated);
}

export async function deleteOrganization(orgId) {
  const organizations = readStoredList(ORGANIZATION_STORAGE_KEY, []);
  const nextOrganizations = organizations.filter((org) => org.id !== orgId);
  writeStoredList(ORGANIZATION_STORAGE_KEY, nextOrganizations);
  return true;
}

export async function changeOrganizationStatus(orgId, status) {
  const organizations = readStoredList(ORGANIZATION_STORAGE_KEY, []);
  const index = organizations.findIndex((org) => org.id === orgId);

  if (index === -1) {
    throw new Error("Organization not found");
  }

  organizations[index] = {
    ...organizations[index],
    status: status === "inactive" ? "inactive" : "active",
  };

  writeStoredList(ORGANIZATION_STORAGE_KEY, organizations);
  return true;
}
