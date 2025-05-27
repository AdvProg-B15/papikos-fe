import apiClient from './apiClient';
import {
  ApiGeneralResponse,
  Rental,
  CreateRentalRequest,
  UpdateRentalRequest,
} from '@/types';

// POST /api/v1/rentals (Create Rental [TENANT])
export const createRental = async (data: CreateRentalRequest): Promise<ApiGeneralResponse<Rental>> => {
  const response = await apiClient.post<ApiGeneralResponse<Rental>>('/api/v1/rentals', data);
  return response.data;
};

// GET /api/v1/rentals/my (Get Tenants Rental [TENANT])
export const getMyRentalsAsTenant = async (): Promise<ApiGeneralResponse<Rental[]>> => {
  const response = await apiClient.get<ApiGeneralResponse<Rental[]>>('/api/v1/rentals/my');
  return response.data;
};

// GET /api/v1/rentals/owner (Get Owner Rentals [OWNER])
export const getMyRentalsAsOwner = async (): Promise<ApiGeneralResponse<Rental[]>> => {
  const response = await apiClient.get<ApiGeneralResponse<Rental[]>>('/api/v1/rentals/owner');
  return response.data;
};

// GET /api/v1/rentals/{rentalId} (Get Rental By ID)
export const getRentalById = async (rentalId: string): Promise<ApiGeneralResponse<Rental>> => {
  const response = await apiClient.get<ApiGeneralResponse<Rental>>(`/api/v1/rentals/${rentalId}`);
  return response.data;
};

// PATCH /api/v1/rentals/{rentalId} (Edit Rental By ID [TENANT])
// Only for PENDING_APPROVAL rentals by tenant
export const updateRental = async (rentalId: string, data: UpdateRentalRequest): Promise<ApiGeneralResponse<Rental>> => {
  const response = await apiClient.patch<ApiGeneralResponse<Rental>>(`/api/v1/rentals/${rentalId}`, data);
  return response.data;
};

// PATCH /api/v1/rentals/{rentalId}/cancel (Cancel Rental by ID [TENANT/OWNER])
export const cancelRental = async (rentalId: string): Promise<ApiGeneralResponse<Rental>> => {
  const response = await apiClient.patch<ApiGeneralResponse<Rental>>(`/api/v1/rentals/${rentalId}/cancel`);
  return response.data;
};

// PATCH /api/v1/rentals/{rentalId}/approve (Approve Rental by ID [OWNER])
export const approveRental = async (rentalId: string): Promise<ApiGeneralResponse<Rental>> => {
  const response = await apiClient.patch<ApiGeneralResponse<Rental>>(`/api/v1/rentals/${rentalId}/approve`);
  return response.data;
};

// PATCH /api/v1/rentals/{rentalId}/reject (Reject Rental By ID [OWNER])
export const rejectRental = async (rentalId: string): Promise<ApiGeneralResponse<Rental>> => {
  const response = await apiClient.patch<ApiGeneralResponse<Rental>>(`/api/v1/rentals/${rentalId}/reject`);
  return response.data;
};