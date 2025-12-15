import { defineQuery } from "next-sanity";

// Get all categories
export const CATEGORIES_QUERY = defineQuery(`*[
  _type == "category"
] | order(name asc) {
  _id,
  name,
  slug,
  description,
  icon
}`);
