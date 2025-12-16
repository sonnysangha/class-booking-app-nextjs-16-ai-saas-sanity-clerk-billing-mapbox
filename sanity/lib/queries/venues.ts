import { defineQuery } from "next-sanity";

// Get all venues with location data
export const VENUES_QUERY = defineQuery(`*[
  _type == "venue"
] | order(name asc) {
  _id,
  name,
  slug,
  description,
  "image": images[0],
  address,
  amenities
}`);

// Get a single venue by slug
export const VENUE_BY_SLUG_QUERY = defineQuery(`*[
  _type == "venue"
  && slug.current == $slug
][0]{
  _id,
  name,
  slug,
  description,
  images,
  address,
  amenities,
  openingHours
}`);

// Get venue name by ID (for filter display)
export const VENUE_NAME_BY_ID_QUERY = defineQuery(`*[
  _type == "venue"
  && _id == $venueId
][0]{
  _id,
  name
}`);

// Get venues with upcoming sessions count (for map)
export const VENUES_WITH_SESSIONS_QUERY = defineQuery(`*[
  _type == "venue"
  && count(*[
    _type == "classSession"
    && venue._ref == ^._id
    && startTime > now()
    && status == "scheduled"
  ]) > 0
] {
  _id,
  name,
  slug,
  "address": address {
    lat,
    lng,
    fullAddress,
    city
  },
  "upcomingSessionsCount": count(*[
    _type == "classSession"
    && venue._ref == ^._id
    && startTime > now()
    && status == "scheduled"
  ])
}`);
