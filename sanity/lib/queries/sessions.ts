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

// Get sessions with optional filters (venue, category, tier) within a geographic bounding box
//
// BOUNDING BOX FILTERING ($minLat, $maxLat, $minLng, $maxLng):
// These params define a rectangular geographic area around the user's location.
// By filtering at the database level, we avoid fetching 100k+ global sessions
// and instead return only ~100-500 sessions in the user's area.
// The client then uses Haversine distance for precise circular radius filtering.
//
// Other filters are optional - pass empty string/array to skip
export const FILTERED_SESSIONS_QUERY = defineQuery(`*[
  _type == "classSession"
  && startTime > now()
  && status == "scheduled"
  // Bounding box: only fetch sessions where venue is within the geographic rectangle
  && venue->address.lat >= $minLat
  && venue->address.lat <= $maxLat
  && venue->address.lng >= $minLng
  && venue->address.lng <= $maxLng
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

// Search sessions by activity name or instructor name within a geographic bounding box
// Same bounding box approach as FILTERED_SESSIONS_QUERY - search is scoped to user's area
export const SEARCH_SESSIONS_QUERY = defineQuery(`*[
  _type == "classSession"
  && startTime > now()
  && status == "scheduled"
  // Bounding box: scope search results to user's geographic area
  && venue->address.lat >= $minLat
  && venue->address.lat <= $maxLat
  && venue->address.lng >= $minLng
  && venue->address.lng <= $maxLng
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
