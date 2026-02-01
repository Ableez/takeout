"use client";

import { useRef, useState } from "react";
import { ContentRenderer } from "#/components/takeout/content-renderer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "#/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

interface SwipeCardProps {
  takeout: Doc<"takeouts">;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

export function SwipeCard({ takeout, onSwipe, isTop }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    currentX: 0,
  });
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const handleStart = (clientX: number) => {
    if (!isTop) return;
    setDragState({
      isDragging: true,
      startX: clientX,
      currentX: clientX,
    });
  };

  const handleMove = (clientX: number) => {
    if (!dragState.isDragging) return;
    setDragState((prev) => ({
      ...prev,
      currentX: clientX,
    }));
  };

  const handleEnd = () => {
    if (!dragState.isDragging) return;
    
    const diff = dragState.currentX - dragState.startX;
    const threshold = 100;

    if (Math.abs(diff) > threshold) {
      const direction = diff > 0 ? "right" : "left";
      setSwipeDirection(direction);
      setTimeout(() => {
        onSwipe(direction);
      }, 200);
    }

    setDragState({
      isDragging: false,
      startX: 0,
      currentX: 0,
    });
  };

  const offset = dragState.currentX - dragState.startX;
  const rotation = offset * 0.05;
  const opacity = 1 - Math.abs(offset) / 500;

  const getIndicator = () => {
    if (Math.abs(offset) < 50) return null;
    if (offset > 0) {
      return (
        <div className="absolute top-4 left-4 rounded-md border-2 border-green-500 px-3 py-1 text-green-500 font-semibold text-sm rotate-[-12deg]">
          DONE
        </div>
      );
    }
    return (
      <div className="absolute top-4 right-4 rounded-md border-2 border-orange-500 px-3 py-1 text-orange-500 font-semibold text-sm rotate-[12deg]">
        LATER
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute inset-0 rounded-2xl bg-card border border-border shadow-lg",
        "touch-none select-none cursor-grab active:cursor-grabbing",
        "transition-transform",
        dragState.isDragging ? "duration-0" : "duration-300 ease-out",
        swipeDirection === "left" && "animate-swipe-left",
        swipeDirection === "right" && "animate-swipe-right",
        !isTop && "pointer-events-none"
      )}
      style={{
        transform: dragState.isDragging 
          ? `translateX(${offset}px) rotate(${rotation}deg)` 
          : swipeDirection 
            ? undefined 
            : "translateX(0) rotate(0)",
        opacity: dragState.isDragging ? opacity : 1,
        zIndex: isTop ? 10 : 0,
      }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0]?.clientX ?? 0)}
      onTouchMove={(e) => handleMove(e.touches[0]?.clientX ?? 0)}
      onTouchEnd={handleEnd}
    >
      {getIndicator()}
      
      <div className="flex h-full flex-col p-6">
        <div className="flex-1 overflow-auto">
          <div className="text-base leading-relaxed">
            <ContentRenderer content={takeout.content} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
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
    </div>
  );
}
