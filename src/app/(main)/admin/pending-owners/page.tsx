"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/authStore";
import { getPendingOwners, approveOwner } from "@/services/authService"; // Re-using authService for owner approval
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast as sonnerToast } from "sonner";
import { CheckCircle, AlertTriangle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function PendingOwnersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingOwners, setPendingOwners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingOwners = async () => {
     if (user?.role !== "ADMIN") {
      setError("Access Denied. Admin only.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPendingOwners();
      if (response.status === 200 && response.data) {
        setPendingOwners(response.data);
      } else {
        setError(response.message || "Failed to fetch pending owners.");
        sonnerToast.error(response.message || "Failed to fetch pending owners.");
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
    fetchPendingOwners();
  }, [user]);

  if (user && user.role !== "ADMIN") {
    // router.push('/'); // Or some other appropriate page
    return <div className="text-center py-10 text-red-500">Access Denied: This page is for Admins only.</div>;
  }

  const handleApprove = async (ownerId: string) => {
    if (!ownerId) {
        sonnerToast.error("Owner ID is missing.");
        return;
    }
    try {
      const response = await approveOwner(ownerId);
      if (response.status === 200 && response.data) {
        sonnerToast.success(`Owner ${response.data.email} approved successfully.`);
        // Update local state: change status or refetch
        setPendingOwners(prev => prev.map(o => o.userId === ownerId ? {...o, status: "ACTIVE"} : o).filter(o => o.status !== "ACTIVE"));
        // Or simply refetch:
        // fetchPendingOwners();
      } else {
        sonnerToast.error(response.message || "Failed to approve owner.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred during approval.";
      sonnerToast.error(errorMessage);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading pending owners...</div>;
  }

  if (error) {
     return (
       <div className="text-center py-10 text-red-500 flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-xl">Error: {error}</p>
        <Button onClick={fetchPendingOwners} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pending Owner Approvals</h1>
      {pendingOwners.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">No pending owner approvals</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All owner registrations have been processed.</p>
        </div>
      ) : (
        <Card>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pendingOwners.map((owner) => (
                <TableRow key={owner.userId}>
                    <TableCell className="font-medium truncate max-w-xs">{owner.userId}</TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>{owner.role}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            owner.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            owner.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {owner.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                    {owner.status === "PENDING" && owner.userId && (
                        <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(owner.userId!)} // userId can be null per User type, ensure it's present
                        >
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                    )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </Card>
      )}
    </div>
  );
}