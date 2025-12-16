"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Search,
  Calendar,
  MapPin,
  Tag,
  CreditCard,
  Lightbulb,
  BookOpen,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClassCardWidget,
  SessionCardWidget,
  BookingCardWidget,
  VenueCardWidget,
} from "@/components/app/ai";
import type {
  SearchClassesResult,
  GetClassSessionsResult,
  SearchVenuesResult,
  GetUserBookingsResult,
  GetRecommendationsResult,
} from "@/lib/ai/types";

// Tool call part type for AI SDK 6
interface ToolCallPart {
  type: string;
  toolName?: string;
  toolCallId?: string;
  state?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  output?: unknown;
}

// Tool name to display info mapping
const toolDisplayInfo: Record<
  string,
  { label: string; activeLabel: string; icon: typeof Search }
> = {
  searchClasses: {
    label: "Searching classes",
    activeLabel: "Found classes",
    icon: Search,
  },
  getClassSessions: {
    label: "Finding sessions",
    activeLabel: "Found sessions",
    icon: Calendar,
  },
  searchVenues: {
    label: "Searching venues",
    activeLabel: "Found venues",
    icon: MapPin,
  },
  getCategories: {
    label: "Loading categories",
    activeLabel: "Loaded categories",
    icon: Tag,
  },
  getSubscriptionInfo: {
    label: "Getting pricing",
    activeLabel: "Subscription info",
    icon: CreditCard,
  },
  getRecommendations: {
    label: "Finding recommendations",
    activeLabel: "Found recommendations",
    icon: Lightbulb,
  },
  getUserBookings: {
    label: "Loading your bookings",
    activeLabel: "Your bookings",
    icon: BookOpen,
  },
};

// Tool invocation component with widgets
function ToolInvocationUI({
  toolPart,
  closeChat,
}: {
  toolPart: ToolCallPart;
  closeChat: () => void;
}) {
  const toolName = toolPart.toolName || toolPart.type.replace("tool-", "");
  const info = toolDisplayInfo[toolName] || {
    label: "Processing",
    activeLabel: "Done",
    icon: Loader2,
  };
  const ToolIcon = info.icon;

  // Check for completion
  const isComplete =
    toolPart.state === "result" ||
    toolPart.result !== undefined ||
    toolPart.output !== undefined;

  const result = toolPart.result || toolPart.output;

  // Get filter info for display
  const filterInfo =
    toolName === "searchClasses" && toolPart.args?.category
      ? `Category: ${toolPart.args.category}`
      : toolName === "getClassSessions" && toolPart.args?.className
        ? `Class: ${toolPart.args.className}`
        : toolName === "searchVenues" && toolPart.args?.city
          ? `City: ${toolPart.args.city}`
          : toolName === "getUserBookings" && toolPart.args?.type
            ? `Filter: ${toolPart.args.type}`
            : undefined;

  // Cast results to appropriate types
  const classesResult = result as SearchClassesResult | undefined;
  const sessionsResult = result as GetClassSessionsResult | undefined;
  const venuesResult = result as SearchVenuesResult | undefined;
  const bookingsResult = result as GetUserBookingsResult | undefined;
  const recommendationsResult = result as GetRecommendationsResult | undefined;

  // Check for items to display
  const hasClasses =
    toolName === "searchClasses" &&
    classesResult?.classes &&
    classesResult.classes.length > 0;
  const hasSessions =
    toolName === "getClassSessions" &&
    sessionsResult?.sessions &&
    sessionsResult.sessions.length > 0;
  const hasVenues =
    toolName === "searchVenues" &&
    venuesResult?.venues &&
    venuesResult.venues.length > 0;
  const hasBookings =
    toolName === "getUserBookings" &&
    bookingsResult?.bookings &&
    bookingsResult.bookings.length > 0;
  const hasRecommendations =
    toolName === "getRecommendations" &&
    recommendationsResult?.recommendations &&
    recommendationsResult.recommendations.length > 0;

  return (
    <div className="space-y-2 mb-3">
      {/* Tool status indicator */}
      <div className="flex gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isComplete
              ? "bg-emerald-100 dark:bg-emerald-900/30"
              : "bg-amber-100 dark:bg-amber-900/30"
          }`}
        >
          <ToolIcon
            className={`h-4 w-4 ${
              isComplete
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          />
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm ${
            isComplete
              ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
              : "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <Loader2 className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
          )}
          <div className="flex flex-col">
            <span
              className={`font-medium ${
                isComplete
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {isComplete ? info.activeLabel : `${info.label}...`}
            </span>
            {filterInfo && (
              <span className="text-xs text-muted-foreground">
                {filterInfo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Classes results */}
      {hasClasses && classesResult?.classes && (
        <div className="ml-11 mt-2">
          <p className="text-xs text-muted-foreground mb-2">
            {classesResult.classes.length} class
            {classesResult.classes.length !== 1 ? "es" : ""} found
          </p>
          <div className="space-y-2">
            {classesResult.classes.slice(0, 3).map((classItem) => (
              <ClassCardWidget
                key={classItem._id}
                classItem={classItem}
                onClose={closeChat}
              />
            ))}
            {classesResult.classes.length > 3 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{classesResult.classes.length - 3} more classes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sessions results */}
      {hasSessions && sessionsResult?.sessions && (
        <div className="ml-11 mt-2">
          <p className="text-xs text-muted-foreground mb-2">
            {sessionsResult.sessions.length} session
            {sessionsResult.sessions.length !== 1 ? "s" : ""} available
          </p>
          <div className="space-y-2">
            {sessionsResult.sessions.slice(0, 3).map((session) => (
              <SessionCardWidget
                key={session.id}
                session={session}
                onClose={closeChat}
              />
            ))}
            {sessionsResult.sessions.length > 3 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{sessionsResult.sessions.length - 3} more sessions
              </p>
            )}
          </div>
        </div>
      )}

      {/* Venues results */}
      {hasVenues && venuesResult?.venues && (
        <div className="ml-11 mt-2">
          <p className="text-xs text-muted-foreground mb-2">
            {venuesResult.venues.length} venue
            {venuesResult.venues.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-2">
            {venuesResult.venues.slice(0, 3).map((venue) => (
              <VenueCardWidget
                key={venue._id}
                venue={venue}
                onClose={closeChat}
              />
            ))}
            {venuesResult.venues.length > 3 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{venuesResult.venues.length - 3} more venues
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bookings results */}
      {hasBookings && bookingsResult?.bookings && (
        <div className="ml-11 mt-2">
          <p className="text-xs text-muted-foreground mb-2">
            {bookingsResult.bookings.length} booking
            {bookingsResult.bookings.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {bookingsResult.bookings.slice(0, 3).map((booking) => (
              <BookingCardWidget
                key={booking.id}
                booking={booking}
                onClose={closeChat}
              />
            ))}
            {bookingsResult.bookings.length > 3 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{bookingsResult.bookings.length - 3} more bookings
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recommendations results */}
      {hasRecommendations && recommendationsResult?.recommendations && (
        <div className="ml-11 mt-2">
          <p className="text-xs text-muted-foreground mb-2">
            {recommendationsResult.recommendations.length} recommendation
            {recommendationsResult.recommendations.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {recommendationsResult.recommendations.slice(0, 3).map((rec) => (
              <ClassCardWidget
                key={rec._id}
                classItem={rec}
                onClose={closeChat}
              />
            ))}
            {recommendationsResult.recommendations.length > 3 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{recommendationsResult.recommendations.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to get text content from message parts
function getMessageText(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) {
    return "";
  }
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("\n");
}

// Helper to get tool call parts from a message
function getToolParts(message: UIMessage): ToolCallPart[] {
  if (!message.parts || message.parts.length === 0) {
    return [];
  }
  return message.parts
    .filter((part) => part.type.startsWith("tool-"))
    .map((part) => part as unknown as ToolCallPart);
}

export function AIAssistant() {
  const { isSignedIn, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat();

  const isLoading = status === "streaming" || status === "submitted";

  const closeChat = () => setIsOpen(false);

  // Auto-scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const suggestionQueries = [
    "What yoga classes do you have?",
    "What are my upcoming bookings?",
    "Recommend classes for weight loss",
    "What are the subscription plans?",
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      // AI SDK 6 beta - sendMessage expects message object with parts
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: inputValue }],
      } as Parameters<typeof sendMessage>[0]);
      setInputValue("");
    }
  };

  // Don't render until Clerk is loaded
  if (!isLoaded) {
    return null;
  }

  // Only render for authenticated users
  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] shadow-2xl border-primary/20 flex flex-col overflow-hidden">
          {/* Header */}
          <CardHeader className="pb-3 bg-linear-to-r from-primary/10 to-primary/5 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              Fitness Assistant
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Ask me about classes, venues, bookings, or get recommendations
            </p>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  👋 Hi! I can help you find the perfect fitness class or check
                  your bookings.
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Try asking:
                  </p>
                  {suggestionQueries.map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => setInputValue(query)}
                      className="block w-full text-left px-3 py-2.5 text-xs rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      &ldquo;{query}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              const textContent = getMessageText(message);
              const toolParts = getToolParts(message);

              return (
                <div key={message.id}>
                  {/* User message */}
                  {message.role === "user" && textContent && (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-primary text-primary-foreground rounded-br-md">
                        <div className="whitespace-pre-wrap">{textContent}</div>
                      </div>
                    </div>
                  )}

                  {/* Tool invocations for assistant messages */}
                  {message.role === "assistant" &&
                    toolParts.map((toolPart, index) => (
                      <ToolInvocationUI
                        key={toolPart.toolCallId || index}
                        toolPart={toolPart}
                        closeChat={closeChat}
                      />
                    ))}

                  {/* Assistant text message */}
                  {message.role === "assistant" && textContent && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-muted rounded-bl-md">
                        <div className="whitespace-pre-wrap">{textContent}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center text-destructive text-sm py-2 px-4 bg-destructive/10 rounded-lg">
                Something went wrong. Please try again.
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <form onSubmit={handleFormSubmit} className="p-4 border-t bg-card">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about classes or bookings..."
                className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="h-10 w-10 rounded-xl shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}
