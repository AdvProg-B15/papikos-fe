"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useOwnerProperties } from "@/hooks/use-owner-properties";
import { PropertyListItem } from "@/modules/owner/property-list-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, RefreshCw, Loader2 } from "lucide-react";

export default function MyPropertiesPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { properties, isLoading, error, refreshProperties, deleteProperty } =
    useOwnerProperties();
  const router = useRouter();

  // Redirect if not authenticated or not an owner
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== "OWNER"))) {
      router.push("/login?from=/my-properties");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Show loading state while authentication is in progress
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mr-2" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  // If not authenticated or not an owner, don't render anything (will redirect)
  if (!isAuthenticated || (user && user.role !== "OWNER")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Properties</h1>
          <p className="text-gray-600 mt-1">Manage your property listings</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={refreshProperties}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/my-properties/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={refreshProperties}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[350px] w-full rounded-lg" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-600">
            No properties found
          </h3>
          <p className="text-gray-500 mt-2 mb-6">
            You haven&apos;t added any properties yet
          </p>
          <Link href="/my-properties/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyListItem
              key={property.propertyId}
              property={property}
              onDelete={deleteProperty}
            />
          ))}
        </div>
      )}
    </div>
  );
}
