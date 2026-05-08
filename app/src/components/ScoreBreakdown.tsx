"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export interface ScoreComponents {
  delivery_volume: number;
  earnings_consistency: number;
  tenure: number;
  rating_points: number;
  cross_platform: number;
  repayment: number;
}

interface ScoreBreakdownProps {
  components: ScoreComponents;
  totalScore: number;
  inrRate?: number;
}

export function ScoreBreakdown({ components, totalScore, inrRate = 83 }: ScoreBreakdownProps) {
  const maxScore = 1000;
  const creditEligible = totalScore >= 400;
  const creditLimitUsdc = creditEligible ? (totalScore - 400) * 10 : 0;
  const creditLimitInr = Math.round(creditLimitUsdc * inrRate);

  const componentData = [
    { label: "Delivery Volume", value: components.delivery_volume, max: 200, color: "bg-blue-500" },
    { label: "Earnings Consistency", value: components.earnings_consistency, max: 150, color: "bg-green-500" },
    { label: "Tenure", value: components.tenure, max: 150, color: "bg-purple-500" },
    { label: "Rating Points", value: components.rating_points, max: 200, color: "bg-yellow-500" },
    { label: "Cross Platform", value: components.cross_platform, max: 150, color: "bg-pink-500" },
    { label: "Repayment", value: components.repayment, max: 150, color: "bg-indigo-500" }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="font-grotesk text-sm font-medium uppercase tracking-[0.2em] text-[#EFF4FF]/60">
            Score
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
          <div className="flex items-center justify-center">
            <div className="w-32 h-32">
              <svg viewBox="0 0 120 120" className="h-full w-full">
                <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10" />
                <circle
                  cx="60"
                  cy="60"
                  r="55"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${(totalScore / maxScore) * (2 * Math.PI * 55)} ${2 * Math.PI * 55}`}
                  strokeLinecap="round"
                  className="text-[#6FFF00] transition-all"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
                />
                <text x="60" y="65" textAnchor="middle" className="fill-foreground text-sm font-bold">
                  {Math.round((totalScore / maxScore) * 100)}%
                </text>
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-5xl font-bold tracking-tight">{totalScore}</div>
                <p className="text-sm text-muted-foreground">/ {maxScore}</p>
              </div>
              <Badge variant={creditEligible ? "default" : "secondary"}>{creditEligible ? "Credit open" : "Build score"}</Badge>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {creditEligible ? (
                <>
                  <Badge variant="outline">${creditLimitUsdc.toLocaleString()} USDC</Badge>
                  <Badge variant="outline">₹{creditLimitInr.toLocaleString()}</Badge>
                </>
              ) : (
                <Badge variant="secondary">{400 - totalScore} more points needed</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {componentData.map((component) => (
          <Card key={component.label} className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{component.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{component.value}</span>
                <span className="text-xs text-muted-foreground">/ {component.max}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${component.color} transition-all`}
                  style={{ width: `${Math.min((component.value / component.max) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
