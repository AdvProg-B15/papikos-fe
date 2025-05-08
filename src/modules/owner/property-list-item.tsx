"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PropertyDto } from "@/types/property";

interface PropertyListItemProps {
  property: PropertyDto;
  onDelete: (propertyId: number) => Promise<void>;
}

export function PropertyListItem({
  property,
  onDelete,
}: PropertyListItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(property.propertyId);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative h-48 w-full">
          <Image
            src={
              property.imageUrls?.[0] || `/placeholder.svg?height=192&width=384`
            }
            alt={property.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant={property.isListed ? "default" : "secondary"}
              className="font-medium"
            >
              {property.isListed ? "Listed" : "Not Listed"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-lg font-semibold line-clamp-1">
            {property.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">
            {property.address}
          </p>
          <p className="text-teal-600 font-medium">
            {formatPrice(property.monthlyRentPrice)}/month
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {property.numRooms} room(s) available
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 border-t">
          <div className="w-full flex justify-between items-center">
            <Link href={`/properties/${property.propertyId}`}>
              <Button variant="outline" size="sm" className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
            <div className="flex space-x-2">
              <Link href={`/my-properties/edit/${property.propertyId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this property?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              property and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
