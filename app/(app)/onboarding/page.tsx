"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinIcon, TargetIcon, ArrowRightIcon, Loader2Icon } from "lucide-react";
import { AddressSearch } from "@/components/app/AddressSearch";
import { RadiusSelector } from "@/components/app/RadiusSelector";
import { completeOnboarding } from "@/lib/actions/profile";

type Step = "location" | "radius";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("location");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step === "location" && location) {
      setStep("radius");
    }
  };

  const handleBack = () => {
    if (step === "radius") {
      setStep("location");
    }
  };

  const handleComplete = async () => {
    if (!location || !radius) return;

    setIsSubmitting(true);
    setError(null);

    const result = await completeOnboarding({
      location,
      searchRadius: radius,
    });

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <span className="text-xl font-bold">ClassPass Clone</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Progress indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === "location"
                  ? "bg-violet-600 text-white"
                  : "bg-violet-100 text-violet-600 dark:bg-violet-900"
              }`}
            >
              1
            </div>
            <div className="h-0.5 w-8 bg-border" />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === "radius"
                  ? "bg-violet-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>

          {/* Step content */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            {step === "location" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900">
                    <MapPinIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h1 className="text-2xl font-bold">Where are you located?</h1>
                  <p className="mt-2 text-muted-foreground">
                    We'll show you classes near your location
                  </p>
                </div>

                <AddressSearch
                  value={location}
                  onChange={setLocation}
                  placeholder="Search for your city or address..."
                />

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!location}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === "radius" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900">
                    <TargetIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h1 className="text-2xl font-bold">How far will you travel?</h1>
                  <p className="mt-2 text-muted-foreground">
                    Set your maximum distance for classes
                  </p>
                </div>

                <RadiusSelector value={radius} onChange={setRadius} />

                {error && (
                  <p className="text-center text-sm text-red-600">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 rounded-lg border py-3 font-medium transition-colors hover:bg-accent"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={!radius || isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Skip option for testing */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            You can update these preferences anytime in your profile
          </p>
        </div>
      </main>
    </div>
  );
}

