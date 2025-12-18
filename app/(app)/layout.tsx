import { ClerkProvider } from "@clerk/nextjs";
import { OnboardingGuard } from "@/components/app/onboarding/OnboardingGuard";
import { AppHeader } from "@/components/app/layout/AppHeader";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { AppShell } from "@/components/app/layout/AppShell";
import { ChatSheet } from "@/components/app/chat/ChatSheet";
import { ChatButton } from "@/components/app/chat/ChatButton";
import { SanityLive } from "@/sanity/lib/live";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ChatStoreProvider>
        <AppShell>
          <OnboardingGuard>
            <AppHeader />
            {children}
          </OnboardingGuard>
        </AppShell>
        <ChatButton />
        <ChatSheet />
        <SanityLive />
      </ChatStoreProvider>
    </ClerkProvider>
  );
}
