import api from "../api/axios";
import { ALERT_API_URL, ALERT_API_ID_URL, ALERT_API_RESOLVE_URL } from "../config";

export const getAlerts = async () => {
  const response = await api.get(ALERT_API_URL);
  return response.data;
};

export const getAlert = async (alertId) => {
  const response = await api.get(ALERT_API_ID_URL.replace("{alert_id}", alertId));
  return response.data;
};

export const resolveAlert = async (alertId, resolutionNote) => {
  const response = await api.post(
    ALERT_API_RESOLVE_URL.replace("{alert_id}", alertId),
    { resolution_note: resolutionNote }
  );
  return response.data;
};
export const updateAlertStatus = async (alertId, status, resolutionNote = "") => {
  const response = await api.post(
    ALERT_API_RESOLVE_URL.replace("{alert_id}", alertId),
    { status, resolution_note: resolutionNote }
  );
  return response.data;
};