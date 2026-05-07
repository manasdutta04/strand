"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface WorkRecord {
  id: string;
  earning_amount_usdc: number;
  delivery_count: number;
  platform: string;
  created_at: string;
}

interface WorkRecordsDisplayProps {
  records: WorkRecord[];
  inrRate?: number;
  isLoading?: boolean;
}

export function WorkRecordsDisplay({ records, inrRate = 83, isLoading }: WorkRecordsDisplayProps) {
  const totalEarnings = records.reduce((sum, r) => sum + r.earning_amount_usdc, 0);
  const totalDeliveries = records.reduce((sum, r) => sum + r.delivery_count, 0);

  const platformBreakdown = records.reduce(
    (acc, r) => {
      const key = r.platform || "unknown";
      return {
        ...acc,
        [key]: (acc[key] || 0) + 1
      };
    },
    {} as Record<string, number>
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${totalEarnings.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
              ₹{Math.round(totalEarnings * inrRate).toLocaleString()} INR
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Total Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalDeliveries.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">{records.length} verified records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{Object.keys(platformBreakdown).length}</div>
            <p className="text-sm text-muted-foreground">
              {Object.entries(platformBreakdown)
                .map(([p, c]) => `${p}: ${c}`)
                .join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Work Records List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Work History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading work records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No work records yet. Upload your first earnings PDF to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Platform</th>
                    <th className="text-right py-3 px-4 font-medium">Earnings</th>
                    <th className="text-center py-3 px-4 font-medium">Deliveries</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">{formatDate(record.created_at)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium capitalize">
                          {record.platform}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${record.earning_amount_usdc.toLocaleString()}
                        <div className="text-xs text-muted-foreground">
                          ₹{Math.round(record.earning_amount_usdc * inrRate).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{record.delivery_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
