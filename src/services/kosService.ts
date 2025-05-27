import apiClient from './apiClient';
import {
  ApiGeneralResponse,
  Kos,
  CreateKosRequest,
  UpdateKosRequest,
} from '@/types';

// GET /api/v1 (Get All Kos)
export const getAllKos = async (): Promise<ApiGeneralResponse<Kos[]>> => {
  // Note: The spec mentions an optional X-Internal-Token header.
  // This is usually for server-to-server calls, not frontend.
  // We'll omit it unless specifically required for public access from frontend.
  const response = await apiClient.get<ApiGeneralResponse<Kos[]>>('/api/v1');
  return response.data;
};

// POST /api/v1 (Create New Kos [OWNER])
export const createKos = async (data: CreateKosRequest): Promise<ApiGeneralResponse<Kos>> => {
  const response = await apiClient.post<ApiGeneralResponse<Kos>>('/api/v1', data);
  return response.data;
};

// GET /api/v1/{kosId} (Get Kos by Id)
export const getKosById = async (kosId: string): Promise<ApiGeneralResponse<Kos>> => {
  const response = await apiClient.get<ApiGeneralResponse<Kos>>(`/api/v1/${kosId}`);
  return response.data;
};

// GET /api/v1/my (Get My Kos [OWNER])
export const getMyKos = async (): Promise<ApiGeneralResponse<Kos[]>> => {
  const response = await apiClient.get<ApiGeneralResponse<Kos[]>>('/api/v1/my');
  return response.data;
};

// PATCH /api/v1/{kosId} (Update Kos by Id [OWNER])
export const updateKos = async (kosId: string, data: UpdateKosRequest): Promise<ApiGeneralResponse<Kos>> => {
  const response = await apiClient.patch<ApiGeneralResponse<Kos>>(`/api/v1/${kosId}`, data);
  return response.data;
};

// DELETE /api/v1/{kosId} (Delete Kos by Id [OWNER])
export const deleteKos = async (kosId: string): Promise<ApiGeneralResponse<null> | void> => { // 204 No Content
  const response = await apiClient.delete(`/api/v1/${kosId}`);
  // For 204, response.data might be empty or undefined.
  // If your apiClient or backend wrapper returns a structured response even for 204, adjust accordingly.
  // For now, assuming it might not have a body or the standard ApiGeneralResponse structure.
  if (response.status === 204) return; // Or return a specific success indicator if needed
  return response.data as ApiGeneralResponse<null>; // If it does return a body
};

// GET /api/v1/wishlist (Get Wishlist [TENANT]) - Will be used later
// POST /api/v1/wishlist (Add Wishlist [TENANT]) - Will be used later
// DELETE /api/v1/wishlist/{propertyId} (Remove Wishlist [TENANT]) - Will be used later