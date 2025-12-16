"use client";

import {
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
import {
  ClassCardWidget,
  SessionCardWidget,
  BookingCardWidget,
} from "@/components/app/ai";
import type { ToolCallPart } from "./types";

// Tool display config
const toolConfig: Record<
  string,
  { label: string; doneLabel: string; icon: typeof Search }
> = {
  searchClasses: {
    label: "Searching classes",
    doneLabel: "Found classes",
    icon: Search,
  },
  getClassSessions: {
    label: "Finding sessions",
    doneLabel: "Found sessions",
    icon: Calendar,
  },
  searchVenues: {
    label: "Searching venues",
    doneLabel: "Found venues",
    icon: MapPin,
  },
  getCategories: {
    label: "Loading categories",
    doneLabel: "Categories loaded",
    icon: Tag,
  },
  getSubscriptionInfo: {
    label: "Getting pricing",
    doneLabel: "Pricing info",
    icon: CreditCard,
  },
  getRecommendations: {
    label: "Finding recommendations",
    doneLabel: "Recommendations",
    icon: Lightbulb,
  },
  getUserBookings: {
    label: "Loading bookings",
    doneLabel: "Your bookings",
    icon: BookOpen,
  },
};

interface ToolCallUIProps {
  toolPart: ToolCallPart;
  closeChat: () => void;
}

export function ToolCallUI({ toolPart, closeChat }: ToolCallUIProps) {
  const toolName = toolPart.toolName || toolPart.type.replace("tool-", "");
  const config = toolConfig[toolName] || {
    label: "Processing",
    doneLabel: "Done",
    icon: Loader2,
  };
  const Icon = config.icon;

  // Check if tool has completed - AI SDK 6 uses "output-available" state
  const isComplete =
    toolPart.state === "output-available" ||
    toolPart.state === "result" ||
    toolPart.output !== undefined ||
    toolPart.result !== undefined;
  const result = (toolPart.output || toolPart.result) as
    | Record<string, unknown>
    | undefined;

  // Get items array from result (handles classes, sessions, venues, bookings, recommendations)
  const items =
    result?.classes ||
    result?.sessions ||
    result?.venues ||
    result?.bookings ||
    result?.recommendations;
  const itemsArray = Array.isArray(items) ? items : [];

  // Debug - check why widgets don't show
  console.log(`[${toolName}]`, {
    isComplete,
    hasResult: !!result,
    itemCount: itemsArray.length,
  });

  return (
    <div className="space-y-2">
      {/* Status indicator */}
      <div className="flex gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isComplete
              ? "bg-emerald-100 dark:bg-emerald-900/30"
              : "bg-amber-100 dark:bg-amber-900/30"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${
              isComplete
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          />
        </div>
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${
            isComplete
              ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
              : "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Loader2 className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-spin" />
          )}
          <span
            className={`font-medium ${
              isComplete
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-amber-700 dark:text-amber-300"
            }`}
          >
            {isComplete ? config.doneLabel : `${config.label}...`}
          </span>
        </div>
      </div>

      {/* Results widgets */}
      {isComplete && itemsArray.length > 0 && (
        <div className="ml-11 space-y-2">
          <p className="text-xs text-muted-foreground">
            {itemsArray.length} result{itemsArray.length !== 1 ? "s" : ""}
          </p>
          {itemsArray.slice(0, 3).map((item: Record<string, unknown>) => {
            const key = (item._id || item.id) as string;

            if (
              toolName === "searchClasses" ||
              toolName === "getRecommendations"
            ) {
              return (
                <ClassCardWidget
                  key={key}
                  classItem={item as never}
                  onClose={closeChat}
                />
              );
            }
            if (toolName === "getClassSessions") {
              return (
                <SessionCardWidget
                  key={key}
                  session={item as never}
                  onClose={closeChat}
                />
              );
            }
            if (toolName === "getUserBookings") {
              return (
                <BookingCardWidget
                  key={key}
                  booking={item as never}
                  onClose={closeChat}
                />
              );
            }
            return null;
          })}
          {itemsArray.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{itemsArray.length - 3} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
