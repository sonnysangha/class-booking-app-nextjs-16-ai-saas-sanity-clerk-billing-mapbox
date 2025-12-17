import { sanityFetch } from "@/sanity/lib/live";
import { SESSION_BY_ID_QUERY } from "@/sanity/lib/queries/sessions";
import { USER_SESSION_BOOKING_QUERY } from "@/sanity/lib/queries/bookings";
import { urlFor } from "@/sanity/lib/image";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookingButton } from "@/components/app/bookings/BookingButton";
import { VenueMap } from "@/components/app/maps/VenueMap";
import { PortableText } from "@portabletext/react";
import { getUserTierInfo } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import {
  ChevronRight,
  Calendar,
  Clock,
  User,
  Users,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIER_COLORS } from "@/lib/constants/subscription";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

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

  if (!session || !session.startTime) {
    notFound();
  }

  const maxCapacity = session.maxCapacity ?? 0;
  const spotsRemaining = maxCapacity - session.currentBookings;
  const isFullyBooked = spotsRemaining <= 0;
  const startDate = new Date(session.startTime);
  const activity = session.activity;
  const venue = session.venue;
  const tierLevel = activity?.tierLevel ?? "basic";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm">
          <Link
            href="/classes"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Classes
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">
            {activity?.name ?? "Class"}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
              {activity?.images?.[0] ? (
                <Image
                  src={urlFor(activity.images[0]).width(800).height(450).url()}
                  alt={activity.name ?? "Class"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              {/* Tier Badge */}
              {tierLevel && (
                <Badge
                  className={`absolute left-4 top-4 ${TIER_COLORS[tierLevel]} border-0 text-sm px-3 py-1`}
                >
                  {tierLevel.charAt(0).toUpperCase() + tierLevel.slice(1)} Tier
                </Badge>
              )}
            </div>

            {/* Image Gallery */}
            {activity?.images && activity.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {activity.images.slice(1).map((image, i) => {
                  if (!image.asset?._ref) return null;
                  return (
                    <div
                      key={image.asset._ref}
                      className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer"
                    >
                      <Image
                        src={urlFor(image).width(96).height(96).url()}
                        alt={`${activity.name ?? "Class"} ${i + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activity Details */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {activity?.name ?? "Unknown Class"}
              </h1>

              {activity?.description && (
                <div className="text-muted-foreground mb-6 prose prose-sm max-w-none dark:prose-invert">
                  <PortableText value={activity.description} />
                </div>
              )}

              {activity?.category && (
                <Badge variant="secondary" className="text-sm">
                  {activity.category.name}
                </Badge>
              )}
            </div>

            {/* Venue Card */}
            {venue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Venue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {venue.images?.[0] && (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                        <Image
                          src={urlFor(venue.images[0])
                            .width(96)
                            .height(96)
                            .url()}
                          alt={venue.name ?? "Venue"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {venue.name ?? "Venue"}
                      </h3>
                      {venue.address && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {venue.address.fullAddress ??
                            `${venue.address.street ?? ""}, ${venue.address.city ?? ""}`}
                        </p>
                      )}
                      {venue.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {venue.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amenities */}
                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {venue.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Location Map */}
            {venue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VenueMap
                    venue={{
                      name: venue.name ?? "Venue",
                      address:
                        venue.address?.lat != null && venue.address?.lng != null
                          ? {
                              lat: venue.address.lat,
                              lng: venue.address.lng,
                              fullAddress:
                                venue.address.fullAddress ?? undefined,
                              city: venue.address.city ?? undefined,
                            }
                          : null,
                    }}
                    className="aspect-video rounded-xl overflow-hidden"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-lg border-primary/10">
              <CardHeader className="pb-4">
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date & Time */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Date
                    </span>
                    <span className="font-semibold">
                      {format(startDate, "EEE, MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Time
                    </span>
                    <span className="font-semibold">
                      {format(startDate, "h:mm a")}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {/* Duration & Instructor */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Duration
                    </span>
                    <span className="font-semibold">
                      {activity?.duration ?? 60} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      Instructor
                    </span>
                    <span className="font-semibold">
                      {activity?.instructor ?? "TBA"}
                    </span>
                  </div>
                </div>

                {/* Availability */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Spots
                    </span>
                    <span
                      className={`font-semibold ${isFullyBooked ? "text-destructive" : "text-primary"}`}
                    >
                      {isFullyBooked
                        ? "Fully Booked"
                        : `${spotsRemaining} of ${maxCapacity} available`}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isFullyBooked ? "bg-destructive" : "bg-primary"}`}
                      style={{
                        width: `${maxCapacity > 0 ? (session.currentBookings / maxCapacity) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Booking Button */}
                <div className="pt-2">
                  <BookingButton
                    sessionId={session._id}
                    tierLevel={activity?.tierLevel ?? "basic"}
                    isFullyBooked={isFullyBooked}
                    userTier={userTier}
                    existingBookingId={existingBooking?._id ?? null}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
