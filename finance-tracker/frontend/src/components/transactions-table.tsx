"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: string;
  date: string;
  confidence?: number;
  category?: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  nextCursor: string | null;
  hasMore: boolean;
}

export default function TransactionsTable({ refreshKey }: { refreshKey: number }) {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchTransactions = async (cursor?: string) => {
    try {
      const url = cursor 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?cursor=${cursor}&limit=20`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?limit=20`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-organization-id': session?.organizationId || '',
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data: TransactionsResponse = await res.json();
      
      if (cursor) {
        setTransactions(prev => [...prev, ...data.transactions]);
      } else {
        setTransactions(data.transactions);
      }
      
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      setError("");
    } catch {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      fetchTransactions();
    }
  }, [session, refreshKey]);

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      setLoadingMore(true);
      fetchTransactions(nextCursor);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Transactions</CardTitle>
          <CardDescription>Loading transactions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Transactions</CardTitle>
        <CardDescription>
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} loaded
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No transactions yet. Parse some bank statements to get started!
          </p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>
                        {tx.category ? (
                          <span className="inline-flex items-center gap-1">
                            {tx.category.icon && <span>{tx.category.icon}</span>}
                            <span>{tx.category.name}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatAmount(tx.amount, tx.type)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-500">
                        {tx.confidence ? `${(tx.confidence * 100).toFixed(0)}%` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
