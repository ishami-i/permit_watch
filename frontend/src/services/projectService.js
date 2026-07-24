import api from "../api/axios";
import {
  PROJECT_API_URL,
  PROJECT_API_ID_URL,
  PROJECT_API_FLAGGED_URL,
} from "../config";

export const getProjects = async () => {
  const response = await api.get(PROJECT_API_URL);
  return response.data;
};

export const getProject = async (projectId) => {
  const response = await api.get(PROJECT_API_ID_URL.replace("{project_id}", projectId));
  return response.data;
};

export const getFlaggedProjects = async () => {
  const response = await api.get(PROJECT_API_FLAGGED_URL);
  return response.data;
};
