import api from "../api/axios";
import { LOGIN_URL, LOGOUT_URL, FORGOT_PASSWORD_URL, CHANGE_PASSWORD_URL, CURRENT_USER_URL } from "../config";

export const login = async (email, password) => {
  const response = await api.post(LOGIN_URL, { user_email: email, password });
  const { access, refresh, user } = response.data;

  localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);

  return user;
};

export const logout = async () => {
  try {
    await api.post(LOGOUT_URL);
  } finally {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }
};

export const forgotPassword = async (email) => {
  const response = await api.post(FORGOT_PASSWORD_URL, { email });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post(CHANGE_PASSWORD_URL, {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get(CURRENT_USER_URL);
  return response.data;
};
