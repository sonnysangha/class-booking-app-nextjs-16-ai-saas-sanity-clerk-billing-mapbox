"use client";

import { useState } from "react";
import { useQuery } from "@sanity/sdk-react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SessionItem, type SessionData } from "./sessions/SessionItem";
import { CreateSessionDialog } from "./sessions/CreateSessionDialog";

interface ActivitySessionsProps {
  activityId: string;
}

export function ActivitySessions({ activityId }: ActivitySessionsProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: sessions, isPending } = useQuery<SessionData[]>({
    query: `*[_type == "classSession" && activity._ref == $activityId] | order(startTime asc) {
      _id,
      startTime,
      maxCapacity,
      status,
      "venueName": venue->name,
      "venueCity": venue->address.city,
      "venueId": venue._ref
    }`,
    params: { activityId, refreshKey },
  });

  const handleRefresh = () => setRefreshKey((k) => k + 1);
  const handleDelete = () => handleRefresh();

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Split sessions into upcoming and past
  const now = new Date();
  const upcomingSessions =
    sessions?.filter((s) => {
      if (!s.startTime) return true; // No date = show in upcoming
      return new Date(s.startTime) >= now;
    }) || [];
  const pastSessions =
    sessions?.filter((s) => {
      if (!s.startTime) return false;
      return new Date(s.startTime) < now;
    }) || [];

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Sessions ({sessions?.length || 0})
        </Label>
        <CreateSessionDialog
          activityId={activityId}
          onCreated={handleRefresh}
        />
      </div>

      {/* Upcoming Sessions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Upcoming ({upcomingSessions.length})
        </h4>
        {upcomingSessions.length > 0 ? (
          <div className="space-y-2">
            {upcomingSessions.map((session) => (
              <SessionItem
                key={session._id}
                session={session}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No upcoming sessions scheduled
            </p>
          </div>
        )}
      </div>

      {/* Past Sessions - Collapsed by default */}
      {pastSessions.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="past-sessions" className="border-none">
            <AccordionTrigger className="py-2 text-sm font-medium text-muted-foreground hover:no-underline">
              Past Sessions ({pastSessions.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {pastSessions.map((session) => (
                  <SessionItem
                    key={session._id}
                    session={session}
                    onDelete={handleDelete}
                    isPast
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
