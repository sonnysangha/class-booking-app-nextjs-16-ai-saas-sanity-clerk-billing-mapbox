import { defineQuery } from "next-sanity";

// Get all upcoming class sessions with activity and venue details
export const UPCOMING_SESSIONS_QUERY = defineQuery(`*[
  _type == "classSession"
  && startTime > now()
  && status == "scheduled"
] | order(startTime asc) {
  _id,
  startTime,
  maxCapacity,
  status,
  "currentBookings": count(*[
    _type == "booking" 
    && classSession._ref == ^._id 
    && status == "confirmed"
  ]),
  activity->{
    _id,
    name,
    slug,
    instructor,
    duration,
    tierLevel,
    "image": images[0]
  },
  venue->{
    _id,
    name,
    slug,
    "city": address.city,
    address {
      lat,
      lng,
      fullAddress
    }
  }
}`);

// Get a single session by ID
export const SESSION_BY_ID_QUERY = defineQuery(`*[
  _type == "classSession"
  && _id == $sessionId
][0]{
  _id,
  startTime,
  maxCapacity,
  status,
  "currentBookings": count(*[
    _type == "booking" 
    && classSession._ref == ^._id 
    && status == "confirmed"
  ]),
  activity->{
    _id,
    name,
    slug,
    instructor,
    duration,
    tierLevel,
    description,
    images,
    category->{
      _id,
      name,
      slug
    }
  },
  venue->{
    _id,
    name,
    slug,
    description,
    images,
    address,
    amenities
  }
}`);

// Get all sessions for a specific activity
export const SESSIONS_BY_ACTIVITY_QUERY = defineQuery(`*[
  _type == "classSession"
  && activity._ref == $activityId
  && startTime > now()
  && status == "scheduled"
] | order(startTime asc) {
  _id,
  startTime,
  maxCapacity,
  status,
  "currentBookings": count(*[
    _type == "booking" 
    && classSession._ref == ^._id 
    && status == "confirmed"
  ]),
  venue->{
    _id,
    name,
    slug,
    "city": address.city
  }
}`);

// Get sessions with optional filters (venue, category, tier)
// All filters are optional - pass empty string/array to skip that filter
export const FILTERED_SESSIONS_QUERY = defineQuery(`*[
  _type == "classSession"
  && startTime > now()
  && status == "scheduled"
  && ($venueId == "" || venue._ref == $venueId)
  && (count($categoryIds) == 0 || activity->category._ref in $categoryIds)
  && (count($tierLevels) == 0 || activity->tierLevel in $tierLevels)
] | order(startTime asc) {
  _id,
  startTime,
  maxCapacity,
  status,
  "currentBookings": count(*[
    _type == "booking" 
    && classSession._ref == ^._id 
    && status == "confirmed"
  ]),
  activity->{
    _id,
    name,
    slug,
    instructor,
    duration,
    tierLevel,
    "image": images[0],
    category->{
      _id,
      name,
      slug
    }
  },
  venue->{
    _id,
    name,
    slug,
    "city": address.city,
    address {
      lat,
      lng,
      fullAddress
    }
  }
}`);

// Search sessions by activity name or instructor name
export const SEARCH_SESSIONS_QUERY = defineQuery(`*[
  _type == "classSession"
  && startTime > now()
  && status == "scheduled"
  && (
    activity->name match $searchTerm + "*"
    || activity->instructor match $searchTerm + "*"
  )
] | order(startTime asc) {
  _id,
  startTime,
  maxCapacity,
  status,
  "currentBookings": count(*[
    _type == "booking" 
    && classSession._ref == ^._id 
    && status == "confirmed"
  ]),
  activity->{
    _id,
    name,
    slug,
    instructor,
    duration,
    tierLevel,
    "image": images[0]
  },
  venue->{
    _id,
    name,
    slug,
    "city": address.city,
    address {
      lat,
      lng,
      fullAddress
    }
  }
}`);
