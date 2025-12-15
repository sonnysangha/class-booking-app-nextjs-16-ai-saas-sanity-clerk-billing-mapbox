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

