import axios from "axios";

export const api = axios.create({
  baseURL: "https://tcc-medichan-production.up.railway.app/",
});

// injeta o token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medichain_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
