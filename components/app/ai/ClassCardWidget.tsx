"use client";

import Link from "next/link";
import { Dumbbell, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TIER_COLORS } from "@/lib/constants/subscription";
import type { SearchClass } from "@/lib/ai/types";

interface ClassCardWidgetProps {
  classItem: SearchClass;
  onClose: () => void;
}

export function ClassCardWidget({ classItem, onClose }: ClassCardWidgetProps) {
  const handleClick = () => {
    // Only close chat on mobile (< 768px)
    if (window.matchMedia("(max-width: 767px)").matches) {
      onClose();
    }
  };

  const cardContent = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover:bg-primary/20">
        <Dumbbell className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
              {classItem.name}
            </span>
            {classItem.category?.name && (
              <span className="text-xs text-muted-foreground">
                {classItem.category.name}
              </span>
            )}
          </div>
          <Badge
            variant="secondary"
            className={`shrink-0 text-xs ${TIER_COLORS[classItem.tierLevel]}`}
          >
            {classItem.tierLevel}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {classItem.instructor}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {classItem.duration} min
          </span>
        </div>
      </div>
    </>
  );

  const cardClasses =
    "group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md";

  return (
    <Link href="/classes" onClick={handleClick} className={cardClasses}>
      {cardContent}
    </Link>
  );
}
