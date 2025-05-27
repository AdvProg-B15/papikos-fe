"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getKosById } from '@/services/kosService'; // Import the actual service
import { Kos, Rental } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BedDouble, DollarSign, Home, Info, Tag, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast as sonnerToast } from 'sonner';
import { useAuth } from '@/store/authStore';
import { useRouter } from 'next/router';
import RentalApplicationDialog from '@/components/rentals/RentalApplicationDialog';

export default function KosDetailPage() {
  const params = useParams();
  const kosId = params.kosId as string;
  const [kos, setKos] = useState<Kos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Already have this
  const [isRentalDialogOpen, setIsRentalDialogOpen] = useState(false);
  const router = useRouter(); // For redirecting

  useEffect(() => {
    if (kosId) {
      const fetchKosDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await getKosById(kosId);
          if (response.status === 200 && response.data) {
            setKos(response.data);
          } else {
            setError(response.message || "Kos property not found.");
            sonnerToast.error(response.message || "Kos property not found.");
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || err.message || "Failed to load Kos details.";
          setError(errorMessage);
          sonnerToast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      fetchKosDetail();
    }
  }, [kosId]);

    const handleRentalApplicationSuccess = (newRental: Rental) => {
    setIsRentalDialogOpen(false);
    // Optionally, redirect to "My Rentals" page or show another message
    sonnerToast.info(`Application for ${newRental.kosName} submitted. Check "My Rentals" for status.`, {
        action: {
            label: 'View My Rentals',
            onClick: () => router.push('/rentals/my'),
        },
    });
  };


  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      Loading Kos details...
    </div>
  );

  if (error) return (
    <div className="text-center py-10 text-red-500 flex flex-col items-center">
      <AlertTriangle className="w-12 h-12 mb-4" />
      <p className="text-xl">Error: {error}</p>
      <Button asChild className="mt-4">
        <Link href="/kos">Back to Listings</Link>
      </Button>
    </div>
  );

  if (!kos) return (
     <div className="text-center py-10 text-gray-500 flex flex-col items-center">
      <Info className="w-12 h-12 mb-4" />
      <p className="text-xl">Kos property not found.</p>
      <Button asChild className="mt-4">
        <Link href="/kos">Back to Listings</Link>
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" asChild className="mb-6 print:hidden">
        <Link href="/kos">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Kos List
        </Link>
      </Button>
      <Card className="overflow-hidden">
        {/* Optional: Image Placeholder */}
        {/* <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500">
          Property Image Placeholder
        </div> */}
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{kos.name}</CardTitle>
          <CardDescription className="text-md text-muted-foreground flex items-center pt-1">
            <Home className="w-5 h-5 mr-2" /> {kos.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {kos.description && (
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-1">Description</h3>
              <p className="text-muted-foreground">{kos.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Property Details</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center"><BedDouble className="w-4 h-4 mr-3 text-primary" /> Total Rooms: {kos.numRooms}</li>
                <li className="flex items-center"><BedDouble className="w-4 h-4 mr-3 text-primary" /> Occupied Rooms: {kos.occupiedRooms}</li>
                <li className="flex items-center"><BedDouble className="w-4 h-4 mr-3 text-primary" /> Available Rooms: {kos.numRooms - kos.occupiedRooms}</li>
                <li className="flex items-center"><DollarSign className="w-4 h-4 mr-3 text-primary" /> Price: IDR {kos.monthlyRentPrice.toLocaleString()} / month</li>
                <li className={`flex items-center font-semibold ${kos.isListed ? 'text-green-600' : 'text-red-600'}`}>
                    <Tag className="w-4 h-4 mr-3" /> {kos.isListed ? 'Available for Listing' : 'Not Currently Listed'}
                </li>
              </ul>
            </div>
            {/* Could add owner info if available/needed */}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/40 px-6 py-4 print:hidden">
          {/* Buttons for "Apply for Rental", "Add to Wishlist", "Chat with Owner" will go here later */}
          {/* Only show if rooms available and listed */}
          {user?.role === 'TENANT' && kos && (kos.numRooms - kos.occupiedRooms > 0 && kos.isListed) ? (
    <Button
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => setIsRentalDialogOpen(true)}
    >
        Apply for Rental
    </Button>
) : user?.role === 'TENANT' && (
    <Button size="lg" className="w-full sm:w-auto" disabled>
        {!(kos.numRooms - kos.occupiedRooms > 0) ? "Fully Occupied" : "Not Listed"}
    </Button>
)}
          {/* Add to wishlist button here, for tenants */}
        </CardFooter>
      </Card>
      {kos && (
    <RentalApplicationDialog
    isOpen={isRentalDialogOpen}
    onClose={() => setIsRentalDialogOpen(false)}
    kos={kos}
    onSuccess={handleRentalApplicationSuccess}
    />
)}
    </div>
  );
}