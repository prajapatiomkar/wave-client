import { useMutation, useQuery } from "@tanstack/react-query";
import { authAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { LoginRequest, RegisterRequest } from "../types";

export const useAuth = () => {
  const { user, token, setAuth, logout, isAuthenticated } = useAuthStore();

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

  const { data: userData, isLoading } = useQuery({
    queryKey: ["me", token],
    queryFn: () => authAPI.getMe(),
    enabled: !!token && !user,
    retry: false,
  });

  return {
    user: user || userData?.user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};
