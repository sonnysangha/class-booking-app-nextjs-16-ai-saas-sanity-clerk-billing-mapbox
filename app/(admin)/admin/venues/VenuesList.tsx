"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@sanity/sdk-react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { VenueCard, type VenueCardData } from "@/components/admin/VenueCard";
import { useDebounce } from "@/lib/hooks/useDebounce";

export function VenuesList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const query = useMemo(() => {
    const baseQuery = debouncedSearch.trim()
      ? `*[_type == "venue" && (
          name match $search ||
          address.city match $search ||
          address.fullAddress match $search
        )]`
      : `*[_type == "venue"]`;

    return `${baseQuery} | order(name asc) {
      _id,
      name,
      "city": address.city,
      "fullAddress": address.fullAddress,
      "image": images[0],
      "sessionCount": count(*[_type == "classSession" && references(^._id)])
    }`;
  }, [debouncedSearch]);

  const { data: venues, isPending } = useQuery<VenueCardData[]>({
    query,
    params: { search: `${debouncedSearch}*` },
  });

  const isSearching = search !== debouncedSearch;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search venues by name or location..."
          className="pl-10"
        />
        {(isSearching || isPending) && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Results */}
      {venues && venues.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-8 text-center">
          {debouncedSearch ? (
            <>
              <p className="text-muted-foreground">No venues found</p>
              <p className="text-sm text-muted-foreground">
                Try a different search term
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">No venues yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first venue to get started
              </p>
            </>
          )}
        </div>
      ) : isPending ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues?.map((venue) => (
            <VenueCard key={venue._id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}

function VenueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="border-t pt-3 mt-4">
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
