import api from "../api/axios";
import { STATISTICS_URL } from "../config";

export const getStatistics = async () => {
  const response = await api.get(STATISTICS_URL);
  return response.data;
};
