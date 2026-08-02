import api from "../api/axios";
import { USER_API_URL, USER_API_ID_URL, USER_API_ROLE_URL, ROLES_URL } from "../config";

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

export const updateUserRole = async (userId, roleId) => {
  const response = await api.patch(
    USER_API_ROLE_URL.replace("{user_id}", userId),
    { role_id: roleId }
  );
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get(ROLES_URL);
  return response.data;
};
