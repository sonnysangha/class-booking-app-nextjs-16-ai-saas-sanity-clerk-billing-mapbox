"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { createStore, useStore } from "zustand";

interface ChatState {
  isOpen: boolean;
  pendingMessage: string | null;
}

interface ChatActions {
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setPendingMessage: (message: string) => void;
  clearPendingMessage: () => void;
}

type ChatStore = ChatState & { actions: ChatActions };

const createChatStore = () =>
  createStore<ChatStore>((set) => ({
    isOpen: false,
    pendingMessage: null,
    actions: {
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      setPendingMessage: (message: string) =>
        set({ pendingMessage: message, isOpen: true }),
      clearPendingMessage: () => set({ pendingMessage: null }),
    },
  }));

type ChatStoreApi = ReturnType<typeof createChatStore>;

const ChatStoreContext = createContext<ChatStoreApi | null>(null);

export function ChatStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ChatStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createChatStore();
  }

  return (
    <ChatStoreContext.Provider value={storeRef.current}>
      {children}
    </ChatStoreContext.Provider>
  );
}

function useChatStore<T>(selector: (state: ChatStore) => T): T {
  const store = useContext(ChatStoreContext);
  if (!store) {
    throw new Error("useChatStore must be used within a ChatStoreProvider");
  }
  return useStore(store, selector);
}

// Selectors
export const useIsChatOpen = () => useChatStore((state) => state.isOpen);
export const usePendingMessage = () =>
  useChatStore((state) => state.pendingMessage);
export const useChatActions = () => useChatStore((state) => state.actions);

