"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { ClassSession } from "@/lib/ai/types";

interface SessionCardWidgetProps {
  session: ClassSession;
  onClose: () => void;
}

export function SessionCardWidget({
  session,
  onClose,
}: SessionCardWidgetProps) {
  const handleClick = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      onClose();
    }
  };

  const startDate = new Date(session.startTime);
  const isFull = session.spotsAvailable <= 0;
  const isLowSpots = session.spotsAvailable > 0 && session.spotsAvailable <= 3;

  const cardContent = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 transition-colors duration-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
              {session.activity.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {session.activity.instructor}
            </span>
          </div>
          {isFull ? (
            <Badge variant="destructive" className="shrink-0 text-xs">
              Full
            </Badge>
          ) : isLowSpots ? (
            <Badge
              variant="secondary"
              className="shrink-0 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >
              {session.spotsAvailable} left
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {session.spotsAvailable} spots
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(startDate, "EEE, MMM d")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(startDate, "h:mm a")}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {session.venue.name}
          </span>
        </div>
      </div>
    </>
  );

  const cardClasses = `group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md ${isFull ? "opacity-60" : ""}`;

  return (
    <Link
      href={`/classes/${session.id}`}
      onClick={handleClick}
      className={cardClasses}
    >
      {cardContent}
    </Link>
  );
}
