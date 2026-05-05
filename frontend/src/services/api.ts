import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  "https://tcc-medichan-production.up.railway.app";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medichain_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
