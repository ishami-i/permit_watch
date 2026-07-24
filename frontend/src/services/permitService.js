import api from "./api";
import {
  PERMIT_API_URL,
  PERMIT_API_FULL_URL,
  PERMIT_API_FULL_ID_URL,
  PERMIT_API_ID_URL,
  PERMIT_API_FLAGGED_URL,
  PROJECT_API_FLAGGED_URL,
  PERMIT_API_CHECK_URL,
} from "../";

// Get all permits (basic)
export const getPermits = async () => {
  const response = await api.get(PERMIT_API_URL);
  return response.data;
};

// Get all permits with full related data
export const getFullPermits = async () => {
  const response = await axios.get(PERMIT_API_FULL_URL);
  return response.data;
};

// Get a single permit (IDs only)
export const getPermit = async (permitId) => {
  const response = await axios.get(
    PERMIT_API_ID_URL.replace("{permit_id}", permitId)
  );
  return response.data;
};

// Get a single permit with all related data
export const getFullPermit = async (permitId) => {
  const response = await axios.get(
    PERMIT_API_FULL_ID_URL.replace("{permit_id}", permitId)
  );
  return response.data;
};

// Get all flagged permits
export const getFlaggedPermits = async () => {
  const response = await axios.get(PERMIT_API_FLAGGED_URL);
  return response.data;
};

// Get all flagged projects
export const getFlaggedProjects = async () => {
  const response = await axios.get(PROJECT_API_FLAGGED_URL);
  return response.data;
};

// Trigger permit flag check
export const checkPermit = async (permitId) => {
  const response = await axios.post(
    PERMIT_API_CHECK_URL.replace("{permit_id}", permitId)
  );
  return response.data;
};