"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/authStore";
import { getMyRentalsAsOwner, approveRental, rejectRental, cancelRental } from "@/services/rentalService";
import { Rental, RentalStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast as sonnerToast } from "sonner";
import { AlertTriangle, Building, CheckCircle, XCircle, Info, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatApiDate } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";


export default function OwnerRentalsPage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOwnerRentals = async () => {
    if (user?.role !== "OWNER") {
      setError("Access Denied. Owner only."); setIsLoading(false); return;
    }
    try {
      setIsLoading(true); setError(null);
      const response = await getMyRentalsAsOwner();
      if (response.status === 200 && response.data) {
        setRentals(response.data.sort((a,b) => new Date(formatApiDate(b.createdAt)).getTime() - new Date(formatApiDate(a.createdAt)).getTime() ));
      } else {
        setError(response.message || "Failed to fetch rentals.");
        sonnerToast.error(response.message || "Failed to fetch rentals.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Unexpected error.";
      setError(msg); sonnerToast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (user) fetchOwnerRentals(); }, [user]);

  const handleRentalAction = async (rentalId: string, action: 'approve' | 'reject' | 'cancel') => {
    try {
      let response;
      if (action === 'approve') response = await approveRental(rentalId);
      else if (action === 'reject') response = await rejectRental(rentalId);
      else if (action === 'cancel') response = await cancelRental(rentalId);
      else return;

      if (response.status === 200 && response.data) {
        sonnerToast.success(`Rental ${action}ed successfully.`);
        setRentals(prev => prev.map(r => r.rentalId === rentalId ? response.data : r));
      } else {
        sonnerToast.error(response.message || `Failed to ${action} rental.`);
      }
    } catch (err: any) {
      sonnerToast.error(err.response?.data?.message || `Error ${action}ing rental.`);
    }
  };

  const getStatusBadge = (status: string) => {
    // (Same as in MyRentalsTenantPage)
    switch (status) {
        case RentalStatus.PENDING_APPROVAL: return <Badge variant="outline">Pending Approval</Badge>;
        case RentalStatus.APPROVED: return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Approved (Awaiting Payment)</Badge>;
        case RentalStatus.ACTIVE: return <Badge variant="default">Active</Badge>;
        case RentalStatus.REJECTED: return <Badge variant="destructive">Rejected</Badge>;
        case RentalStatus.CANCELLED_BY_TENANT:
        case RentalStatus.CANCELLED_BY_OWNER: return <Badge variant="secondary">Cancelled</Badge>;
        case RentalStatus.COMPLETED: return <Badge variant="default">Completed</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
  }

  if (isLoading) return <div className="text-center py-10">Loading rental applications for your properties...</div>;
  if (error) return <div className="text-center py-10 text-red-500"><AlertTriangle className="inline-block mr-2"/>{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Rental Applications</h1>
      {rentals.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium">No rental applications found for your properties.</h3>
          <p className="mt-1 text-sm text-gray-400">When tenants apply, their applications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rentals.map((rental) => (
            <Card key={rental.rentalId}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{rental.kosName}</CardTitle>
                        <CardDescription>Tenant: {rental.submittedTenantName} ({rental.submittedTenantPhone})</CardDescription>
                        <CardDescription>Applied on: {formatApiDate(rental.createdAt)}</CardDescription>
                    </div>
                    {getStatusBadge(rental.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong className="font-medium">Desired Start:</strong> {formatApiDate(rental.rentalStartDate)}</p>
                <p><strong className="font-medium">Duration:</strong> {rental.rentalDurationMonths} months</p>
                 {(rental.status === RentalStatus.ACTIVE || rental.status === RentalStatus.APPROVED) && rental.tenantUserId && (
                    <Button variant="outline" size="sm" asChild className="mt-2">
                        <Link href={`/chat/${rental.tenantUserId}`}> {/* Assuming chat rooms are by user ID */}
                            <MessageSquare className="mr-2 h-4 w-4"/> Chat with Tenant
                        </Link>
                    </Button>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 justify-end">
                {rental.status === RentalStatus.PENDING_APPROVAL && (
                  <>
                    <Button variant="default" size="sm" onClick={() => handleRentalAction(rental.rentalId, 'approve')} className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-4 w-4"/>Approve</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleRentalAction(rental.rentalId, 'reject')}><XCircle className="mr-1 h-4 w-4"/>Reject</Button>
                  </>
                )}
                {(rental.status === RentalStatus.APPROVED || rental.status === RentalStatus.ACTIVE) && (
                     <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" size="sm"><XCircle className="mr-1 h-4 w-4"/>Cancel Rental</Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Cancel this Rental?</AlertDialogTitle><AlertDialogDescription>This action may have consequences and should be communicated with the tenant.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Keep</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleRentalAction(rental.rentalId, 'cancel')}>Yes, Cancel Rental</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                )}
                <Button variant="ghost" size="sm" asChild><Link href={`/rentals/${rental.rentalId}`}><Info className="mr-1 h-4 w-4"/>View Details</Link></Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}