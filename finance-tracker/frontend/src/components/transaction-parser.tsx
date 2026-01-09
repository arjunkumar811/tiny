"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: string;
  date: string;
  confidence: number;
  createdAt: string;
}

interface ExtractResponse {
  success: boolean;
  count: number;
  transactions: Transaction[];
}

export default function TransactionParser({ onSuccess }: { onSuccess: () => void }) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExtractResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-organization-id': session?.organizationId || '',
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to parse transactions");
        setLoading(false);
        return;
      }

      setResult(data);
      setText("");
      setLoading(false);
      onSuccess();
    } catch {
      setError("An error occurred while parsing transactions");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parse Bank Statement</CardTitle>
        <CardDescription>
          Paste your bank statement text below to extract transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
              Successfully parsed {result.count} transaction{result.count !== 1 ? 's' : ''}!
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="statement">Bank Statement Text</Label>
            <Textarea
              id="statement"
              placeholder="01/15/2024 Grocery Store $45.99 debit&#10;01/16/2024 Salary deposit $2500.00 credit"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              disabled={loading}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !text.trim()}>
            {loading ? "Parsing..." : "Parse & Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
