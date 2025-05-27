"use client";

import { useEffect, useState } from "react";
import { getAllKos } from "@/services/kosService";
import { Kos } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast as sonnerToast } from "sonner";
import { AlertTriangle, BedDouble, Home, DollarSign, Info, Tag } from "lucide-react";
import Link from "next/link";

export default function KosListPage() {
  const [kosList, setKosList] = useState<Kos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllKos();
        if (response.status === 200 && response.data) {
          setKosList(response.data);
        } else {
          setError(response.message || "Failed to fetch Kos data.");
          sonnerToast.error(response.message || "Failed to fetch Kos data.");
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
        setError(errorMessage);
        sonnerToast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKos();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10">Loading Kos listings...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-xl">Error loading Kos data: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  if (kosList.length === 0) {
    return <div className="text-center py-10">No Kos properties found.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Available Kos Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kosList.map((kos) => (
          <Card key={kos.id} className="flex flex-col">
            {/* Placeholder for Image */}
            {/* <div className="relative h-48 w-full bg-gray-200">
              <Image src="/placeholder-kos.jpg" alt={kos.name} layout="fill" objectFit="cover" />
            </div> */}
            <CardHeader>
              <CardTitle className="text-xl">{kos.name}</CardTitle>
              <CardDescription className="flex items-center text-sm">
                <Home className="w-4 h-4 mr-2" /> {kos.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {kos.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex items-start">
                  <Info className="w-4 h-4 mr-2 mt-1 flex-shrink-0" /> {kos.description}
                </p>
              )}
              <div className="space-y-1 text-sm">
                <p className="flex items-center"><BedDouble className="w-4 h-4 mr-2" /> Rooms: {kos.numRooms} (Available: {kos.numRooms - kos.occupiedRooms})</p>
                <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Price: IDR {kos.monthlyRentPrice.toLocaleString()}/month</p>
                 <p className={`flex items-center font-semibold ${kos.isListed ? 'text-green-600' : 'text-red-600'}`}>
                  <Tag className="w-4 h-4 mr-2" /> {kos.isListed ? 'Listed' : 'Not Listed'}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              {/* Later, add "Add to Wishlist" or "View Details" buttons */}
              <Button className="w-full" asChild>
                {/* Link to a future Kos detail page: /kos/[kosId] */}
                <Link href={`/kos/${kos.id}`}>View Details & Apply</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}