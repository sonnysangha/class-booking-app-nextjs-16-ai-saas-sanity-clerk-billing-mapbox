import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">ClassPass Clone</h1>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Find Your Perfect Workout
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Access thousands of fitness classes from yoga to HIIT. Book your
            next class and start your fitness journey today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/classes"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Browse Classes
            </a>
            <a href="/map" className="text-sm font-semibold leading-6">
              Find Nearby <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Tiers Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-center text-2xl font-bold mb-8">
          Choose Your Plan
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Basic */}
          <div className="rounded-lg border p-6">
            <h4 className="text-lg font-semibold">Basic</h4>
            <p className="text-3xl font-bold mt-2">
              $29
              <span className="text-sm font-normal text-muted-foreground">
                /month
              </span>
            </p>
            <p className="text-muted-foreground mt-2">5 classes per month</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>✓ Access to Basic tier classes</li>
              <li>✓ 3-day free trial</li>
              <li>✓ ~$5.80 per class</li>
            </ul>
          </div>

          {/* Performance */}
          <div className="rounded-lg border-2 border-primary p-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Most Popular
            </span>
            <h4 className="text-lg font-semibold">Performance</h4>
            <p className="text-3xl font-bold mt-2">
              $59
              <span className="text-sm font-normal text-muted-foreground">
                /month
              </span>
            </p>
            <p className="text-muted-foreground mt-2">12 classes per month</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>✓ Access to Basic + Performance classes</li>
              <li>✓ 3-day free trial</li>
              <li>✓ ~$4.92 per class</li>
            </ul>
          </div>

          {/* Champion */}
          <div className="rounded-lg border p-6">
            <h4 className="text-lg font-semibold">Champion</h4>
            <p className="text-3xl font-bold mt-2">
              $99
              <span className="text-sm font-normal text-muted-foreground">
                /month
              </span>
            </p>
            <p className="text-muted-foreground mt-2">Unlimited classes</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>✓ Access to ALL classes</li>
              <li>✓ 3-day free trial</li>
              <li>✓ Best value for 8+ classes/month</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
