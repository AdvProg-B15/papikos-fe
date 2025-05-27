"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast as sonnerToast } from "sonner";
import { format as formatDateFns } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker"; // Check path if different
import { Kos, Rental, CreateRentalRequest } from "@/types";
import { createRental } from "@/services/rentalService";
import { useAuth } from "@/store/authStore";

const rentalApplicationSchema = z.object({
  submittedTenantName: z.string().min(3, "Name is required."),
  submittedTenantPhone: z.string().regex(/^\+?[0-9\s-()]{7,20}$/, "Valid phone number is required."),
  rentalStartDate: z.date({ required_error: "Rental start date is required." }),
  rentalDurationMonths: z.coerce.number().int().min(1, "Duration must be at least 1 month.").max(24, "Duration cannot exceed 24 months."),
});

type RentalApplicationFormValues = z.infer<typeof rentalApplicationSchema>;

interface RentalApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kos: Kos; // The Kos property being applied for
  onSuccess: (rental: Rental) => void;
}

export default function RentalApplicationDialog({ isOpen, onClose, kos, onSuccess }: RentalApplicationDialogProps) {
  const { user } = useAuth();

  const form = useForm<RentalApplicationFormValues>({
    resolver: zodResolver(rentalApplicationSchema),
    defaultValues: {
      submittedTenantName: user?.email?.split('@')[0] || "", // Pre-fill if possible
      submittedTenantPhone: "",
      rentalStartDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to one week from now
      rentalDurationMonths: 1,
    },
  });

  useEffect(() => {
    // Pre-fill name if user is available and form is reset
    if (user && isOpen) {
        form.reset({
            ...form.getValues(), // keep other defaults
            submittedTenantName: form.getValues("submittedTenantName") || user.email?.split('@')[0] || "",
        });
    }
  }, [user, isOpen, form]);


  const onSubmit = async (data: RentalApplicationFormValues) => {
    const payload: CreateRentalRequest = {
      kosId: kos.id,
      submittedTenantName: data.submittedTenantName,
      submittedTenantPhone: data.submittedTenantPhone,
      rentalStartDate: formatDateFns(data.rentalStartDate, "yyyy-MM-dd"),
      rentalDurationMonths: data.rentalDurationMonths,
    };

    try {
      const response = await createRental(payload);
      if (response.status === 201 && response.data) {
        sonnerToast.success("Rental application submitted successfully!");
        onSuccess(response.data);
        onClose();
      } else {
        sonnerToast.error(response.message || "Failed to submit rental application.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
      sonnerToast.error(errorMessage);
    }
  };

  if (!kos) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for Rental: {kos.name}</DialogTitle>
          <DialogDescription>
            Fill in your details to apply for this Kos. Address: {kos.address}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="submittedTenantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="submittedTenantPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input placeholder="+62 812 3456 7890" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rentalStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Desired Rental Start Date</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rentalDurationMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rental Duration (Months)</FormLabel>
                  <FormControl><Input type="number" min="1" max="24" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}