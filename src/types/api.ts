export interface ApiGeneralResponse<T = any> {
  status: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface User {
  userId: string | null;
  email: string;
  role: string; // e.g., "ADMIN", "OWNER", "TENANT"
  status: string; // e.g., "ACTIVE", "PENDING"
}

export interface AuthData {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password?: string; // Password might be optional for owner registration if it's just an email submission first
}

export interface RegisterTenantRequest {
  email: string;
  password?: string;
}

// For owner registration, the spec says requestBody schema is {},
// but usually it would need email/password. We'll assume it for now.
export interface RegisterOwnerRequest {
  email: string;
  password?: string;
  // Add other fields if your backend expects them for owner registration
}

export interface Kos {
  id: string;
  ownerUserId: string;
  name: string;
  address: string;
  description: string | null;
  numRooms: number;
  monthlyRentPrice: number;
  occupiedRooms: number;
  isListed: boolean;
  createdAt: string; // Consider parsing to Date object
  updatedAt: string; // Consider parsing to Date object
}

export interface CreateKosRequest {
  name: string;
  address: string;
  numRooms: number;
  monthlyRentPrice: number;
}

export interface UpdateKosRequest {
  name?: string;
  address?: string;
  occupiedRooms?: number;
  numRooms?: number;
  monthlyRentPrice?: number;
}

// Add more types as needed for other entities (Wishlist, Notification, Payment, Chat, Rental)
// Example for Rental related date/time arrays (can be parsed into Date objects)
export type ApiDateTimeArray = [number, number, number, number, number, number, number?]; // Year, Month, Day, Hour, Minute, Second, Nano (optional)

export interface Rental {
  rentalId: string;
  tenantUserId: string;
  kosId: string;
  ownerUserId: string;
  kosName: string;
  submittedTenantName: string;
  submittedTenantPhone: string;
  rentalStartDate: ApiDateTimeArray | string; // Request is string 'YYYY-MM-DD', response is array
  rentalDurationMonths: number;
  rentalEndDate: ApiDateTimeArray;
  status: string; // e.g., PENDING_APPROVAL, APPROVED, ACTIVE, REJECTED, CANCELLED, COMPLETED
  createdAt: ApiDateTimeArray;
  updatedAt: ApiDateTimeArray;
}

export interface CreateRentalRequest {
  kosId: string;
  submittedTenantName: string;
  submittedTenantPhone: string;
  rentalStartDate: string; // YYYY-MM-DD
  rentalDurationMonths: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any[]; // You might want to type this better if you use sorting
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: any[]; // Duplicate of pageable.sort
  empty: boolean;
}
