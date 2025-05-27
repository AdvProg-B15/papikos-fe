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
  description?: string | null;
}

export interface UpdateKosRequest {
  name?: string;
  address?: string;
  description?: string | null;
  numRooms?: number;
  monthlyRentPrice?: number;
  occupiedRooms?: number;
  isListed?: boolean;
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

export interface WishlistProperty {
  propertyId: string;
  name: string;
  address: string;
  monthlyRentPrice: number;
}

export interface WishlistItem {
  wishlistItemId: string;
  tenantUserId: string;
  property: WishlistProperty;
  createdAt: string; // ISO Date string "YYYY-MM-DDTHH:mm:ss.SSSSSSZ"
  propertyId: string; // Duplicate of property.propertyId, but present in spec
}

export interface AddToWishlistRequest {
  propertyId: string;
}

export interface NotificationData {
  notificationId: string;
  recipientUserId: string;
  notificationType: string; // e.g., "VACANCY_UPDATE", "RENTAL_STATUS_CHANGE"
  title: string;
  message: string;
  relatedPropertyId: string; // Kos ID
  relatedRentalId: string | null;
  createdAt: string; // ISO Date string
  read: boolean;
}

export interface SendVacancyNotificationRequest {
  relatedPropertyId: string; // Kos ID
  title: string;
  message: string;
}

export interface Balance {
  userId: string;
  balance: number;
  updatedAt: string; // ISO Date string
}

export interface Transaction {
  transactionId: string;
  userId: string; // The user whose balance this transaction affected primarily
  transactionType: string; // e.g., "TOPUP", "PAYMENT", "REFUND"
  amount: number;
  status: string; // e.g., "COMPLETED", "PENDING", "FAILED"
  relatedRentalId: string | null;
  payerUserId: string | null; // For PAYMENT, this is the tenant
  payeeUserId: string | null; // For PAYMENT, this is the owner
  notes: string | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface TopUpRequest {
  amount: number;
}

export interface PayRequest {
  rentalId: string;
  amount: number; // This amount should typically match the rental's due amount
}

export interface UpdateRentalRequest {
  submittedTenantName?: string;
  submittedTenantPhone?: string;
  rentalStartDate?: string; // YYYY-MM-DD
  rentalDurationMonths?: number;
}

// Enum for Rental Status (optional, but good for consistency)
export enum RentalStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED", // Might imply payment pending
  ACTIVE = "ACTIVE",     // Payment made, tenant occupying
  REJECTED = "REJECTED",
  CANCELLED_BY_TENANT = "CANCELLED_BY_TENANT",
  CANCELLED_BY_OWNER = "CANCELLED_BY_OWNER",
  COMPLETED = "COMPLETED", // Rental period ended
  PAYMENT_PENDING = "PAYMENT_PENDING" // If there's a step after approval before active
}
