/**
 * Types for authentication
 */

export interface SignUpRequest {
  studentId: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpResponse {
  message: string;
  user: {
    user_id: string;
    student_id: string | null;
    name: string;
    email: string;
    role: string;
    created_at: Date | null;
  };
}

export interface SignUpError {
  error: string;
}

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignInResponse {
  message: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: string;
  };
  token?: string;
}

export interface AuthUser {
  user_id: string;
  student_id: string | null;
  name: string;
  email: string;
  mobile: string | null;
  role: string;
  is_active: boolean;
  created_at: Date | null;
}
