import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Helper to determine base URL based on path
const getBaseUrl = (path: string): string | undefined => {
  if (path.startsWith('/api/v1/login') || 
      path.startsWith('/api/v1/owner/') || 
      path.startsWith('/api/v1/tenant/') || 
      path.startsWith('/api/v1/user/') || 
      path.startsWith('/api/v1/verify')) {
    return process.env.NEXT_PUBLIC_AUTH_URL;
  }
  // Corrected: Wishlist and Notifications go to NOTIFICATION_URL
  if (path.startsWith('/api/v1/wishlist') || path.startsWith('/api/v1/notifications')) {
    return process.env.NEXT_PUBLIC_NOTIFICATION_URL;
  }
  if (path.startsWith('/api/v1/payment')) {
    return process.env.NEXT_PUBLIC_PAYMENT_URL;
  }
  if (path.includes('/messages') && (path.startsWith('/api/v1/') && path.endsWith('/messages') || path.includes('/message/'))) { 
    // More specific check for chat: /api/v1/{roomId}/messages or /api/v1/{roomId}/message/{messageId}
    return process.env.NEXT_PUBLIC_CHAT_URL;
  }
  if (path.startsWith('/api/v1/rentals')) {
    return process.env.NEXT_PUBLIC_RENTAL_URL;
  }
  // Default to KOS_URL for general Kos operations: /api/v1 (get all kos), /api/v1/my, /api/v1/{kosId}
  if (path.startsWith('/api/v1')) { 
    // This will now correctly only catch Kos-specific endpoints like /api/v1 (for all Kos), /api/v1/my, /api/v1/{kosId}
    return process.env.NEXT_PUBLIC_KOS_URL;
  }
  
  console.warn(`No base URL determined for path: ${path}. Request might fail or use relative path.`);
  return undefined; // Or throw an error
};

const apiClient: AxiosInstance = axios.create({
  // baseURL will be set dynamically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to dynamically set baseURL and add Authorization header
apiClient.interceptors.request.use(
  (config: any) => { // Use internal AxiosRequestConfig if possible, 'any' for now to bypass strict checks for custom config property
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Dynamically set baseURL
    if (config.url) {
      const dynamicBaseUrl = getBaseUrl(config.url);
      if (dynamicBaseUrl) {
        config.baseURL = dynamicBaseUrl;
      } else if (!config.baseURL) {
        // If no dynamic base URL was found and no base URL is already set on the config
        console.error(`Base URL is not set for request to ${config.url}. Please check getBaseUrl logic or provide a baseURL in the request config.`);
        // Optionally, you could throw an error here or provide a default fallback URL.
        // For now, we'll let it proceed, which might lead to relative path requests if not handled.
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor for responses (e.g., to handle global errors)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle errors globally, e.g., 401 for logout
    if (error.response?.status === 401) {
      // Example: redirect to login or clear token
      console.error('Unauthorized, redirecting to login...');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // window.location.href = '/login'; // Or use Next.js router if available in this context
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;