// Subscription tier type
export type Tier = "basic" | "performance" | "champion";

// Tier hierarchy: champion > performance > basic
export const TIER_HIERARCHY: Record<Tier, number> = {
  basic: 1,
  performance: 2,
  champion: 3,
};

// Monthly class limits per tier
export const TIER_LIMITS: Record<Tier, number> = {
  basic: 5,
  performance: 12,
  champion: Infinity, // Unlimited
};

// Pricing configuration
export const TIER_PRICING = {
  basic: { monthly: 29, annual: 290, perClass: 5.8 },
  performance: { monthly: 59, annual: 590, perClass: 4.92 },
  champion: { monthly: 99, annual: 990, perClass: null }, // Unlimited
} as const;

// Free trial duration
export const FREE_TRIAL_DAYS = 3;

// Annual discount percentage
export const ANNUAL_DISCOUNT_PERCENT = 17;

// Tier display names
export const TIER_DISPLAY_NAMES: Record<Tier, string> = {
  basic: "Basic",
  performance: "Performance",
  champion: "Champion",
};

// Tier options for filter UIs
export const TIER_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "performance", label: "Performance" },
  { value: "champion", label: "Champion" },
] as const;

// Tier descriptions
export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  basic: "5 classes per month",
  performance: "12 classes per month",
  champion: "Unlimited classes",
};

// Tier class access descriptions
export const TIER_ACCESS: Record<Tier, string> = {
  basic: "Basic-tier classes only",
  performance: "Basic + Performance classes",
  champion: "All classes",
};

// Tier badge colors (Tailwind classes for light/dark mode)
export const TIER_COLORS: Record<Tier | "none", string> = {
  none: "bg-muted text-muted-foreground",
  basic:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  performance:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  champion:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
};

// Tier features for pricing displays
export const TIER_FEATURES: Record<Tier, string[]> = {
  basic: [
    "5 classes per month",
    "Access to Basic-tier classes",
    "Book up to 3 days ahead",
    "Cancel up to 12 hours before",
  ],
  performance: [
    "12 classes per month",
    "Access to Basic + Performance classes",
    "Book up to 7 days ahead",
    "Cancel up to 6 hours before",
    "Priority booking",
  ],
  champion: [
    "Unlimited classes",
    "Access to ALL classes",
    "Book up to 14 days ahead",
    "Cancel up to 2 hours before",
    "VIP studio access",
    "Guest passes included",
  ],
};
