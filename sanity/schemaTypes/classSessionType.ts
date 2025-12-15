import { defineField, defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons";

export const classSessionType = defineType({
  name: "classSession",
  title: "Class Session",
  type: "document",
  icon: CalendarIcon,
  description:
    "A scheduled instance of an activity - when and where a class runs",
  fields: [
    defineField({
      name: "activity",
      type: "reference",
      to: [{ type: "activity" }],
      description: "Which class template",
      validation: (Rule) => Rule.required().error("Activity is required"),
    }),
    defineField({
      name: "venue",
      type: "reference",
      to: [{ type: "venue" }],
      description: "Where the class is held",
      validation: (Rule) => Rule.required().error("Venue is required"),
    }),
    defineField({
      name: "startTime",
      type: "datetime",
      description: "When the class starts",
      validation: (Rule) => Rule.required().error("Start time is required"),
    }),
    defineField({
      name: "maxCapacity",
      type: "number",
      description: "Maximum number of attendees",
      validation: (Rule) => [
        Rule.required().error("Capacity is required"),
        Rule.min(1).error("Capacity must be at least 1"),
        Rule.max(100).warning("Capacity seems unusually high"),
      ],
      initialValue: 20,
    }),
    defineField({
      name: "status",
      type: "string",
      description: "Current status of the session",
      options: {
        list: [
          { title: "Scheduled", value: "scheduled" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Completed", value: "completed" },
        ],
        layout: "radio",
      },
      initialValue: "scheduled",
    }),
  ],
  orderings: [
    {
      title: "Start Time, Upcoming First",
      name: "startTimeAsc",
      by: [{ field: "startTime", direction: "asc" }],
    },
    {
      title: "Start Time, Recent First",
      name: "startTimeDesc",
      by: [{ field: "startTime", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      activityName: "activity.name",
      venueName: "venue.name",
      startTime: "startTime",
      status: "status",
      activityImage: "activity.images.0",
    },
    prepare({ activityName, venueName, startTime, status, activityImage }) {
      const date = startTime
        ? new Date(startTime).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "No date";

      const statusBadge = status === "cancelled" ? " [CANCELLED]" : "";

      return {
        title: `${activityName || "No activity"}${statusBadge}`,
        subtitle: `${venueName || "No venue"} • ${date}`,
        media: activityImage,
      };
    },
  },
});
