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
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border hover:border-primary/50 hover:bg-accent"
            )}
          >
            <span
              className={cn(
                "text-2xl font-bold",
                isSelected ? "text-primary" : "text-foreground"
              )}
            >
              {option.label}
            </span>
            <span
              className={cn(
                "mt-1 text-xs",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}
            >
              {option.description}
            </span>
            {isSelected && (
              <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg">
                <CheckIcon
                  className="h-3.5 w-3.5 text-primary-foreground"
                  strokeWidth={3}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export { RADIUS_OPTIONS };

