"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/authStore";
import { getMyKos, deleteKos } from "@/services/kosService";
import { Kos, UpdateKosRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast as sonnerToast } from "sonner";
import { PlusCircle, Edit, Trash2, AlertTriangle, BedDouble, Home, DollarSign, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import KosFormDialog from "@/components/kos/KosFormDialog"; // We'll create this next

export default function MyKosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [myKosList, setMyKosList] = useState<Kos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKos, setSelectedKos] = useState<Kos | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchMyKosData = async () => {
    if (user?.role !== "OWNER") {
      setError("Access denied. Only owners can view this page.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMyKos();
      if (response.status === 200 && response.data) {
        setMyKosList(response.data);
      } else {
        setError(response.message || "Failed to fetch your Kos data.");
        sonnerToast.error(response.message || "Failed to fetch your Kos data.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
      setError(errorMessage);
      sonnerToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyKosData();
  }, [user]);

  if (user && user.role !== "OWNER") {
     // Redirect or show access denied message if not an owner
     // router.push('/'); // Or some other appropriate page
     return <div className="text-center py-10 text-red-500">Access Denied: This page is for Owners only.</div>;
  }


  const handleEdit = (kos: Kos) => {
    setSelectedKos(kos);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedKos(null); // Clear selected Kos for new creation
    setIsFormOpen(true);
  };

  const handleDelete = async (kosId: string) => {
    try {
      await deleteKos(kosId); // Assuming deleteKos handles 204 correctly
      sonnerToast.success("Kos property deleted successfully.");
      setMyKosList(prevList => prevList.filter(k => k.id !== kosId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete Kos property.";
      sonnerToast.error(errorMessage);
    }
  };
  
  const onFormSubmitSuccess = (updatedOrNewKos: Kos) => {
    if (selectedKos) { // Edit
      setMyKosList(prevList => prevList.map(k => k.id === updatedOrNewKos.id ? updatedOrNewKos : k));
    } else { // Create
      setMyKosList(prevList => [updatedOrNewKos, ...prevList]);
    }
    setIsFormOpen(false);
    setSelectedKos(null);
  };


  if (isLoading) {
    return <div className="text-center py-10">Loading your Kos properties...</div>;
  }

  if (error) {
    return (
       <div className="text-center py-10 text-red-500 flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-xl">Error: {error}</p>
        <Button onClick={fetchMyKosData} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Kos Properties</h1>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Kos
        </Button>
      </div>

      {myKosList.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">No Kos properties yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first Kos property.</p>
          <div className="mt-6">
            <Button onClick={handleCreateNew}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Kos
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myKosList.map((kos) => (
            <Card key={kos.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{kos.name}</CardTitle>
                <CardDescription className="flex items-center text-sm">
                   <Home className="w-4 h-4 mr-2" /> {kos.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {kos.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{kos.description}</p>}
                <div className="space-y-1 text-sm">
                    <p className="flex items-center"><BedDouble className="w-4 h-4 mr-2" /> Rooms: {kos.numRooms} (Occupied: {kos.occupiedRooms})</p>
                    <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Price: IDR {kos.monthlyRentPrice.toLocaleString()}/month</p>
                    <p className={`flex items-center font-semibold ${kos.isListed ? 'text-green-600' : 'text-red-600'}`}>
                        <Tag className="w-4 h-4 mr-2" /> {kos.isListed ? 'Listed' : 'Not Listed'}
                    </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(kos)}>
                  <Edit className="mr-1 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the Kos property "{kos.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(kos.id)}>
                        Yes, delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <KosFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        kosData={selectedKos}
        onSuccess={onFormSubmitSuccess}
      />
    </div>
  );
}