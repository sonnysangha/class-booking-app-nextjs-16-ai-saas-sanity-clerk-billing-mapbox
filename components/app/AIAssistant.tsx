"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat({
      api: "/api/chat",
    });

  const isLoading = status === "streaming" || status === "submitted";

  const suggestionQueries = [
    "What yoga classes do you have?",
    "Recommend classes for weight loss",
    "What are the subscription plans?",
  ];

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
        <Card className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] shadow-2xl border-primary/20 flex flex-col overflow-hidden">
          {/* Header */}
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              Fitness Assistant
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Ask me about classes, venues, or get recommendations
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
                  👋 Hi! I can help you find the perfect fitness class.
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Try asking:
                  </p>
                  {suggestionQueries.map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => {
                        const event = {
                          target: { value: query },
                        } as React.ChangeEvent<HTMLInputElement>;
                        handleInputChange(event);
                      }}
                      className="block w-full text-left px-3 py-2.5 text-xs rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      "{query}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

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
          </CardContent>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about classes..."
                className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
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
