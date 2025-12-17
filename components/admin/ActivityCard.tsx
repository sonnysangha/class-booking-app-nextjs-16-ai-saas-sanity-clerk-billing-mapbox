"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, User, Calendar } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TIER_COLORS } from "@/lib/constants/subscription";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface ActivityCardData {
  _id: string;
  name?: string;
  instructor?: string;
  tierLevel?: string;
  duration?: number;
  categoryName?: string;
  image?: SanityImageSource;
  sessionCount?: number;
}

interface ActivityCardProps {
  activity: ActivityCardData;
  href?: string;
}

export function ActivityCard({ activity, href }: ActivityCardProps) {
  const baseId = activity._id.replace("drafts.", "");
  const tierLevel = activity.tierLevel ?? "basic";
  const linkHref = href ?? `/admin/activities/${baseId}`;

  return (
    <Link href={linkHref}>
      <Card className="group gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {activity.image ? (
            <Image
              src={urlFor(activity.image).width(400).height(225).url()}
              alt={activity.name ?? "Activity"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
              <span className="text-4xl opacity-20">🏃</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Tier Badge */}
          <Badge
            className={`absolute left-3 top-3 border-0 ${TIER_COLORS[tierLevel as keyof typeof TIER_COLORS] || TIER_COLORS.basic}`}
          >
            {tierLevel.charAt(0).toUpperCase() + tierLevel.slice(1)}
          </Badge>

          {/* Category Badge */}
          {activity.categoryName && (
            <Badge
              variant="secondary"
              className="absolute right-3 top-3 border-0 bg-white/90 text-foreground dark:bg-black/80"
            >
              {activity.categoryName}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 !px-4">
          <h3 className="line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
            {activity.name || "Untitled Activity"}
          </h3>

          <div className="mt-2 space-y-1.5">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{activity.instructor || "No instructor"}</span>
              <span className="mx-1">•</span>
              <Clock className="h-3.5 w-3.5" />
              <span>{activity.duration || 60} min</span>
            </p>
          </div>

          {/* Session count footer */}
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {activity.sessionCount ?? 0} session
                {activity.sessionCount !== 1 ? "s" : ""} scheduled
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

