"use client";

import { format, isSameDay, isToday, isPast } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";
import {
  BOOKING_STATUS_COLORS,
  getStatusLabel,
  getEffectiveStatus,
} from "@/lib/constants/status";
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types";

type Booking = USER_BOOKINGS_QUERYResult[number];

interface DayBookingsProps {
  bookings: Booking[];
  selectedDate: Date;
}

/**
 * Displays bookings for a selected day.
 * Shows booking cards or an empty state message.
 */
export function DayBookings({ bookings, selectedDate }: DayBookingsProps) {
  // Filter bookings for the selected date (exclude cancelled and past)
  const dayBookings = bookings.filter((booking) => {
    if (booking.status === "cancelled") return false;
    if (!booking.classSession?.startTime) return false;

    const classTime = new Date(booking.classSession.startTime);
    if (!isSameDay(classTime, selectedDate)) return false;
    if (isPast(classTime)) return false;

    return true;
  });

  const isTodaySelected = isToday(selectedDate);

  if (dayBookings.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border bg-card p-6 text-center">
        <CalendarIcon className="mb-3 h-8 w-8 text-muted-foreground/50" />
        <h3 className="mb-1 font-medium">
          {isTodaySelected ? "No bookings today" : "No bookings"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isTodaySelected
            ? "You don't have any classes booked for today"
            : `No classes booked for ${format(selectedDate, "MMMM d")}`}
        </p>
        <Link
          href="/classes"
          className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
        >
          Browse classes →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        {format(selectedDate, "EEEE, MMMM d")} · {dayBookings.length}{" "}
        {dayBookings.length === 1 ? "class" : "classes"}
      </h3>

      <div className="space-y-3">
        {dayBookings.map((booking) => {
          if (!booking.classSession?.startTime) return null;
          const startTime = new Date(booking.classSession.startTime);
          const duration = booking.classSession.activity?.duration || 60;

          // Get effective status (handles no-show, in-progress states)
          const effectiveStatus = getEffectiveStatus(
            booking.status || "confirmed",
            startTime,
            duration
          );

          return (
            <Link
              key={booking._id}
              href={`/classes/${booking.classSession._id}`}
              className="group flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-violet-500/50"
            >
              {/* Image */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {booking.classSession.activity?.image ? (
                  <Image
                    src={urlFor(booking.classSession.activity.image)
                      .width(64)
                      .height(64)
                      .url()}
                    alt={booking.classSession.activity.name || "Class"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No img
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="truncate font-medium group-hover:text-violet-600">
                    {booking.classSession.activity?.name || "Class"}
                  </h4>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[effectiveStatus] || BOOKING_STATUS_COLORS.confirmed}`}
                  >
                    {getStatusLabel(effectiveStatus)}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {format(startTime, "h:mm a")} · {duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {booking.classSession.venue?.name || "Venue"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

