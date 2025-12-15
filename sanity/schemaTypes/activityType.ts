import { defineField, defineType, defineArrayMember } from "sanity";
import { BoltIcon } from "@sanity/icons";

export const activityType = defineType({
  name: "activity",
  title: "Activity",
  type: "document",
  icon: BoltIcon,
  description:
    "Reusable class template - defines what a class is (not when it runs)",
  groups: [
    { name: "details", title: "Details", default: true },
    { name: "media", title: "Media" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "details",
      description: 'e.g., "Morning Yoga Flow", "HIIT Cardio Blast"',
      validation: (Rule) => [
        Rule.required().error("Activity name is required"),
        Rule.max(100).warning("Keep the name concise"),
      ],
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "details",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().error("Slug is required for URL generation"),
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      group: "details",
      validation: (Rule) => Rule.required().error("Category is required"),
    }),
    defineField({
      name: "instructor",
      type: "string",
      group: "details",
      validation: (Rule) =>
        Rule.required().error("Instructor name is required"),
    }),
    defineField({
      name: "description",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "block" })],
      description: "Detailed description of the class",
    }),
    defineField({
      name: "images",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
          options: {
            metadata: ["lqip", "palette"],
          },
        }),
      ],
      options: {
        layout: "grid",
      },
    }),
    defineField({
      name: "duration",
      type: "number",
      group: "settings",
      description: "Duration in minutes",
      validation: (Rule) => [
        Rule.required().error("Duration is required"),
        Rule.min(15).error("Duration must be at least 15 minutes"),
        Rule.max(180).warning("Duration seems unusually long"),
      ],
    }),
    defineField({
      name: "tierLevel",
      type: "string",
      group: "settings",
      description: "Subscription tier required to access this class",
      options: {
        list: [
          { title: "Basic", value: "basic" },
          { title: "Performance", value: "performance" },
          { title: "Champion", value: "champion" },
        ],
        layout: "radio",
      },
      initialValue: "basic",
      validation: (Rule) => Rule.required().error("Tier level is required"),
    }),
    defineField({
      name: "aiKeywords",
      type: "array",
      group: "settings",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
      description:
        "Keywords for AI search (e.g., relaxing, intense, beginner-friendly)",
    }),
  ],
  preview: {
    select: {
      title: "name",
      instructor: "instructor",
      category: "category.name",
      tierLevel: "tierLevel",
      media: "images.0",
    },
    prepare({ title, instructor, category, tierLevel, media }) {
      const tierBadge = tierLevel ? `[${tierLevel.toUpperCase()}]` : "";
      return {
        title: `${title} ${tierBadge}`,
        subtitle: `${instructor || "No instructor"} • ${
          category || "No category"
        }`,
        media,
      };
    },
  },
});
