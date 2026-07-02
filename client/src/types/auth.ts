export interface User {
  id: number;
  name: string;
  email: string;
  role: 'FRESHER' | 'CLIENT' | 'MENTOR';
  tier: number | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: 'FRESHER' | 'CLIENT' | 'MENTOR';
}

export interface LoginPayload {
  email: string;
  password: string;
}
