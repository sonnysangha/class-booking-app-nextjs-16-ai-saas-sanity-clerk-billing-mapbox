import { defineQuery } from "next-sanity";

// ============================================
// User Profile Queries
// ============================================

export const USER_PROFILE_BY_CLERK_ID_QUERY = defineQuery(`*[
  _type == "userProfile" 
  && clerkId == $clerkId
][0]{ 
  _id 
}`);

// ============================================
// Booking Queries (Server Actions)
// ============================================

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

export const EXISTING_BOOKING_QUERY = defineQuery(`*[
  _type == "booking" 
  && user._ref == $userProfileId 
  && classSession._ref == $sessionId
  && status in ["confirmed", "attended"]
][0]`);

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

// ============================================
// Usage/Subscription Queries
// ============================================

export const MONTHLY_BOOKING_COUNT_QUERY = defineQuery(`count(*[
  _type == "booking" 
  && user->clerkId == $userId 
  && status in ["confirmed", "attended"]
  && classSession->startTime >= $monthStart
  && classSession->startTime < $monthEnd
])`);

// ============================================
// AI Tool Queries
// ============================================

export const AI_SEARCH_ACTIVITIES_QUERY = defineQuery(`*[
  _type == "activity"
] | order(name asc) [0...20] {
  _id,
  name,
  instructor,
  duration,
  tierLevel,
  category->{name}
}`);

export const AI_SEARCH_SESSIONS_QUERY = defineQuery(`*[
  _type == "classSession" 
  && startTime > now() 
  && status == "scheduled"
] | order(startTime asc) [0...10] {
  _id,
  startTime,
  maxCapacity,
  "currentBookings": count(*[_type == "booking" && classSession._ref == ^._id && status == "confirmed"]),
  activity->{name, instructor, duration, tierLevel},
  venue->{name, "city": address.city}
}`);

export const AI_VENUES_QUERY = defineQuery(`*[
  _type == "venue"
] | order(name asc) [0...10] {
  _id,
  name,
  description,
  address,
  amenities
}`);

export const AI_CATEGORIES_QUERY = defineQuery(`*[
  _type == "category"
] | order(name asc) {
  _id,
  name,
  description
}`);
