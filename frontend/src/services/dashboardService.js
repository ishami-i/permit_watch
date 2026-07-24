import api from "../api/axios";
import { DASHBOARD_SUMMARY_URL } from "../config";

export const getDashboardSummary = async () => {
  const response = await api.get(DASHBOARD_SUMMARY_URL);
  return response.data;
};
