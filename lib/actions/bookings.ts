"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import {
  getUserTier,
  canAccessClass,
  getRemainingBookings,
} from "@/lib/subscription";
import type { Tier } from "@/lib/subscription";
import {
  SESSION_FOR_BOOKING_QUERY,
  EXISTING_BOOKING_QUERY,
  BOOKING_FOR_CANCEL_QUERY,
  BOOKING_FOR_ATTENDANCE_QUERY,
  CANCELLED_BOOKING_QUERY,
  USER_PROFILE_ID_QUERY,
} from "@/sanity/lib/queries/bookings";
import { getOrCreateUserProfile } from "@/lib/utils/user-profile";

export type BookingResult = {
  success: boolean;
  message?: string;
  error?: string;
  bookingId?: string;
  upgradeRequired?: boolean;
  requiredTier?: string;
  limitReached?: boolean;
};

export async function createBooking(sessionId: string): Promise<BookingResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!sessionId) {
      return { success: false, error: "Session ID is required" };
    }

    // Fetch session details
    const session = await client.fetch(SESSION_FOR_BOOKING_QUERY, {
      sessionId,
    });

    if (!session) {
      return { success: false, error: "Class session not found" };
    }

    // Check if session is in the past
    if (!session.startTime || new Date(session.startTime) < new Date()) {
      return {
        success: false,
        error: "Cannot book a class that has already started",
      };
    }

    // Check if session is scheduled
    if (session.status !== "scheduled") {
      return {
        success: false,
        error: "This class is not available for booking",
      };
    }

    // Check capacity
    const maxCapacity = session.maxCapacity ?? 0;
    if (session.currentBookings >= maxCapacity) {
      return { success: false, error: "This class is fully booked" };
    }

    // Get or create user profile
    const userProfileId = await getOrCreateUserProfile(userId);

    // Check if user already has a booking for this session
    const existingBooking = await client.fetch(EXISTING_BOOKING_QUERY, {
      userProfileId,
      sessionId,
    });

    if (existingBooking) {
      return {
        success: false,
        error: "You already have a booking for this class",
      };
    }

    // Get user's tier
    const userTier = await getUserTier();

    if (!userTier) {
      return {
        success: false,
        error: "You need an active subscription to book classes",
        upgradeRequired: true,
      };
    }

    // Check tier access
    const activityTier = (session.activity?.tierLevel ?? "basic") as Tier;
    if (!canAccessClass(userTier, activityTier)) {
      return {
        success: false,
        error: `This class requires ${activityTier} tier or higher. Upgrade to access.`,
        upgradeRequired: true,
        requiredTier: activityTier,
      };
    }

    // Check monthly limit
    const remaining = await getRemainingBookings(userId);
    if (remaining <= 0) {
      return {
        success: false,
        error:
          "You've reached your monthly booking limit. Upgrade for more classes.",
        upgradeRequired: true,
        limitReached: true,
      };
    }

    // Check if there's a cancelled booking for this session that we can reactivate
    const cancelledBooking = await client.fetch(CANCELLED_BOOKING_QUERY, {
      userProfileId,
      sessionId,
    });

    let bookingId: string;

    if (cancelledBooking) {
      // Reactivate the cancelled booking
      await writeClient
        .patch(cancelledBooking._id)
        .set({
          status: "confirmed",
          cancelledAt: null,
        })
        .commit();
      bookingId = cancelledBooking._id;
    } else {
      // Create new booking
      const booking = await writeClient.create({
        _type: "booking",
        user: {
          _type: "reference",
          _ref: userProfileId,
        },
        classSession: {
          _type: "reference",
          _ref: sessionId,
        },
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });
      bookingId = booking._id;
    }

    revalidatePath("/bookings");
    revalidatePath("/classes");

    return {
      success: true,
      bookingId,
      message: "Class booked successfully!",
    };
  } catch (error) {
    console.error("Booking error:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

export async function cancelBooking(bookingId: string): Promise<BookingResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!bookingId) {
      return { success: false, error: "Booking ID is required" };
    }

    // Get user profile
    const userProfile = await client.fetch(USER_PROFILE_ID_QUERY, {
      clerkId: userId,
    });

    if (!userProfile) {
      return { success: false, error: "User profile not found" };
    }

    // Verify booking belongs to user
    const booking = await client.fetch(BOOKING_FOR_CANCEL_QUERY, {
      bookingId,
      userProfileId: userProfile._id,
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Check if already cancelled
    if (booking.status === "cancelled") {
      return { success: false, error: "Booking is already cancelled" };
    }

    // Check if class has already started
    const startTime = booking.classSession?.startTime;
    if (!startTime || new Date(startTime) < new Date()) {
      return {
        success: false,
        error: "Cannot cancel a class that has already started",
      };
    }

    // Update booking status
    await writeClient
      .patch(bookingId)
      .set({
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      })
      .commit();

    revalidatePath("/bookings");
    revalidatePath("/classes");

    return { success: true, message: "Booking cancelled successfully" };
  } catch (error) {
    console.error("Cancel booking error:", error);
    return { success: false, error: "Failed to cancel booking" };
  }
}

export async function confirmAttendance(
  bookingId: string
): Promise<BookingResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user profile
    const userProfile = await client.fetch(USER_PROFILE_ID_QUERY, {
      clerkId: userId,
    });

    if (!userProfile) {
      return { success: false, error: "User profile not found" };
    }

    // Fetch booking with session details
    const booking = await client.fetch(BOOKING_FOR_ATTENDANCE_QUERY, {
      bookingId,
      userProfileId: userProfile._id,
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.status !== "confirmed") {
      return {
        success: false,
        error: "Cannot confirm attendance for this booking",
      };
    }

    const classStartTime = booking.classSession?.startTime;
    if (!classStartTime) {
      return { success: false, error: "Invalid session data" };
    }
    const sessionStart = new Date(classStartTime);
    const sessionDuration = booking.classSession?.activity?.duration ?? 60;
    const sessionEndMs = sessionStart.getTime() + sessionDuration * 60 * 1000;
    const attendanceWindowEndMs = sessionEndMs + 60 * 60 * 1000; // 1 hour after session ends
    const now = new Date();
    const nowMs = now.getTime();

    // Check if within attendance window (session start to 1 hour after session end)
    if (nowMs < sessionStart.getTime()) {
      return {
        success: false,
        error: "Class hasn't started yet. Check in when the class begins.",
      };
    }

    if (nowMs > attendanceWindowEndMs) {
      return { success: false, error: "Attendance window has closed" };
    }

    // Update booking to attended
    await writeClient
      .patch(bookingId)
      .set({
        status: "attended",
        attendedAt: now.toISOString(),
      })
      .commit();

    revalidatePath("/bookings");

    return { success: true, message: "Attendance confirmed!" };
  } catch (error) {
    console.error("Attendance error:", error);
    return { success: false, error: "Failed to confirm attendance" };
  }
}
