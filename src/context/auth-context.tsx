"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type {
  AuthContextType,
  LoginRequest,
  RegisterUserRequest,
  UserDto,
  LoginResponse,
} from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        fetchCurrentUser();
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data: LoginResponse = await response.json();

      localStorage.setItem("token", data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      setIsAuthenticated(true);

      // Redirect based on user role
      if (data.user.role === "TENANT") {
        router.push("/search");
      } else if (data.user.role === "OWNER") {
        router.push("/my-properties");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerTenant = async (data: RegisterUserRequest) => {
    return registerUser({ ...data, role: "TENANT" });
  };

  const registerOwner = async (data: RegisterUserRequest) => {
    return registerUser({ ...data, role: "OWNER" });
  };

  const registerUser = async (data: RegisterUserRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      const response = await fetch("/api/auth/users/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData: UserDto = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    isLoading,
    login,
    registerTenant,
    registerOwner,
    logout,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
