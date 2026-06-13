import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
export const ASSET_URL = API_URL.replace(/\/api$/, "");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000
});

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
  }
}

setToken(localStorage.getItem("token"));

export function getApiMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? "Network error. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
