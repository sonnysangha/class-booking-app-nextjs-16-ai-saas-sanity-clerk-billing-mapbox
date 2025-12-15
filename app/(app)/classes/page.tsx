import { auth } from "@clerk/nextjs/server";
import { sanityFetch } from "@/sanity/lib/live";
import { UPCOMING_SESSIONS_QUERY } from "@/sanity/lib/queries/sessions";
import { CATEGORIES_QUERY } from "@/sanity/lib/queries/categories";
import { USER_BOOKED_SESSION_IDS_QUERY } from "@/sanity/lib/queries";
import { SessionCard } from "@/components/app/SessionCard";
import { getUserPreferences } from "@/lib/actions/profile";
import { calculateDistance, formatDistance } from "@/lib/utils/distance";
import Link from "next/link";
import { MapPinIcon, AlertCircleIcon } from "lucide-react";

export default async function ClassesPage() {
  const { userId } = await auth();

  const [
    sessionsResult,
    categoriesResult,
    userPreferences,
    bookedSessionsResult,
  ] = await Promise.all([
    sanityFetch({ query: UPCOMING_SESSIONS_QUERY }),
    sanityFetch({ query: CATEGORIES_QUERY }),
    getUserPreferences(),
    userId
      ? sanityFetch({
          query: USER_BOOKED_SESSION_IDS_QUERY,
          params: { clerkId: userId },
        })
      : Promise.resolve({ data: [] }),
  ]);

  const allSessions = sessionsResult.data;
  const categories = categoriesResult.data;
  const bookedSessionIds = new Set<string>(bookedSessionsResult.data || []);

  // Filter sessions by user's location if preferences are set
  type SessionType = (typeof allSessions)[number];
  type SessionWithDistance = SessionType & { distance?: number };

  let sessions: SessionWithDistance[] = allSessions;
  let isFiltered = false;

  if (userPreferences?.location && userPreferences?.searchRadius) {
    const { lat: userLat, lng: userLng } = userPreferences.location;
    const radiusKm = userPreferences.searchRadius;

    sessions = allSessions
      .map((session: SessionType): SessionWithDistance => {
        const venueLat = session.venue?.address?.lat;
        const venueLng = session.venue?.address?.lng;

        if (venueLat === undefined || venueLng === undefined) {
          return { ...session, distance: undefined };
        }

        return {
          ...session,
          distance: calculateDistance(userLat, userLng, venueLat, venueLng),
        };
      })
      .filter((session: SessionWithDistance) => {
        if (session.distance === undefined) return false;
        return session.distance <= radiusKm;
      })
      .sort(
        (a: SessionWithDistance, b: SessionWithDistance) =>
          (a.distance ?? 0) - (b.distance ?? 0),
      );

    isFiltered = true;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            ClassPass Clone
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/classes" className="text-sm font-medium">
              Classes
            </Link>
            <Link
              href="/map"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Map
            </Link>
            <Link
              href="/bookings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              My Bookings
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Location info banner */}
        {isFiltered && userPreferences && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-900 dark:bg-violet-950">
            <div className="flex items-center gap-3">
              <MapPinIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <div>
                <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
                  Showing classes within {userPreferences.searchRadius} km
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  {userPreferences.location.address}
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="text-sm font-medium text-violet-700 hover:text-violet-800 dark:text-violet-300"
            >
              Change
            </Link>
          </div>
        )}

        {!userPreferences && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950">
            <AlertCircleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Set your location in{" "}
              <Link href="/profile" className="font-medium underline">
                your profile
              </Link>{" "}
              to see classes near you.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Filters Sidebar */}
          <aside className="w-full shrink-0 md:w-64">
            <div className="sticky top-4 rounded-lg border p-4">
              <h3 className="mb-4 font-semibold">Filters</h3>

              {/* Categories */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Category</h4>
                <div className="space-y-2">
                  {categories.map(
                    (category: { _id: string; name: string | null }) => (
                      <label
                        key={category._id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input type="checkbox" className="rounded" />
                        {category.name}
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* Tier */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Tier</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    Basic
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    Performance
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    Champion
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Sessions Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Upcoming Classes</h1>
              <p className="text-muted-foreground">
                {sessions.length} classes{isFiltered ? " nearby" : " available"}
              </p>
            </div>

            {sessions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>
                  No upcoming classes found{isFiltered ? " in your area" : ""}.
                </p>
                <p className="mt-2 text-sm">
                  {isFiltered
                    ? "Try increasing your search radius in your profile."
                    : "Check back later or adjust your filters."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map(
                  (
                    session: Parameters<typeof SessionCard>[0]["session"] & {
                      distance?: number;
                    },
                  ) => (
                    <div key={session._id} className="relative">
                      <SessionCard
                        session={session}
                        isBooked={bookedSessionIds.has(session._id)}
                      />
                      {isFiltered && session.distance !== undefined && (
                        <div className="absolute bottom-20 right-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium shadow backdrop-blur dark:bg-black/80">
                          {formatDistance(session.distance)}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
