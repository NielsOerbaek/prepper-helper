"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// 8x8 grid defining the "P" shape (1 = primary/P, 0 = secondary/background)
const P_GRID = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

interface AnimatedLogoProps {
  size?: number;
  className?: string;
  animationDuration?: number; // Total duration for materialize in ms
  shimmerInterval?: number; // Interval between shimmers in ms
}

export function AnimatedLogo({
  size = 400,
  className,
  animationDuration = 3000,
  shimmerInterval = 10000,
}: AnimatedLogoProps) {
  const [visibleCells, setVisibleCells] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [shimmerActive, setShimmerActive] = useState(false);

  // Get all cell positions
  const allCells = useMemo(() => {
    const cells: { row: number; col: number; key: string; isPrimary: boolean }[] = [];
    P_GRID.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        cells.push({
          row: rowIndex,
          col: colIndex,
          key: `${rowIndex}-${colIndex}`,
          isPrimary: cell === 1
        });
      });
    });
    return cells;
  }, []);

  // Shuffle array helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Random materialize animation
  useEffect(() => {
    const shuffledCells = shuffleArray(allCells);
    const delayPerCell = animationDuration / shuffledCells.length;

    shuffledCells.forEach((cell, index) => {
      setTimeout(() => {
        setVisibleCells((prev) => new Set([...prev, cell.key]));
        if (index === shuffledCells.length - 1) {
          setTimeout(() => setIsComplete(true), 300);
        }
      }, index * delayPerCell);
    });

    return () => {
      setVisibleCells(new Set());
      setIsComplete(false);
    };
  }, [allCells, animationDuration]);

  // Shimmer effect after complete
  useEffect(() => {
    if (!isComplete) return;

    // Initial shimmer after a short delay
    const initialTimeout = setTimeout(() => {
      setShimmerActive(true);
      setTimeout(() => setShimmerActive(false), 800);
    }, 500);

    // Repeating shimmer
    const interval = setInterval(() => {
      setShimmerActive(true);
      setTimeout(() => setShimmerActive(false), 800);
    }, shimmerInterval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isComplete, shimmerInterval]);

  const cellSize = size / 8;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      {/* Grid container */}
      <div
        className="grid grid-cols-8 grid-rows-8 relative"
        style={{ width: size, height: size }}
      >
        {P_GRID.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const isVisible = visibleCells.has(key);
            const isPrimary = cell === 1;

            return (
              <div
                key={key}
                className={cn(
                  "transition-all duration-300",
                  isVisible
                    ? isPrimary
                      ? "bg-primary scale-100 opacity-100"
                      : "bg-secondary scale-100 opacity-100"
                    : "bg-transparent scale-50 opacity-0"
                )}
                style={{
                  width: cellSize,
                  height: cellSize,
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />
            );
          })
        )}
      </div>

      {/* Shimmer overlay */}
      {isComplete && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm"
          style={{ width: size, height: size }}
        >
          <div
            className={cn(
              "absolute inset-0 -translate-x-full transition-transform duration-700 ease-in-out",
              shimmerActive && "translate-x-full"
            )}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 80%, transparent 100%)",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      )}
    </div>
  );
}
