"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
const kosFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  address: z.string().min(5, { message: "Address is required." }),
  description: z.string().optional(),
  numRooms: z.coerce.number().int().positive({ message: "Number of rooms must be a positive integer." }),
  monthlyRentPrice: z.coerce.number().positive({ message: "Monthly rent price must be positive." }),
  occupiedRooms: z.coerce.number().int().min(0, { message: "Occupied rooms cannot be negative." }).optional(), // Optional on create, required on update
  isListed: z.boolean().default(true),
}).refine(data => data.occupiedRooms === undefined || data.numRooms >= data.occupiedRooms, {
    message: "Occupied rooms cannot exceed total number of rooms.",
    path: ["occupiedRooms"],
});


type KosFormValues = z.infer<typeof kosFormSchema>;

interface KosFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kosData?: Kos | null; // For editing
  onSuccess: (kos: Kos) => void;
}

export default function KosFormDialog({ isOpen, onClose, kosData, onSuccess }: KosFormDialogProps) {
  const form = useForm<KosFormValues>({
    resolver: zodResolver(kosFormSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      numRooms: 1,
      monthlyRentPrice: 0,
      occupiedRooms: 0,
      isListed: true,
    },
  });

  useEffect(() => {
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
      form.reset({ // Default for new Kos
        name: "",
        address: "",
        description: "",
        numRooms: 1,
        monthlyRentPrice: 100000, // Example default
        occupiedRooms: 0,
        isListed: true,
      });
    }
  }, [kosData, form, isOpen]); // re-run when isOpen changes to reset form if it was closed and reopened

  const onSubmit = async (data: KosFormValues) => {
    try {
      let response;
      if (kosData) { // Editing existing Kos
        const updatePayload: UpdateKosRequest = {
          name: data.name,
          address: data.address,
          // description: data.description, // API spec for PATCH doesn't list description explicitly, but it should be updatable
          numRooms: data.numRooms,
          monthlyRentPrice: data.monthlyRentPrice,
          occupiedRooms: data.occupiedRooms,
          // isListed: data.isListed, // API spec for PATCH doesn't list isListed, but it should be updatable
        };
        // Add optional fields only if they differ or are present
        if (data.description !== kosData.description) updatePayload.description = data.description;
        if (data.isListed !== kosData.isListed) updatePayload.isListed = data.isListed;


        response = await updateKos(kosData.id, updatePayload);
        sonnerToast.success(response.message || "Kos property updated successfully!");
      } else { // Creating new Kos
        const createPayload: CreateKosRequest = {
          name: data.name,
          address: data.address,
          // description: data.description, // API spec for POST doesn't list description as required but it's good to have
          numRooms: data.numRooms,
          monthlyRentPrice: data.monthlyRentPrice,
          // isListed: data.isListed, // not in CreateKosRequest, set by backend default likely
        };
        if (data.description) createPayload.description = data.description;
        // For create, occupiedRooms is not in CreateKosRequest, isListed might be backend default

        response = await createKos(createPayload);
        sonnerToast.success(response.message || "Kos property created successfully!");
      }

      if (response.data) {
        onSuccess(response.data);
        onClose(); // Close dialog on success
      } else {
         sonnerToast.error(response.message || "Operation failed. No data returned.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
      sonnerToast.error(errorMessage);
    }
  };
  
  // Need to refine UpdateKosRequest and CreateKosRequest types if description/isListed are part of them.
  // For now, adding them conditionally to the payload.
  // The OpenAPI spec for `PATCH /api/v1/{kosId}` requestBody only explicitly lists:
  // name, address, occupiedRooms, numRooms, monthlyRentPrice.
  // The `POST /api/v1` requestBody only lists: name, address, numRooms, monthlyRentPrice.
  // This implies description and isListed might be handled differently or are missing from request spec.
  // Assuming they *can* be sent for now.

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{kosData ? "Edit Kos Property" : "Add New Kos Property"}</DialogTitle>
          <DialogDescription>
            {kosData ? "Update the details of your Kos property." : "Fill in the details for your new Kos property."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Kos Melati Indah" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Brief description of the property..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                     <FormDescription>Required for updates, defaults to 0 on create.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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