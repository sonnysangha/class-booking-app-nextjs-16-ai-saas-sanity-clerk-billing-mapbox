"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { UserBooking } from "@/lib/ai/types";

interface BookingCardWidgetProps {
  booking: UserBooking;
  onClose: () => void;
}

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  attended: {
    label: "Attended",
    icon: CheckCircle2,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  noShow: {
    label: "No Show",
    icon: AlertCircle,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

export function BookingCardWidget({ booking, onClose }: BookingCardWidgetProps) {
  const handleClick = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      onClose();
    }
  };

  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.confirmed;
  const StatusIcon = status.icon;
  const startDate = booking.dateTime ? new Date(booking.dateTime) : null;
  const isPast = startDate && startDate < new Date();

  const cardContent = (
    <>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
          isPast
            ? "bg-muted"
            : "bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50"
        }`}
      >
        <StatusIcon
          className={`h-5 w-5 ${isPast ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span
              className={`block truncate text-sm font-medium transition-colors duration-200 ${
                isPast ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
              }`}
            >
              {booking.class || "Unknown Class"}
            </span>
            {booking.instructor && (
              <span className="text-xs text-muted-foreground">
                {booking.instructor}
              </span>
            )}
          </div>
          <Badge variant="secondary" className={`shrink-0 text-xs ${status.className}`}>
            {status.label}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
          {startDate && (
            <>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(startDate, "EEE, MMM d")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(startDate, "h:mm a")}
              </span>
            </>
          )}
          {booking.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {booking.venue}
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cardClasses = `group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md ${isPast ? "opacity-70" : ""}`;

  return (
    <Link href="/bookings" onClick={handleClick} className={cardClasses}>
      {cardContent}
    </Link>
  );
}

