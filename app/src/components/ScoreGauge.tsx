"use client";

import { useEffect, useMemo, useState } from "react";
import { ScoreBreakdown } from "../lib/score";

interface ScoreGaugeProps {
  score: number;
  breakdown: ScoreBreakdown[];
}

export function ScoreGauge({ score, breakdown }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setAnimatedScore(score);
    });
    return () => cancelAnimationFrame(id);
  }, [score]);

  const normalized = Math.max(0, Math.min(1000, animatedScore));
  const radius = 82;
  const stroke = 13;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const dashOffset = useMemo(() => {
    const progress = normalized / 1000;
    return arcLength * (1 - progress);
  }, [arcLength, normalized]);

  return (
    <div className="panel p-4">
      <div className="flex flex-col items-center gap-2">
        <svg width="220" height="220" viewBox="0 0 220 220" className="overflow-visible">
          <g transform="translate(110,110) rotate(210)">
            <circle
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
            />
            <circle
              r={radius}
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 600ms ease-out" }}
            />
          </g>
          <text
            x="110"
            y="104"
            textAnchor="middle"
            className="fill-foreground text-[2rem] font-semibold"
          >
            {score}
          </text>
          <text x="110" y="130" textAnchor="middle" className="fill-muted-foreground text-sm">
            / 1000
          </text>
        </svg>
      </div>

      <div className="mt-4 space-y-2">
        {breakdown.map((item) => {
          const fillPct = item.max === 0 ? 0 : Math.round((item.value / item.max) * 100);
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground">
                  {item.value}/{item.max}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${fillPct}%`, transition: "width 600ms ease-out" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
