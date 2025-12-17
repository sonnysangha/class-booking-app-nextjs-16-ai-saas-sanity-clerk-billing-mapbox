"use client";

import Link from "next/link";
import {
  Dumbbell,
  Calendar,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TIER_COLORS } from "@/lib/constants/subscription";
import { isMobileViewport } from "@/lib/utils/is-mobile";

// ============================================================================
// Types (inlined - only used by this component)
// ============================================================================

export interface SearchClass {
  _id: string;
  name: string;
  instructor: string;
  duration: number;
  tierLevel: "basic" | "performance" | "champion";
  category?: { name: string };
}

export interface ClassSession {
  id: string;
  startTime: string;
  spotsAvailable: number;
  activity: {
    name: string;
    instructor: string;
    duration: number;
    tierLevel: string;
  };
  venue: {
    name: string;
    city: string;
  };
}

export interface UserBooking {
  id: string;
  sessionId?: string;
  status: string;
  bookedAt?: string;
  attendedAt?: string;
  class?: string;
  instructor?: string;
  duration?: number;
  dateTime?: string;
  venue?: string;
  city?: string;
}

// ============================================================================
// Status config for bookings
// ============================================================================

const bookingStatusConfig = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  attended: {
    label: "Attended",
    icon: CheckCircle2,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  noShow: {
    label: "No Show",
    icon: AlertCircle,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
} as const;

// ============================================================================
// Discriminated union props
// ============================================================================

type ResultCardProps =
  | { variant: "class"; data: SearchClass; onClose: () => void }
  | { variant: "session"; data: ClassSession; onClose: () => void }
  | { variant: "booking"; data: UserBooking; onClose: () => void };

// ============================================================================
// Component
// ============================================================================

const cardClasses =
  "group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md";

export function ResultCard(props: ResultCardProps) {
  const handleClick = () => {
    if (isMobileViewport()) {
      props.onClose();
    }
  };

  if (props.variant === "class") {
    return <ClassCard data={props.data} onClick={handleClick} />;
  }

  if (props.variant === "session") {
    return <SessionCard data={props.data} onClick={handleClick} />;
  }

  return <BookingCard data={props.data} onClick={handleClick} />;
}

// ============================================================================
// Class Card
// ============================================================================

function ClassCard({
  data,
  onClick,
}: {
  data: SearchClass;
  onClick: () => void;
}) {
  // Link to classes page with search query to show sessions for this activity
  const searchParams = new URLSearchParams({ q: data.name });
  
  return (
    <Link href={`/classes?${searchParams.toString()}`} onClick={onClick} className={cardClasses}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover:bg-primary/20">
        <Dumbbell className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
              {data.name}
            </span>
            {data.category?.name && (
              <span className="text-xs text-muted-foreground">
                {data.category.name}
              </span>
            )}
          </div>
          <Badge
            variant="secondary"
            className={`shrink-0 text-xs ${TIER_COLORS[data.tierLevel]}`}
          >
            {data.tierLevel}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {data.instructor}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {data.duration} min
          </span>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// Session Card
// ============================================================================

function SessionCard({
  data,
  onClick,
}: {
  data: ClassSession;
  onClick: () => void;
}) {
  const startDate = new Date(data.startTime);
  const isFull = data.spotsAvailable <= 0;
  const isLowSpots = data.spotsAvailable > 0 && data.spotsAvailable <= 3;

  return (
    <Link
      href={`/classes/${data.id}`}
      onClick={onClick}
      className={`${cardClasses} ${isFull ? "opacity-60" : ""}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 transition-colors duration-200 group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50">
        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
              {data.activity.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {data.activity.instructor}
            </span>
          </div>
          {isFull ? (
            <Badge variant="destructive" className="shrink-0 text-xs">
              Full
            </Badge>
          ) : isLowSpots ? (
            <Badge
              variant="secondary"
              className="shrink-0 bg-amber-100 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >
              {data.spotsAvailable} left
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {data.spotsAvailable} spots
            </Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(startDate, "EEE, MMM d")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(startDate, "h:mm a")}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {data.venue.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// Booking Card
// ============================================================================

function BookingCard({
  data,
  onClick,
}: {
  data: UserBooking;
  onClick: () => void;
}) {
  const status =
    bookingStatusConfig[data.status as keyof typeof bookingStatusConfig] ||
    bookingStatusConfig.confirmed;
  const StatusIcon = status.icon;
  const startDate = data.dateTime ? new Date(data.dateTime) : null;
  const isPast = startDate && startDate < new Date();
  
  // Link to the session page if we have sessionId, otherwise bookings page
  const href = data.sessionId ? `/classes/${data.sessionId}` : "/bookings";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${cardClasses} ${isPast ? "opacity-70" : ""}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
          isPast
            ? "bg-muted"
            : "bg-emerald-100 group-hover:bg-emerald-200 dark:bg-emerald-900/30 dark:group-hover:bg-emerald-900/50"
        }`}
      >
        <StatusIcon
          className={`h-5 w-5 ${isPast ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span
              className={`block truncate text-sm font-medium transition-colors duration-200 ${
                isPast
                  ? "text-muted-foreground"
                  : "text-foreground group-hover:text-primary"
              }`}
            >
              {data.class || "Unknown Class"}
            </span>
            {data.instructor && (
              <span className="text-xs text-muted-foreground">
                {data.instructor}
              </span>
            )}
          </div>
          <Badge
            variant="secondary"
            className={`shrink-0 text-xs ${status.className}`}
          >
            {status.label}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
          {data.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {data.venue}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

