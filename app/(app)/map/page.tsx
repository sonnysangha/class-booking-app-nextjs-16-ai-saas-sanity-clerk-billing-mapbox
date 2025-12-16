import { sanityFetch } from "@/sanity/lib/live";
import { VENUES_WITH_SESSIONS_QUERY } from "@/sanity/lib/queries/venues";
import { MapView } from "@/components/app/MapView";

export default async function MapPage() {
  const { data: venues } = await sanityFetch({
    query: VENUES_WITH_SESSIONS_QUERY,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <MapView venues={venues} />
      </main>
    </div>
  );
}
