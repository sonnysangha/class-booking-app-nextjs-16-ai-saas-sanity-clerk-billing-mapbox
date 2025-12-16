import { auth } from "@clerk/nextjs/server";
import { sanityFetch } from "@/sanity/lib/live";
import { USER_BOOKINGS_QUERY } from "@/sanity/lib/queries/bookings";
import { urlFor } from "@/sanity/lib/image";
import { format, isPast, addHours, isWithinInterval } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookingActions } from "@/components/app/BookingActions";
import { BookingsCalendarView } from "@/components/app/BookingsCalendarView";
import { AttendanceAlert } from "@/components/app/AttendanceAlert";
import { getUsageStats } from "@/lib/subscription";
import {
  BOOKING_STATUS_COLORS,
  getStatusLabel,
  getEffectiveStatus,
} from "@/lib/constants/status";

export default async function BookingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [{ data: bookings }, usageStats] = await Promise.all([
    sanityFetch({ query: USER_BOOKINGS_QUERY, params: { clerkId: userId } }),
    getUsageStats(userId),
  ]);

  // Filter and sort upcoming bookings (earliest first)
  const upcomingBookings = bookings
    .filter(
      (b: { status: string; classSession: { startTime: string } }) =>
        b.status === "confirmed" && !isPast(new Date(b.classSession.startTime)),
    )
    .sort(
      (
        a: { classSession: { startTime: string } },
        b: { classSession: { startTime: string } },
      ) =>
        new Date(a.classSession.startTime).getTime() -
        new Date(b.classSession.startTime).getTime(),
    );

  // Filter and sort past bookings (most recent first)
  const pastBookings = bookings
    .filter(
      (b: { status: string; classSession: { startTime: string } }) =>
        b.status !== "confirmed" || isPast(new Date(b.classSession.startTime)),
    )
    .sort(
      (
        a: { classSession: { startTime: string } },
        b: { classSession: { startTime: string } },
      ) =>
        new Date(b.classSession.startTime).getTime() -
        new Date(a.classSession.startTime).getTime(),
    );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">My Bookings</h1>

        {/* Attendance Confirmation Alert */}
        <AttendanceAlert bookings={bookings} />

        {/* Usage Stats - we dont show this if the user is on the champion tier as they have unlimited classes */}
        {usageStats.tier !== "champion" && (
          <div className="rounded-lg border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Monthly Usage</h2>
            {usageStats.tier ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">
                    {usageStats.tier.charAt(0).toUpperCase() +
                      usageStats.tier.slice(1)}{" "}
                    Tier
                  </span>
                  <span className="font-medium">
                    {usageStats.limit === Infinity
                      ? `${usageStats.used} classes used`
                      : `${usageStats.used} / ${usageStats.limit} classes`}
                  </span>
                </div>
                {usageStats.limit !== Infinity && (
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(usageStats.used / usageStats.limit) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">
                <p>No active subscription</p>
                <Link
                  href="/#pricing"
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  View subscription plans →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
          <BookingsCalendarView bookings={bookings} />
        </section>

        {/* Upcoming Bookings */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Upcoming Classes</h2>
          {upcomingBookings.length === 0 ? (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">
              <p>No upcoming classes</p>
              <Link
                href="/classes"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Browse classes →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking: BookingType) => (
                <BookingCard key={booking._id} booking={booking} showActions />
              ))}
            </div>
          )}
        </section>

        {/* Past Bookings */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Past Classes</h2>
          {pastBookings.length === 0 ? (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">
              <p>No past classes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking: BookingType) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

interface BookingType {
  _id: string;
  status: string;
  createdAt: string;
  attendedAt?: string;
  cancelledAt?: string;
  classSession: {
    _id: string;
    startTime: string;
    activity: {
      _id: string;
      name: string;
      slug: { current: string };
      duration: number;
      image?: { asset: { _ref: string } };
    };
    venue: {
      _id: string;
      name: string;
      city?: string;
    };
  };
}

function BookingCard({
  booking,
  showActions,
}: {
  booking: BookingType;
  showActions: boolean;
}) {
  const sessionStart = new Date(booking.classSession.startTime);
  const sessionEnd = addHours(
    sessionStart,
    (booking.classSession.activity.duration || 60) / 60,
  );
  const attendanceWindowEnd = addHours(sessionEnd, 1); // 1 hour after class ends
  const now = new Date();

  const canConfirmAttendance =
    booking.status === "confirmed" &&
    isWithinInterval(now, { start: sessionStart, end: attendanceWindowEnd });

  // Get effective status (handles no-show, in-progress states)
  const effectiveStatus = getEffectiveStatus(
    booking.status,
    sessionStart,
    booking.classSession.activity.duration || 60,
  );

  return (
    <div className="group flex gap-4 rounded-lg border p-4 transition-colors hover:border-primary/50">
      {/* Clickable area linking to class */}
      <Link
        href={`/classes/${booking.classSession._id}`}
        className="flex min-w-0 flex-1 gap-4"
      >
        {/* Image */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          {booking.classSession.activity.image ? (
            <Image
              src={urlFor(booking.classSession.activity.image)
                .width(96)
                .height(96)
                .url()}
              alt={booking.classSession.activity.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
              {booking.classSession.activity.name}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${BOOKING_STATUS_COLORS[effectiveStatus] || BOOKING_STATUS_COLORS.confirmed}`}
            >
              {getStatusLabel(effectiveStatus)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.classSession.venue.name}
            {booking.classSession.venue.city &&
              ` • ${booking.classSession.venue.city}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(sessionStart, "EEE, MMM d")} at{" "}
            {format(sessionStart, "h:mm a")} •{" "}
            {booking.classSession.activity.duration} min
          </p>
        </div>
      </Link>

      {/* Actions */}
      {showActions && (
        <div className="flex shrink-0 flex-col gap-2">
          <BookingActions
            bookingId={booking._id}
            canConfirmAttendance={canConfirmAttendance}
            isPast={isPast(sessionStart)}
          />
        </div>
      )}
    </div>
  );
}
