"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const RADIUS_OPTIONS = [
  { value: 5, label: "5 km", description: "Walking distance" },
  { value: 10, label: "10 km", description: "Short drive" },
  { value: 25, label: "25 km", description: "Medium distance" },
  { value: 50, label: "50 km", description: "Willing to travel" },
] as const;

interface RadiusSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  className?: string;
}

export function RadiusSelector({
  value,
  onChange,
  className,
}: RadiusSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {RADIUS_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all",
              isSelected
                ? "border-violet-500 bg-violet-50 dark:bg-violet-950"
                : "border-border hover:border-violet-300 hover:bg-accent",
            )}
          >
            <span
              className={cn(
                "text-2xl font-bold",
                isSelected
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-foreground",
              )}
            >
              {option.label}
            </span>
            <span
              className={cn(
                "mt-1 text-xs",
                isSelected
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-muted-foreground",
              )}
            >
              {option.description}
            </span>
            {isSelected && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
                <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export { RADIUS_OPTIONS };
