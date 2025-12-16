"use client";

import { Dumbbell, Calendar, MapPin, Lightbulb } from "lucide-react";

interface SuggestionProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

function Suggestion({ icon, text, onClick }: SuggestionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left text-sm transition-all hover:border-primary/50 hover:bg-primary/5"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <span className="text-muted-foreground">{text}</span>
    </button>
  );
}

interface WelcomeScreenProps {
  onSuggestionClick: (message: { text: string }) => void;
  isSignedIn: boolean;
}

export function WelcomeScreen({
  onSuggestionClick,
  isSignedIn,
}: WelcomeScreenProps) {
  const suggestions = [
    {
      icon: <Dumbbell className="h-4 w-4 text-primary" />,
      text: "What yoga classes do you have?",
    },
    {
      icon: <Calendar className="h-4 w-4 text-primary" />,
      text: "What are my upcoming bookings?",
      requiresAuth: true,
    },
    {
      icon: <Lightbulb className="h-4 w-4 text-primary" />,
      text: "Recommend classes for weight loss",
    },
    {
      icon: <MapPin className="h-4 w-4 text-primary" />,
      text: "Find studios near me",
    },
  ];

  const filteredSuggestions = suggestions.filter(
    (s) => !s.requiresAuth || isSignedIn,
  );

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Dumbbell className="h-8 w-8 text-primary" />
      </div>

      <h2 className="mb-2 text-xl font-semibold">Fitness Assistant</h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        I can help you find classes, check bookings, and get personalized
        recommendations.
      </p>

      <div className="w-full max-w-sm space-y-2">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Try asking:
        </p>
        {filteredSuggestions.map((suggestion) => (
          <Suggestion
            key={suggestion.text}
            icon={suggestion.icon}
            text={suggestion.text}
            onClick={() => onSuggestionClick({ text: suggestion.text })}
          />
        ))}
      </div>
    </div>
  );
}
