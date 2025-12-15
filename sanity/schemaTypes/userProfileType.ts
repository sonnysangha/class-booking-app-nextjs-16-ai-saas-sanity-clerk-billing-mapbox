import { defineField, defineType } from "sanity";
import { UserIcon, PinIcon } from "@sanity/icons";

export const userProfileType = defineType({
  name: "userProfile",
  title: "User Profile",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "clerkId",
      title: "Clerk User ID",
      type: "string",
      description: "The unique Clerk authentication ID",
      validation: (Rule) => Rule.required().error("Clerk ID is required"),
      readOnly: true,
    }),
    defineField({
      name: "email",
      type: "string",
      validation: (Rule) => Rule.email().error("Must be a valid email"),
      readOnly: true,
    }),
    defineField({
      name: "firstName",
      type: "string",
    }),
    defineField({
      name: "lastName",
      type: "string",
    }),
    defineField({
      name: "imageUrl",
      title: "Profile Image URL",
      type: "url",
      description: "Profile image from Clerk",
    }),
    defineField({
      name: "subscriptionTier",
      title: "Subscription Tier",
      type: "string",
      description: "Current subscription tier (synced from Clerk Billing)",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Basic", value: "basic" },
          { title: "Performance", value: "performance" },
          { title: "Champion", value: "champion" },
        ],
        layout: "radio",
      },
      initialValue: "none",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "object",
      icon: PinIcon,
      description: "User's preferred location for finding classes",
      fields: [
        defineField({
          name: "lat",
          title: "Latitude",
          type: "number",
        }),
        defineField({
          name: "lng",
          title: "Longitude",
          type: "number",
        }),
        defineField({
          name: "address",
          title: "Address",
          type: "string",
          description: "Display address",
        }),
      ],
    }),
    defineField({
      name: "searchRadius",
      title: "Search Radius (km)",
      type: "number",
      description: "Maximum distance to search for classes",
      options: {
        list: [
          { title: "5 km", value: 5 },
          { title: "10 km", value: 10 },
          { title: "25 km", value: 25 },
          { title: "50 km", value: 50 },
        ],
      },
      initialValue: 10,
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      firstName: "firstName",
      lastName: "lastName",
      email: "email",
      tier: "subscriptionTier",
    },
    prepare({ firstName, lastName, email, tier }) {
      const name = [firstName, lastName].filter(Boolean).join(" ") || email;
      return {
        title: name,
        subtitle: tier ? `${tier} tier` : "No subscription",
      };
    },
  },
});
