"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import {
  useIsChatOpen,
  useChatActions,
} from "@/lib/store/chat-store-provider";

export function ChatButton() {
  const { isSignedIn, isLoaded } = useUser();
  const isOpen = useIsChatOpen();
  const { toggleChat } = useChatActions();

  // Don't render until Clerk is loaded
  if (!isLoaded) {
    return null;
  }

  // Only render for authenticated users
  if (!isSignedIn) {
    return null;
  }

  // Hide button when chat is open
  if (isOpen) {
    return null;
  }

  return (
    <Button
      onClick={toggleChat}
      size="icon"
      className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105"
      aria-label="Open AI Assistant"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}

