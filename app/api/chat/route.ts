import { createAgentUIStreamResponse } from "ai";
import { fitnessAgent } from "@/lib/ai/agent";
import { auth } from "@clerk/nextjs/server";
import { getUserTier } from "@/lib/subscription";
import { getUserPreferences } from "@/lib/actions/profile";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();

  // Reject unauthenticated requests
  if (!clerkId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch user context in parallel
  const [tier, preferences] = await Promise.all([
    getUserTier(),
    getUserPreferences(),
  ]);

  const { messages } = await request.json();

  // Build rich user context for the AI
  const locationContext = preferences?.location
    ? `- Location: ${preferences.location.address}
- Search radius: ${preferences.searchRadius} km
- Coordinates: ${preferences.location.lat}, ${preferences.location.lng}`
    : "- Location: Not set";

  const tierContext = tier
    ? `- Subscription: ${tier} tier`
    : "- Subscription: No active subscription";

  // Get current date/time for accurate "today" / "tomorrow" handling
  const now = new Date();
  const dateTimeContext = `- Current date: ${now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
- Current time: ${now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  })}
- Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

  // Inject user context as a system message
  const enhancedMessages = [
    {
      id: "system-context",
      role: "system" as const,
      parts: [
        {
          type: "text" as const,
          text: `Current date and time:
${dateTimeContext}

Current user context:
- Clerk ID: ${clerkId}
${tierContext}
${locationContext}

Guidelines:
- Use the current date/time above to accurately determine "today", "tomorrow", etc. when discussing sessions.
- When searching for classes or venues, consider the user's location and radius.
- When the user asks about their bookings, use the getUserBookings tool with their clerkId (${clerkId}).
- Personalize recommendations based on their subscription tier (${
            tier || "none"
          }).
- If user has no subscription, encourage them to check out the subscription plans.
- Keep responses concise and helpful.`,
        },
      ],
    },
    ...messages,
  ];

  return createAgentUIStreamResponse({
    agent: fitnessAgent,
    messages: enhancedMessages,
  });
}
