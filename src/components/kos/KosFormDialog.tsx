"use client";

import { useEffect } from "react";
import { useForm, Control } from "react-hook-form"; // Import Control
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast as sonnerToast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Kos, CreateKosRequest, UpdateKosRequest } from "@/types";
import { createKos, updateKos } from "@/services/kosService";

// Schema for creating/editing Kos
// This schema should reflect all fields present in the form.
const kosFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  address: z.string().min(5, { message: "Address is required." }),
  description: z.string().optional().or(z.literal('')), // Allow empty string, map to null/undefined for API
  numRooms: z.coerce.number().int().positive({ message: "Number of rooms must be a positive integer." }),
  monthlyRentPrice: z.coerce.number().positive({ message: "Monthly rent price must be positive." }),
  occupiedRooms: z.coerce.number().int().min(0, { message: "Occupied rooms cannot be negative." }), // Not optional in form, default to 0
  isListed: z.boolean().default(true),
}).refine(data => data.numRooms >= data.occupiedRooms, { // Simplified refine, occupiedRooms always a number
    message: "Occupied rooms cannot exceed total number of rooms.",
    path: ["occupiedRooms"],
});

// This is the type for the form's data structure
type KosFormValues = z.infer<typeof kosFormSchema>;

interface KosFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kosData?: Kos | null; // For editing
  onSuccess: (kos: Kos) => void;
}

export default function KosFormDialog({ isOpen, onClose, kosData, onSuccess }: KosFormDialogProps) {
  const form = useForm<KosFormValues>({ // Explicitly use KosFormValues
    resolver: zodResolver(kosFormSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      numRooms: 1,
      monthlyRentPrice: 100000,
      occupiedRooms: 0,
      isListed: true,
    },
  });

  useEffect(() => {
    if (isOpen) { // Only reset form when dialog opens or kosData changes while open
        if (kosData) {
        form.reset({
            name: kosData.name,
            address: kosData.address,
            description: kosData.description || "",
            numRooms: kosData.numRooms,
            monthlyRentPrice: kosData.monthlyRentPrice,
            occupiedRooms: kosData.occupiedRooms,
            isListed: kosData.isListed,
        });
        } else {
        form.reset({
            name: "",
            address: "",
            description: "",
            numRooms: 1,
            monthlyRentPrice: 100000,
            occupiedRooms: 0,
            isListed: true,
        });
        }
    }
  }, [kosData, isOpen, form]); // Added isOpen to deps

  const onSubmit = async (data: KosFormValues) => {
    try {
      let response;
      const commonData = {
        name: data.name,
        address: data.address,
        description: data.description === "" ? null : data.description, // Map empty string to null
        numRooms: data.numRooms,
        monthlyRentPrice: data.monthlyRentPrice,
      };

      if (kosData) { // Editing existing Kos
        const updatePayload: UpdateKosRequest = {
          ...commonData,
          occupiedRooms: data.occupiedRooms,
          isListed: data.isListed,
        };
        response = await updateKos(kosData.id, updatePayload);
        sonnerToast.success(response.message || "Kos property updated successfully!");
      } else { // Creating new Kos
        // CreateKosRequest from spec only has name, address, numRooms, monthlyRentPrice
        // We'll include description if API supports it (made optional in type)
        const createPayload: CreateKosRequest = {
          name: data.name, // required
          address: data.address, // required
          numRooms: data.numRooms, // required
          monthlyRentPrice: data.monthlyRentPrice, // required
          description: data.description === "" ? null : data.description, // optional
        };
        // `isListed` and `occupiedRooms` are NOT part of CreateKosRequest per spec.
        // Backend should handle their defaults on creation.
        response = await createKos(createPayload);
        sonnerToast.success(response.message || "Kos property created successfully!");
      }

      if (response.data) {
        onSuccess(response.data);
        onClose();
      } else {
         sonnerToast.error(response.message || "Operation failed. No data returned.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
      sonnerToast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{kosData ? "Edit Kos Property" : "Add New Kos Property"}</DialogTitle>
          <DialogDescription>
            {kosData ? "Update the details of your Kos property." : "Fill in the details for your new Kos property."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Name Field */}
            <FormField
              control={form.control} // No 'as Control<KosFormValues>' needed usually
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Kos Melati Indah" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Input placeholder="e.g., Jl. Mawar No. 10" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Brief description of the property..." {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* numRooms & occupiedRooms */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Rooms</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="occupiedRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupied Rooms</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* monthlyRentPrice Field */}
             <FormField
                control={form.control}
                name="monthlyRentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent (IDR)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            {/* isListed Field - Only relevant for updates according to strict API spec */}
            {kosData && ( // Conditionally render for edit mode, as it's not in CreateKosRequest
                <FormField
                    control={form.control}
                    name="isListed"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                        <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                        <FormLabel>
                            Make this property publicly listed?
                        </FormLabel>
                        <FormDescription>
                            Uncheck if you want to hide it from public listings temporarily.
                        </FormDescription>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (kosData ? "Saving..." : "Creating...") : (kosData ? "Save Changes" : "Create Kos")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}