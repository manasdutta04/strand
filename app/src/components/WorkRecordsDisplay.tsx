"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${totalEarnings.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">₹{Math.round(totalEarnings * inrRate).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalDeliveries.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">{records.length} records</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{Object.keys(platformBreakdown).length}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(platformBreakdown).map(([platform, count]) => (
                <Badge key={platform} variant="secondary">
                  {platform} {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent work</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Platform</th>
                    <th className="px-4 py-3 text-right font-medium">Earnings</th>
                    <th className="px-4 py-3 text-center font-medium">Trips</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">{formatDate(record.created_at)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {record.platform}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${record.earning_amount_usdc.toLocaleString()}
                        <div className="text-xs text-muted-foreground">₹{Math.round(record.earning_amount_usdc * inrRate).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 text-center">{record.delivery_count}</td>
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
