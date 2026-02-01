"use client";

import { useMutation } from "convex/react";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "#/components/ui/button";
import { SwipeCard } from "./swipe-card";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface ReviewDeckProps {
  takeouts: Doc<"takeouts">[];
  categories: Doc<"categories">[];
  onComplete: () => void;
}

export function ReviewDeck({ takeouts, categories, onComplete }: ReviewDeckProps) {
  const [swipedCards, setSwipedCards] = useState<string[]>([]);

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

  const remainingTakeouts = takeouts.filter((t: Doc<"takeouts">) => !swipedCards.includes(t._id));

  const handleSwipe = async (direction: "left" | "right", takeoutId: string) => {
    setSwipedCards((prev) => [...prev, takeoutId]);

    // Move to appropriate category
    const targetCategory = direction === "right" ? doneCategory : laterCategory;
    if (targetCategory) {
      await moveTakeout({
        id: takeoutId as Id<"takeouts">,
        categoryId: targetCategory._id,
      });
    }

    // Check if done
    if (remainingTakeouts.length <= 1) {
      setTimeout(onComplete, 500);
    }
  };

  const outOfCards = remainingTakeouts.length === 0;

  if (takeouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">Nothing to review.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add some takeouts first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Card Stack */}
      <div className="relative h-80 w-80 sm:w-96">
        {remainingTakeouts.map((takeout: Doc<"takeouts">) => (
          <SwipeCard
            key={takeout._id}
            takeout={takeout}
            onSwipe={(dir) => handleSwipe(dir, takeout._id)}
          />
        ))}

        {outOfCards && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-lg font-medium">All done.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              That wasn't so hard, was it?
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!outOfCards && (
        <div className="mt-8 flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            <span>Later</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Done</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
}
