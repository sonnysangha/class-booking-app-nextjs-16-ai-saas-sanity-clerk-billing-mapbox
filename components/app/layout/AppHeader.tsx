"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Dumbbell, MenuIcon } from "lucide-react";

const navItems = [
  { href: "/classes", label: "Classes" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/profile", label: "Profile" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);

  // Don't show header on onboarding page
  if (pathname === "/onboarding") {
    return null;
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={isSignedIn ? "/classes" : "/"}
          className="flex items-center gap-2 text-xl font-bold"
        >
          <Dumbbell className="h-6 w-6 text-primary" />
          <span>FitPass</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {isSignedIn &&
            navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "font-semibold text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-4 md:hidden">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="rounded-md p-2 hover:bg-accent"
                aria-label="Open menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[380px]">
              <SheetHeader className="border-b">
                <SheetTitle className="text-left text-xl font-semibold">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-2">
                {isSignedIn &&
                  navItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-lg px-4 py-3 text-base font-medium transition-all duration-200",
                          isActive
                            ? "border border-primary/20 bg-primary/10 font-semibold text-primary"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                <SignedOut>
                  <div className="mt-6 border-t pt-6">
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        className="w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                      >
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

