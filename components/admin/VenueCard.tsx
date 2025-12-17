"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { Card, CardContent } from "@/components/ui/card";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface VenueCardData {
  _id: string;
  name?: string;
  city?: string;
  fullAddress?: string;
  image?: SanityImageSource;
  sessionCount?: number;
}

interface VenueCardProps {
  venue: VenueCardData;
  href?: string;
}

export function VenueCard({ venue, href }: VenueCardProps) {
  const baseId = venue._id.replace("drafts.", "");
  const linkHref = href ?? `/admin/venues/${baseId}`;

  return (
    <Link href={linkHref}>
      <Card className="group gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {venue.image ? (
            <Image
              src={urlFor(venue.image).width(400).height(225).url()}
              alt={venue.name ?? "Venue"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
              <span className="text-4xl opacity-20">🏢</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Location badge */}
          {venue.city && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-foreground shadow-md backdrop-blur-sm dark:bg-black/80">
              <MapPin className="h-3 w-3" />
              {venue.city}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 !px-4">
          <h3 className="line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
            {venue.name || "Untitled Venue"}
          </h3>

          {venue.fullAddress && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {venue.fullAddress}
            </p>
          )}

          {/* Session count footer */}
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {venue.sessionCount ?? 0} session
                {venue.sessionCount !== 1 ? "s" : ""} at this venue
              </span>
            </div>
            <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Edit →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
