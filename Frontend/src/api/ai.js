import axios from "axios";

const apiAI = axios.create({
  baseURL: import.meta.env.VITE_AI_URL || "http://localhost:3500",
  headers: {
    "Content-Type": "application/json",
  },
});

apiAI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiAI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — maybe token expired");
    }
    return Promise.reject(error);
  }
);

export default apiAI;
