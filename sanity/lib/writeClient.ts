import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Write client with token for mutations
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Ensure write client has token
if (!writeClient.config().token) {
  console.warn(
    "Sanity write client requires SANITY_API_TOKEN environment variable"
  );
}
