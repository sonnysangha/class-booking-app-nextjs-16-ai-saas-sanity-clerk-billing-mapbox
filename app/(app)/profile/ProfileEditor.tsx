"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, Loader2Icon, CheckIcon } from "lucide-react";
import { AddressSearch } from "@/components/app/maps/AddressSearch";
import { RadiusSelector } from "@/components/app/maps/RadiusSelector";
import { updateLocationPreferences } from "@/lib/actions/profile";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface ProfileEditorProps {
  initialLocation: LocationData | null;
  initialRadius: number;
}

export function ProfileEditor({
  initialLocation,
  initialRadius,
}: ProfileEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(
    initialLocation,
  );
  const [radius, setRadius] = useState<number | null>(initialRadius);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync state with props when they change (after server refresh)
  useEffect(() => {
    setLocation(initialLocation);
    setRadius(initialRadius);
  }, [initialLocation, initialRadius]);

  const handleSave = async () => {
    if (!location || !radius) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateLocationPreferences({
      location,
      searchRadius: radius,
    });

    if (result.success) {
      setSuccess(true);
      setIsEditing(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Failed to update");
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setLocation(initialLocation);
    setRadius(initialRadius);
    setIsEditing(false);
    setError(null);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {initialLocation?.address
            ? `${initialLocation.address} • ${initialRadius} km radius`
            : "No location set"}
        </p>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <PencilIcon className="h-4 w-4" />
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium">Location</p>
        <AddressSearch
          value={location}
          onChange={setLocation}
          placeholder="Search for a new location..."
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Search Radius</p>
        <RadiusSelector value={radius} onChange={setRadius} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckIcon className="h-4 w-4" />
          Preferences updated successfully!
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!location || !radius || isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
