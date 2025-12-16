"use client";

import { format, addHours, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { AlertCircleIcon, ClockIcon, PlayCircleIcon } from "lucide-react";
import { BookingActions } from "./BookingActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types";

// Booking type from the query result
type Booking = USER_BOOKINGS_QUERYResult[number];

interface AttendanceAlertProps {
  bookings: Booking[];
}

/**
 * Alert banner for bookings that need attendance confirmation.
 * Shows when a class is in progress or within 1 hour post-workout window.
 */
export function AttendanceAlert({ bookings }: AttendanceAlertProps) {
  const now = new Date();

  // Find bookings that need attendance confirmation
  const needsAttendance = bookings.filter((booking) => {
    if (booking.status !== "confirmed") return false;
    if (!booking.classSession?.startTime) return false;

    const classStart = new Date(booking.classSession.startTime);
    const duration = booking.classSession.activity?.duration || 60;
    const classEnd = addHours(classStart, duration / 60);
    const attendanceWindowEnd = addHours(classEnd, 1); // 1 hour after class ends

    // Class has started and attendance window is still open
    return now >= classStart && now <= attendanceWindowEnd;
  });

  if (needsAttendance.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-4">
      {needsAttendance.map((booking) => {
        const { classSession } = booking;
        if (!classSession?.startTime) return null;

        const classStart = new Date(classSession.startTime);
        const duration = classSession.activity?.duration ?? 60;
        const classEnd = addHours(classStart, duration / 60);
        const attendanceWindowEnd = addHours(classEnd, 1); // 1 hour after class ends
        const isInProgress = now < classEnd;

        // Get relative time until window ends
        const timeLeft = formatDistanceToNow(attendanceWindowEnd, {
          addSuffix: false,
        });

        return (
          <Card
            key={booking._id}
            className="border-2 border-primary/50 bg-primary/5 overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-full bg-primary/10 p-2.5">
                  {isInProgress ? (
                    <PlayCircleIcon className="h-6 w-6 text-primary" />
                  ) : (
                    <AlertCircleIcon className="h-6 w-6 text-primary" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Main Heading */}
                  <h2 className="text-lg font-bold">
                    {isInProgress
                      ? "Class Currently in Progress"
                      : "Action Required"}
                  </h2>

                  {/* Subheading */}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-muted-foreground">
                      {isInProgress
                        ? "Confirm your attendance after the class"
                        : "Confirm your attendance now"}
                    </h3>
                    <Badge variant="secondary" className="gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {timeLeft} left • Ends{" "}
                      {format(attendanceWindowEnd, "h:mm a")}
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {isInProgress
                      ? "You can confirm attendance now or up to 1 hour after the class ends."
                      : "Did you attend this class? Confirm now before the window closes or it will be marked as a no-show."}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-6 rounded-xl bg-card p-4 border">
                    {/* Class info */}
                    <Link
                      href={`/classes/${classSession._id}`}
                      className="flex items-center gap-4 transition-opacity hover:opacity-80"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm">
                        {classSession.activity?.image ? (
                          <Image
                            src={urlFor(classSession.activity.image)
                              .width(64)
                              .height(64)
                              .url()}
                            alt={classSession.activity.name ?? "Class"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {classSession.activity?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {classSession.venue?.name} •{" "}
                          {format(classStart, "h:mm a")}
                        </p>
                      </div>
                    </Link>

                    {/* Action buttons */}
                    <div className="flex shrink-0 items-center gap-3">
                      <BookingActions
                        bookingId={booking._id}
                        canConfirmAttendance={true}
                        isPast={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
