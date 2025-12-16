import { ClerkProvider } from "@clerk/nextjs";
import { OnboardingGuard } from "@/components/app/OnboardingGuard";
import { AppHeader } from "@/components/app/AppHeader";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { AppShell } from "@/components/app/AppShell";
import { ChatSheet } from "@/components/app/ChatSheet";
import { ChatButton } from "@/components/app/ChatButton";

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
      </ChatStoreProvider>
    </ClerkProvider>
  );
}
