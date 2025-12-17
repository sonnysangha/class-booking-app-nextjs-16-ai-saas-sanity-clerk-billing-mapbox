/**
 * Generates the correct Sanity Studio URL for a document based on the structure.ts configuration.
 *
 * Structure paths:
 * - Classes (nested): activity, classSession, category → /studio/structure/classes;{type};{id}
 * - Venues (direct): venue → /studio/structure/venue;{id}
 * - Users & Bookings (nested): userProfile, booking → /studio/structure/users-bookings;{type};{id}
 */

type DocumentType =
  | "activity"
  | "classSession"
  | "category"
  | "venue"
  | "userProfile"
  | "booking";

const NESTED_STRUCTURE_PATHS: Record<string, string> = {
  // Classes section
  activity: "classes",
  classSession: "classes",
  category: "classes",
  // Users & Bookings section
  userProfile: "users-bookings",
  booking: "users-bookings",
};

/**
 * Get the Studio URL for editing a document
 * @param documentType - The Sanity document type
 * @param documentId - The document ID (will be stripped of drafts. prefix)
 * @returns The full Studio URL path
 */
export function getStudioUrl(
  documentType: DocumentType | string,
  documentId: string
): string {
  const baseId = documentId.replace("drafts.", "");
  const nestedPath = NESTED_STRUCTURE_PATHS[documentType];

  if (nestedPath) {
    // Nested structure: /studio/structure/{parent};{type};{id}
    return `/studio/structure/${nestedPath};${documentType};${baseId}`;
  }

  // Direct structure: /studio/structure/{type};{id}
  return `/studio/structure/${documentType};${baseId}`;
}
