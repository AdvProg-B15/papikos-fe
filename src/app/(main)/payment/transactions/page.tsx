// src/app/(main)/payment/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/authStore";
import { getTransactionHistory } from "@/services/paymentService";
import { Transaction, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { toast as sonnerToast } from "sonner";
import { AlertTriangle, ArrowUpDown, ArrowLeft, ArrowRight, History, DollarSign, Download } from "lucide-react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";


export default function TransactionHistoryPage() {
  const { user } = useAuth();
  const [transactionsData, setTransactionsData] = useState<PaginatedResponse<Transaction> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Or load from user preference/default

  const fetchTransactions = async (page: number, size: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getTransactionHistory(page, size);
      if (response.status === 200 && response.data) {
        setTransactionsData(response.data);
      } else {
        setError(response.message || "Failed to fetch transaction history.");
        sonnerToast.error(response.message || "Failed to fetch transaction history.");
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
      fetchTransactions(currentPage, pageSize);
    }
  }, [user, currentPage, pageSize]);

  const handleNextPage = () => {
    if (transactionsData && !transactionsData.last) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (transactionsData && !transactionsData.first) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case "TOPUP": return <Badge variant="default">Top Up</Badge>;
      case "PAYMENT": return <Badge variant="default">Payment</Badge>;
      case "REFUND": return <Badge variant="default">Refund</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };
  
  const getTransactionStatusBadge = (status: string) => {
     switch (status.toUpperCase()) {
      case "COMPLETED": return <Badge variant="default">Completed</Badge>;
      case "PENDING": return <Badge variant="outline">Pending</Badge>;
      case "FAILED": return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  }


  if (isLoading) {
    return <div className="text-center py-10">Loading transaction history...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-xl">Error: {error}</p>
        <Button onClick={() => fetchTransactions(currentPage, pageSize)} className="mt-4">Try Again</Button>
      </div>
    );
  }
  
  if (!transactionsData || transactionsData.content.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Transaction History</h1>
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium">No transactions yet</h3>
          <p className="mt-1 text-sm text-gray-400">Your transaction history will appear here.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        {/* Optional: Export button */}
        {/* <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button> */}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount (IDR)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes/Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsData.content.map((tx) => (
              <TableRow key={tx.transactionId}>
                <TableCell>{format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm")}</TableCell>
                <TableCell>{getTransactionTypeBadge(tx.transactionType)}</TableCell>
                <TableCell className={`font-semibold ${tx.transactionType === 'TOPUP' || (tx.payeeUserId === user?.userId && tx.transactionType === 'PAYMENT') ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.transactionType === 'TOPUP' || (tx.payeeUserId === user?.userId && tx.transactionType === 'PAYMENT') ? '+' : '-'}{tx.amount.toLocaleString()}
                </TableCell>
                <TableCell>{getTransactionStatusBadge(tx.status)}</TableCell>
                <TableCell className="max-w-xs truncate">
                    {tx.notes || 
                     (tx.transactionType === 'PAYMENT' && tx.relatedRentalId ? `Rental ID: ${tx.relatedRentalId.substring(0,8)}...` : 'N/A')}
                     {tx.payerUserId && tx.payerUserId !== user?.userId && <div className="text-xs text-muted-foreground">From: {tx.payerUserId.substring(0,8)}...</div>}
                     {tx.payeeUserId && tx.payeeUserId !== user?.userId && <div className="text-xs text-muted-foreground">To: {tx.payeeUserId.substring(0,8)}...</div>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
           {!isLoading && transactionsData.content.length === 0 && (
            <TableCaption>No transactions found for the current period.</TableCaption>
          )}
        </Table>
      </Card>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <span className="text-sm text-muted-foreground">
            Page {transactionsData.pageable.pageNumber + 1} of {transactionsData.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={transactionsData.first || isLoading}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={transactionsData.last || isLoading}
        >
          Next <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}