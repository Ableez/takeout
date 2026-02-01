"use client";

import TinderCard from "react-tinder-card";
import { ContentRenderer } from "#/components/takeout/content-renderer";
import { formatDistanceToNow } from "date-fns";
import type { Doc } from "../../../convex/_generated/dataModel";

interface SwipeCardProps {
  takeout: Doc<"takeouts">;
  onSwipe: (direction: "left" | "right") => void;
}

export function SwipeCard({ takeout, onSwipe }: SwipeCardProps) {
  const handleSwipe = (direction: string) => {
    if (direction === "left" || direction === "right") {
      onSwipe(direction);
    }
  };

  return (
    <TinderCard
      onSwipe={handleSwipe}
      preventSwipe={["up", "down"]}
      className="absolute"
    >
        <div className="w-80 rounded-xl border border-border bg-card p-6 shadow-lg sm:w-96">
          <div className="min-h-[200px]">
            <div className="text-base leading-relaxed">
              <ContentRenderer content={takeout.content} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(takeout.createdAt, { addSuffix: true })}
            </span>
            {takeout.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {takeout.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </TinderCard>
  );
}
