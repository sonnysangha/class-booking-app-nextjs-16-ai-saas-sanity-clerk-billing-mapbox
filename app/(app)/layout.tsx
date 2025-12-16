import { ClerkProvider } from "@clerk/nextjs";
import { AIAssistant } from "@/components/app/AIAssistant";
import { OnboardingGuard } from "@/components/app/OnboardingGuard";
import { AppHeader } from "@/components/app/AppHeader";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <OnboardingGuard>
        <AppHeader />
        {children}
      </OnboardingGuard>
      <AIAssistant />
    </ClerkProvider>
  );
}
