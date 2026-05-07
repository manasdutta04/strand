"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
      {/* Main Score Display */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Strand Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold tracking-tight">{totalScore}</div>
              <p className="text-sm text-muted-foreground mt-1">/ {maxScore} max</p>
            </div>
            <div className="w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                {/* Circle background */}
                <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/20" />
                {/* Score arc */}
                <circle
                  cx="60"
                  cy="60"
                  r="55"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${(totalScore / maxScore) * (2 * Math.PI * 55)} ${2 * Math.PI * 55}`}
                  strokeLinecap="round"
                  className="text-primary transition-all"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
                />
                {/* Center text */}
                <text x="60" y="65" textAnchor="middle" className="text-sm font-bold fill-foreground">
                  {Math.round((totalScore / maxScore) * 100)}%
                </text>
              </svg>
            </div>
          </div>

          {/* Credit Eligibility */}
          <div className="pt-4 border-t">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Credit Access</p>
            <div className="mt-3 space-y-2">
              {creditEligible ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Available Credit</span>
                    <span className="text-lg font-bold text-green-600">${creditLimitUsdc.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">in Indian Rupees</span>
                    <span className="text-sm text-muted-foreground">₹{creditLimitInr.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Score must reach 400+ for credit access. You need {400 - totalScore} more points.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Breakdown Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {componentData.map((component) => (
          <Card key={component.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{component.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{component.value}</span>
                <span className="text-xs text-muted-foreground">/ {component.max}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${component.color} transition-all`}
                  style={{ width: `${Math.min((component.value / component.max) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((component.value / component.max) * 100)}% of max
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
