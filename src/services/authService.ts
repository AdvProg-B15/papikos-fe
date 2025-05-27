import apiClient from './apiClient';
import {
  ApiGeneralResponse,
  LoginRequest,
  RegisterTenantRequest,
  RegisterOwnerRequest,
  AuthData,
  User
} from '@/types';

export const loginUser = async (credentials: LoginRequest): Promise<ApiGeneralResponse<AuthData>> => {
  const response = await apiClient.post<ApiGeneralResponse<AuthData>>('/api/v1/login', credentials);
  return response.data;
};

export const registerTenant = async (data: RegisterTenantRequest): Promise<ApiGeneralResponse<User>> => {
  const response = await apiClient.post<ApiGeneralResponse<User>>('/api/v1/tenant/new', data);
  return response.data;
};

// Regarding /api/v1/owner/new: The spec shows an empty requestBody schema.
// This is unusual. Assuming it should at least take an email, and potentially a password.
// The backend might auto-generate a password or require email verification first.
// For this implementation, we'll assume the form collects email & password,
// but the actual data sent might need adjustment based on backend reality.
export const registerOwner = async (data: RegisterOwnerRequest): Promise<ApiGeneralResponse<User>> => {
  // If the backend truly expects an empty body, send {}
  // const requestData = Object.keys(data).length === 0 ? {} : data;
  // For now, sending the data as collected by the form.
  const response = await apiClient.post<ApiGeneralResponse<User>>('/api/v1/owner/new', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<ApiGeneralResponse<User>> => {
  const response = await apiClient.get<ApiGeneralResponse<User>>('/api/v1/user/me');
  return response.data;
};

export const verifyToken = async (): Promise<ApiGeneralResponse<User>> => {
  // The spec does not define a request body for /api/v1/verify
  // It's a POST, so it might expect the token in the body or rely on the Authorization header.
  // Assuming it relies on the Authorization header set by the interceptor.
  const response = await apiClient.post<ApiGeneralResponse<User>>('/api/v1/verify', {});
  return response.data;
};

export const approveOwner = async (ownerId: string): Promise<ApiGeneralResponse<User>> => {
    const response = await apiClient.patch<ApiGeneralResponse<User>>(`/api/v1/owner/${ownerId}/approve`);
    return response.data;
};

export const getPendingOwners = async (): Promise<ApiGeneralResponse<User[]>> => {
    const response = await apiClient.get<ApiGeneralResponse<User[]>>('/api/v1/owner/pending');
    return response.data;
};