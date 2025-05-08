"use client";

import { useState, useEffect, useCallback } from "react";
import { getMyProperties, deleteProperty } from "@/services/property-service";
import type { PropertyDto } from "@/types/property";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export function useOwnerProperties() {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  const fetchProperties = useCallback(async () => {
    // Don't fetch if not authenticated or not an owner
    if (!isAuthenticated || (user && user.role !== "OWNER")) {
      setProperties([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch your properties"
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Only fetch properties when auth is done loading and user is authenticated as owner
    if (!authLoading && isAuthenticated && user?.role === "OWNER") {
      fetchProperties();
    }
  }, [isAuthenticated, user, authLoading, fetchProperties]);

  const handleDeleteProperty = async (propertyId: number) => {
    try {
      await deleteProperty(propertyId);
      setProperties((prevProperties) =>
        prevProperties.filter((property) => property.propertyId !== propertyId)
      );
      toast("Property deleted", {
        description: "Your property has been successfully deleted",
      });
    } catch (err) {
      console.error("Error deleting property:", err);
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to delete property",
      });
    }
  };

  return {
    properties,
    isLoading,
    error,
    refreshProperties: fetchProperties,
    deleteProperty: handleDeleteProperty,
  };
}
