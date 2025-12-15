"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking, cancelBooking } from "@/lib/actions/bookings";
import Link from "next/link";
import type { Tier } from "@/lib/constants";
import { TIER_HIERARCHY, TIER_DISPLAY_NAMES } from "@/lib/constants";

interface BookingButtonProps {
  sessionId: string;
  tierLevel: string;
  isFullyBooked: boolean;
  userTier: Tier | null;
  existingBookingId: string | null;
}

export function BookingButton({
  sessionId,
  tierLevel,
  isFullyBooked,
  userTier,
  existingBookingId,
}: BookingButtonProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const router = useRouter();

  // Check if user can access this class tier
  const canAccess =
    userTier !== null &&
    TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[tierLevel as Tier];

  const requiredTier = tierLevel as Tier;
  const requiredTierName = TIER_DISPLAY_NAMES[requiredTier] || tierLevel;

  const handleBook = () => {
    setError(null);

    startTransition(async () => {
      const result = await createBooking(sessionId);

      if (!result.success) {
        setError(result.error || "Failed to book class");
        return;
      }

      router.push("/bookings");
    });
  };

  const handleCancel = () => {
    if (!existingBookingId) return;
    setError(null);

    startTransition(async () => {
      const result = await cancelBooking(existingBookingId);

      if (!result.success) {
        setError(result.error || "Failed to cancel booking");
        return;
      }

      setIsCancelled(true);
      router.refresh();
    });
  };

  if (!isLoaded) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-md bg-muted py-3 text-sm font-medium"
      >
        Loading...
      </button>
    );
  }

  // User already has a booking for this session
  if (existingBookingId && !isCancelled) {
    return (
      <div>
        <div className="w-full rounded-md bg-green-100 py-3 text-sm font-medium text-green-800 text-center mb-3">
          ✓ You&apos;re Booked!
        </div>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="w-full rounded-md border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Cancelling..." : "Cancel Booking"}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}
        <Link
          href="/bookings"
          className="block mt-3 text-center text-sm text-muted-foreground hover:text-foreground"
        >
          View My Bookings →
        </Link>
      </div>
    );
  }

  if (isFullyBooked) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-md bg-muted py-3 text-sm font-medium text-muted-foreground"
      >
        Class is Full
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          className="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign in to Book
        </button>
      </SignInButton>
    );
  }

  // User is signed in but doesn't have a subscription
  if (userTier === null) {
    return (
      <div>
        <Link
          href={`/upgrade?required=${tierLevel}&sessionId=${sessionId}`}
          className="block w-full rounded-md bg-linear-to-r from-violet-600 to-purple-600 py-3 text-sm font-medium text-white text-center hover:from-violet-700 hover:to-purple-700 transition-all"
        >
          Subscribe to Book
        </Link>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Choose a plan to start booking classes
        </p>
      </div>
    );
  }

  // User has a subscription but tier is too low
  if (!canAccess) {
    return (
      <div>
        <Link
          href={`/upgrade?required=${tierLevel}&sessionId=${sessionId}`}
          className="block w-full rounded-md bg-linear-to-r from-amber-500 to-orange-500 py-3 text-sm font-medium text-white text-center hover:from-amber-600 hover:to-orange-600 transition-all"
        >
          Upgrade to Book
        </Link>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Requires {requiredTierName} tier or higher
        </p>
      </div>
    );
  }

  // User can book this class
  return (
    <div>
      <button
        type="button"
        onClick={handleBook}
        disabled={isPending}
        className="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Hold on a sec..." : "Book This Class"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
