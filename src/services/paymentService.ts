import apiClient from './apiClient';
import {
  ApiGeneralResponse,
  Balance,
  Transaction,
  TopUpRequest,
  PayRequest,
  PaginatedResponse,
} from '@/types';

// POST /api/v1/payment/topup (Top Up [TENANT])
export const topUpBalance = async (data: TopUpRequest): Promise<ApiGeneralResponse<Transaction>> => {
  const response = await apiClient.post<ApiGeneralResponse<Transaction>>('/api/v1/payment/topup', data);
  return response.data;
};

// POST /api/v1/payment/pay (Pay [TENANT])
export const makePayment = async (data: PayRequest): Promise<ApiGeneralResponse<Transaction>> => {
  const response = await apiClient.post<ApiGeneralResponse<Transaction>>('/api/v1/payment/pay', data);
  return response.data;
};

// GET /api/v1/payment/balance (Get My Balance [TENANT/OWNER])
export const getMyBalance = async (): Promise<ApiGeneralResponse<Balance>> => {
  const response = await apiClient.get<ApiGeneralResponse<Balance>>('/api/v1/payment/balance');
  return response.data;
};

// GET /api/v1/payment/transactions (Transaction History [TENANT/OWNER])
export const getTransactionHistory = async (page: number = 0, size: number = 10): Promise<ApiGeneralResponse<PaginatedResponse<Transaction>>> => {
  // API spec doesn't show query params for pagination, but paginated response suggests they exist.
  // Common params are `page` and `size`. Adjust if your backend uses different ones.
  const response = await apiClient.get<ApiGeneralResponse<PaginatedResponse<Transaction>>>(`/api/v1/payment/transactions?page=${page}&size=${size}`);
  return response.data;
};