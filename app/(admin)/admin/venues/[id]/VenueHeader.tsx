"use client";

import Link from "next/link";
import { useDocumentProjection } from "@sanity/sdk-react";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishButton } from "@/components/admin/PublishButton";
import { RevertButton } from "@/components/admin/RevertButton";

interface VenueHeaderProjection {
  name?: string;
  city?: string;
  fullAddress?: string;
}

interface VenueHeaderProps {
  documentId: string;
}

export function VenueHeader({ documentId }: VenueHeaderProps) {
  const handle = { documentType: "venue" as const, documentId };
  const { data } = useDocumentProjection({
    ...handle,
    projection: `{ name, "city": address.city, "fullAddress": address.fullAddress }`,
  });

  const venue = data as VenueHeaderProjection | null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/admin/venues">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {venue?.name || "Venue"}
          </h1>
          {(venue?.fullAddress || venue?.city) && (
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {venue.fullAddress || venue.city}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RevertButton {...handle} />
        <PublishButton {...handle} />
      </div>
    </div>
  );
}

