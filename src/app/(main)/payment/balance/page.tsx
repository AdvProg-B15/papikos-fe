"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/authStore";
import { getMyBalance, topUpBalance } from "@/services/paymentService";
import { Balance, Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast as sonnerToast } from "sonner";
import { AlertTriangle, Wallet, DollarSign, PlusCircle, History } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

const topUpSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }).min(10000, { message: "Minimum top-up is IDR 10,000."}),
});
type TopUpFormValues = z.infer<typeof topUpSchema>;

export default function MyBalancePage() {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);

  const form = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      amount: 50000, // Default top-up amount
    },
  });

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMyBalance();
      if (response.status === 200 && response.data) {
        setBalanceData(response.data);
      } else {
        setError(response.message || "Failed to fetch balance.");
        sonnerToast.error(response.message || "Failed to fetch balance.");
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
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const handleTopUpSubmit = async (data: TopUpFormValues) => {
    try {
      const response = await topUpBalance({ amount: data.amount });
      if (response.status === 200 && response.data) {
        sonnerToast.success(`Successfully topped up IDR ${data.amount.toLocaleString()}. Transaction ID: ${response.data.transactionId}`);
        setIsTopUpDialogOpen(false);
        fetchBalance(); // Refresh balance after top-up
        form.reset();
      } else {
        sonnerToast.error(response.message || "Top-up failed.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred during top-up.";
      sonnerToast.error(errorMessage);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading your balance...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-xl">Error: {error}</p>
        <Button onClick={fetchBalance} className="mt-4">Try Again</Button>
      </div>
    );
  }
  
  if (!balanceData) {
    return <div className="text-center py-10">Could not load balance information.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Wallet</h1>
        <div className="flex gap-2">
            <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-5 w-5" /> Top Up Balance
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle>Top Up Balance</DialogTitle>
                <DialogDescription>
                    Enter the amount you wish to add to your wallet.
                </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleTopUpSubmit)} className="space-y-4 pt-4">
                    <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount (IDR)</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input type="number" placeholder="e.g., 50000" {...field} className="pl-10"/>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Processing..." : "Top Up"}
                    </Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
            </Dialog>
            <Button variant="outline" asChild>
                <Link href="/payment/transactions"><History className="mr-2 h-4 w-4" />Transaction History</Link>
            </Button>
        </div>
      </div>

      <Card className="w-full max-w-sm mx-auto sm:mx-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            IDR {balanceData.balance.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {new Date(balanceData.updatedAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}