import { sanityFetch } from "@/sanity/lib/live";
import { SESSION_BY_ID_QUERY } from "@/sanity/lib/queries/sessions";
import { USER_SESSION_BOOKING_QUERY } from "@/sanity/lib/queries/bookings";
import { urlFor } from "@/sanity/lib/image";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookingButton } from "@/components/app/BookingButton";
import { VenueMap } from "@/components/app/VenueMap";
import { PortableText } from "@portabletext/react";
import { getUserTierInfo } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

const tierColors: Record<string, string> = {
  basic: "bg-green-100 text-green-800",
  performance: "bg-blue-100 text-blue-800",
  champion: "bg-purple-100 text-purple-800",
};

export default async function ClassDetailPage({ params }: PageProps) {
  const { sessionId } = await params;
  const { userId } = await auth();

  const [{ data: session }, { tier: userTier }, { data: existingBooking }] =
    await Promise.all([
      sanityFetch({
        query: SESSION_BY_ID_QUERY,
        params: { sessionId },
      }),
      getUserTierInfo(),
      userId
        ? sanityFetch({
            query: USER_SESSION_BOOKING_QUERY,
            params: { clerkId: userId, sessionId },
          })
        : Promise.resolve({ data: null }),
    ]);

  if (!session) {
    notFound();
  }

  const spotsRemaining = session.maxCapacity - session.currentBookings;
  const isFullyBooked = spotsRemaining <= 0;
  const startDate = new Date(session.startTime);

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
            <Link
              href="/bookings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              My Bookings
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link
            href="/classes"
            className="text-muted-foreground hover:text-foreground"
          >
            Classes
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span>{session.activity.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-6">
              {session.activity.images?.[0] ? (
                <Image
                  src={urlFor(session.activity.images[0])
                    .width(800)
                    .height(450)
                    .url()}
                  alt={session.activity.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {session.activity.images && session.activity.images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {session.activity.images
                  .slice(1)
                  .map((image: { asset: { _ref: string } }, i: number) => (
                    <div
                      key={image.asset._ref}
                      className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0"
                    >
                      <Image
                        src={urlFor(image).width(96).height(96).url()}
                        alt={`${session.activity.name} ${i + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
              </div>
            )}

            {/* Activity Details */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold">{session.activity.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tierColors[session.activity.tierLevel] || tierColors.basic
                  }`}
                >
                  {session.activity.tierLevel.charAt(0).toUpperCase() +
                    session.activity.tierLevel.slice(1)}
                </span>
              </div>

              {session.activity.description && (
                <div className="text-muted-foreground mb-4 prose prose-sm max-w-none">
                  <PortableText value={session.activity.description} />
                </div>
              )}

              {session.activity.category && (
                <span className="inline-block px-3 py-1 rounded-full bg-muted text-sm">
                  {session.activity.category.name}
                </span>
              )}
            </div>

            {/* Venue Details */}
            <div className="rounded-lg border p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Venue</h2>
              <div className="flex gap-4">
                {session.venue.images?.[0] && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image
                      src={urlFor(session.venue.images[0])
                        .width(96)
                        .height(96)
                        .url()}
                      alt={session.venue.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{session.venue.name}</h3>
                  {session.venue.address && (
                    <p className="text-sm text-muted-foreground">
                      {session.venue.address.fullAddress ||
                        `${session.venue.address.street}, ${session.venue.address.city}`}
                    </p>
                  )}
                  {session.venue.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {session.venue.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {session.venue.amenities &&
                session.venue.amenities.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.venue.amenities.map((amenity: string) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 rounded-full bg-muted text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Location Map */}
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <VenueMap
                venue={{
                  name: session.venue.name,
                  address: session.venue.address,
                }}
                className="aspect-video"
              />
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Session Details</h2>

              {/* Date & Time */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {format(startDate, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">
                    {format(startDate, "h:mm a")}
                  </span>
                </div>
              </div>

              {/* Duration & Instructor */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {session.activity.duration} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Instructor</span>
                  <span className="font-medium">
                    {session.activity.instructor}
                  </span>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Spots</span>
                  <span
                    className={`font-medium ${isFullyBooked ? "text-red-600" : ""}`}
                  >
                    {isFullyBooked
                      ? "Fully Booked"
                      : `${spotsRemaining} of ${session.maxCapacity} available`}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${isFullyBooked ? "bg-red-500" : "bg-primary"}`}
                    style={{
                      width: `${(session.currentBookings / session.maxCapacity) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Booking Button */}
              <BookingButton
                sessionId={session._id}
                tierLevel={session.activity.tierLevel}
                isFullyBooked={isFullyBooked}
                userTier={userTier}
                existingBookingId={existingBooking?._id ?? null}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
