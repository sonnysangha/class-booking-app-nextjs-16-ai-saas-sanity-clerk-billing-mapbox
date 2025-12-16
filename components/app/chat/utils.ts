import type { UIMessage } from "ai";
import type { ToolCallPart } from "./types";

// Extract text content from message parts
export function getMessageText(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) {
    return "";
  }
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("\n");
}

// Check if message has tool calls (parts starting with "tool-")
export function getToolParts(message: UIMessage): ToolCallPart[] {
  if (!message.parts || message.parts.length === 0) {
    return [];
  }
  return message.parts
    .filter((part) => part.type.startsWith("tool-"))
    .map((part) => part as unknown as ToolCallPart);
}

// Get human-readable tool name
export function getToolDisplayName(toolName: string): string {
  const toolNames: Record<string, string> = {
    searchClasses: "Searching classes",
    getClassSessions: "Finding sessions",
    searchVenues: "Searching venues",
    getCategories: "Loading categories",
    getSubscriptionInfo: "Getting pricing",
    getRecommendations: "Finding recommendations",
    getUserBookings: "Loading your bookings",
  };
  return toolNames[toolName] || toolName;
}
