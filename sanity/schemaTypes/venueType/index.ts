import { defineField, defineType, defineArrayMember } from "sanity";
import { HomeIcon } from "@sanity/icons";
import { MapboxAddressInput } from "./MapboxAddressInput";

export const venueType = defineType({
  name: "venue",
  title: "Venue",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "details", title: "Details", default: true },
    { name: "location", title: "Location" },
    { name: "hours", title: "Opening Hours" },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "details",
      validation: (Rule) => [
        Rule.required().error("Venue name is required"),
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
      name: "description",
      type: "text",
      group: "details",
      rows: 4,
      description: "A brief description of the venue",
    }),
    defineField({
      name: "images",
      type: "array",
      group: "details",
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
      name: "address",
      title: "Address",
      type: "object",
      group: "location",
      components: {
        input: MapboxAddressInput,
      },
      fields: [
        defineField({
          name: "fullAddress",
          type: "string",
          title: "Full Address",
          readOnly: true,
        }),
        defineField({
          name: "street",
          type: "string",
          title: "Street",
          readOnly: true,
        }),
        defineField({
          name: "city",
          type: "string",
          title: "City",
          readOnly: true,
        }),
        defineField({
          name: "postcode",
          type: "string",
          title: "Postcode",
          readOnly: true,
        }),
        defineField({
          name: "country",
          type: "string",
          title: "Country",
          readOnly: true,
        }),
        defineField({
          name: "lat",
          type: "number",
          title: "Latitude",
          readOnly: true,
        }),
        defineField({
          name: "lng",
          type: "number",
          title: "Longitude",
          readOnly: true,
        }),
      ],
    }),
    defineField({
      name: "amenities",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
      description:
        "Available amenities (e.g., showers, lockers, parking, wifi)",
    }),
    defineField({
      name: "openingHours",
      type: "array",
      group: "hours",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "day",
              type: "string",
              options: {
                list: [
                  { title: "Monday", value: "monday" },
                  { title: "Tuesday", value: "tuesday" },
                  { title: "Wednesday", value: "wednesday" },
                  { title: "Thursday", value: "thursday" },
                  { title: "Friday", value: "friday" },
                  { title: "Saturday", value: "saturday" },
                  { title: "Sunday", value: "sunday" },
                ],
              },
            }),
            defineField({
              name: "open",
              type: "string",
              title: "Opens",
              description: "e.g., 06:00",
            }),
            defineField({
              name: "close",
              type: "string",
              title: "Closes",
              description: "e.g., 22:00",
            }),
          ],
          preview: {
            select: {
              day: "day",
              open: "open",
              close: "close",
            },
            prepare({ day, open, close }) {
              return {
                title: day ? day.charAt(0).toUpperCase() + day.slice(1) : "Day",
                subtitle: `${open || "?"} - ${close || "?"}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "address.city",
      media: "images.0",
    },
  },
});
