import { auth } from "@clerk/nextjs/server";
import { sanityFetch } from "@/sanity/lib/live";
import { USER_BOOKINGS_QUERY } from "@/sanity/lib/queries/bookings";
import { urlFor } from "@/sanity/lib/image";
import { format, isPast, addHours, isWithinInterval } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookingActions } from "@/components/app/BookingActions";
import { getUsageStats } from "@/lib/subscription";

export default async function BookingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [{ data: bookings }, usageStats] = await Promise.all([
    sanityFetch({ query: USER_BOOKINGS_QUERY, params: { clerkId: userId } }),
    getUsageStats(userId),
  ]);

  const upcomingBookings = bookings.filter(
    (b: { status: string; classSession: { startTime: string } }) =>
      b.status === "confirmed" && !isPast(new Date(b.classSession.startTime)),
  );

  const pastBookings = bookings.filter(
    (b: { status: string; classSession: { startTime: string } }) =>
      b.status !== "confirmed" || isPast(new Date(b.classSession.startTime)),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            ClassPass Clone
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/classes"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Classes
            </Link>
            <Link
              href="/map"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Map
            </Link>
            <Link href="/bookings" className="text-sm font-medium">
              My Bookings
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {/* Usage Stats */}
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
  const attendanceWindowEnd = addHours(sessionEnd, 1);
  const now = new Date();

  const canConfirmAttendance =
    booking.status === "confirmed" &&
    isWithinInterval(now, { start: sessionStart, end: attendanceWindowEnd });

  const statusColors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    attended: "bg-blue-100 text-blue-800",
    cancelled: "bg-gray-100 text-gray-800",
    noShow: "bg-red-100 text-red-800",
  };

  return (
    <div className="rounded-lg border p-4 flex gap-4 group hover:border-primary/50 transition-colors">
      {/* Clickable area linking to class */}
      <Link
        href={`/classes/${booking.classSession._id}`}
        className="flex gap-4 flex-1 min-w-0"
      >
        {/* Image */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
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
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {booking.classSession.activity.name}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${statusColors[booking.status] || statusColors.confirmed}`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
        <div className="shrink-0 flex flex-col gap-2">
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
