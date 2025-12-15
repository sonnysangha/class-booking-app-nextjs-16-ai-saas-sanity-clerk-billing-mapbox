import { defineQuery } from "next-sanity";

// Get user's bookings by Clerk ID
export const USER_BOOKINGS_QUERY = defineQuery(`*[
  _type == "booking"
  && user->clerkId == $clerkId
] | order(classSession->startTime desc) {
  _id,
  status,
  createdAt,
  attendedAt,
  cancelledAt,
  user->{
    _id,
    firstName,
    lastName,
    email
  },
  classSession->{
    _id,
    startTime,
    activity->{
      _id,
      name,
      slug,
      duration,
      "image": images[0]
    },
    venue->{
      _id,
      name,
      "city": address.city
    }
  }
}`);

// Get user's upcoming bookings by Clerk ID
export const USER_UPCOMING_BOOKINGS_QUERY = defineQuery(`*[
  _type == "booking"
  && user->clerkId == $clerkId
  && status == "confirmed"
  && classSession->startTime > now()
] | order(classSession->startTime asc) {
  _id,
  status,
  createdAt,
  classSession->{
    _id,
    startTime,
    activity->{
      _id,
      name,
      slug,
      duration,
      "image": images[0]
    },
    venue->{
      _id,
      name,
      "city": address.city
    }
  }
}`);

// Get user profile by Clerk ID
export const USER_PROFILE_BY_CLERK_ID_QUERY = defineQuery(`*[
  _type == "userProfile"
  && clerkId == $clerkId
][0]{
  _id,
  clerkId,
  email,
  firstName,
  lastName,
  imageUrl,
  subscriptionTier,
  createdAt
}`);

// Get user profile with location preferences (for profile page)
export const USER_PROFILE_WITH_PREFERENCES_QUERY = defineQuery(`*[
  _type == "userProfile"
  && clerkId == $clerkId
][0]{
  _id,
  firstName,
  lastName,
  email,
  imageUrl,
  location,
  searchRadius,
  subscriptionTier
}`);

// Get user profile ID by Clerk ID (minimal query)
export const USER_PROFILE_ID_QUERY = defineQuery(`*[
  _type == "userProfile"
  && clerkId == $clerkId
][0]{ _id }`);

// Check existing booking for a session
export const EXISTING_BOOKING_QUERY = defineQuery(`*[
  _type == "booking" 
  && user._ref == $userProfileId 
  && classSession._ref == $sessionId
  && status in ["confirmed", "attended"]
][0]{ _id }`);

// Get session for booking validation
export const SESSION_FOR_BOOKING_QUERY = defineQuery(`*[
  _type == "classSession"
  && _id == $sessionId
][0]{
  _id,
  startTime,
  maxCapacity,
  status,
  activity->{
    _id,
    tierLevel
  },
  "currentBookings": count(*[
    _type == "booking" 
    && classSession._ref == ^._id 
    && status == "confirmed"
  ])
}`);

// Get booking for cancellation
export const BOOKING_FOR_CANCEL_QUERY = defineQuery(`*[
  _type == "booking"
  && _id == $bookingId
  && user._ref == $userProfileId
][0]{
  _id,
  status,
  classSession->{
    startTime
  }
}`);

// Get booking for attendance confirmation
export const BOOKING_FOR_ATTENDANCE_QUERY = defineQuery(`*[
  _type == "booking" 
  && _id == $bookingId 
  && user._ref == $userProfileId
][0]{
  _id,
  status,
  classSession->{
    _id,
    startTime,
    activity->{
      duration
    }
  }
}`);

// Count monthly bookings for usage tracking
// Includes: confirmed (upcoming), attended (completed), noShow (missed but still counts)
// Excludes: cancelled (refunded, doesn't count toward usage)
export const MONTHLY_BOOKINGS_COUNT_QUERY = defineQuery(`count(*[
  _type == "booking" 
  && user->clerkId == $userId 
  && status in ["confirmed", "attended", "noShow"]
  && classSession->startTime >= $monthStart
  && classSession->startTime < $monthEnd
])`);

// Check if user has already booked a specific session (by clerkId)
export const USER_SESSION_BOOKING_QUERY = defineQuery(`*[
  _type == "booking"
  && user->clerkId == $clerkId
  && classSession._ref == $sessionId
  && status in ["confirmed", "attended"]
][0]{
  _id,
  status
}`);

// Find cancelled booking for a session (to reactivate instead of creating new)
export const CANCELLED_BOOKING_QUERY = defineQuery(`*[
  _type == "booking"
  && user._ref == $userProfileId
  && classSession._ref == $sessionId
  && status == "cancelled"
][0]{ _id }`);

// Get user's booked session IDs (for showing booked status on session cards)
export const USER_BOOKED_SESSION_IDS_QUERY = defineQuery(`*[
  _type == "booking"
  && user->clerkId == $clerkId
  && status == "confirmed"
  && classSession->startTime > now()
].classSession._ref`);
