import Link from "next/link";
import Image from "next/image";
import { CheckCircleIcon } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { format } from "date-fns";

interface SessionCardProps {
  session: {
    _id: string;
    startTime: string;
    maxCapacity: number;
    currentBookings: number;
    activity: {
      name: string;
      slug: { current: string };
      instructor: string;
      duration: number;
      tierLevel: string;
      image?: {
        asset: {
          _ref: string;
        };
      };
    };
    venue: {
      name: string;
      city?: string;
    };
  };
  isBooked?: boolean;
}

const tierColors: Record<string, string> = {
  basic: "bg-green-100 text-green-800",
  performance: "bg-blue-100 text-blue-800",
  champion: "bg-purple-100 text-purple-800",
};

export function SessionCard({ session, isBooked = false }: SessionCardProps) {
  const spotsRemaining = session.maxCapacity - session.currentBookings;
  const isFullyBooked = spotsRemaining <= 0;
  const startDate = new Date(session.startTime);

  return (
    <Link href={`/classes/${session._id}`}>
      <div
        className={`group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg ${
          isBooked ? "ring-2 ring-green-500 ring-offset-2" : ""
        }`}
      >
        {/* Image */}
        <div className="relative aspect-video bg-muted">
          {session.activity.image ? (
            <Image
              src={urlFor(session.activity.image).width(400).height(225).url()}
              alt={session.activity.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {/* Tier Badge */}
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${
              tierColors[session.activity.tierLevel] || tierColors.basic
            }`}
          >
            {session.activity.tierLevel.charAt(0).toUpperCase() +
              session.activity.tierLevel.slice(1)}
          </span>

          {/* Booked Badge */}
          {isBooked ? (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              <CheckCircleIcon className="h-3 w-3" />
              Booked
            </span>
          ) : isFullyBooked ? (
            <span className="absolute right-2 top-2 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
              Fully Booked
            </span>
          ) : spotsRemaining <= 3 ? (
            <span className="absolute right-2 top-2 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
              {spotsRemaining} spots left
            </span>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {session.activity.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {session.activity.instructor} • {session.activity.duration} min
          </p>
          <p className="text-sm text-muted-foreground">
            {session.venue.name}
            {session.venue.city && ` • ${session.venue.city}`}
          </p>

          {/* Date/Time */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm font-medium">
              {format(startDate, "EEE, MMM d")}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(startDate, "h:mm a")}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
