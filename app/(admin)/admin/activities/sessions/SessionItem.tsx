"use client";

import { Suspense, useState } from "react";
import { useSanityClient } from "@/lib/hooks/useSanityClient";
import {
  Calendar,
  Clock,
  Users,
  Trash2,
  ChevronUp,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SessionEditor } from "./SessionEditor";
import { SESSION_STATUS_COLORS } from "@/lib/constants/status";

export interface SessionData {
  _id: string;
  startTime?: string;
  maxCapacity?: number;
  status?: string;
  venueName?: string;
  venueCity?: string;
  venueId?: string;
}

interface SessionItemProps {
  session: SessionData;
  onDelete: (id: string) => void;
  isPast?: boolean;
}

export function SessionItem({
  session,
  onDelete,
  isPast = false,
}: SessionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const client = useSanityClient();

  const startDate = session.startTime ? new Date(session.startTime) : null;

  // Determine display status - if past and still "scheduled", show as "completed"
  const displayStatus =
    isPast && session.status === "scheduled" ? "completed" : session.status;

  const handleDelete = async () => {
    if (confirm("Delete this session?")) {
      try {
        await client.delete(session._id);
        onDelete(session._id);
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    }
  };

  return (
    <div
      className={`rounded-lg border transition-all ${isExpanded ? "bg-muted/30" : ""} ${isPast ? "opacity-70" : ""}`}
    >
      <div className="flex w-full items-center justify-between p-3">
        <button
          type="button"
          className="flex flex-1 flex-wrap items-center gap-3 text-sm text-left"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {startDate && (
            <>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {startDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {startDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </>
          )}
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {session.maxCapacity || 20}
          </span>
          {session.venueName && (
            <span className="text-muted-foreground">@ {session.venueName}</span>
          )}
          <Badge
            className={
              SESSION_STATUS_COLORS[displayStatus || "scheduled"] || ""
            }
            variant="secondary"
          >
            {displayStatus || "scheduled"}
          </Badge>
        </button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3">
          <Suspense
            fallback={
              <div className="space-y-2 border-t pt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <SessionEditor sessionId={session._id} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
