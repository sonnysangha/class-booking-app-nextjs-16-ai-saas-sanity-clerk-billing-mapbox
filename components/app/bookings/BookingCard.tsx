"use client";

import Link from "next/link";
import Image from "next/image";
import { format, addHours, isPast, isWithinInterval } from "date-fns";
import { urlFor } from "@/sanity/lib/image";
import { BookingActions } from "./BookingActions";
import {
  BOOKING_STATUS_COLORS,
  getStatusLabel,
  getEffectiveStatus,
} from "@/lib/constants/status";
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

type Booking = USER_BOOKINGS_QUERYResult[number];

interface BookingCardProps {
  booking: Booking;
  showActions: boolean;
}

export function BookingCard({ booking, showActions }: BookingCardProps) {
  const startTime = booking.classSession?.startTime;
  if (!startTime) return null;

  const sessionStart = new Date(startTime);
  const duration = booking.classSession?.activity?.duration ?? 60;
  const sessionEnd = addHours(sessionStart, duration / 60);
  const attendanceWindowEnd = addHours(sessionEnd, 1);
  const now = new Date();

  const canConfirmAttendance =
    booking.status === "confirmed" &&
    isWithinInterval(now, { start: sessionStart, end: attendanceWindowEnd });

  const effectiveStatus = getEffectiveStatus(
    booking.status ?? "confirmed",
    sessionStart,
    duration
  );

  const activity = booking.classSession?.activity;
  const venue = booking.classSession?.venue;

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${
        showActions ? "" : "opacity-75"
      }`}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <Link
            href={`/classes/${booking.classSession?._id}`}
            className="flex min-w-0 flex-1 gap-4"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
              {activity?.image ? (
                <Image
                  src={urlFor(activity.image).width(96).height(96).url()}
                  alt={activity.name ?? "Class"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">
                {activity?.name ?? "Unknown Class"}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {venue?.name ?? "Unknown Venue"}
                {venue?.city && ` • ${venue.city}`}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {format(sessionStart, "EEE, MMM d")}
                <span className="mx-1">•</span>
                <Clock className="h-3.5 w-3.5" />
                {format(sessionStart, "h:mm a")}
                <span className="mx-1">•</span>
                {duration} min
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 flex-col items-end justify-center gap-2">
            <Badge
              className={`${BOOKING_STATUS_COLORS[effectiveStatus] ?? BOOKING_STATUS_COLORS.confirmed}`}
            >
              {getStatusLabel(effectiveStatus)}
            </Badge>
            {showActions && (
              <BookingActions
                bookingId={booking._id}
                canConfirmAttendance={canConfirmAttendance}
                isPast={isPast(sessionStart)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

