"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import { sanityFetch } from "@/sanity/lib/live";

const USER_PROFILE_BY_CLERK_ID_QUERY = `*[_type == "userProfile" && clerkId == $clerkId][0]{
  _id,
  location,
  searchRadius
}`;

export type ProfileResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export type LocationData = {
  lat: number;
  lng: number;
  address: string;
};

export type ProfilePreferences = {
  location: LocationData;
  searchRadius: number;
};

// Get or create user profile and return its ID
async function getOrCreateUserProfile(clerkUserId: string): Promise<string> {
  const existingProfile = await client.fetch(USER_PROFILE_BY_CLERK_ID_QUERY, {
    clerkId: clerkUserId,
  });

  if (existingProfile) {
    return existingProfile._id;
  }

  // Fetch user details from Clerk
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(clerkUserId);

  // Create new user profile
  const newProfile = await writeClient.create({
    _type: "userProfile",
    clerkId: clerkUserId,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    subscriptionTier: "none",
    createdAt: new Date().toISOString(),
  });

  return newProfile._id;
}

// Complete onboarding - save preferences and set Clerk metadata
export async function completeOnboarding(
  preferences: ProfilePreferences
): Promise<ProfileResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { location, searchRadius } = preferences;

    if (!location || !location.lat || !location.lng || !location.address) {
      return { success: false, error: "Location is required" };
    }

    if (!searchRadius || searchRadius < 1) {
      return { success: false, error: "Search radius is required" };
    }

    // Get or create user profile
    const userProfileId = await getOrCreateUserProfile(userId);

    // Update Sanity profile with location preferences
    await writeClient
      .patch(userProfileId)
      .set({
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        },
        searchRadius,
      })
      .commit();

    // Update Clerk metadata to mark onboarding as complete
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        hasOnboarded: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/classes");
    revalidatePath("/profile");

    return { success: true, message: "Onboarding completed!" };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { success: false, error: "Failed to complete onboarding" };
  }
}

// Update location preferences (from profile page)
export async function updateLocationPreferences(
  preferences: ProfilePreferences
): Promise<ProfileResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { location, searchRadius } = preferences;

    if (!location || !location.lat || !location.lng || !location.address) {
      return { success: false, error: "Location is required" };
    }

    if (!searchRadius || searchRadius < 1) {
      return { success: false, error: "Search radius is required" };
    }

    // Get user profile
    const userProfile = await client.fetch(USER_PROFILE_BY_CLERK_ID_QUERY, {
      clerkId: userId,
    });

    if (!userProfile) {
      return { success: false, error: "User profile not found" };
    }

    // Update Sanity profile
    await writeClient
      .patch(userProfile._id)
      .set({
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        },
        searchRadius,
      })
      .commit();

    revalidatePath("/");
    revalidatePath("/classes");
    revalidatePath("/profile");

    return { success: true, message: "Preferences updated!" };
  } catch (error) {
    console.error("Update preferences error:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}

// Get user's location preferences
export async function getUserPreferences(): Promise<ProfilePreferences | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const userProfile = await sanityFetch({
      query: USER_PROFILE_BY_CLERK_ID_QUERY,
      params: { clerkId: userId },
    });

    if (!userProfile.data?.location || !userProfile.data?.searchRadius) {
      return null;
    }

    return {
      location: userProfile.data.location,
      searchRadius: userProfile.data.searchRadius,
    };
  } catch (error) {
    console.error("Get preferences error:", error);
    return null;
  }
}

// Redirect after onboarding completion
export async function redirectAfterOnboarding() {
  redirect("/");
}
