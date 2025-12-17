// AI SDK 6 tool call states
type ToolCallState = "partial-call" | "call" | "output-available" | "result";

// Tool result items - matches ResultCard data types
interface SearchClassItem {
  _id: string;
  name: string;
  instructor: string;
  duration: number;
  tierLevel: "basic" | "performance" | "champion";
  category?: { name: string };
}

interface ClassSessionItem {
  id: string;
  startTime: string;
  spotsAvailable: number;
  activity: {
    name: string;
    instructor: string;
    duration: number;
    tierLevel: string;
  };
  venue: {
    name: string;
    city: string;
  };
}

interface UserBookingItem {
  id: string;
  status: string;
  bookedAt?: string;
  attendedAt?: string;
  class?: string;
  instructor?: string;
  duration?: number;
  dateTime?: string;
  venue?: string;
  city?: string;
}

// Common item type with at least an ID
export type ToolResultItem =
  | SearchClassItem
  | ClassSessionItem
  | UserBookingItem;

// Tool output structure - the result from tool execution
export interface ToolOutput {
  classes?: SearchClassItem[];
  sessions?: ClassSessionItem[];
  venues?: Array<{ _id: string; name: string; [key: string]: unknown }>;
  bookings?: UserBookingItem[];
  recommendations?: SearchClassItem[];
  [key: string]: unknown;
}

// Tool call part type for AI SDK 6
export interface ToolCallPart {
  type: string;
  toolName?: string;
  toolCallId?: string;
  state?: ToolCallState;
  // Input arguments
  input?: Record<string, unknown>;
  args?: Record<string, unknown>;
  // Output data (AI SDK 6 uses "output", some versions use "result")
  output?: ToolOutput;
  result?: ToolOutput;
}
