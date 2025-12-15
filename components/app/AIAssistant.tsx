"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import type { InferAgentUIMessage } from "ai";
import type { fitnessAgent } from "@/lib/ai/agent";

type FitnessAgentUIMessage = InferAgentUIMessage<typeof fitnessAgent>;

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat<FitnessAgentUIMessage>({
      api: "/api/chat",
    });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-card border rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-muted/50">
            <h3 className="font-semibold">Fitness Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Ask me about classes, venues, or get recommendations
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <p className="mb-4">
                  👋 Hi! I can help you find the perfect fitness class.
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-xs font-medium">Try asking:</p>
                  <button
                    onClick={() => {
                      const event = {
                        target: { value: "What yoga classes do you have?" },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleInputChange(event);
                    }}
                    className="block w-full text-left px-3 py-2 text-xs rounded-md bg-muted hover:bg-muted/80"
                  >
                    "What yoga classes do you have?"
                  </button>
                  <button
                    onClick={() => {
                      const event = {
                        target: { value: "Recommend classes for weight loss" },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleInputChange(event);
                    }}
                    className="block w-full text-left px-3 py-2 text-xs rounded-md bg-muted hover:bg-muted/80"
                  >
                    "Recommend classes for weight loss"
                  </button>
                  <button
                    onClick={() => {
                      const event = {
                        target: { value: "What are the subscription plans?" },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleInputChange(event);
                    }}
                    className="block w-full text-left px-3 py-2 text-xs rounded-md bg-muted hover:bg-muted/80"
                  >
                    "What are the subscription plans?"
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center text-red-500 text-sm py-2">
                Something went wrong. Please try again.
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about classes..."
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
