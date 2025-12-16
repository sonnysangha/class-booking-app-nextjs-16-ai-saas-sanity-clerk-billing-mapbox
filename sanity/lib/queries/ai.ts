import { defineQuery } from "next-sanity";

// Search activities for AI tools
export const AI_SEARCH_ACTIVITIES_QUERY = defineQuery(`*[
  _type == "activity"
] | order(name asc) [0...20] {
  _id,
  name,
  instructor,
  duration,
  tierLevel,
  aiKeywords,
  category->{name}
}`);

// Get upcoming sessions for a class name
export const AI_CLASS_SESSIONS_QUERY = defineQuery(`*[
  _type == "classSession"
  && startTime > now()
  && status == "scheduled"
] | order(startTime asc) [0...10] {
  _id,
  startTime,
  maxCapacity,
  "currentBookings": count(*[
    _type == "booking"
    && classSession._ref == ^._id
    && status == "confirmed"
  ]),
  activity->{
    name,
    instructor,
    duration,
    tierLevel
  },
  venue->{
    name,
    "city": address.city
  }
}`);

// Search venues for AI tools
export const AI_SEARCH_VENUES_QUERY = defineQuery(`*[
  _type == "venue"
] | order(name asc) [0...10] {
  _id,
  name,
  description,
  address,
  amenities
}`);

// Get all categories for AI tools
export const AI_CATEGORIES_QUERY = defineQuery(`*[
  _type == "category"
] | order(name asc) {
  _id,
  name,
  description
}`);

// Get user's upcoming bookings for AI tools
export const AI_USER_UPCOMING_BOOKINGS_QUERY = defineQuery(`*[
  _type == "booking"
  && user->clerkId == $clerkId
  && status == "confirmed"
  && classSession->startTime > now()
] | order(classSession->startTime asc) [0...10] {
  _id,
  status,
  createdAt,
  classSession->{
    _id,
    startTime,
    activity->{
      name,
      instructor,
      duration
    },
    venue->{
      name,
      "city": address.city
    }
  }
}`);

// Get user's all bookings (including past) for AI tools
export const AI_USER_ALL_BOOKINGS_QUERY = defineQuery(`*[
  _type == "booking"
  && user->clerkId == $clerkId
] | order(classSession->startTime desc) [0...15] {
  _id,
  status,
  createdAt,
  attendedAt,
  classSession->{
    _id,
    startTime,
    activity->{
      name,
      instructor,
      duration
    },
    venue->{
      name,
      "city": address.city
    }
  }
}`);

// Get user's past bookings for AI tools
export const AI_USER_PAST_BOOKINGS_QUERY = defineQuery(`*[
  _type == "booking"
  && user->clerkId == $clerkId
  && (status == "attended" || status == "noShow" || classSession->startTime < now())
] | order(classSession->startTime desc) [0...10] {
  _id,
  status,
  attendedAt,
  classSession->{
    _id,
    startTime,
    activity->{
      name,
      instructor,
      duration
    },
    venue->{
      name,
      "city": address.city
    }
  }
}`);
