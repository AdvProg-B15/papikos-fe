"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  getPropertyById,
  createProperty,
  updateProperty,
} from "@/services/property-service";
import { ImageUpload } from "./image-upload";
import type {
  PropertyDto,
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from "@/types/property";
import { toast } from "sonner";

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  description: z.string().optional(),
  numRooms: z.coerce
    .number()
    .int()
    .positive("Number of rooms must be positive"),
  monthlyRentPrice: z.coerce.number().positive("Price must be positive"),
  isListed: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface PropertyFormProps {
  propertyId?: number;
  isEdit?: boolean;
}

export default function PropertyForm({
  propertyId,
  isEdit = false,
}: PropertyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyDto | null>(null);

  // For image handling
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      numRooms: 1,
      monthlyRentPrice: 1000000,
      isListed: true,
    },
  });

  // Fetch property data if in edit mode
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!isEdit || !propertyId) return;

      setIsFetching(true);
      setError(null);

      try {
        const data = await getPropertyById(propertyId);
        setProperty(data);

        // Set form values
        form.reset({
          name: data.name,
          address: data.address,
          description: data.description || "",
          numRooms: data.numRooms,
          monthlyRentPrice: data.monthlyRentPrice,
          isListed: data.isListed,
        });
      } catch (err) {
        console.error("Error fetching property:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch property details"
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchPropertyData();
  }, [isEdit, propertyId, form]);

  const handleImagesChange = (
    newImagesArray: File[],
    removedUrls: string[]
  ) => {
    setNewImages(newImagesArray);
    setRemovedImageUrls(removedUrls);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEdit && propertyId) {
        // Update existing property
        const updateData: UpdatePropertyRequest = {
          ...values,
          newImages: newImages.length > 0 ? newImages : undefined,
          removedImageUrls:
            removedImageUrls.length > 0 ? removedImageUrls : undefined,
        };

        await updateProperty(propertyId, updateData);
        toast("Property updated", {
          description: "Your property has been successfully updated",
        });
      } else {
        // Create new property
        const createData: CreatePropertyRequest = {
          ...values,
          images: newImages.length > 0 ? newImages : undefined,
        };

        await createProperty(createData);
        toast("Property created", {
          description: "Your property has been successfully created",
        });
      }

      // Redirect to the owner properties page
      router.push("/my-properties");
    } catch (err) {
      console.error("Error saving property:", err);
      setError(err instanceof Error ? err.message : "Failed to save property");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2">Loading property data...</span>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Property" : "Add New Property"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update your property information and listing status"
            : "Fill in the details to create a new property listing"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter property name" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your property listing
                  </FormDescription>
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
                  <FormControl>
                    <Textarea placeholder="Enter full address" {...field} />
                  </FormControl>
                  <FormDescription>
                    The complete address of your property
                  </FormDescription>
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
                  <FormControl>
                    <Textarea placeholder="Describe your property" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide details about amenities, surroundings, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="numRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Rooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      How many rooms are available
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthlyRentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent Price (IDR)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="10000" {...field} />
                    </FormControl>
                    <FormDescription>
                      The monthly rental price in Indonesian Rupiah
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEdit && (
              <FormField
                control={form.control}
                name="isListed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Listing Status
                      </FormLabel>
                      <FormDescription>
                        Toggle to show or hide your property in search results
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-3">
              <Label>Property Images</Label>
              <ImageUpload
                existingImages={property?.imageUrls || []}
                onImagesChange={handleImagesChange}
                maxImages={5}
              />
              <FormDescription>
                Upload up to 5 images of your property. The first image will be
                used as the thumbnail.
              </FormDescription>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/my-properties")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEdit ? "Update Property" : "Create Property"}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
