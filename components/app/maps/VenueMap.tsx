"use client";

import { MapPinIcon } from "lucide-react";
import {
  Map as LeafletMap,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";

interface VenueAddress {
  lat: number;
  lng: number;
  fullAddress?: string;
  city?: string;
}

interface VenueMapProps {
  venue: {
    name: string;
    address: VenueAddress | null;
  };
  className?: string;
  zoom?: number;
  showPopup?: boolean;
}

/**
 * Reusable venue map component.
 * Displays a single venue location on an interactive map.
 */
export function VenueMap({
  venue,
  className,
  zoom = 15,
  showPopup = true,
}: VenueMapProps) {
  const { address } = venue;
  const hasValidCoordinates =
    address !== null &&
    typeof address.lat === "number" &&
    typeof address.lng === "number";

  if (!hasValidCoordinates || !address) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-muted text-muted-foreground",
          className
        )}
      >
        <div className="text-center">
          <MapPinIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">No location available</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [address.lat, address.lng];

  return (
    <LeafletMap
      center={center}
      zoom={zoom}
      className={cn("rounded-lg", className)}
    >
      <MapTileLayer />
      <MapZoomControl />
      <MapMarker
        position={center}
        icon={
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-linear-to-br from-violet-500 to-purple-500 shadow-lg">
            <MapPinIcon className="h-5 w-5 text-white" />
          </div>
        }
        iconAnchor={[20, 20]}
      >
        {showPopup && (
          <MapPopup>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">{venue.name}</h3>
              {venue.address?.fullAddress && (
                <p className="text-sm text-muted-foreground">
                  {venue.address.fullAddress}
                </p>
              )}
            </div>
          </MapPopup>
        )}
      </MapMarker>
    </LeafletMap>
  );
}

