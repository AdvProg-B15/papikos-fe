import type {
  PropertyDto,
  PropertySearchFilters,
  PropertySearchResponse,
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from "@/types/property";

const API_URL = "/api/properties";

export async function searchProperties(
  filters: PropertySearchFilters
): Promise<PropertySearchResponse> {
  // Convert filters to query params
  const queryParams = new URLSearchParams();

  if (filters.searchTerm) {
    queryParams.append("searchTerm", filters.searchTerm);
  }

  if (filters.minPrice !== undefined) {
    queryParams.append("minPrice", filters.minPrice.toString());
  }

  if (filters.maxPrice !== undefined) {
    queryParams.append("maxPrice", filters.maxPrice.toString());
  }

  queryParams.append("page", filters.page.toString());
  queryParams.append("pageSize", filters.pageSize.toString());

  try {
    const response = await fetch(`${API_URL}?${queryParams.toString()}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Error ${response.status}: Failed to fetch properties`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error searching properties:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch properties");
  }
}

export async function getPropertyById(
  propertyId: number
): Promise<PropertyDto> {
  try {
    const response = await fetch(`${API_URL}/${propertyId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Error ${response.status}: Failed to fetch property details`
      );
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching property ${propertyId}:`, error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch property details");
  }
}

// Owner-specific operations
export async function getMyProperties(): Promise<PropertyDto[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    // Return empty array instead of throwing an error when not authenticated
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Error ${response.status}: Failed to fetch your properties`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching owner properties:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch your properties");
  }
}

export async function createProperty(
  propertyData: CreatePropertyRequest
): Promise<PropertyDto> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Handle image uploads if present
    if (propertyData.images && propertyData.images.length > 0) {
      // In a real implementation, you would upload images to a storage service
      // and get back URLs to include in the property data
      console.log(`Uploading ${propertyData.images.length} images...`);
      // For this mock implementation, we'll just remove the images from the request
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { images, ...dataWithoutImages } = propertyData;
      propertyData = dataWithoutImages;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Error ${response.status}: Failed to create property`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error creating property:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create property");
  }
}

export async function updateProperty(
  propertyId: number,
  propertyData: UpdatePropertyRequest
): Promise<PropertyDto> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Handle image uploads if present
    if (propertyData.newImages && propertyData.newImages.length > 0) {
      // In a real implementation, you would upload images to a storage service
      // and get back URLs to include in the property data
      console.log(`Uploading ${propertyData.newImages.length} new images...`);
      // For this mock implementation, we'll just remove the images from the request
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { newImages, ...dataWithoutNewImages } = propertyData;
      propertyData = dataWithoutNewImages;
    }

    const response = await fetch(`${API_URL}/${propertyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Error ${response.status}: Failed to update property`
      );
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating property ${propertyId}:`, error);
    throw error instanceof Error
      ? error
      : new Error("Failed to update property");
  }
}

export async function deleteProperty(propertyId: number): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_URL}/${propertyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Error ${response.status}: Failed to delete property`
      );
    }
  } catch (error) {
    console.error(`Error deleting property ${propertyId}:`, error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete property");
  }
}

// Wishlist operations
export async function addToWishlist(propertyId: number): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ propertyId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to add property to wishlist"
      );
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to add property to wishlist");
  }
}

export async function removeFromWishlist(propertyId: number): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`/api/wishlist/${propertyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to remove property from wishlist"
      );
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to remove property from wishlist");
  }
}

export async function checkWishlistStatus(
  propertyId: number
): Promise<boolean> {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`/api/wishlist/check/${propertyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.inWishlist;
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    return false;
  }
}
