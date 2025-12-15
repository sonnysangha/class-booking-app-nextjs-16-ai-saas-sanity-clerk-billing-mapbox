"use client";

import { useState } from "react";
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
  slug: { current: string };
  address: {
    lat: number;
    lng: number;
    fullAddress?: string;
    city?: string;
  } | null;
  upcomingSessionsCount: number;
}

interface MapViewProps {
  venues: Venue[];
}

export function MapView({ venues }: MapViewProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Filter venues with valid coordinates
  const validVenues = venues.filter(
    (v): v is Venue & { address: NonNullable<Venue["address"]> } =>
      v.address !== null &&
      typeof v.address.lat === "number" &&
      typeof v.address.lng === "number",
  );

  // Calculate center - default to Dubai if no venues
  const defaultCenter: [number, number] = [25.2048, 55.2708]; // Dubai [lat, lng]
  const center: [number, number] =
    validVenues.length > 0
      ? [validVenues[0].address.lat, validVenues[0].address.lng]
      : defaultCenter;

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-zinc-900">
      <LeafletMap
        center={center}
        zoom={12}
        className="h-full w-full rounded-none"
      >
        <MapTileLayer />
        <MapZoomControl />

        {validVenues.map((venue) => (
          <MapMarker
            key={venue._id}
            position={[venue.address.lat, venue.address.lng]}
            icon={
              <div
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[3px] border-white bg-linear-to-br from-violet-500 to-purple-500 text-[13px] font-bold text-white shadow-lg transition-transform hover:scale-110"
                style={{
                  boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
                }}
              >
                {venue.upcomingSessionsCount}
              </div>
            }
            iconAnchor={[20, 20]}
            eventHandlers={{
              click: () => setSelectedVenue(venue),
            }}
          >
            <MapPopup>
              <div className="space-y-3 p-1">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {venue.name}
                  </h3>
                  {venue.address.fullAddress && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {venue.address.fullAddress}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/20 px-3 py-1 text-sm font-medium text-violet-600 dark:text-violet-300">
                  {venue.upcomingSessionsCount} upcoming{" "}
                  {venue.upcomingSessionsCount === 1 ? "class" : "classes"}
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
        ))}
      </LeafletMap>

      {/* Venue Count Badge */}
      <div className="pointer-events-none absolute left-4 top-14 z-1000">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/90 px-4 py-2 text-sm text-white backdrop-blur">
          <MapPinIcon className="h-4 w-4 text-violet-400" />
          {validVenues.length} venues with classes
        </div>
      </div>

      {/* Selected Venue Card (mobile-friendly bottom sheet style) */}
      {selectedVenue && (
        <div className="absolute bottom-6 left-4 right-4 z-1001 md:left-auto md:right-6 md:w-[360px]">
          <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-2xl backdrop-blur">
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between">
                <h3 className="pr-8 text-lg font-semibold text-white">
                  {selectedVenue.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedVenue(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  ✕
                </button>
              </div>
              {selectedVenue.address?.fullAddress && (
                <p className="mt-1 text-sm text-zinc-400">
                  {selectedVenue.address.fullAddress}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-4 px-4 pb-4">
              <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/20 px-3 py-1 text-sm font-medium text-violet-300">
                {selectedVenue.upcomingSessionsCount} upcoming{" "}
                {selectedVenue.upcomingSessionsCount === 1
                  ? "class"
                  : "classes"}
              </span>
              <Link
                href={`/classes?venue=${selectedVenue._id}`}
                className="block w-full rounded-lg bg-violet-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-violet-700"
              >
                View Classes at This Venue
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
