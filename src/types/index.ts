export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar: string;
  is_online: boolean;
  last_seen: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}
