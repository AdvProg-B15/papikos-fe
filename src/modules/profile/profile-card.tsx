"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserDto } from "@/types/auth";

interface ProfileCardProps {
  user: UserDto;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "TENANT":
        return "Tenant";
      case "OWNER":
        return "Property Owner";
      case "ADMIN":
        return "Administrator";
      default:
        return role;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: "Active", color: "bg-green-100 text-green-800" };
      case "PENDING_APPROVAL":
        return {
          label: "Pending Approval",
          color: "bg-yellow-100 text-yellow-800",
        };
      case "INACTIVE":
        return { label: "Inactive", color: "bg-red-100 text-red-800" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  const statusInfo = getStatusLabel(user.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">My Profile</CardTitle>
        <CardDescription className="text-center">
          View and manage your account information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="mt-1 text-lg">{user.email}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Role</h3>
          <p className="mt-1 text-lg">{getRoleLabel(user.role)}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <div className="mt-1">
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
          {user.status === "PENDING_APPROVAL" && user.role === "OWNER" && (
            <p className="mt-2 text-sm text-yellow-600">
              Your account is pending approval. You&apos;ll be notified once your
              account is approved.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline">Edit Profile</Button>
      </CardFooter>
    </Card>
  );
}
