import api from "../api/axios";
import { USER_API_URL, USER_API_ID_URL } from "../config";

export const getUsers = async () => {
  const response = await api.get(USER_API_URL);
  return response.data;
};

export const getUser = async (userId) => {
  const response = await api.get(USER_API_ID_URL.replace("{user_id}", userId));
  return response.data;
};

export const updateUser = async (userId, payload) => {
  const response = await api.patch(
    USER_API_ID_URL.replace("{user_id}", userId),
    payload
  );
  return response.data;
};

export const deactivateUser = async (userId) => {
  const response = await api.post(
    `${USER_API_ID_URL.replace("{user_id}", userId)}deactivate/`
  );
  return response.data;
};
