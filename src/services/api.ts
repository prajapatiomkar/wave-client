import axios from "axios";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Track if we're already redirecting to avoid multiple redirects
let isRedirecting = false;

// Add token to requests
apiClient.interceptors.request.use((config) => {
  // Get token from localStorage directly to avoid hydration issues
  const persistedAuth = localStorage.getItem("auth-storage");
  console.log("Request interceptor - Has auth:", !!persistedAuth);

  if (persistedAuth) {
    try {
      const { state } = JSON.parse(persistedAuth);
      const token = state?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error parsing auth token:", error);
    }
  }

  return config;
});

// Handle 401 errors - but avoid logout loops
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 if:
    // 1. We got a response (not a network error)
    // 2. The status is 401
    // 3. We're not already redirecting
    // 4. The request was not to /auth/login or /auth/register (avoid logout on failed login)
    if (
      error.response?.status === 401 &&
      !isRedirecting &&
      !error.config?.url?.includes("/auth/login") &&
      !error.config?.url?.includes("/auth/register")
    ) {
      isRedirecting = true;

      // Clear auth from localStorage
      localStorage.removeItem("auth-storage");

      // Redirect to login
      window.location.href = "/login";

      // Reset flag after redirect
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get("/me");
    return response.data;
  },
};
