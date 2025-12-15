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
