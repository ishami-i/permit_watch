import api from "../api/axios";
import { APPLICANT_API_URL, APPLICANT_API_ID_URL } from "../config";

export const getApplicants = async () => {
  const response = await api.get(APPLICANT_API_URL);
  return response.data;
};

export const getApplicant = async (applicantId) => {
  const response = await api.get(
    APPLICANT_API_ID_URL.replace("{applicant_id}", applicantId)
  );
  return response.data;
};
