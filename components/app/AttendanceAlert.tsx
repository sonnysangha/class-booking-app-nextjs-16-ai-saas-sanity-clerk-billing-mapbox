"use client";

import { format, addHours, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { AlertCircleIcon, ClockIcon, PlayCircleIcon } from "lucide-react";
import { BookingActions } from "./BookingActions";

interface ClassSession {
  _id: string;
  startTime: string;
  activity: {
    name: string;
    duration: number;
    image?: { asset: { _ref: string } };
  };
  venue: {
    name: string;
  };
}

interface Booking {
  _id: string;
  status: string;
  classSession: ClassSession;
}

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
        const classStart = new Date(booking.classSession.startTime);
        const duration = booking.classSession.activity?.duration || 60;
        const classEnd = addHours(classStart, duration / 60);
        const attendanceWindowEnd = addHours(classEnd, 1); // 1 hour after class ends
        const isInProgress = now < classEnd;

        // Get relative time until window ends
        const timeLeft = formatDistanceToNow(attendanceWindowEnd, {
          addSuffix: false,
        });

        return (
          <div
            key={booking._id}
            className="rounded-lg border-2 border-amber-500 bg-amber-50 p-5 dark:border-amber-600 dark:bg-amber-950"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-full bg-amber-100 p-2.5 dark:bg-amber-900">
                {isInProgress ? (
                  <PlayCircleIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                ) : (
                  <AlertCircleIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Main Heading */}
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  {isInProgress
                    ? "Class Currently in Progress"
                    : "Action Required"}
                </h2>

                {/* Subheading */}
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-amber-800 dark:text-amber-200">
                    {isInProgress
                      ? "Confirm your attendance after the class"
                      : "Confirm your attendance now"}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                    <ClockIcon className="mr-1.5 h-3 w-3" />
                    {timeLeft} left • Ends{" "}
                    {format(attendanceWindowEnd, "h:mm a")}
                  </span>
                </div>

                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  {isInProgress
                    ? "You can confirm attendance now or up to 1 hour after the class ends."
                    : "Did you attend this class? Confirm now before the window closes or it will be marked as a no-show."}
                </p>

                <div className="mt-4 flex items-center justify-between gap-6 rounded-xl bg-white/50 p-4 dark:bg-black/20">
                  {/* Class info */}
                  <Link
                    href={`/classes/${booking.classSession._id}`}
                    className="flex items-center gap-4 transition-opacity hover:opacity-80"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm">
                      {booking.classSession.activity?.image ? (
                        <Image
                          src={urlFor(booking.classSession.activity.image)
                            .width(64)
                            .height(64)
                            .url()}
                          alt={booking.classSession.activity.name}
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
                      <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                        {booking.classSession.activity?.name}
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {booking.classSession.venue?.name} •{" "}
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
          </div>
        );
      })}
    </div>
  );
}
