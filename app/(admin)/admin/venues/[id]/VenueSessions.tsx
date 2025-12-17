"use client";

import Link from "next/link";
import { useQuery } from "@sanity/sdk-react";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SessionAtVenue {
  _id: string;
  startTime?: string;
  maxCapacity?: number;
  status?: string;
  activityId?: string;
  activityName?: string;
  tierLevel?: string;
}

interface VenueSessionsProps {
  venueId: string;
}

export function VenueSessions({ venueId }: VenueSessionsProps) {
  const { data: sessions, isPending } = useQuery<SessionAtVenue[]>({
    query: `*[_type == "classSession" && venue._ref == $venueId] | order(startTime asc) {
      _id,
      startTime,
      maxCapacity,
      status,
      "activityId": activity._ref,
      "activityName": activity->name,
      "tierLevel": activity->tierLevel
    }`,
    params: { venueId },
  });

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-6 text-center">
        <p className="text-muted-foreground">No sessions at this venue yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sessions are created from the activity detail page
        </p>
      </div>
    );
  }

  // Group sessions by activity
  const sessionsByActivity = sessions.reduce(
    (acc, session) => {
      const activityId = session.activityId || "unknown";
      if (!acc[activityId]) {
        acc[activityId] = {
          activityName: session.activityName || "Unknown Activity",
          activityId,
          tierLevel: session.tierLevel,
          sessions: [],
        };
      }
      acc[activityId].sessions.push(session);
      return acc;
    },
    {} as Record<
      string,
      {
        activityName: string;
        activityId: string;
        tierLevel?: string;
        sessions: SessionAtVenue[];
      }
    >,
  );

  return (
    <div className="space-y-4 -mt-4">
      {Object.values(sessionsByActivity).map((group) => (
        <Link
          key={group.activityId}
          href={`/admin/activities/${group.activityId}`}
        >
          <Card className="group transition-all hover:border-primary hover:shadow-md mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{group.activityName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {group.sessions.length} session
                    {group.sessions.length !== 1 ? "s" : ""} scheduled
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {group.tierLevel && (
                    <Badge variant="secondary">{group.tierLevel}</Badge>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {group.sessions.slice(0, 3).map((session) => {
                  const startDate = session.startTime
                    ? new Date(session.startTime)
                    : null;
                  return (
                    <Badge
                      key={session._id}
                      variant="outline"
                      className="text-xs"
                    >
                      {startDate && (
                        <>
                          <Calendar className="mr-1 h-3 w-3" />
                          {startDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          <Clock className="mx-1 h-3 w-3" />
                          {startDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                    </Badge>
                  );
                })}
                {group.sessions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{group.sessions.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
