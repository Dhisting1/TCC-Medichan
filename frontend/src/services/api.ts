import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000",
});

// injeta o token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medichain_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
