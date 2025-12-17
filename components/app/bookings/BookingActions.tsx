"use client";

import { useTransition, useState } from "react";
import { cancelBooking, confirmAttendance } from "@/lib/actions/bookings";

interface BookingActionsProps {
  bookingId: string;
  canConfirmAttendance: boolean;
  isPast: boolean;
}

export function BookingActions({
  bookingId,
  canConfirmAttendance,
  isPast,
}: BookingActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setError(null);

    startTransition(async () => {
      const result = await cancelBooking(bookingId);

      if (!result.success) {
        setError(result.error || "Failed to cancel booking");
      }
    });
  };

  const handleConfirmAttendance = () => {
    setError(null);

    startTransition(async () => {
      const result = await confirmAttendance(bookingId);

      if (!result.success) {
        setError(result.error || "Failed to confirm attendance");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {canConfirmAttendance && (
        <button
          onClick={handleConfirmAttendance}
          disabled={isPending}
          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? "..." : "I've Attended"}
        </button>
      )}

      {!isPast && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          {isPending ? "..." : "Cancel"}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

