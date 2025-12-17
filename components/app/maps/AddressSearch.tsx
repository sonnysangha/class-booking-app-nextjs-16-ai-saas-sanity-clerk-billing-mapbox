"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPinIcon, SearchIcon, LoaderIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/useDebounce";

export interface AddressResult {
  lat: number;
  lng: number;
  address: string;
  street?: string;
  city?: string;
  postcode?: string;
  country?: string;
}

interface MapboxContext {
  id: string;
  text: string;
}

interface MapboxFeature {
  place_name: string;
  center: [number, number]; // [lng, lat]
  text?: string;
  address?: string;
  context?: MapboxContext[];
}

function extractAddressComponents(feature: MapboxFeature) {
  const context = feature.context || [];
  let street = "";
  let city = "";
  let postcode = "";
  let country = "";

  // Build street from address number and street name
  if (feature.address && feature.text) {
    street = `${feature.address} ${feature.text}`;
  } else if (feature.text) {
    street = feature.text;
  }

  // Extract components from context
  for (const item of context) {
    if (item.id.startsWith("place")) {
      city = item.text;
    } else if (item.id.startsWith("locality")) {
      city = city || item.text;
    } else if (item.id.startsWith("postcode")) {
      postcode = item.text;
    } else if (item.id.startsWith("country")) {
      country = item.text;
    }
  }

  return { street, city, postcode, country };
}

interface AddressSearchProps {
  value?: AddressResult | null;
  onChange: (value: AddressResult | null) => void;
  placeholder?: string;
  className?: string;
}

export function AddressSearch({
  value,
  onChange,
  placeholder = "Search for an address...",
  className,
}: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const searchAddress = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error("Mapbox access token not configured");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${token}&types=address,place,locality,neighborhood`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching address:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search when debounced query changes
  useEffect(() => {
    searchAddress(debouncedQuery);
  }, [debouncedQuery, searchAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSelect = (feature: MapboxFeature) => {
    const [lng, lat] = feature.center;
    const components = extractAddressComponents(feature);
    onChange({
      lat,
      lng,
      address: feature.place_name,
      ...components,
    });
    setQuery(feature.place_name);
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setSuggestions([]);
  };

  const isSearching = query !== debouncedQuery;

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query || value?.address || ""}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        {(isLoading || isSearching) && (
          <LoaderIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {!isLoading && !isSearching && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_name}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm first:rounded-t-lg last:rounded-b-lg hover:bg-accent"
            >
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{suggestion.place_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Selected address display */}
      {value && !isFocused && !query && (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Selected Location
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {value.address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
