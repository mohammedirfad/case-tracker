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

interface ApiValidationDetail {
  field?: string;
  message?: string;
}

function humanizeField(field: string) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function cleanValidationMessage(detail: ApiValidationDetail) {
  const field = detail.field ? humanizeField(detail.field) : "Field";
  const rawMessage = detail.message ?? "is invalid";

  if (detail.field === "dueDate" && rawMessage.includes("greater than")) {
    return "Due date must be a future date.";
  }

  const message = rawMessage
    .replaceAll('"', "")
    .replace(detail.field ?? "", field)
    .replace(/\s+/g, " ")
    .trim();

  return message.charAt(0).toUpperCase() + message.slice(1);
}

export function getApiMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; details?: ApiValidationDetail[] } | undefined;
    if (Array.isArray(data?.details) && data.details.length > 0) {
      return data.details.map(cleanValidationMessage).join(" ");
    }
    return data?.message ?? "Network error. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
