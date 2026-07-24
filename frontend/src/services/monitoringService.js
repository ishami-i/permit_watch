import api from "../api/axios";
import {
  OFFICER_API_URL,
  OFFICER_API_ID_URL,
  OFFICER_API_ASSIGNED_URL,
  OFFICER_API_UNASSIGNED_URL,
  OFFICER_API_ASSIGN_URL,
  DISTRICT_COVERAGE_URL,
} from "../config";

export const getAssignedOfficers = async () => {
  const response = await api.get(OFFICER_API_ASSIGNED_URL);
  return response.data;
};

export const getUnassignedOfficers = async () => {
  const response = await api.get(OFFICER_API_UNASSIGNED_URL);
  return response.data;
};

export const getOfficer = async (officerId) => {
  const response = await api.get(OFFICER_API_ID_URL.replace("{officer_id}", officerId));
  return response.data;
};

export const getDistrictCoverage = async () => {
  const response = await api.get(DISTRICT_COVERAGE_URL);
  return response.data;
};

export const assignOfficer = async (officerId, district) => {
  const response = await api.post(
    OFFICER_API_ASSIGN_URL.replace("{officer_id}", officerId),
    { district }
  );
  return response.data;
};

export const createMonitoringOfficer = async (payload) => {
  const response = await api.post(OFFICER_API_URL, payload);
  return response.data;
};
