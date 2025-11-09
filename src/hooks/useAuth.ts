import { useMutation, useQuery } from "@tanstack/react-query";
import { authAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { LoginRequest, RegisterRequest } from "../types";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const { user, token, setAuth, logout, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authAPI.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });

  // Only fetch user data if:
  // 1. Store is hydrated
  // 2. We have a token
  // 3. We don't already have user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["me", token],
    queryFn: () => authAPI.getMe(),
    enabled: isHydrated && !!token && !user,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user || userData?.user,
    isAuthenticated,
    isLoading: !isHydrated || isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};
