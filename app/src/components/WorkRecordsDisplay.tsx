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
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="font-grotesk text-sm font-medium uppercase tracking-[0.2em] text-[#EFF4FF]/60">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-grotesk text-3xl font-bold tracking-tight text-[#EFF4FF]">${totalEarnings.toLocaleString()}</div>
            <p className="font-mono text-sm text-[#EFF4FF]/75">₹{Math.round(totalEarnings * inrRate).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="font-grotesk text-sm font-medium uppercase tracking-[0.2em] text-[#EFF4FF]/60">Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-grotesk text-3xl font-bold tracking-tight text-[#EFF4FF]">{totalDeliveries.toLocaleString()}</div>
            <p className="font-mono text-sm text-[#EFF4FF]/75">{records.length} records</p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="font-grotesk text-sm font-medium uppercase tracking-[0.2em] text-[#EFF4FF]/60">Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-grotesk text-3xl font-bold tracking-tight text-[#EFF4FF]">{Object.keys(platformBreakdown).length}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(platformBreakdown).map(([platform, count]) => (
                <Badge key={platform} variant="secondary" className="font-grotesk">
                  {platform} {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="font-grotesk text-base text-[#EFF4FF]">Recent work</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <p className="font-mono text-sm text-[#EFF4FF]/75">Loading...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-mono text-sm text-[#EFF4FF]/75">No records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono text-[#EFF4FF]">
                <thead className="border-b border-white/10 text-[#EFF4FF]/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Platform</th>
                    <th className="px-4 py-3 text-right font-medium">Earnings</th>
                    <th className="px-4 py-3 text-center font-medium">Trips</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">{formatDate(record.created_at)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize font-grotesk text-[#EFF4FF] border-white/10">
                          {record.platform}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#6FFF00]">
                        ${record.earning_amount_usdc.toLocaleString()}
                        <div className="text-xs text-[#EFF4FF]/75">₹{Math.round(record.earning_amount_usdc * inrRate).toLocaleString()}</div>
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
