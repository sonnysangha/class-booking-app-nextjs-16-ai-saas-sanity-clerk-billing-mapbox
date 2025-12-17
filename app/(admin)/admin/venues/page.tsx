"use client";

import { VenuesList } from "./VenuesList";
import { CreateVenueDialog } from "./CreateVenueDialog";

export default function VenuesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">
            Locations where classes are held
          </p>
        </div>
        <CreateVenueDialog />
      </div>

      <VenuesList />
    </div>
  );
}
