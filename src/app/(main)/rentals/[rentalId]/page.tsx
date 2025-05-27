"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRentalById } from '@/services/rentalService';
import { Rental, RentalStatus } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, User, Phone, Building, DollarSign, CheckCircle, XCircle, Info, Tag, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast as sonnerToast } from 'sonner';
import { formatApiDate } from '@/lib/utils';
import { useAuth } from '@/store/authStore';
import { Badge } from "@/components/ui/badge";


export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const rentalId = params.rentalId as string;
  const [rental, setRental] = useState<Rental | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rentalId) {
      const fetchRentalDetail = async () => {
        setIsLoading(true); setError(null);
        try {
          const response = await getRentalById(rentalId);
          if (response.status === 200 && response.data) {
            // Security check: ensure user is tenant or owner of this rental, or admin
            if (user?.role === 'ADMIN' || response.data.tenantUserId === user?.userId || response.data.ownerUserId === user?.userId) {
                setRental(response.data);
            } else {
                setError("Access Denied. You are not authorized to view this rental.");
                sonnerToast.error("Access Denied.");
            }
          } else {
            setError(response.message || "Rental not found.");
            sonnerToast.error(response.message || "Rental not found.");
          }
        } catch (err: any) {
          setError(err.response?.data?.message || "Failed to load rental details.");
          sonnerToast.error(err.response?.data?.message || "Failed to load rental details.");
        } finally {
          setIsLoading(false);
        }
      };
      if (user) fetchRentalDetail(); // Ensure user is loaded before fetching
      else setIsLoading(false); // If no user, stop loading
    }
  }, [rentalId, user]);

  const getStatusBadge = (status: string) => {
    // (Same as in other rental pages)
     switch (status) {
        case RentalStatus.PENDING_APPROVAL: return <Badge variant="outline">Pending Approval</Badge>;
        case RentalStatus.APPROVED: return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Approved (Payment Due)</Badge>;
        case RentalStatus.ACTIVE: return <Badge variant="default">Active</Badge>;
        case RentalStatus.REJECTED: return <Badge variant="destructive">Rejected</Badge>;
        case RentalStatus.CANCELLED_BY_TENANT:
        case RentalStatus.CANCELLED_BY_OWNER: return <Badge variant="secondary">Cancelled</Badge>;
        case RentalStatus.COMPLETED: return <Badge variant="default">Completed</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading rental details...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!rental) return <div className="text-center py-10">Rental not found or access denied.</div>;

  const canChat = user?.userId && (user.userId === rental.tenantUserId || user.userId === rental.ownerUserId);
  const chatPartnerId = user?.userId === rental.tenantUserId ? rental.ownerUserId : rental.tenantUserId;


  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" asChild className="mb-6" onClick={() => router.back()}>
        <span><ArrowLeft className="mr-2 h-4 w-4" /> Back</span>
      </Button>
      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-3xl">{rental.kosName}</CardTitle>
                {getStatusBadge(rental.status)}
            </div>
          <CardDescription>Rental ID: {rental.rentalId}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">Tenant Information</h3>
                <p className="flex items-center mb-1"><User className="mr-2 h-4 w-4 text-muted-foreground"/> Name: {rental.submittedTenantName}</p>
                <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground"/> Phone: {rental.submittedTenantPhone}</p>
                {user?.role === "OWNER" && rental.tenantUserId && <p className="text-xs text-muted-foreground mt-1">Tenant User ID: {rental.tenantUserId}</p>}
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-2">Rental Period</h3>
                <p className="flex items-center mb-1"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground"/> Start Date: {formatApiDate(rental.rentalStartDate)}</p>
                <p className="flex items-center mb-1"><Tag className="mr-2 h-4 w-4 text-muted-foreground"/> Duration: {rental.rentalDurationMonths} months</p>
                <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground"/> End Date: {formatApiDate(rental.rentalEndDate)}</p>
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-2">Property Information</h3>
                <p className="flex items-center mb-1"><Building className="mr-2 h-4 w-4 text-muted-foreground"/> Kos ID: {rental.kosId}</p>
                {user?.role === "TENANT" && rental.ownerUserId && <p className="text-xs text-muted-foreground mt-1">Owner User ID: {rental.ownerUserId}</p>}
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-2">Timestamps</h3>
                <p className="flex items-center mb-1"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground"/> Created: {formatApiDate(rental.createdAt)}</p>
                <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground"/> Last Updated: {formatApiDate(rental.updatedAt)}</p>
            </div>
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/kos/${rental.kosId}`}>View Kos Property</Link>
          </Button>
          {/* Conceptual Chat Button */}
          {canChat && chatPartnerId && (rental.status === RentalStatus.ACTIVE || rental.status === RentalStatus.APPROVED) && (
             <Button variant="default" asChild>
                <Link href={`/chat/${chatPartnerId}`}> {/* Or a room ID if different logic */}
                    <MessageSquare className="mr-2 h-4 w-4"/> Chat with {user?.userId === rental.tenantUserId ? "Owner" : "Tenant"}
                </Link>
             </Button>
          )}
          {/* Add other actions like "Pay Now" if status is APPROVED and user is tenant */}
        </CardFooter>
      </Card>
    </div>
  );
}