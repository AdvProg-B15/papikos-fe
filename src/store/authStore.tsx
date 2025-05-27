"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthData } from '@/types';
import apiClient from '@/services/apiClient';
import { useRouter } from 'next/navigation'; // For redirection
import { getCurrentUser } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (authData: AuthData) => void;
  logout: () => void;
  setUserAndToken: (user: User | null, token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUserString = localStorage.getItem('user');

      if (storedToken) {
        try {
          // Set token for apiClient immediately
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await getCurrentUser(); // Use /api/v1/user/me
          
          if (response.status === 200 && response.data) {
            setUser(response.data); // Use fresh user data from API
            setToken(storedToken);
            localStorage.setItem('user', JSON.stringify(response.data)); // Update stored user
          } else {
            // Token might be invalid or expired
            throw new Error(response.message || "Failed to verify session");
          }
        } catch (error) {
          console.error("Session verification failed:", error);
          // Clear invalid token/user from storage and state
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          delete apiClient.defaults.headers.common['Authorization'];
          // Optionally, redirect to login if not on a public page
          // if (router.pathname !== '/login' && router.pathname !== '/register-tenant' etc.) {
          //    router.push('/login');
          // }
        }
      }
      setIsLoading(false);
    };

    loadUserFromStorage();
  }, []);

  // Example function to verify token on load (call this inside useEffect)
  // async function verifyTokenOnLoad(currentToken: string, currentUser: User) {
  //   try {
  //     // You might want a specific /api/v1/verify endpoint or use /api/v1/user/me
  //     // Assuming /api/v1/user/me serves this purpose if token is valid
  //     apiClient.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
  //     const response = await apiClient.get('/api/v1/user/me');
  //     if (response.data.data) {
  //       setUser(response.data.data);
  //       setToken(currentToken);
  //     } else {
  //       throw new Error("Token verification failed or user data not returned");
  //     }
  //   } catch (error) {
  //     console.error("Session expired or token invalid on load:", error);
  //     logout(); // Clear invalid token/user
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }


  const login = (authData: AuthData) => {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setUser(authData.user);
    setToken(authData.accessToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authData.accessToken}`;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    delete apiClient.defaults.headers.common['Authorization'];
    router.push('/login'); // Redirect to login after logout
  };

  const setUserAndToken = (newUser: User | null, newToken: string | null) => {
    setUser(newUser);
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('accessToken', newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('accessToken');
      delete apiClient.defaults.headers.common['Authorization'];
    }
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };


  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setUserAndToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};