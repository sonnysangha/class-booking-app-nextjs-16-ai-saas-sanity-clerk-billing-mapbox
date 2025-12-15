import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => [
        Rule.required().error("Category name is required"),
        Rule.max(50).warning("Keep the name concise"),
      ],
    }),
    defineField({
      name: "slug",
      type: "slug",
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
      rows: 3,
      description: "A brief description of this class category",
    }),
    defineField({
      name: "icon",
      type: "string",
      description: "Icon identifier from @sanity/icons (e.g., 'heart', 'star')",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
    },
  },
});
