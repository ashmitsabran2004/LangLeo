import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Add token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      localStorage.removeItem("token");
      // Redirect to login
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
