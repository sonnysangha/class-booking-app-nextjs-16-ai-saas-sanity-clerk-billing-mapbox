import Link from "next/link";
import Image from "next/image";
import { CheckCircleIcon, Clock, MapPin, User } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { format } from "date-fns";
import type { FILTERED_SESSIONS_QUERYResult } from "@/sanity.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TIER_COLORS } from "@/lib/constants/subscription";
import { formatDistance } from "@/lib/utils/distance";

// Session type from the query result (with distance added by client-side filtering)
type Session = FILTERED_SESSIONS_QUERYResult[number];

interface SessionCardProps {
  session: Session;
  isBooked?: boolean;
  distance?: number;
}

export function SessionCard({
  session,
  isBooked = false,
  distance,
}: SessionCardProps) {
  // Guard against missing required data
  const { activity, venue, startTime, maxCapacity } = session;
  if (!activity || !venue || !startTime || !maxCapacity) return null;

  const spotsRemaining = maxCapacity - session.currentBookings;
  const isFullyBooked = spotsRemaining <= 0;
  const startDate = new Date(startTime);
  const tierLevel = activity.tierLevel ?? "basic";

  return (
    <Link href={`/classes/${session._id}`}>
      <Card
        className={`group gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl ${
          isBooked ? "ring-2 ring-primary ring-offset-2" : ""
        }`}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {activity.image ? (
            <Image
              src={urlFor(activity.image).width(400).height(225).url()}
              alt={activity.name ?? "Class"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Tier Badge */}
          <Badge
            className={`absolute left-3 top-3 border-0 ${TIER_COLORS[tierLevel] || TIER_COLORS.basic}`}
          >
            {tierLevel.charAt(0).toUpperCase() + tierLevel.slice(1)}
          </Badge>

          {/* Status Badge */}
          {isBooked ? (
            <Badge className="absolute right-3 top-3 gap-1 border-0 bg-primary text-primary-foreground">
              <CheckCircleIcon className="h-3 w-3" />
              Booked
            </Badge>
          ) : isFullyBooked ? (
            <Badge
              variant="destructive"
              className="absolute right-3 top-3 border-0"
            >
              Fully Booked
            </Badge>
          ) : spotsRemaining <= 3 ? (
            <Badge className="absolute right-3 top-3 border-0 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
              {spotsRemaining} spots left
            </Badge>
          ) : null}

          {/* Distance Badge */}
          {distance !== undefined && (
            <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-md backdrop-blur-sm dark:bg-black/80">
              {formatDistance(distance)}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 !px-4">
          <h3 className="line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
            {activity.name}
          </h3>

          <div className="mt-2 space-y-1.5">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{activity.instructor}</span>
              <span className="mx-1">•</span>
              <Clock className="h-3.5 w-3.5" />
              <span>{activity.duration} min</span>
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">
                {venue.name}
                {venue.city && ` • ${venue.city}`}
              </span>
            </p>
          </div>

          {/* Date/Time */}
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="text-sm font-semibold text-primary">
              {format(startDate, "EEE, MMM d")}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {format(startDate, "h:mm a")}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

