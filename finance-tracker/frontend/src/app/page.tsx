"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import TransactionParser from "@/components/transaction-parser";
import TransactionsTable from "@/components/transactions-table";

export default function Home() {
  const { data: session } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance Tracker</h1>
            {session?.user && (
              <p className="text-sm text-gray-600">
                Welcome, {session.user.name || session.user.email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {session?.organizationName && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{session.organizationName}</span>
              </div>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <TransactionParser onSuccess={handleSuccess} />
          <TransactionsTable refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  );
}
