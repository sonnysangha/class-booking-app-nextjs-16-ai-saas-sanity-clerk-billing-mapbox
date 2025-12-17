"use client";

import { ActivitiesList } from "./ActivitiesList";
import { CreateActivityDialog } from "./CreateActivityDialog";

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">
            Class templates that can be scheduled at venues
          </p>
        </div>
        <CreateActivityDialog />
      </div>

      <ActivitiesList />
    </div>
  );
}
