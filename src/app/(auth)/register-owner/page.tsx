"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast as sonnerToast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerOwner } from "@/services/authService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/authStore";
import { useEffect } from "react";


// Schema for owner registration. Assuming email and password are required for now.
// Adjust if backend expectations are different (e.g., only email for initial step).
const registerOwnerSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterOwnerFormValues = z.infer<typeof registerOwnerSchema>;

export default function RegisterOwnerPage() {
  const router = useRouter();
  const { isLoading: authLoading, user: authUser } = useAuth();

  const form = useForm<RegisterOwnerFormValues>({
    resolver: zodResolver(registerOwnerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  const onSubmit = async (data: RegisterOwnerFormValues) => {
    try {
      // If your backend truly expects an empty object for owner registration,
      // you would send {} instead of data.
      // const payload = {}; // If spec's empty requestBody is literal
      const { confirmPassword, ...submitData } = data; // Default: send collected data
      
      const response = await registerOwner(submitData);
      if (response.status === 201 && response.data) {
        sonnerToast.success(response.message || "Owner registration submitted! Your account may require admin approval.");
        // Owners might be set to PENDING status, so redirect to login or a specific info page.
        router.push("/login");
      } else {
        sonnerToast.error(response.message || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Owner registration error:", error);
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
      sonnerToast.error(errorMessage);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && authUser) {
      router.push('/');
    }
  }, [authUser, authLoading, router]);

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (!authLoading && authUser) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Register as Owner</CardTitle>
          <CardDescription className="text-center">
            Create your Papikos owner account. May require admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Registering..." : "Register as Owner"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
          </p>
          <Button variant="link" asChild>
            <Link href="/login">Login</Link>
          </Button>
           <Button variant="link" asChild className="mt-2">
            <Link href="/">Back to Home (Public)</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}