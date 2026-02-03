import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

//response error normalization
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const errorObj = data?.error;
    const message =
      errorObj?.message ||
      data?.message ||
      (typeof errorObj === "string" ? errorObj : null) ||
      err?.message ||
      "Request failed";
    const code = errorObj?.code || data?.code;
    const details = errorObj?.details || data?.details;
    const nextErr = new Error(message);
    nextErr.status = status;
    nextErr.code = code;
    nextErr.details = details;
    nextErr.raw = err;
    return Promise.reject(nextErr);
  }
);
