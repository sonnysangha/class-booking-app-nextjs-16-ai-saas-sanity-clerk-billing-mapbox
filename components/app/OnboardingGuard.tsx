"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Skip if not signed in
    if (!user) return;

    // Skip if already on onboarding page
    if (pathname?.startsWith("/onboarding")) return;

    // Skip if on studio pages
    if (pathname?.startsWith("/studio")) return;

    // Check if user has completed onboarding
    const hasOnboarded = user.publicMetadata?.hasOnboarded as
      | boolean
      | undefined;

    if (!hasOnboarded) {
      router.push("/onboarding");
    }
  }, [isLoaded, user, pathname, router]);

  return <>{children}</>;
}
