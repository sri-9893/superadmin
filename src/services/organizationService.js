import {
  getNextOrganizationId as getLocalNextOrganizationId,
  getOrganizations as getLocalOrganizations,
  getOrganizationDetails as getLocalOrganizationDetails,
  createOrganization as createLocalOrganization,
  updateOrganization as updateLocalOrganization,
  deleteOrganization as deleteLocalOrganization,
  changeOrganizationStatus as changeLocalOrganizationStatus,
} from "./organizationService.local";

export async function getNextOrganizationId() {
  return getLocalNextOrganizationId();
}

export async function getOrganizations() {
  return getLocalOrganizations();
}

export async function getOrganizationDetails(orgId) {
  return getLocalOrganizationDetails(orgId);
}

export async function createOrganization(orgData) {
  return createLocalOrganization(orgData);
}

export async function updateOrganization(orgId, orgData) {
  return updateLocalOrganization(orgId, orgData);
}

export async function deleteOrganization(orgId) {
  return deleteLocalOrganization(orgId);
}

export async function changeOrganizationStatus(orgId, status) {
  return changeLocalOrganizationStatus(orgId, status);
}
