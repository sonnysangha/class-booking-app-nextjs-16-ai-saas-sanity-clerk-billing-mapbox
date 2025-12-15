"use client";

import { useCallback, useState } from "react";
import { Stack, TextInput, Card, Text, Button } from "@sanity/ui";
import { set, unset } from "sanity";
import type { ObjectInputProps } from "sanity";

interface AddressValue {
  fullAddress?: string;
  street?: string;
  city?: string;
  postcode?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

interface MapboxFeature {
  place_name: string;
  center: [number, number];
  context?: Array<{
    id: string;
    text: string;
  }>;
  properties?: {
    address?: string;
  };
  text?: string;
}

function extractAddressComponents(feature: MapboxFeature) {
  const context = feature.context || [];
  const street = feature.properties?.address || feature.text || "";
  let city = "";
  let postcode = "";
  let country = "";

  for (const component of context) {
    if (component.id.startsWith("place")) {
      city = component.text;
    } else if (component.id.startsWith("postcode")) {
      postcode = component.text;
    } else if (component.id.startsWith("country")) {
      country = component.text;
    }
  }

  return { street, city, postcode, country };
}

export function MapboxAddressInput(props: ObjectInputProps) {
  const { value, onChange } = props;
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchAddress = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error("Mapbox access token not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery,
        )}.json?access_token=${token}&types=address,place`,
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching address:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = event.target.value;
      setQuery(newQuery);

      // Debounce the search
      const timeoutId = setTimeout(() => {
        searchAddress(newQuery);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [searchAddress],
  );

  const handleSelect = useCallback(
    (feature: MapboxFeature) => {
      const components = extractAddressComponents(feature);
      const [lng, lat] = feature.center;

      // Set address object with coordinates
      onChange(
        set({
          fullAddress: feature.place_name,
          ...components,
          lat,
          lng,
        }),
      );

      // Clear suggestions and set query to selected address
      setQuery(feature.place_name);
      setSuggestions([]);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(unset());
    setQuery("");
    setSuggestions([]);
  }, [onChange]);

  const currentAddress = value as AddressValue | undefined;

  return (
    <Stack space={3}>
      <TextInput
        value={query || currentAddress?.fullAddress || ""}
        onChange={handleInputChange}
        placeholder="Start typing an address..."
      />

      {isLoading && (
        <Text size={1} muted>
          Searching...
        </Text>
      )}

      {suggestions.length > 0 && (
        <Card padding={2} radius={2} shadow={1}>
          <Stack space={2}>
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.place_name}
                mode="ghost"
                onClick={() => handleSelect(suggestion)}
                style={{ textAlign: "left", width: "100%" }}
              >
                <Text size={1}>{suggestion.place_name}</Text>
              </Button>
            ))}
          </Stack>
        </Card>
      )}

      {currentAddress?.fullAddress && (
        <Stack space={2}>
          <Card padding={3} radius={2} tone="positive">
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Selected Address:
              </Text>
              <Text size={1}>{currentAddress.fullAddress}</Text>
              {currentAddress.city && (
                <Text size={1} muted>
                  City: {currentAddress.city}
                </Text>
              )}
              {currentAddress.postcode && (
                <Text size={1} muted>
                  Postcode: {currentAddress.postcode}
                </Text>
              )}
              {currentAddress.lat && currentAddress.lng && (
                <Text size={1} muted>
                  Coordinates: {currentAddress.lat.toFixed(4)},{" "}
                  {currentAddress.lng.toFixed(4)}
                </Text>
              )}
            </Stack>
          </Card>
          <Button mode="ghost" tone="critical" onClick={handleClear}>
            Clear Address
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
