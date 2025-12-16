"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MapPinIcon } from "lucide-react";
import {
  Map as LeafletMap,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";

interface Venue {
  _id: string;
  name: string;
  city?: string;
  address?: {
    lat?: number;
    lng?: number;
    fullAddress?: string;
  } | null;
}

interface ClassesMapSidebarProps {
  venues: Venue[];
  userLocation?: { lat: number; lng: number };
  highlightedVenueId?: string | null;
  onVenueClick?: (venueId: string) => void;
}

/**
 * Sidebar map component for the classes page.
 * Displays markers for each unique venue with class counts.
 */
export function ClassesMapSidebar({
  venues,
  userLocation,
  highlightedVenueId,
  onVenueClick,
}: ClassesMapSidebarProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Count classes per venue
  const venueCounts = venues.reduce(
    (acc, venue) => {
      acc[venue._id] = (acc[venue._id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get unique venues with valid coordinates
  const uniqueVenues = Array.from(
    new Map(
      venues
        .filter(
          (v) =>
            v.address &&
            typeof v.address.lat === "number" &&
            typeof v.address.lng === "number",
        )
        .map((v) => [v._id, v]),
    ).values(),
  );

  // Calculate center - use user location or first venue
  const defaultCenter: [number, number] = [25.2048, 55.2708]; // Dubai
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : uniqueVenues.length > 0
      ? [uniqueVenues[0].address!.lat!, uniqueVenues[0].address!.lng!]
      : defaultCenter;

  const handleVenueClick = useCallback(
    (venue: Venue) => {
      setSelectedVenue(venue);
      onVenueClick?.(venue._id);
    },
    [onVenueClick],
  );

  if (uniqueVenues.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <div className="text-center">
          <MapPinIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">No venues to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <LeafletMap center={center} zoom={12} className="h-full w-full">
        <MapTileLayer />
        <MapZoomControl />

        {/* User location marker */}
        {userLocation && (
          <MapMarker
            position={[userLocation.lat, userLocation.lng]}
            icon={
              <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            }
            iconAnchor={[8, 8]}
          />
        )}

        {/* Venue markers */}
        {uniqueVenues.map((venue) => {
          const isHighlighted = highlightedVenueId === venue._id;
          const classCount = venueCounts[venue._id] || 0;

          return (
            <MapMarker
              key={venue._id}
              position={[venue.address!.lat!, venue.address!.lng!]}
              icon={
                <div
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[3px] text-[13px] font-bold text-white shadow-lg transition-all ${
                    isHighlighted
                      ? "scale-125 border-yellow-400 bg-yellow-500"
                      : "border-white bg-linear-to-br from-violet-500 to-purple-500 hover:scale-110"
                  }`}
                  style={{
                    boxShadow: isHighlighted
                      ? "0 4px 12px rgba(234, 179, 8, 0.5)"
                      : "0 4px 12px rgba(139, 92, 246, 0.4)",
                  }}
                >
                  {classCount}
                </div>
              }
              iconAnchor={[20, 20]}
              eventHandlers={{
                click: () => handleVenueClick(venue),
              }}
            >
              <MapPopup>
                <div className="space-y-3 p-1">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {venue.name}
                    </h3>
                    {venue.city && (
                      <p className="text-sm text-muted-foreground">
                        {venue.city}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-300">
                    {classCount} {classCount === 1 ? "class" : "classes"}
                  </span>
                  <Link
                    href={`/classes?venue=${venue._id}`}
                    className="block w-full rounded-lg bg-violet-600 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-violet-700"
                  >
                    View Classes
                  </Link>
                </div>
              </MapPopup>
            </MapMarker>
          );
        })}
      </LeafletMap>

    </div>
  );
}

