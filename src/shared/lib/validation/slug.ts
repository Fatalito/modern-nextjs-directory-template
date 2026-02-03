import { z } from "zod";

/**
 * Slug validation schema for URL-friendly identifiers.
 * Ensures lowercase alphanumeric characters and hyphens only.
 */
export const slugSchema = z
  .string()
  .min(2)
  .regex(/^[a-z0-9-]+$/, "Slug must be URL-friendly");
