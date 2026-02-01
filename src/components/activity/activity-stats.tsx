"use client";

import { Flame, TrendingUp, Calendar, Target } from "lucide-react";
import { cn } from "#/lib/utils";

interface ActivityStatsProps {
  stats: {
    totalTakeouts: number;
    thisWeek: number;
    thisMonth: number;
    streak: number;
  };
  className?: string;
}

export function ActivityStats({ stats, className }: ActivityStatsProps) {
  const statItems = [
    {
      icon: Target,
      label: "Total",
      value: stats.totalTakeouts,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Flame,
      label: "Streak",
      value: `${stats.streak}d`,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-600/10 dark:bg-orange-400/10",
    },
    {
      icon: TrendingUp,
      label: "This Week",
      value: stats.thisWeek,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-600/10 dark:bg-green-400/10",
    },
    {
      icon: Calendar,
      label: "This Month",
      value: stats.thisMonth,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-600/10 dark:bg-blue-400/10",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      {statItems.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border/50 bg-card p-4 shadow-sm"
        >
          <div className={cn("rounded-xl p-2.5", item.bgColor)}>
            <item.icon className={cn("h-5 w-5", item.color)} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
