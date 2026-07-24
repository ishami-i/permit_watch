import api from "../api/axios";
import {
  PERMIT_API_URL,
  PERMIT_API_FULL_URL,
  PERMIT_API_FULL_ID_URL,
  PERMIT_API_ID_URL,
  PERMIT_API_FLAGGED_URL,
  PERMIT_API_PENDING_URL,
  PERMIT_API_CHECK_URL,
} from "../config";

// Get all permits (basic)
export const getPermits = async () => {
  const response = await api.get(PERMIT_API_URL);
  return response.data;
};

// Get all permits with full related data (applicant, project, property, etc.)
export const getFullPermits = async () => {
  const response = await api.get(PERMIT_API_FULL_URL);
  return response.data;
};

// Get a single permit (IDs only)
export const getPermit = async (permitId) => {
  const response = await api.get(PERMIT_API_ID_URL.replace("{permit_id}", permitId));
  return response.data;
};

// Get a single permit with all related data
export const getFullPermit = async (permitId) => {
  const response = await api.get(
    PERMIT_API_FULL_ID_URL.replace("{permit_id}", permitId)
  );
  return response.data;
};

// Get all flagged permits
export const getFlaggedPermits = async () => {
  const response = await api.get(PERMIT_API_FLAGGED_URL);
  return response.data;
};

// Get all pending permits
export const getPendingPermits = async () => {
  const response = await api.get(PERMIT_API_PENDING_URL);
  return response.data;
};

// Trigger a permit flag re-check
export const checkPermit = async (permitId) => {
  const response = await api.post(PERMIT_API_CHECK_URL.replace("{permit_id}", permitId));
  return response.data;
};
