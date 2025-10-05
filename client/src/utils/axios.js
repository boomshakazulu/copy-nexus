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
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Request failed";
    return Promise.reject(new Error(msg));
  }
);
