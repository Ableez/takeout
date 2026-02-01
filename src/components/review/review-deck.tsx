"use client";

import { useMutation } from "convex/react";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SwipeCard } from "./swipe-card";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface ReviewDeckProps {
  takeouts: Doc<"takeouts">[];
  categories: Doc<"categories">[];
  onComplete: () => void;
}

export function ReviewDeck({ takeouts, categories, onComplete }: ReviewDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const moveTakeout = useMutation(api.takeouts.move);

  // Find the "Later" and "Done" categories
  const laterCategory = useMemo(
    () => categories.find((c: Doc<"categories">) => c.name === "Later" || c.order === 0),
    [categories]
  );
  const doneCategory = useMemo(
    () => categories.find((c: Doc<"categories">) => c.name === "Done" || c.order === categories.length - 1),
    [categories]
  );

  const handleSwipe = async (direction: "left" | "right") => {
    const takeout = takeouts[currentIndex];
    if (!takeout) return;

    // Move to appropriate category
    const targetCategory = direction === "right" ? doneCategory : laterCategory;
    if (targetCategory) {
      await moveTakeout({
        id: takeout._id as Id<"takeouts">,
        categoryId: targetCategory._id,
      });
    }

    // Move to next card
    const nextIndex = currentIndex + 1;
    if (nextIndex >= takeouts.length) {
      setTimeout(onComplete, 300);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  if (takeouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in-0">
        <p className="text-sm text-muted-foreground">Nothing to review</p>
      </div>
    );
  }

  const remaining = takeouts.length - currentIndex;
  const isComplete = currentIndex >= takeouts.length;

  return (
    <div className="flex flex-col items-center">
      {/* Card Stack */}
      <div className="relative h-80 w-80 sm:w-96 sm:h-96">
        {isComplete ? (
          <div className="flex h-full flex-col items-center justify-center text-center animate-in fade-in-0 zoom-in-95">
            <p className="text-base font-medium">All done</p>
            <p className="mt-1 text-sm text-muted-foreground">
              That was easy
            </p>
          </div>
        ) : (
          <>
            {/* Show up to 3 cards in stack */}
            {takeouts.slice(currentIndex, currentIndex + 3).map((takeout, index) => (
              <SwipeCard
                key={takeout._id}
                takeout={takeout}
                onSwipe={handleSwipe}
                isTop={index === 0}
              />
            ))}
          </>
        )}
      </div>

      {/* Instructions */}
      {!isComplete && (
        <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-2">
          <div className="flex items-center gap-8 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ChevronLeft className="h-4 w-4" />
              <span>Later</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Done</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 tabular-nums">
            {remaining} remaining
          </p>
        </div>
      )}
    </div>
  );
}
