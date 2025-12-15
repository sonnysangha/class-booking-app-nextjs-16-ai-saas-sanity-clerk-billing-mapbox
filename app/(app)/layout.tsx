import { ClerkProvider } from "@clerk/nextjs";
import { AIAssistant } from "@/components/app/AIAssistant";
import { OnboardingGuard } from "@/components/app/OnboardingGuard";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <OnboardingGuard>{children}</OnboardingGuard>
      <AIAssistant />
    </ClerkProvider>
  );
}
