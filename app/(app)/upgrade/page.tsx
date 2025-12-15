import { PricingTable } from "@clerk/nextjs";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { TIER_DISPLAY_NAMES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{
    required?: string;
    sessionId?: string;
  }>;
}

export default async function UpgradePage({ searchParams }: PageProps) {
  const { required, sessionId } = await searchParams;

  const requiredTierName = required
    ? TIER_DISPLAY_NAMES[required as keyof typeof TIER_DISPLAY_NAMES] || required
    : null;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-white">
            ClassPass Clone
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/classes"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Classes
            </Link>
            <Link
              href="/bookings"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              My Bookings
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            {requiredTierName
              ? `Upgrade to ${requiredTierName}`
              : "Choose Your Plan"}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            {requiredTierName
              ? `This class requires a ${requiredTierName} subscription or higher. Choose a plan below to start booking.`
              : "Unlock access to thousands of fitness classes with flexible monthly plans."}
          </p>
          {sessionId && (
            <p className="text-violet-400 text-sm mt-4">
              After subscribing, you&apos;ll be able to book your class
            </p>
          )}
        </div>

        {/* Pricing Table */}
        <div className="max-w-5xl mx-auto">
          <PricingTable
            appearance={{
              elements: {
                pricingTable: {
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                },
                pricingTableCard: {
                  borderRadius: "1rem",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  boxShadow: "0 10px 40px rgba(139, 92, 246, 0.1)",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  background: "rgba(24, 24, 27, 0.8)",
                  backdropFilter: "blur(10px)",
                },
                pricingTableCardHeader: {
                  background:
                    "linear-gradient(135deg, rgb(139 92 246), rgb(192 132 252))",
                  color: "white",
                  borderRadius: "1rem 1rem 0 0",
                  padding: "2rem",
                },
                pricingTableCardTitle: {
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "white",
                  marginBottom: "0.25rem",
                },
                pricingTableCardDescription: {
                  fontSize: "0.9rem",
                  color: "rgba(255, 255, 255, 0.85)",
                  fontWeight: "500",
                },
                pricingTableCardFee: {
                  color: "white",
                  fontWeight: "800",
                  fontSize: "2.5rem",
                },
                pricingTableCardFeePeriod: {
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "1rem",
                },
                pricingTableCardBody: {
                  padding: "1.5rem",
                  background: "rgba(24, 24, 27, 0.9)",
                },
                pricingTableCardFeatures: {
                  marginTop: "1rem",
                  gap: "0.75rem",
                },
                pricingTableCardFeature: {
                  fontSize: "0.9rem",
                  padding: "0.5rem 0",
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.8)",
                },
                pricingTableCardButton: {
                  marginTop: "1.5rem",
                  borderRadius: "0.75rem",
                  fontWeight: "700",
                  padding: "0.875rem 2rem",
                  transition: "all 0.2s ease",
                  fontSize: "1rem",
                  background:
                    "linear-gradient(135deg, rgb(139 92 246), rgb(192 132 252))",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                },
                pricingTableCardPeriodToggle: {
                  color: "white",
                },
              },
            }}
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-violet-500 mx-auto" />
                  <p className="text-zinc-400 text-lg font-medium">
                    Loading pricing options...
                  </p>
                </div>
              </div>
            }
          />
        </div>

        {/* Features Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            All Plans Include
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-white mb-2">3-Day Free Trial</h3>
              <p className="text-sm text-zinc-400">
                Try any plan risk-free for 3 days
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-semibold text-white mb-2">Cancel Anytime</h3>
              <p className="text-sm text-zinc-400">
                No contracts, cancel whenever you want
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="text-3xl mb-3">💪</div>
              <h3 className="font-semibold text-white mb-2">100+ Venues</h3>
              <p className="text-sm text-zinc-400">
                Access premium studios across Dubai
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link
            href={sessionId ? `/classes/${sessionId}` : "/classes"}
            className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
          >
            ← Back to {sessionId ? "class" : "classes"}
          </Link>
        </div>
      </main>
    </div>
  );
}

