"use client";

import { useClient } from "@sanity/sdk-react";

const API_VERSION = "2024-11-12";

/**
 * Pre-configured Sanity client hook for admin operations
 * Centralizes the API version configuration
 */
export function useSanityClient() {
  return useClient({ apiVersion: API_VERSION });
}
