import { defineQuery } from "next-sanity";

// Get all activities
export const ACTIVITIES_QUERY = defineQuery(`*[
  _type == "activity"
] | order(name asc) {
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
}`);

// Get a single activity by slug
export const ACTIVITY_BY_SLUG_QUERY = defineQuery(`*[
  _type == "activity"
  && slug.current == $slug
][0]{
  _id,
  name,
  slug,
  instructor,
  duration,
  tierLevel,
  description,
  images,
  price,
  aiKeywords,
  category->{
    _id,
    name,
    slug
  }
}`);
