"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronLeft, X, MapPinIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TIER_OPTIONS } from "@/lib/constants/subscription";

interface ClassesFiltersProps {
  categories: { _id: string; name: string | null }[];
  activeFilters: {
    venueId: string | null;
    venueName: string | null;
    categoryIds: string[];
    tierLevels: string[];
  };
  mobileOnly?: boolean;
}

export function ClassesFilters({
  categories,
  activeFilters,
  mobileOnly = false,
}: ClassesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeFilterCount =
    (activeFilters.venueId ? 1 : 0) +
    activeFilters.categoryIds.length +
    activeFilters.tierLevels.length;

  // Helper to update URL params
  function updateParam(key: string, values: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set(key, values.join(","));
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `/classes?${query}` : "/classes");
  }

  function toggleCategory(id: string) {
    const updated = activeFilters.categoryIds.includes(id)
      ? activeFilters.categoryIds.filter((c) => c !== id)
      : [...activeFilters.categoryIds, id];
    updateParam("category", updated);
  }

  function toggleTier(tier: string) {
    const updated = activeFilters.tierLevels.includes(tier)
      ? activeFilters.tierLevels.filter((t) => t !== tier)
      : [...activeFilters.tierLevels, tier];
    updateParam("tier", updated);
  }

  function clearVenue() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("venue");
    const query = params.toString();
    router.push(query ? `/classes?${query}` : "/classes");
  }

  // Shared filter UI
  const filterContent = (
    <div className="space-y-6">
      {/* Active Venue Filter */}
      {activeFilters.venueId && activeFilters.venueName && (
        <div>
          <h4 className="mb-3 text-sm font-semibold">Venue</h4>
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
            <MapPinIcon className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 truncate text-sm font-medium">
              {activeFilters.venueName}
            </span>
            <button
              type="button"
              onClick={clearVenue}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h4 className="mb-3 text-sm font-semibold">Category</h4>
        <div className="space-y-2.5">
          {categories.map((cat) => {
            const checked = activeFilters.categoryIds.includes(cat._id);
            return (
              <label
                key={cat._id}
                className="group flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat._id)}
                  className="h-4 w-4 rounded border-2 border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span
                  className={
                    checked
                      ? "font-medium text-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }
                >
                  {cat.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tier */}
      <div>
        <h4 className="mb-3 text-sm font-semibold">Tier</h4>
        <div className="space-y-2.5">
          {TIER_OPTIONS.map((tier) => {
            const checked = activeFilters.tierLevels.includes(tier.value);
            return (
              <label
                key={tier.value}
                className="group flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTier(tier.value)}
                  className="h-4 w-4 rounded border-2 border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span
                  className={
                    checked
                      ? "font-medium text-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }
                >
                  {tier.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={() => router.push("/classes")}
          className="w-full rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  // Mobile: Sheet trigger + content
  if (mobileOnly) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge
                variant="default"
                className="h-5 min-w-5 justify-center px-1.5"
              >
                {activeFilterCount}
              </Badge>
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount}</Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">{filterContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Collapsible sidebar
  if (isCollapsed) {
    return (
      <aside className="hidden shrink-0 lg:block">
        <div className="sticky top-20">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            title="Show filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <Card className="sticky top-20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Hide filters"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>{filterContent}</CardContent>
      </Card>
    </aside>
  );
}
