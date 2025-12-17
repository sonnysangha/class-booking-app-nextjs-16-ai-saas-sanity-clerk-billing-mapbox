// Note: AI SDK 6 beta has evolving types - disabling TS checking for tool definitions
import { tool } from "ai";
import { z } from "zod";
import { client } from "@/sanity/lib/client";
import {
  AI_CATEGORIES_QUERY,
  AI_SEARCH_VENUES_QUERY,
  AI_USER_UPCOMING_BOOKINGS_QUERY,
  AI_USER_ALL_BOOKINGS_QUERY,
  AI_USER_PAST_BOOKINGS_QUERY,
} from "@/sanity/lib/queries/ai";
import { defineQuery } from "next-sanity";

// Search for classes by name, category, or instructor
// IMPORTANT: Only returns classes that have at least one future session scheduled
export const searchClasses = tool({
  description:
    "Search for fitness classes by name, category, instructor, or tier level. Only returns classes with upcoming sessions available. Use this to help users find classes they're interested in.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Text to search for in class names or descriptions"),
    category: z
      .string()
      .optional()
      .describe("Category name like 'Yoga', 'HIIT', 'Pilates', etc."),
    instructor: z.string().optional().describe("Instructor name to search for"),
    tierLevel: z
      .enum(["basic", "performance", "champion"])
      .optional()
      .describe("Tier level filter"),
  }),
  execute: async ({ query, category, instructor, tierLevel }) => {
    // Base filter: must be an activity AND have at least one future scheduled session
    let filter = `_type == "activity" && count(*[_type == "classSession" && activity._ref == ^._id && startTime > now() && status == "scheduled"]) > 0`;

    if (query) {
      filter += ` && (name match "*${query}*" || instructor match "*${query}*")`;
    }
    if (instructor) {
      filter += ` && instructor match "*${instructor}*"`;
    }
    if (tierLevel) {
      filter += ` && tierLevel == "${tierLevel}"`;
    }

    const groqQuery = defineQuery(`*[${filter}] | order(name asc) [0...10] {
      _id,
      name,
      instructor,
      duration,
      tierLevel,
      category->{name}
    }`);

    const activities = await client.fetch(groqQuery);

    // Filter by category if provided (need to do post-fetch due to reference)
    let filtered = activities;
    if (category) {
      filtered = activities.filter((a: { category?: { name: string } }) =>
        a.category?.name?.toLowerCase().includes(category.toLowerCase())
      );
    }

    return {
      count: filtered.length,
      classes: filtered,
    };
  },
});

// Get upcoming sessions for a specific class
export const getClassSessions = tool({
  description:
    "Get upcoming scheduled sessions for a specific class or activity. Shows dates, times, venues, and availability.",
  inputSchema: z.object({
    className: z
      .string()
      .describe("The name of the class to find sessions for"),
  }),
  execute: async ({ className }) => {
    const sessionsQuery = defineQuery(`*[
      _type == "classSession" 
      && activity->name match $classNamePattern 
      && startTime > now() 
      && status == "scheduled"
    ] | order(startTime asc) [0...10] {
      _id,
      startTime,
      maxCapacity,
      "currentBookings": count(*[_type == "booking" && classSession._ref == ^._id && status == "confirmed"]),
      activity->{name, instructor, duration, tierLevel},
      venue->{name, "city": address.city}
    }`);

    const sessions = await client.fetch(sessionsQuery, {
      classNamePattern: `*${className}*`,
    });

    return {
      count: sessions.length,
      sessions: sessions.map(
        (s: {
          _id: string;
          startTime: string;
          maxCapacity: number;
          currentBookings: number;
          activity: {
            name: string;
            instructor: string;
            duration: number;
            tierLevel: string;
          };
          venue: { name: string; city: string };
        }) => ({
          id: s._id,
          startTime: s.startTime,
          spotsAvailable: s.maxCapacity - s.currentBookings,
          activity: s.activity,
          venue: s.venue,
        })
      ),
    };
  },
});

// Get venues near a location or by name
export const searchVenues = tool({
  description:
    "Search for fitness venues/studios by name or city. Returns venue details including address and amenities.",
  inputSchema: z.object({
    name: z.string().optional().describe("Venue name to search for"),
    city: z.string().optional().describe("City to search in"),
  }),
  execute: async ({ name, city }) => {
    // If no filters, use the centralized query
    if (!name && !city) {
      const venues = await client.fetch(AI_SEARCH_VENUES_QUERY);
      return {
        count: venues.length,
        venues,
      };
    }

    // Build dynamic filter
    let filter = `_type == "venue"`;
    if (name) {
      filter += ` && name match "*${name}*"`;
    }
    if (city) {
      filter += ` && address.city match "*${city}*"`;
    }

    const venuesQuery = defineQuery(`*[${filter}] | order(name asc) [0...10] {
      _id,
      name,
      description,
      address,
      amenities
    }`);

    const venues = await client.fetch(venuesQuery);

    return {
      count: venues.length,
      venues,
    };
  },
});

// Get all categories
export const getCategories = tool({
  description:
    "Get all available fitness class categories. Useful when users want to know what types of classes are offered.",
  inputSchema: z.object({}),
  execute: async () => {
    const categories = await client.fetch(AI_CATEGORIES_QUERY);

    return {
      count: categories.length,
      categories,
    };
  },
});

// Get subscription tier information
export const getSubscriptionInfo = tool({
  description:
    "Get information about subscription tiers, pricing, and what classes each tier can access.",
  inputSchema: z.object({}),
  execute: async () => {
    return {
      tiers: [
        {
          name: "Basic",
          monthlyPrice: 29,
          annualPrice: 290,
          classesPerMonth: 5,
          classAccess: "Basic-tier classes only",
          perClassCost: "$5.80",
        },
        {
          name: "Performance",
          monthlyPrice: 59,
          annualPrice: 590,
          classesPerMonth: 12,
          classAccess: "Basic + Performance classes",
          perClassCost: "$4.92",
        },
        {
          name: "Champion",
          monthlyPrice: 99,
          annualPrice: 990,
          classesPerMonth: "Unlimited",
          classAccess: "All classes",
          perClassCost: "Best value for 8+ classes/month",
        },
      ],
      freeTrialDays: 3,
      annualDiscount: "17%",
    };
  },
});

// Get class recommendations based on preferences
// IMPORTANT: Only returns classes that have at least one future session scheduled
export const getRecommendations = tool({
  description:
    "Get personalized class recommendations based on user preferences like fitness goals, preferred time of day, or difficulty level. Only returns classes with upcoming sessions available.",
  inputSchema: z.object({
    fitnessGoal: z
      .enum(["strength", "flexibility", "cardio", "relaxation", "weight-loss"])
      .optional()
      .describe("User's fitness goal"),
    preferredDuration: z
      .number()
      .optional()
      .describe("Preferred class duration in minutes"),
    tierLevel: z
      .enum(["basic", "performance", "champion"])
      .optional()
      .describe("User's subscription tier"),
  }),
  execute: async ({ fitnessGoal, preferredDuration, tierLevel }) => {
    // Map fitness goals to likely categories
    const goalCategories: Record<string, string[]> = {
      strength: ["HIIT", "Strength", "CrossFit"],
      flexibility: ["Yoga", "Pilates", "Stretching"],
      cardio: ["Cycling", "Running", "Dance", "HIIT"],
      relaxation: ["Yoga", "Meditation", "Pilates"],
      "weight-loss": ["HIIT", "Cycling", "Boot Camp"],
    };

    // Base filter: must be an activity AND have at least one future scheduled session
    let filter = `_type == "activity" && count(*[_type == "classSession" && activity._ref == ^._id && startTime > now() && status == "scheduled"]) > 0`;

    if (tierLevel) {
      // Filter based on tier access
      const tierLevels =
        tierLevel === "champion"
          ? ["basic", "performance", "champion"]
          : tierLevel === "performance"
          ? ["basic", "performance"]
          : ["basic"];
      filter += ` && tierLevel in ${JSON.stringify(tierLevels)}`;
    }

    if (preferredDuration) {
      filter += ` && duration <= ${preferredDuration + 15} && duration >= ${
        preferredDuration - 15
      }`;
    }

    const recommendationsQuery =
      defineQuery(`*[${filter}] | order(name asc) [0...20] {
      _id,
      name,
      instructor,
      duration,
      tierLevel,
      category->{name}
    }`);

    const activities = await client.fetch(recommendationsQuery);

    // Filter by goal-related categories if provided
    let recommended = activities;
    if (fitnessGoal && goalCategories[fitnessGoal]) {
      const targetCategories = goalCategories[fitnessGoal];
      recommended = activities.filter(
        (a: { category?: { name: string } }) =>
          a.category &&
          targetCategories.some((c) =>
            a.category?.name.toLowerCase().includes(c.toLowerCase())
          )
      );
      // If no matches, return all activities
      if (recommended.length === 0) {
        recommended = activities;
      }
    }

    return {
      count: Math.min(recommended.length, 5),
      recommendations: recommended.slice(0, 5),
      basedOn: {
        fitnessGoal,
        preferredDuration,
        tierLevel,
      },
    };
  },
});

// Get user's bookings (upcoming, past, or all)
export const getUserBookings = tool({
  description:
    "Get the current user's bookings. Can filter by upcoming or past bookings. Use this when users ask about their scheduled classes, booking history, or want to know what classes they have coming up. The clerkId is provided in the system context.",
  inputSchema: z.object({
    type: z
      .enum(["upcoming", "past", "all"])
      .optional()
      .describe(
        "Filter bookings: 'upcoming' for future classes, 'past' for completed, 'all' for everything. Defaults to 'upcoming'."
      ),
    clerkId: z
      .string()
      .describe(
        "The user's Clerk ID from the system context. Extract this from the system message."
      ),
  }),
  execute: async ({ type = "upcoming", clerkId }) => {
    if (!clerkId) {
      return {
        error: "User not authenticated",
        count: 0,
        bookings: [],
      };
    }

    const query =
      type === "past"
        ? AI_USER_PAST_BOOKINGS_QUERY
        : type === "all"
        ? AI_USER_ALL_BOOKINGS_QUERY
        : AI_USER_UPCOMING_BOOKINGS_QUERY;

    const bookings = await client.fetch(query, { clerkId });

    return {
      count: bookings.length,
      type,
      bookings: bookings.map(
        (b: {
          _id: string;
          status: string;
          createdAt?: string;
          attendedAt?: string;
          classSession?: {
            _id: string;
            startTime: string;
            activity?: {
              name: string;
              instructor: string;
              duration: number;
            };
            venue?: {
              name: string;
              city: string;
            };
          };
        }) => ({
          id: b._id,
          sessionId: b.classSession?._id,
          status: b.status,
          bookedAt: b.createdAt,
          attendedAt: b.attendedAt,
          class: b.classSession?.activity?.name,
          instructor: b.classSession?.activity?.instructor,
          duration: b.classSession?.activity?.duration,
          dateTime: b.classSession?.startTime,
          venue: b.classSession?.venue?.name,
          city: b.classSession?.venue?.city,
        })
      ),
    };
  },
});

// Export all tools
export const aiTools = {
  searchClasses,
  getClassSessions,
  searchVenues,
  getCategories,
  getSubscriptionInfo,
  getRecommendations,
  getUserBookings,
};
