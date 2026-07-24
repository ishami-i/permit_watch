import api from "../api/axios";
import { AUDIT_LOG_URL } from "../config";

export const getAuditLogs = async (params = {}) => {
  const response = await api.get(AUDIT_LOG_URL, { params });
  return response.data;
};
