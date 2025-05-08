export interface RegisterUserRequest {
  email: string;
  password: string;
  role?: "TENANT" | "OWNER";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserDto {
  userId: number;
  email: string;
  role: "TENANT" | "OWNER" | "ADMIN";
  status: "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE";
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  user: UserDto;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  registerTenant: (data: RegisterUserRequest) => Promise<void>;
  registerOwner: (data: RegisterUserRequest) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}
