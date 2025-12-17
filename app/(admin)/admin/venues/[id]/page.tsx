"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { VenueHeader } from "./VenueHeader";
import { VenueDetails } from "./VenueDetails";
import { VenueDetailSkeleton } from "./VenueDetailSkeleton";

export default function VenueDetailPage() {
  const params = useParams();
  const documentId = params.id as string;

  return (
    <div className="space-y-6">
      <Suspense fallback={<VenueDetailSkeleton />}>
        <VenueHeader documentId={documentId} />
        <VenueDetails documentId={documentId} />
      </Suspense>
    </div>
  );
}
