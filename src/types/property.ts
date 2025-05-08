// Property DTOs
export interface PropertySummaryDto {
  propertyId: number;
  name: string;
  address: string;
  monthlyRentPrice: number;
  numRooms?: number;
  thumbnailImageUrl?: string;
}

export interface PropertyDto {
  propertyId: number;
  ownerUserId: number;
  name: string;
  address: string;
  description?: string;
  numRooms: number;
  monthlyRentPrice: number;
  isListed: boolean;
  imageUrls?: string[];
  ownerInfo?: {
    name: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Property Management DTOs
export interface CreatePropertyRequest {
  name: string;
  address: string;
  description?: string;
  numRooms: number;
  monthlyRentPrice: number;
  // For image upload
  images?: File[];
}

export interface UpdatePropertyRequest {
  name?: string;
  address?: string;
  description?: string;
  numRooms?: number;
  monthlyRentPrice?: number;
  isListed?: boolean;
  // For image upload
  newImages?: File[];
  removedImageUrls?: string[];
}

// Search filters
export interface PropertySearchFilters {
  searchTerm: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  pageSize: number;
}

// Pagination
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// API response for property search
export interface PropertySearchResponse {
  properties: PropertySummaryDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
}
