import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { sanityFetch } from "@/sanity/lib/live";
import {
  UPCOMING_SESSIONS_QUERY,
  SEARCH_SESSIONS_QUERY,
} from "@/sanity/lib/queries/sessions";
import { CATEGORIES_QUERY } from "@/sanity/lib/queries/categories";
import { USER_BOOKED_SESSION_IDS_QUERY } from "@/sanity/lib/queries";
import { ClassesContent } from "@/components/app/ClassesContent";
import { ClassesMapSidebar } from "@/components/app/ClassesMapSidebar";
import { ClassSearch } from "@/components/app/ClassSearch";
import { getUserPreferences } from "@/lib/actions/profile";
import { filterSessionsByDistance } from "@/lib/utils/distance";
import Link from "next/link";
import { MapPinIcon, SearchIcon } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ClassesPage({ searchParams }: PageProps) {
  const { q: searchQuery } = await searchParams;
  const { userId } = await auth();

  // Use search query if provided, otherwise fetch all sessions
  const sessionsQuery = searchQuery
    ? sanityFetch({
        query: SEARCH_SESSIONS_QUERY,
        params: { searchTerm: searchQuery },
      })
    : sanityFetch({ query: UPCOMING_SESSIONS_QUERY });

  const [
    sessionsResult,
    categoriesResult,
    userPreferences,
    bookedSessionsResult,
  ] = await Promise.all([
    sessionsQuery,
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

  // User preferences are always set via onboarding - redirect if missing
  if (!userPreferences?.location || !userPreferences?.searchRadius) {
    redirect("/onboarding");
  }

  type SessionType = (typeof allSessions)[number];
  type SessionWithDistance = SessionType & { distance: number };

  const { location, searchRadius } = userPreferences;

  // Get sessions within user's preferred radius, sorted by distance
  const sessions = filterSessionsByDistance(
    allSessions,
    location.lat,
    location.lng,
    searchRadius,
  ) as SessionWithDistance[];

  // Group sessions by day (already sorted by time from GROQ)
  const groupedByDay = new Map<string, SessionWithDistance[]>();
  for (const session of sessions) {
    const dateKey = format(new Date(session.startTime), "yyyy-MM-dd");
    const existing = groupedByDay.get(dateKey) || [];
    groupedByDay.set(dateKey, [...existing, session]);
  }

  const groupedArray = Array.from(groupedByDay.entries());

  // Extract venues for map display
  const venuesForMap = sessions
    .filter((s) => s.venue)
    .map((s) => ({
      _id: s.venue._id,
      name: s.venue.name,
      city: s.venue.city,
      address: s.venue.address,
    }));

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Search and Location Banner */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <Suspense
            fallback={
              <div className="flex h-10 w-full items-center gap-2 rounded-lg border bg-background px-3 sm:max-w-md">
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Loading search...
                </span>
              </div>
            }
          >
            <ClassSearch className="w-full sm:max-w-md" />
          </Suspense>

          {/* Location info */}
          <div className="flex items-center gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 dark:border-violet-900 dark:bg-violet-950">
            <MapPinIcon className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-violet-800 dark:text-violet-200">
                Within {searchRadius} km of {location.address}
              </p>
            </div>
            <Link
              href="/profile"
              className="shrink-0 text-sm font-medium text-violet-700 hover:text-violet-800 dark:text-violet-300"
            >
              Change
            </Link>
          </div>
        </div>

        {/* Search Results Indicator */}
        {searchQuery && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <SearchIcon className="h-4 w-4" />
            <span>
              Showing results for &quot;{searchQuery}&quot; ({sessions.length}{" "}
              {sessions.length === 1 ? "class" : "classes"})
            </span>
            <Link
              href="/classes"
              className="ml-2 text-violet-600 hover:text-violet-700"
            >
              Clear search
            </Link>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 rounded-lg border p-4">
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

          {/* Sessions Content */}
          <div className="min-w-0 flex-1">
            <ClassesContent
              groupedSessions={groupedArray}
              bookedSessionIds={Array.from(bookedSessionIds)}
            />
          </div>

          {/* Map Sidebar - Hidden on mobile/tablet, visible on xl screens */}
          <aside className="hidden w-[400px] shrink-0 xl:block">
            <div className="sticky top-20 h-[calc(100vh-8rem)] overflow-hidden rounded-lg border">
              <ClassesMapSidebar
                venues={venuesForMap}
                userLocation={{ lat: location.lat, lng: location.lng }}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
