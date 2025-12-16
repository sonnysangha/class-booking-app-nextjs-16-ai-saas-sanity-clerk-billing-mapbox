import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPinIcon, TargetIcon, CrownIcon, UserIcon } from "lucide-react";
import { sanityFetch } from "@/sanity/lib/live";
import { getUserTierInfo } from "@/lib/subscription";
import { ProfileEditor } from "./ProfileEditor";
import { USER_PROFILE_WITH_PREFERENCES_QUERY } from "@/sanity/lib/queries";

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

  const tierColors: Record<string, string> = {
    none: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    basic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    performance:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    champion:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold">Profile</h1>

          <div className="space-y-6">
            {/* User Info Card */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-4">
                {userProfile?.imageUrl ? (
                  <img
                    src={userProfile.imageUrl}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </h2>
                  <p className="text-muted-foreground">{userProfile?.email}</p>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900">
                    <CrownIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Subscription</h3>
                    <p className="text-sm text-muted-foreground">
                      Your current plan
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                      tierColors[tierInfo.tier || "none"]
                    }`}
                  >
                    {tierInfo.tier || "None"}
                  </span>
                  <Link
                    href="/upgrade"
                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                  >
                    {tierInfo.tier ? "Manage" : "Upgrade"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Location Preferences Card */}
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900">
                  <MapPinIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Location Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    Where we search for classes
                  </p>
                </div>
              </div>

              <ProfileEditor
                initialLocation={userProfile?.location || null}
                initialRadius={userProfile?.searchRadius || 10}
              />
            </div>

            {/* Current Settings Display */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-semibold">Current Settings</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <MapPinIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.location?.address || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <TargetIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Search Radius</p>
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.searchRadius
                        ? `${userProfile.searchRadius} km`
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
