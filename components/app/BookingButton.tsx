"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking, cancelBooking } from "@/lib/actions/bookings";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <Button disabled className="w-full h-12">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // User already has a booking for this session
  if (existingBookingId && !isCancelled) {
    return (
      <div className="space-y-3">
        <div className="w-full rounded-xl bg-primary/10 py-3 text-sm font-semibold text-primary text-center flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          You&apos;re Booked!
        </div>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
          className="w-full h-10 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            "Cancel Booking"
          )}
        </Button>
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        <Link
          href="/bookings"
          className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View My Bookings →
        </Link>
      </div>
    );
  }

  if (isFullyBooked) {
    return (
      <Button disabled className="w-full h-12">
        Class is Full
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button className="w-full h-12">Sign in to Book</Button>
      </SignInButton>
    );
  }

  // User is signed in but doesn't have a subscription
  if (userTier === null) {
    return (
      <div className="space-y-2">
        <Button asChild className="w-full h-12">
          <Link href={`/upgrade?required=${tierLevel}&sessionId=${sessionId}`}>
            Subscribe to Book
          </Link>
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Choose a plan to start booking classes
        </p>
      </div>
    );
  }

  // User has a subscription but tier is too low
  if (!canAccess) {
    return (
      <div className="space-y-2">
        <Button
          asChild
          className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Link href={`/upgrade?required=${tierLevel}&sessionId=${sessionId}`}>
            Upgrade to Book
          </Link>
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Requires {requiredTierName} tier or higher
        </p>
      </div>
    );
  }

  // User can book this class
  return (
    <div className="space-y-2">
      <Button onClick={handleBook} disabled={isPending} className="w-full h-12">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Booking...
          </>
        ) : (
          "Book This Class"
        )}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
