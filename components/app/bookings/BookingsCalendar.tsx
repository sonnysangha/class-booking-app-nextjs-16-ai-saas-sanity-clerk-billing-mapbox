"use client";

import { useState } from "react";
import { format, startOfToday, isPast } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types";

type Booking = USER_BOOKINGS_QUERYResult[number];

interface BookingsCalendarProps {
  bookings: USER_BOOKINGS_QUERYResult;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

/**
 * Month calendar component with booking indicators.
 * Highlights days that have bookings with colored dots.
 */
export function BookingsCalendar({
  bookings,
  onDateSelect,
  selectedDate,
}: BookingsCalendarProps) {
  const [month, setMonth] = useState<Date>(startOfToday());

  // Get dates that have bookings (exclude cancelled and past)
  const bookingDates = bookings.reduce(
    (acc, booking) => {
      if (!booking.classSession?.startTime) return acc;
      if (booking.status === "cancelled") return acc;

      const classTime = new Date(booking.classSession.startTime);
      if (isPast(classTime)) return acc;

      const dateKey = format(classTime, "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(booking);
      return acc;
    },
    {} as Record<string, Booking[]>
  );

  // Check if a date has bookings
  const hasBookings = (date: Date): boolean => {
    const dateKey = format(date, "yyyy-MM-dd");
    return !!bookingDates[dateKey];
  };

  // Get booking count for a date
  const getBookingCount = (date: Date): number => {
    const dateKey = format(date, "yyyy-MM-dd");
    return bookingDates[dateKey]?.length || 0;
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect(date)}
        month={month}
        onMonthChange={setMonth}
        className="w-full [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(12)]"
        classNames={{
          // Override default today styling on cell - we handle it in DayButton
          today: "",
        }}
        modifiers={{
          hasBooking: (date) => hasBookings(date),
        }}
        modifiersClassNames={{
          hasBooking: "has-booking",
        }}
        components={{
          DayButton: ({ day, modifiers, className: _className, ...props }) => {
            const bookingCount = getBookingCount(day.date);
            const isSelected = modifiers.selected === true;
            const isToday = modifiers.today === true;

            return (
              <button
                type="button"
                {...props}
                className={cn(
                  "relative flex size-(--cell-size) flex-col items-center justify-center rounded-lg text-sm font-medium transition-all hover:bg-accent",
                  isToday &&
                    !isSelected &&
                    "bg-accent font-bold text-accent-foreground",
                  modifiers.outside && "text-muted-foreground opacity-50",
                  isSelected &&
                    "bg-violet-600! text-white! ring-2 ring-violet-600 ring-offset-2 hover:bg-violet-700!"
                )}
              >
                <span>{day.date.getDate()}</span>
                {bookingCount > 0 && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {Array.from({
                      length: Math.min(bookingCount, 3),
                    }).map((_, i) => (
                      <div
                        key={`dot-${day.date.getTime()}-${i}`}
                        className={cn(
                          "size-1 rounded-full",
                          isSelected ? "bg-white" : "bg-violet-500"
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          },
        }}
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-violet-600 ring-2 ring-violet-600 ring-offset-1" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-violet-500" />
          <span>Has bookings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-accent" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

