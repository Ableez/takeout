"use client";

import { cn } from "#/lib/utils";

interface ActivityDay {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
  className?: string;
}

const DAYS_TO_SHOW = 180; // 6 months
const WEEKS_TO_SHOW = Math.ceil(DAYS_TO_SHOW / 7);

export function ActivityHeatmap({ data, className }: ActivityHeatmapProps) {
  // Find max count for scaling
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // Get intensity level (0-4) based on count
  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  // Get color class based on intensity
  const getColorClass = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return "bg-[var(--activity-0)]";
      case 1:
        return "bg-[var(--activity-1)]";
      case 2:
        return "bg-[var(--activity-2)]";
      case 3:
        return "bg-[var(--activity-3)]";
      case 4:
        return "bg-[var(--activity-4)]";
      default:
        return "bg-[var(--activity-0)]";
    }
  };

  // Group data by weeks (7 days each)
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Get month labels
  const getMonthLabel = (weekIndex: number): string | null => {
    const dayIndex = weekIndex * 7;
    if (dayIndex >= data.length) return null;
    
    const date = new Date(data[dayIndex].date);
    const prevDate = dayIndex > 0 ? new Date(data[dayIndex - 7]?.date) : null;
    
    // Show month label if it's the first week of the month
    if (!prevDate || date.getMonth() !== prevDate.getMonth()) {
      return date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    }
    
    return null;
  };

  const today = new Date();
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Month labels */}
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => {
          const monthLabel = getMonthLabel(weekIndex);
          return (
            <div key={weekIndex} className="flex-1 min-w-0">
              {monthLabel && (
                <div className="text-[10px] font-semibold text-muted-foreground">
                  {monthLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Activity grid */}
      <div className="grid grid-flow-col auto-cols-fr gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-1">
            {week.map((day, dayIndex) => {
              const date = new Date(day.date);
              const intensity = getIntensity(day.count);
              const isToday = date.toDateString() === today.toDateString();

              return (
                <div
                  key={day.date}
                  className={cn(
                    "aspect-square rounded-md transition-all hover:scale-110 hover:ring-2 hover:ring-primary/50",
                    getColorClass(intensity),
                    isToday && "ring-2 ring-primary"
                  )}
                  title={`${date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}: ${day.count} takeout${day.count !== 1 ? "s" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-2">
        <span className="text-xs text-muted-foreground">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-3 w-3 rounded-sm",
                getColorClass(level)
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  );
}
