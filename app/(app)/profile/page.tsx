import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPinIcon,
  TargetIcon,
  CrownIcon,
  UserIcon,
  Settings,
} from "lucide-react";
import { sanityFetch } from "@/sanity/lib/live";
import { getUserTierInfo } from "@/lib/subscription";
import { ProfileEditor } from "./ProfileEditor";
import { USER_PROFILE_WITH_PREFERENCES_QUERY } from "@/sanity/lib/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TIER_COLORS } from "@/lib/constants/subscription";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [{ data: userProfile }, tierInfo] = await Promise.all([
    sanityFetch({
      query: USER_PROFILE_WITH_PREFERENCES_QUERY,
      params: { clerkId: userId },
    }),
    getUserTierInfo(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* User Info Card */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                {userProfile?.imageUrl ? (
                  <Image
                    src={userProfile.imageUrl}
                    alt="Profile"
                    width={72}
                    height={72}
                    className="h-18 w-18 rounded-2xl object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-muted shadow-md">
                    <UserIcon className="h-9 w-9 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </h2>
                  <p className="text-muted-foreground">{userProfile?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <CrownIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Subscription</CardTitle>
                    <CardDescription>Your current plan</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${TIER_COLORS[tierInfo.tier || "none"]} capitalize border-0`}
                  >
                    {tierInfo.tier || "None"}
                  </Badge>
                  <Button asChild size="sm">
                    <Link href="/upgrade">
                      {tierInfo.tier ? "Manage" : "Upgrade"}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Location Preferences Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <MapPinIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Location Preferences
                  </CardTitle>
                  <CardDescription>Where we search for classes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProfileEditor
                initialLocation={
                  userProfile?.location?.lat != null &&
                  userProfile?.location?.lng != null &&
                  userProfile?.location?.address
                    ? {
                        lat: userProfile.location.lat,
                        lng: userProfile.location.lng,
                        address: userProfile.location.address,
                      }
                    : null
                }
                initialRadius={userProfile?.searchRadius ?? 10}
              />
            </CardContent>
          </Card>

          {/* Current Settings Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Current Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <MapPinIcon className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {userProfile?.location?.address || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <TargetIcon className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Search Radius</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {userProfile?.searchRadius
                        ? `${userProfile.searchRadius} km`
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
