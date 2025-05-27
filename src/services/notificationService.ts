import apiClient from './apiClient';
import {
  ApiGeneralResponse,
  NotificationData,
  SendVacancyNotificationRequest,
  WishlistItem, // Added
  AddToWishlistRequest, // Added
} from '@/types';

// GET /api/v1/notifications (Get Notification [TENANT])
export const getNotifications = async (): Promise<ApiGeneralResponse<NotificationData[]>> => {
  const response = await apiClient.get<ApiGeneralResponse<NotificationData[]>>('/api/v1/notifications');
  return response.data;
};

// PATCH /api/v1/notifications/{notificationId}/read (Read Notification [TENANT])
export const markNotificationAsRead = async (notificationId: string): Promise<ApiGeneralResponse<NotificationData>> => {
  const response = await apiClient.patch<ApiGeneralResponse<NotificationData>>(`/api/v1/notifications/${notificationId}/read`);
  return response.data;
};

// POST /api/v1/notifications/vacancy (Send Vacancy Notification [ADMIN])
export const sendVacancyNotification = async (data: SendVacancyNotificationRequest): Promise<ApiGeneralResponse<NotificationData[]>> => {
  const response = await apiClient.post<ApiGeneralResponse<NotificationData[]>>('/api/v1/notifications/vacancy', data);
  return response.data;
};

// --- Wishlist Functions ---
// GET /api/v1/wishlist (Get Wishlist [TENANT])
export const getWishlist = async (): Promise<ApiGeneralResponse<WishlistItem[]>> => {
  const response = await apiClient.get<ApiGeneralResponse<WishlistItem[]>>('/api/v1/wishlist');
  return response.data;
};

// POST /api/v1/wishlist (Add Wishlist [TENANT])
export const addToWishlist = async (data: AddToWishlistRequest): Promise<ApiGeneralResponse<WishlistItem>> => {
  const response = await apiClient.post<ApiGeneralResponse<WishlistItem>>('/api/v1/wishlist', data);
  return response.data;
};

// DELETE /api/v1/wishlist/{propertyId} (Remove Wishlist [TENANT])
export const removeFromWishlist = async (propertyId: string): Promise<void> => { // 204 No Content
  await apiClient.delete(`/api/v1/wishlist/${propertyId}`);
};