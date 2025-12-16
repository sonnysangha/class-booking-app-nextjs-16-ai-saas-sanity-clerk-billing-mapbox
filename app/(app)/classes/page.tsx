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
import { MapPinIcon, SearchIcon, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  // Filter out null values from booked session IDs
  const bookedIds: (string | null)[] = bookedSessionsResult.data || [];
  const filteredBookedIds = bookedIds.filter((id): id is string => id !== null);
  const bookedSessionIds = new Set(filteredBookedIds);

  // User preferences are always set via onboarding - redirect if missing
  if (!userPreferences?.location || !userPreferences?.searchRadius) {
    redirect("/onboarding");
  }

  const { location, searchRadius } = userPreferences;

  // Filter sessions that have valid startTime for the distance filter
  const sessionsForFilter = allSessions
    .filter((s) => s.startTime !== null)
    .map((s) => ({
      ...s,
      startTime: s.startTime as string,
    }));

  // Get sessions within user's preferred radius, sorted by distance
  const sessionsWithDistance = filterSessionsByDistance(
    sessionsForFilter,
    location.lat,
    location.lng,
    searchRadius,
  );

  // Group sessions by day (already sorted by time from GROQ)
  type SessionWithDistance = (typeof sessionsWithDistance)[number];
  const groupedByDay = new Map<string, SessionWithDistance[]>();
  for (const session of sessionsWithDistance) {
    const dateKey = format(new Date(session.startTime), "yyyy-MM-dd");
    const existing = groupedByDay.get(dateKey) || [];
    groupedByDay.set(dateKey, [...existing, session]);
  }

  const groupedArray = Array.from(groupedByDay.entries());

  // Extract venues for map display
  const venuesForMap = sessionsWithDistance
    .filter((s) => s.venue !== null)
    .map((s) => s.venue)
    .filter((v): v is NonNullable<typeof v> => v !== null);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header with Gradient */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <Suspense
              fallback={
                <div className="flex h-11 w-full items-center gap-2 rounded-full border bg-background px-4 sm:max-w-md">
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
            <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-2.5 transition-colors hover:bg-primary/10">
              <MapPinIcon className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  Within {searchRadius} km of{" "}
                  <span className="text-primary">{location.address}</span>
                </p>
              </div>
              <Link
                href="/profile"
                className="shrink-0 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Change
              </Link>
            </div>
          </div>

          {/* Search Results Indicator */}
          {searchQuery && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <SearchIcon className="h-3 w-3" />
                Results for &quot;{searchQuery}&quot;
              </Badge>
              <span className="text-sm text-muted-foreground">
                {sessionsWithDistance.length}{" "}
                {sessionsWithDistance.length === 1 ? "class" : "classes"} found
              </span>
              <Link
                href="/classes"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Clear search
              </Link>
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <Card className="sticky top-20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold">Category</h4>
                  <div className="space-y-2.5">
                    {categories.map(
                      (category: { _id: string; name: string | null }) => (
                        <label
                          key={category._id}
                          className="flex items-center gap-2.5 text-sm cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-2 border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0"
                          />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {category.name}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                {/* Tier */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold">Tier</h4>
                  <div className="space-y-2.5">
                    {["Basic", "Performance", "Champion"].map((tier) => (
                      <label
                        key={tier}
                        className="flex items-center gap-2.5 text-sm cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-2 border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {tier}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
            <Card className="sticky top-20 h-[calc(100vh-8rem)] overflow-hidden p-0">
              <ClassesMapSidebar
                venues={venuesForMap}
                userLocation={{ lat: location.lat, lng: location.lng }}
              />
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
