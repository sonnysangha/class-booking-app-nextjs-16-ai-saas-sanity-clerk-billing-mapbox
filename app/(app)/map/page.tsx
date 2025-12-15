import { sanityFetch } from "@/sanity/lib/live";
import { VENUES_WITH_SESSIONS_QUERY } from "@/sanity/lib/queries/venues";
import { MapView } from "@/components/app/MapView";
import Link from "next/link";

export default async function MapPage() {
  const { data: venues } = await sanityFetch({
    query: VENUES_WITH_SESSIONS_QUERY,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            ClassPass Clone
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/classes"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Classes
            </Link>
            <Link href="/map" className="text-sm font-medium">
              Map
            </Link>
            <Link
              href="/bookings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              My Bookings
            </Link>
          </nav>
        </div>
      </header>

      {/* Map */}
      <main className="flex-1">
        <MapView venues={venues} />
      </main>
    </div>
  );
}
