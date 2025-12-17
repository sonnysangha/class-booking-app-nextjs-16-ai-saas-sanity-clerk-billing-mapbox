"use client";

import { format, addHours, differenceInMinutes } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { urlFor } from "@/sanity/lib/image";
import { CheckCircle2Icon, TimerIcon, ZapIcon } from "lucide-react";
import { BookingActions } from "./BookingActions";
import { Card, CardContent } from "@/components/ui/card";
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types";

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
    const attendanceWindowEnd = addHours(classEnd, 1);

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
        const attendanceWindowEnd = addHours(classEnd, 1);
        const isInProgress = now < classEnd;

        // Calculate progress (from class start to attendance window end)
        const totalWindowMinutes = differenceInMinutes(
          attendanceWindowEnd,
          classStart
        );
        const elapsedMinutes = differenceInMinutes(now, classStart);
        const progressPercent = Math.min(
          100,
          (elapsedMinutes / totalWindowMinutes) * 100
        );

        return (
          <Card
            key={booking._id}
            className="overflow-hidden border border-violet-200 bg-violet-50/50 shadow-sm dark:border-violet-800/30 dark:bg-violet-950/20"
          >
            {/* Progress bar */}
            <div className="h-1 w-full bg-violet-100 dark:bg-violet-900/30">
              <div
                className="h-full bg-violet-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                {/* Status icon */}
                <div className="hidden shrink-0 rounded-2xl bg-violet-100 p-3 text-violet-600 sm:block dark:bg-violet-900/30 dark:text-violet-400">
                  <ZapIcon className="size-7" />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 rounded-xl bg-violet-100 p-2 text-violet-600 sm:hidden dark:bg-violet-900/30 dark:text-violet-400">
                          <ZapIcon className="size-5" />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                          {isInProgress
                            ? "Class in Progress"
                            : "Confirm Attendance"}
                        </h2>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isInProgress
                          ? "Confirm now or up to 1 hour after the class ends"
                          : "Did you attend? Confirm before the window closes"}
                      </p>
                    </div>

                    {/* Countdown timer */}
                    <div className="flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                      <TimerIcon className="size-4" />
                      <TimeAgo
                        date={attendanceWindowEnd}
                        formatter={(
                          value: number,
                          unit: string,
                          suffix: string
                        ) =>
                          suffix === "ago"
                            ? "Expired"
                            : `${value} ${unit}${value !== 1 ? "s" : ""} left`
                        }
                      />
                    </div>
                  </div>

                  {/* Warning notice */}
                  <p className="rounded-lg bg-violet-100/50 px-3 py-2 text-sm text-violet-800 dark:bg-violet-900/20 dark:text-violet-200">
                    <strong>Important:</strong> Unconfirmed bookings are marked
                    as no-shows, which may affect your account standing.
                  </p>

                  {/* Class card */}
                  <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      href={`/classes/${classSession._id}`}
                      className="group flex items-center gap-4"
                    >
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm transition-transform group-hover:scale-105">
                        {classSession.activity?.image ? (
                          <Image
                            src={urlFor(classSession.activity.image)
                              .width(112)
                              .height(112)
                              .url()}
                            alt={classSession.activity.name ?? "Class"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            <CheckCircle2Icon className="size-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                          {classSession.activity?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {classSession.venue?.name} •{" "}
                          {format(classStart, "h:mm a")}
                          {isInProgress && (
                            <span className="ml-1 text-violet-600 dark:text-violet-400">
                              → Ends {format(classEnd, "h:mm a")}
                            </span>
                          )}
                        </p>
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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

